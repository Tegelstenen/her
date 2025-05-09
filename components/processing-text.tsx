import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const phrases = [
	"Connecting neurons in your brain...",
	"Brewing the perfect plan...",
	"Teaching AI to understand your dreams...",
	"Calculating the optimal path to success...",
	"Mapping your journey to greatness...",
	"Building your personal success algorithm...",
	"Decoding your potential...",
	"Crafting your roadmap to victory...",
	"Analyzing your superpowers...",
	"Planting seeds of achievement...",
];

export default function ProcessingText() {
	const [currentPhrase, setCurrentPhrase] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [phraseIndex, setPhraseIndex] = useState(0);
	const [typingSpeed] = useState(50);

	useEffect(() => {
		let timeout: NodeJS.Timeout;

		if (!isDeleting) {
			if (currentPhrase.length < phrases[phraseIndex].length) {
				timeout = setTimeout(() => {
					setCurrentPhrase(
						phrases[phraseIndex].slice(0, currentPhrase.length + 1),
					);
				}, typingSpeed);
			} else {
				timeout = setTimeout(() => {
					setIsDeleting(true);
				}, 3000);
			}
		} else {
			if (currentPhrase.length > 0) {
				timeout = setTimeout(() => {
					setCurrentPhrase(currentPhrase.slice(0, -1));
				}, typingSpeed / 2);
			} else {
				setIsDeleting(false);
				setPhraseIndex((prev) => (prev + 1) % phrases.length);
			}
		}

		return () => clearTimeout(timeout);
	}, [currentPhrase, isDeleting, phraseIndex, typingSpeed]);

	return (
		<>
			{currentPhrase}
			<motion.span
				animate={{ opacity: [1, 0] }}
				transition={{ duration: 1, repeat: Infinity }}
				className="ml-1 inline-block"
			>
				|
			</motion.span>
		</>
	);
}
