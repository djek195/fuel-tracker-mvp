import type { CorsOptions } from "cors";

const originEnv = process.env.CORS_ORIGIN; // e.g. http://localhost:5173
const defaultOriginPattern = [/localhost:\d+$/];

export const corsOptions: CorsOptions = {
    origin: originEnv ? [originEnv] : defaultOriginPattern,
    credentials: true, // IMPORTANT for cookie-based sessions
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
    exposedHeaders: [],
};