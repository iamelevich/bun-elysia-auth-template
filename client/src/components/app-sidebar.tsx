"use client";

import {
  IconHome,
  IconLogout,
  IconPigMoney,
  IconSettings,
} from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { NavMain } from "./nav-main";

const baseItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: <IconHome />,
  },
];

const adminItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: <IconSettings />,
    items: [
      {
        title: "Auth",
        url: "/settings/auth",
      },
      {
        title: "Users",
        url: "/settings/users",
      },
      {
        title: "Logs",
        url: "/settings/logs",
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "admin";
  const items = isAdmin ? [...baseItems, ...adminItems] : baseItems;

  const handleLogout = async () => {
    await authClient.signOut();
    navigate({ to: "/login" });
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/" />}
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <IconPigMoney className="size-5!" />
              <span className="text-base font-semibold">
                Super App{" "}
                <span className="text-xs text-muted-foreground">
                  {isAdmin ? "Admin" : "User"}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <IconLogout />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
