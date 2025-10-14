import type { NextFunction, Request, Response } from "express";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("[errorHandler]", err);
    }

    // Map common Postgres error(s)
    if (isPgError(err) && err.code === "23505") {
        return res.status(409).json({ message: "Conflict (unique constraint)", detail: err.detail });
    }

    const status =
        (typeof err === "object" && err && "status" in err && Number((err as any).status)) || 500;

    const message =
        (typeof err === "object" && err && "message" in err && String((err as any).message)) ||
        "Internal Server Error";

    return res.status(status).json({
        message,
        ...(process.env.NODE_ENV !== "production" ? { stack: (err as any)?.stack } : {}),
    });
}

function isPgError(e: unknown): e is { code?: string; detail?: string } {
    return typeof e === "object" && e !== null && "code" in e;
}