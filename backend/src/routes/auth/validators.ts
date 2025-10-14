import { body, validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";
import { PASSWORD_RULE } from "./passwords.js";

export const registerValidator = [
    body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
    body("password")
        .matches(PASSWORD_RULE)
        .withMessage("Password must be at least 8 chars and include a letter and a digit"),
    body("confirmPassword")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Passwords do not match"),
    body("displayName").optional().isString().isLength({ max: 64 }),
];

export const loginValidator = [
    body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
    body("password").isString().withMessage("Password is required").isLength({ min: 1 }),
];

export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const v = validationResult(req);
  if (v.isEmpty()) return next();

  const errors = v.array();
  return res.status(400).json({
    errors: errors.map((e: any) => ({
      field: e.path ?? e.param ?? "unknown",
      message: String(e.msg),
    })),
  });
}