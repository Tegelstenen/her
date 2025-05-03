"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";

const FormSchema = z.object({
	pin: z.string().min(6, {
		message: "Your one-time password must be 6 characters.",
	}),
});

export function InputOTPForm({
	phoneNumber,
	onVerificationSuccess,
}: Readonly<{
	phoneNumber: string;
	onVerificationSuccess?: () => void;
}>) {
	const [isVerifying, setIsVerifying] = useState(false);
	const [verificationError, setVerificationError] = useState<string | null>(
		null,
	);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			pin: "",
		},
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		setIsVerifying(true);
		setVerificationError(null);

		try {
			const response = await authClient.phoneNumber.verify({
				phoneNumber: phoneNumber,
				code: data.pin,
				fetchOptions: {
					onSuccess(ctx) {
						console.log("Verification successful:", ctx);
						if (onVerificationSuccess) {
							onVerificationSuccess();
						}
					},
					onError(ctx) {
						console.log("Verification error:", ctx);
						setVerificationError(
							ctx.error.message ||
								"Invalid verification code. Please try again.",
						);
					},
				},
			});

			// Handle success if the onSuccess callback doesn't trigger
			if (!response.error && onVerificationSuccess) {
				onVerificationSuccess();
			} else if (response.error) {
				setVerificationError(
					response.error.message || "Verification failed. Please try again.",
				);
			}
		} catch (error) {
			console.error("Verification error:", error);
			setVerificationError("An unexpected error occurred. Please try again.");
		} finally {
			setIsVerifying(false);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
				{verificationError && (
					<Alert
						variant="destructive"
						className="mb-4 border border-red-200 bg-red-50 text-red-600"
					>
						<AlertDescription>{verificationError}</AlertDescription>
					</Alert>
				)}

				<FormField
					control={form.control}
					name="pin"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-white">One-Time Password</FormLabel>
							<FormControl>
								<InputOTP maxLength={6} {...field}>
									<InputOTPGroup>
										<InputOTPSlot index={0} />
										<InputOTPSlot index={1} />
										<InputOTPSlot index={2} />
										<InputOTPSlot index={3} />
										<InputOTPSlot index={4} />
										<InputOTPSlot index={5} />
									</InputOTPGroup>
								</InputOTP>
							</FormControl>
							<FormDescription className="text-gray-300">
								Please enter the one-time password sent to your phone.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={isVerifying} className="w-full">
					{isVerifying ? "Verifying..." : "Submit"}
				</Button>
			</form>
		</Form>
	);
}
