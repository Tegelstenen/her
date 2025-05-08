import { AnimatePresence,motion } from "framer-motion";
import {
	ArrowRight,
	BookOpen,
	CheckCircle,
	ChevronDown,
	Clock,
	Target,
} from "lucide-react";
import { useState } from "react";

interface Resource {
	type: "article" | "video" | "tool" | "other";
	url?: string;
	description: string;
}

interface Subtask {
	id: string;
	description: string;
	estimated_minutes: number;
	completed: boolean;
}

interface Metric {
	measurement: string;
	target_value?: number;
}

export interface Milestone {
	id: number;
	title: string;
	description: string;
	expected_completion_date: string;
	estimated_hours?: number;
	completed: boolean;
	metrics?: Metric;
	subtasks?: Subtask[];
	resources?: Resource[];
}

export interface Goal {
	title: string;
	description: string;
	target_date: string;
	estimated_total_hours: number;
	milestones: Milestone[];
}

interface SubtaskUpdate {
	milestoneId: number;
	subtaskId: string;
	completed: boolean;
}

interface MilestoneUpdate {
	milestoneId: number;
	completed: boolean;
}

interface MilestoneBoxProps {
	goal: Goal;
	milestones: Milestone[];
	onSubtaskUpdate: (update: SubtaskUpdate) => Promise<void>;
	onMilestoneUpdate: (update: MilestoneUpdate) => Promise<void>;
}

