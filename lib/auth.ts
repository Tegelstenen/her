import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { phoneNumber } from "better-auth/plugins";

import { db } from "@/lib/server/db/db";
import * as schema from "@/lib/server/db/schemas/auth-schema";

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

				// Using request parameter to satisfy linter
				if (request && request.headers) {
					console.log(
						"Request received from:",
						request.headers.get?.("user-agent") || "unknown",
					);
				}

				// In a production environment, you would implement SMS delivery here
				// Example using Twilio:
				/*
                const accountSid = process.env.TWILIO_ACCOUNT_SID;
                const authToken = process.env.TWILIO_AUTH_TOKEN;
                const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
                
                const client = require('twilio')(accountSid, authToken);
                
                return client.messages.create({
                    body: `Your Her verification code is: ${code}`,
                    from: twilioNumber,
                    to: phoneNumber
                });
                */

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
