import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  REGISTRATION_DISABLED_KEY,
  SETTINGS_QUERY_KEY,
  useIsRegistrationDisabledQuery,
  useSettingsBatchMutation,
  useSettingsQuery,
} from "./settings";

const { mockSettingsGet, mockSettingKeyGet, mockBatchPatch } = vi.hoisted(
  () => ({
    mockSettingsGet: vi.fn(),
    mockSettingKeyGet: vi.fn(),
    mockBatchPatch: vi.fn(),
  }),
);

vi.mock("@/lib/app", () => ({
  app: {
    api: {
      settings: Object.assign(
        vi.fn(() => ({
          get: mockSettingKeyGet,
        })),
        {
          get: mockSettingsGet,
          batch: {
            patch: mockBatchPatch,
          },
        },
      ),
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

describe("SETTINGS_QUERY_KEY and REGISTRATION_DISABLED_KEY", () => {
  it("has the expected key values", () => {
    expect(SETTINGS_QUERY_KEY).toEqual(["settings"]);
    expect(REGISTRATION_DISABLED_KEY).toEqual([
      "settings",
      "auth.disable_registration",
    ]);
  });
});

describe("useSettingsQuery", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => queryClient.clear());

  it("returns data on success", async () => {
    const mockData = [{ key: "site_name", value: "My App" }];
    mockSettingsGet.mockResolvedValue({ data: mockData, error: null });

    const { result } = renderHook(() => useSettingsQuery(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it("returns empty array when data is null", async () => {
    mockSettingsGet.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useSettingsQuery(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("throws when the response has an error status", async () => {
    mockSettingsGet.mockResolvedValue({ data: null, error: { status: 403 } });

    const { result } = renderHook(() => useSettingsQuery(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("403");
  });
});

describe("useIsRegistrationDisabledQuery", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => queryClient.clear());

  it("returns false when the setting is not found (404)", async () => {
    mockSettingKeyGet.mockResolvedValue({
      data: null,
      error: { status: 404, value: "Not found" },
    });

    const { result } = renderHook(() => useIsRegistrationDisabledQuery(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it("returns true when setting value is 'true'", async () => {
    mockSettingKeyGet.mockResolvedValue({
      data: { value: "true" },
      error: null,
    });

    const { result } = renderHook(() => useIsRegistrationDisabledQuery(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });

  it("returns false when setting value is 'false'", async () => {
    mockSettingKeyGet.mockResolvedValue({
      data: { value: "false" },
      error: null,
    });

    const { result } = renderHook(() => useIsRegistrationDisabledQuery(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it("throws on non-404 errors", async () => {
    mockSettingKeyGet.mockResolvedValue({
      data: null,
      error: { status: 500, value: { summary: "Server error" } },
    });

    const { result } = renderHook(() => useIsRegistrationDisabledQuery(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain("500");
  });
});

describe("useSettingsBatchMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
    vi.clearAllMocks();
  });

  it("calls app.api.settings.batch.patch with entries", async () => {
    const mockData = [{ key: "foo", value: "bar" }];
    mockBatchPatch.mockResolvedValue({ data: mockData, error: null });

    const { result } = renderHook(() => useSettingsBatchMutation(), {
      wrapper: makeWrapper(queryClient),
    });

    const entries = [{ key: "site_name", value: "New Name" }];
    await result.current.mutateAsync(entries);

    expect(mockBatchPatch).toHaveBeenCalledWith(entries);
  });

  it("throws when batch patch returns an error", async () => {
    mockBatchPatch.mockResolvedValue({ data: null, error: { status: 422 } });

    const { result } = renderHook(() => useSettingsBatchMutation(), {
      wrapper: makeWrapper(queryClient),
    });

    await expect(
      result.current.mutateAsync([{ key: "foo", value: "bar" }]),
    ).rejects.toThrow("422");
  });

  it("invalidates SETTINGS_QUERY_KEY on success", async () => {
    mockBatchPatch.mockResolvedValue({ data: [], error: null });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSettingsBatchMutation(), {
      wrapper: makeWrapper(queryClient),
    });

    await result.current.mutateAsync([{ key: "k", value: "v" }]);

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: SETTINGS_QUERY_KEY,
    });
  });
});
