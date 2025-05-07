// app/api/signed-url/route.ts
import { ElevenLabsClient } from "elevenlabs";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const agentType = searchParams.get("agentType");

	if (!agentType || (agentType !== "onboarding" && agentType !== "coaching")) {
		return NextResponse.json(
			{ error: "Valid agent type is required (onboarding or coaching)" },
			{ status: 400 },
		);
	}

	let agentId;
	if (agentType === "onboarding") {
		agentId = process.env.ONBOARDING_AGENT_ID;
	} else {
		agentId = process.env.COACH_AGENT_ID;
	}

	if (!agentId) {
		return NextResponse.json(
			{ error: `${agentType.toUpperCase()}_AGENT_ID is not configured` },
			{ status: 500 },
		);
	}

	try {
		const client = new ElevenLabsClient({
			apiKey: process.env.ELEVENLABS_API_KEY,
		});

		const response = await client.conversationalAi.getSignedUrl({
			agent_id: agentId,
		});

		return NextResponse.json({ signedUrl: response.signed_url });
	} catch (error) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: "Failed to get signed URL" },
			{ status: 500 },
		);
	}
}
