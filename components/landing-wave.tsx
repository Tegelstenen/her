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
      className="absolute w-full h-full object-cover z-0 pointer-events-none"
    />
  );
};
