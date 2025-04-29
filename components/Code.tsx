import { PropsWithChildren } from "react";

export function Code({ children }: PropsWithChildren) {
	return (
		<span
			className={
				"rounded border border-gray-700 bg-gray-100 px-1 py-0.5 text-gray-600"
			}
		>
			{children}
		</span>
	);
}
