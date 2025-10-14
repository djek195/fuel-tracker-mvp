import "dotenv/config";
import type { Server } from "node:http";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 8080);

// create the app (keep this synchronous — if you need async init, do it inside createApp)
const app = await createApp();

// start HTTP server and hold the handle for graceful shutdown
const server: Server = app.listen(port, () => {
  console.log(`API listening on :${port}`);
});

// graceful shutdown routine
async function shutdown(signal: NodeJS.Signals) {
  console.log(`${signal} received. Shutting down gracefully...`);

  // 1) stop accepting new connections and finish in-flight ones
  await new Promise<void>((resolve) => {
    server.close((err) => {
      if (err) {
        console.error("HTTP server close error:", err);
      }
      resolve();
    });
  });

  // 2) close external resources (DB pool, etc.) if available
  try {
    // Optional: attempt to import a DB module and close it if it exposes close()/pool.end()
    const db: any = await import("./db.js").catch(() => null);

    if (db) {
      if (typeof db.close === "function") {
        await db.close();
      } else if (db.pool?.end) {
        await db.pool.end();
      } else if (db.default?.pool?.end) {
        await db.default.pool.end();
      }
    }
  } catch (e) {
    console.error("DB close error:", e);
  }

  // 3) exit process
  process.exit(0);
}

// handle termination signals and fatal errors
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  void shutdown("SIGTERM");
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  void shutdown("SIGTERM");
});