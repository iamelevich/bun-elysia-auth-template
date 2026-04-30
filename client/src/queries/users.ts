import type { QueryClient } from "@tanstack/react-query";
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
};

export type UsersQueryParams = {
  limit?: number;
  offset?: number;
  search?: string;
};

export const USERS_QUERY_KEY = ["users"] as const;

export function usersQueryOptions(params: UsersQueryParams = {}) {
  const { limit = 20, offset = 0, search } = params;
  return queryOptions({
    queryKey: [...USERS_QUERY_KEY, { limit, offset, search }],
    queryFn: async () => {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          limit,
          offset,
          ...(search
            ? {
                searchValue: search,
                searchField: "email",
                searchOperator: "contains",
              }
            : {}),
        },
      });
      if (error) throw new Error(error.message);
      return data as { users: AdminUser[]; total: number };
    },
  });
}

export function useUsersQuery(params: UsersQueryParams = {}) {
  return useQuery(usersQueryOptions(params));
}

export function ensureUsers(
  queryClient: QueryClient,
  params: UsersQueryParams = {},
) {
  return queryClient.ensureQueryData(usersQueryOptions(params));
}

export function useSetRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "user" | "admin";
    }) => {
      const { error } = await authClient.admin.setRole({ userId, role });
      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}

export function useBanUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await authClient.admin.banUser({ userId });
      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}

export function useUnbanUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await authClient.admin.unbanUser({ userId });
      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      email,
      password,
      name,
      role,
    }: {
      email: string;
      password: string;
      name: string;
      role: "user" | "admin";
    }) => {
      const { error } = await authClient.admin.createUser({
        email,
        password,
        name,
        role,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}
