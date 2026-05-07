import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAuth); // JWT 인증
router.use(requireAdmin); // admin 권한 확인

function toEmployeeResponse(employee: {
    id: number;
    name: string;
    email: string | null;
    department: string | null;
    position: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}) {
    return {
        id: employee.id,
        name: employee.name,
        email: employee.email ?? "",
        department: employee.department ?? "",
        position: employee.position ?? "",
        isActive: employee.isActive,
        createdAt: employee.createdAt.toISOString(),
        updatedAt: employee.updatedAt.toISOString(),
    };
}

// 프론트가 보낸 req.body 입력 정리
function getEmployeePayload(body: unknown) {
    const payload = body as {
        name?: unknown;
        department?: unknown;
        position?: unknown;
        email?: unknown;
        is_active?: unknown;
    };

    return {
        name: typeof payload.name === "string" ? payload.name.trim() : undefined,
        department: typeof payload.department === "string" ? payload.department.trim() : undefined,
        position: typeof payload.position === "string" ? payload.position.trim() : undefined,
        email: typeof payload.email === "string" ? payload.email.trim() : undefined,
        isActive: typeof payload.is_active === "boolean" ? payload.is_active : undefined,
    };
}

// 직원 목록 조회
router.get("/", async (req, res, next) => {
    try {
        const isActive = req.query.is_active;

        const employees = await prisma.employee.findMany({
            where:
                isActive === "true"
                    ? { isActive: true }
                    : isActive === "false"
                      ? { isActive: false }
                      : undefined,
            orderBy: { id: "asc" },
        });

        return res.json({
            data: employees.map(toEmployeeResponse),
            total: employees.length,
        });
    } catch (error) {
        next(error);
    }
});

// 직원 상세 조회
router.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id); // req.params.id는 문자열이므로 숫자로 변환

        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "올바른 직원 ID가 아닙니다." });
        }

        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                beacons: true, // 직원에 할당된 비콘
            },
        });

        if (!employee) {
            return res.status(404).json({ error: "존재하지 않는 직원입니다." });
        }

        const availableBeacons = await prisma.beacon.findMany({
            where: {
                isActive: true,
                employeeId: null,
            },
            orderBy: { id: "asc" },
        });

        const currentBeacon = employee.beacons.find((beacon) => beacon.isActive) ?? null;

        return res.json({
            employee: toEmployeeResponse(employee),
            beacon: currentBeacon
                ? {
                      id: currentBeacon.id,
                      macAddress: currentBeacon.macAddress,
                      employeeId: currentBeacon.employeeId,
                      employeeName: employee.name,
                      label: currentBeacon.label ?? "",
                      isActive: currentBeacon.isActive,
                      registeredAt: currentBeacon.registeredAt.toISOString(),
                  }
                : null,
            availableBeacons: availableBeacons.map((beacon) => ({
                id: beacon.id,
                macAddress: beacon.macAddress,
                employeeId: beacon.employeeId,
                employeeName: null,
                label: beacon.label ?? "",
                isActive: beacon.isActive,
                registeredAt: beacon.registeredAt.toISOString(),
            })),
            // 근태 요약 계산 로직 필요
            summary: {
                averageCheckIn: null,
                workDays: 0,
                lateCount: 0,
                totalWorkMinutes: 0,
            },
            // 최근 출퇴근 이력 추가 필요
            recentAttendance: [],
        });
    } catch (error) {
        next(error);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const payload = getEmployeePayload(req.body);

        if (!payload.name || !payload.department || !payload.position) {
            return res.status(400).json({ error: "이름, 부서, 담당을 입력해주세요." });
        }

        const employee = await prisma.employee.create({
            data: {
                name: payload.name,
                department: payload.department,
                position: payload.position,
                email: payload.email || null,
            },
        });

        return res.status(201).json(toEmployeeResponse(employee));
    } catch (error) {
        next(error);
    }
});

router.patch("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "올바른 직원 ID가 아닙니다." });
        }

        const payload = getEmployeePayload(req.body);

        const employee = await prisma.employee.update({
            where: { id },
            data: {
                ...(payload.name !== undefined ? { name: payload.name } : {}),
                ...(payload.department !== undefined ? { department: payload.department } : {}),
                ...(payload.position !== undefined ? { position: payload.position } : {}),
                ...(payload.email !== undefined ? { email: payload.email || null } : {}),
                ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
            },
        });

        return res.json(toEmployeeResponse(employee));
    } catch (error) {
        next(error);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: "올바른 직원 ID가 아닙니다." });
        }

        await prisma.beacon.updateMany({
            where: { employeeId: id },
            data: { employeeId: null }, // 기존 비콘 할당 해제
        });

        const employee = await prisma.employee.update({
            where: { id },
            data: { isActive: false }, // soft delete
        });

        return res.json(toEmployeeResponse(employee));
    } catch (error) {
        next(error);
    }
});

export default router;
