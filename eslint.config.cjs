const js = require('@eslint/js');
const globals = require('globals');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
    { ignores: ['build/**', '.yarn/**'] },
    js.configs.recommended,
    ...tsPlugin.configs['flat/recommended'].map(config => ({
        ...config,
        files: ['**/*.ts'],
    })),
    {
        languageOptions: { globals: globals.node },
    },
    {
        files: ['**/*.ts'],
        languageOptions: { parser: tsParser },
    },
];
