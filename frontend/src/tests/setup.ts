import "@testing-library/jest-dom";
import "whatwg-fetch";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./testServer";
import { cleanup } from "@testing-library/react";

vi.stubEnv("VITE_API_URL", "http://localhost:8080"); // не критично, ми перехоплюємо MSW

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
    cleanup();
    server.resetHandlers();
});
afterAll(() => server.close());