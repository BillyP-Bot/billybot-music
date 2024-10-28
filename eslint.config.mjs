import tseslint from "typescript-eslint";

import eslint from "@eslint/js";

export default [
	{
		ignores: ["node_modules/", "build/"]
	},
	...tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
		rules: {
			"@typescript-eslint/ban-ts-comment": "off"
		}
	})
];
