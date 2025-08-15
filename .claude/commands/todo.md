---
allowed-tools: [Read, Edit, Bash]
description: todo command
---

# Todo Command

## Context
- Context data: !npm run context:todo --silent

## Your task
Manage todos in ACTIVE_WORK.md for the agent-friendly Monte Carlo simulation framework.

Display current priorities from ACTIVE_WORK.md and provide todo management capabilities.

## Output
Show:
1. **Current priorities** from ACTIVE_WORK.md "Current Priorities" section
2. **Priority levels** (Immediate vs Next Session)
3. **Progress status** of each priority item
4. **Development phase context** (hygiene, design, implementation)

Offer to:
- Update ACTIVE_WORK.md with new priorities
- Mark priorities as completed (move to "Recently Completed" section)
- Adjust priority levels and descriptions
- Add new strategic priorities for simulation framework

Focus on todos related to:
- Agent integration improvements
- Simulation framework enhancements  
- Documentation and guidance
- Code quality and testing
- YAML configuration features
- Strategic simulation generation

**IMPORTANT**: Always edit ACTIVE_WORK.md directly. NEVER use TodoWrite tool for /todo command.

ARGUMENTS: $ARGUMENTS