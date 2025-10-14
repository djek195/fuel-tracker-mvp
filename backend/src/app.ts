import express from "express";
import cors from "cors";
import session from "express-session";
import { corsOptions } from "./config/cors.js";
import { makeSessionConfig } from "./config/session.js";
import { csrfRouter } from "./middleware/csrf.js";
import { errorHandler } from "./middleware/error.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth/index.js";
import { runMigrations } from "./db/migrate.js";

export async function createApp() {
    const app = express();

    await runMigrations();

    // trust proxy (required for secure cookies behind ingress)
    app.set("trust proxy", 1);

    // 1) parsers
    app.use(express.json());

    // 2) CORS for cookie sessions
    app.use(cors(corsOptions));

    // 3) Sessions (before CSRF!)
    app.use(session(makeSessionConfig()));

    // 4) CSRF token for SPA (GET)
    app.use("/api/auth/csrf", csrfRouter);

    // 5) Routes
    app.use("/health", healthRouter);
    app.use("/api/auth", authRouter);

    // 6) Error handler (last)
    app.use(errorHandler);

    return app;
}