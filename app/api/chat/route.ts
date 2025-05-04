import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest } from "next/server";

import { getConversationContext } from "@/lib/server/actions/conversation";

// POST handler for /api/ai
export async function POST(req: NextRequest) {
	try {
		const { type, user_id, agenda } = await req.json();

		if (type === "agenda") {
			// Get agenda for user
			const goals = await getConversationContext(
				user_id ?? "",
				"what are the user's goals",
			);
			const { text } = await generateText({
				model: google("gemini-1.5-flash"),
				prompt: `Given the goals of the individual below, what would you like to discuss during a conversation today with them?
        
        ### GOALS ###
        ${goals}`,
			});
			return Response.json({ text });
		}

		if (type === "topic") {
			// Get topic from agenda
			const { text } = await generateText({
				model: google("gemini-1.5-flash"),
				prompt: `summarise this conversation agenda into a topic to be used in the sentence "For today's conversation, I thought we might discuss {topic}. How does that sound?"
        
        ### AGENDA ###
        ${agenda}`,
			});
			return Response.json({ text });
		}

		if (type === "contextQuery") {
			// Get context query from agenda
			const { text } = await generateText({
				model: google("gemini-1.5-flash"),
				prompt: `Write a query to get the context for the conversation agenda from the user's knowledge graph
        
        ### AGENDA ###
        ${agenda}`,
			});
			return Response.json({ text });
		}

		return new Response("Invalid type", { status: 400 });
	} catch (error) {
		console.error(error);
		return new Response("Server error", { status: 500 });
	}
}
