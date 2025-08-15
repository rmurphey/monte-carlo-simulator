# Efficient Debugging Guidelines for AI Development

**Purpose**: Minimize token costs and time waste during debugging sessions  
**Context**: Lessons from expensive ParameterSchema debugging session (15,000 tokens)  
**Target**: Reduce debugging costs by 90%+ through systematic approach

## The 5-Minute Rule
**If you're not making progress in 5 minutes, STOP and reassess your approach.**

Common signs you're in an inefficient debugging loop:
- Adding debug code that doesn't execute
- Trying multiple variations of the same approach  
- Clearing caches repeatedly
- Restarting processes "just in case"
- Making assumptions about root cause without evidence

## Efficient Debugging Workflow

### Phase 1: Establish Working Baseline (2 minutes max)
```typescript
// 1. Find something that WORKS in the same class/module
const workingData = schema.getDefinitions()[0]  
console.log('Working:', workingData.default) // Should show actual value

// 2. Test the broken functionality directly
const brokenData = schema.getDefaultParameters()
console.log('Broken:', brokenData) // Shows the problem

// 3. Compare the approaches immediately - don't debug further
```

### Phase 2: Direct Comparison (1 minute max)
- **Working method**: How does `getDefinitions()` access the data?
- **Broken method**: How does `getDefaultParameters()` access the same data?
- **Difference spotted**: Use working approach in broken method

### Phase 3: Minimal Fix Test (2 minutes max)
```typescript
// Test the fix INLINE in your test first
const definitions = schema.getDefinitions() // Use working approach
const defaults = {}
for (const def of definitions) {
  defaults[def.key] = def.default // Copy working pattern exactly
}
// Verify this works before changing source code
```

## Anti-Patterns That Waste Tokens

### ❌ **Assumption-Driven Debugging**
- "It must be a caching issue" → Clear various caches
- "It must be a compilation issue" → Remove JS files  
- "It must be a type issue" → Debug TypeScript definitions

### ❌ **Debug Code That Won't Execute**
- Adding console.log in methods that aren't being called
- Complex debugging logic in the wrong execution path
- Property inspection when the issue is method selection

### ❌ **Trying Multiple Variations of Same Approach**
- `def.default`, `def['default']`, `(def as any).default`
- When the issue is using `def` from wrong source, not property access

## Efficient Patterns That Save Tokens

### ✅ **Comparison-Driven Debugging**
1. Find working equivalent functionality
2. Compare working vs broken approaches side-by-side
3. Copy working pattern to broken location
4. Test once to verify

### ✅ **Inline Testing First**
Test your fix in the test file itself before modifying source:
```typescript
it('should work', () => {
  const schema = new Schema(data)
  
  // Test your fix inline first
  const fixedResult = doItTheWorkingWay(schema)
  expect(fixedResult).toEqual(expected)
  
  // Then modify the actual method
})
```

### ✅ **Minimal Change Principle**
- Don't rewrite methods, just change the data source
- Don't add new methods, just fix existing ones  
- Don't debug mysteries, use proven patterns

## Framework-Specific Lessons

### Map vs Array Iteration
```typescript
// UNRELIABLE: Direct Map.values() iteration
for (const item of this.map.values()) { /* may fail */ }

// RELIABLE: Array conversion first  
for (const item of Array.from(this.map.values())) { /* works */ }
```

### Type System Issues
- Type aliases don't change runtime behavior
- Focus on data access patterns, not type definitions
- When types look right but behavior is wrong → data source issue

### Test Environment Behavior
- Compiled JS files can interfere with TypeScript tests
- Remove compiled files as standard cleanup, not debugging step
- Console.log in wrong execution path won't show output

## Emergency Debugging Checklist

When you realize you're in an expensive debugging loop:

1. ⏹️ **STOP** - Don't continue the current approach
2. 🔍 **FIND** - Locate working equivalent functionality  
3. 📋 **COMPARE** - List differences between working/broken
4. 🧪 **TEST** - Verify fix inline before changing source
5. ✅ **IMPLEMENT** - Make minimal change using working pattern

## Success Metrics
- **Time to fix**: < 5 minutes for method-level bugs
- **Token cost**: < 1,000 tokens for debugging session
- **Approach changes**: < 2 (find working pattern, apply it)
- **Debug iterations**: < 3 (baseline, compare, fix)

**Remember**: The goal is to solve problems efficiently, not to understand every mystery. Use working patterns and move forward.