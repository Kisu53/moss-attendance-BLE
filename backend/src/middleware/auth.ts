import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";

interface AuthTokenPayload extends JwtPayload {
  userId: number;
  email: string;
  role: string;
}

function getBearerToken(authorization?: string) {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ error: "인증 토큰이 없습니다." });
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;

    if (!payload.userId || !payload.email || !payload.role) {
      return res.status(401).json({ error: "유효하지 않은 인증 토큰입니다." });
    }

    const user = await prisma.users.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: "유효하지 않은 사용자입니다." });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "인증 토큰이 만료되었습니다." });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "유효하지 않은 인증 토큰입니다." });
    }

    next(error);
  }
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "인증 정보가 없습니다." });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "관리자 권한이 없습니다." });
  }

  next();
};
