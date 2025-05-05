import { motion } from "framer-motion";
import React from "react";

import { primaryButtonStyles } from "@/lib/button-styles";

interface Question {
	label: string;
	placeholder?: string;
	type?: string;
	value: string;
	onChange: (value: string) => void;
	required?: boolean;
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
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isValid) {
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
				{questions.map((question, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3, delay: index * 0.0 }}
					>
						<motion.label
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3, delay: 0.0 }}
							className="mb-1 block text-sm font-medium text-white"
						>
							{question.label}
						</motion.label>
						<input
							type={question.type || "text"}
							className="w-full border-b border-gray-300 bg-transparent p-2 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
							placeholder={question.placeholder}
							value={question.value}
							onChange={(e) => question.onChange(e.target.value)}
							required={question.required}
						/>
					</motion.div>
				))}
				<motion.button
					type="submit"
					className={primaryButtonStyles}
					style={{ width: "fit-content" }}
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 0.9 }}
					transition={{ duration: 0.3, delay: 0 }}
					whileHover={{ scale: 0.95 }}
					whileTap={{ scale: 0.88 }}
				>
					{submitLabel}
				</motion.button>
			</motion.form>
		</motion.div>
	);
};

export default QuestionBox;
