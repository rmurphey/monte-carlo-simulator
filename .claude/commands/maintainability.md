---
allowed-tools: [Read, Bash, Glob, Grep]
description: maintainability command
---

# Maintainability Command

## Context
- Project status: !git status --porcelain
- Test coverage: !npm test 2>/dev/null | tail -10 || echo "No test command available"
- TypeScript errors: !npx tsc --noEmit 2>&1 | wc -l || echo "No TypeScript check available"
- Code metrics: !find src -name "*.ts" -exec wc -l {} \; | awk '{sum += $1} END {print "Total lines:", sum}' 2>/dev/null || echo "No src directory"

## Your task
Analyze code health and maintainability for the agent-friendly Monte Carlo simulation framework.

Provide comprehensive maintainability assessment focusing on large team coordination and agent-friendly development patterns.

## Output
Generate code health analysis covering:

### 1. **Code Quality Metrics**
Assess current state:
- **Test coverage percentage** and gaps
- **TypeScript compilation status** and error count
- **Code complexity** and method length analysis
- **Documentation coverage** and quality
- **Dependency health** and update status

### 2. **Technical Debt Assessment**
Identify maintenance burdens:
- **TODO comments** and temporary implementations
- **Deprecated patterns** and legacy code sections
- **Code duplication** and refactoring opportunities
- **Unused exports** and dead code
- **Missing error handling** and edge cases

### 3. **Agent-Friendly Patterns Analysis**
Evaluate agent development support:
- **Configuration schema completeness** and validation
- **Error message clarity** for agent debugging
- **Documentation accessibility** for AI understanding
- **Example quality** and coverage
- **Template structure** and reusability

### 4. **Large Team Coordination Health**
Assess team scalability:
- **Code consistency** across modules
- **Architectural pattern adherence**
- **Interface design** and coupling analysis
- **Testing strategy** effectiveness
- **Knowledge documentation** completeness

### 5. **Framework Evolution Readiness**
Evaluate extensibility:
- **Plugin architecture** flexibility
- **Configuration system** extensibility
- **Business intelligence integration** patterns
- **Scenario system** scalability
- **API design** for future enhancements

## Analysis Areas

### Code Structure
- File organization and module boundaries
- Import/export patterns and dependencies
- Class and function design coherence
- Configuration and schema organization

### Testing Health
- Unit test coverage and quality
- Integration test completeness
- Agent-generated configuration testing
- Error scenario coverage

### Documentation Quality
- README accuracy and completeness
- Code comment quality and coverage
- API documentation currency
- Agent guidance effectiveness

### Performance Considerations
- Simulation execution efficiency
- Memory usage patterns
- Configuration parsing performance
- Large dataset handling capability

## Maintainability Recommendations

### High Priority Fixes
Issues that impact daily development:
- Failing tests and build errors
- Critical documentation gaps
- Agent workflow blockers
- Framework stability issues

### Medium Priority Improvements
Technical debt that slows development:
- Code duplication reduction
- Test coverage improvements
- Documentation updates
- Refactoring opportunities

### Low Priority Enhancements
Long-term code health:
- Performance optimizations
- Code style consistency
- Advanced tooling setup
- Dependency updates

## Output Format
For each analysis area, provide:
```
Area: [Analysis category]
Current Status: [Good/Fair/Poor]
Issues Found: [List of specific problems]
Impact: [How it affects development/agents]
Recommendations: [Specific improvement actions]
Effort Estimate: [Low/Medium/High]
```

## Actionable Outcomes
Offer to:
- **Fix critical issues** immediately
- **Create improvement plan** with prioritized actions
- **Update ACTIVE_WORK.md** with maintainability priorities
- **Generate technical debt backlog**
- **Implement quick wins** for immediate improvement

Focus on maintainability that:
- Reduces agent simulation generation friction
- Improves framework reliability for large teams
- Enhances code comprehension for AI development
- Supports sustainable framework evolution
- Maintains high code quality standards
