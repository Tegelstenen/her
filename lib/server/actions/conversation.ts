"use server";

import "dotenv/config";

import { google } from "@ai-sdk/google";
import { generateText, streamText } from "ai";
import { eq } from "drizzle-orm";
import { ElevenLabsClient } from "elevenlabs";

import { db } from "@/lib/server/db/db";
import { onboarding } from "@/lib/server/db/schemas/conversation-schema";

type Role = "user" | "assistant" | "ai";

type ConversationMessage = {
	message: string;
	source: Role;
};

export async function setOnboardingStatus(
	userId: string,
	fields: Partial<{
		hasBeenAdded: boolean;
		hasChangedName: boolean;
		hasOnboarded: boolean;
	}>,
) {
	try {
		if (!userId) {
			console.error("No userId provided to setOnboardingStatus");
			return false;
		}

		console.log(`Setting onboarding status for user ${userId}`);

		// Create base values object
		const values: {
			userId: string;
			updatedAt: Date;
			hasBeenAdded?: boolean;
			hasChangedName?: boolean;
			hasOnboarded?: boolean;
		} = {
			userId: userId,
			updatedAt: new Date(),
		};

		// Only include fields that were provided
		if (fields.hasBeenAdded !== undefined)
			values.hasBeenAdded = fields.hasBeenAdded;
		if (fields.hasChangedName !== undefined)
			values.hasChangedName = fields.hasChangedName;
		if (fields.hasOnboarded !== undefined)
			values.hasOnboarded = fields.hasOnboarded;

		// Use upsert pattern to either insert or update
		await db
			.insert(onboarding)
			.values({
				...values,
				createdAt: new Date(),
			})
			.onConflictDoUpdate({
				target: onboarding.userId,
				set: values,
			});

		return true;
	} catch (error) {
		console.error("Error changing onboarding status:", error);
		return false;
	}
}

export async function getOnboardingStatus(
	userId: string,
	field?: "hasBeenAdded" | "hasChangedName" | "hasOnboarded",
) {
	try {
		if (!userId) {
			console.error("No userId provided to getOnboardingStatus");
			return field ? false : { hasOnboarded: false };
		}

		const result = await db
			.select({
				hasBeenAdded: onboarding.hasBeenAdded,
				hasChangedName: onboarding.hasChangedName,
				hasOnboarded: onboarding.hasOnboarded,
			})
			.from(onboarding)
			.where(eq(onboarding.userId, userId));

		if (result.length === 0) {
			// If no record exists, create one
			console.log(`Creating new onboarding record for user: ${userId}`);
			try {
				await db.insert(onboarding).values({
					userId: userId,
					hasBeenAdded: false,
					hasChangedName: false,
					hasOnboarded: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			} catch (insertError) {
				console.error("Error creating onboarding record:", insertError);
				// If insert fails (e.g., due to race condition), just return default values
			}
			return field ? false : { hasOnboarded: false };
		}

		return field ? result[0][field] : result[0];
	} catch (error) {
		console.error("Error fetching onboarding status:", error);
		return field ? false : { hasOnboarded: false };
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
		console.log(`Attempting to add user to knowledge graph: ${userId}`);
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

		const result = await response.json();
		console.log(
			`Successfully added user to knowledge graph: ${userId}`,
			result,
		);
		return result;
	} catch (error) {
		console.error("Error in addUser:", error);
		throw error;
	}
}

// Update an existing user
export async function updateUser(
	firstName: string,
	lastName: string,
	userId: string,
	email: string,
) {
	try {
		const response = await fetch(
			`https://tegelstenen--her-update-user.modal.run?first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&user_id=${userId}&email=${encodeURIComponent(email)}`,
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
				`Failed to update user: ${response.status} ${response.statusText} - ${errorText}`,
			);
		}

		return response.json();
	} catch (error) {
		console.error("Error in updateUser:", error);
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

export async function getAggregatedGoalDescription(
	messages: Array<ConversationMessage>,
): Promise<AsyncIterable<string>> {
	console.log("Received messages to llm:", messages);
	const { textStream } = streamText({
		model: google("gemini-2.0-flash"),
		prompt: `Given the conversation history below, what are the user's goals? Respond with a concise description of the goals. Your output will be directly printed underneath the heading "What is your goal?" (do not include this heading in your output)
		
		### CONVERSATION HISTORY ###
		${messages.map((m) => `${m.source}: ${m.message}`).join("\n")}
		`,
	});
	return textStream;
}

export async function getAggregatedDeadlineDescription(
	messages: Array<ConversationMessage>,
): Promise<AsyncIterable<string>> {
	const { textStream } = streamText({
		model: google("gemini-2.0-flash"),
		prompt: `You just had a conversation with the user about their goals. The conversation history below regards the timeline / deadline, when does the user want to reach their goal? Respond with a concise description of the timeline. Your output will be directly printed underneath the heading "When do you want to reach your goal?" (do not include this heading in your output)
		
		### CONVERSATION HISTORY ###
		${messages.map((m) => `${m.source}: ${m.message}`).join("\n")}
		`,
	});
	return textStream;
}

export async function getAggregatedTimeDescription(
	messages: Array<ConversationMessage>,
): Promise<AsyncIterable<string>> {
	const { textStream } = streamText({
		model: google("gemini-2.0-flash"),
		prompt: `You just had a conversation with the user about their goals and their timeline. Given the conversation history below, how much time and dedication does the user have available to work on their goal? Respond with a concise description of their availability. Your output will be directly printed underneath the heading "How much time do you have?" (do not include this heading in your output)
		
		### CONVERSATION HISTORY ###
		${messages.map((m) => `${m.source}: ${m.message}`).join("\n")}
		`,
	});
	return textStream;
}

export async function text2Speach(text: string, agentType: string) {
	const agentId =
		agentType === "onboarding"
			? process.env.ONBOARDING_AGENT_ID
			: process.env.COACH_AGENT_ID;
	if (!agentId) {
		throw new Error("Agent ID not found");
	}
	const client = new ElevenLabsClient();
	const audio = await client.textToSpeech.convert(agentId, {
		text: text,
		model_id: "eleven_multilingual_v2",
		output_format: "mp3_44100_128",
	});
	return audio;
}
