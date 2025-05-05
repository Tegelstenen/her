"use client";
import { motion } from "framer-motion";
import { useRef } from "react";

export const BackgroundDust = () => {
	const videoRef = useRef<HTMLVideoElement>(null);

	return (
		<motion.video
			ref={videoRef}
			src="/dust.mp4"
			autoPlay
			muted
			loop
			controls={false}
			className="pointer-events-none absolute z-[-1] h-full w-full object-cover blur-3xl"
		/>
	);
};
