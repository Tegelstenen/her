import "./globals.css";

import type { Metadata } from "next";

import { BackgroundDust } from "@/components/background-dust";
import { ReloadableLogoLink } from "@/components/reloadable-logo-link";

export const metadata: Metadata = {
	title: "Her",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={"h-full w-full"}>
			<body className={"lex h-full w-full flex-col bg-black antialiased"}>
				<div className="flex w-full grow flex-col items-center justify-center sm:px-4">
					<BackgroundDust />
					<nav
						className={
							"top-0 left-0 grid w-full grid-cols-2 px-8 py-4 sm:fixed"
						}
						style={{ pointerEvents: "auto", zIndex: 50 }}
					>
						<div className={"flex"}>
							<ReloadableLogoLink id="layout-logo-link" />
						</div>
					</nav>
					{children}
				</div>
			</body>
		</html>
	);
}
