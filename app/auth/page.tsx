"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthForm } from "@/components/auth-form";
import { authClient } from "@/lib/auth-client";

export default function AuthPage() {
	const router = useRouter();
	const [isLeaving, setIsLeaving] = useState(false);

	const handleSignUp = async () => {
		setIsLeaving(true);

		// Get the current session
		const { data: currentSession } = await authClient.getSession();

		if (currentSession?.user) {
			// If we already have a session, redirect immediately
			router.push("/account");
			return;
		}

		// If no session yet, wait for it with a timeout
		const maxAttempts = 50; // 5 seconds total
		let attempts = 0;
		let sessionCheckInterval: NodeJS.Timeout | null = null;

		sessionCheckInterval = setInterval(async () => {
			attempts++;
			const { data: session } = await authClient.getSession();

			if (session?.user) {
				if (sessionCheckInterval) clearInterval(sessionCheckInterval);
				router.push("/account");
			} else if (attempts >= maxAttempts) {
				if (sessionCheckInterval) clearInterval(sessionCheckInterval);
				console.error("Session not found after multiple attempts");
				router.push("/auth");
			}
		}, 100);
	};

	return (
		<div className="relative min-h-screen w-full overflow-hidden">
			<div className="relative z-10 flex min-h-screen items-center justify-center">
				<AnimatePresence mode="wait">
					{!isLeaving && (
						<motion.div
							data-fade-content
							className="flex h-[600px] w-[900px] items-center justify-center rounded-lg"
							initial={{ x: -20, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{
								x: -20,
								opacity: 0,
								transition: { duration: 0.2, ease: "easeInOut" },
							}}
							transition={{ duration: 0.5, ease: "easeInOut" }}
						>
							<div className="relative z-[5] flex h-full w-full overflow-hidden rounded-lg">
								<AuthForm onSignUp={handleSignUp} key="auth-form" />
								{/* Right side - Image */}
								<div className="relative w-1/2">
									<Image
										src="/bath.jpg"
										alt="Relaxation image"
										fill
										className="rounded-3xl"
										style={{ objectFit: "cover" }}
										priority
									/>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
