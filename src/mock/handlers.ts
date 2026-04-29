import { http, HttpResponse } from "msw";
import type {
    AttendanceTodayResponse,
    AttendanceListResponse,
    AttendanceLog,
    Employee,
    EmployeeListResponse,
    DeviceStatus,
    DeviceStatusResponse,
    RecentDetection,
    RecentDetectionsResponse,
    Beacon,
    BeaconListResponse,
    CreateBeaconRequest,
} from "../types/api";

const mockAttendanceLogs: AttendanceLog[] = [
    {
        id: 1,
        employeeId: 101,
        employeeName: "김기수",
        beaconId: 1,
        beaconLabel: "카드-001",
        checkIn: "2026-04-27T09:02:14+09:00",
        checkOut: "2026-04-27T18:15:32+09:00",
        date: "2026-04-27",
        rssi: -68,
        autoCheckout: true,
    },
    {
        id: 2,
        employeeId: 102,
        employeeName: "이영희",
        beaconId: 2,
        beaconLabel: "카드-002",
        checkIn: "2026-04-27T08:45:00+09:00",
        checkOut: "2026-04-27T17:50:21+09:00",
        date: "2026-04-27",
        rssi: -72,
        autoCheckout: true,
    },
    {
        id: 3,
        employeeId: 103,
        employeeName: "박민수",
        beaconId: 3,
        beaconLabel: "카드-003",
        checkIn: "2026-04-27T09:30:48+09:00",
        checkOut: null,
        date: "2026-04-27",
        rssi: -65,
        autoCheckout: false,
    },
    {
        id: 4,
        employeeId: 104,
        employeeName: "최지원",
        beaconId: 4,
        beaconLabel: "카드-004",
        checkIn: "2026-04-26T08:55:12+09:00",
        checkOut: "2026-04-26T18:02:45+09:00",
        date: "2026-04-26",
        rssi: -70,
        autoCheckout: true,
    },
    {
        id: 5,
        employeeId: 101,
        employeeName: "김기수",
        beaconId: 1,
        beaconLabel: "카드-001",
        checkIn: "2026-04-26T09:10:00+09:00",
        checkOut: "2026-04-26T18:30:15+09:00",
        date: "2026-04-26",
        rssi: -67,
        autoCheckout: true,
    },
];

const mockEmployees: Employee[] = [
    {
        id: 101,
        name: "김기수",
        email: "kisu.kim@mossland.kr",
        department: "기술연구소",
        position: "선임연구원",
        isActive: true,
        createdAt: "2024-01-15T09:00:00+09:00",
        updatedAt: "2024-01-15T09:00:00+09:00",
    },
    {
        id: 102,
        name: "이영희",
        email: "yh.lee@mossland.kr",
        department: "사업개발",
        position: "팀장",
        isActive: true,
        createdAt: "2023-08-20T09:00:00+09:00",
        updatedAt: "2024-03-01T10:00:00+09:00",
    },
    {
        id: 103,
        name: "박민수",
        email: "ms.park@mossland.kr",
        department: "기술연구소",
        position: "연구원",
        isActive: true,
        createdAt: "2024-06-10T09:00:00+09:00",
        updatedAt: "2024-06-10T09:00:00+09:00",
    },
    {
        id: 104,
        name: "최지원",
        email: null,
        department: "경영지원",
        position: "사원",
        isActive: true,
        createdAt: "2025-02-03T09:00:00+09:00",
        updatedAt: "2025-02-03T09:00:00+09:00",
    },
    {
        id: 105,
        name: "정수진",
        email: "sj.jung@mossland.kr",
        department: "사업개발",
        position: "사원",
        isActive: false,
        createdAt: "2023-04-01T09:00:00+09:00",
        updatedAt: "2025-09-15T17:00:00+09:00",
    },
];

const mockRecentDetections: RecentDetection[] = [
    {
        id: 1,
        beaconLabel: "카드-001",
        employeeName: "김기수",
        detectedAt: "2026-04-27T14:32:15+09:00",
        rssi: -67,
    },
    {
        id: 2,
        beaconLabel: "카드-003",
        employeeName: "박민수",
        detectedAt: "2026-04-27T14:31:48+09:00",
        rssi: -65,
    },
    {
        id: 3,
        beaconLabel: "카드-002",
        employeeName: "이영희",
        detectedAt: "2026-04-27T14:30:22+09:00",
        rssi: -72,
    },
    {
        id: 4,
        beaconLabel: "카드-001",
        employeeName: "김기수",
        detectedAt: "2026-04-27T14:28:55+09:00",
        rssi: -69,
    },
    {
        id: 5,
        beaconLabel: "카드-004",
        employeeName: "최지원",
        detectedAt: "2026-04-27T14:25:10+09:00",
        rssi: -70,
    },
];

const mockDeviceStatus: DeviceStatus[] = [
    {
        deviceId: "ESP32-6F-001",
        online: true,
        lastHeartbeat: "2026-04-27T14:33:00+09:00",
        uptimeSeconds: 86420,
        wifiRssi: -45,
    },
];

