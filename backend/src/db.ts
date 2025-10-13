import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL!;
export const pool = new Pool({ connectionString });

export async function healthDb(): Promise<boolean> {
    try {
        const r = await pool.query("select 1 as ok");
        return r.rows?.[0]?.ok === 1;
    } catch {
        return false;
    }
}