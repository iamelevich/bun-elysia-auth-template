import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { notInArray } from "drizzle-orm";
import { db } from "../db";
import { settings } from "../db/schema";
import {
  createClient,
  getSessionCookie,
  TEST_USERS,
} from "../helpers/test-helpers";

const SEEDED_KEYS = ["auth.disable_registration"];
const TEST_KEY = "test.setting";
const TEST_KEY_BATCH_A = "test.batch.a";
const TEST_KEY_BATCH_B = "test.batch.b";

const anonApi = createClient();
let adminApi: ReturnType<typeof createClient>;
let userApi: ReturnType<typeof createClient>;

beforeAll(async () => {
  const adminCookie = await getSessionCookie(
    TEST_USERS.admin.email,
    TEST_USERS.admin.password,
  );
  const userCookie = await getSessionCookie(
    TEST_USERS.user.email,
    TEST_USERS.user.password,
  );
  adminApi = createClient(adminCookie);
  userApi = createClient(userCookie);
});

afterEach(async () => {
  await db.delete(settings).where(notInArray(settings.key, SEEDED_KEYS));
});

describe("GET /api/settings", () => {
  it("returns 401 when unauthenticated", async () => {
    const { status } = await anonApi.api.settings.get();
    expect(status).toBe(401);
  });

  it("returns 200 with settings array for regular user", async () => {
    const { data, status } = await userApi.api.settings.get();
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data?.length).toBeGreaterThan(0);
    expect(data?.[0]?.key).toBeDefined();
    expect(data?.[0]?.value).toBeDefined();
  });

  it("returns 200 with settings array for admin", async () => {
    const { data, status } = await adminApi.api.settings.get();
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});

describe("GET /api/settings/:key", () => {
  it("returns 404 for unknown key", async () => {
    const { status } = await anonApi.api
      .settings({
        key: "nonexistent.key",
      })
      .get();
    expect(status).toBe(404);
  });

  it("returns 200 with setting when key exists", async () => {
    const { data, status } = await anonApi.api
      .settings({
        key: "auth.disable_registration",
      })
      .get();
    expect(status).toBe(200);
    expect(data?.key).toBe("auth.disable_registration");
    expect(data?.value).toBeDefined();
  });
});

describe("PATCH /api/settings/:key", () => {
  it("returns 401 when unauthenticated", async () => {
    const { status } = await anonApi.api
      .settings({
        key: TEST_KEY,
      })
      .patch({
        value: "test-value",
      });
    expect(status).toBe(401);
  });

  it("returns 403 for regular user", async () => {
    const { status } = await userApi.api
      .settings({
        key: TEST_KEY,
      })
      .patch({
        value: "test-value",
      });
    expect(status).toBe(403);
  });

  it("upserts setting as admin and returns it", async () => {
    const { data, status } = await adminApi.api
      .settings({
        key: TEST_KEY,
      })
      .patch({
        value: "hello",
      });
    expect(status).toBe(200);
    expect(data?.key).toBe(TEST_KEY);
    expect(data?.value).toBe("hello");
  });

  it("updates existing setting as admin", async () => {
    await adminApi.api
      .settings({
        key: TEST_KEY,
      })
      .patch({ value: "first" });

    const { data, status } = await adminApi.api
      .settings({
        key: TEST_KEY,
      })
      .patch({
        value: "second",
      });
    expect(status).toBe(200);
    expect(data?.value).toBe("second");
  });
});

describe("PATCH /api/settings/batch", () => {
  it("returns 401 when unauthenticated", async () => {
    const { status } = await anonApi.api.settings.batch.patch([
      { key: TEST_KEY_BATCH_A, value: "v1" },
    ]);
    expect(status).toBe(401);
  });

  it("returns 403 for regular user", async () => {
    const { status } = await userApi.api.settings.batch.patch([
      { key: TEST_KEY_BATCH_A, value: "v1" },
    ]);
    expect(status).toBe(403);
  });

  it("batch upserts settings as admin", async () => {
    const { data, status } = await adminApi.api.settings.batch.patch([
      { key: TEST_KEY_BATCH_A, value: "val-a" },
      { key: TEST_KEY_BATCH_B, value: "val-b" },
    ]);
    expect(status).toBe(200);
    const items = data ?? [];
    expect(items).toHaveLength(2);
    const keys = items.map((s) => s.key);
    expect(keys).toContain(TEST_KEY_BATCH_A);
    expect(keys).toContain(TEST_KEY_BATCH_B);
  });
});
