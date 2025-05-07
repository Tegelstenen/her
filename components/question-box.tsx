import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";

import { Label } from "@/components/ui/label";
import { primaryButtonStyles } from "@/lib/button-styles";

interface Question {
	label: string;
	placeholder?: string;
	type?: string;
	value: string;
	onChange: (value: string) => void;
	required?: boolean;
	errorMessage?: string;
}

interface QuestionBoxProps {
	title?: string;
	questions: Question[];
	onSubmit: () => void;
	submitLabel?: string;
	isValid?: boolean;
}

const QuestionBox: React.FC<QuestionBoxProps> = ({
	title,
	questions,
	onSubmit,
	submitLabel = "Submit",
	isValid = true,
}) => {
	const [errors, setErrors] = useState<Record<number, string>>({});
	const [visibleQuestions, setVisibleQuestions] = useState<number[]>([0]);
	const [isExpanding, setIsExpanding] = useState<boolean>(false);
	const [showSubmitButton, setShowSubmitButton] = useState<boolean>(false);

	const showNextQuestion = (currentIndex: number) => {
		if (currentIndex < questions.length - 1) {
			setIsExpanding(true);

			setTimeout(() => {
				setVisibleQuestions((prev) => [...prev, currentIndex + 1]);
				setTimeout(() => {
					setIsExpanding(false);
				}, 300);
			}, 400);
		} else if (currentIndex === questions.length - 1 && !showSubmitButton) {
			setIsExpanding(true);

			setTimeout(() => {
				setShowSubmitButton(true);
				setTimeout(() => {
					setIsExpanding(false);
				}, 200);
			}, 100);
		}
	};

	const delayFunctions = questions.map((_, index) => {
		return (value: string) => {
			questions[index].onChange(value);

			if (value && !visibleQuestions.includes(index + 1)) {
				setTimeout(() => {
					showNextQuestion(index);
				}, 500);
			}
		};
	});

	const validateQuestions = (): boolean => {
		const newErrors: Record<number, string> = {};
		let isFormValid = true;

		questions.forEach((question, index) => {
			if (question.required && !question.value) {
				newErrors[index] = `Required field`;
				isFormValid = false;
			}
		});

		setErrors(newErrors);
		return isFormValid;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const isFormValid = validateQuestions();
		if (isFormValid && isValid) {
			onSubmit();
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3, delay: 0 }}
			className="flex min-w-[340px] flex-col gap-8 rounded-3xl border border-neutral-700 px-6 py-6 shadow-lg backdrop-blur-md"
		>
			{title && (
				<motion.h2
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3, delay: 0.0 }}
					className="text-xl font-semibold text-white"
				>
					{title}
				</motion.h2>
			)}
			<motion.form
				onSubmit={handleSubmit}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3, delay: 0.0 }}
				className="flex flex-col gap-6"
			>
				<motion.div
					className="flex flex-col gap-6"
					animate={{
						height: isExpanding ? "auto" : "auto",
						transition: { duration: 0.2, ease: "easeInOut" },
					}}
					style={{ overflow: "hidden" }}
				>
					{questions.map(
						(question, index) =>
							visibleQuestions.includes(index) && (
								<motion.div
									key={index}
									className="space-y-2"
									initial={{ opacity: 0, height: 0, y: 20 }}
									animate={{
										opacity: 1,
										height: "auto",
										y: 0,
									}}
									transition={{
										height: { duration: 0.3, delay: 0 },
										opacity: { duration: 0.3, delay: 0.1 },
										y: { duration: 0.3, delay: 0.1 },
									}}
								>
									<div className="flex-1">
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.3, delay: 0.2 }}
										>
											<Label
												className="block text-sm font-medium text-white"
												htmlFor={`question-${index}`}
											>
												{question.label}
											</Label>
										</motion.div>
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.3, delay: 0.2 }}
										>
											<input
												id={`question-${index}`}
												type={question.type || "text"}
												className="w-full border-b border-gray-300 bg-transparent p-2 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
												placeholder={question.placeholder}
												value={question.value}
												onChange={(e) => {
													delayFunctions[index](e.target.value);
													if (errors[index]) {
														setErrors((prev) => {
															const newErrors = { ...prev };
															delete newErrors[index];
															return newErrors;
														});
													}
												}}
											/>
										</motion.div>
										<AnimatePresence initial={false}>
											{errors[index] && (
												<motion.div
													key={`error-${index}`}
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: "auto", opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													transition={{ duration: 0.2, ease: "easeInOut" }}
													className="overflow-hidden"
												>
													<p className="mt-2 text-sm text-red-400">
														{errors[index]}
													</p>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								</motion.div>
							),
					)}
				</motion.div>

				{showSubmitButton && (
					<motion.div
						key="submit-button"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						transition={{
							height: { duration: 0.3, delay: 0 },
							opacity: { duration: 0.3, delay: 0.5 },
						}}
						className="mt-2"
					>
						<motion.button
							type="submit"
							className={primaryButtonStyles}
							style={{ width: "fit-content" }}
							whileHover={{ scale: 0.95 }}
							whileTap={{ scale: 0.88 }}
						>
							{submitLabel}
						</motion.button>
					</motion.div>
				)}
			</motion.form>
		</motion.div>
	);
};

export default QuestionBox;
