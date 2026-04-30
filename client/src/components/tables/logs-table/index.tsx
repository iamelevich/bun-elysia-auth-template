import { IconSearch } from "@tabler/icons-react";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useEffect, useMemo, useState } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { LogsData, LogsPageInfo } from "@/queries/logs";
import { useLogsCategoriesQuery } from "@/queries/logs";
import {
  DataTable,
  PaginationControls,
  PaginationInfo,
  SearchFilter,
} from "../shared";
import { createLogsColumns } from "./columns";
import { LIMIT_OPTIONS, LOG_LEVELS, type LogsSearchLimit } from "./schema";

export function LogsTable({
  logsData,
  message = "",
  level,
  category,
  sortBy = "timestamp",
  sortOrder = "desc",
  onPageChange,
  onLimitChange,
  onMessageChange,
  onLevelChange,
  onCategoryChange,
  onSortChange,
}: {
  logsData: LogsData | null | undefined;
  message?: string;
  level?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: string;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: LogsSearchLimit) => void;
  onMessageChange?: (message: string) => void;
  onLevelChange?: (level: string | undefined) => void;
  onCategoryChange?: (category: string | undefined) => void;
  onSortChange?: (sortBy: string, sortOrder: string) => void;
}) {
  const { data: logCategories = [] } = useLogsCategoriesQuery();
  const [messageInput, setMessageInput] = useState(message);
  const [debouncedMessage] = useDebouncedValue(messageInput, { wait: 300 });

  useEffect(() => {
    setMessageInput(message);
  }, [message]);

  useEffect(() => {
    if (debouncedMessage !== message) {
      onMessageChange?.(debouncedMessage);
    }
  }, [debouncedMessage, message, onMessageChange]);

  const handleHeaderSort = useMemo(() => {
    if (!onSortChange) return undefined;
    return (columnId: string) => {
      const newSortOrder =
        columnId === sortBy && sortOrder === "asc" ? "desc" : "asc";
      onSortChange(columnId, newSortOrder);
    };
  }, [sortBy, sortOrder, onSortChange]);

  const columns = useMemo(
    () =>
      createLogsColumns({
        sortBy: sortBy as "timestamp" | "level" | "message" | "id" | undefined,
        sortOrder: sortOrder as "asc" | "desc",
        onHeaderSort: handleHeaderSort,
      }),
    [sortBy, sortOrder, handleHeaderSort],
  );

  if (!logsData) {
    return null;
  }

  const logs = logsData.logs;
  const pageInfo: LogsPageInfo = logsData.pageInfo;

  if (logs.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {onMessageChange && (
            <SearchFilter
              value={messageInput}
              onChange={setMessageInput}
              placeholder="Filter by message..."
            />
          )}
          {onLevelChange && (
            <Select
              value={level ?? "all"}
              onValueChange={(v) =>
                onLevelChange(v === "all" || !v ? undefined : v)
              }
            >
              <SelectTrigger size="sm" className="w-28">
                {level === "all" || !level ? "All levels" : level}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                {LOG_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {onCategoryChange && (
            <Select
              value={category ?? "all"}
              onValueChange={(v) =>
                onCategoryChange(v === "all" || !v ? undefined : v)
              }
            >
              <SelectTrigger size="sm" className="w-32">
                {!category || category === "all" ? "All categories" : category}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {logCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconSearch />
            </EmptyMedia>
            <EmptyTitle>No logs</EmptyTitle>
            <EmptyDescription>
              {message || level || category
                ? "No logs match your filters. Try adjusting filters."
                : "No logs found."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent />
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {onMessageChange && (
            <SearchFilter
              value={messageInput}
              onChange={setMessageInput}
              placeholder="Filter by message..."
            />
          )}
          {onLevelChange && (
            <Select
              value={level ?? "all"}
              onValueChange={(v) =>
                onLevelChange(v === "all" || !v ? undefined : v)
              }
            >
              <SelectTrigger size="sm" className="w-28">
                {level === "all" || !level ? "All levels" : level}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                {LOG_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {onCategoryChange && (
            <Select
              value={category ?? "all"}
              onValueChange={(v) =>
                onCategoryChange(v === "all" || !v ? undefined : v)
              }
            >
              <SelectTrigger size="sm" className="min-w-32">
                {category === "all" || !category ? "All categories" : category}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {logCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <PaginationInfo
          pageInfo={pageInfo}
          itemLabel="logs"
          limitOptions={LIMIT_OPTIONS}
          onLimitChange={
            onLimitChange
              ? (limit) => onLimitChange(limit as LogsSearchLimit)
              : undefined
          }
        />
      </div>
      <DataTable columns={columns} data={logs} />
      <PaginationControls pageInfo={pageInfo} onPageChange={onPageChange} />
    </div>
  );
}
