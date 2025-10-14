import rateLimit from "express-rate-limit";

// Some builds of express-rate-limit do not export ipKeyGenerator at runtime.
// To avoid "ipKeyGenerator is not a function", we disable validation and write our own keyGenerator.

function extractIp(req: import("express").Request): string {
    const xff = req.headers["x-forwarded-for"];
    const ipFromXff =
        (Array.isArray(xff) ? xff[0] : xff)?.toString().split(",")[0]?.trim();
    return ipFromXff || req.ip || req.socket?.remoteAddress || "unknown";
}

export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false, // disables runtime guard
    keyGenerator: (req) => {
        const ip = extractIp(req);
        const email = String((req.body as any)?.email ?? "").toLowerCase();
        return `${ip}|${email}`;
    },
    message: { message: "Too many login attempts. Please try again later." },
});

export const registerRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    keyGenerator: (req) => extractIp(req),
    message: { message: "Too many registrations. Please try again later." },
});