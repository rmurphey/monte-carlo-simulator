# Simple Test Case - Minimal Debugging Test Creation

Create minimal test cases for debugging following efficient debugging guidelines.

## Usage
Use `npm run context:simple-test-case` to get debugging context, then:

## Process
1. **Create focused test case** to isolate the issue
2. **Test fix inline** before modifying source code  
3. **Use working equivalent** as reference pattern
4. **Avoid debug code** that won't execute
5. **Don't assume** caching or compilation issues

## Based On
- "Test fix inline first" pattern from debugging lessons
- Prevents expensive debugging sessions (target: <1,000 tokens, <5 minutes)
- Lessons from ParameterSchema debugging incident (15,000 tokens → systematic approach)

Follow the systematic approach instead of assumption-driven debugging.