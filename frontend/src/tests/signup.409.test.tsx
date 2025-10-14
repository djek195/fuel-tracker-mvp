import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithAppRouter } from "./testUtils";
import { server, http, HttpResponse } from "./testServer";

const API = "http://localhost:8080";

describe("Sign Up 409 mapping", () => {
    it("shows field error on email when backend returns 409", async () => {
        // Override /register to return 409
        server.use(
            http.post(`${API}/api/auth/register`, () =>
                HttpResponse.json({ message: "Email already in use" }, { status: 409 }),
            )
        );

        renderWithAppRouter(["/signup"]);

        const email = await screen.findByLabelText(/email/i);
        const password = screen.getByLabelText(/^password$/i);
        const confirm = screen.getByLabelText(/confirm password/i);
        const submit = screen.getByRole("button", { name: /create account/i });

        await userEvent.type(email, "taken@example.com");
        await userEvent.type(password, "Passw0rd1");
        await userEvent.type(confirm, "Passw0rd1");
        await userEvent.click(submit);

        // Expect error specifically under the email field
        const emailError = await screen.findByText(/email already in use/i);
        expect(emailError).toBeInTheDocument();
    });
});