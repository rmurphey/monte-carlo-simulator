module.exports = {
  root: true,
  env: { node: true, es2020: true },
  extends: [
    'eslint:recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }]
  },
}