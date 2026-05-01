import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
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

const forgotPasswordSchema = v.object({
  email: v.pipe(v.string(), v.email("Please enter a valid email address")),
});

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const { error } = await authClient.requestPasswordReset({
        email: value.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setServerError(error.message ?? "Something went wrong");
        return;
      }

      setSubmitted(true);
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            {submitted
              ? "Check your email for a reset link"
              : "Enter your email and we'll send you a reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                If an account with that email exists, you will receive a
                password reset link shortly.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSubmitted(false);
                  form.reset();
                }}
              >
                Send again
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup>
                {serverError && <FieldError>{serverError}</FieldError>}
                <form.Field name="email">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        type="email"
                        placeholder="m@example.com"
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
                        {isSubmitting ? "Sending…" : "Send reset link"}
                      </Button>
                    )}
                  </form.Subscribe>
                </Field>
              </FieldGroup>
            </form>
          )}
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
