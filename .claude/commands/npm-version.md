---
allowed-tools: [Bash, Read, Edit, TodoWrite]
description: Smart npm version management and publishing workflow
---

# NPM Version Command

## Context
- Current version: !grep '"version"' package.json
- Git status: !git status --porcelain
- Unpushed commits: !git log origin/main..HEAD --oneline
- Recent commits: !git log --oneline -5
- NPM publish status: !npm view monte-carlo-simulator version

## Your task
Intelligently recommend version bumps (major/minor/patch) and publish to npm with full workflow validation.

This command ensures safe, atomic version updates with proper pre-flight checks and conventional release practices.

## Version Bump Guidelines

### Semantic Versioning Rules
- **MAJOR** (X.0.0): Breaking changes, API changes, removed features
- **MINOR** (x.X.0): New features, backwards-compatible additions
- **PATCH** (x.x.X): Bug fixes, small improvements, documentation

### Change Analysis
Analyze recent commits since last version to recommend appropriate bump:
- Look for breaking changes � MAJOR
- Look for new features � MINOR  
- Look for only fixes/docs � PATCH

### Keywords to Analyze
- **MAJOR signals**: "breaking", "remove", "delete", "change API", "incompatible"
- **MINOR signals**: "feat", "add", "new", "enhance", "feature"
- **PATCH signals**: "fix", "bug", "docs", "chore", "refactor", "style"

## Pre-flight Validation
Before any version bump, MUST verify:

### 1. Repository State
- **Clean working directory**: No uncommitted changes
- **All changes pushed**: No unpushed commits to origin/main
- **Tests passing**: `npm test` succeeds
- **Build successful**: `npm run build` succeeds
- **Linting clean**: `npm run lint` (if available)

### 2. Package State
- **package.json valid**: No syntax errors
- **Dependencies current**: No critical security vulnerabilities
- **Files array correct**: All needed files included in npm package

## Workflow Process

### Phase 1: Analysis & Recommendation
1. **Check repository cleanliness**
2. **Analyze commits since last version** using git log
3. **Recommend version bump** based on conventional commit analysis
4. **Present recommendation** with reasoning to user
5. **Await user confirmation** before proceeding

### Phase 2: Pre-flight Checks
1. **Run full test suite**: `npm test`
2. **Build distribution**: `npm run build`
3. **Lint codebase**: `npm run lint` (if available)
4. **Validate package.json**: Check syntax and fields
5. **ABORT if any checks fail**

### Phase 3: Version & Publish
1. **Update package.json version**
2. **Build final distribution**: `npm run build`
3. **Commit version bump**: Following conventional commit format
4. **Push to origin**: Ensure remote is updated
5. **Publish to npm**: `npm publish`
6. **Verify publication**: Check npm registry

## Commands Sequence

```bash
# Phase 1: Repository validation
git status --porcelain                    # Must be empty
git log origin/main..HEAD                 # Must be empty
npm test                                   # Must pass
npm run build                              # Must succeed

# Phase 2: Version analysis  
git log $(git describe --tags --abbrev=0)..HEAD --oneline  # Analyze changes
# Recommend version bump based on changes

# Phase 3: Version bump & publish (after user confirmation)
# Update package.json version
npm run build                              # Rebuild with new version
git add package.json                       # Stage version change
git commit -m "chore: bump version to X.X.X"  # Commit version bump
git push                                   # Push to remote
npm publish                                # Publish to npm
npm view monte-carlo-simulator version    # Verify publication
```

## Safety Checks

### Before Starting
- [ ] Git working directory is clean
- [ ] All commits are pushed to origin/main
- [ ] Currently on main/master branch
- [ ] NPM authentication is valid

### Before Publishing
- [ ] All tests pass
- [ ] Build succeeds without errors
- [ ] Linting passes (if configured)
- [ ] package.json is valid JSON
- [ ] Version number follows semver format

### After Publishing
- [ ] NPM registry shows new version
- [ ] Git remote has version commit
- [ ] Local repo matches remote state

## Error Handling

### Repository Not Clean
```
L BLOCKED: Repository has uncommitted changes
Run: git status
Action needed: Commit or stash changes before versioning
```

### Unpushed Commits
```
L BLOCKED: Repository has unpushed commits
Run: git push
Action needed: Push all commits before versioning
```

### Test Failures
```
L BLOCKED: Tests are failing
Run: npm test
Action needed: Fix failing tests before publishing
```

### Build Failures
```
L BLOCKED: Build is failing
Run: npm run build
Action needed: Fix build errors before publishing
```

## Example Session

```
=
 ANALYZING REPOSITORY STATE...
 Working directory clean
 All commits pushed
 Tests passing (92/92)
 Build successful

=
 ANALYZING CHANGES SINCE v1.0.2...
Found 3 commits:
- feat(simulations): add ai-cost-impact simulation
- fix(gitignore): exclude examples/simulations properly  
- docs: update README examples

=� RECOMMENDATION: MINOR version bump (1.0.2 � 1.1.0)
Reason: New feature added (ai-cost-impact simulation)

Proceed with version 1.1.0? [y/N]
```

## Output Format
After successful version & publish:
- Display old � new version
- Show commit hash of version bump
- Confirm npm publication success  
- Display next steps or recommendations
- Note any warnings or important info

## Integration with Workflow
This command integrates with:
- `/commit` - Ensures clean commits before versioning
- `/push` - Validates repository state
- `/hygiene` - Pre-publish quality checks
- `npm test` - Automated testing validation

Focus on:
- **Safety first**: Multiple validation layers
- **Clear communication**: Show what's happening and why
- **Atomic operations**: Each step succeeds or fails completely
- **Conventional practices**: Follow semver and npm best practices