"use client";
import { motion } from "framer-motion";
import { useState } from "react";

import { primaryButtonStyles } from "@/lib/button-styles";

export function AuthForm({
	onSignUp,
}: {
	onSignUp?: (name: string, goals: string) => void;
}) {
	const [goals, setGoals] = useState("");
	const [name, setName] = useState("");
	const [agreeToTerms, setAgreeToTerms] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (onSignUp) {
			onSignUp(name, goals);
			return;
		}
		console.log("User goals:", goals);
		console.log("User name:", name);
		console.log("Agreed to terms:", agreeToTerms);
	};

	return (
		<motion.div
			className="relative z-[5] flex h-full w-full overflow-hidden rounded-lg"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
		>
			<motion.div
				className="relative z-[5] flex w-1/2 flex-col justify-center p-12"
				initial={{ x: -50, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				exit={{ x: -50, opacity: 0, transition: { duration: 0.3 } }}
				transition={{ duration: 0.5, delay: 0.3 }}
			>
				<div className="mb-10">
					<motion.h1
						className="mb-3 text-4xl font-semibold text-white"
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						Welcome!
					</motion.h1>
					<motion.p
						className="text-lg text-gray-300"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.5 }}
					>
						Tell us your goals and start your journey to becoming a better you
						today!
					</motion.p>
				</div>
				<motion.form
					onSubmit={handleSubmit}
					className="space-y-6"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.6 }}
				>
					<motion.div
						className="space-y-2"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.3, delay: 0.7 }}
					>
						<label className="block text-sm font-medium text-white">
							Full name
						</label>
						<input
							type="text"
							className="w-full border-b border-gray-300 bg-transparent p-2 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
							placeholder="Jane Doe"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</motion.div>
					<motion.div
						className="space-y-2"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.3, delay: 0.8 }}
					>
						<label className="block text-sm font-medium text-white">
							Area of interest
						</label>
						<input
							type="text"
							className="w-full border-b border-gray-300 bg-transparent p-2 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
							placeholder="Your goals"
							value={goals}
							onChange={(e) => setGoals(e.target.value)}
							required
						/>
					</motion.div>
					<motion.div
						className="mt-8 flex items-center"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.3, delay: 0.9 }}
					>
						<input
							type="checkbox"
							id="terms"
							className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
							checked={agreeToTerms}
							onChange={(e) => setAgreeToTerms(e.target.checked)}
							required
						/>
						<label htmlFor="terms" className="ml-2 block text-sm text-white">
							I agree to the{" "}
							<span className="text-blue-400">Terms & Conditions</span>
						</label>
					</motion.div>
					<motion.button
						type="submit"
						className={primaryButtonStyles}
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.3, delay: 1 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.98 }}
					>
						Sign up
					</motion.button>
				</motion.form>
			</motion.div>
			{/* Right side - Image */}
			<motion.div
				className="relative z-[5] w-1/2"
				initial={{ x: 50, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				exit={{ x: 50, opacity: 0, transition: { duration: 0.3 } }}
				transition={{ duration: 0.5, delay: 0.3 }}
			>
				<img
					src="/bath.jpg"
					alt="Relaxation image"
					className="absolute inset-0 h-full w-full object-cover"
				/>
			</motion.div>
		</motion.div>
	);
}
