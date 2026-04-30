import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import * as v from "valibot";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const resetPasswordSchema = v.pipe(
  v.object({
    password: v.pipe(
      v.string(),
      v.minLength(8, "Password must be at least 8 characters"),
    ),
    confirmPassword: v.pipe(
      v.string(),
      v.minLength(1, "Please confirm your password"),
    ),
  }),
  v.forward(
    v.partialCheck(
      [["password"], ["confirmPassword"]],
      (input) => input.password === input.confirmPassword,
      "Passwords do not match",
    ),
    ["confirmPassword"],
  ),
);

export function ResetPasswordForm({
  token,
  className,
  ...props
}: React.ComponentProps<"div"> & { token: string }) {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const { error } = await authClient.resetPassword({
        newPassword: value.password,
        token,
      });

      if (error) {
        setServerError(error.message ?? "Failed to reset password");
        return;
      }

      navigate({ to: "/login" });
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter a new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              {serverError && <FieldError>{serverError}</FieldError>}
              <form.Field name="password">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                    <Input
                      id={field.name}
                      type="password"
                      placeholder="********"
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
              <form.Field name="confirmPassword">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Confirm new password
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="password"
                      placeholder="********"
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
              <Field>
                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Resetting…" : "Reset password"}
                    </Button>
                  )}
                </form.Subscribe>
              </Field>
            </FieldGroup>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link to="/login" className="underline underline-offset-4">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
