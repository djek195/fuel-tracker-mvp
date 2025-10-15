import { runMigrations } from '../db/migrate.js';

export default async function globalSetup() {
  await runMigrations();
}

