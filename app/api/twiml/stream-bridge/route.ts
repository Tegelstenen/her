import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

// Define the valid stream track types
type StreamTrack = "inbound_track" | "outbound_track" | "both_tracks";

export async function POST(request: NextRequest) {
	const twiml = new twilio.twiml.VoiceResponse();

	try {
		// First try to get signedUrl from URL parameters
		const url = new URL(request.url);
		let signedUrl = url.searchParams.get("signedUrl");

		if (!signedUrl) {
			// If not in URL, try form data
			const formData = await request.formData();
			try {
				const parameters = JSON.parse(formData.get("parameters") as string);
				if (!parameters?.signedUrl) {
					throw new Error("No signedUrl provided in parameters");
				}
				signedUrl = parameters.signedUrl;
			} catch {
				throw new Error("No signedUrl provided");
			}
		}

		if (!signedUrl) {
			throw new Error("No valid signedUrl found");
		}

		console.log("Using signedUrl:", signedUrl);

		// Connect to our WebSocket handler with the signedUrl
		twiml.connect().stream({
			url: `${new URL("/api/websocket/elevenlabs-bridge", request.url).toString()}?signedUrl=${encodeURIComponent(signedUrl)}`,
			track: "both_tracks" as StreamTrack,
		});

		return new NextResponse(twiml.toString(), {
			headers: { "Content-Type": "text/xml" },
		});
	} catch (error) {
		console.error("Error in stream-bridge:", error);
		twiml.say("Sorry, there was an error setting up the call.");
		return new NextResponse(twiml.toString(), {
			headers: { "Content-Type": "text/xml" },
		});
	}
}
