// src/tests/testServer.ts
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const API = "http://localhost:8080";

export const handlers = [
    // CSRF
    http.get(`${API}/api/auth/csrf`, () =>
        HttpResponse.json({ csrfToken: "test-csrf" }),
    ),

    // By default, /me -> 401
    http.get(`${API}/api/auth/me`, () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
    ),

    // Success stubs — will be overridden in tests as needed
    http.post(`${API}/api/auth/login`, async () =>
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
    ),

    http.post(`${API}/api/auth/register`, async () =>
        HttpResponse.json({
            user: {
                id: "1",
                email: "new@example.com",
                displayName: "New",
                currency: null,
                distanceUnit: null,
                volumeUnit: null,
                timeZone: null,
            },
        }, { status: 201 }),
    ),

    http.post(`${API}/api/auth/logout`, async () =>
        new HttpResponse(null, { status: 204 }),
    ),
];

export const server = setupServer(...handlers);
export { http, HttpResponse, API };