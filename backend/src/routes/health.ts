import { Router } from "express";
import { healthDb } from "../db.js";
export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
    const dbOk = await healthDb();
    res.json({ status: "ok", db: dbOk ? "up" : "down" });
});