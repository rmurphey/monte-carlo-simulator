---
allowed-tools: [Bash, Read, Grep]
description: push command
---

# Push Command

## Context
- Branch status: !git status --branch --porcelain
- Unpushed commits: !git log @{u}..HEAD --oneline
- Remote tracking: !git branch -vv

## Your task
Push current branch to remote repository with comprehensive validation and documentation checks. 

Also make sure the dist/ directory is current and matches source code for NPX compatibility. 

This command ensures safe pushing following large team coordination standards.

## Pre-push Validation
Before pushing, verify:
- Working directory is clean (no uncommitted changes)
- All commits follow conventional commit standards
- **Documentation is up to date** with recent changes
- **dist/ directory is current** with TypeScript source (for NPX compatibility)
- Tests pass (if test command available)
- Code builds successfully (if build command available)
- Branch is up to date with remote

## Documentation Validation
Check and update documentation:
- Verify README.md reflects current functionality
- Update ACTIVE_WORK.md if work is completed
- Ensure examples/ directory has working examples
- Validate YAML schemas are documented
- Check that API changes are reflected in docs/
- Archive completed work to archive/ directory

## Push Process
1. **Check working directory status** - ensure clean state
2. **Validate documentation currency** - scan for outdated docs
3. **Validate unpushed commits** - review commit messages and sizes
4. **Check dist/ directory currency** - rebuild if TypeScript source is newer
5. **Run quality checks** if available:
   - `npm test` (if test script exists)
   - `npm run build` (if build script exists)
   - `npm run lint` (if lint script exists)
6. **Check remote tracking** - ensure proper upstream branch
7. **Update documentation** if gaps found
8. **Stage and commit updated dist/** if needed for NPX compatibility
9. **Push to remote** with appropriate flags
10. **Confirm push success** and provide summary

## Push Safety
- Never force push to main/master branches
- Warn if pushing large number of commits
- Validate conventional commit format compliance
- Check for sensitive information in commit history
- Ensure upstream branch is properly configured
- Verify documentation completeness before push

## Output
After successful push:
- Display pushed commits summary
- Show documentation validation results
- Show remote branch URL if available
- Suggest next steps (e.g., create PR, notify team)
- Report any warnings or quality issues

## Error Handling
If push fails:
- Identify specific failure reason
- Provide clear resolution steps
- Suggest pull/rebase if behind remote
- Offer documentation fixes if needed
- Provide force-push options only when safe
