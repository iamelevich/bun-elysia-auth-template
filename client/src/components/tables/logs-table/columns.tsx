import { IconArrowDown, IconArrowUp, IconEyeDown } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatToLocaleString } from "@/lib/date";
import type { Log } from "@/queries/logs";
import { SORT_COLUMNS } from "./schema";

type SortableColumn = (typeof SORT_COLUMNS)[number];

function SortableHeader({
  label,
  columnId,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: string;
  columnId: SortableColumn;
  sortBy?: SortableColumn;
  sortOrder?: "asc" | "desc";
  onSort?: (column: SortableColumn) => void;
}) {
  const isSorted = sortBy === columnId;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-8 hover:bg-muted"
      onClick={() => onSort?.(columnId)}
    >
      {label}
      {isSorted && (
        <span className="ml-1 inline-flex">
          {sortOrder === "asc" ? (
            <IconArrowUp className="size-3.5" />
          ) : (
            <IconArrowDown className="size-3.5" />
          )}
        </span>
      )}
    </Button>
  );
}

function levelBadgeVariant(
  level: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (level) {
    case "error":
      return "destructive";
    case "warn":
      return "default";
    case "info":
      return "secondary";
    default:
      return "outline";
  }
}

export function createLogsColumns({
  sortBy,
  sortOrder,
  onHeaderSort,
}: {
  sortBy?: SortableColumn;
  sortOrder?: "asc" | "desc";
  onHeaderSort?: (columnId: SortableColumn) => void;
}): ColumnDef<Log>[] {
  return [
    {
      accessorKey: "timestamp",
      id: "timestamp",
      header: () => (
        <SortableHeader
          label="Timestamp"
          columnId="timestamp"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onHeaderSort}
        />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {formatToLocaleString(row.original.timestamp)}
        </span>
      ),
    },
    {
      accessorKey: "level",
      id: "level",
      header: () => (
        <SortableHeader
          label="Level"
          columnId="level"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onHeaderSort}
        />
      ),
      cell: ({ row }) => (
        <Badge variant={levelBadgeVariant(row.original.level)}>
          {row.original.level}
        </Badge>
      ),
    },
    {
      accessorKey: "category",
      id: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {row.original.category ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "message",
      id: "message",
      header: () => (
        <SortableHeader
          label="Message"
          columnId="message"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onHeaderSort}
        />
      ),
      cell: ({ row }) => (
        <span className="max-w-xs truncate font-mono text-xs">
          {row.original.message}
        </span>
      ),
    },
    {
      accessorKey: "data",
      id: "data",
      header: () => <span className="text-right block">Data</span>,
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div className="text-right">
            {log.data ? (
              <Collapsible>
                <CollapsibleTrigger
                  render={
                    <Button variant="ghost" size="icon">
                      <IconEyeDown />
                    </Button>
                  }
                />
                <CollapsibleContent className="text-left">
                  <pre className="mt-2 max-h-64 overflow-auto rounded border bg-muted/50 p-2 text-xs">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        );
      },
    },
  ];
}
