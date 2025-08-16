# No Flaky Workarounds - Debt Prevention

Enforce: "ALWAYS avoid workarounds that create flakiness or debt"

## Usage
Use `npm run context:no-flaky-workarounds` to check for workaround patterns, then:

## Workaround Warning Signs
- 🚨 **setTimeout()** for race conditions
- 🚨 **try/catch** without understanding error
- 🚨 **"This works locally"** solutions  
- 🚨 **Disabling linting rules** instead of fixing issues
- 🚨 **Hardcoded values** to bypass validation
- 🚨 **Retries** without addressing root cause

## Proper Solution Approach
1. 🔍 **Understand root cause completely**
2. 🎯 **Address the actual problem, not symptoms**
3. 🧪 **Test solution thoroughly**
4. 📋 **Document why this approach is correct**
5. 🔄 **Prefer systematic solutions over quick fixes**

## Red Flags in Code Review
- Band-aid fixes that don't address underlying issues
- Quick fixes that introduce unreliability
- Deferring proper solutions with temporary patches
- Solutions that work "most of the time"

## Quality Standards
- ✅ Reliable, systematic solutions
- ✅ Address root causes, not symptoms
- ✅ Maintainable long-term approaches
- ❌ Quick fixes that create technical debt

Don't use quick fixes that introduce unreliability - solve the real problem.