"use client";

import { useConversation } from "@11labs/react";
import React from "react";

import {
	addConversation,
	getAgenda,
	getContextQuery,
	getConversationContext,
	getOnboardingStatus,
	getTopic,
} from "@/lib/server/actions/conversation";

import MovingSphere from "./moving-sphere";

// Extend Window interface to include our custom property
declare global {
	interface Window {
		__agentIsSpeaking?: boolean;
	}
}

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
	handleAggregateStepInfo: (convId: string) => void,
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
		let convId: string | undefined;
		if (!hasOnboarded) {
			const signedUrl = await getSignedUrl("onboarding");
			convId = await conversation.startSession({
				signedUrl,
				dynamicVariables: { user_name: first_name ?? "" },
				clientTools: {
					move_to_next_step: async () => {
						if (convId) {
							await handleAggregateStepInfo(convId);
						} else {
							console.error(
								"Conversation ID is undefined in move_to_next_step",
							);
						}
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
	addDataAndMoveToNextStep: (
		messages: Array<ConversationMessage>,
		convId?: string,
		allMessages?: Array<ConversationMessage>,
	) => Promise<void>;
}>) {
	let messages: Array<ConversationMessage> = [];
	const [convId, setConvId] = React.useState<string | undefined>(undefined);
	// Use a ref for allMessages to ensure it persists across component re-renders
	const allMessagesRef = React.useRef<Array<ConversationMessage>>([]);
	// Use a ref to track if the user has completed onboarding
	const [hasOnboarded, setHasOnboarded] = React.useState<boolean>(false);

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
			allMessagesRef.current.push(message);
			console.log("messages after push:", messages);
			console.log("allMessages array length:", allMessagesRef.current.length);
		},
	});

	// Expose agent speaking status to window for other components to use
	React.useEffect(() => {
		// Add speaking status to window object
		window.__agentIsSpeaking = conversation.isSpeaking;

		// Log when speaking status changes
		if (conversation.status === "connected") {
			console.log(`Agent speaking status changed: ${conversation.isSpeaking}`);
		}
	}, [conversation.isSpeaking, conversation.status]);

	const handleAggregateStepInfo = async (currentConvId: string) => {
		console.log("handleAggregateStepInfo triggered with messages:", messages);
		console.log("Using conversation ID:", currentConvId);
		console.log("All messages array:", allMessagesRef.current);
		// Send current chunk of messages with the conversation ID and all messages
		await addDataAndMoveToNextStep(
			messages,
			currentConvId,
			allMessagesRef.current,
		);
		// Reset messages for next chunk
		messages = [];
		// Don't reset allMessages as we want to keep the entire conversation history
	};

	// Add event listener for ending conversation
	React.useEffect(() => {
		const handleEndConversation = () => {
			console.log("EndConversation event received in ConvAI:", {
				conversationStatus: conversation.status,
				isSpeaking: conversation.isSpeaking,
			});

			if (conversation.status === "connected") {
				console.log("Ending conversation from custom event");
				try {
					conversation.endSession();
					console.log("Successfully called endSession()");
				} catch (error) {
					console.error("Error ending conversation:", error);
				}
			} else {
				console.log("Conversation not in connected state, cannot end it");
			}
		};

		window.addEventListener("endConversation", handleEndConversation);

		return () => {
			window.removeEventListener("endConversation", handleEndConversation);
		};
		// Only re-run this effect if conversation.endSession changes, not the entire conversation object
	}, [conversation.endSession]);

	// Check onboarding status when component mounts
	React.useEffect(() => {
		async function checkOnboardingStatus() {
			if (user_id) {
				const onboardingStatus = await getOnboardingStatus(
					user_id,
					"hasOnboarded",
				);
				setHasOnboarded(!!onboardingStatus);
				console.log("User onboarding status:", onboardingStatus);
			}
		}

		checkOnboardingStatus();
	}, [user_id]);

	async function initConversation() {
		try {
			// Reset allMessages array when starting a new conversation
			allMessagesRef.current = [];

			const id = await startConversation(
				first_name,
				user_id,
				conversation,
				handleAggregateStepInfo,
			);
			if (id) {
				setConvId(id);
			}
		} catch (error) {
			console.error("Failed to initialize conversation:", error);
		}
	}

	async function handleManualEndSession() {
		// Only add conversation if the user has completed onboarding
		if (hasOnboarded && convId && user_id) {
			try {
				console.log("User ended conversation, saving to database");
				await addConversation(convId, user_id, allMessagesRef.current);
				console.log("Conversation saved successfully");
			} catch (error) {
				console.error("Failed to save conversation:", error);
			}
		}

		// End the session in all cases
		conversation.endSession();
	}

	return (
		<div className="flex items-center justify-center gap-x-4">
			<div className="flex flex-col items-center text-center">
				<button
					className="group flex h-[250px] w-[250px] cursor-pointer items-center justify-center transition-shadow duration-300"
					onClick={() => {
						if (conversation.status !== "connected") {
							initConversation();
						} else {
							handleManualEndSession();
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
			</div>
		</div>
	);
}
