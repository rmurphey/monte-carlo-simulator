---
allowed-tools: [Read, Bash]
description: estimate command
---

# Estimate Command

## Context
- Project status: !git status --porcelain
- Current work phase: !grep -A 5 "Current Status" ACTIVE_WORK.md
- Pending priorities: !grep -A 10 "Immediate (This Session)" ACTIVE_WORK.md

## Your task
Estimate Claude Code costs for completing tasks in the agent-friendly Monte Carlo simulation framework.

Provide detailed project estimation including token usage, session time, and implementation complexity.

## Output
Generate comprehensive cost estimation covering:

### 1. **Task Analysis**
- Break down immediate priorities from ACTIVE_WORK.md
- Identify task complexity levels (simple/medium/complex)
- Assess dependencies and prerequisites
- Estimate implementation scope

### 2. **Token Usage Estimation**
Based on typical Claude Code patterns:

**Code Analysis Tasks** (reading, understanding codebase):
- Simple: 5,000-15,000 tokens
- Medium: 15,000-40,000 tokens  
- Complex: 40,000-100,000 tokens

**Implementation Tasks** (writing, refactoring code):
- Simple: 10,000-25,000 tokens
- Medium: 25,000-60,000 tokens
- Complex: 60,000-150,000 tokens

**Documentation Tasks** (updating docs, writing guides):
- Simple: 3,000-8,000 tokens
- Medium: 8,000-20,000 tokens
- Complex: 20,000-50,000 tokens

**Testing & Validation** (writing tests, debugging):
- Simple: 8,000-20,000 tokens
- Medium: 20,000-45,000 tokens
- Complex: 45,000-100,000 tokens

### 3. **Session Time Estimation**
Typical session durations:
- **Quick fixes**: 15-30 minutes
- **Feature implementation**: 1-3 hours
- **Complex refactoring**: 2-5 hours
- **Full feature delivery**: 3-8 hours

### 4. **Cost Factors**
Consider additional factors:
- **Iteration cycles**: Debugging and refinement
- **Context switching**: Understanding existing code
- **Testing overhead**: Validation and quality assurance
- **Documentation updates**: Keeping docs current
- **Large team coordination**: Following strict processes

### 5. **Risk Multipliers**
Apply multipliers for:
- **Legacy code integration**: 1.5x
- **Complex business logic**: 2x
- **Agent-facing API changes**: 1.8x
- **Framework architectural changes**: 2.5x
- **Integration with external systems**: 2x

## Estimation Template
For each task, provide:

```
Task: [Task Name]
Complexity: [Simple/Medium/Complex]
Base Estimate: [Token range]
Risk Factors: [List applicable risks]
Adjusted Estimate: [Final token range]
Session Time: [Time estimate]
Prerequisites: [Dependencies]
```

## Total Project Estimation
Summarize:
- **Total token estimate** for all immediate priorities
- **Total session time** required
- **Recommended session breakdown** 
- **Cost optimization suggestions**
- **Risk mitigation strategies**

## Cost Optimization Recommendations
Suggest ways to reduce costs:
- Batch similar tasks together
- Use existing patterns and templates
- Leverage framework utilities
- Minimize context switching
- Focus on high-impact changes first

Focus on estimates for:
- Agent simulation generation improvements
- Framework extensibility enhancements
- Business intelligence integration
- YAML configuration system updates
- Documentation and guidance improvements
