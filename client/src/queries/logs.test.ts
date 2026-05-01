import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  LOGS_CATEGORIES_QUERY_KEY,
  LOGS_QUERY_KEY,
  useLogsCategoriesQuery,
  useLogsQuery,
} from "./logs";

const { mockLogsGet, mockCategoriesGet } = vi.hoisted(() => ({
  mockLogsGet: vi.fn(),
  mockCategoriesGet: vi.fn(),
}));

vi.mock("@/lib/app", () => ({
  app: {
    api: {
      logs: {
        get: mockLogsGet,
        categories: {
          get: mockCategoriesGet,
        },
      },
    },
  },
}));

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("LOGS_QUERY_KEY and LOGS_CATEGORIES_QUERY_KEY", () => {
  it("has expected key values", () => {
    expect(LOGS_QUERY_KEY).toEqual(["logs"]);
    expect(LOGS_CATEGORIES_QUERY_KEY).toEqual(["logs", "categories"]);
  });
});

describe("useLogsQuery", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => queryClient.clear());

  it("includes params in the query key", async () => {
    const mockData = { logs: [], pageInfo: { total: 0 } };
    mockLogsGet.mockResolvedValue({ data: mockData, error: null });

    const params = { level: "info" as const, page: 1 };
    const { result } = renderHook(() => useLogsQuery(params), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const queries = queryClient.getQueryCache().findAll({
      queryKey: [...LOGS_QUERY_KEY, params],
    });
    expect(queries.length).toBeGreaterThan(0);
  });

  it("returns data on success", async () => {
    const mockData = {
      logs: [{ id: "1", message: "test", level: "info", timestamp: 1000 }],
      pageInfo: { total: 1, page: 1, limit: 10 },
    };
    mockLogsGet.mockResolvedValue({ data: mockData, error: null });

    const { result } = renderHook(() => useLogsQuery(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it("calls the query function with the provided params", async () => {
    mockLogsGet.mockResolvedValue({
      data: { logs: [], pageInfo: { total: 0 } },
      error: null,
    });

    const params = { level: "warn" as const };
    renderHook(() => useLogsQuery(params), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(mockLogsGet).toHaveBeenCalledOnce());
    expect(mockLogsGet).toHaveBeenCalledWith({ query: params });
  });

  it("throws with a descriptive error message when summary is present", async () => {
    mockLogsGet.mockResolvedValue({
      data: null,
      error: { status: 500, value: { summary: "Internal error" } },
    });

    const { result } = renderHook(() => useLogsQuery(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain("500");
    expect(result.current.error?.message).toContain("Internal error");
  });

  it("throws with error.value.on when summary is absent", async () => {
    mockLogsGet.mockResolvedValue({
      data: null,
      error: { status: 400, value: { on: "timestamp" } },
    });

    const { result } = renderHook(() => useLogsQuery(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain("timestamp");
  });
});

describe("useLogsCategoriesQuery", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => queryClient.clear());

  it("returns categories on success", async () => {
    const mockData = ["auth", "db", "http"];
    mockCategoriesGet.mockResolvedValue({ data: mockData, error: null });

    const { result } = renderHook(() => useLogsCategoriesQuery(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it("uses LOGS_CATEGORIES_QUERY_KEY", async () => {
    mockCategoriesGet.mockResolvedValue({ data: [], error: null });

    renderHook(() => useLogsCategoriesQuery(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(mockCategoriesGet).toHaveBeenCalledOnce());

    const queries = queryClient.getQueryCache().findAll({
      queryKey: LOGS_CATEGORIES_QUERY_KEY,
    });
    expect(queries.length).toBeGreaterThan(0);
  });

  it("throws with a descriptive error message on failure", async () => {
    mockCategoriesGet.mockResolvedValue({
      data: null,
      error: { status: 403, value: { summary: "Forbidden" } },
    });

    const { result } = renderHook(() => useLogsCategoriesQuery(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain("403");
    expect(result.current.error?.message).toContain("Forbidden");
  });
});
