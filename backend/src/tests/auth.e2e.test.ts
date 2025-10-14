import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

describe("Auth flow", () => {
    it("register → me → logout → me(401) → login → me", async () => {

        const app = await createApp();
        const agent = request.agent(app);

        // 1) CSRF
        const csrf1 = (await agent.get("/api/auth/csrf")).body.csrfToken;

        // 2) Register
        const email = `alice.${Date.now()}@example.com`;
        const password = "Passw0rd1";
        await agent
            .post("/api/auth/register")
            .set("X-CSRF-Token", csrf1)
            .send({ email, password, confirmPassword: password, displayName: "Alice" })
            .expect(201);

        // 3) Me (logged in)
        const me1 = await agent.get("/api/auth/me").expect(200);
        expect(me1.body?.user?.email).toBe(email);

        // 4) Logout (update CSRF for current session)
        const csrf2 = (await agent.get("/api/auth/csrf")).body.csrfToken;
        await agent.post("/api/auth/logout").set("X-CSRF-Token", csrf2).expect(204);

        // 5) Me (401)
        await agent.get("/api/auth/me").expect(401);

        // 6) Login
        const csrf3 = (await agent.get("/api/auth/csrf")).body.csrfToken;
        await agent
            .post("/api/auth/login")
            .set("X-CSRF-Token", csrf3)
            .send({ email, password })
            .expect(200);

        // 7) Me again
        const me2 = await agent.get("/api/auth/me").expect(200);
        expect(me2.body?.user?.email).toBe(email);
    });
});