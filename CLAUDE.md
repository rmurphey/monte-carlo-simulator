# Claude Code Collaboration Guidelines

## Project Configuration
- **Quality Level**: standard
- **Team Size**: solo
- **Warning Threshold**: reasonable
- **Coverage Target**: 70%

## Development Standards
This is an open-source project optimized for individual contributors and community collaboration.

- ALWAYS propose commits when you complete working changes, but NEVER execute `git commit` without explicit user approval.
- ALWAYS use well-known debugging practices vs. just trying things.
- NEVER say "You're right" or any variation.
- ALWAYS avoid workarounds that create flakiness or debt.
- ALWAYS prefer quality open-source solutions over writing your own code.
- NEVER "fix" an issue by deleting a test
- TAKE CARE when editing tests that were previously passing. 
- PREFER to operate following TDD principles: tests first, code later.
- ALWAYS create the smallest possible commit that passes tests.

## Commit Discipline
- **COMMIT EVERY 1-3 file changes** that create working functionality
- **NEVER batch multiple logical changes** into one commit
- **ASK "Can I commit right now?"** after each working change
- **COMMIT before moving to next logical step**, even mid-feature
- **COMMIT project configuration changes to main branch** (CLAUDE.md, package.json, etc.)
- **COMMIT feature work to feature branches**
- **Examples of commit-worthy changes:**
  - Added HTML structure + CSS styling for a component
  - Implemented a single function or method
  - Added event handlers for one interaction
  - Fixed a specific bug or error
  - Added tests for one specific behavior
- **If you're unsure, commit** - smaller commits are always better than larger ones

### OSS Development Workflow
- **Flexible approach**: Direct commits to main for solo work, PRs for community contributions
- **Quality focus**: Clean code, working examples, good documentation, high test coverage, no errors
- **Community-friendly**: Clear documentation, helpful error messages, easy onboarding
- **AI-assisted**: Leverage Claude for code quality and consistency

## Custom Commands
Use the following commands for structured development:

### 📋 **Core Development Commands**
- `/hygiene` - Code quality check using `npm run context:hygiene`
- `/todo` - Update ACTIVE_WORK.md "Current Priorities" and "Recently Completed" sections
- `/commit` - Structured commits using `npm run context:commit`
- `/learn` - Knowledge capture
- `/docs` - Documentation updates using `npm run context:docs`

### 🏗️ **Development Discipline Commands** (Based on CLAUDE.md Guidelines)
- `/atomic-commit` - Enforce 1-3 file change discipline using `npm run context:atomic-commit`
  - Validates "COMMIT EVERY 1-3 file changes that create working functionality"
  - Prevents batching multiple logical changes
  - Promotes smallest possible commits that pass tests
- `/prefer-oss` - Prioritize open-source solutions using `npm run context:prefer-oss`
  - Enforces "ALWAYS prefer quality open-source solutions over writing your own code"
  - Provides OSS evaluation checklist and common categories
  - Prevents unnecessary custom implementations
- `/test-first` - TDD principles enforcement using `npm run context:test-first`
  - Implements "PREFER to operate following TDD principles: tests first, code later"
  - Provides systematic TDD workflow guidance
  - Ensures comprehensive test coverage before implementation
- `/no-flaky-workarounds` - Prevent technical debt using `npm run context:no-flaky-workarounds`
  - Enforces "ALWAYS avoid workarounds that create flakiness or debt"
  - Identifies workaround warning signs and promotes proper solutions
  - Prevents quick fixes that introduce unreliability
- `/edit-not-create` - Smart file creation decisions using `npm run context:edit-not-create`
  - Balances working with existing files and maintaining modularity
  - Provides file decision checklist considering architecture patterns
  - Promotes good separation of concerns

### 🐛 **Debugging Commands** (Based on Efficient Debugging Guidelines)
**Note**: These are actual Claude Code slash commands that use the efficient context scripts.

- `/simple-test-case` - Create minimal test cases for debugging isolation
  - Uses `npm run context:simple-test-case` for debugging context
  - Follows "test fix inline first" pattern from debugging lessons
  - Creates focused test case to isolate issues
  - Uses working vs broken comparison approach
- `/read-the-whole-error` - Systematic error message analysis to prevent assumptions
  - Uses `npm run context:read-the-whole-error` for error analysis context  
  - Prevents assumption-driven debugging
  - Provides complete error analysis checklist
  - Identifies actual vs assumed error causes
