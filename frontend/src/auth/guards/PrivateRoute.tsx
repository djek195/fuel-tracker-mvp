import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function PrivateRoute() {
    const { isAuthenticated, initializing } = useAuth();
    const loc = useLocation();

    if (initializing) return null;

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace state={{ from: loc }} />;
    }
    return <Outlet />;
}