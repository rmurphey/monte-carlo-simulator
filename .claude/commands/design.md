---
allowed-tools: [Read, Write, Edit, Bash]
description: design command
---

# Design Command

## Context
- Project status: !git status --porcelain
- Existing designs: !ls designs/ 2>/dev/null || echo "No designs directory"
- Current active work: !grep -A 5 "Current Status" ACTIVE_WORK.md

## Your task
Create formal feature design documentation for the agent-friendly Monte Carlo simulation framework.

This command supports large team coordination by creating comprehensive design documents before implementation begins.

## Output
Generate structured design documents covering:

### 1. **Problem Definition**
- Clear statement of the feature need
- User stories focusing on agent simulation generation
- Business intelligence requirements
- Framework integration requirements

### 2. **Technical Design**
- Architecture overview with component interactions
- API design for agent-facing interfaces
- YAML configuration schema changes
- Integration patterns with existing framework
- Data flow and state management

### 3. **Agent Experience Design**
- Agent workflow optimization
- Configuration simplicity analysis
- Error handling and validation approach
- Documentation and guidance strategy
- Template and example patterns

### 4. **Implementation Plan**
- Development phases with clear deliverables
- Testing strategy for agent-generated configurations
- Migration strategy for existing simulations
- Performance and scalability considerations
- Risk assessment and mitigation

### 5. **Success Criteria**
- Measurable outcomes for agent usability
- Business intelligence value validation
- Framework integration success metrics
- Code quality and maintainability standards

## Process
1. **Create design document** in `designs/[feature-name].md`
2. **Reference related work** from ACTIVE_WORK.md and archive
3. **Include concrete examples** of agent usage patterns
4. **Define acceptance criteria** for each deliverable
5. **Estimate complexity** and development timeline

## Design Document Template
```markdown
# [Feature Name] Design

## Problem Statement
[Clear definition of what needs to be built and why]

## User Stories
[Agent-focused user stories with acceptance criteria]

## Technical Design
[Architecture, APIs, data flow, integration patterns]

## Agent Experience
[Workflow optimization, configuration design, guidance strategy]

## Implementation Plan
[Phases, deliverables, testing approach, timeline]

## Success Criteria
[Measurable outcomes and validation approach]

## Dependencies
[Prerequisites and integration requirements]

## Risks & Mitigation
[Technical and business risks with mitigation strategies]
```

## Integration
After creating design:
- Link design document from ACTIVE_WORK.md
- Update project documentation structure
- Create corresponding todo items for implementation phases
- Schedule design review before implementation begins

Focus on designs that enhance:
- Agent simulation generation capabilities
- Framework extensibility and maintainability  
- Business intelligence integration
- YAML configuration flexibility
- Strategic simulation analysis
