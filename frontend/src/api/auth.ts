import { apiFetch } from "./client";
import type { ApiResult, PublicUser } from "./types";

export async function me(): Promise<ApiResult<{ user: PublicUser }>> {
    return apiFetch("/api/auth/me");
}

export async function register(payload: {
    email: string;
    password: string;
    confirmPassword: string;
    displayName?: string;
}): Promise<ApiResult<{ user: PublicUser }>> {
    return apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function login(payload: {
    email: string;
    password: string;
}): Promise<ApiResult<{ user: PublicUser }>> {
    return apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function logout(): Promise<ApiResult<void>> {
    return apiFetch("/api/auth/logout", { method: "POST" });
}