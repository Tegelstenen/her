"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef,useState } from "react";

import { ConvAI } from "@/components/conv-ai";
import GoalBox from "@/components/goal-box";
import QuestionBox, { QuestionBoxHandle } from "@/components/question-box";
import { authClient } from "@/lib/auth-client";
import {
	getAggregatedDeadlineDescription,
	getAggregatedGoalDescription,
	getAggregatedTimeDescription,
} from "@/lib/server/actions/conversation";

// Extend Window interface to include our custom property
declare global {
	interface Window {
		__agentIsSpeaking?: boolean;
	}
}

type Role = "user" | "assistant" | "ai";

type ConversationMessage = {
	message: string;
	source: Role;
};

type Session = {
	user: {
		id: string;
		name: string;
	};
};

type AnswersType = {
	goal: string;
	deadline: string;
	time: string;
};

// Helper function for processing each onboarding step
async function processStep<T extends QuestionBoxHandle>({
	messages,
	stepNumber,
	nextStep,
	getTextStream,
	answerKey,
	questionBoxIndex,
	questionBoxRef,
	setAnswers,
	currentStepRef,
	setOnboardingStep,
}: {
	messages: Array<ConversationMessage>;
	stepNumber: number;
	nextStep: number;
	getTextStream: (
		messages: Array<ConversationMessage>,
	) => Promise<AsyncIterable<string>>;
	answerKey: keyof AnswersType;
	questionBoxIndex: number;
	questionBoxRef: React.RefObject<T | null>;
	setAnswers: React.Dispatch<React.SetStateAction<AnswersType>>;
	currentStepRef: React.MutableRefObject<number>;
	setOnboardingStep: React.Dispatch<React.SetStateAction<number>>;
}) {
	console.log(`Processing step ${stepNumber}...`);

	// Get text stream from appropriate function
	const textStream = await getTextStream(messages);
	let textValue = "";

	// Process stream with typewriter effect
	for await (const textPart of textStream) {
		for (const char of textPart) {
			textValue += char;
			setAnswers((prev) => ({ ...prev, [answerKey]: textValue }));
			await new Promise((resolve) => setTimeout(resolve, 30));
		}
	}

	// Ensure UI has updated before moving to next step
	await new Promise((resolve) => setTimeout(resolve, 300));

	// Show next question
	if (questionBoxRef.current) {
		questionBoxRef.current.showNextQuestion(questionBoxIndex);
	}

	// Update both the state and ref
	currentStepRef.current = nextStep;
	setOnboardingStep(nextStep);
	console.log(`Updated to step ${nextStep}`);
}

