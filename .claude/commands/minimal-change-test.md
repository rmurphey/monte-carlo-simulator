# Minimal Change Test - Inline Fix Testing

Test fixes inline before modifying source code to prevent expensive debugging iterations.

## Usage
Use `npm run context:minimal-change-test` to get inline testing context, then:

## Process
1. **Test your fix in the test file first**
2. **Use working patterns from existing code**
3. **Change only what's necessary**
4. **Verify fix with single test run**

## Inline Testing Template
```typescript
it('should work', () => {
  const instance = new YourClass(data)
  
  // Test fix inline before changing source
  const fixedResult = useWorkingPattern(instance)
  expect(fixedResult).toEqual(expected)
  
  // Then modify actual source method
})
```

## Principles
- ✅ Change only what's necessary
- ✅ Use proven patterns from working code
- ❌ Don't rewrite entire methods
- ❌ Don't add complex debugging logic

Follow minimal change principle: copy working pattern, don't debug mysteries.