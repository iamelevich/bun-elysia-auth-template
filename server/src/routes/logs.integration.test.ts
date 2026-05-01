import { beforeAll, describe, expect, it } from "bun:test";
import {
  createClient,
  getSessionCookie,
  TEST_USERS,
} from "../helpers/test-helpers";

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

describe("GET /api/logs", () => {
  it("returns 401 when unauthenticated", async () => {
    const { status } = await anonApi.api.logs.get();
    expect(status).toBe(401);
  });

  it("returns 403 for regular user", async () => {
    const { status } = await userApi.api.logs.get();
    expect(status).toBe(403);
  });

  it("returns 200 with paginated logs for admin", async () => {
    const { data, status } = await adminApi.api.logs.get();
    expect(status).toBe(200);
    expect(data?.pageInfo).toBeDefined();
    expect(Array.isArray(data?.logs)).toBe(true);
    expect(data?.pageInfo.total).toBeGreaterThanOrEqual(0);
    expect(data?.pageInfo.page).toBeDefined();
    expect(data?.pageInfo.limit).toBeDefined();
    expect(data?.pageInfo.hasNextPage).toBeDefined();
    expect(data?.pageInfo.hasPreviousPage).toBeDefined();
  });

  it("accepts pagination query params", async () => {
    const { data, status } = await adminApi.api.logs.get({
      query: { page: 1, limit: 5 },
    });
    expect(status).toBe(200);
    expect(data?.pageInfo.page).toBe(1);
    expect(data?.pageInfo.limit).toBe(5);
  });

  it("accepts level filter", async () => {
    const { data, status } = await adminApi.api.logs.get({
      query: { level: "info" },
    });
    expect(status).toBe(200);
    for (const log of data?.logs ?? []) {
      expect(log.level).toBe("info");
    }
  });
});

describe("GET /api/logs/categories", () => {
  it("returns 401 when unauthenticated", async () => {
    const { status } = await anonApi.api.logs.categories.get();
    expect(status).toBe(401);
  });

  it("returns 403 for regular user", async () => {
    const { status } = await userApi.api.logs.categories.get();
    expect(status).toBe(403);
  });

  it("returns 200 with array of category strings for admin", async () => {
    const { data, status } = await adminApi.api.logs.categories.get();
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    for (const category of data ?? []) {
      expect(typeof category).toBe("string");
    }
  });

  it("filters categories by query param", async () => {
    const { data, status } = await adminApi.api.logs.categories.get({
      query: { query: "auth" },
    });
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});
