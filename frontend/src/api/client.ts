import { getCsrfToken, clearCsrfCache } from "./csrf";
import type { ApiResult, ApiErrorShape } from "./types";
import { emitUnauthorized } from "./events";

const API_URL = import.meta.env.VITE_API_URL ?? "";
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function apiFetch<T>(
    path: string,
    opts: RequestInit = {}
): Promise<ApiResult<T>> {
    const method = (opts.method ?? "GET").toUpperCase();
    const headers = new Headers(opts.headers ?? {});
    headers.set("Accept", "application/json");
    if (!(opts.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    // attach CSRF for unsafe methods
    if (UNSAFE_METHODS.has(method)) {
        const token = await getCsrfToken();
        headers.set("X-CSRF-Token", token);
    }

    const doFetch = async (): Promise<Response> =>
        fetch(`${API_URL}${path}`, {
            ...opts,
            method,
            headers,
            credentials: "include",
        });

    let res: Response;
    try {
        res = await doFetch();
    } catch {
        return { ok: false, status: 0, error: { message: "Network error" } };
    }

    // if 403, try refresh CSRF once and retry
    if (res.status === 403 && UNSAFE_METHODS.has(method)) {
        clearCsrfCache();
        const token = await getCsrfToken();
        headers.set("X-CSRF-Token", token);
        try {
            res = await doFetch();
        } catch {
            return { ok: false, status: 0, error: { message: "Network error" } };
        }
    }

    if (res.status === 401) {
        // global reaction — notify subscribers (AuthProvider)
        emitUnauthorized();
    }

    if (res.ok) {
        if (res.status === 204) return { ok: true, data: undefined as unknown as T };
        const data = (await res.json()) as T;
        return { ok: true, data };
    }

    let error: ApiErrorShape = { message: res.statusText };
    try {
        error = (await res.json()) as ApiErrorShape;
    } catch {
        // keep default
    }
    return { ok: false, status: res.status, error };
}