"use client";

import { motion } from "framer-motion";

import { ConvAI } from "@/components/conv-ai";

export default function DashboardPage() {
	return (
		<div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
			<motion.div
				data-fade-content
				className="flex items-center justify-center"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
			>
				<ConvAI user_name={"temp"} goals={"temp"} />
			</motion.div>
		</div>
	);
}
