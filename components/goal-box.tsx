import { motion } from "framer-motion";
import React, { useState } from "react";

interface GoalBoxProps {
	title?: string;
	weeklyGoals?: string[];
	milestones?: string[];
	width?: string;
	height?: string;
}

const GoalBox: React.FC<GoalBoxProps> = ({
	title = "Goal 1",
	weeklyGoals = ["Do this here now", "Do this", "Here now"],
	milestones = ["Do this here now", "Do this", "Here now"],
	width = "500px",
	height = "180px",
}) => {
	const [crossedWeekly, setCrossedWeekly] = useState<boolean[]>(
		weeklyGoals.map(() => false),
	);
	const [crossedMilestone, setCrossedMilestone] = useState<boolean[]>(
		milestones.map(() => false),
	);

	const handleWeeklyClick = (idx: number) => {
		setCrossedWeekly((prev) => prev.map((v, i) => (i === idx ? true : v)));
	};
	const handleMilestoneClick = (idx: number) => {
		setCrossedMilestone((prev) => prev.map((v, i) => (i === idx ? true : v)));
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="relative rounded-3xl border border-neutral-700 bg-transparent px-6 py-6 shadow-lg backdrop-blur-md"
			style={{ width, height }}
		>
			<div className="absolute -top-4 left-6 flex items-center bg-black px-2">
				<h2 className="text-xl font-bold whitespace-nowrap text-white">
					{title}
				</h2>
			</div>
			<div className="flex h-full w-full flex-row gap-4">
				<div className="flex flex-1 flex-col">
					<h3 className="text-lg font-medium text-white">Weekly Goals</h3>
					<div className="mr-2 border-b border-neutral-600" />
					<ul className="mt-2 flex min-h-[48px] flex-col gap-2">
						{weeklyGoals.map((goal, idx) => (
							<li
								key={goal + idx}
								className="flex cursor-pointer items-center gap-2 select-none"
								onClick={() => handleWeeklyClick(idx)}
							>
								<span
									className={`text-white ${crossedWeekly[idx] ? "text-gray-400 line-through" : ""}`}
								>
									{goal}
								</span>
							</li>
						))}
					</ul>
				</div>
				{/* Milestones */}
				<div className="flex-1 flex-col">
					<h3 className="text-lg font-medium text-white">Milestones</h3>
					<div className="border-b border-neutral-600" />
					<ul className="mt-2 flex min-h-[48px] flex-col gap-2">
						{milestones.map((goal, idx) => (
							<li
								key={goal + idx}
								className="flex cursor-pointer items-center gap-2 select-none"
								onClick={() => handleMilestoneClick(idx)}
							>
								<span
									className={`text-white ${crossedMilestone[idx] ? "text-gray-400 line-through" : ""}`}
								>
									{goal}
								</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</motion.div>
	);
};

export default GoalBox;
