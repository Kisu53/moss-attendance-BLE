import apiClient from "./client";
import type { EmployeeListResponse } from "../types/api";

export async function fetchEmployees(isActive?: "true" | "false") {
  const { data } = await apiClient.get<EmployeeListResponse>("/employees", {
    params: isActive !== undefined ? { is_active: isActive } : undefined,
  });
  return data;
}
