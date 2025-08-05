import * as React from "react";
import { Link } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// Updated data structure for the sidebar menu with correct paths
const navItems = [
  {
    title: "Dashboard",
    url: "/",
    isActive: true, // Example: Set Dashboard as active by default
  },
  {
    title: "Boletas",
    url: "/boletas",
  },
  {
    title: "Producto",
    url: "/producto",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* You can add a logo or a title here if you want */}
        <h2 className="text-lg font-semibold">Frutería Zenaida</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={item.isActive}>
                <Link to={item.url}>{item.title}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
