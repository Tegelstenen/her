"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

import { InputOTPForm } from "@/components/otp-input";
import { PhoneInput } from "@/components/phone-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { primaryButtonStyles } from "@/lib/button-styles";

// Form validation schema
const FormSchema = z.object({
	firstName: z
		.string()
		.min(2, { message: "First name must be at least 2 characters" })
		.refine((val) => !/\d/.test(val), {
			message: "First name should not contain numbers",
		}),
	lastName: z
		.string()
		.min(2, { message: "Last name must be at least 2 characters" })
		.refine((val) => !/\d/.test(val), {
			message: "Last name should not contain numbers",
		}),
	phone: z
		.string()
		.refine(isValidPhoneNumber, { message: "Invalid phone number" }),
	terms: z.boolean().refine((val) => val === true, {
		message: "You must accept the terms and conditions",
	}),
});

export function AuthForm({
	onSignUp,
}: {
	onSignUp?: (first_name: string, last_name: string, phone: string) => void;
}) {
	const [view, setView] = useState<"form" | "otp">("form");
	const [phoneNumber, setPhoneNumber] = useState<string>("");
	const [firstName, setFirstName] = useState<string>("");
	const [lastName, setLastName] = useState<string>("");
	const [isTransitioning, setIsTransitioning] = useState(false);

	// Setup form with validation
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			phone: "",
			terms: false,
		},
	});

	const handleSubmit = form.handleSubmit(
		async (values: z.infer<typeof FormSchema>) => {
			setIsTransitioning(true);
			setFirstName(values.firstName);
			setLastName(values.lastName);
			setPhoneNumber(values.phone);

			try {
				console.log(
					"Sending OTP with first/last name:",
					values.firstName,
					values.lastName,
				);
				await authClient.phoneNumber.sendOtp({
					phoneNumber: values.phone,
					fetchOptions: {
						headers: {
							"x-first-name": values.firstName,
							"x-last-name": values.lastName,
						},
					},
				});

				setTimeout(() => {
					setView("otp");
					setIsTransitioning(false);
				}, 300);
			} catch (error) {
				console.error("Error sending OTP:", error);
				setIsTransitioning(false);
			}
		},
	);

	// Handle successful OTP verification
	const handleVerificationSuccess = async () => {
		if (onSignUp) {
			onSignUp(firstName, lastName, phoneNumber);
		}
	};

	return (
		<AnimatePresence mode="wait">
			{view === "form" && (
				<motion.div
					key="form-view"
					className="relative z-[5] flex w-1/2 flex-col justify-center p-12"
					initial={{ x: -50, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: -50, opacity: 0, transition: { duration: 0.3 } }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					<div className="mb-6">
						<motion.h1
							className="mb-3 text-4xl font-semibold text-white"
							initial={{ y: -20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.4 }}
						>
							Ready to start your success story?
						</motion.h1>
						<motion.p
							className="mb-3 text-white"
							initial={{ y: -20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.5 }}
						>
							Signup today and start your journey!
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
									<div className="flex gap-4">
										<div className="flex-1">
											<Label
												className="block text-sm font-medium text-white"
												htmlFor="firstName"
											>
												First name
											</Label>
											<input
												id="firstName"
												type="text"
												className="w-full rounded-none border-0 border-b border-gray-300 bg-transparent p-2 text-white shadow-none [-webkit-box-shadow:0_0_0_1000px_black_inset] [-webkit-text-fill-color:white] placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
												placeholder="Jane"
												{...form.register("firstName")}
											/>
											<AnimatePresence initial={false}>
												{form.formState.errors.firstName && (
													<motion.div
														key="firstName-error"
														initial={{ height: 0, opacity: 0 }}
														animate={{ height: "auto", opacity: 1 }}
														exit={{ height: 0, opacity: 0 }}
														transition={{ duration: 0.2, ease: "easeInOut" }}
														className="overflow-hidden"
													>
														<p className="mt-2 text-sm text-red-400">
															{form.formState.errors.firstName.message}
														</p>
													</motion.div>
												)}
											</AnimatePresence>
										</div>
										<div className="flex-1">
											<Label
												className="block text-sm font-medium text-white"
												htmlFor="lastName"
											>
												Last name
											</Label>
											<input
												id="lastName"
												type="text"
												className="w-full rounded-none border-0 border-b border-gray-300 bg-transparent p-2 text-white shadow-none [-webkit-box-shadow:0_0_0_1000px_black_inset] [-webkit-text-fill-color:white] placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
												placeholder="Doe"
												{...form.register("lastName")}
											/>
											<AnimatePresence initial={false}>
												{form.formState.errors.lastName && (
													<motion.div
														key="lastName-error"
														initial={{ height: 0, opacity: 0 }}
														animate={{ height: "auto", opacity: 1 }}
														exit={{ height: 0, opacity: 0 }}
														transition={{ duration: 0.2, ease: "easeInOut" }}
														className="overflow-hidden"
													>
														<p className="mt-2 text-sm text-red-400">
															{form.formState.errors.lastName.message}
														</p>
													</motion.div>
												)}
											</AnimatePresence>
										</div>
									</div>
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
											form.setValue("phone", value || "", {
												shouldValidate: true,
											})
										}
										className="rounded-none border-0 shadow-none focus:ring-0"
									/>
									<AnimatePresence initial={false}>
										{form.formState.errors.phone && (
											<motion.div
												key="phone-error"
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{ duration: 0.2, ease: "easeInOut" }}
												className="overflow-hidden"
											>
												<p className="text-sm text-red-400">
													{form.formState.errors.phone.message}
												</p>
											</motion.div>
										)}
									</AnimatePresence>
								</motion.div>

								<motion.div
									className="mt-8 flex items-center"
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ duration: 0.3, delay: 0.9 }}
								>
									<div>
										<div className="flex items-center">
											<Checkbox
												id="terms"
												checked={form.watch("terms")}
												onCheckedChange={(checked) =>
													form.setValue("terms", checked as boolean, {
														shouldValidate: true,
													})
												}
											/>
											<Label
												htmlFor="terms"
												className="ml-2 block text-sm text-white"
											>
												I agree to the{" "}
												<span className="text-blue-400">
													Terms & Conditions
												</span>
											</Label>
										</div>
										<AnimatePresence initial={false}>
											{form.formState.errors.terms && (
												<motion.div
													key="terms-error"
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: "auto", opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													transition={{ duration: 0.2, ease: "easeInOut" }}
													className="mt-1 overflow-hidden"
												>
													<p className="text-sm text-red-400">
														{form.formState.errors.terms.message}
													</p>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								</motion.div>

								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									transition={{
										height: { duration: 0.3, delay: 0 },
										opacity: { duration: 0.3, delay: 0.5 },
									}}
									className="mt-2"
								>
									<motion.button
										type="submit"
										className={primaryButtonStyles}
										style={{ width: "fit-content" }}
										whileHover={{ scale: 0.95 }}
										whileTap={{ scale: 0.88 }}
										disabled={isTransitioning}
									>
										Sign up
									</motion.button>
								</motion.div>
							</form>
						</Form>
					</motion.div>
				</motion.div>
			)}

			{view === "otp" && (
				<motion.div
					key="otp-view"
					className="relative z-[5] flex w-1/2 flex-col justify-center p-12"
					initial={{ x: -50, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: -50, opacity: 0, transition: { duration: 0.3 } }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					<div className="mb-3">
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
						exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
					>
						<InputOTPForm
							phoneNumber={phoneNumber}
							firstName={firstName}
							lastName={lastName}
							onVerificationSuccess={handleVerificationSuccess}
							onBackToRegistration={() => setView("form")}
						/>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
