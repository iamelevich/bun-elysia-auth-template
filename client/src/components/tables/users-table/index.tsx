import { IconUserPlus } from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useBanUserMutation,
  useSetRoleMutation,
  useUnbanUserMutation,
  useUsersQuery,
} from "@/queries/users";
import {
  DataTable,
  PaginationControls,
  PaginationInfo,
  SearchFilter,
} from "../shared";
import { createUsersColumns } from "./columns";

const LIMIT_OPTIONS = [10, 20, 50] as const;

export function UsersTable({
  currentUserId,
  onCreateUser,
}: {
  currentUserId?: string;
  onCreateUser?: () => void;
}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(20);
  const [search, setSearch] = useState("");

  const offset = (page - 1) * limit;
  const { data } = useUsersQuery({ limit, offset, search });

  const setRoleMutation = useSetRoleMutation();
  const banMutation = useBanUserMutation();
  const unbanMutation = useUnbanUserMutation();

  const handleSetRole = useCallback(
    (userId: string, role: string) => {
      setRoleMutation.mutate(
        { userId, role },
        {
          onError: (err) => toast.error(err.message),
          onSuccess: () => toast.success("Role updated"),
        },
      );
    },
    [setRoleMutation],
  );

  const handleToggleBan = useCallback(
    (userId: string, isBanned: boolean) => {
      if (isBanned) {
        unbanMutation.mutate(userId, {
          onError: (err) => toast.error(err.message),
          onSuccess: () => toast.success("User enabled"),
        });
      } else {
        banMutation.mutate(userId, {
          onError: (err) => toast.error(err.message),
          onSuccess: () => toast.success("User disabled"),
        });
      }
    },
    [banMutation, unbanMutation],
  );

  const columns = useMemo(
    () =>
      createUsersColumns({
        onSetRole: handleSetRole,
        onToggleBan: handleToggleBan,
        currentUserId,
      }),
    [handleSetRole, handleToggleBan, currentUserId],
  );

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  const pageInfo = {
    total,
    page,
    limit,
    hasNextPage: offset + limit < total,
    hasPreviousPage: page > 1,
  };

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchFilter
            value={search}
            onChange={handleSearch}
            placeholder="Search by email..."
          />
        </div>
        <div className="flex items-center gap-4">
          <PaginationInfo
            pageInfo={pageInfo}
            itemLabel="users"
            limitOptions={LIMIT_OPTIONS}
            onLimitChange={handleLimitChange}
          />
          {onCreateUser && (
            <Button size="sm" onClick={onCreateUser}>
              <IconUserPlus />
              Create User
            </Button>
          )}
        </div>
      </div>
      <DataTable columns={columns} data={users} />
      <PaginationControls pageInfo={pageInfo} onPageChange={setPage} />
    </div>
  );
}
