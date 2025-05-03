"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

import { BackgroundDust } from "@/components/background-dust";
import { ConvAI } from "@/components/ConvAI";
import { LandingWave } from "@/components/landing-wave";
import { HerLogo } from "@/components/logos";
import { InputOTPForm } from "@/components/otp-input";
import { PhoneInput } from "@/components/phone-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { primaryButtonStyles } from "@/lib/button-styles";

// Form validation schema
const FormSchema = z.object({
	name: z.string().min(2, { message: "Name must be at least 2 characters" }),
	phone: z
		.string()
		.refine(isValidPhoneNumber, { message: "Invalid phone number" }),
	terms: z.boolean().refine((val) => val === true, {
		message: "You must accept the terms and conditions",
	}),
});

export default function Home() {
	const [view, setView] = useState<"landing" | "form" | "otp" | "conversation">(
		"landing",
	);
	const [phoneNumber, setPhoneNumber] = useState<string>("");
	const [name, setName] = useState<string>("");
	const [isTransitioning, setIsTransitioning] = useState(false);

	// Setup form with validation
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: "",
			phone: "",
			terms: false,
		},
	});

	const handleSubmit = form.handleSubmit(
		async (values: z.infer<typeof FormSchema>) => {
			setIsTransitioning(true);
			setName(values.name);
			setPhoneNumber(values.phone);

			try {
				// Send OTP to the provided phone number using the phoneNumber plugin
				await authClient.phoneNumber.sendOtp({
					phoneNumber: values.phone,
				});

				setTimeout(() => {
					setView("otp");
					setIsTransitioning(false);
				}, 300);
			} catch (error) {
				console.error("Error sending OTP:", error);
				setIsTransitioning(false);
				// Optionally add error handling UI here
			}
		},
	);

	// Handle successful OTP verification
	const handleVerificationSuccess = () => {
		setIsTransitioning(true);
		setTimeout(() => {
			setView("conversation");
			setIsTransitioning(false);
		}, 300);
	};

	// Determine container width based on view
	const containerWidth = view === "conversation" ? "w-[700px]" : "w-[1200px]";

	// Function to render form content
	const renderFormContent = () => (
		<motion.div
			key="form-content"
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
					Signup today and start your journey to becoming a better you!
				</motion.p>
			</div>

			<motion.div
				className="space-y-6"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.6 }}
			>
				<Form {...form}>
					<form onSubmit={handleSubmit} className="space-y-6">
						<motion.div
							className="space-y-2"
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.3, delay: 0.7 }}
						>
							<Label
								className="block text-sm font-medium text-white"
								htmlFor="name"
							>
								Full name
							</Label>
							<Input
								id="name"
								type="text"
								className="w-full border-b border-gray-300 bg-transparent p-2 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
								placeholder="Jane Doe"
								{...form.register("name")}
								required
							/>
							{form.formState.errors.name && (
								<p className="mt-1 text-sm text-red-400">
									{form.formState.errors.name.message}
								</p>
							)}
						</motion.div>

						<motion.div
							className="space-y-2"
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.3, delay: 0.8 }}
						>
							<Label
								className="block text-sm font-medium text-white"
								htmlFor="phone"
							>
								Phone number
							</Label>
							<PhoneInput
								id="phone"
								value={form.watch("phone")}
								international
								defaultCountry="SE"
								onChange={(value) =>
									form.setValue("phone", value || "", { shouldValidate: true })
								}
								required
							/>
							{form.formState.errors.phone && (
								<p className="mt-1 text-sm text-red-400">
									{form.formState.errors.phone.message}
								</p>
							)}
						</motion.div>

						<motion.div
							className="mt-8 flex items-center"
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.3, delay: 0.9 }}
						>
							<Checkbox
								id="terms"
								className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
								checked={form.watch("terms")}
								onCheckedChange={(checked) =>
									form.setValue("terms", checked === true, {
										shouldValidate: true,
									})
								}
								required
							/>
							<Label htmlFor="terms" className="ml-2 block text-sm text-white">
								I agree to the{" "}
								<span className="text-blue-400">Terms & Conditions</span>
							</Label>
							{form.formState.errors.terms && (
								<p className="ml-2 text-sm text-red-400">
									{form.formState.errors.terms.message}
								</p>
							)}
						</motion.div>

						<motion.div
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.3, delay: 1 }}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.98 }}
						>
							<Button
								type="submit"
								className={primaryButtonStyles}
								disabled={isTransitioning}
							>
								Sign up
							</Button>
						</motion.div>
					</form>
				</Form>
			</motion.div>
		</motion.div>
	);

	// Function to render OTP content
	const renderOtpContent = () => (
		<motion.div
			key="otp-content"
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
					Verify your phone
				</motion.h1>
			</div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.6 }}
			>
				<InputOTPForm
					phoneNumber={phoneNumber}
					onVerificationSuccess={handleVerificationSuccess}
				/>

				<div className="mt-6">
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.3, delay: 0.9 }}
					>
						<Button
							type="button"
							variant="link"
							className="text-sm text-blue-400 hover:underline"
							onClick={() => setView("form")}
						>
							Back to registration
						</Button>
					</motion.div>
				</div>
			</motion.div>
		</motion.div>
	);

	// Function to render the form/OTP section with static image
	const renderFormOrOtpView = () => (
		<motion.div
			key="form-otp"
			className="relative z-[5] flex h-full w-full overflow-hidden rounded-lg"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
		>
			{/* Dynamic content - Form or OTP */}
			<AnimatePresence mode="wait">
				{view === "form" && renderFormContent()}
				{view === "otp" && renderOtpContent()}
			</AnimatePresence>

			{/* Static Image - Right side */}
			<div className="relative z-[5] w-1/2">
				<Image
					src="/bath.jpg"
					alt="Relaxation image"
					fill
					style={{ objectFit: "cover" }}
					priority
				/>
			</div>
		</motion.div>
	);

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

					{(view === "form" || view === "otp") && renderFormOrOtpView()}

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
								<ConvAI
									user_name={name}
									goals={"to become a humanitary world leader"}
								/>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	);
}
