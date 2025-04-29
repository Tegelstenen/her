import path from "node:path";

const buildEslintCommand = (filenames) =>
	`next lint --file ${filenames
		.map((f) => path.relative(process.cwd(), f))
		.join(" --file ")}`;

// eslint-disable-next-line import/no-anonymous-default-export
export default {
	"**/*.ts?(x)": [
		"prettier --write",
		"eslint --fix",
	],
	"**/*.{js,jsx}": [
		"prettier --write",
		"eslint --fix",
	],
}; 