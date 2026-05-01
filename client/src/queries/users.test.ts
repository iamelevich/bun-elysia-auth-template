import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  USERS_QUERY_KEY,
  useBanUserMutation,
  useCreateUserMutation,
  usersQueryOptions,
  useSetRoleMutation,
  useUnbanUserMutation,
  useUsersQuery,
} from "./users";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    admin: {
      listUsers: vi.fn(),
      setRole: vi.fn(),
      banUser: vi.fn(),
      unbanUser: vi.fn(),
      createUser: vi.fn(),
    },
  },
}));

import { authClient } from "@/lib/auth-client";

const adminMock = authClient.admin as unknown as {
  listUsers: ReturnType<typeof vi.fn>;
  setRole: ReturnType<typeof vi.fn>;
  banUser: ReturnType<typeof vi.fn>;
  unbanUser: ReturnType<typeof vi.fn>;
  createUser: ReturnType<typeof vi.fn>;
};

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe("usersQueryOptions", () => {
  it("produces default query key with defaults", () => {
    const opts = usersQueryOptions();
    expect(opts.queryKey).toEqual([
      ...USERS_QUERY_KEY,
      { limit: 20, offset: 0, search: undefined },
    ]);
  });

  it("includes provided params in the query key", () => {
    const opts = usersQueryOptions({ limit: 10, offset: 5, search: "alice" });
    expect(opts.queryKey).toEqual([
      ...USERS_QUERY_KEY,
      { limit: 10, offset: 5, search: "alice" },
    ]);
  });
});

describe("useUsersQuery", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("returns data on success", async () => {
    const mockData = { users: [{ id: "1", name: "Alice" }], total: 1 };
    adminMock.listUsers.mockResolvedValue({ data: mockData, error: null });

    const { result } = renderHook(() => useUsersQuery(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it("throws when the response contains an error", async () => {
    adminMock.listUsers.mockResolvedValue({
      data: null,
      error: { message: "Unauthorized" },
    });

    const { result } = renderHook(() => useUsersQuery(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Unauthorized");
  });
});

describe("useSetRoleMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
    vi.clearAllMocks();
  });

  it("calls authClient.admin.setRole with correct args", async () => {
    adminMock.setRole.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useSetRoleMutation(), {
      wrapper: makeWrapper(queryClient),
    });

    await result.current.mutateAsync({ userId: "u1", role: "admin" });

    expect(adminMock.setRole).toHaveBeenCalledWith({
      userId: "u1",
      role: "admin",
    });
  });

  it("throws when setRole returns an error", async () => {
    adminMock.setRole.mockResolvedValue({ error: { message: "Forbidden" } });

    const { result } = renderHook(() => useSetRoleMutation(), {
      wrapper: makeWrapper(queryClient),
    });

    await expect(
      result.current.mutateAsync({ userId: "u1", role: "user" }),
    ).rejects.toThrow("Forbidden");
  });

  it("invalidates USERS_QUERY_KEY on success", async () => {
    adminMock.setRole.mockResolvedValue({ error: null });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSetRoleMutation(), {
      wrapper: makeWrapper(queryClient),
    });

    await result.current.mutateAsync({ userId: "u1", role: "admin" });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USERS_QUERY_KEY });
  });
});

describe("useBanUserMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
    vi.clearAllMocks();
  });

  it("calls authClient.admin.banUser with the userId", async () => {
    adminMock.banUser.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useBanUserMutation(), {
      wrapper: makeWrapper(queryClient),
    });

    await result.current.mutateAsync("u2");
    expect(adminMock.banUser).toHaveBeenCalledWith({ userId: "u2" });
  });

  it("throws when banUser returns an error", async () => {
    adminMock.banUser.mockResolvedValue({ error: { message: "Not found" } });

    const { result } = renderHook(() => useBanUserMutation(), {
      wrapper: makeWrapper(queryClient),
    });

    await expect(result.current.mutateAsync("u2")).rejects.toThrow("Not found");
  });
});

describe("useUnbanUserMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
    vi.clearAllMocks();
  });

  it("calls authClient.admin.unbanUser with the userId", async () => {
    adminMock.unbanUser.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useUnbanUserMutation(), {
      wrapper: makeWrapper(queryClient),
    });

    await result.current.mutateAsync("u3");
    expect(adminMock.unbanUser).toHaveBeenCalledWith({ userId: "u3" });
  });

  it("invalidates USERS_QUERY_KEY on success", async () => {
    adminMock.unbanUser.mockResolvedValue({ error: null });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUnbanUserMutation(), {
      wrapper: makeWrapper(queryClient),
    });

    await result.current.mutateAsync("u3");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: USERS_QUERY_KEY });
  });
});

describe("useCreateUserMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeQueryClient();
    vi.clearAllMocks();
  });

  it("calls authClient.admin.createUser with all fields", async () => {
    adminMock.createUser.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useCreateUserMutation(), {
      wrapper: makeWrapper(queryClient),
    });

    await result.current.mutateAsync({
      email: "new@example.com",
      password: "secret",
      name: "New User",
      role: "user",
    });

    expect(adminMock.createUser).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "secret",
      name: "New User",
      role: "user",
    });
  });

  it("throws when createUser returns an error", async () => {
    adminMock.createUser.mockResolvedValue({
      error: { message: "Email taken" },
    });

    const { result } = renderHook(() => useCreateUserMutation(), {
      wrapper: makeWrapper(queryClient),
    });

    await expect(
      result.current.mutateAsync({
        email: "dup@example.com",
        password: "secret",
        name: "Dup",
        role: "user",
      }),
    ).rejects.toThrow("Email taken");
  });
});
