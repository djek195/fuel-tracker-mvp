import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as auth from "../../api/auth";
import type { PublicUser } from "../../types";
import { onUnauthorized } from "../../api/events";
import { useSnackbar } from "./SnackbarProvider";

type AuthState = {
    initializing: boolean;
    user: PublicUser | null;
    isAuthenticated: boolean;
    register: (p: { email: string; password: string; confirmPassword: string; displayName?: string }) =>
        Promise<{ ok: boolean; message?: string; status?: number }>;
    login: (p: { email: string; password: string }) =>
        Promise<{ ok: boolean; message?: string; status?: number }>;
    logout: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<PublicUser | null>(null);
    const { enqueue } = useSnackbar();

    // bootstrap: fetch current user
    useEffect(() => {
        (async () => {
            const res = await auth.me();
            if (res.ok) setUser(res.data.user);
            setInitializing(false);
        })();
    }, []);

    // global reaction to 401 (emitUnauthorized from apiFetch)
    useEffect(() => {
        return onUnauthorized(() => {
            if (user) {
                setUser(null);
                enqueue("Session expired. Please sign in.", "warning");
            }
        });
    }, [user, enqueue]);

    const registerFn: AuthState["register"] = useCallback(async (p) => {
        const res = await auth.register(p);
        if (res.ok) {
            setUser(res.data.user);
            enqueue("Account created. Welcome!", "success");
            return { ok: true };
        }
        return { ok: false, message: res.error.message || "Registration failed", status: res.status };
    }, [enqueue]);

    const loginFn: AuthState["login"] = useCallback(async (p) => {
        const res = await auth.login(p);
        if (res.ok) {
            setUser(res.data.user);
            enqueue("Signed in successfully.", "success");
            return { ok: true };
        }
        return { ok: false, message: res.error.message || "Login failed", status: res.status };
    }, [enqueue]);

    const logoutFn = useCallback(async () => {
        const res = await auth.logout();
        if (res.ok) {
            setUser(null);
            enqueue("Signed out.", "info");
        }
    }, [enqueue]);

    const value: AuthState = {
        initializing,
        user,
        isAuthenticated: !!user,
        register: registerFn,
        login: loginFn,
        logout: logoutFn,
    };

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuthCtx() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useAuthCtx must be used within <AuthProvider>");
    return ctx;
}