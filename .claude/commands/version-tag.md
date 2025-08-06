---
allowed-tools: [Read, Bash]
description: version-tag command
---

# Version-tag Command

## Context
- Project status: !git status --porcelain
- Current tags: !git tag -l --sort=-version:refname | head -5
- Latest commits: !git log --oneline -5
- Package version: !grep '"version"' package.json 2>/dev/null || echo "No package.json found"

## Your task
Implement release management and version tagging for the agent-friendly Monte Carlo simulation framework.

This command supports large team coordination by creating structured releases with proper versioning and documentation.

## Output
Provide comprehensive release management covering:

### 1. **Version Analysis**
- Analyze current version state and release readiness
- Review changes since last release
- Assess breaking changes and compatibility
- Evaluate feature completeness and stability

### 2. **Semantic Versioning**
Follow [Semantic Versioning](https://semver.org/) standards:

**MAJOR.MINOR.PATCH** format:
- **MAJOR**: Breaking changes to agent-facing APIs
- **MINOR**: New agent-friendly features, backward compatible
- **PATCH**: Bug fixes and minor improvements

**Pre-release identifiers**:
- **alpha**: Early development versions
- **beta**: Feature-complete, testing in progress  
- **rc**: Release candidate, final testing

### 3. **Release Types**

**Framework Release** (Major/Minor):
- New agent capabilities or simulation features
- Business intelligence enhancements
- Configuration system improvements
- Architectural changes

**Maintenance Release** (Patch):
- Bug fixes and stability improvements
- Documentation updates
- Performance optimizations
- Security patches

**Pre-release** (Alpha/Beta/RC):
- Feature previews for agent testing
- Breaking change preparation
- Community feedback collection

### 4. **Release Process**
1. **Verify release readiness**:
   - All tests passing
   - Documentation current
   - No blocking issues
   - Agent-facing features stable

2. **Determine version bump**:
   - Analyze commits since last release
   - Assess impact on agent workflows
   - Check for breaking changes
   - Follow semantic versioning rules

3. **Create release artifacts**:
   - Update package.json version
   - Generate changelog from commits
   - Tag release with proper format
   - Push tags to remote repository

4. **Document release**:
   - Create GitHub release with notes
   - Update project documentation
   - Announce agent-facing improvements
   - Archive release documentation

### 5. **Release Notes Generation**
Extract from commit history:
- **New features** for agent simulation generation
- **Bug fixes** and stability improvements
- **Breaking changes** with migration guidance
- **Performance improvements** and optimizations
- **Documentation** updates and additions

## Version Tag Format
Use consistent tagging format:
```
v1.0.0        # Stable release
v1.1.0-beta.1 # Pre-release with identifier
v1.0.1        # Patch release
```

## Changelog Template
```markdown
# Release v[VERSION]

## Agent-Facing Features
- [List new capabilities for simulation generation]

## Framework Improvements  
- [Core framework enhancements]

## Bug Fixes
- [Issues resolved since last release]

## Breaking Changes
- [API changes requiring agent workflow updates]

## Migration Guide
- [Steps to upgrade from previous version]
```

## Release Validation
Before tagging, verify:
- **All tests pass**: `npm test`
- **TypeScript compiles**: `npx tsc --noEmit`
- **Agent examples work** with new version
- **Documentation builds** successfully
- **No uncommitted changes** remain

## Output Actions
Offer to:
- **Analyze changes** since last release
- **Recommend version bump** (major/minor/patch)
- **Generate changelog** from commit history
- **Create version tag** with proper format
- **Update package.json** version
- **Push release artifacts** to repository

## Large Team Benefits
- Consistent release process across team
- Clear communication of changes and impact
- Structured approach to version management
- Preserved release history and context
- Coordinated deployment and updates

Focus on releases that:
- Enhance agent simulation generation capabilities
- Maintain framework stability and reliability
- Provide clear migration paths for breaking changes
- Support strategic framework evolution
- Enable effective team coordination
