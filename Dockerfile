# ─── Stage: base ──────────────────────────────────────────────────────────────
FROM oven/bun:1.3.13 AS base
WORKDIR /app

# ─── Stage: install all dependencies ──────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY package.json bun.lock ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN bun install --frozen-lockfile

# Copy all files
COPY . .

# Build client and server with Turbo
RUN bun run build

# ─── Stage: runtime ───────────────────────────────────────────────────────────
FROM oven/bun:1.3.13-slim AS runtime
WORKDIR /app

# Bundled server
COPY --from=builder /app/dist ./

# Mount point for SQLite database files — use a named volume for persistence
RUN mkdir -p /app/data

EXPOSE 3000

ENV NODE_ENV=production
ENV DB_FILE_NAME=/app/data/app.db
ENV LOG_DB_FILE_NAME=/app/data/log.db
ENV DB_MIGRATIONS_FOLDER=/app/drizzle
ENV LOG_MIGRATIONS_FOLDER=/app/drizzle/log

# Run migrations and start the server
CMD ["/bin/sh", "-c", "bun /app/migrate.js && exec bun /app/index.js"]
