import apiClient from "./client";
import type { SystemConfigItem, SystemConfigResponse, UpdateConfigRequest } from "../types/api";

export async function fetchConfig() {
  const { data } = await apiClient.get<SystemConfigResponse>("/config");
  return data;
}

export async function updateConfig(key: string, value: string) {
  const payload: UpdateConfigRequest = { value };
  const { data } = await apiClient.put<SystemConfigItem>(`/config/${key}`, payload);
  return data;
}
