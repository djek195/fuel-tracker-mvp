import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function PublicOnlyRoute() {
    const { isAuthenticated, initializing } = useAuth();
    if (initializing) return null;
    if (isAuthenticated) return <Navigate to="/" replace />;
    return <Outlet />;
}