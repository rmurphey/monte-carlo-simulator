# Find Working Equivalent - Comparison-Driven Debugging

Locate similar working code for comparison-driven debugging - the core principle of efficient debugging.

## Usage  
Use `npm run context:find-working-equivalent` to get codebase context, then:

## Process
1. **Identify broken functionality**
2. **Find similar working code** in same class/module  
3. **Compare approaches side-by-side**
4. **Copy working pattern** to broken location
5. **Test once to verify fix**

## Anti-Patterns to Avoid
- ❌ Don't debug mysteries when working solutions exist
- ❌ Don't rewrite methods, just change data source  
- ❌ Don't add new methods, just fix existing ones

## Codebase Structure
- Framework core: `src/framework/`
- CLI commands: `src/cli/`
- Test patterns: `src/test/`
- Web components: `src/web/`

Use proven patterns instead of extensive troubleshooting.