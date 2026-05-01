import path from "node:path";
import { treaty } from "@elysia/eden";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { app } from "../app";
import { db, logDb } from "../db";
import { auth } from "../lib/auth";

export const TEST_USERS = {
  admin: {
    email: "admin@test.com",
    password: "AdminPass123!",
    name: "Test Admin",
    role: "admin" as const,
  },
  user: {
    email: "user@test.com",
    password: "UserPass123!",
    name: "Test User",
    role: "user" as const,
  },
} as const;

/**
 * Setup the test databases.
 */
export async function setupTestDb() {
  migrate(db, {
    migrationsFolder: path.join(import.meta.dirname, "../../drizzle"),
  });
  migrate(logDb, {
    migrationsFolder: path.join(import.meta.dirname, "../../drizzle/log"),
  });
}

/**
 * Seed the test users into the database from the TEST_USERS constant.
 */
export async function seedTestUsers() {
  for (const u of [TEST_USERS.admin, TEST_USERS.user]) {
    try {
      await auth.api.createUser({
        body: {
          email: u.email,
          password: u.password,
          name: u.name,
          role: u.role,
        },
      });
    } catch {
      // User already exists from a previous test file seeding the same shared DB — fine.
    }
  }
}

/**
 * Creates a type-safe Eden Treaty client for the app.
 * Pass a session cookie string to make authenticated requests.
 * @param cookie - The session cookie string. Optional, for authenticated requests.
 * @returns The Eden Treaty client.
 */
export function createClient(cookie?: string) {
  return treaty(app, {
    headers: cookie ? { cookie } : undefined,
  });
}

/**
 * Get a session cookie for a user by email and password.
 * @param email - The email of the user.
 * @param password - The password of the user.
 * @returns The session cookie.
 */
export async function getSessionCookie(
  email: string,
  password: string,
): Promise<string> {
  const res = await app.handle(
    new Request("http://localhost/auth/api/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  );
  return res.headers.get("set-cookie") ?? "";
}
