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