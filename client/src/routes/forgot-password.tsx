import { createFileRoute, redirect } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/forgot-password")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (session) {
      throw redirect({ to: "/" });
    }
  },
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
