"use client";

import { useConversation } from "@11labs/react";
import * as React from "react";
import { useCallback } from "react";

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
	user_name,
	goals,
}: Readonly<{ user_name: string; goals: string }>) {
	const conversation = useConversation({
		onConnect: () => {
			console.log("connected");
		},
		onDisconnect: () => {
			console.log("disconnected");
		},
		onError: (error) => {
			console.log(error);
			alert("An error occurred during the conversation");
		},
		onMessage: (message) => {
			console.log(message);
		},
	});

	async function startConversation() {
		const hasPermission = await requestMicrophonePermission();
		if (!hasPermission) {
			alert("No permission");
			return;
		}
		const signedUrl = await getSignedUrl();
		const conversationId = await conversation.startSession({
			signedUrl,
			dynamicVariables: {
				user_name: user_name,
				goals: goals,
			},
		});
		console.log(conversationId);
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
