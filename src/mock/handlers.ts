import { http, HttpResponse } from "msw";
import type { AttendanceTodayResponse } from "../types/api";

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
];
