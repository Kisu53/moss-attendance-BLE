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

// Authorization 헤더에서 token 추출
function getBearerToken(authorization?: string) {
    if (!authorization?.startsWith("Bearer ")) {
        return null;
    }

    return authorization.slice("Bearer ".length);
}

export const requireAuth: RequestHandler = async (req, res, next) => {
    try {
        const token = getBearerToken(req.headers.authorization);
        // JWT_SECRET으로 토큰 검증
        if (!token) {
            return res.status(401).json({ error: "인증 토큰이 없습니다." });
        }

        // JWT 위조 혹은 만료시 여기서 error 발생
        const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;

        // token payload에서 user ID 확인
        if (!payload.userId || !payload.email || !payload.role) {
            return res.status(401).json({ error: "유효하지 않은 인증 토큰입니다." });
        }

        // DB users 테이블에서 실제 사용자 조회
        const user = await prisma.users.findUnique({
            where: { id: payload.userId },
        });

        // isActive(false) 사용자 차단
        if (!user || !user.is_active) {
            return res.status(401).json({ error: "유효하지 않은 사용자입니다." });
        }

        // req.user에 사용자 정보 저장
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };

        // 다음 API 실행
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

// 로그인한 사용자 중에서 admin만 허용
export const requireAdmin: RequestHandler = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "인증 정보가 없습니다." });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "관리자 권한이 없습니다." });
    }

    next();
};

/* 미들웨어를 사용할 때 순서 router.get("", requireAuth, requireAdminm handler) */
