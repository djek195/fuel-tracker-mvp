import { beforeAll, afterAll } from "vitest";
import type { Server } from "node:http";
import { createApp } from "../app.js";


process.env.SESSION_SECRET ??= "test_secret";
process.env.DATABASE_URL ??= process.env.DATABASE_URL || "postgres://fuel:fuelpass@db:5432/fueltracker";

let server: Server;

beforeAll(async () => {
    const app = await createApp();
    server = app.listen(0);
    (globalThis as any).__TEST_SERVER__ = server;
});

afterAll(async () => {
    if (!server) return;
    await new Promise<void>((resolve) => server.close(() => resolve()));
});