// Function to generate milestones and handle step 4
async function generateMilestones({
	userId,
	setFlowState,
	setVisualsStep,
}: {
	userId?: string;
	setFlowState: React.Dispatch<
		React.SetStateAction<"onboarding" | "dashboard">
	>;
	setVisualsStep: React.Dispatch<React.SetStateAction<number>>;
}) {
	console.log("*** GENERATING MILESTONES (Step 4) - BEGIN ***");
	console.log("User ID:", userId);

	try {
		// Todo Actually generate milestones here

		// Wait for the agent to finish speaking
		console.log("Step 4: Waiting for agent to finish speaking");

		// Create a function to check if agent is done speaking
		const waitForAgentToFinishSpeaking = () => {
			return new Promise<void>((resolve) => {
				// Function to check agent speaking status
				const checkAgentStatus = () => {
					// Get the custom event status from window
					const agentIsSpeaking = window.__agentIsSpeaking;

					if (agentIsSpeaking === false) {
						console.log("Step 4: Agent has finished speaking");
						resolve();
					} else {
						console.log("Step 4: Agent is still speaking, waiting...");
						setTimeout(checkAgentStatus, 500);
					}
				};

				// Initial delay to ensure agent has started speaking
				setTimeout(() => {
					// First check after delay
					checkAgentStatus();
				}, 1000);
			});
		};

		// Wait up to 10 seconds for the agent to finish speaking
		try {
			const timeoutPromise = new Promise<void>((_, reject) => {
				setTimeout(
					() =>
						reject(new Error("Timeout waiting for agent to finish speaking")),
					10000,
				);
			});

			await Promise.race([waitForAgentToFinishSpeaking(), timeoutPromise]);
		} catch (error) {
			console.warn(
				"Step 4: Timed out waiting for agent to finish speaking, continuing anyway",
				error,
			);
		}

		// Add extra delay after agent finishes speaking
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// End the conversation using the global event system
		console.log("Step 4: Dispatching endConversation event");
		const endConversationEvent = new CustomEvent("endConversation");
		window.dispatchEvent(endConversationEvent);
		console.log("Step 4: endConversation event dispatched");

		// Set onboarding status to complete if userId exists
		if (userId) {
			try {
				console.log("Step 4: Setting hasOnboarded to true for user:", userId);
				// Uncomment this when the server action is fixed
				// await setOnboardingStatus(userId, { hasOnboarded: true });
				console.log("Step 4: Successfully set hasOnboarded to true");
			} catch (statusError) {
				console.error("Error setting onboarding status:", statusError);
			}
		} else {
			console.log(
				"Step 4: No userId provided, skipping onboarding status update",
			);
		}

		// Add a short delay to ensure all events have been processed
		console.log("Step 4: Small delay before dashboard transition");
		await new Promise((resolve) => setTimeout(resolve, 300));

		console.log("Step 4: Transitioning to dashboard (setFlowState)");
		setFlowState("dashboard");
		console.log("Step 4: Setting visuals step to 1");
		setVisualsStep(1);

		console.log("*** GENERATING MILESTONES (Step 4) - COMPLETE ***");
	} catch (step4Error) {
		console.error("*** ERROR IN STEP 4 ***", step4Error);
		// Failsafe - transition to dashboard even if there's an error
		console.log("Step 4 (Error recovery): Transitioning to dashboard");
		setFlowState("dashboard");
		setVisualsStep(1);
	}
}

const goalBoxData = [
	{
		title: "Goal 1",
		weeklyGoals: [
			"First weekly goal",
			"Second weekly goal",
			"Third weekly goal",
		],
		milestones: ["First milestone", "Second milestone", "Third milestone"],
	},
	{
		title: "Goal 2",
		weeklyGoals: ["Another weekly goal"],
		milestones: ["Another milestone"],
	},
];

async function getSession() {
	const { data: session } = await authClient.getSession();
	return session;
}

