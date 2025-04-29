import "./globals.css";

import type { Metadata } from "next";

import { ReloadableLogoLink } from "@/components/ReloadableLogoLink";

export const metadata: Metadata = {
	title: "Her",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={"h-full w-full"}>
			<body className={`lex h-full w-full flex-col antialiased`}>
				<div className="flex w-full grow flex-col items-center justify-center sm:px-4">
					<nav
						className={
							"top-0 left-0 grid w-full grid-cols-2 px-8 py-4 sm:fixed"
						}
					>
						<div className={"flex"}>
							<ReloadableLogoLink />
						</div>
					</nav>
					{children}
				</div>
			</body>
		</html>
	);
}