export default function MilestoneBox({
	goal,
	milestones,
	onSubtaskUpdate,
	onMilestoneUpdate,
}: MilestoneBoxProps) {
	const [expandedMilestone, setExpandedMilestone] = useState<number | null>(
		null,
	);

	const handleSubtaskToggle = async (
		milestoneId: number,
		subtaskId: string,
		currentCompleted: boolean,
	) => {
		try {
			await onSubtaskUpdate({
				milestoneId,
				subtaskId,
				completed: !currentCompleted,
			});
		} catch (error) {
			console.error("Failed to toggle subtask:", error);
		}
	};

	const handleMilestoneUpdate = (milestoneId: number, completed: boolean) => {
		onMilestoneUpdate({ milestoneId, completed });
	};

	return (
		<motion.div
			className="max-h-[80vh] w-[600px] overflow-y-auto rounded-3xl border border-neutral-800 bg-transparent p-6"
			style={{
				scrollbarWidth: "thin",
				scrollbarColor: "rgb(64, 64, 64) transparent",
			}}
		>
			{/* Goal Header */}
			<div className="mb-6 border-b border-neutral-800 pb-4">
				<h2 className="text-xl font-semibold text-white">{goal.title}</h2>
				<p className="mt-2 text-sm text-neutral-400">{goal.description}</p>
				<div className="mt-3 flex items-center gap-4 text-sm text-neutral-500">
					<div className="flex items-center gap-1">
						<Target size={14} />
						<span>{new Date(goal.target_date).toLocaleDateString()}</span>
					</div>
					<div className="flex items-center gap-1">
						<Clock size={14} />
						<span>{goal.estimated_total_hours}h total</span>
					</div>
				</div>
			</div>

			{/* Milestones List */}
			<div className="space-y-4">
				{milestones.map((milestone) => (
					<motion.div
						key={milestone.id}
						className="rounded-lg border border-neutral-800 bg-transparent p-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{
							opacity: 1,
							y: 0,
						}}
						transition={{
							duration: 0.3,
							ease: "easeInOut",
						}}
					>
						{/* Milestone Header */}
						<div
							className="flex cursor-pointer items-center justify-between"
							onClick={() =>
								setExpandedMilestone(
									expandedMilestone === milestone.id ? null : milestone.id,
								)
							}
						>
							<div className="flex items-center gap-3">
								<button
									onClick={(e) => {
										e.stopPropagation();
										handleMilestoneUpdate(milestone.id, !milestone.completed);
									}}
									className="cursor-pointer rounded-full p-1 transition-colors hover:bg-neutral-800"
								>
									<CheckCircle
										size={20}
										className={`transition-colors duration-200 ${milestone.completed ? "text-green-500" : "text-neutral-600"}`}
									/>
								</button>
								<div>
									<h3 className="font-medium text-white">{milestone.title}</h3>
									<p className="text-sm text-neutral-400">
										Due{" "}
										{new Date(
											milestone.expected_completion_date,
										).toLocaleDateString()}
									</p>
								</div>
							</div>
							<ChevronDown
								className={`transform text-neutral-600 transition-transform ${
									expandedMilestone === milestone.id ? "rotate-180" : ""
								}`}
							/>
						</div>

						{/* Expanded Content */}
						<AnimatePresence mode="wait">
							{expandedMilestone === milestone.id && (
								<motion.div
									className="mt-4 space-y-4 border-t border-neutral-800 pt-4"
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{
										duration: 0.2,
										ease: "easeInOut",
										opacity: { duration: 0.15 },
									}}
								>
									<motion.p
										className="text-sm text-neutral-400"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.1, duration: 0.2 }}
									>
										{milestone.description}
									</motion.p>

									{/* Metrics */}
									{
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.15, duration: 0.2 }}
										>
											{milestone.metrics && (
												<div className="rounded-md bg-neutral-900/50 p-3">
													<h4 className="mb-2 text-sm font-medium text-white">
														Success Metrics
													</h4>
													<p className="text-sm text-neutral-400">
														{milestone.metrics.measurement}
														{milestone.metrics.target_value && (
															<span className="ml-1 font-medium text-neutral-300">
																(Target: {milestone.metrics.target_value})
															</span>
														)}
													</p>
												</div>
											)}
										</motion.div>
									}

									{/* Subtasks */}
									{
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.2, duration: 0.2 }}
										>
											{milestone.subtasks && milestone.subtasks.length > 0 && (
												<div>
													<h4 className="mb-2 text-sm font-medium text-white">
														Subtasks
													</h4>
													<div className="space-y-2">
														{milestone.subtasks.map((subtask) => (
															<div
																key={subtask.id}
																className="group flex items-center justify-between rounded-md bg-neutral-900/50 p-2 text-sm transition-colors hover:bg-neutral-800/50"
															>
																<div className="flex items-center gap-2">
																	<button
																		onClick={(e) => {
																			e.preventDefault();
																			handleSubtaskToggle(
																				milestone.id,
																				subtask.id,
																				subtask.completed,
																			);
																		}}
																		className="cursor-pointer rounded-md border border-neutral-700 p-1 hover:bg-neutral-800"
																	>
																		<CheckCircle
																			size={16}
																			className={`transition-colors duration-200 ${subtask.completed ? "text-green-500" : "text-neutral-600"}`}
																		/>
																	</button>
																	<span
																		className={`text-neutral-300 ${subtask.completed ? "text-neutral-500 line-through" : ""}`}
																	>
																		{subtask.description}
																	</span>
																</div>
																<span className="text-neutral-500">
																	{Math.round(
																		(subtask.estimated_minutes / 60) * 10,
																	) / 10}
																	h
																</span>
															</div>
														))}
													</div>
												</div>
											)}
										</motion.div>
									}

									{/* Resources */}
									{
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.25, duration: 0.2 }}
										>
											{milestone.resources &&
												milestone.resources.length > 0 && (
													<div>
														<h4 className="mb-2 text-sm font-medium text-white">
															Resources
														</h4>
														<div className="space-y-2">
															{milestone.resources.map((resource, idx) => (
																<div
																	key={idx}
																	className="flex items-center gap-2 rounded-md bg-neutral-900/50 p-2 text-sm"
																>
																	<BookOpen
																		size={14}
																		className="text-neutral-500"
																	/>
																	<span className="text-neutral-300">
																		{resource.description}
																	</span>
																</div>
															))}
														</div>
													</div>
												)}
										</motion.div>
									}

									{/* Prerequisites */}
									{
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.3, duration: 0.2 }}
										>
											{milestone.prerequisites &&
												milestone.prerequisites.length > 0 && (
													<div>
														<h4 className="mb-2 text-sm font-medium text-white">
															Prerequisites
														</h4>
														<div className="flex flex-wrap gap-2">
															{milestone.prerequisites.map((prereqId) => {
																const prereq = milestones.find(
																	(m) => m.id === prereqId,
																);
																return (
																	prereq && (
																		<div
																			key={prereqId}
																			className="flex items-center gap-1 rounded-md bg-neutral-900/50 p-2 text-sm text-neutral-400"
																		>
																			<ArrowRight size={14} />
																			<span>{prereq.title}</span>
																		</div>
																	)
																);
															})}
														</div>
													</div>
												)}
										</motion.div>
									}
								</motion.div>
							)}
						</AnimatePresence>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}
