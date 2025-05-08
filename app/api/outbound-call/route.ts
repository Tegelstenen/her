import { ElevenLabsClient } from "elevenlabs";
import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

import {
	getAgenda,
	getContextQuery,
	getConversationContext,
	getTopic,
} from "@/lib/server/actions/conversation";

// Validate required environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const AGENT_ID = process.env.AGENT_ID;

if (
	!TWILIO_ACCOUNT_SID ||
	!TWILIO_AUTH_TOKEN ||
	!TWILIO_PHONE_NUMBER ||
	!AGENT_ID
) {
	throw new Error("Missing required environment variables");
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export async function POST(request: NextRequest) {
	try {
		const { phoneNumber, userId, firstName } = await request.json();

		if (!phoneNumber) {
			return NextResponse.json(
				{ error: "Phone number is required" },
				{ status: 400 },
			);
		}

		// Get the same context as conv-ai.tsx
		const agenda = await getAgenda(userId);
		const topic = await getTopic(agenda);
		const context_query = await getContextQuery(agenda);
		const context = await getConversationContext(userId, context_query);

		// Get ElevenLabs signed URL
		const elevenLabsClient = new ElevenLabsClient();
		const { signed_url } = await elevenLabsClient.conversationalAi.getSignedUrl(
			{
				agent_id: AGENT_ID,
			},
		);

		// Create the TwiML URL with signedUrl as a query parameter
		const baseUrl = process.env.PUBLIC_URL || new URL(request.url).origin;
		const twimlUrl = new URL("/api/twiml/stream-bridge", baseUrl);
		twimlUrl.searchParams.set("signedUrl", signed_url);

		console.log("Making call with TwiML URL:", twimlUrl.toString());

		// Create a Twilio call that connects to our WebSocket bridge
		const call = await client.calls.create({
			url: twimlUrl.toString(),
			to: "+46765851105",
			from: TWILIO_PHONE_NUMBER,
			parameters: {
				userId,
				firstName,
				agenda: JSON.stringify(agenda),
				topic,
				context: JSON.stringify(context),
			},
		});

		return NextResponse.json({ success: true, callSid: call.sid });
	} catch (error) {
		console.error("Error initiating call:", error);
		return NextResponse.json(
			{
				error: "Failed to initiate call",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