export default function AccountPage() {
	const [session, setSession] = useState<Session | null>(null);
	const questionBoxRef = useRef<QuestionBoxHandle>(null);

	useEffect(() => {
		getSession().then(setSession);
	}, []);
	const [flowState, setFlowState] = useState<"onboarding" | "dashboard">(
		"onboarding",
	);
	const [visualsStep, setVisualsStep] = useState(0);
	const [onboardingStep, setOnboardingStep] = useState(1);
	const currentStepRef = useRef(1);

	const [answers, setAnswers] = useState<AnswersType>({
		goal: "",
		deadline: "",
		time: "",
	});

	const addDataAndMoveToNextStep = async (
		messages: Array<ConversationMessage>,
	) => {
		try {
			console.log("Received messages to aggregate:", messages);
			console.log("Current onboarding step (state):", onboardingStep);
			console.log("Current onboarding step (ref):", currentStepRef.current);

			if (currentStepRef.current === 1) {
				await processStep({
					messages,
					stepNumber: 1,
					nextStep: 2,
					getTextStream: getAggregatedGoalDescription,
					answerKey: "goal",
					questionBoxIndex: 0,
					questionBoxRef,
					setAnswers,
					currentStepRef,
					setOnboardingStep,
				});
			} else if (currentStepRef.current === 2) {
				await processStep({
					messages,
					stepNumber: 2,
					nextStep: 3,
					getTextStream: getAggregatedDeadlineDescription,
					answerKey: "deadline",
					questionBoxIndex: 1,
					questionBoxRef,
					setAnswers,
					currentStepRef,
					setOnboardingStep,
				});
			} else if (currentStepRef.current === 3) {
				// Process step 3 - Time available
				await processStep({
					messages,
					stepNumber: 3,
					nextStep: 4,
					getTextStream: getAggregatedTimeDescription,
					answerKey: "time",
					questionBoxIndex: 2,
					questionBoxRef,
					setAnswers,
					currentStepRef,
					setOnboardingStep,
				});

				// After step 3 is complete and we've updated to step 4, immediately call generateMilestones
				console.log("Step 3 complete, proceeding to generateMilestones");
				await generateMilestones({
					userId: session?.user.id,
					setFlowState,
					setVisualsStep,
				});
			} else if (currentStepRef.current === 4) {
				// If we're already at step 4 (just in case), make sure we run generateMilestones
				await generateMilestones({
					userId: session?.user.id,
					setFlowState,
					setVisualsStep,
				});
			}
		} catch (error) {
			console.error("Error processing description:", error);
		}
		console.log(`Step ${currentStepRef.current} data:`, messages);
	};

	const lineWidth = 60;
	const sphereWidth = 100;
	const boxGap = 40;
	const numBoxes = goalBoxData.length;

	const onboardingGroupShift = 140;
	const dashboardGroupShift = 270;

	// Adjust sphere position based on flow state
	const sphereXPosition =
		visualsStep === 1
			? flowState === "onboarding"
				? -lineWidth
				: -lineWidth * 1.2
			: 0;

	const sphereScale = flowState === "dashboard" ? 0.85 : 1;

	const containerXPosition =
		visualsStep === 1
			? flowState === "onboarding"
				? -onboardingGroupShift
				: -dashboardGroupShift
			: 0;

	const questions = [
		{
			label: "What is your goal?",
			placeholder: "Be more confident in social situations",
			value: answers.goal,
			onChange: (v: string) => setAnswers((a) => ({ ...a, goal: v })),
			required: true,
		},
		{
			label: "When do you want to reach it?",
			placeholder: "In 3 months",
			value: answers.deadline,
			onChange: (v: string) => setAnswers((a) => ({ ...a, deadline: v })),
			required: true,
		},
		{
			label: "How much time do you have?",
			placeholder: "3 hours a week",
			value: answers.time,
			onChange: (v: string) => setAnswers((a) => ({ ...a, time: v })),
			required: true,
		},
	];

	useEffect(() => {
		if (flowState === "dashboard") {
			const timeout = setTimeout(() => setVisualsStep(1), 600);
			return () => clearTimeout(timeout);
		}
	}, [flowState]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3, ease: "easeInOut" }}
			className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
		>
			<motion.div
				data-fade-content
				className="relative flex h-full min-h-screen w-full items-center justify-center"
				animate={{ x: containerXPosition }}
				transition={{
					type: "spring",
					stiffness: 60,
					damping: 20,
					mass: 0.7,
					delay: visualsStep === 1 ? 0.0 : 0.6,
				}}
			>
				<motion.div
					className={
						visualsStep === 0 && flowState === "onboarding"
							? "cursor-pointer"
							: ""
					}
					initial={false}
					animate={{
						x: sphereXPosition,
						scale: sphereScale,
					}}
					transition={{
						type: "spring",
						stiffness: 60,
						damping: 20,
						mass: 0.7,
						delay: visualsStep === 1 ? 0.0 : 0.6,
					}}
					onClick={() => {
						if (visualsStep === 0 && flowState === "onboarding") {
							const timeout = setTimeout(() => setVisualsStep(1), 10000);
							return () => clearTimeout(timeout);
						}
					}}
				>
					<ConvAI
						first_name={session?.user.name}
						user_id={session?.user.id}
						addDataAndMoveToNextStep={addDataAndMoveToNextStep}
					/>
				</motion.div>

				{flowState === "onboarding" && (
					<>
						<motion.div
							className="absolute h-[1.5px] rounded-full bg-neutral-700"
							initial={{ width: 0, opacity: 0 }}
							animate={{
								width: visualsStep === 1 ? lineWidth : 0,
								opacity: visualsStep === 1 ? 1 : 0,
							}}
							transition={{
								type: "spring",
								stiffness: 60,
								damping: 20,
								delay: visualsStep === 1 ? 0.0 : 0.6,
							}}
							style={{ left: `calc(50% + ${sphereWidth / 2}px)` }}
						/>

						<AnimatePresence mode="wait">
							{visualsStep === 1 && flowState === "onboarding" && (
								<motion.div
									className="absolute"
									style={{
										left: `calc(50% + ${sphereWidth / 2 + lineWidth + 20 / 2}px)`,
										transform: "translate(-50%, -50%)",
									}}
									initial={{ opacity: 0, x: 0 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -100, scale: 0.9 }}
									transition={{
										delay: visualsStep === 1 ? 0.7 : 0.0,
										exit: { duration: 0.3 },
									}}
								>
									<QuestionBox ref={questionBoxRef} questions={questions} />
								</motion.div>
							)}
						</AnimatePresence>
					</>
				)}

				{flowState === "dashboard" && (
					<>
						{numBoxes > 0 && (
							<motion.div
								className="absolute h-[1.5px] rounded-full bg-neutral-700"
								initial={{ width: 0, opacity: 0 }}
								animate={{
									width: visualsStep === 1 ? lineWidth : 0,
									opacity: visualsStep === 1 ? 1 : 0,
								}}
								transition={{
									type: "spring",
									stiffness: 80,
									damping: 20,
									delay: 0.4,
								}}
								style={{
									left: `calc(50% + ${sphereWidth / 2}px)`,
									top: `50%`,
									transform: "translateY(-50%)",
								}}
							/>
						)}

						{numBoxes > 1 && (
							<motion.div
								className="absolute w-[1.5px] rounded-full bg-neutral-700"
								initial={{ height: 0, opacity: 0 }}
								animate={{
									height: visualsStep === 1 ? (numBoxes - 1) * 220 : 0,
									opacity: visualsStep === 1 ? 1 : 0,
								}}
								transition={{
									type: "spring",
									stiffness: 80,
									damping: 20,
									delay: 0.6,
								}}
								style={{
									left: `calc(50% + ${sphereWidth / 2 + lineWidth}px)`,
									top: `calc(50% - ${((numBoxes - 1) * 220) / 2}px)`,
								}}
							/>
						)}

						<div
							className="absolute"
							style={{
								top: "50%",
								left: `calc(50% + ${sphereWidth / 2 + lineWidth}px)`,
								transform: "translateY(-50%)",
								display: "flex",
								flexDirection: "column",
								gap: `${boxGap}px`,
							}}
						>
							<AnimatePresence>
								{visualsStep === 1 &&
									goalBoxData.map((props, idx) => (
										<motion.div
											key={props.title}
											className="relative flex"
											style={{
												marginLeft: lineWidth,
											}}
											initial={{ opacity: 0, x: 50 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 50 }}
											transition={{ delay: 1.0 + 0.15 * idx }}
										>
											<motion.div
												className="absolute h-[1.5px] rounded-full bg-neutral-700"
												style={{
													left: `-${lineWidth}px`,
													top: "50%",
													width: `${lineWidth - 10}px`,
													transform: "translateY(-50%)",
												}}
												initial={{ width: 0, opacity: 0 }}
												animate={{ width: lineWidth - 10, opacity: 1 }}
												exit={{ width: 0, opacity: 0 }}
												transition={{
													delay: 0.8 + 0.15 * idx,
													type: "spring",
													stiffness: 60,
													damping: 20,
												}}
											/>
											<div style={{ position: "relative" }}>
												<GoalBox {...props} />
											</div>
										</motion.div>
									))}
							</AnimatePresence>
						</div>
					</>
				)}
			</motion.div>
		</motion.div>
	);
}
