import apiClient from "./client";
import type { RecentDetectionsResponse, DeviceStatusResponse } from "../types/api";

export async function fetchRealtime() {
  const { data } = await apiClient.get<RecentDetectionsResponse>("/dashboard/realtime");
  return data;
}

export async function fetchDeviceStatus() {
  const { data } = await apiClient.get<DeviceStatusResponse>("/dashboard/device-status");
  return data;
}
