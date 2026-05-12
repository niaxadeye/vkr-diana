import bcrypt from "bcrypt";

import { prisma } from "../../prisma/prisma.js";
import { sendMail } from "../mail/mail.service.js";
import {
  emailVerificationTemplate,
  passwordResetTemplate,
} from "../mail/mail.templates.js";
import {
  generateRawToken,
  getTokenExpiresAt,
  hashToken,
} from "./auth-token.service.js";

const EMAIL_VERIFICATION_EXPIRES_MINUTES = 60 * 24;
const PASSWORD_RESET_EXPIRES_MINUTES = 60;

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