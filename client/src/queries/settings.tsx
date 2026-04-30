import {
  QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { app } from "@/lib/app";

export const SETTINGS_QUERY_KEY = ["settings"];
export const REGISTRATION_DISABLED_KEY = [
  "settings",
  "auth.disable_registration",
];

const settingsQueryOptions = () =>
  queryOptions({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await app.api.settings.get();
      if (error) throw new Error(`${error.status}`);
      return data ?? [];
    },
  });

export const ensureSettings = (queryClient: QueryClient) =>
  queryClient.ensureQueryData(settingsQueryOptions());

export const useSettingsQuery = () => useQuery(settingsQueryOptions());

export type Setting = NonNullable<
  Awaited<ReturnType<typeof app.api.settings.get>>["data"]
>[number];

const registrationDisabledQueryOptions = () =>
  queryOptions({
    queryKey: REGISTRATION_DISABLED_KEY,
    queryFn: async () => {
      const { data, error } = await app.api
        .settings({
          key: "auth.disable_registration",
        })
        .get();
      if (error) {
        if (error.status === 404) return false;
        throw new Error(`${error.status} - ${error.value}`);
      }
      return data.value === "true";
    },
    staleTime: 30_000,
  });

export const ensureRegistrationDisabled = (queryClient: QueryClient) =>
  queryClient.ensureQueryData(registrationDisabledQueryOptions());

export const useIsRegistrationDisabledQuery = () =>
  useQuery(registrationDisabledQueryOptions());

export const fetchIsRegistrationDisabled = async (
  queryClient: QueryClient,
): Promise<boolean> =>
  queryClient.fetchQuery(registrationDisabledQueryOptions());

export const useSettingsBatchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entries: { key: string; value: string }[]) => {
      const { data, error } = await app.api.settings.batch.patch(entries);
      if (error) throw new Error(`${error.status}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
};
