import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PrivateRoute } from "../auth/guards/PrivateRoute";
import { PublicOnlyRoute } from "../auth/guards/PublicOnlyRoute";
import { AppLayout } from "../components/layout/AppLayout";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { SignInPage } from "../pages/SignIn/SignInPage";
import { SignUpPage } from "../pages/SignUp/SignUpPage";
import { NotFoundPage } from "../pages/NotFound/NotFoundPage";

const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            {
                element: <PrivateRoute />,
                children: [{ path: "/", element: <DashboardPage /> }],
            },
            {
                element: <PublicOnlyRoute />,
                children: [
                    { path: "/signin", element: <SignInPage /> },
                    { path: "/signup", element: <SignUpPage /> },
                ],
            },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}