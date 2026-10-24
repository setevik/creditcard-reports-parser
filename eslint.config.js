import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
    { ignores: ['dist', 'node_modules', 'examples'] },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
            // The language context exports its provider and matching hook from one
            // file; that costs a full reload on edit, not correctness.
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true, allowExportNames: ['useLanguage'] },
            ],
        },
    },
    {
        files: ['tests/**/*.js', '*.config.js'],
        languageOptions: {
            globals: { ...globals.node, ...globals.browser },
        },
    },
]
