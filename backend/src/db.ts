import express from "express";
import cors from "cors";
import session from "express-session";
import { corsOptions } from "./config/cors.js";
import { makeSessionConfig } from "./config/session.js";
import { csrfRouter } from "./middleware/csrf.js";
import { errorHandler } from "./middleware/error.js";
import { healthRouter } from "./routes/health.js";
import { vehiclesRouter } from "./routes/vehicles.js";
import { fuelRouter } from "./routes/fuel.js";
import { authRouter } from "./routes/auth/index.js";
import { runMigrations } from "./db/migrate.js";

export async function createApp() {
    const app = express();

    await runMigrations();

    app.set("trust proxy", 1);

    // parsers
    app.use(express.json());

    // CORS for cookie sessions
    app.use(cors(corsOptions));

    // Sessions (before CSRF!)
    app.use(session(makeSessionConfig()));

    // CSRF token endpoint
    app.use("/api/auth/csrf", csrfRouter);

    // Routes
    app.use("/health", healthRouter);
    app.use("/api/auth", authRouter);
    app.use("/api/vehicles", vehiclesRouter);
    app.use("/api/fuel", fuelRouter);

    // Error handler LAST
    app.use(errorHandler);

    return app;
}