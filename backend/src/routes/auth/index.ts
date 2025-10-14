import { Router } from "express";
import { requireCsrf } from "../../middleware/csrf.js";
import { register, login, logout, me } from "./controller.js";
import { registerValidator, loginValidator, handleValidationErrors } from "./validators.js";
import { loginRateLimiter, registerRateLimiter } from "../../middleware/security.js";

export const authRouter = Router();

// public
authRouter.get("/me", me);

// mutations (CSRF + rate limits)
authRouter.post(
    "/register",
    registerRateLimiter,
    requireCsrf,
    registerValidator,
    handleValidationErrors,
    register
);

authRouter.post(
    "/login",
    loginRateLimiter,
    requireCsrf,
    loginValidator,
    handleValidationErrors,
    login
);

authRouter.post("/logout", requireCsrf, logout);