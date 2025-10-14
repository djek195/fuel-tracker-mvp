import { render } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../app/providers/ThemeProvider";
import { SnackbarProvider } from "../app/providers/SnackbarProvider";
import { AuthProvider } from "../app/providers/AuthProvider";
import type { RouteObject } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { PrivateRoute } from "../auth/guards/PrivateRoute";
import { PublicOnlyRoute } from "../auth/guards/PublicOnlyRoute";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { SignInPage } from "../pages/SignIn/SignInPage";
import { SignUpPage } from "../pages/SignUp/SignUpPage";
import { NotFoundPage } from "../pages/NotFound/NotFoundPage";

export function renderWithAppRouter(initialEntries: string[] = ["/"]) {
    const routes: RouteObject[] = [
        {
            element: <AppLayout />,
            children: [
                { element: <PrivateRoute />, children: [{ path: "/", element: <DashboardPage /> }] },
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
    ];

    const router = createMemoryRouter(routes, { initialEntries });
    return render(
        <ThemeProvider>
            <SnackbarProvider>
                <AuthProvider>
                    <RouterProvider router={router} />
                </AuthProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}