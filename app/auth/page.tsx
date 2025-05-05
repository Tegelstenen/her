"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthForm } from "@/components/auth-form";

export default function AuthPage() {
	const router = useRouter();
	const [isLeaving, setIsLeaving] = useState(false);

	const handleSignUp = (name: string, phone: string) => {
		setIsLeaving(true);
		console.log(name, phone);
		setTimeout(() => {
			router.push("/account");
		}, 200);
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
							transition={{ duration: 0.2, ease: "easeInOut" }}
						>
							<div className="relative z-[5] flex h-full w-full overflow-hidden rounded-lg">
								<AuthForm onSignUp={handleSignUp} key="auth-form" />
								{/* Right side - Image */}
								<div className="relative z-[5] w-1/2">
									<Image
										src="/bath.jpg"
										alt="Relaxation image"
										fill
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
