import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/api";
export default function App() {
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");

	const loginMutation = useMutation({
		mutationFn: async () => {
			const res = await client.api.v1.auth.login.$post({
				json: {
					identifier,
					password,
				},
			});

			const result = await res.json();

			if (!res.ok) {
				const message =
					"error" in result ? result.error.message : "Login failed";
				throw new Error(message);
			}

			if ("data" in result) {
				return result;
			}

			throw new Error("Invalid response");
		},
		onSuccess: (data) => {
			localStorage.setItem("token", data.data.token);
			alert("Login successful!");
			// Redirect or update state here
		},
		onError: (error: Error) => {
			alert(error.message);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		loginMutation.mutate();
	};

	return (
		<main className="flex min-h-svh items-center justify-center bg-muted/20">
			<div className="w-full max-w-6xl flex bg-card shadow-2xl overflow-hidden border transition-all">
				<div className="hidden md:block flex-1 min-w-0">
					<div className="w-full h-full bg-primary overflow-hidden flex items-end justify-center relative">
						<svg
							viewBox="0 0 1000 300"
							className="w-full h-auto fill-black opacity-80"
							preserveAspectRatio="xMidYMax slice"
							aria-hidden="true"
						>
							<g opacity="0.2">
								<rect x="50" y="150" width="80" height="150" />
								<rect x="250" y="100" width="100" height="200" />
								<rect x="550" y="130" width="70" height="170" />
								<rect x="800" y="160" width="90" height="140" />
							</g>

							<g opacity="0.5">
								<rect x="150" y="200" width="100" height="100" />
								<rect x="400" y="150" width="80" height="150" />
								<rect x="650" y="180" width="120" height="120" />
							</g>

							<g>
								<rect x="0" y="250" width="120" height="50" />
								<rect x="200" y="50" width="60" height="250" />
								<rect x="450" y="120" width="100" height="180" />
								<rect x="750" y="150" width="80" height="150" />
								<rect x="900" y="220" width="100" height="80" />
							</g>
						</svg>

						<div className="absolute top-8 left-2 flex flex-col items-center justify-center pointer-events-none px-8 text-center text-primary-foreground">
							<h2 className="text-4xl font-bold opacity-95">Welcome Back</h2>
						</div>
					</div>
				</div>

				<div className="w-full md:w-md shrink flex items-center justify-center">
					<div className="w-full max-w-sm">
						<Card className="border-none shadow-none bg-transparent">
							<CardHeader className="px-0 pt-0">
								<CardTitle className="text-2xl font-bold tracking-tight">
									Login
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0">
								<form className="grid gap-6" onSubmit={handleSubmit}>
									<div className="grid gap-2">
										<label
											htmlFor="email"
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											Email / Username
										</label>
										<Input
											id="email"
											type="text"
											placeholder=""
											value={identifier}
											onChange={(e) => setIdentifier(e.target.value)}
											required
										/>
									</div>
									<div className="grid gap-2">
										<div className="flex items-center">
											<label
												htmlFor="password"
												className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											>
												Password
											</label>
											<a
												href="/forgot-password"
												className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
											>
												Forgot your password?
											</a>
										</div>
										<Input
											id="password"
											type="password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
										/>
									</div>
									<Button
										type="submit"
										className="w-full"
										disabled={loginMutation.isPending}
									>
										{loginMutation.isPending && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										Login
									</Button>
									<Button variant="outline" className="w-full" type="button">
										Login with Google
									</Button>
								</form>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</main>
	);
}
