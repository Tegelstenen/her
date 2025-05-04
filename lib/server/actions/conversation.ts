"use server";

import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { eq } from "drizzle-orm";

import { db } from "@/lib/server/db/db";
import { first_conversation } from "@/lib/server/db/schemas/auth-schema";

export async function setFirstConversationStatus(userId: string) {
	try {
		await db
			.update(first_conversation)
			.set({ isFirstConversation: true })
			.where(eq(first_conversation.userId, userId));
		return true;
	} catch (error) {
		console.error("Error changing first conversation status:", error);
		return false;
	}
}

export async function getFirstConversationStatus(userId: string) {
	try {
		const result = await db
			.select({ isFirstConversation: first_conversation.isFirstConversation })
			.from(first_conversation)
			.where(eq(first_conversation.userId, userId));
		return result[0]?.isFirstConversation;
	} catch (error) {
		console.error("Error fetching:", error);
	}
}

export async function changeFirstConversationStatus(userId: string) {
	try {
		await db
			.update(first_conversation)
			.set({ isFirstConversation: false })
			.where(eq(first_conversation.userId, userId));
		return true;
	} catch (error) {
		console.error("Error changing first conversation status:", error);
		return false;
	}
}

// Add a new user
export async function addUser(
	firstName: string,
	lastName: string,
	userId: string,
	email: string,
) {
	try {
		const response = await fetch(
			`https://tegelstenen--her-add-user.modal.run?first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&user_id=${userId}&email=${encodeURIComponent(email)}`,
			{ method: "GET" },
		);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Modal endpoint error:", {
				status: response.status,
				statusText: response.statusText,
				error: errorText,
			});
			throw new Error(
				`Failed to add user: ${response.status} ${response.statusText} - ${errorText}`,
			);
		}

		return response.json();
	} catch (error) {
		console.error("Error in addUser:", error);
		throw error;
	}
}

// Add a conversation
export async function addConversation(sessionId: string, userId: string) {
	const response = await fetch(
		`https://tegelstenen--her-add-conversation.modal.run?session_id=${sessionId}&user_id=${userId}`,
		{ method: "GET" },
	);

	if (!response.ok) {
		throw new Error("Failed to add conversation");
	}

	return response.json();
}

// Get context from a session
export async function getContextFromSession(sessionId: string) {
	const response = await fetch(
		`https://tegelstenen--her-get-context-from-a-session.modal.run?session_id=${sessionId}`,
		{ method: "GET" },
	);

	if (!response.ok) {
		throw new Error("Failed to get context");
	}

	return response.json();
}

// Get conversation context
export async function getConversationContext(
	userId: string,
	context_query: string,
) {
	console.log(`--- Calling getConversationContext ---`);
	console.log(`User ID: ${userId}`);
	console.log(
		`Context Query: "${context_query}" (Length: ${context_query.length})`,
	);
	console.log(`------------------------------------`);
	const response = await fetch(
		`https://tegelstenen--her-get-conversation-context.modal.run?user_id=${userId}&agenda=${encodeURIComponent(context_query)}`,
		{ method: "GET" },
	);

	if (!response.ok) {
		throw new Error("Failed to get conversation context");
	}

	return response.json();
}

// Todo implement some logic here, how do we decide what to talk about for the conversation?
export async function getAgenda(user_id: string): Promise<string> {
	console.log(`--- Inside getAgenda for user ${user_id} ---`);
	const goalsData = await getConversationContext(
		user_id ?? "",
		"what are the user's goals",
	);
	console.log("Raw goalsData received:", JSON.stringify(goalsData, null, 2));

	// Attempt to extract meaningful goal text (assuming common structures)
	let goalsText = "";
	if (typeof goalsData === "string") {
		goalsText = goalsData;
	} else if (goalsData && typeof goalsData === "object") {
		if ("summary" in goalsData && typeof goalsData.summary === "string") {
			goalsText = goalsData.summary;
		} else if ("text" in goalsData && typeof goalsData.text === "string") {
			goalsText = goalsData.text;
		} else if (
			"results" in goalsData &&
			Array.isArray(goalsData.results) &&
			goalsData.results.length > 0 &&
			typeof goalsData.results[0] === "string"
		) {
			goalsText = goalsData.results.join("\n");
		} else {
			// Fallback: stringify the object, might not be ideal for the prompt
			goalsText = JSON.stringify(goalsData);
		}
	} else {
		goalsText = "No specific goals data could be extracted.";
	}
	console.log("Extracted goalsText for prompt:", goalsText);

	const { text } = await generateText({
		model: google("gemini-1.5-flash"),
		prompt: `Given the goals of the individual below, what would you like to discuss during a conversation today with them? Respond with only the conversation agenda topics.
		
		### GOALS ###
		${goalsText || "No specific goals provided."}`,
	});
	console.log("Generated agenda:", text);
	return text;
}

export async function getTopic(agenda: string): Promise<string> {
	const { text } = await generateText({
		model: google("gemini-1.5-flash"),
		prompt: `Summarise the core subject of the following conversation agenda into a concise topic phrase (max 10 words). This topic phrase will be inserted into the sentence: "For today's conversation, I thought we might discuss {topic}. How does that sound?"

		Only output the topic phrase itself, without any surrounding text or quotation marks.
		
		### AGENDA ###
		${agenda}
		
		### TOPIC PHRASE ###
		`,
	});
	return text;
}

export async function getContextQuery(agenda: string): Promise<string> {
	const { text } = await generateText({
		model: google("gemini-1.5-flash"),
		prompt: ` Summarize the core topic of the following conversation agenda into a concise query phrase (max 50 words) suitable for retrieving relevant context from a knowledge graph or vector database about the user. Only output the query phrase.
		
		### AGENDA ###
		${agenda}
		
		### QUERY PHRASE ###
		`,
	});
	return text;
}