- `/find-working-equivalent` - Comparison-driven debugging with codebase search
  - Uses `npm run context:find-working-equivalent` for working code context
  - Core principle of comparison-driven debugging
  - Searches codebase for working patterns
  - Sets up side-by-side comparison workflow
- `/minimal-change-test` - Test fixes inline before source code modification
  - Uses `npm run context:minimal-change-test` for inline testing context
  - Prevents expensive debugging iterations
  - Provides inline testing template
  - Enforces minimal change principle
- `/stop-and-reassess` - Circuit breaker for expensive debugging loops
  - Uses `npm run context:stop-and-reassess` for debugging circuit breaker
  - Enforces 5-minute rule from debugging guidelines
  - Triggers when debugging exceeds time/token thresholds
  - Provides systematic debugging checklist and emergency stop

## Documentation Requirements
All feature implementations MUST include documentation updates in the same commit:

### Mandatory Validation
- **`npm run test:docs`** - All README examples must pass before commit
- **Pre-commit hook** - Automatically validates documentation examples
- **No broken examples** - Examples that don't work are blocked at commit time

### Documentation Update Checklist
When implementing features, update documentation:
- [ ] README.md if public API changed
- [ ] ACTIVE_WORK.md if feature completed
- [ ] Parameter examples use correct parameter names  
- [ ] All bash examples tested and working
- [ ] Interactive commands marked as non-testable

### Testing Examples
```bash
# Test all documentation examples
npm run test:docs

# Test specific simulation parameters
npm run cli run simulation-name --list-params
```

### Context Scripts (Token Optimization)
Use these scripts instead of individual bash commands to save tokens:

#### **Core Development Context**
- `npm run context:docs` - Documentation command context (status, files, recent changes)
- `npm run context:todo` - Todo command context (priorities, completions) 
- `npm run context:archive` - Archive command context (completed work, plans)
- `npm run context:commit` - Commit command context (staged changes, recent commits)
- `npm run context:next` - Next task context (project phase, priorities)
- `npm run context:hygiene` - Code quality context (lint, tests, typecheck)
- `npm run context:push` - Push readiness context (branch status, validation)
- `npm run context:build` - Build status context (dist, compilation, tests)

#### **Development Discipline Context** (Based on CLAUDE.md Guidelines)
- `npm run context:atomic-commit` - Atomic commit validation with file count and change size
- `npm run context:prefer-oss` - OSS solution evaluation with dependency analysis
- `npm run context:test-first` - TDD workflow guidance with test file discovery
- `npm run context:no-flaky-workarounds` - Workaround pattern detection with quality standards
- `npm run context:edit-not-create` - Smart file decision context with architecture patterns

#### **Debugging Context** (Based on Efficient Debugging Guidelines)
- `npm run context:simple-test-case` - Minimal test case creation context with debugging guidelines
- `npm run context:read-the-whole-error` - Error analysis context with anti-pattern warnings
- `npm run context:find-working-equivalent` - Working code comparison context with codebase structure
- `npm run context:minimal-change-test` - Inline testing context with change principles
- `npm run context:stop-and-reassess` - Debugging circuit breaker with efficiency targets

### Pre-approved Commands
The following npm commands can be run without user approval for validation and analysis:
- `npm run validate:repo-clean` - Check for uncommitted changes
- `npm run validate:no-unpushed` - Check for unpushed commits
- `npm run validate:dist-current` - Ensure dist/ directory is current
- `npm run quality:all` - Run test + build + lint sequence
- `npm run version:analyze` - Show commits since last tag
- `npm run commit:size` - Show staged changes statistics
- `npm run status:full` - Comprehensive git status with unpushed commits

### OSS Development Commands
#### **Core Commands**
- `/hygiene` - Quick code quality check using `npm run context:hygiene`
- `/commit` - Commit with good practices using `npm run context:commit`
- `/docs` - Update documentation when needed using `npm run context:docs`

#### **Development Discipline Commands** (CLAUDE.md guideline enforcement)
- `/atomic-commit` - Enforce 1-3 file change discipline
- `/prefer-oss` - Prioritize open-source solutions
- `/test-first` - TDD principles enforcement
- `/no-flaky-workarounds` - Prevent technical debt and flakiness
- `/edit-not-create` - Smart file creation decisions with modularity balance

