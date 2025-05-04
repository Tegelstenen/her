"use client";

import { AnimatePresence, motion } from "framer-motion";

import { ConvAI } from "@/components/conv-ai";

export default function DashboardPage() {
	return (
		<div className="relative min-h-screen w-full overflow-hidden">
			<AnimatePresence mode="wait">
				<motion.div
					data-fade-content
					key="dashboard-content"
					initial={{ opacity: 1 }}
					animate={{ opacity: 1 }}
					exit={{
						opacity: 0,
						transition: { duration: 0.8, ease: "easeInOut" },
					}}
					transition={{ duration: 0.8, ease: "easeInOut" }}
				>
					<motion.div
						key="conversation"
						className="relative z-10 flex min-h-screen items-center justify-center"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.4 }}
					>
						<motion.div
							className="flex h-[400px] w-[500px] items-center justify-center"
							initial={{ y: 15 }}
							animate={{ y: 0 }}
							transition={{
								type: "spring",
								stiffness: 300,
								damping: 25,
								delay: 0.1,
							}}
						>
							<ConvAI user_name={name} goals={goals} />
						</motion.div>
					</motion.div>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
