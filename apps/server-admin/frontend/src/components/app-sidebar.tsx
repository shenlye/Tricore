import { FileText, LayoutDashboard, Users } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "概览", url: "/dashboard", icon: LayoutDashboard },
  { title: "文章管理", url: "/dashboard/posts", icon: FileText },
  { title: "用户管理", url: "/dashboard/users", icon: Users },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup className="">
          <SidebarGroupLabel>管理后台</SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item) => {
              return (
                <SidebarMenuItem
                  key={item.title}
                >
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
