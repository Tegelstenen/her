"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import {
	addUser,
	getOnboardingStatus,
	setOnboardingStatus,
} from "@/lib/server/actions/conversation";

type InputOTPFormProps = {
	phoneNumber: string;
	firstName: string;
	lastName: string;
	onVerificationSuccess: () => void;
	onBackToRegistration?: () => void;
};

export function InputOTPForm({
	phoneNumber,
	firstName,
	lastName,
	onVerificationSuccess,
	onBackToRegistration,
}: InputOTPFormProps) {
	const [otp, setOtp] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastAttemptedOtp, setLastAttemptedOtp] = useState<string>("-");

	const handleOtpChange = (value: string) => {
		// Only allow numbers
		const numbersOnly = value.replace(/[^0-9]/g, "");
		setOtp(numbersOnly);
	};

	const handleVerify = useCallback(async () => {
		if (isVerifying || otp.length !== 6) return;

		setLastAttemptedOtp(otp);
		setIsVerifying(true);
		setError(null);

		try {
			// First verify the OTP with Better Auth
			console.log("Verifying OTP with names:", firstName, lastName);
			const verifyResult = await authClient.phoneNumber.verify({
				phoneNumber: phoneNumber,
				code: otp,
				fetchOptions: {
					headers: {
						"x-first-name": firstName,
						"x-last-name": lastName,
					},
				},
			});

			// Check if verification was successful
			if (!verifyResult?.data?.status) {
				setError("Invalid verification code. Please try again.");
				setOtp(""); // Clear the OTP input
				return;
			}

			// Get the session with the user ID
			const { data: session } = await authClient.getSession();
			if (!session?.user?.id) {
				setError("Verification failed. Please try again.");
				setOtp(""); // Clear the OTP input
				return;
			}

			try {
				// Add user to knowledge graph if not done yet
				const hasBeenAdded = await getOnboardingStatus(
					session.user.id,
					"hasBeenAdded",
				);
				if (!hasBeenAdded) {
					console.log(
						"First sign-up for user, adding to knowledge graph:",
						session.user.id,
					);
					try {
						const result = await addUser(
							firstName,
							lastName,
							session.user.id,
							session.user.email,
						);
						console.log(
							"User successfully added to knowledge graph:",
							session.user.id,
							result,
						);
						await setOnboardingStatus(session.user.id, { hasBeenAdded: true });
					} catch (error) {
						console.error("Failed to add user to knowledge graph:", error);
						throw error;
					}
				}

				// Update user profiles to contain real name
				const hasChangedName = await getOnboardingStatus(
					session.user.id,
					"hasChangedName",
				);
				if (!hasChangedName) {
					// Update both name and lastName in a single request
					await fetch("/api/auth/update-user", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							userId: session.user.id,
							name: firstName,
							lastName: lastName,
						}),
					});

					await setOnboardingStatus(session.user.id, { hasChangedName: true });
				}
			} catch (error) {
				console.error("Error updating user profile or knowledge graph:", error);
				if (
					error instanceof Error &&
					error.message?.includes("Failed to add user")
				) {
					throw error;
				}
			}

			// Consider verification successful only if we've completed all critical steps
			onVerificationSuccess();
		} catch (error) {
			console.error("OTP verification failed:", error);
			setError(
				error instanceof Error
					? error.message
					: "Verification failed. Please try again.",
			);
			setOtp(""); // Clear the OTP input on error
		} finally {
			setIsVerifying(false);
		}
	}, [
		otp,
		isVerifying,
		authClient,
		phoneNumber,
		onVerificationSuccess,
		firstName,
		lastName,
	]);

	useEffect(() => {
		if (otp.length === 6 && !isVerifying && otp !== lastAttemptedOtp) {
			const timer = setTimeout(() => {
				handleVerify();
			}, 200);
			return () => clearTimeout(timer);
		}
	}, [otp, isVerifying, handleVerify, lastAttemptedOtp]);

	const handleResend = async () => {
		try {
			console.log("Resending OTP with names:", firstName, lastName);
			await authClient.phoneNumber.sendOtp({
				phoneNumber: phoneNumber,
				fetchOptions: {
					headers: {
						"x-first-name": firstName,
						"x-last-name": lastName,
					},
				},
			});
			setError(null);
		} catch (error) {
			console.error("Error resending OTP:", error);
			setError("Failed to resend code. Please try again later.");
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<motion.p
					className="text mb-6 text-white"
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.3, delay: 0.4 }}
				>
					Enter the verification code sent to {phoneNumber}
				</motion.p>
				<motion.div
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.3, delay: 0.5 }}
				>
					<div className="flex items-center">
						<InputOTP maxLength={6} value={otp} onChange={handleOtpChange}>
							<InputOTPGroup>
								{Array.from({ length: 6 }).map((_, i) => (
									<InputOTPSlot key={i} index={i} />
								))}
							</InputOTPGroup>
						</InputOTP>
						{isVerifying && (
							<div className="ml-2">
								<Spinner className="h-5 w-5 text-white" />
							</div>
						)}
					</div>
				</motion.div>
				{error && <p className="mt-2 text-sm text-red-400">{error}</p>}
			</div>

			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.3, delay: 0.7 }}
			>
				<div className="mt-2">
					<Button
						type="button"
						variant="link"
						className="p-0 text-sm text-blue-400 hover:underline"
						onClick={handleResend}
					>
						Resend Code
					</Button>
					<Button
						type="button"
						variant="link"
						className="text-sm text-blue-400 hover:underline"
						onClick={onBackToRegistration}
					>
						Back to registration
					</Button>
				</div>
			</motion.div>
		</div>
	);
}
