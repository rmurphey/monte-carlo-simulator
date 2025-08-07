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
Manage and update documentation for the agent-friendly Monte Carlo simulation framework.

Focus on keeping documentation current, accurate, and optimized for agent guidance.

## Output
Provide documentation management covering:

### 1. **Documentation Audit**
- Review README.md for accuracy and agent guidance
- Check ACTIVE_WORK.md for outdated or completed items
- Verify scenario documentation matches current implementation
- Identify gaps in agent-facing documentation

### 2. **Agent Guidance Optimization**
- Improve YAML configuration examples
- Enhance error message documentation
- Update simulation creation workflows
- Clarify business intelligence integration

### 3. **Documentation Structure**
- Ensure logical information hierarchy
- Maintain clear separation between user docs and development docs
- Verify cross-references and links are accurate
- Keep archive references current

### 4. **Framework Documentation**
- Update API documentation for configuration schemas
- Document new business intelligence features
- Maintain scenario system documentation
- Keep template and example documentation current

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
Offer to:
- **Update README.md** with current project state
- **Refresh ACTIVE_WORK.md** to remove outdated content
- **Enhance agent guidance** in configuration documentation  
- **Create missing docs** for new features
- **Archive outdated docs** to maintain clarity
- **Fix broken links** and references
- **Improve examples** with tested configurations

## Quality Checks
After documentation updates:
- Verify all examples work with current implementation
- Check that agent guidance is clear and actionable
- Ensure business intelligence docs match current features
- Test that scenario documentation produces expected results
- Validate that links and references are accurate

Focus on documentation that:
- Makes agent simulation generation more successful
- Reduces common configuration errors
- Provides clear business intelligence guidance
- Maintains framework usability as it evolves
