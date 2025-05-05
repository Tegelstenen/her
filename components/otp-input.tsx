"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { primaryButtonStyles } from "@/lib/button-styles";
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
};

export function InputOTPForm({
	phoneNumber,
	firstName,
	lastName,
	onVerificationSuccess,
}: InputOTPFormProps) {
	const [otp, setOtp] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loadingDots, setLoadingDots] = useState("");

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isVerifying) {
			interval = setInterval(() => {
				setLoadingDots((dots) => (dots.length >= 3 ? "" : dots + "."));
			}, 500);
		} else {
			setLoadingDots("");
		}
		return () => clearInterval(interval);
	}, [isVerifying]);

	const handleVerify = async () => {
		if (otp.length !== 6) {
			setError("Please enter a valid 6-digit code");
			return;
		}

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

			if (!verifyResult) {
				throw new Error("OTP verification failed");
			}

			// Get the session with the user ID
			const { data: session } = await authClient.getSession();
			if (!session?.user?.id) {
				throw new Error("No session user ID found");
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
			setError("Invalid verification code. Please try again.");
		} finally {
			setIsVerifying(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<p className="mb-4 text-sm text-white">
					Enter the 6-digit code sent to {phoneNumber}
				</p>
				<InputOTP
					maxLength={6}
					value={otp}
					onChange={setOtp}
					containerClassName="justify-center"
				>
					<InputOTPGroup>
						{Array.from({ length: 6 }).map((_, i) => (
							<InputOTPSlot key={i} index={i} />
						))}
					</InputOTPGroup>
				</InputOTP>
				{error && <p className="mt-2 text-sm text-red-400">{error}</p>}
			</div>

			<Button
				onClick={handleVerify}
				disabled={isVerifying || otp.length !== 6}
				className={`${primaryButtonStyles} min-w-[180px]`}
			>
				{isVerifying ? `Verifying${loadingDots}` : "Verify"}
			</Button>

			<p className="text-sm text-white">
				Didn&apos;t receive a code?{" "}
				<Button
					variant="link"
					className="p-0 text-blue-400"
					onClick={async () => {
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
					}}
				>
					Resend
				</Button>
			</p>
		</div>
	);
}
