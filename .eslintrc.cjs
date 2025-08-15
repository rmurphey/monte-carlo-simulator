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
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    
    // Code quality rules
    "complexity": "off",
    "max-depth": "off",
    "max-lines-per-function": "off",
    "no-duplicate-imports": "error",
    
    // TypeScript specific
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
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
    },
    {
      files: ['src/test/setup.ts'],
      rules: {
        "no-var": "off" // Allow var in global type declarations
      }
    }
  ]
}