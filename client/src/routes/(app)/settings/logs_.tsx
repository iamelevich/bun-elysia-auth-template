import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogsTable } from "@/components/tables/logs-table";
import {
  type LogsSearch,
  type LogsSearchLimit,
  logsSearchSchema,
} from "@/components/tables/logs-table/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ensureLogs,
  ensureLogsCategories,
  type LogsQueryParams,
  useLogsQuery,
} from "@/queries/logs";

export const Route = createFileRoute("/(app)/settings/logs_")({
  validateSearch: logsSearchSchema,
  loaderDeps: ({ search }) => search,
  component: RouteComponent,
  staticData: { breadcrumb: "Logs" },
  loader: async ({ context: { queryClient }, deps }) => {
    await Promise.all([
      ensureLogs(queryClient, { ...deps }),
      ensureLogsCategories(queryClient),
    ]);
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const search: LogsSearch = Route.useSearch() ?? {};
  const queryParams: LogsQueryParams = {
    page: search.page,
    limit: search.limit,
    message: search.message,
    level: search.level,
    category: search.category,
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
  };
  const { data: logsData } = useLogsQuery(queryParams);

  const updateSearch = (updates: Partial<LogsSearch>) => {
    navigate({
      to: ".",
      search: { ...search, ...updates },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs</CardTitle>
        <CardDescription>
          View and filter application logs for debugging
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LogsTable
          logsData={logsData}
          message={search.message}
          level={search.level}
          category={search.category}
          sortBy={search.sortBy}
          sortOrder={search.sortOrder}
          onPageChange={(page) => updateSearch({ page })}
          onLimitChange={(limit) =>
            updateSearch({ limit: limit as LogsSearchLimit, page: 1 })
          }
          onMessageChange={(message) =>
            updateSearch({ message: message || undefined, page: 1 })
          }
          onLevelChange={(level) =>
            updateSearch({
              level: level as LogsSearch["level"],
              page: 1,
            })
          }
          onCategoryChange={(category) =>
            updateSearch({
              category: category || undefined,
              page: 1,
            })
          }
          onSortChange={(sortBy, sortOrder) =>
            updateSearch({
              sortBy: sortBy as LogsSearch["sortBy"],
              sortOrder: sortOrder as LogsSearch["sortOrder"],
            })
          }
        />
      </CardContent>
    </Card>
  );
}
