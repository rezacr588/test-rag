import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ...pluginJs.configs.recommended,
    env: { node: true },
    parserOptions: { ecmaVersion: "latest" }
  },
];