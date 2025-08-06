---
allowed-tools: [Read, Edit, Bash]
description: learn command
---

# Learn Command

## Context
- Project status: !git status --porcelain
- Recent commits: !git log --oneline -5
- Current development insights: !grep -A 10 "Development Insights" ACTIVE_WORK.md || echo "No current insights section"

## Your task
Capture knowledge and insights from the current development session for the agent-friendly Monte Carlo simulation framework.

Analyze the current session's work to extract valuable learnings about:

## Output
Generate structured knowledge capture covering:

### 1. **Technical Insights**
- New patterns discovered in agent-simulation interaction
- Effective approaches for YAML configuration design
- Business intelligence integration patterns
- Framework extensibility insights

### 2. **Agent-Friendly Patterns** 
- What makes simulations easier for agents to generate
- Optimal configuration structure for agent understanding
- Documentation patterns that improve agent guidance
- Common agent mistakes and how to prevent them

### 3. **Development Lessons**
- High-ROI development approaches for simulation frameworks
- Testing strategies that catch agent-generated configuration issues
- Code organization patterns that scale with agent usage
- Integration patterns between business context and simulations

### 4. **Framework Evolution**
- Architectural decisions that improved agent experience
- Features that agents use most effectively
- Missing capabilities agents frequently need
- Framework bottlenecks that limit agent creativity

### 5. **Strategic Insights**
- Business intelligence features that add real value
- Scenario configurations that provide meaningful analysis
- Template patterns that agents can successfully customize
- Documentation gaps that block agent productivity

## Integration
Offer to:
- Update ACTIVE_WORK.md "Development Insights" section with new learnings
- Create focused knowledge documents in `archive/` for significant insights
- Update README.md with improved agent guidance based on learnings
- Add code comments that help future agents understand framework patterns

Focus on insights that will improve:
- Agent simulation generation success rate
- Framework usability for AI-driven development  
- Business intelligence integration effectiveness
- Code quality and maintainability for agent-generated configurations
