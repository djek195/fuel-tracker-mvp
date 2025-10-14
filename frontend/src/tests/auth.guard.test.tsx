import { screen } from "@testing-library/react";
import { renderWithAppRouter } from "./testUtils";

describe("Route guards", () => {
    it("redirects unauthenticated user from / to /signin", async () => {
        renderWithAppRouter(["/"]);
        // By default, /me -> 401 in testServer
        const heading = await screen.findByRole("heading", { name: /sign in/i });
        expect(heading).toBeInTheDocument();
    });
});