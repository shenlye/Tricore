import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth-guard";
import {
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthGuard>
			<SidebarProvider>
				<AppSidebar />
				<main className="flex-1">
					<header className="flex h-12 border-b px-4 items-center">
						<SidebarTrigger />
					</header>
					{children}
				</main>
			</SidebarProvider>
		</AuthGuard>
	);
}
