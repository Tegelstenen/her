"use client";
import { motion } from "framer-motion";
import { useRef } from "react";

export const LandingWave = () => {
	const videoRef = useRef<HTMLVideoElement>(null);

	return (
		<motion.video
			ref={videoRef}
			src="/landing.mp4"
			autoPlay
			muted
			loop
			controls={false}
			className="pointer-events-none absolute z-0 h-full w-full object-cover"
		/>
	);
};
