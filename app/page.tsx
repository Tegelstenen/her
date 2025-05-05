"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { HerLogo } from "@/components/logos";
import { primaryButtonStyles } from "@/lib/button-styles";

export default function Home() {
	const [isLeaving, setIsLeaving] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (isLeaving) {
			const timeout = setTimeout(() => {
				router.push("/auth");
			}, 200);
			return () => clearTimeout(timeout);
		}
	}, [isLeaving, router]);

	return (
		<div className="relative flex min-h-screen items-center justify-center p-0">
			<div className="flex h-full w-full flex-col items-center justify-center">
				<AnimatePresence mode="wait">
					{!isLeaving && (
						<motion.div
							key="landing"
							className="relative flex h-full flex-col items-center justify-center p-8"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{
								opacity: 0,
								y: -20,
								transition: { duration: 0.2 },
							}}
							transition={{ duration: 0.5 }}
						>
							<motion.div
								className="mb-6"
								initial={{ scale: 1 }}
								animate={{ scale: 1 }}
								exit={{
									scale: 0.8,
									opacity: 0,
									transition: { duration: 0.2 },
								}}
							>
								<HerLogo className="ml-1 h-[100px] w-auto" />
							</motion.div>
							<p className="mb-8 text-center font-medium text-white">
								Your proactive partner, guiding you to your best self
							</p>
							<motion.button
								className={primaryButtonStyles}
								onClick={() => setIsLeaving(true)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.98 }}
							>
								Get started
							</motion.button>
							<p className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 text-center text-xs text-gray-400">
								Built for the SSE x Microsoft Hackathon
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
