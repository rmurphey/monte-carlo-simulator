module.exports = {
  root: true,
  env: { node: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    "no-unused-vars": "off", // Use TypeScript version instead
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    
    // Code quality rules
    "complexity": ["warn", 15],
    "max-depth": ["warn", 4],
    "max-lines-per-function": ["warn", 100],
    "no-duplicate-imports": "error",
    
    // TypeScript specific
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    
    // Import organization
    "sort-imports": ["error", { "ignoreDeclarationSort": true }],
    
    // Prevent duplication
    "no-dupe-keys": "error",
    "no-dupe-else-if": "error",
    "no-duplicate-case": "error"
  },
  overrides: [
    {
      files: ['src/web/**/*.ts'],
      env: {
        browser: true,
        es2020: true,
        node: false
      },
      globals: {
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        document: 'readonly',
        NodeListOf: 'readonly'
      }
    }
  ]
}