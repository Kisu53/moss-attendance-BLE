// 어떤 응답을 줄지 정의

import { http, HttpResponse } from "msw";
import {
    API_BASE_PATH,
    API_ENDPOINTS,
    type ApiId,
    type ApiResponse,
    type AttendanceLogDetail,
    type Beacon,
    type DashboardRealtimeResponse,
    type DashboardStatsResponse,
    type DeviceConfigResponse,
    type Employee,
    type LoginRequest,
    type LoginResponse,
    type MeResponse,
    type PaginatedResponse,
    type TodayAttendanceStatus,
    type TodayAttendanceResponse,
} from "../types/api";
import {
    mockAttendanceLogs,
    mockBeacons,
    mockDeviceStatuses,
    mockEmployees,
    mockSystemConfigs,
} from "./data";

const adminUser = {
    id: 1,
    name: "Admin",
    email: "admin@moss.local",
    role: "admin",
};

function apiPath(path: string) {
    return `${API_BASE_PATH}${path}`;
}

function ok<T>(data: T, init?: ResponseInit) {
    return HttpResponse.json<ApiResponse<T>>({ status: "ok", data }, init);
}

function error(code: string, message: string, init?: ResponseInit) {
    return HttpResponse.json<ApiResponse<never>>(
        { status: "error", error: { code, message } },
        init,
    );
}

function idsMatch(left: ApiId, right: ApiId) {
    return String(left) === String(right);
}

function withEmployee(beacon: Beacon) {
    return {
        ...beacon,
        employee:
            mockEmployees.find((employee) => idsMatch(employee.id, beacon.employee_id)) ?? null,
    };
}

function withBeacon(employee: Employee) {
    return {
        ...employee,
        beacon: mockBeacons.find((beacon) => idsMatch(beacon.employee_id, employee.id)) ?? null,
    };
}

export const handlers = [
    http.post(apiPath(API_ENDPOINTS.auth.login), async ({ request }) => {
        const body = (await request.json()) as Partial<LoginRequest>;

        if (!body.email || !body.password) {
            return error("INVALID_CREDENTIALS", "Email and password are required.", {
                status: 400,
            });
        }

        return ok<LoginResponse>({
            token: "mock-access-token",
            user: adminUser,
            expires_at: "2026-04-28T00:00:00+09:00",
        });
    }),

    http.post(apiPath(API_ENDPOINTS.auth.logout), () => ok({ success: true })),

    http.get(apiPath(API_ENDPOINTS.auth.me), () => ok<MeResponse>({ user: adminUser })),

    http.get(apiPath(API_ENDPOINTS.employees.list), ({ request }) => {
        const url = new URL(request.url);
        const isActive = url.searchParams.get("is_active");
        const employees =
            isActive === null
                ? mockEmployees
                : mockEmployees.filter((employee) => String(employee.is_active) === isActive);

        return ok<PaginatedResponse<Employee>>({
            items: employees.map(withBeacon),
            total: employees.length,
        });
    }),

    http.get(`${API_BASE_PATH}/employees/:id`, ({ params }) => {
        const employee = mockEmployees.find((item) => idsMatch(item.id, params.id as string));

        if (!employee) {
            return error("EMPLOYEE_NOT_FOUND", "Employee was not found.", { status: 404 });
        }

        return ok(withBeacon(employee));
    }),

    http.get(apiPath(API_ENDPOINTS.beacons.list), () =>
        ok<PaginatedResponse<Beacon>>({
            items: mockBeacons.map(withEmployee),
            total: mockBeacons.length,
        }),
    ),

    http.get(`${API_BASE_PATH}/beacons/:id`, ({ params }) => {
        const beacon = mockBeacons.find((item) => idsMatch(item.id, params.id as string));

        if (!beacon) {
            return error("BEACON_NOT_FOUND", "Beacon was not found.", { status: 404 });
        }

        return ok(withEmployee(beacon));
    }),

    http.get(apiPath(API_ENDPOINTS.attendance.list), () =>
        ok<PaginatedResponse<AttendanceLogDetail>>({
            items: mockAttendanceLogs,
            total: mockAttendanceLogs.length,
        }),
    ),

    http.get(apiPath(API_ENDPOINTS.attendance.today), () => {
        const checkedIn = mockAttendanceLogs.filter((log) => log.check_out === null);
        const checkedOut = mockAttendanceLogs.filter((log) => log.check_out !== null);
        const employees: TodayAttendanceStatus[] = mockEmployees.map((employee) => {
            const attendance =
                mockAttendanceLogs.find((log) => idsMatch(log.employee_id, employee.id)) ?? null;

            return {
                employee,
                attendance,
                status:
                    attendance === null
                        ? "not_checked_in"
                        : attendance.check_out
                          ? "checked_out"
                          : "checked_in",
            };
        });

        return ok<TodayAttendanceResponse>({
            date: "2026-04-27",
            checked_in_count: checkedIn.length,
            not_checked_in_count: mockEmployees.length - mockAttendanceLogs.length,
            checked_out_count: checkedOut.length,
            employees,
        });
    }),

    http.get(apiPath(API_ENDPOINTS.dashboard.realtime), () =>
        ok<DashboardRealtimeResponse>({
            present_count: mockAttendanceLogs.filter((log) => log.check_out === null).length,
            absent_count: mockEmployees.length - mockAttendanceLogs.length,
            checked_out_count: mockAttendanceLogs.filter((log) => log.check_out !== null).length,
            recent_detections: mockAttendanceLogs.slice(0, 5).map((log) => ({
                employee: log.employee ?? mockEmployees[0],
                beacon: log.beacon ?? mockBeacons[0],
                detected_at: log.check_in,
                rssi: log.rssi,
                device_id: "moss-gateway-01",
            })),
        }),
    ),

    http.get(apiPath(API_ENDPOINTS.dashboard.stats), () =>
        ok<DashboardStatsResponse>({
            average_check_in: "09:04",
            late_rate: 25,
            average_work_minutes: 482,
            total_work_days: 20,
        }),
    ),

    http.get(apiPath(API_ENDPOINTS.dashboard.deviceStatus), () => ok(mockDeviceStatuses)),

    http.get(apiPath(API_ENDPOINTS.device.config), () =>
        ok<DeviceConfigResponse>({
            rssi_threshold: -75,
            scan_interval_seconds: 10,
            report_interval_seconds: 30,
            auto_checkout_minutes: 540,
            registered_macs: mockBeacons.map((beacon) => beacon.mac_address),
        }),
    ),

    http.get(apiPath(API_ENDPOINTS.config.list), () => ok(mockSystemConfigs)),
];
