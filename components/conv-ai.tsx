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

async function requestMicrophonePermission() {
	try {
		await navigator.mediaDevices.getUserMedia({ audio: true });
		return true;
	} catch {
		console.error("Microphone permission denied");
		return false;
	}
}

async function getSignedUrl(): Promise<string> {
	const response = await fetch("/api/signed-url");
	if (!response.ok) {
		throw Error("Failed to get signed url");
	}
	const data = await response.json();
	return data.signedUrl;
}

async function startConversation(
	first_name: string | undefined,
	user_id: string | undefined,
	conversation: Conversation,
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

		//  Intantiate initial message and context that Agent will say and use
		let first_message = "";
		let context = "";
		let stringContext = "";
		let agenda = "";
		if (!hasOnboarded) {
			agenda =
				"First conversation; get to thoroughly understand the user's goals and challenges";
			first_message = `Hi ${first_name}, I'm your personal coach. I'm here to help you identify goals, overcome challenges, and make meaningful progress in your personal development journey. What's one area of your life where you'd like to see growth or change?`;
			context =
				"First conversation; no context; get to thoroughly understand the user's goals and challenges";
			stringContext = context;
		} else {
			agenda = await getAgenda(user_id ?? "");
			const topic = await getTopic(agenda);
			const context_query = await getContextQuery(agenda);
			first_message = `Welcome back, ${first_name}! It's great to connect with you again. For today's conversation, I thought we might discuss ${topic}. How does that sound?`;
			context = await getConversationContext(user_id ?? "", context_query);
			// Ensure context is a string for the agent
			stringContext =
				typeof context === "string" ? context : JSON.stringify(context);
		}

		// Get signed URL for ElevenLabs
		const signedUrl = await getSignedUrl();
		console.log("Obtained Signed URL:", signedUrl);

		// Prepare dynamic variables
		const dynamicVariables = {
			first_message: first_message,
			user_name: first_name,
			user_context: stringContext,
			conversation_agenda: agenda,
		};
		console.log("Dynamic Variables for startSession:", dynamicVariables);

		// Start conversation session
		console.log("Calling conversation.startSession...");
		const convId = await conversation.startSession({
			signedUrl,
			dynamicVariables: dynamicVariables,
		});
		console.log("conversation.startSession finished. Conversation ID:", convId);

		return convId;
	} catch (error) {
		console.error("Failed to start conversation:", error);
		alert("Failed to start conversation. Please try again.");
	}
}

function handleConversationEnd() {
	console.log("Conversation ended");
}

export function ConvAI({
	first_name,
	user_id,
}: Readonly<{
	first_name: string | undefined;
	user_id: string | undefined;
}>) {
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
		},
	});

	return (
		<div className="flex items-center justify-center gap-x-4">
			<div className="flex flex-col items-center text-center">
				<button
					className="group flex h-[250px] w-[250px] cursor-pointer items-center justify-center transition-shadow duration-300"
					onClick={() => {
						if (conversation.status !== "connected") {
							startConversation(first_name, user_id, conversation);
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
			</div>
		</div>
	);
}
