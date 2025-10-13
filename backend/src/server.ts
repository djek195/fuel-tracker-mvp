import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import { healthRouter } from "./routes/health.js";

const app = express();
app.use(express.json());

app.use(cors({
    origin: [/localhost:\d+$/],
    credentials: false
}));

// health
app.use("/health", healthRouter);

// example: (placeholder) enforce odometer monotonicity will be done on create/update entries per vehicle
// TODO: routes /api/v1/vehicles, /api/v1/fuel-entries, /api/v1/auth (Phase 2)

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
    console.log(`API listening on :${port}`);
});

// graceful shutdown
process.on("SIGTERM", async () => {
    await pool.end();
    process.exit(0);
});