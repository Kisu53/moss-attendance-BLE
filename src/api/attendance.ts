import apiClient from "./client";
import type {
  AttendanceTodayResponse,
  AttendanceListQuery,
  AttendanceListResponse,
} from "../types/api";

export async function fetchAttendanceToday() {
  const { data } = await apiClient.get<AttendanceTodayResponse>("/attendance/today");
  return data;
}

export async function fetchAttendanceList(query?: AttendanceListQuery) {
  const params =
    query === undefined
      ? undefined
      : Object.fromEntries(
          Object.entries(query).filter(([, value]) => value !== undefined && value !== "")
        );

  const { data } = await apiClient.get<AttendanceListResponse>("/attendance", {
    params,
  });
  return data;
}
