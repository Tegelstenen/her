"use client";

import { useConversation } from "@11labs/react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
	addConversation,
	addUser,
	changeFirstConversationStatus,
	getAgenda,
	getContextQuery,
	getConversationContext,
	getFirstConversationStatus,
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

export function ConvAI({
	first_name,
	last_name,
	user_id,
	email,
}: Readonly<{
	first_name: string;
	last_name: string;
	user_id: string | undefined;
	email: string;
}>) {
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [isFirstConversation, setIsFirstConversation] = useState(false);

	// Refs to hold the latest values needed in callbacks
	const conversationIdRef = useRef<string | null>(null);
	const isFirstConversationRef = useRef<boolean>(false);
	const userIdRef = useRef<string | undefined>(user_id);
	const emailRef = useRef<string>(email);
	const firstNameRef = useRef<string>(first_name);
	const lastNameRef = useRef<string>(last_name);

	// Update refs whenever state or props change
	useEffect(() => {
		conversationIdRef.current = conversationId;
	}, [conversationId]);

	useEffect(() => {
		isFirstConversationRef.current = isFirstConversation;
	}, [isFirstConversation]);

	useEffect(() => {
		userIdRef.current = user_id;
		emailRef.current = email;
		firstNameRef.current = first_name;
		lastNameRef.current = last_name;
	}, [user_id, email, first_name, last_name]);

	// Define the handler using refs
	const handleConversationEnd = useCallback(() => {
		const currentConversationId = conversationIdRef.current;
		const currentIsFirstConversation = isFirstConversationRef.current;
		const currentUserId = userIdRef.current ?? "";
		const currentEmail = emailRef.current;
		const currentFirstName = firstNameRef.current;
		const currentLastName = lastNameRef.current;

		if (!currentConversationId) {
			console.warn(
				"handleConversationEnd: No conversationId found, cannot record conversation.",
			);
			return;
		}

		if (currentIsFirstConversation) {
			addUser(currentFirstName, currentLastName, currentUserId, currentEmail);
			changeFirstConversationStatus(currentUserId).then((success) => {
				if (!success)
					console.error(
						"Failed to change first conversation status for user:",
						currentUserId,
					);
			});
		}
		addConversation(currentConversationId, currentUserId).then((success) => {
			if (!success)
				console.error(
					"Failed to add conversation for user:",
					currentUserId,
					"conversationId:",
					currentConversationId,
				);
		});
	}, []); // Empty dependency array as it reads from refs

	const conversation = useConversation({
		onConnect: () => {
			console.log("ElevenLabs WS: Connected");
		},
		onDisconnect: () => {
			console.log("--- ElevenLabs WS: onDisconnect Triggered ---");
			handleConversationEnd(); // Call the ref-aware handler
		},
		onError: (error) => {
			console.error("ElevenLabs WS: Error:", error);
			alert(
				"An error occurred during the conversation. Check console for details.",
			);
		},
		onMessage: (message) => {
			console.log(message);
		},
	});

	async function startConversation() {
		try {
			const firstConversationStatus = await getFirstConversationStatus(
				user_id ?? "",
			);
			// Set the state for other parts of the component/future renders
			setIsFirstConversation(firstConversationStatus ?? true);

			// Use the fetched status DIRECTLY for branching logic within this function execution
			const useFirstConversationLogic = firstConversationStatus ?? true;

			const hasPermission = await requestMicrophonePermission();
			if (!hasPermission) {
				alert("Microphone permission is required for the conversation");
				return;
			}

			//  Intantiate initial message and context that Agent will say and use
			let first_message = "";
			let context = "";
			let stringContext = "";
			let agenda = "";
			if (useFirstConversationLogic) {
				agenda =
					"First conversation; get to thoroughly understand the user's goals and challenges";
				first_message = `Hi ${first_name} ${last_name}, I'm your personal coach. I'm here to help you identify goals, overcome challenges, and make meaningful progress in your personal development journey. What's one area of your life where you'd like to see growth or change?`;
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
				first_name: first_name,
				last_name: last_name,
				user_id: user_id ?? "",
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
			console.log(
				"conversation.startSession finished. Conversation ID:",
				convId,
			);

			setConversationId(convId);
		} catch (error) {
			console.error("Failed to start conversation:", error);
			alert("Failed to start conversation. Please try again.");
		}
	}

	const stopConversation = useCallback(async () => {
		await conversation.endSession();
	}, [conversation]);
	return (
		<div className="flex items-center justify-center gap-x-4">
			<div className="flex flex-col items-center text-center">
				<button
					className="group flex h-[250px] w-[250px] cursor-pointer items-center justify-center transition-shadow duration-300"
					onClick={() => {
						if (conversation.status !== "connected") {
							startConversation();
						} else {
							stopConversation();
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
