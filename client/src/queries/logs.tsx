import {
  keepPreviousData,
  QueryClient,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { app } from "@/lib/app";

export const LOGS_QUERY_KEY = ["logs"];
export const LOGS_CATEGORIES_QUERY_KEY = ["logs", "categories"];

export type LogsQueryParams = NonNullable<
  Parameters<typeof app.api.logs.get>[0]
>["query"];

const logsQueryOptions = (params: LogsQueryParams = {}) =>
  queryOptions({
    queryKey: [...LOGS_QUERY_KEY, params],
    queryFn: async () => {
      const { data, error } = await app.api.logs.get({ query: params });
      if (error) {
        throw new Error(
          `${error.status} - ${error.value.summary ?? error.value.on}`,
        );
      }
      return data;
    },
  });

export type LogsData = Awaited<ReturnType<typeof app.api.logs.get>>["data"];
export type Log = NonNullable<LogsData>["logs"][number];
export type LogsPageInfo = NonNullable<LogsData>["pageInfo"];

export const ensureLogs = (
  queryClient: QueryClient,
  params: LogsQueryParams = {},
) => {
  return queryClient.ensureQueryData(logsQueryOptions(params));
};

export const useLogsQuery = (params: LogsQueryParams = {}) => {
  return useQuery({
    ...logsQueryOptions(params),
    placeholderData: keepPreviousData,
  });
};

const logsCategoriesQueryOptions = () =>
  queryOptions({
    queryKey: LOGS_CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await app.api.logs.categories.get();
      if (error) {
        throw new Error(
          `${error.status} - ${error.value.summary ?? error.value.on}`,
        );
      }
      return data;
    },
  });

export const ensureLogsCategories = (queryClient: QueryClient) => {
  return queryClient.ensureQueryData(logsCategoriesQueryOptions());
};

export const useLogsCategoriesQuery = () => {
  return useQuery(logsCategoriesQueryOptions());
};
