import bcrypt from "bcrypt";
import crypto from "crypto";

import { prisma } from "../../prisma/prisma";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../../utils/tokens";
import { env } from "../../config/env";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getRefreshExpiresAt() {
  const date = new Date();
  date.setDate(date.getDate() + env.refreshExpiresInDays);
  return date;
}

export const authService = {
  async register(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    const accessToken = createAccessToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = createRefreshToken({
      userId: user.id,
      role: user.role,
    });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: getRefreshExpiresAt(),
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  },

  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const userWithPassword = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!userWithPassword) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userWithPassword.passwordHash,
    );

    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const user = {
      id: userWithPassword.id,
      email: userWithPassword.email,
      role: userWithPassword.role,
    };

    const accessToken = createAccessToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = createRefreshToken({
      userId: user.id,
      role: user.role,
    });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: getRefreshExpiresAt(),
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  },

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const savedToken = await prisma.refreshToken.findFirst({
      where: {
        userId: payload.userId,
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!savedToken) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    const accessToken = createAccessToken({
      userId: savedToken.user.id,
      role: savedToken.user.role,
    });

    return {
      accessToken,
      user: {
        id: savedToken.user.id,
        email: savedToken.user.email,
        role: savedToken.user.role,
      },
    };
  },

  async logout(refreshToken?: string) {
    if (!refreshToken) return;

    await prisma.refreshToken.updateMany({
      where: {
        tokenHash: hashToken(refreshToken),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  },

  async getMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  },
};