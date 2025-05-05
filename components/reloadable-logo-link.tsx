"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { HerLogo } from "./logos";

export function ReloadableLogoLink({ id }: { id?: string }) {
	const router = useRouter();

	const handleFadeOutAndRoute = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			const mainContent = document.querySelector("[data-fade-content]");
			if (mainContent) {
				mainContent.classList.add("fade-out");
				setTimeout(() => {
					router.push("/");
				}, 500);
			} else {
				router.push("/");
			}
		},
		[router],
	);

	return (
		<Link
			href="/"
			{...(id ? { id } : {})}
			onClick={handleFadeOutAndRoute}
			scroll={false}
			prefetch={false}
		>
			<HerLogo className={"h-[30px] w-auto"} />
		</Link>
	);
}
