import apiClient from "./client";

export interface LoginUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: LoginUser;
}

export async function loginWithGoogle(credential: string) {
  const response = await apiClient.post<LoginResponse>("/auth/google", {
    credential,
  });

  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get<{ user: LoginUser }>("/auth/me");

  return response.data.user;
}
