"use client";

import {
  IconFileText,
  IconHome,
  IconPigMoney,
  IconSettings,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";

const mainItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: <IconHome />,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: <IconSettings />,
    items: [
      {
        title: "Logs",
        url: "/settings/logs",
        icon: <IconFileText />,
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
              <span className="text-base font-semibold">Super App</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mainItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
