import {
  IconChevronRight,
  IconFileText,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

export const Route = createFileRoute("/(app)/settings/")({
  component: RouteComponent,
});

const routes = [
  {
    title: "Logs",
    url: "/settings/logs",
    icon: <IconFileText />,
  },
];

function RouteComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your settings</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          {routes.map((route) => (
            <Item render={<Link to={route.url} />} key={route.title}>
              <ItemMedia variant="icon">{route.icon}</ItemMedia>
              <ItemContent>
                <ItemTitle>{route.title}</ItemTitle>
                <ItemDescription>Description</ItemDescription>
              </ItemContent>
              <ItemActions>
                <IconChevronRight className="size-4" />
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
