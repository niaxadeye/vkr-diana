import bcrypt from "bcrypt";

import { prisma } from "../../prisma/prisma.js";
import { sendMail } from "../mail/mail.service.js";
import {
  emailVerificationTemplate,
  passwordResetTemplate,
  emailChangeConfirmTemplate,
  passwordChangedTemplate,
  emailChangedNoticeTemplate,
} from "../mail/mail.templates.js";
import {
  generateRawToken,
  getTokenExpiresAt,
  hashToken,
} from "./auth-token.service.js";

const EMAIL_VERIFICATION_EXPIRES_MINUTES = 60 * 24;
const PASSWORD_RESET_EXPIRES_MINUTES = 60;
const EMAIL_CHANGE_EXPIRES_MINUTES = 60;

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return value;
}

function getUserDisplayName(user: {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return fullName || user.email;
}

export async function sendEmailVerification(user: {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}) {
  const clientUrl = getRequiredEnv("CLIENT_URL");

  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
  });

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: getTokenExpiresAt(EMAIL_VERIFICATION_EXPIRES_MINUTES),
    },
  });

  const verifyUrl = `${clientUrl}/verify-email?token=${rawToken}`;

  await sendMail({
    to: user.email,
    subject: "Подтвердите регистрацию в Acrylogo",
    html: emailVerificationTemplate({
      name: getUserDisplayName(user),
      verifyUrl,
    }),
  });
}

export async function verifyEmail(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!verificationToken) {
    throw new Error("EMAIL_VERIFICATION_TOKEN_INVALID");
  }

  if (verificationToken.usedAt) {
    throw new Error("EMAIL_VERIFICATION_TOKEN_ALREADY_USED");
  }

  if (verificationToken.expiresAt < new Date()) {
    throw new Error("EMAIL_VERIFICATION_TOKEN_EXPIRED");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: verificationToken.userId,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    }),

    prisma.emailVerificationToken.update({
      where: {
        id: verificationToken.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),
  ]);

  return {
    success: true,
  };
}

export async function requestPasswordReset(email: string) {
  const clientUrl = getRequiredEnv("CLIENT_URL");

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  /**
   * Важно:
   * если пользователя нет, не выбрасываем ошибку.
   * Иначе можно будет проверить, какие email зарегистрированы в системе.
   */
  if (!user) {
    return {
      success: true,
    };
  }

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
  });

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: getTokenExpiresAt(PASSWORD_RESET_EXPIRES_MINUTES),
    },
  });

  const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

  await sendMail({
    to: user.email,
    subject: "Восстановление пароля Acrylogo",
    html: passwordResetTemplate({
      name: getUserDisplayName(user),
      resetUrl,
    }),
  });

  return {
    success: true,
  };
}

export async function resetPassword(rawToken: string, newPassword: string) {
  const tokenHash = hashToken(rawToken);

  const passwordResetToken = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!passwordResetToken) {
    throw new Error("PASSWORD_RESET_TOKEN_INVALID");
  }

  if (passwordResetToken.usedAt) {
    throw new Error("PASSWORD_RESET_TOKEN_ALREADY_USED");
  }

  if (passwordResetToken.expiresAt < new Date()) {
    throw new Error("PASSWORD_RESET_TOKEN_EXPIRED");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: passwordResetToken.userId,
      },
      data: {
        passwordHash,
      },
    }),

    prisma.passwordResetToken.update({
      where: {
        id: passwordResetToken.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),

    prisma.refreshToken.updateMany({
      where: {
        userId: passwordResetToken.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    }),
  ]);

  return {
    success: true,
  };
}

export async function requestEmailChange(
  userId: string,
  newEmailRaw: string,
  password: string,
) {
  const clientUrl = getRequiredEnv("CLIENT_URL");
  const newEmail = newEmailRaw.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("INVALID_PASSWORD");
  }

  if (newEmail === user.email.toLowerCase()) {
    throw new Error("EMAIL_SAME_AS_CURRENT");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: newEmail },
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  await prisma.emailChangeToken.deleteMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
  });

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);

  await prisma.$transaction([
    prisma.emailChangeToken.create({
      data: {
        userId: user.id,
        newEmail,
        tokenHash,
        expiresAt: getTokenExpiresAt(EMAIL_CHANGE_EXPIRES_MINUTES),
      },
    }),

    prisma.user.update({
      where: { id: user.id },
      data: { pendingEmail: newEmail },
    }),
  ]);

  const confirmUrl = `${clientUrl}/confirm-email-change?token=${rawToken}`;

  await sendMail({
    to: newEmail,
    subject: "Подтвердите смену email в Acrylogo",
    html: emailChangeConfirmTemplate({
      name: getUserDisplayName(user),
      confirmUrl,
      newEmail,
    }),
  });

  return {
    success: true,
  };
}

export async function confirmEmailChange(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  const changeToken = await prisma.emailChangeToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!changeToken) {
    throw new Error("EMAIL_CHANGE_TOKEN_INVALID");
  }

  if (changeToken.usedAt) {
    throw new Error("EMAIL_CHANGE_TOKEN_ALREADY_USED");
  }

  if (changeToken.expiresAt < new Date()) {
    throw new Error("EMAIL_CHANGE_TOKEN_EXPIRED");
  }

  // На случай, если адрес заняли, пока письмо ждало подтверждения.
  const existingUser = await prisma.user.findUnique({
    where: { email: changeToken.newEmail },
  });

  if (existingUser && existingUser.id !== changeToken.userId) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const oldEmail = changeToken.user.email;

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: changeToken.userId,
      },
      data: {
        email: changeToken.newEmail,
        pendingEmail: null,
        emailVerifiedAt: new Date(),
      },
    }),

    prisma.emailChangeToken.update({
      where: {
        id: changeToken.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),
  ]);

  // Уведомление на старый адрес — на случай несанкционированной смены.
  try {
    await sendMail({
      to: oldEmail,
      subject: "Email вашего аккаунта Acrylogo изменён",
      html: emailChangedNoticeTemplate({
        name: getUserDisplayName(changeToken.user),
        newEmail: changeToken.newEmail,
      }),
    });
  } catch (error) {
    console.error("[EMAIL_CHANGED_NOTICE_ERROR]", error);
  }

  return {
    success: true,
    email: changeToken.newEmail,
  };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new Error("INVALID_PASSWORD");
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

  if (isSamePassword) {
    throw new Error("PASSWORD_SAME_AS_CURRENT");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),

    // Отзываем остальные сессии после смены пароля.
    prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    }),
  ]);

  try {
    await sendMail({
      to: user.email,
      subject: "Пароль аккаунта Acrylogo изменён",
      html: passwordChangedTemplate({
        name: getUserDisplayName(user),
      }),
    });
  } catch (error) {
    console.error("[PASSWORD_CHANGED_NOTICE_ERROR]", error);
  }

  return {
    success: true,
  };
}