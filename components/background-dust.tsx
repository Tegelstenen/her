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
      className="absolute w-full h-full object-cover z-[-1] pointer-events-none"
    />
  );
};
