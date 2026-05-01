# Bun + Elysia Auth Template

A full-stack skeleton template for building authenticated web applications with:

- **Backend:** [Bun](https://bun.sh/) + [Elysia](https://elysiajs.com/)
- **Frontend:** React + Vite + TanStack Router
- **Database:** Drizzle ORM with SQL migrations
- **Auth:** cookie/session-based auth flows (login/register/password reset), plus settings and logs modules

This repository is organized as a monorepo with separate `client` and `server` apps.

---

## What This Skeleton Provides

- Prebuilt auth flows: register, login, forgot password, reset password
- Frontend app shell components (sidebar/navigation, breadcrumbs)
- Backend modules for settings and logs
- Drizzle migration workflow and schema scaffolding
- OpenAPI documentation route at **`/openapi`**

---

## Environment Variables

Template file: **`server/.env.example`**

### Variables to set

- `DB_FILE_NAME`
- `LOG_DB_FILE_NAME`
- `LOG_LEVEL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

### Template content

```env
DB_FILE_NAME="./app-db.local.db"
LOG_DB_FILE_NAME="./app-db.log.local.db"
LOG_LEVEL="info"
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
```

Create local env file:

```bash
cp server/.env.example server/.env
```

---

## Quick Start

```bash
bun install
cp server/.env.example server/.env
bun dev # run both client and server
```
