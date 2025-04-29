import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
	baseDirectory: import.meta.dirname,
});

const eslintConfig = [
	{
		ignores: ["node_modules/**", ".next/**", "dist/**", "build/**"]
	},
	...compat.config({
		extends: ["next", "next/core-web-vitals", "next/typescript", "prettier"],
		plugins: ["simple-import-sort", "unused-imports"],
		rules: {
			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",
			"unused-imports/no-unused-imports": "error",
			"unused-imports/no-unused-vars": [
				"warn",
				{
					vars: "all",
					varsIgnorePattern: "^_",
					args: "after-used",
					argsIgnorePattern: "^_",
				},
			],
		},
	}),
];

export default eslintConfig; 