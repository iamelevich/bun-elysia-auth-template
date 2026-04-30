import type { PageInfo } from "@app/server";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_PAGE_INFO: PageInfo = {
  total: 0,
  page: 1,
  limit: 50,
  hasNextPage: false,
  hasPreviousPage: false,
};

export interface PaginationBarProps {
  pageInfo?: PageInfo;
  itemLabel: string;
  limitOptions: readonly number[];
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function PaginationInfo({
  pageInfo = DEFAULT_PAGE_INFO,
  itemLabel,
  limitOptions,
  onLimitChange,
}: Omit<PaginationBarProps, "onPageChange">) {
  const startItem = (pageInfo.page - 1) * pageInfo.limit + 1;
  const endItem = Math.min(pageInfo.page * pageInfo.limit, pageInfo.total);

  return (
    <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
      <span>
        Showing {startItem}–{endItem} of {pageInfo.total} {itemLabel}
      </span>
      {onLimitChange && (
        <div className="flex items-center gap-2">
          <span>Per page</span>
          <Select
            value={String(pageInfo.limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger size="sm" className="w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

export function PaginationControls({
  pageInfo = DEFAULT_PAGE_INFO,
  onPageChange,
}: Pick<PaginationBarProps, "pageInfo" | "onPageChange">) {
  const totalPages = Math.ceil(pageInfo.total / pageInfo.limit) || 1;
  const showPagination = onPageChange && pageInfo.total > pageInfo.limit;

  if (!showPagination) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="ghost"
            size="default"
            className="pl-1.5"
            onClick={() =>
              pageInfo.hasPreviousPage && onPageChange?.(pageInfo.page - 1)
            }
            disabled={!pageInfo.hasPreviousPage}
          >
            <IconChevronLeft data-icon="inline-start" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
        </PaginationItem>
        <PaginationItem>
          <span className="px-2 text-xs">
            Page {pageInfo.page} of {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant="ghost"
            size="default"
            className="pr-1.5"
            onClick={() =>
              pageInfo.hasNextPage && onPageChange?.(pageInfo.page + 1)
            }
            disabled={!pageInfo.hasNextPage}
          >
            <span className="hidden sm:inline">Next</span>
            <IconChevronRight data-icon="inline-end" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function PaginationBar(props: PaginationBarProps) {
  return (
    <>
      <PaginationInfo {...props} />
      <PaginationControls {...props} />
    </>
  );
}
