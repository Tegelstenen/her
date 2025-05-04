"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";

import { ConvAI } from "@/components/conv-ai";
import QuestionBox from "@/components/question-box";

export default function OnboardingPage() {
	const [step, setStep] = useState(0);
	const [answers, setAnswers] = useState({ goal: "", deadline: "", time: "" });
	const isFormValid =
		answers.goal.trim() !== "" &&
		answers.deadline.trim() !== "" &&
		answers.time.trim() !== "";

	const lineWidth = 80;
	const sphereWidth = 80;
	const boxWidth = 20;
	const groupShift = 140;

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

	const handleSubmit = () => setStep(0);

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
				animate={{ x: step === 1 ? -groupShift : 0 }}
				transition={{
					type: "spring",
					stiffness: 60,
					damping: 20,
					mass: 0.7,
					delay: step === 1 ? 0.0 : 0.7,
				}}
			>
				<motion.div
					className={step === 0 ? "cursor-pointer" : undefined}
					style={{ zIndex: 2 }}
					initial={false}
					animate={{ x: step === 1 ? -lineWidth : 0 }}
					transition={{
						type: "spring",
						stiffness: 60,
						damping: 20,
						mass: 0.7,
						delay: step === 1 ? 0.0 : 0.7,
					}}
					whileHover={step === 0 ? { scale: 1.04 } : {}}
					whileTap={step === 0 ? { scale: 0.97 } : {}}
					onClick={() => step === 0 && setStep(1)}
				>
					<ConvAI user_name={"temp"} goals={"temp"} />
				</motion.div>

				<motion.div
					className="absolute h-[1px] rounded-full bg-neutral-700"
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
								left: `calc(50% + ${sphereWidth / 2 + lineWidth + boxWidth / 2}px)`,
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
								isValid={isFormValid}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</motion.div>
	);
}
