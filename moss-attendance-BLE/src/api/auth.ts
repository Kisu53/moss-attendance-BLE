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

function isLoginUser(value: unknown): value is LoginUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Partial<LoginUser>;

  return (
    typeof user.id === "number" &&
    typeof user.email === "string" &&
    (typeof user.name === "string" || user.name === null) &&
    typeof user.role === "string"
  );
}

function isLoginResponse(value: unknown): value is LoginResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Partial<LoginResponse>;

  return typeof response.token === "string" && response.token.length > 0 && isLoginUser(response.user);
}

export async function loginWithGoogle(credential: string) {
  const response = await apiClient.post<unknown>("/auth/google", {
    credential,
  });

  if (!isLoginResponse(response.data)) {
    throw new Error("Invalid login response.");
  }

  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get<unknown>("/auth/me");

  if (!response.data || typeof response.data !== "object") {
    throw new Error("Invalid current user response.");
  }

  const { user } = response.data as { user?: unknown };

  if (!isLoginUser(user)) {
    throw new Error("Invalid current user response.");
  }

  return user;
}
