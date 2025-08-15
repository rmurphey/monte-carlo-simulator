# Read The Whole Error - Systematic Error Analysis

Systematically analyze complete error messages to prevent assumption-driven debugging.

## Usage
Use `npm run context:read-the-whole-error` to get error analysis context, then:

## Process
1. **Read the COMPLETE error message**, not just parts
2. **Identify the actual failing line/method**
3. **Check if error is in code path you expect**
4. **Compare with working equivalent functionality**
5. **Test assumptions with minimal reproduction**

## Prevents Common Traps
- ❌ "Must be caching" → Clear caches without evidence
- ❌ "Must be compilation" → Remove .js files randomly  
- ❌ "Must be types" → Focus on TypeScript definitions
- ❌ "Must be property access" → Try multiple variations

## Target
Prevents expensive debugging loops caused by assumptions. Use systematic analysis instead of guessing.