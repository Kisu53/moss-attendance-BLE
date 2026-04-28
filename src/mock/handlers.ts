import { http, HttpResponse } from "msw";
import type { AttendanceTodayResponse, AttendanceListResponse, AttendanceLog } from "../types/api";

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
];
