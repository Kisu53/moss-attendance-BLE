import apiClient from "./client";
import type { BeaconListResponse } from "../types/api";

export async function fetchBeacons() {
  const { data } = await apiClient.get<BeaconListResponse>("/beacons");
  return data;
}
