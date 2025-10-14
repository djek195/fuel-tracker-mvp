let cachedToken: string | null = null;
let inFlight: Promise<string> | null = null;

const API_URL = import.meta.env.VITE_API_URL ?? "";

export async function getCsrfToken(): Promise<string> {
    if (cachedToken) return cachedToken;
    if (inFlight) return inFlight;

    inFlight = fetch(`${API_URL}/api/auth/csrf`, {
        method: "GET",
        credentials: "include",
    })
        .then(async (r) => {
            const { csrfToken } = await r.json();
            cachedToken = csrfToken;
            return csrfToken;
        })
        .finally(() => {
            inFlight = null;
        });

    return inFlight;
}

export function clearCsrfCache() {
    cachedToken = null;
}