# Test Suite Optimization & GitHub Actions Plan

## Current Situation
- **Total**: 16 test files, 3,166 lines, 162 tests, ~20+ seconds
- **Failed Tests**: 6 failures in heavy integration tests (Vite, browser, parameter schema)
- **Bottlenecks**: Playwright browser automation, Vite server spawning, comprehensive validation

## Strategy: Fast Local + Comprehensive CI

### Phase 1: Restructure Package.json Scripts

**New Test Commands:**
- `test:fast` - Local development (~5-8 seconds, unit tests only)
- `test:ci` - CI/CD comprehensive testing (~20+ seconds, everything)
- `test:integration` - Integration tests only
- `test:browser` - Browser/Playwright tests only

**Implementation:**
```json
{
  "scripts": {
    "test": "npm run test:fast",
    "test:fast": "vitest --run --exclude='src/test/{vite-*,bulletproof-*,schema-validation-comprehensive,cli-core,cli-commands,*integration*}.test.ts'",
    "test:ci": "vitest --run",
    "test:integration": "vitest --run --include='src/test/{cli-*,*integration*}.test.ts'",
    "test:browser": "vitest --run --include='src/test/vite-*.test.ts'",
    "test:validation": "vitest --run --include='src/test/{bulletproof-*,schema-validation-*}.test.ts'"
  }
}
```

### Phase 2: GitHub Actions Setup

**Create `.github/workflows/test.yml`:**
```yaml
name: Test Suite

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  fast-tests:
    name: Fast Tests (Unit)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test:fast
      - run: npm run test:docs

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: fast-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run test:integration
      - run: npm run test:validation

  browser-tests:
    name: Browser Tests (Playwright)
    runs-on: ubuntu-latest
    needs: fast-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npm run test:browser

  full-suite:
    name: Full Test Suite
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: [fast-tests, integration-tests, browser-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npm run test:ci
```

### Phase 3: Test Categorization

**Local Development Tests (Fast - Keep):**
```
✅ ParameterSchema.test.ts (unit logic) - ~50ms
✅ SimulationRegistry.test.ts (core functionality) - ~100ms
✅ StatisticalAnalyzer.test.ts (math operations) - ~80ms
✅ AIInvestmentROI.test.ts (business logic) - ~150ms
✅ ConfigurableSimulation.test.ts (framework core) - ~120ms
✅ name-converter.test.ts (utilities) - ~30ms
✅ interactive-session-basic.test.ts (basic UI) - ~80ms
✅ cli-visualizations.test.ts (chart units) - ~200ms
```
**Estimated Total: ~5-8 seconds**

**CI/CD Only Tests (Heavy - Move):**
```
🚀 vite-dev-server.test.ts (browser automation) - ~15s
🚀 vite-integration.test.ts (server integration) - ~3s
🚀 bulletproof-validation.test.ts (comprehensive validation) - ~2s
🚀 schema-validation-comprehensive.test.ts (repo-wide scanning) - ~1s
🚀 cli-core.test.ts (process spawning) - ~8s
🚀 cli-commands.test.ts (full CLI integration) - ~5s
🚀 cli-visualization-integration.test.ts (end-to-end) - ~3s
🚀 document-generator-visualization.test.ts (full pipeline) - ~2s
```
**Estimated Total: ~15-20 seconds additional**

### Phase 4: Quality Gates

**Pre-commit Hook Enhancement:**
Update `.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Fast validation for quick feedback
npm run test:fast
npm run typecheck  
npm run lint
npm run test:docs

# Skip heavy tests locally - let CI handle them
echo "✅ Fast validation complete. CI will run full test suite."
```

**GitHub Actions Gates:**
- **PR**: Fast tests + lint + build + documentation
- **Main**: Full comprehensive suite including browser tests
- **Release**: All tests + documentation validation + NPM publish checks

### Phase 5: Documentation Updates

**Update README.md:**
```markdown
## Testing

### Local Development
```bash
npm test              # Fast unit tests (~5-8 seconds)
npm run test:fast     # Same as above
npm run test:ci       # Full test suite (~20+ seconds)
```

### Specialized Test Suites
```bash
npm run test:integration  # CLI and integration tests
npm run test:browser      # Playwright browser tests  
npm run test:validation   # Comprehensive YAML validation
npm run test:docs         # Documentation examples
```
```

## Expected Benefits

**Local Development:**
- ⚡ **75% faster feedback** (5-8s vs 20+ seconds)
- 🎯 **Focus on unit failures first** - catch logic errors immediately
- 🔄 **Faster iteration cycles** - less waiting for test feedback
- 🧠 **Reduced cognitive load** - fewer test failures to process locally

**CI/CD Reliability:**
- 🌐 **Proper browser environment** for Playwright tests
- 🔧 **Full integration testing** in consistent environment  
- 📊 **Comprehensive validation** without impacting local development
- ✅ **Parallel execution** of different test categories

**Developer Experience:**
- ✅ `npm test` = instant validation of your changes
- ✅ `npm run test:ci` = full suite when needed locally
- ✅ **GitHub handles heavy lifting** automatically
- 🚀 **Pre-commit hooks remain fast** and don't block commits

**Team Coordination:**
- 📋 **Clear test categories** for different purposes
- 🔄 **Consistent CI environment** for all contributors
- 📊 **Better test failure isolation** and debugging
- ⚡ **Faster PR feedback** with parallel CI jobs

## Implementation Checklist

- [ ] Update package.json with new test scripts
- [ ] Create GitHub Actions workflow file
- [ ] Update pre-commit hooks for fast-only tests
- [ ] Update documentation (README.md, development guides)
- [ ] Test the new workflow with sample PR
- [ ] Monitor CI performance and adjust timeouts if needed
- [ ] Consider adding test:watch command for development

## Success Metrics

**Before:**
- Local test run: ~20+ seconds
- Pre-commit feedback: ~20+ seconds
- Developer frustration: High (slow feedback)

**After:**
- Local test run: ~5-8 seconds (75% improvement)
- Pre-commit feedback: ~5-8 seconds
- CI comprehensive validation: Parallel, non-blocking
- Developer satisfaction: High (fast feedback, comprehensive CI)