import { Router } from "express";
import csurf from "csurf";

/**
 * Session-based CSRF tokens (no separate cookie).
 * csurf ignores GET/HEAD/OPTIONS; checks POST/PUT/PATCH/DELETE.
 * Looks for the token in:
 *  - req.body._csrf
 *  - req.query._csrf
 *  - headers: 'csrf-token', 'xsrf-token', 'x-csrf-token', 'x-xsrf-token'
 */
export const requireCsrf = csurf({
    cookie: false,
});

// Small router to issue CSRF token for SPA.
// Should be used AFTER session middleware, e.g. at /api/auth/csrf
export const csrfRouter = Router();
csrfRouter.use(requireCsrf);
csrfRouter.get("/", (req, res) => {
    // @ts-expect-error – csurf adds csrfToken() to Request
    res.json({ csrfToken: req.csrfToken() });
});