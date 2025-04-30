"use client";

import { useConversation } from "@11labs/react";
import * as React from "react";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import EnhancedOrb from "./enhanced-orb";

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
		<div className={"flex items-center justify-center gap-x-4"}>
			<Card className={"rounded-3xl"}>
				<CardContent>
					<CardHeader>
						<CardTitle className={"text-center"}>
							{conversation.status === "connected"
								? conversation.isSpeaking
									? `Agent is speaking`
									: "Agent is listening"
								: "Disconnected"}
						</CardTitle>
					</CardHeader>
					<div className={"flex flex-col gap-y-4 text-center"}>
						<div className={"mx-12 my-16 h-44 w-44"}>
							<EnhancedOrb
								speaking={
									conversation.status === "connected" && conversation.isSpeaking
								}
								connected={conversation.status === "connected"}
								color1="#2792DC" // Primary color - you can customize this
								color2="#9CE6E6" // Secondary color - you can customize this
							/>
						</div>

						<Button
							variant={"outline"}
							className={"rounded-full"}
							size={"lg"}
							disabled={
								conversation !== null && conversation.status === "connected"
							}
							onClick={() => startConversation()}
						>
							Start conversation
						</Button>
						<Button
							variant={"outline"}
							className={"rounded-full"}
							size={"lg"}
							disabled={conversation === null}
							onClick={stopConversation}
						>
							End conversation
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
