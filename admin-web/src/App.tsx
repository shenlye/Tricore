import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
		<main className="grid min-h-svh lg:grid-cols-2">
			<div className="bg-foreground relative hidden lg:block">
				<div className="absolute inset-0 flex items-center justify-center text-background p-10">
					<div className="space-y-2">
						<h1 className="text-4xl font-bold">Welcome Back</h1>
						<p className="text-lg opacity-80">
							Login to manage your API and content.
						</p>
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-sm">
						<Card className="border-none shadow-none">
							<CardHeader className="px-0">
								<CardTitle className="text-2xl">Login</CardTitle>
								<CardDescription>
									Enter your email below to login to your account
								</CardDescription>
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
								<div className="mt-4 text-center text-sm">
									Don&apos;t have an account?{" "}
									<a href="/signup" className="underline underline-offset-4">
										Sign up
									</a>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</main>
	);
}
