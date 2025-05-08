"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

import { ConvAI } from "@/components/conv-ai";
import MilestoneBox, { Milestone } from "@/components/milestone-box";
import QuestionBox, { QuestionBoxHandle } from "@/components/question-box";
import { authClient } from "@/lib/auth-client";
import {
	addConversation,
	generateUserMilestones,
	getAggregatedDeadlineDescription,
	getAggregatedGoalDescription,
	getAggregatedTimeDescription,
	setOnboardingStatus,
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

type UserSession = {
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

// Define SubtaskUpdate interface locally since it's not exported from milestone-box
interface SubtaskUpdate {
	milestoneId: number;
	subtaskId: string;
	completed: boolean;
}

// Define MilestoneUpdate interface locally
interface MilestoneUpdate {
	milestoneId: number;
	completed: boolean;
}

// Add a local extension of the Milestone type to include prerequisites
interface ExtendedMilestone extends Milestone {
	prerequisites?: number[];
}

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
	convId,
	allMessages,
	conversationAddedRef,
	setMilestones,
	setIsGeneratingMilestones,
}: {
	userId?: string;
	setFlowState: React.Dispatch<
		React.SetStateAction<"onboarding" | "dashboard">
	>;
	setVisualsStep: React.Dispatch<React.SetStateAction<number>>;
	convId?: string;
	allMessages?: Array<ConversationMessage>;
	conversationAddedRef: React.MutableRefObject<boolean>;
	setMilestones: React.Dispatch<React.SetStateAction<ExtendedMilestone[]>>;
	setIsGeneratingMilestones: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	console.log("*** GENERATING MILESTONES (Step 4) - BEGIN ***");
	console.log("User ID:", userId);
	console.log("Conversation ID:", convId);
	console.log("All messages count:", allMessages?.length);

	// Important: Do this once at the beginning to ensure we don't have any race conditions
	// If we have successfully added this conversation already, skip adding it again
	if (conversationAddedRef.current) {
		console.log(
			"Step 4: Conversation was already added in a previous call, skipping add",
		);
	}

	try {
		// End the conversation using the global event system, but only if it hasn't been ended already
		// Wait for 5 seconds before ending the conversation
		await new Promise((resolve) => setTimeout(resolve, 2000));
		console.log("Step 4: Dispatching endConversation event");
		const endConversationEvent = new CustomEvent("endConversation");
		window.dispatchEvent(endConversationEvent);
		console.log("Step 4: endConversation event dispatched");

		// Set the loading state to true to show the agent waiting animation
		setIsGeneratingMilestones(true);

		// Generate milestones if we have a userId
		if (userId) {
			try {
				console.log("Step 4: Generating milestones for user:", userId);
				const goalData = await generateUserMilestones(userId);

				if (goalData && goalData.milestones) {
					// Transform the API milestone format to match our ExtendedMilestone format
					const transformedMilestones: ExtendedMilestone[] =
						goalData.milestones.map(
							(
								milestone: {
									title: string;
									description?: string;
									expected_completion_date?: string;
									estimated_hours?: number;
									subtasks?: Array<{
										description: string;
										estimated_minutes: number;
									}>;
									metric?: {
										measurement: string;
										target_value?: number;
									};
								},
								index: number,
							) => {
								// Create proper subtask objects with IDs
								const subtasks =
									milestone.subtasks?.map(
										(
											subtask: {
												description: string;
												estimated_minutes: number;
											},
											subtaskIndex: number,
										) => ({
											id: `${index + 1}.${subtaskIndex + 1}`,
											description: subtask.description,
											estimated_minutes: subtask.estimated_minutes,
											completed: false,
										}),
									) || [];

								return {
									id: index + 1,
									title: milestone.title,
									description: milestone.description || "",
									expected_completion_date:
										milestone.expected_completion_date || "",
									estimated_hours: milestone.estimated_hours || 0,
									completed: false,
									metrics: milestone.metric
										? {
												measurement: milestone.metric.measurement,
												target_value: milestone.metric.target_value || 0,
											}
										: undefined,
									subtasks,
									resources: [],
									// Add prerequisite logic based on index if needed
									prerequisites: index > 0 ? [index] : undefined,
								};
							},
						);

					console.log("Step 4: Setting milestones from API data");
					setMilestones(transformedMilestones);
				} else {
					console.error("Step 4: Invalid milestone data format received");
				}
			} catch (milestoneError) {
				console.error("Step 4: Error generating milestones:", milestoneError);
				// If milestone generation fails, we'll use the placeholder milestones
				console.log("Step 4: Falling back to placeholder milestones");
			}
		}

		// Try to add conversation to database if it hasn't been added already
		if (convId && userId && !conversationAddedRef.current) {
			console.log(
				"Step 4: Adding conversation with ID:",
				convId,
				"for user:",
				userId,
				"with allMessages:",
				allMessages,
			);
			try {
				await addConversation(convId, userId, allMessages);
				console.log("Step 4: Successfully added conversation");
				// Mark the conversation as added IMMEDIATELY after the successful call
				conversationAddedRef.current = true;
			} catch (convError) {
				// Check if the error is because the session already exists
				const errorMessage =
					convError instanceof Error ? convError.message : String(convError);
				if (errorMessage.includes("session already exists")) {
					console.log("Step 4: Session already exists, marking as added");
					conversationAddedRef.current = true;
				} else {
					// Log the error but continue with the process
					console.error(
						"Step 4: Failed to add conversation, but continuing:",
						convError,
					);
				}
			}
		} else if (!conversationAddedRef.current) {
			if (!convId) {
				console.error(
					"Step 4: Conversation ID is undefined when trying to add conversation",
				);
			} else if (!userId) {
				console.error(
					"Step 4: User ID is undefined when trying to add conversation",
				);
			}
		}

		// Set onboarding status to complete if userId exists
		if (userId) {
			try {
				console.log("Step 4: Setting hasOnboarded to true for user:", userId);
				// Uncomment this when the server action is fixed
				await setOnboardingStatus(userId, { hasOnboarded: true });
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
		// Reset the loading state when milestone generation is complete
		setIsGeneratingMilestones(false);
	} catch (step4Error) {
		console.error("*** ERROR IN STEP 4 ***", step4Error);
		// Reset the loading state on error
		setIsGeneratingMilestones(false);
		// Failsafe - transition to dashboard even if there's an error
		console.log("Step 4 (Error recovery): Transitioning to dashboard");
		setFlowState("dashboard");
		setVisualsStep(1);
	}
}

async function getSession() {
	const { data: session } = await authClient.getSession();
	return session;
}

export default function AccountPage() {
	const [session, setSession] = useState<UserSession | null>(null);
	const questionBoxRef = useRef<QuestionBoxHandle>(null);
	// Add a ref to track if conversation was already added
	const conversationAddedRef = useRef(false);
	// State to track when milestones are being generated
	const [isGeneratingMilestones, setIsGeneratingMilestones] = useState(false);

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

	// Update placeholderMilestones to use ExtendedMilestone
	const placeholderMilestones: ExtendedMilestone[] = [
		{
			id: 1,
			title: "Start small conversations",
			description:
				"Practice initiating brief conversations with people you encounter",
			expected_completion_date: "2024-04-15",
			estimated_hours: 5,
			completed: false,
			metrics: {
				measurement: "Number of conversations initiated",
				target_value: 10,
			},
			subtasks: [
				{
					id: "1.1",
					description: "Prepare conversation starters",
					estimated_minutes: 30,
					completed: false,
				},
				{
					id: "1.2",
					description: "Practice with cashiers/baristas",
					estimated_minutes: 120,
					completed: false,
				},
			],
			resources: [
				{
					type: "article",
					description: "Guide to small talk fundamentals",
				},
			],
		},
		{
			id: 2,
			title: "Join group activities",
			description:
				"Participate in structured social events where conversation is expected",
			expected_completion_date: "2024-05-15",
			estimated_hours: 12,
			completed: false,
			prerequisites: [1],
			metrics: {
				measurement: "Hours spent in group activities",
				target_value: 8,
			},
			subtasks: [
				{
					id: "2.1",
					description: "Research and find 3 local meetup groups",
					estimated_minutes: 60,
					completed: false,
				},
				{
					id: "2.2",
					description: "Attend first meetup as an observer",
					estimated_minutes: 120,
					completed: false,
				},
				{
					id: "2.3",
					description: "Participate actively in group discussions",
					estimated_minutes: 180,
					completed: false,
				},
			],
			resources: [
				{
					type: "tool",
					description: "Local meetup finding platforms",
				},
				{
					type: "article",
					description: "Tips for joining new social groups",
				},
			],
		},
		{
			id: 3,
			title: "Lead group discussions",
			description:
				"Take initiative in social situations by leading conversations and activities",
			expected_completion_date: "2024-06-15",
			estimated_hours: 15,
			completed: false,
			prerequisites: [1, 2],
			metrics: {
				measurement: "Number of discussions/activities led",
				target_value: 3,
			},
			subtasks: [
				{
					id: "3.1",
					description: "Prepare discussion topics beforehand",
					estimated_minutes: 90,
					completed: false,
				},
				{
					id: "3.2",
					description: "Volunteer to lead a small group activity",
					estimated_minutes: 120,
					completed: false,
				},
				{
					id: "3.3",
					description: "Practice active listening and facilitation",
					estimated_minutes: 180,
					completed: false,
				},
				{
					id: "3.4",
					description: "Get feedback from group members",
					estimated_minutes: 60,
					completed: false,
				},
			],
			resources: [
				{
					type: "video",
					description: "Group facilitation techniques",
				},
				{
					type: "article",
					description: "Leadership communication strategies",
				},
			],
		},
	];

	const [milestones, setMilestones] = useState<ExtendedMilestone[]>(
		placeholderMilestones,
	);

	const addDataAndMoveToNextStep = async (
		messages: Array<ConversationMessage>,
		convId?: string,
		allMessages?: Array<ConversationMessage>,
	) => {
		try {
			console.log("Received messages to aggregate:", messages);
			console.log("Current onboarding step (state):", onboardingStep);
			console.log("Current onboarding step (ref):", currentStepRef.current);
			console.log("Conversation ID:", convId);
			console.log("All messages received:", allMessages?.length);

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

				// After step 3 is complete and we've updated to step 4, proceed to generateMilestones
				console.log("Step 3 complete, proceeding to generateMilestones");

				// Continue with milestone generation - conversation adding is now handled inside generateMilestones
				await generateMilestones({
					userId: session?.user.id,
					setFlowState,
					setVisualsStep,
					convId,
					allMessages,
					conversationAddedRef,
					setMilestones,
					setIsGeneratingMilestones,
				});
			} else if (currentStepRef.current === 4) {
				// If we're already at step 4 (just in case), make sure we run generateMilestones
				await generateMilestones({
					userId: session?.user.id,
					setFlowState,
					setVisualsStep,
					convId,
					allMessages,
					conversationAddedRef,
					setMilestones,
					setIsGeneratingMilestones,
				});
			}
		} catch (error) {
			console.error("Error processing description:", error);
		}
		console.log(`Step ${currentStepRef.current} data:`, messages);
	};

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

	const lineWidth = 60;
	const sphereWidth = 100;

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

	const goal = {
		title: "Become more confident in social situations",
		description: "Improve confidence and social skills over 3 months",
		target_date: "2024-06-30",
		estimated_total_hours: 40,
		milestones: milestones as ExtendedMilestone[],
	};

	const handleSubtaskUpdate = async (update: SubtaskUpdate) => {
		// TODO: Add API call
		setMilestones((currentMilestones) =>
			currentMilestones.map((milestone) =>
				milestone.id === update.milestoneId
					? {
							...milestone,
							subtasks: milestone.subtasks?.map((subtask) =>
								subtask.id === update.subtaskId
									? { ...subtask, completed: update.completed }
									: subtask,
							),
						}
					: milestone,
			),
		);
	};

	const handleMilestoneUpdate = async (update: MilestoneUpdate) => {
		// TODO: Add API call
		setMilestones((currentMilestones) =>
			currentMilestones.map((milestone) =>
				milestone.id === update.milestoneId
					? {
							...milestone,
							completed: update.completed,
							// Optionally, update all subtasks when milestone is completed
							subtasks:
								milestone.subtasks?.map((subtask) => ({
									...subtask,
									completed: update.completed,
								})) || [],
						}
					: milestone,
			),
		);
	};

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
						isLoading={isGeneratingMilestones}
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
							<MilestoneBox
								goal={goal}
								milestones={milestones}
								onSubtaskUpdate={handleSubtaskUpdate}
								onMilestoneUpdate={handleMilestoneUpdate}
							/>
						</motion.div>
					</>
				)}
			</motion.div>
		</motion.div>
	);
}
