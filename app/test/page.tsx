"use client";

import MovingSphere from "@/components/moving-sphere";

export default function Page() {
	return (
		<main
			style={{
				width: "100vw",
				height: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<MovingSphere width="600px" height="600px" status="agentspeaking" />
		</main>
	);
}
