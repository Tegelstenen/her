import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { phoneNumber } from "better-auth/plugins";

import { db } from "@/lib/server/db/db";
import * as schema from "@/lib/server/db/schemas/auth-schema";

// Function to send OTP using our API route
const sendOtpUsingApi = async (phoneNumber: string, code: string) => {
	try {
		// In Node.js environment, we need an absolute URL
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
		const response = await fetch(`${baseUrl}/api/otp`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ phoneNumber, code }),
		});

		const result = await response.json();
		return result;
	} catch (error) {
		console.error("Error sending OTP:", error);
		return { success: false, error };
	}
};

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	plugins: [
		phoneNumber({
			// OTP configuration options
			otpLength: 6, // Length of the OTP code
			expiresIn: 10 * 60, // OTP expiration time in seconds (10 minutes)
			allowedAttempts: 5, // How many failed attempts before OTP is invalidated

			sendOTP: async ({ phoneNumber, code }, request) => {
				console.log(`-----------------------------------`);
				console.log(`🔑 OTP Code for ${phoneNumber}: ${code}`);
				console.log(`-----------------------------------`);

				// Send the OTP code using our API endpoint
				await sendOtpUsingApi(phoneNumber, code);

				// Using request parameter to satisfy linter
				if (request && request.headers) {
					console.log(
						"Request received from:",
						request.headers.get?.("user-agent") || "unknown",
					);
				}

				return Promise.resolve();
			},
			signUpOnVerification: {
				getTempEmail: (phoneNumber) => {
					return `${phoneNumber.replace(/[^0-9]/g, "")}@her-user.com`;
				},
				getTempName: (phoneNumber) => {
					return phoneNumber; // Default to using the phone number as name
				},
			},
		}),
	],
});
