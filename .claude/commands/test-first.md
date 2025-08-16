# Test First - TDD Principles Enforcement

Enforce: "PREFER to operate following TDD principles: tests first, code later"

## Usage
Use `npm run context:test-first` to get TDD workflow context, then:

## TDD Workflow
1. 🧪 **Write failing test** that describes desired behavior
2. 🔴 **Verify test fails** for the right reason
3. ✅ **Write minimal code** to make test pass
4. 🔄 **Refactor** with test safety net
5. ♻️ **Repeat** for next small behavior

## Anti-Patterns to Avoid
- ❌ Don't implement without tests
- ❌ Don't add tests as afterthought
- ❌ Don't write complex implementations first
- ❌ Don't skip test verification step

## Staging Order
1. **Stage test files first**
2. **Then implement minimum code to pass**
3. **Commit working test + minimal implementation**

## Benefits
- Prevents over-engineering
- Ensures comprehensive test coverage
- Provides immediate feedback on design
- Creates reliable safety net for refactoring
- Documents expected behavior

Write tests first, then write just enough code to make them pass.