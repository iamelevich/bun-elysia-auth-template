import { createFileRoute } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/(app)/")({
	component: Index,
	staticData: { breadcrumb: "Home" },
});

function Index() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Home</CardTitle>
				<CardDescription>Welcome to the home page</CardDescription>
			</CardHeader>
			<CardContent>Welcome to the home page!</CardContent>
		</Card>
	)
}
