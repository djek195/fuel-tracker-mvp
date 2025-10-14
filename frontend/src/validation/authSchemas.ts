import { z } from "zod";

export const passwordRule = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/\d/, "Password must include a digit");

export const signInSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
    .object({
        email: z.string().email("Invalid email"),
        password: passwordRule,
        confirmPassword: z.string(),
        displayName: z.string().max(64, "Max 64 chars").optional().or(z.literal("")),
    })
    .refine((v) => v.password === v.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });