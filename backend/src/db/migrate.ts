import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { pool } from "../db.js";

export async function runMigrations() {
    const dir = join(process.cwd(), "src", "db", "migrations");
    let entries: string[] = [];
    try {
        entries = await readdir(dir);
    } catch {
        return;
    }

    const files = entries.filter(f => f.toLowerCase().endsWith(".sql")).sort();
    for (const file of files) {
        const sql = await readFile(join(dir, file), "utf8");
        await pool.query(sql);
        console.log(`[migrate] applied ${file}`);
    }
}