import {
  IconChevronRight,
  IconFileText,
  IconShieldLock,
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
    title: "Auth",
    url: "/settings/auth",
    icon: <IconShieldLock />,
    description: "Authentication and registration settings",
  },
  {
    title: "Logs",
    url: "/settings/logs",
    icon: <IconFileText />,
    description: "View and filter application logs",
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
                <ItemDescription>{route.description}</ItemDescription>
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
