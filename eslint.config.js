import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{
		ignores: [
			'dist',
			'node_modules',
			'coverage',
			'prisma/schema/migrations',
			'src/generated',
		],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	eslintConfigPrettier,
	{
		files: ['src/**/*.ts'],
		plugins: {
			prettier: prettierPlugin,
			'simple-import-sort': simpleImportSort,
		},
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
			},
		},
		rules: {
			'prettier/prettier': 'error',
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-explicit-any': 'warn',
		},
	},
)
