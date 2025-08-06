---
allowed-tools: [Read, Edit, Bash]
description: defer command
---

# Defer Command

## Context
- Project status: !git status --porcelain
- Current priorities: !grep -A 10 "Current Priorities" ACTIVE_WORK.md
- Next session items: !grep -A 10 "Next Session" ACTIVE_WORK.md

## Your task
Implement formal backlog management for the agent-friendly Monte Carlo simulation framework.

This command supports large team coordination by maintaining structured backlog with clear prioritization and rationale.

## Output
Provide formal backlog management covering:

### 1. **Backlog Analysis**
- Review current immediate priorities for deferral candidates
- Identify items that can be moved to next session
- Assess dependencies and timing constraints
- Evaluate strategic vs tactical importance

### 2. **Deferral Categories**

**Strategic Deferrals** (high impact, not urgent):
- Major framework architectural improvements
- Advanced agent intelligence features
- Performance optimizations
- New business intelligence capabilities

**Tactical Deferrals** (maintenance, nice-to-have):
- Code style improvements
- Documentation enhancements
- Tool configuration updates
- Legacy code cleanup

**Blocked Deferrals** (waiting on dependencies):
- Features requiring external integrations
- Items blocked by design decisions
- Tasks requiring additional research
- Changes dependent on completed work

### 3. **Deferral Process**
For each item being deferred:

1. **Document rationale** for deferral decision
2. **Assess impact** of delaying the item
3. **Set target timeline** for revisiting
4. **Identify prerequisites** that must be completed first
5. **Update priority level** and placement in backlog

### 4. **ACTIVE_WORK.md Management**
Maintain structured sections:

**Immediate (This Session)**:
- Keep only critical, high-impact items
- Items that must be completed for project health
- Blocking issues preventing other work

**Next Session**:
- Important but non-critical items
- Features that provide clear agent value
- Documentation and framework improvements

**Future Considerations**:
- Strategic enhancements
- Performance optimizations  
- Advanced features requiring design work
- Items dependent on completion of current work

### 5. **Deferral Documentation**
For each deferred item, document:
```
Item: [Task description]
Rationale: [Why being deferred]
Impact: [Cost of deferral]
Timeline: [When to revisit]
Prerequisites: [What must be completed first]
Priority Level: [High/Medium/Low in target session]
```

## Deferral Strategies
**Defer when:**
- Item provides marginal value compared to alternatives
- Current session is already full of critical work
- Prerequisites are not yet complete
- Item requires significant design work before implementation
- Better to batch with related future work

**Don't defer when:**
- Item is blocking other high-priority work
- Deferral will create technical debt
- Item addresses critical agent usability issues
- Framework stability depends on the item

## Output Actions
Offer to:
- **Move items** from Immediate to Next Session
- **Reclassify priorities** based on current project phase
- **Update ACTIVE_WORK.md** with revised structure
- **Document deferral rationale** for team coordination
- **Set target timelines** for revisiting deferred items

## Large Team Benefits
- Clear communication about priority changes
- Documented rationale for backlog decisions
- Structured approach to scope management
- Preserved context for future sprint planning
- Alignment on strategic vs tactical work

Focus on deferrals that:
- Maintain agent-friendly framework priorities
- Preserve development momentum on critical features
- Enable focus on highest-impact simulation capabilities
- Support strategic framework evolution
- Balance immediate needs with long-term vision
