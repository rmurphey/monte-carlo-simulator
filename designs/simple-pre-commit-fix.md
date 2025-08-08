# Simple Pre-Commit Fix

## Problem
Current pre-commit hook takes 30 seconds and runs 11 validations. This is too slow and discourages frequent commits.

## Simple Solution: Replace with husky + lint-staged

### Install Standard Tools
```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

### Configure Fast Validations Only
**package.json**:
```json
{
  "lint-staged": {
    "*.ts": ["eslint --fix"],
    "*.{json,yaml,yml}": ["npm run cli validate"],
    "**/*": ["git add"]
  }
}
```

### Move Heavy Validations to npm Scripts
**package.json**:
```json
{
  "scripts": {
    "pre-push": "npm test && npm run test:docs",
    "validate-all": "npm run validate:yaml && npm run test:agent-apis"
  }
}
```

### Results
- **Pre-commit**: 3-5 seconds (lint + validate syntax only)
- **Manual validation**: `npm run validate-all` when needed
- **Industry standard**: Uses husky/lint-staged like most projects

### Migration
1. Install husky + lint-staged
2. Remove current `.git/hooks/pre-commit` 
3. Test with team
4. Done

**Benefits**:
- 6x faster commits (30s → 5s)
- Standard tooling (easier maintenance)
- Version controlled (.husky/ directory)
- Optional heavy validations when needed