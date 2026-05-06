import apiClient from "./client";
import type {
  AttendanceLog,
  AttendanceTodayResponse,
  AttendanceListQuery,
  AttendanceListResponse,
  ManualAttendanceRequest,
  UpdateAttendanceRequest,
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

export async function updateAttendanceLog(id: number, payload: UpdateAttendanceRequest) {
  const { data } = await apiClient.patch<AttendanceLog>(`/attendance/${id}`, payload);
  return data;
}

export async function createManualAttendance(payload: ManualAttendanceRequest) {
  const { data } = await apiClient.post<AttendanceLog>("/attendance/manual", payload);
  return data;
}
