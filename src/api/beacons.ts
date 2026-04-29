import apiClient from "./client";
import type { Beacon, BeaconListResponse, CreateBeaconRequest } from "../types/api";

export async function fetchBeacons() {
  const { data } = await apiClient.get<BeaconListResponse>("/beacons");
  return data;
}

export async function createBeacon(payload: CreateBeaconRequest) {
  const { data } = await apiClient.post<Beacon>("/beacons", payload);
  return data;
}

export async function deactivateBeacon(id: number) {
  const { data } = await apiClient.delete<Beacon>(`/beacons/${id}`);
  return data;
}
