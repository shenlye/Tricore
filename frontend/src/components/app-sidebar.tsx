import { LayoutDashboard, Users } from "lucide-react";
import { useLocation } from "react-router-dom";
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
	{ title: "用户管理", url: "/dashboard/users", icon: Users },
];

export function AppSidebar() {
	const { pathname } = useLocation();
	return (
		<Sidebar collapsible="icon">
			<SidebarContent>
				<SidebarGroup className="">
					<SidebarGroupLabel>管理后台</SidebarGroupLabel>
					<SidebarMenu>
						{items.map((item) => {
							const isActive = pathname === item.url;
							return (
								<SidebarMenuItem
									key={item.title}
									className={
										isActive ? "bg-primary text-primary-foreground" : ""
									}
								>
									<SidebarMenuButton asChild className="rounded-none">
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
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
