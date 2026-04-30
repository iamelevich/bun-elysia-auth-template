import { createFileRoute, redirect } from "@tanstack/react-router";
import * as v from "valibot";
import { ResetPasswordForm } from "@/components/reset-password-form";

const resetPasswordSearchSchema = v.object({
  token: v.pipe(v.string(), v.minLength(1)),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search) => {
    const result = v.safeParse(resetPasswordSearchSchema, search);
    if (!result.success) {
      throw redirect({ to: "/forgot-password" });
    }
    return result.output;
  },
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
