import { IconBan, IconCircleCheck } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { AdminUser } from "@/queries/users";

const ROLES = ["user", "admin"] as const;

export function createUsersColumns({
  onSetRole,
  onToggleBan,
  currentUserId,
}: {
  onSetRole: (userId: string, role: string) => void;
  onToggleBan: (userId: string, isBanned: boolean) => void;
  currentUserId?: string;
}): ColumnDef<AdminUser>[] {
  return [
    {
      accessorKey: "name",
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      id: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: "role",
      id: "role",
      header: "Role",
      cell: ({ row }) => {
        const user = row.original;
        const isCurrentUser = user.id === currentUserId;
        return (
          <Select
            value={user.role ?? "user"}
            onValueChange={(role) => onSetRole(user.id, role)}
            disabled={isCurrentUser}
          >
            <SelectTrigger size="sm" className="w-24">
              {user.role ?? "user"}
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const { banned } = row.original;
        return banned ? (
          <Badge variant="destructive">Banned</Badge>
        ) : (
          <Badge variant="secondary">Active</Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const user = row.original;
        const isCurrentUser = user.id === currentUserId;
        const isBanned = !!user.banned;
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              disabled={isCurrentUser}
              onClick={() => onToggleBan(user.id, isBanned)}
              title={isBanned ? "Enable user" : "Disable user"}
            >
              {isBanned ? <IconCircleCheck /> : <IconBan />}
            </Button>
          </div>
        );
      },
      meta: { className: "w-12" },
    },
  ];
}