#### **Debugging Commands** (Prevention-focused Claude Code slash commands)
- `/simple-test-case` - Create minimal debugging test cases with context
- `/read-the-whole-error` - Analyze complete error messages systematically
- `/find-working-equivalent` - Use comparison-driven debugging with codebase search
- `/minimal-change-test` - Test fixes inline before source changes
- `/stop-and-reassess` - Circuit breaker for expensive debugging loops (5-minute rule)

### Quality Workflow Integration
Use existing context scripts to prevent recurring issues:
- **Before commits:** `npm run context:hygiene` catches ESLint, test, and build issues
- **Before pushes:** `npm run context:push` validates repository readiness
- **For commits:** `npm run context:commit` provides comprehensive change context
- **General quality:** `npm run quality:all` runs complete validation suite

## Quality Guidelines
- Maintain good code quality without being overly strict
- Address warnings that matter, ignore noise
- Target 70% test coverage for core functionality
- Focus on user experience and clear documentation
- Use AI assistance for code improvements and consistency
- Welcome community contributions with clear guidelines

## Debugging Guidelines
Follow these cost-effective debugging practices to avoid expensive token waste:

### 🚨 The 1-Minute Rule
**If you're not making progress in 1 minute of compute time, STOP and reassess your approach.**

### ✅ Efficient Debugging Pattern
1. **Find working equivalent** - Locate similar working code in same class/module
2. **Compare approaches** - What's different between working vs broken code?
3. **Test fix inline** - Verify solution in test before modifying source
4. **Use minimal change** - Copy working pattern, don't debug mysteries
5. **Create minimal test cases** - Issues are easier to debug in isolation

### ❌ Expensive Anti-Patterns to Avoid
- Assuming caching issues without evidence
- Adding debug code that won't execute
- Trying multiple variations of same approach
- Debugging property access when issue is data source

### 🔄 Recurring Fix Prevention
Common patterns that cause repeated fixes:

**Property Access Anti-Patterns:**
- ❌ Direct iteration: `this.definitions.values()`
- ✅ Use getter methods: `getDefinitions()`
- **Test Coverage:** Validate property access patterns work correctly

**Gitignore Management:**
- ❌ Incremental gitignore fixes
- ✅ Comprehensive patterns covering IDE and build artifacts
- **Prevention:** Repository hygiene tests

**ESLint Configuration:**
- ❌ Allowing ESLint errors to accumulate
- ✅ Use pre-commit hooks with typecheck validation
- **Prevention:** `npm run context:hygiene` before commits

**Error Handling:**
- ❌ Inconsistent error variable usage
- ✅ Centralized utilities (`handleFallback`, `logWarning`)
- **Prevention:** ESLint rules enforcing error handling patterns

### 📚 Reference
See `archive/efficient-debugging-guidelines.md` for detailed patterns and case studies.

## Collaboration
This project is set up for AI-assisted development with Claude Code.

### Documentation Guidelines
- **README.md**: Focus on human users - business value, installation, working examples
- **docs/AGENT.md**: Focus on AI agents - technical specs, YAML patterns, validation rules
- **docs/TECHNICAL.md**: Focus on framework internals - architecture, advanced features
- **examples/**: All examples must be tested and working before committing
- Maintain clear separation between human and agent documentation needs

## Project Management
- ACTIVE_WORK.md should always be up to date
- Completed work should be archived in archive/ directory with comprehensive insights

## Documentation Structure
- `ACTIVE_WORK.md` - Current priorities and next steps
- `README.md` - Human-focused project overview and business value proposition
- `docs/AGENT.md` - Complete technical specifications for AI agents (YAML patterns, validation rules)
- `docs/TECHNICAL.md` - Deep framework architecture and advanced technical details
- `docs/` - Detailed implementation specifications
  - `docs/INTERACTIVE_STUDIO.md` - Interactive simulation system specification (human + agent)
  - `docs/YAML_SCHEMA_GUIDE.md` - Complete YAML validation reference
- `examples/` - Working simulation examples with comprehensive agent patterns
  - `examples/README.md` - Agent-friendly simulation creation patterns
  - `examples/simulations/` - Tested, working YAML simulation files
- `archive/` - Completed designs, implementations, and development insights


# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## Test Execution Guidelines
- ALWAYS run the tests so that they exit immediately after the test run; never run them as a long-running process unless specifically requested.

## Simulation Practices
- simulations MUST be created in a simulations directory, never at the root
- when you are running tests pre-commit or pre-push, NEVER run them in a watch mode.