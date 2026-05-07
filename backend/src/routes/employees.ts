import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get("/", async (req, res, next) => {
    try {
        // 여기까지 왔다는 건 인증된 admin이라는 뜻
        res.json({ data: [] });
    } catch (error) {
        next(error);
    }
});

export default router;
