

# 🚗 Fuel Tracker — MVP

A minimal **monorepo** for a fuel tracking app.

- **Frontend:** React + Vite (TypeScript)
- **Backend:** Express (TypeScript)
- **Database:** PostgreSQL (Docker)
- **Dev tools:** `docker compose` + optional `docker-compose.override.yml` for hot reload
- **CI/CD:** GitHub Actions (build check), Dependabot (dependency updates)

---

## 🧭 Project Structure

```
fuel-tracker-mvp/
├─ backend/                # Express API (TypeScript)
│  ├─ src/
│  │  ├─ server.ts
│  │  ├─ db.ts
│  │  └─ routes/health.ts
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ Dockerfile
├─ frontend/               # React + Vite (TypeScript)
│  ├─ src/
│  │  ├─ main.tsx
│  │  └─ App.tsx
│  ├─ index.html
│  ├─ package.json
│  └─ Dockerfile
├─ db/
│  └─ init.sql             # users, vehicles, fuel_entries + indices + trigger
├─ docker-compose.yml
├─ docker-compose.override.yml  # dev hot-reload config
├─ .env.example
└─ .github/
   ├─ workflows/ci.yml
   └─ dependabot.yml
```

---

## ✅ Requirements

- **Docker** and **Docker Compose**
- *(Optional)* **Node.js 20+** (for manual local runs, outside Docker)

---

## 🔐 Environment Setup

Copy the example file and configure your local environment:

```bash
cp .env.example .env
```

Example `.env`:

```env
NODE_ENV=development

# Postgres
POSTGRES_USER=fuel
POSTGRES_PASSWORD=fuelpass
POSTGRES_DB=fueltracker
POSTGRES_PORT=5432

# Backend
BACKEND_PORT=8080
SESSION_SECRET=dev_secret_change_me
DATABASE_URL=postgres://fuel:fuelpass@db:5432/fueltracker

# Frontend
FRONTEND_PORT=5173
VITE_API_URL=http://localhost:8080
```

> In Docker, the backend connects to the `db` service host. From your macOS/Windows host, Postgres is reachable at `localhost:${POSTGRES_PORT}`.

---

## 🚀 Quick Start (Docker)

Build and run the full stack:

```bash
docker compose up --build
```

Open:

- Frontend → http://localhost:5173
- Backend health → http://localhost:8080/health  (expected: `{ "status": "ok", "db": "up" }`)

Stop everything:

```bash
docker compose down
```

Rebuild from scratch:

```bash
docker compose build --no-cache && docker compose up
```

---

## 🔥 Development Mode (Hot Reload)

`docker-compose.override.yml` enables a live dev workflow:

- mounts `./backend` and `./frontend` into containers
- installs dependencies inside containers
- runs **backend** with `tsx watch`
- runs **frontend** with Vite dev server

Start dev mode:

```bash
docker compose up
```

Compose automatically merges the override with the base compose file.

---

## 🧰 Handy Commands (Docker)

| Command | Description |
| --- | --- |
| `docker compose up` | Start services in the foreground (with logs) |
| `docker compose up -d` | Start in the background |
| `docker compose down` | Stop all services |
| `docker compose build --no-cache` | Clean rebuild |
| `docker compose logs -f backend` | Tail backend logs |
| `docker exec -it fuel_db psql -U fuel -d fueltracker` | Open Postgres shell |

---

## 🗄️ Database Schema Overview

`db/init.sql` provisions:

- `users` — user accounts
- `vehicles` — linked to users
- `fuel_entries` — linked to both `users` and `vehicles`
- foreign keys with `ON DELETE CASCADE`
- helpful indices
- a trigger preventing future-dated entries

Connection string example (from host):

```
postgres://fuel:fuelpass@localhost:5432/fueltracker
```

---

## 🧪 Continuous Integration

- **CI:** `.github/workflows/ci.yml` builds both frontend and backend on push and PR
- **Dependabot:** `.github/dependabot.yml` opens weekly PRs for npm updates

---

## 🧭 Roadmap

- **Phase 2:** Auth (`/api/v1/auth`), CRUD for `/vehicles` and `/fuel-entries`, validations
- **Phase 3:** Deployment (managed Postgres + containerized API)
- **Phase 4:** Metrics, dashboards, analytics

---

## 📄 License

MIT — suitable for learning, prototypes, and experimentation.