let mockBeacons: Beacon[] = [
    {
        id: 1,
        macAddress: "AA:BB:CC:11:22:33",
        employeeId: 101,
        employeeName: "김기수",
        label: "카드-001",
        isActive: true,
        registeredAt: "2026-01-15T09:00:00+09:00",
    },
    {
        id: 2,
        macAddress: "AA:BB:CC:11:22:34",
        employeeId: 102,
        employeeName: "이영희",
        label: "카드-002",
        isActive: true,
        registeredAt: "2026-01-15T09:00:00+09:00",
    },
    {
        id: 3,
        macAddress: "AA:BB:CC:11:22:35",
        employeeId: 103,
        employeeName: "박민수",
        label: "카드-003",
        isActive: true,
        registeredAt: "2026-01-15T09:00:00+09:00",
    },
    {
        id: 4,
        macAddress: "AA:BB:CC:11:22:36",
        employeeId: 104,
        employeeName: "최지원",
        label: "카드-004",
        isActive: true,
        registeredAt: "2026-02-10T09:00:00+09:00",
    },
];

let nextBeaconId = 5;

export const handlers = [
    http.get("/api/v1/attendance/today", () => {
        const response: AttendanceTodayResponse = {
            date: "2026-04-27",
            total: 18,
            checkedIn: 14,
            notCheckedIn: 2,
            checkedOut: 2,
        };
        return HttpResponse.json(response);
    }),

    /* request로 구조분해하여 수신
    requset: 표준 Fetch API 객체, 요청 정보를 표준 객체로 전달*/
    http.get("/api/v1/attendance", ({ request }) => {
        // URL 객체로 query parameter 추출
        const url = new URL(request.url);
        const date = url.searchParams.get("date");

        let filtered = mockAttendanceLogs;
        if (date) {
            filtered = filtered.filter((log) => log.date === date);
        }

        const response: AttendanceListResponse = {
            data: filtered,
            total: filtered.length,
        };
        return HttpResponse.json(response);
    }),

    http.get("/api/v1/employees", ({ request }) => {
        const url = new URL(request.url);
        const isActiveParam = url.searchParams.get("is_active");

        let filtered = mockEmployees;
        if (isActiveParam === "true") {
            filtered = filtered.filter((e) => e.isActive);
        } else if (isActiveParam === "false") {
            filtered = filtered.filter((e) => !e.isActive);
        }

        const response: EmployeeListResponse = {
            data: filtered,
            total: filtered.length,
        };
        return HttpResponse.json(response);
    }),

    http.get("/api/v1/dashboard/realtime", () => {
        // 실제 환경에선 매번 다른 데이터지만, mock에선 약간의 변화만 줘서 폴링 효과 시뮬레이션
        const shuffled = [...mockRecentDetections].sort(() => Math.random() - 0.5);

        const response: RecentDetectionsResponse = {
            data: shuffled.slice(0, 5),
        };
        return HttpResponse.json(response);
    }),

    http.get("/api/v1/dashboard/device-status", () => {
        const response: DeviceStatusResponse = {
            data: mockDeviceStatus,
        };
        return HttpResponse.json(response);
    }),

    http.get("/api/v1/beacons", () => {
        const response: BeaconListResponse = {
            data: mockBeacons,
            total: mockBeacons.length,
        };
        return HttpResponse.json(response);
    }),

    http.post("/api/v1/beacons", async ({ request }) => {
        // Type 단언(as CreateBeaconRequest) 대신 zod 사용하는게 안전
        const body = (await request.json()) as CreateBeaconRequest;

        // 중복 MAC 체크
        if (mockBeacons.some((b) => b.macAddress === body.macAddress)) {
            return HttpResponse.json({ error: "이미 등록된 MAC 주소입니다." }, { status: 400 });
        }

        // 직원 정보 조회
        const employee = mockEmployees.find((e) => e.id === body.employeeId);
        if (!employee) {
            return HttpResponse.json({ error: "존재하지 않는 직원입니다." }, { status: 400 });
        }

        const newBeacon: Beacon = {
            id: nextBeaconId++,
            macAddress: body.macAddress,
            employeeId: body.employeeId,
            employeeName: employee.name,
            label: body.label,
            isActive: true,
            registeredAt: new Date().toISOString(),
        };

        mockBeacons.push(newBeacon);

        return HttpResponse.json(newBeacon, { status: 201 });
    }),

    http.delete("/api/v1/beacons/:id", ({ params }) => {
        const id = Number(params.id);
        const beacon = mockBeacons.find((b) => b.id === id);

        if (!beacon) {
            return HttpResponse.json({ error: "존재하지 않는 비콘입니다." }, { status: 404 });
        }

        // soft delete (명세서대로)
        beacon.isActive = false;

        return HttpResponse.json(beacon);
    }),
];
