"use client";

import { useConversation } from "@11labs/react";

import {
	getAgenda,
	getContextQuery,
	getConversationContext,
	getOnboardingStatus,
	getTopic,
} from "@/lib/server/actions/conversation";

import MovingSphere from "./moving-sphere";

type Role = "user" | "assistant" | "ai";

interface ConversationMessage {
	message: string;
	source: Role;
}

type Conversation = ReturnType<typeof useConversation>;

async function requestMicrophonePermission() {
	try {
		await navigator.mediaDevices.getUserMedia({ audio: true });
		return true;
	} catch {
		console.error("Microphone permission denied");
		return false;
	}
}

async function getSignedUrl(
	agentType: "onboarding" | "coaching",
): Promise<string> {
	if (!agentType) {
		throw new Error("Agent type is required");
	}

	const response = await fetch(
		`/api/signed-url?agentType=${encodeURIComponent(agentType)}`,
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw Error(errorData.error || "Failed to get signed url");
	}

	const data = await response.json();
	return data.signedUrl;
}

async function startConversation(
	first_name: string | undefined,
	user_id: string | undefined,
	conversation: Conversation,
	handleAggregateStepInfo: () => void,
) {
	try {
		// Check if microphone permission is granted
		const hasPermission = await requestMicrophonePermission();
		if (!hasPermission) {
			alert("Microphone permission is required for the conversation");
			return;
		}

		// Check if user needs onboarding
		const hasOnboarded = await getOnboardingStatus(
			user_id ?? "",
			"hasOnboarded",
		);

		// Get signed URL for ElevenLabs based on user status
		let convId;
		if (!hasOnboarded) {
			const signedUrl = await getSignedUrl("onboarding");
			convId = await conversation.startSession({
				signedUrl,
				dynamicVariables: { user_name: first_name ?? "" },
				clientTools: {
					addDataAndMoveToNextStep: () => {
						handleAggregateStepInfo();
					},
				},
			});
		} else {
			const agenda = await getAgenda(user_id ?? "");
			const topic = await getTopic(agenda);
			const context_query = await getContextQuery(agenda);
			const first_message = `Welcome back, ${first_name ?? "there"}! It's great to connect with you again. For today's conversation, I thought we might discuss ${topic}. How does that sound?`;
			const context = await getConversationContext(
				user_id ?? "",
				context_query,
			);
			// Ensure context is a string for the agent
			const stringContext =
				typeof context === "string" ? context : JSON.stringify(context);

			const signedUrl = await getSignedUrl("coaching");

			// Prepare dynamic variables
			const dynamicVariables = {
				first_message,
				user_name: first_name ?? "",
				user_context: stringContext,
				conversation_agenda: agenda,
			};

			convId = await conversation.startSession({
				signedUrl,
				dynamicVariables,
			});
		}

		console.log("conversation.startSession finished. Conversation ID:", convId);

		return convId;
	} catch (error) {
		console.error("Failed to start conversation:", error);
		if (error instanceof Error) {
			alert(`Failed to start conversation: ${error.message}`);
		} else {
			alert("Failed to start conversation. Please try again.");
		}
	}
}

function handleConversationEnd() {
	// TODO: Save conversation to zep using the add conversation endpoint, not implemented to prevent cluttering the database
	console.log("Conversation ended");
}

export function ConvAI({
	first_name,
	user_id,
	addDataAndMoveToNextStep,
}: Readonly<{
	first_name: string | undefined;
	user_id: string | undefined;
	addDataAndMoveToNextStep: (messages: Array<ConversationMessage>) => void;
}>) {
	let messages: Array<ConversationMessage> = [];

	const conversation = useConversation({
		onConnect: () => {
			console.log("ElevenLabs: Connected");
		},
		onDisconnect: () => {
			console.log("ElevenLabs: onDisconnect Triggered");
			handleConversationEnd();
		},
		onError: (error) => {
			console.error("ElevenLabs Error:", error);
			alert(
				"An error occurred during the conversation. Check console for details.",
			);
		},
		onMessage: (message) => {
			console.log(message);
			messages.push(message);
			console.log("messages after setMessages:", messages);
		},
	});

	const handleAggregateStepInfo = () => {
		console.log("handleAggregateStepInfo triggered with messages:", messages);
		// Send current chunk of messages
		addDataAndMoveToNextStep(messages);
		// Reset messages for next chunk
		messages = [];
	};

	return (
		<div className="flex items-center justify-center gap-x-4">
			<div className="flex flex-col items-center text-center">
				<button
					className="group flex h-[250px] w-[250px] cursor-pointer items-center justify-center transition-shadow duration-300"
					onClick={() => {
						if (conversation.status !== "connected") {
							startConversation(
								first_name,
								user_id,
								conversation,
								handleAggregateStepInfo,
							);
						} else {
							conversation.endSession();
						}
					}}
					title={
						conversation.status !== "connected"
							? "Start conversation"
							: "End conversation"
					}
					aria-label={
						conversation.status !== "connected"
							? "Start conversation"
							: "End conversation"
					}
				>
					<MovingSphere
						status={
							conversation.status === "connected"
								? conversation.isSpeaking
									? "agentspeaking"
									: "agentlistening"
								: conversation.status === "disconnected"
									? "disconnected"
									: "connected"
						}
					/>
				</button>
				<span className="text-white">
					{conversation.status === "connected"
						? conversation.isSpeaking
							? "Agent is speaking"
							: "Agent is listening"
						: "Press sphere start conversation"}
				</span>
				{/* <Button onClick={handleAggregateStepInfo}>Aggregate step info</Button> */}
			</div>
		</div>
	);
}
