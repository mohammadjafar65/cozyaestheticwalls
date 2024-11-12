import {
  Calendar,
  Monitor,
  Tablet,
  Home,
  Smartphone,
  Inbox,
  Search,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Phone",
    url: "/",
    icon: Smartphone,
  },
  {
    title: "Desktop",
    url: "/desktop",
    icon: Monitor,
  },
  {
    title: "Tablet",
    url: "/tablet",
    icon: Tablet,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent className="p-4">
        <div className="flex flex-col items-center gap-5 bg-[#F39F5A] py-4 rounded-[10px]">
          <img
            src="../logo.png"
            className="w-6"
            alt="Cozy Aesthetic Wallpaper"
          />
          <h1>Cozy Aesthetic Wallpaper</h1>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="mb-1">Device</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
