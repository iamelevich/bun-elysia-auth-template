import { createFileRoute, redirect } from "@tanstack/react-router";
import { RegisterForm } from "@/components/register-form";
import { authClient } from "@/lib/auth-client";
import { fetchIsRegistrationDisabled } from "@/queries/settings";

export const Route = createFileRoute("/register")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const { data: session } = await authClient.getSession();
    if (session) throw redirect({ to: "/" });

    const isDisabled = await fetchIsRegistrationDisabled(queryClient);
    if (isDisabled) throw redirect({ to: "/login" });
  },
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
