import session from "express-session";
import connectPgSimple from "connect-pg-simple";

const NODE_ENV = process.env.NODE_ENV ?? "development";
const SESSION_SECRET = process.env.SESSION_SECRET || "replace_me";

// Reuse existing PG pool if your db layer exports it.
// Adjust the import path if your pool is elsewhere.
let pool: any = undefined;
try {
    ({ pool } = await import("../db.js"));
} catch {
    // pool is optional at build time; connect-pg-simple can create its own pool from DATABASE_URL,
    // but we prefer reusing the app pool when available.
}

const PgSession = connectPgSimple(session);

export function makeSessionConfig(): session.SessionOptions {
    return {
        store: new PgSession({
            // Prefer the already-created Pool if present; otherwise fall back to env config.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            pool,
            tableName: "session",
            createTableIfMissing: true,
            ttl: 60 * 60 * 24 * 7,
        }),
        secret: SESSION_SECRET,
        name: "sid",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: NODE_ENV === "production",
            // 7 days
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
    };
}