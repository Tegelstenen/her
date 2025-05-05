"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

import { ConvAI } from "@/components/conv-ai";
import GoalBox from "@/components/goal-box";
import QuestionBox from "@/components/question-box";
import { authClient } from "@/lib/auth-client";

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
	useEffect(() => {
		getSession().then(setSession);
	}, []);
	const [flowState, setFlowState] = useState<"onboarding" | "dashboard">(
		"onboarding",
	);
	const [step, setStep] = useState(0);

	const [answers, setAnswers] = useState({
		goal: "",
		deadline: "",
		time: "",
	});

	const lineWidth = 60;
	const sphereWidth = 100;
	const boxGap = 40;
	const numBoxes = goalBoxData.length;

	const onboardingGroupShift = 140;
	const dashboardGroupShift = 270;

	const isFormValid = answers.goal && answers.deadline && answers.time;

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

	const handleSubmit = async () => {
		if (session?.user.id) {
			try {
				console.log("Completing onboarding for user:", session.user.id);
			} catch (error) {
				console.error("Error completing onboarding:", error);
			}
		} else {
			console.error("No valid session available for onboarding completion");
		}

		setStep(0);
		setTimeout(() => {
			setFlowState("dashboard");
			setTimeout(() => setStep(1), 600);
		}, 3000);
	};

	useEffect(() => {
		if (flowState === "dashboard") {
			const timeout = setTimeout(() => setStep(1), 600);
			return () => clearTimeout(timeout);
		}
	}, [flowState]);

	const sphereXPosition =
		step === 1 ? (flowState === "onboarding" ? -lineWidth : -lineWidth) : 0;

	const containerXPosition =
		step === 1
			? flowState === "onboarding"
				? -onboardingGroupShift
				: -dashboardGroupShift
			: 0;

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
					delay: step === 1 ? 0.0 : 0.6,
				}}
			>
				<motion.div
					className={
						step === 0 && flowState === "onboarding" ? "cursor-pointer" : ""
					}
					initial={false}
					animate={{ x: sphereXPosition }}
					transition={{
						type: "spring",
						stiffness: 60,
						damping: 20,
						mass: 0.7,
						delay: step === 1 ? 0.0 : 0.6,
					}}
					onClick={() => {
						if (step === 0 && flowState === "onboarding") {
							const timeout = setTimeout(() => setStep(1), 10000);
							return () => clearTimeout(timeout);
						}
					}}
				>
					<ConvAI first_name={session?.user.name} user_id={session?.user.id} />
				</motion.div>

				{flowState === "onboarding" && (
					<>
						<motion.div
							className="absolute h-[1.5px] rounded-full bg-neutral-700"
							initial={{ width: 0, opacity: 0 }}
							animate={{
								width: step === 1 ? lineWidth : 0,
								opacity: step === 1 ? 1 : 0,
							}}
							transition={{
								type: "spring",
								stiffness: 60,
								damping: 20,
								delay: step === 1 ? 0.0 : 0.6,
							}}
							style={{ left: `calc(50% + ${sphereWidth / 2}px)` }}
						/>

						<AnimatePresence>
							{step === 1 && (
								<motion.div
									className="absolute"
									style={{
										left: `calc(50% + ${sphereWidth / 2 + lineWidth + 20 / 2}px)`,
										transform: "translate(-50%, -50%)",
									}}
									initial={{ opacity: 0, x: 0 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 0 }}
									transition={{ delay: step === 1 ? 0.7 : 0.0 }}
								>
									<QuestionBox
										questions={questions}
										onSubmit={handleSubmit}
										submitLabel="Submit"
										isValid={Boolean(isFormValid)}
									/>
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
									width: step === 1 ? lineWidth : 0,
									opacity: step === 1 ? 1 : 0,
								}}
								transition={{
									type: "spring",
									stiffness: 80,
									damping: 20,
									delay: 0.2,
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
									height: step === 1 ? (numBoxes - 1) * 220 : 0,
									opacity: step === 1 ? 1 : 0,
								}}
								transition={{
									type: "spring",
									stiffness: 80,
									damping: 20,
									delay: 0.2,
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
								{step === 1 &&
									goalBoxData.map((props, idx) => (
										<motion.div
											key={props.title}
											className="relative flex"
											style={{
												marginLeft: lineWidth,
											}}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ delay: 0.8 + 0.15 * idx }}
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
													delay: 0.6,
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
