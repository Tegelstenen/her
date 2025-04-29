'use client'

import { useState } from 'react';
import { HerLogo } from "@/components/logos";
import { LandingWave } from "@/components/landing-wave";
import { BackgroundDust } from "@/components/background-dust";
import { primaryButtonStyles } from "@/lib/button-styles";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ConvAI } from "@/components/ConvAI";

export default function Home() {
    const [view, setView] = useState<'landing' | 'form' | 'conversation'>('landing');
    const [goals, setGoals] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("User goals:", goals);
        setIsTransitioning(true);
        
        // Reduced delay for a more responsive transition
        setTimeout(() => {
            setView('conversation');
            setIsTransitioning(false);
        }, 300);
    };

    // Determine container width based on view
    const containerWidth = view === 'conversation' ? 'w-[700px]' : 'w-[1200px]';

    return (
        <div className="min-h-screen p-8 bg-white flex items-center justify-center">
            {/* Main card container with the wave background */}
            <motion.div 
                className={`${containerWidth} h-[800px] rounded-2xl overflow-hidden relative shadow-lg`}
                animate={{ 
                    width: view === 'conversation' ? 700 : 1200 
                }}
                transition={{ 
                    duration: 0.6, 
                    ease: "easeInOut",
                    delay: view === 'conversation' ? 0.2 : 0
                }}
            >
                {/* Black background for transitions */}
                <div className="absolute inset-0 bg-black z-0"></div>
                
                {/* Background videos with crossfade transition */}
                <AnimatePresence initial={false} mode="wait">
                    {view === 'landing' ? (
                        <motion.div 
                            key="landing-wave"
                            className="absolute inset-0 z-[1]"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                        >
                            <LandingWave />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="background-dust"
                            className="absolute inset-0 z-[1]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.4 }}
                        >
                            <BackgroundDust />
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Content with transitions */}
                <AnimatePresence mode="wait">
                    {view === 'landing' && (
                        /* Initial landing view */
                        <motion.div 
                            key="landing"
                            className="relative z-[5] flex flex-col items-center justify-center h-full p-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ 
                                opacity: 0,
                                y: -20,
                                transition: { duration: 0.4 }
                            }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Centered Logo */}
                            <motion.div 
                                className="mb-8"
                                initial={{ scale: 1 }}
                                animate={{ scale: 1 }}
                                exit={{ 
                                    scale: 0.8,
                                    opacity: 0,
                                    transition: { duration: 0.3 }
                                }}
                            >
                                <HerLogo className="w-64 h-64 text-white" />
                            </motion.div>
                            
                            {/* Button below logo */}
                            <motion.button 
                                className={primaryButtonStyles}
                                onClick={() => setView('form')}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Become a better you
                            </motion.button>
                        </motion.div>
                    )}

                    {view === 'form' && (
                        /* Form view */
                        <motion.div 
                            key="form"
                            className="w-full h-full flex rounded-lg overflow-hidden relative z-[5]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Left side - Form */}
                            <motion.div 
                                className="w-1/2 p-12 flex flex-col justify-center relative z-[5]"
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ 
                                    x: -50, 
                                    opacity: 0,
                                    transition: { duration: 0.3 } 
                                }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <div className="mb-10">
                                    <motion.h1 
                                        className="text-4xl font-semibold text-white mb-3"
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                    >
                                        Ready to start your success story?
                                    </motion.h1>
                                    <motion.p 
                                        className="text-white mb-8"
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.5 }}
                                    >
                                        Tell us your goals and start your journey to becoming a better you today!
                                    </motion.p>
                                </div>

                                <motion.form 
                                    onSubmit={handleSubmit} 
                                    className="space-y-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                >
                                    <motion.div 
                                        className="space-y-2"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.7 }}
                                    >
                                        <label className="block text-sm font-medium text-white">Full name</label>
                                        <input 
                                            type="text"
                                            className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent text-white placeholder:text-gray-400"
                                            placeholder="Jane Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </motion.div>

                                    <motion.div 
                                        className="space-y-2"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.8 }}
                                    >
                                        <label className="block text-sm font-medium text-white">Area of interest</label>
                                        <input 
                                            type="text"
                                            className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent text-white placeholder:text-gray-400"
                                            placeholder="Your goals"
                                            value={goals}
                                            onChange={(e) => setGoals(e.target.value)}
                                            required
                                        />
                                    </motion.div>

                                    <motion.div 
                                        className="flex items-center mt-8"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.9 }}
                                    >
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                            checked={agreeToTerms}
                                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                                            required
                                        />
                                        <label htmlFor="terms" className="ml-2 block text-sm text-white">
                                            I agree to the <span className="text-blue-400">Terms & Conditions</span>
                                        </label>
                                    </motion.div>

                                    <motion.button
                                        type="submit"
                                        className={primaryButtonStyles}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 1 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Sign up
                                    </motion.button>
                                </motion.form>
                            </motion.div>

                            {/* Right side - Image */}
                            <motion.div 
                                className="w-1/2 relative z-[5]"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ 
                                    x: 50, 
                                    opacity: 0,
                                    transition: { duration: 0.3 } 
                                }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <Image
                                    src="/bath.jpg"
                                    alt="Relaxation image"
                                    fill
                                    style={{objectFit: 'cover'}}
                                    priority
                                />
                            </motion.div>
                        </motion.div>
                    )}

                    {view === 'conversation' && (
                        /* Conversation view */
                        <motion.div 
                            key="conversation"
                            className="relative z-[5] flex items-center justify-center h-full w-full"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <motion.div 
                                className="w-[500px] h-[400px] flex items-center justify-center"
                                initial={{ y: 15 }}
                                animate={{ y: 0 }}
                                transition={{ 
                                    type: "spring", 
                                    stiffness: 300, 
                                    damping: 25,
                                    delay: 0.1
                                }}
                            >
                                <ConvAI user_name={name} goals={goals} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
