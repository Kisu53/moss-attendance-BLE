import apiClient from "./client";
import type { AttendanceTodayResponse, AttendanceListResponse } from "../types/api";

export async function fetchAttendanceToday() {
  const { data } = await apiClient.get<AttendanceTodayResponse>("/attendance/today");
  return data;
}

export async function fetchAttendanceList(date?: string) {
  const { data } = await apiClient.get<AttendanceListResponse>("/attendance", {
    params: date ? { date } : undefined,
  });
  return data;
}
