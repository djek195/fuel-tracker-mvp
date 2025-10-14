import type { Request, Response, NextFunction } from "express";
import { hashPassword, verifyPassword } from "./passwords.js";
import * as repo from "./repo.js";

// register
export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password, displayName } = req.body as {
            email: string;
            password: string;
            displayName?: string;
        };

        const exists = await repo.findUserByEmail(email);
        if (exists) return res.status(409).json({ message: "Email already in use" });

        const passwordHash = await hashPassword(password);
        const created = await repo.createUser({ email, passwordHash, displayName });

        req.session.regenerate((err) => {
            if (err) return next(err);
            req.session.user = { id: created.id, email: created.email };
            return res.status(201).json({ user: repo.toPublicUser(created) });
        });
    } catch (err) {
        next(err);
    }
}

// login
export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body as { email: string; password: string };
        const u = await repo.findUserByEmail(email);
        if (!u) return res.status(401).json({ message: "Invalid email or password" });

        const ok = await verifyPassword(password, u.password_hash);
        if (!ok) return res.status(401).json({ message: "Invalid email or password" });

        // Regenerate session ID before setting user
        req.session.regenerate((err) => {
            if (err) return next(err);
            req.session.user = { id: u.id, email: u.email };
            return res.json({ user: repo.toPublicUser(u) });
        });
    } catch (err) {
        next(err);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        req.session.destroy((err) => {
            if (err) return next(err);
            res.status(204).end();
        });
    } catch (err) {
        next(err);
    }
}

export async function me(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.session.user) return res.status(401).json({ message: "Unauthorized" });
        const found = await repo.getUserById(req.session.user.id);
        if (!found) return res.status(401).json({ message: "Unauthorized" });
        return res.json({ user: repo.toPublicUser(found) });
    } catch (err) {
        next(err);
    }
}