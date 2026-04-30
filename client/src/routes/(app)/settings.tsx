import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/settings")({
	component: SettingsLayout,
	staticData: { breadcrumb: "Settings" },
});

function SettingsLayout() {
	return <Outlet />;
}
