---
allowed-tools: [Read, Edit, Write, Bash]
description: docs command
---

# Docs Command

## Context
- Project status: !git status --porcelain
- Documentation files: !find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" | head -10
- Recent changes: !git log --oneline --name-only -3 | grep "\.md$" | head -5
- Specifically consider README.md at the root, and all content in docs/

## Your task
Update documentation based on recent code changes and new features.

Focus on targeted updates that reflect actual changes rather than comprehensive audits.

## Strategy
**Change-Driven Documentation Updates:**

### 1. **Identify Recent Changes**
- Review git status and recent commits for new features
- Find new files (simulations, utilities, commands)
- Identify modified CLI options or capabilities
- Detect new or changed configuration options

### 2. **Update Documentation to Match Changes**
- Add new features to README.md examples
- Update CLI reference with new options/commands
- Document new simulation templates
- Refresh ACTIVE_WORK.md with completed features

### 3. **Verify Examples Still Work**
- Test documented commands and examples
- Update any broken references or examples
- Ensure agent guidance reflects current capabilities

### 4. **Agent-Focused Updates Only**
- Prioritize documentation that helps agents use the framework
- Update YAML configuration examples if schema changed
- Document new validation rules or error messages
- Add working examples for new features

## Documentation Priorities
Based on project phase and agent needs:

**High Priority:**
- README.md accuracy for current capabilities
- YAML configuration documentation
- Agent workflow examples
- Error handling and validation docs

**Medium Priority:**
- API reference documentation
- Business intelligence feature docs
- Advanced configuration patterns
- Troubleshooting guides

**Low Priority:**
- Development setup documentation
- Historical design decisions
- Performance optimization guides
- Advanced customization docs

## Actions Available
Focus on changes since last documentation update:
- **Update README.md** with new features and capabilities
- **Update CLI_REFERENCE.md** with new command options
- **Document new simulations** and templates
- **Update ACTIVE_WORK.md** with completed work
- **Fix broken examples** caused by code changes
- **Add agent guidance** for new features only

## Quality Checks
After targeted documentation updates:
- Test new examples mentioned in documentation
- Verify new CLI options are correctly documented
- Ensure new simulation templates work as documented
- Check that agent guidance reflects current capabilities

**Efficient approach:**
- Only update docs for actual changes, not comprehensive reviews
- Focus on user-facing changes that need documentation
- Test examples that were modified, not all examples
- Prioritize agent workflow impact over comprehensive coverage
