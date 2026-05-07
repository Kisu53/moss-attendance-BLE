import { Router } from "express";
import type { Request } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";

const router = Router();
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

interface AuthTokenPayload extends JwtPayload {
  userId: number;
  email: string;
  role: string;
}

function getBearerToken(req: Request) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

function createAuthToken(user: { id: number; email: string; role: string }) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

function serializeUser(user: { id: number; email: string; name: string | null; role: string }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

router.post("/google", async (req, res, next) => {
  try {
    const { credential } = req.body as { credential?: string };

    if (!credential) {
      return res.status(400).json({ error: "Google 인증 정보가 없습니다." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase();

    if (!email || !payload?.email_verified) {
      return res.status(401).json({ error: "Google 이메일 검증에 실패했습니다." });
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user || !user.is_active) {
      return res.status(403).json({ error: "등록된 사용자 계정이 아닙니다." });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "관리자 권한이 없습니다." });
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    return res.json({
      token: createAuthToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({ error: "인증 토큰이 없습니다." });
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;

    const user = await prisma.users.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: "유효하지 않은 사용자입니다." });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "관리자 권한이 없습니다." });
    }

    return res.json({
      user: serializeUser(user),
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "유효하지 않은 인증 토큰입니다." });
    }

    next(error);
  }
});

export default router;
