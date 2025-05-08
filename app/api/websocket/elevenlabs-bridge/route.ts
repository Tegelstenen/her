import { WebSocketServer } from "ws";

export default function handler(req, socket, head) {
	const wss = new WebSocketServer({ noServer: true });

	wss.on("connection", async (twilioWs) => {
		// Get parameters from the URL
		const url = new URL(req.url, `http://${req.headers.host}`);
		const signedUrl = url.searchParams.get("signedUrl");

		// Connect to ElevenLabs
		const elevenLabsWs = new WebSocket(signedUrl!);

		// Handle audio from phone call
		twilioWs.on("message", (data) => {
			if (typeof data === "string") {
				// Handle Twilio metadata
				const metadata = JSON.parse(data);
				console.log("Received metadata:", metadata);
			} else {
				// Forward audio to ElevenLabs
				elevenLabsWs.send(data);
			}
		});

		// Handle ElevenLabs responses
		elevenLabsWs.on("message", (data) => {
			twilioWs.send(data);
		});

		// Handle disconnection
		twilioWs.on("close", () => {
			elevenLabsWs.close();
		});
	});

	// Upgrade HTTP connection to WebSocket
	wss.handleUpgrade(req, socket, head, (ws) => {
		wss.emit("connection", ws, req);
	});
}
