import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.get("/db", async (_req, res, next) => {
  try {
    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() AS now`;

    res.json({
      status: "ok",
      database: "connected",
      now: result[0]?.now,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
