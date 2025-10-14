import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithAppRouter } from "./testUtils";
import { server, http, HttpResponse } from "./testServer";

const API = "http://localhost:8080";

describe("Login snackbar", () => {
    it('shows "Signed in successfully." snackbar on successful login', async () => {
        // /me -> 401 (by default), /login -> 200 (by default)
        renderWithAppRouter(["/signin"]);

        const email = await screen.findByLabelText(/email/i);
        const password = screen.getByLabelText(/^password$/i);
        const submit = screen.getByRole("button", { name: /sign in/i });

        await userEvent.type(email, "john@example.com");
        await userEvent.type(password, "Passw0rd1");
        await userEvent.click(submit);

        // Snackbar with message from AuthProvider.enqueue(...)
        const snackbar = await screen.findByText(/signed in successfully\./i);
        expect(snackbar).toBeInTheDocument();

        // Additionally — check that /me now returns 200 (emulation)
        server.use(
            http.get(`${API}/api/auth/me`, () =>
                HttpResponse.json({
                    user: {
                        id: "1",
                        email: "john@example.com",
                        displayName: "John",
                        currency: null,
                        distanceUnit: null,
                        volumeUnit: null,
                        timeZone: null,
                    },
                }),
            )
        );

        // After login, navigating to "/" should pass the guard
        await waitFor(() => {
            // Dashboard heading
            expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
        });
    });
});