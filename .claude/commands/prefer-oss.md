# Prefer OSS - Open Source Solution Priority

Enforce: "ALWAYS prefer quality open-source solutions over writing your own code"

## Usage
Use `npm run context:prefer-oss` to get OSS evaluation context, then:

## OSS Evaluation Process
1. 🔍 **Search for existing OSS solutions** first
2. 📊 **Evaluate maturity, maintenance, and community**
3. 🧪 **Test with small proof-of-concept**
4. 📋 **Compare implementation effort vs integration effort**
5. 🎯 **Choose OSS unless custom provides significant advantages**

## Common OSS Categories
- **Validation**: ajv, joi, yup, zod
- **CLI**: commander, yargs, oclif
- **Testing**: vitest, jest, playwright, cypress
- **Utilities**: lodash, ramda, date-fns
- **UI**: react, vue, lit, solid

## Anti-Patterns to Avoid
- ❌ Writing custom validation when ajv/joi exists
- ❌ Building CLI parsers when commander exists
- ❌ Creating utilities that lodash provides
- ❌ Reinventing wheels without compelling reason

## When Custom Code is Justified
- Domain-specific business logic
- Performance-critical paths with proven bottlenecks
- Integration between existing OSS solutions
- When OSS solution adds significant complexity

Don't reinvent wheels - use proven, maintained solutions.