import { pool } from "../../db/pool.js";

export type DbUser = {
    id: string;
    email: string;
    password_hash: string;
    display_name: string | null;
    currency: string | null;
    distance_unit: string | null;
    volume_unit: string | null;
    time_zone: string | null;
};

export type NewUser = {
    email: string;
    passwordHash: string;
    displayName?: string | null;
};

export async function findUserByEmail(email: string): Promise<DbUser | null> {
    const { rows } = await pool.query<DbUser>(
        `select id, email, password_hash, display_name, currency, distance_unit, volume_unit, time_zone
     from users
     where lower(email) = lower($1)
     limit 1`,
        [email]
    );
    return rows[0] ?? null;
}

export async function getUserById(id: string): Promise<DbUser | null> {
    const { rows } = await pool.query<DbUser>(
        `select id, email, password_hash, display_name, currency, distance_unit, volume_unit, time_zone
     from users
     where id = $1
     limit 1`,
        [id]
    );
    return rows[0] ?? null;
}

export async function createUser(data: NewUser): Promise<DbUser> {
    const { rows } = await pool.query<DbUser>(
        `insert into users (email, password_hash, display_name)
     values ($1, $2, $3)
     returning id, email, password_hash, display_name, currency, distance_unit, volume_unit, time_zone`,
        [data.email, data.passwordHash, data.displayName ?? null]
    );
    return rows[0];
}

export function toPublicUser(u: DbUser) {
    return {
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        currency: u.currency,
        distanceUnit: u.distance_unit,
        volumeUnit: u.volume_unit,
        timeZone: u.time_zone,
    };
}