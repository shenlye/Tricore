import DashboardLayout from "./layout";

export default function DashboardPage() {
	return (
		<DashboardLayout>
			<main className="flex min-h-svh items-center justify-center bg-muted/20">
				<div className="container mx-auto px-4 py-8">
					<h1 className="text-2xl font-bold">Dashboard</h1>
				</div>
			</main>
		</DashboardLayout>
	);
}
