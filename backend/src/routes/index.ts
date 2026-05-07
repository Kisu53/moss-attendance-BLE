import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import employeesRouter from "./employees";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/employees", employeesRouter);

export default router;
