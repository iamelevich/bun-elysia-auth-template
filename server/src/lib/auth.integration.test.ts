import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { and, eq, like } from "drizzle-orm";
import { app } from "../app";
import { db, logDb } from "../db";
import { logs } from "../db/log.schema";
import { settings } from "../db/schema";
import { TEST_USERS } from "../helpers/test-helpers";

const SIGN_UP_URL = "http://localhost/auth/api/sign-up/email";
const SIGN_IN_URL = "http://localhost/auth/api/sign-in/email";
const SIGN_OUT_URL = "http://localhost/auth/api/sign-out";

// ─── Registration hook ────────────────────────────────────────────────────────

describe("registration hook (auth.disable_registration setting)", () => {
  afterEach(async () => {
    // Restore to the migration-seeded default so other test files aren't affected.
    await db
      .insert(settings)
      .values({
        key: "auth.disable_registration",
        value: "false",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({ target: settings.key, set: { value: "false" } });
  });

  it("allows sign-up when the setting row is absent", async () => {
    await db
      .delete(settings)
      .where(eq(settings.key, "auth.disable_registration"));

    const res = await app.handle(
      new Request(SIGN_UP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "new-user@test.com",
          password: "NewUserPass123!",
          name: "New User",
        }),
      }),
    );
    expect(res.status).toBe(200);
  });

  it("allows sign-up when the setting is 'false'", async () => {
    await db
      .insert(settings)
      .values({
        key: "auth.disable_registration",
        value: "false",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({ target: settings.key, set: { value: "false" } });

    const res = await app.handle(
      new Request(SIGN_UP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "another-new@test.com",
          password: "AnotherPass123!",
          name: "Another User",
        }),
      }),
    );
    expect(res.status).toBe(200);
  });

  it("blocks sign-up with 403 when the setting is 'true'", async () => {
    await db
      .insert(settings)
      .values({
        key: "auth.disable_registration",
        value: "true",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({ target: settings.key, set: { value: "true" } });

    const res = await app.handle(
      new Request(SIGN_UP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "blocked@test.com",
          password: "BlockedPass123!",
          name: "Blocked User",
        }),
      }),
    );
    expect(res.status).toBe(403);
    const body = (await res.json()) as { message: string };
    expect(body.message).toContain("Registration is currently disabled");
  });

  it("does not block other auth paths when registration is disabled", async () => {
    await db
      .insert(settings)
      .values({
        key: "auth.disable_registration",
        value: "true",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({ target: settings.key, set: { value: "true" } });

    const res = await app.handle(
      new Request(SIGN_IN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: TEST_USERS.user.email,
          password: TEST_USERS.user.password,
        }),
      }),
    );
    // sign-in must not be blocked by the registration hook
    expect(res.status).toBe(200);
  });
});

// ─── Session database hooks ───────────────────────────────────────────────────

describe("session hooks (audit log)", () => {
  it("writes a 'signed in' info log when a session is created", async () => {
    const before = await logDb
      .select()
      .from(logs)
      .where(
        and(
          eq(logs.category, "auth"),
          like(logs.message, `%${TEST_USERS.user.email}%`),
          like(logs.message, "%signed in%"),
        ),
      );

    await app.handle(
      new Request(SIGN_IN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: TEST_USERS.user.email,
          password: TEST_USERS.user.password,
        }),
      }),
    );

    const after = await logDb
      .select()
      .from(logs)
      .where(
        and(
          eq(logs.category, "auth"),
          like(logs.message, `%${TEST_USERS.user.email}%`),
          like(logs.message, "%signed in%"),
        ),
      );

    expect(after.length).toBe(before.length + 1);
    const entry = after.at(-1);
    expect(entry?.level).toBe("info");
    expect(entry?.message).toContain(TEST_USERS.user.email);
  });

  it("writes a 'signed out' info log when a session is deleted", async () => {
    // sign in first to get a session cookie
    const signInRes = await app.handle(
      new Request(SIGN_IN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: TEST_USERS.user.email,
          password: TEST_USERS.user.password,
        }),
      }),
    );
    const cookie = signInRes.headers.get("set-cookie") ?? "";

    const before = await logDb
      .select()
      .from(logs)
      .where(
        and(
          eq(logs.category, "auth"),
          like(logs.message, `%${TEST_USERS.user.email}%`),
          like(logs.message, "%signed out%"),
        ),
      );

    await app.handle(
      new Request(SIGN_OUT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie },
      }),
    );

    const after = await logDb
      .select()
      .from(logs)
      .where(
        and(
          eq(logs.category, "auth"),
          like(logs.message, `%${TEST_USERS.user.email}%`),
          like(logs.message, "%signed out%"),
        ),
      );

    expect(after.length).toBe(before.length + 1);
    const entry = after.at(-1);
    expect(entry?.level).toBe("info");
    expect(entry?.message).toContain(TEST_USERS.user.email);
  });
});
