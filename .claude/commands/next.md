---
allowed-tools: [Read, Bash]
description: next command
---

# Next Command

## Context
- Context data: !npm run context:next --silent

## Your task
Analyze ACTIVE_WORK.md, README.md, and any other sources of roadmap information, and recommend the next logical task for the agent-friendly Monte Carlo simulation framework.

Prioritize based on:
1. **Current development phase** (hygiene, design, implementation)
2. **Immediate priorities** from ACTIVE_WORK.md
3. **Blocking issues** that prevent other work
4. **Agent workflow optimization** - tasks that improve agent experience

## Output
Provide:
1. **Recommended next task** with clear rationale
2. **Prerequisites** if any dependencies need to be resolved first
3. **Expected outcome** of completing this task
4. **Time estimate** (quick fix vs substantial work)
5. **Agent impact** - how this improves the agent-friendly experience

Focus on tasks that:
- Improve agent simulation generation capabilities
- Enhance YAML configuration flexibility
- Fix blocking technical issues
- Complete half-finished features
- Improve documentation for agent guidance

If no clear next step, suggest conducting `/hygiene` to identify technical debt or gaps.