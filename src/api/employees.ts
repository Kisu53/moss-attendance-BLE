import apiClient from "./client";
import type {
  AssignEmployeeBeaconRequest,
  CreateEmployeeRequest,
  Employee,
  EmployeeDetailResponse,
  EmployeeListResponse,
  UpdateEmployeeRequest,
} from "../types/api";

export async function fetchEmployees(isActive?: "true" | "false") {
  const { data } = await apiClient.get<EmployeeListResponse>("/employees", {
    params: isActive !== undefined ? { is_active: isActive } : undefined,
  });
  return data;
}

export async function fetchEmployeeDetail(id: number) {
  const { data } = await apiClient.get<EmployeeDetailResponse>(`/employees/${id}`);
  return data;
}

export async function createEmployee(payload: CreateEmployeeRequest) {
  const { data } = await apiClient.post<Employee>("/employees", payload);
  return data;
}

export async function updateEmployee(id: number, payload: UpdateEmployeeRequest) {
  const { data } = await apiClient.patch<Employee>(`/employees/${id}`, payload);
  return data;
}

export async function deactivateEmployee(id: number) {
  const { data } = await apiClient.delete<Employee>(`/employees/${id}`);
  return data;
}

export async function activateEmployee(id: number) {
  const { data } = await apiClient.patch<Employee>(`/employees/${id}`, { is_active: true });
  return data;
}

export async function assignEmployeeBeacon(id: number, payload: AssignEmployeeBeaconRequest) {
  const { data } = await apiClient.post<EmployeeDetailResponse>(`/employees/${id}/beacon`, payload);
  return data;
}

export async function unassignEmployeeBeacon(id: number) {
  const { data } = await apiClient.delete<EmployeeDetailResponse>(`/employees/${id}/beacon`);
  return data;
}
