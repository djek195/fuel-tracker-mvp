import session from "express-session";
import connectPgSimple from "connect-pg-simple";

const NODE_ENV = process.env.NODE_ENV ?? "development";
const SESSION_SECRET = process.env.SESSION_SECRET || "replace_me";

// Try to reuse the existing pool (not required during build)
let pool: any = undefined;
try {
    ({ pool } = await import("../db/pool.js"));
} catch {
    // ok, fallback to DATABASE_URL inside connect-pg-simple
}

const PgSession = connectPgSimple(session);

export function makeSessionConfig(): session.SessionOptions {
    return {
        store: new PgSession({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            pool,
            schemaName: "public",
            tableName: "user_sessions",
            createTableIfMissing: false, // important: avoid race conditions; table is created by migration
            ttl: 60 * 60 * 24 * 7,       // 7 days
        }),
        secret: SESSION_SECRET,
        name: "sid",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        },
    };
}