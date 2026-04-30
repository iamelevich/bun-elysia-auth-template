import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(app)/settings")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (session?.user?.role !== "admin") {
      throw redirect({ to: "/" });
    }
  },
  staticData: { breadcrumb: "Settings" },
  component: SettingsLayout,
});

function SettingsLayout() {
  return <Outlet />;
}
