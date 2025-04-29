"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import { BackgroundDust } from "@/components/background-dust";
import { ConvAI } from "@/components/ConvAI";
import { LandingWave } from "@/components/landing-wave";
import { HerLogo } from "@/components/logos";
import { primaryButtonStyles } from "@/lib/button-styles";

export default function Home() {
	const [view, setView] = useState<"landing" | "form" | "conversation">(
		"landing",
	);
	const [goals, setGoals] = useState<string>("");
	const [name, setName] = useState<string>("");
	const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
	const [isTransitioning, setIsTransitioning] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("User goals:", goals);
		setIsTransitioning(true);
		console.log("Are we transitioning?", isTransitioning);
		// Reduced delay for a more responsive transition
		setTimeout(() => {
			setView("conversation");
			setIsTransitioning(false);
		}, 300);
	};

	// Determine container width based on view
	const containerWidth = view === "conversation" ? "w-[700px]" : "w-[1200px]";

	return (
		<div className="flex min-h-screen items-center justify-center bg-white p-8">
			{/* Main card container with the wave background */}
			<motion.div
				className={`${containerWidth} relative h-[800px] overflow-hidden rounded-2xl shadow-lg`}
				animate={{
					width: view === "conversation" ? 700 : 1200,
				}}
				transition={{
					duration: 0.6,
					ease: "easeInOut",
					delay: view === "conversation" ? 0.2 : 0,
				}}
			>
				{/* Black background for transitions */}
				<div className="absolute inset-0 z-0 bg-black"></div>

				{/* Background videos with crossfade transition */}
				<AnimatePresence initial={false} mode="wait">
					{view === "landing" ? (
						<motion.div
							key="landing-wave"
							className="absolute inset-0 z-[1]"
							initial={{ opacity: 1 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.8, ease: "easeInOut" }}
						>
							<LandingWave />
						</motion.div>
					) : (
						<motion.div
							key="background-dust"
							className="absolute inset-0 z-[1]"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.8, ease: "easeInOut", delay: 0.4 }}
						>
							<BackgroundDust />
						</motion.div>
					)}
				</AnimatePresence>

				{/* Content with transitions */}
				<AnimatePresence mode="wait">
					{view === "landing" && (
						/* Initial landing view */
						<motion.div
							key="landing"
							className="relative z-[5] flex h-full flex-col items-center justify-center p-8"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{
								opacity: 0,
								y: -20,
								transition: { duration: 0.4 },
							}}
							transition={{ duration: 0.5 }}
						>
							{/* Centered Logo */}
							<motion.div
								className="mb-8"
								initial={{ scale: 1 }}
								animate={{ scale: 1 }}
								exit={{
									scale: 0.8,
									opacity: 0,
									transition: { duration: 0.3 },
								}}
							>
								<HerLogo className="h-64 w-64 text-white" />
							</motion.div>

							{/* Button below logo */}
							<motion.button
								className={primaryButtonStyles}
								onClick={() => setView("form")}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5, duration: 0.4 }}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.98 }}
							>
								Become a better you
							</motion.button>
						</motion.div>
					)}

					{view === "form" && (
						/* Form view */
						<motion.div
							key="form"
							className="relative z-[5] flex h-full w-full overflow-hidden rounded-lg"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
						>
							{/* Left side - Form */}
							<motion.div
								className="relative z-[5] flex w-1/2 flex-col justify-center p-12"
								initial={{ x: -50, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{
									x: -50,
									opacity: 0,
									transition: { duration: 0.3 },
								}}
								transition={{ duration: 0.5, delay: 0.3 }}
							>
								<div className="mb-10">
									<motion.h1
										className="mb-3 text-4xl font-semibold text-white"
										initial={{ y: -20, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{ duration: 0.5, delay: 0.4 }}
									>
										Ready to start your success story?
									</motion.h1>
									<motion.p
										className="mb-8 text-white"
										initial={{ y: -20, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{ duration: 0.5, delay: 0.5 }}
									>
										Tell us your goals and start your journey to becoming a
										better you today!
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
										<label
											htmlFor="terms"
											className="ml-2 block text-sm text-white"
										>
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
								exit={{
									x: 50,
									opacity: 0,
									transition: { duration: 0.3 },
								}}
								transition={{ duration: 0.5, delay: 0.3 }}
							>
								<Image
									src="/bath.jpg"
									alt="Relaxation image"
									fill
									style={{ objectFit: "cover" }}
									priority
								/>
							</motion.div>
						</motion.div>
					)}

					{view === "conversation" && (
						/* Conversation view */
						<motion.div
							key="conversation"
							className="relative z-[5] flex h-full w-full items-center justify-center"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
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
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	);
}
