import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import * as v from "valibot";
import { UsersTable } from "@/components/tables/users-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { ensureUsers, useCreateUserMutation } from "@/queries/users";

export const Route = createFileRoute("/(app)/settings/users_")({
  loader: ({ context: { queryClient } }) => ensureUsers(queryClient),
  staticData: { breadcrumb: "Users" },
  component: RouteComponent,
});

const createUserSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, "Name is required")),
  email: v.pipe(v.string(), v.email("Please enter a valid email address")),
  password: v.pipe(
    v.string(),
    v.minLength(8, "Password must be at least 8 characters"),
  ),
  role: v.union([v.literal("user"), v.literal("admin")]),
});

function CreateUserDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createUserMutation = useCreateUserMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user" as "user" | "admin",
    },
    validators: {
      onSubmit: createUserSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await createUserMutation.mutateAsync(value);
        toast.success("User created");
        onClose();
        form.reset();
      } catch (err) {
        setServerError(
          err instanceof Error ? err.message : "Failed to create user",
        );
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-4">
            {serverError && <FieldError>{serverError}</FieldError>}
            <form.Field name="name">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    id={field.name}
                    type="text"
                    placeholder="John Doe"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {!field.state.meta.isValid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            </form.Field>
            <form.Field name="email">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    type="email"
                    placeholder="user@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {!field.state.meta.isValid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            </form.Field>
            <form.Field name="password">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    id={field.name}
                    type="password"
                    placeholder="••••••••"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {!field.state.meta.isValid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            </form.Field>
            <form.Field name="role">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) =>
                      field.handleChange(val as "user" | "admin")
                    }
                  >
                    <SelectTrigger id={field.name}>
                      {field.state.value}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">user</SelectItem>
                      <SelectItem value="admin">admin</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner />}
                  {isSubmitting ? "Creating..." : "Create user"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RouteComponent() {
  const { data: session } = authClient.useSession();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable
            currentUserId={session?.user?.id}
            onCreateUser={() => setDialogOpen(true)}
          />
        </CardContent>
      </Card>
      <CreateUserDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
