---
allowed-tools: [Bash, Read]
description: commit command
---

# Commit Command

## Context
- Ensure that the test server is running in the background; start it if not.
- Ensure that the test server shows all tests passing.
- Context data: !npm run context:commit --silent
- ALWAYS consider whether your commit could be smaller and more independently meaningful
- ALWAYS attempt small, incremental, atomic tests with 100% passing tests
- NEVER commit code that doesn't pass tests. 

## Your task
Create structured commits following conventional commit standards for the agent-friendly Monte Carlo simulation framework.

This command ensures atomic, well-documented commits that support large team coordination. This command MAY create multiple commits if needed for good hygiene.

## Commit Standards
Follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format:
```
<type>(<scope>): <description>

[optional body]

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Types
- **feat**: New features for agents or framework
- **fix**: Bug fixes and error corrections  
- **docs**: Documentation updates
- **refactor**: Code restructuring without functional changes
- **test**: Testing improvements and coverage
- **chore**: Maintenance tasks and tooling
- **perf**: Performance optimizations
- **style**: Code formatting and style fixes

### Scopes
- **framework**: Core simulation framework
- **agents**: Agent-facing functionality
- **config**: YAML configuration system
- **business**: Business intelligence features
- **scenarios**: Scenario system
- **cli**: Command-line interface
- **docs**: Documentation system
- **tests**: Testing infrastructure

## Process
1. **Analyze staged changes** to understand the scope and impact
2. **Determine appropriate type and scope** based on changes
3. **Write clear description** focusing on "why" rather than "what"
4. **Check commit size** - prefer < 200 lines, never exceed 1000 lines
5. **Include context** if the change affects agent workflow or framework architecture
6. **Stage any additional files** needed for atomic commit
7. **Create the commit** with proper conventional format

## Commit Size Guidelines
- **Ideal**: < 200 lines changed
- **Acceptable**: 200-500 lines for complex features
- **Warning**: 500-1000 lines (explain necessity)
- **Never**: > 1000 lines (break into smaller commits)

## Pre-commit Validation
Before committing, verify:
- All tests pass: `npm test` (if applicable)
- TypeScript compiles: `npm run build` or `npx tsc`
- Linting passes: `npm run lint` (if available)
- No sensitive information included
- Commit message follows conventional format

## Example Commits
```bash
feat(agents): add ARR business context injection for strategic simulations

Enables agents to automatically include business intelligence functions 
when generating simulations with strategic keywords like "roi", "investment".

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```bash
fix(config): resolve YAML validation error for scenario configurations

Scenario definitions were failing validation due to missing required 
properties in JSON schema.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```bash
docs(framework): update README to focus on agent-friendly simulation generation

Reposition project as framework for agents to create simulations 
declaratively via YAML configuration.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Output
After successful commit:
- Display commit hash and summary
- Show any warnings about commit size
- Confirm conventional commit format compliance
- Note any pre-commit hooks that ran
- Suggest next steps if needed (e.g., push, create PR)

Focus on commits that:
- Maintain atomic, logical change units
- Support framework evolution tracking
- Enable effective code review
- Preserve development history for agents
- Follow team coordination standards
