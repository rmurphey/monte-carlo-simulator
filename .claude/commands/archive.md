# Archive Command

## Purpose
Archive completed designs, implementations, and development phases while capturing comprehensive insights and lessons learned.

## Behavior
When `/archive` is executed, perform the following systematic process:

### 1. Analyze Completed Work
- Review `ACTIVE_WORK.md` to identify completed phases or major achievements
- Identify designs in `designs/` directory that have been fully implemented
- Look for sections marked as "✅ Complete" or "Recently Completed"
- Assess which work represents significant milestones worth archiving

### 2. Create Comprehensive Archive Documents
For each completed work item, create detailed archive documents in `archive/` directory containing:

**Technical Implementation**:
- Complete implementation details and code references
- Technical achievements and metrics
- Architecture decisions and patterns used
- Integration points and dependencies

**Business Impact**:
- Business metrics and validation results
- User experience improvements
- Strategic value delivered
- Success criteria validation

**Development Insights**:
- Lessons learned and architectural insights
- High-ROI development patterns identified
- Technical decisions and rationale
- Challenges overcome and solutions found

**Knowledge Preservation**:
- Patterns for future reuse
- Best practices discovered
- Anti-patterns to avoid
- Framework evolution insights

### 3. Update ACTIVE_WORK.md
- Clean up completed sections from detailed descriptions
- Replace with concise references to archived documents
- Maintain focus on current priorities and next steps
- Preserve project momentum and clarity

### 4. Update Project Documentation
- Update `README.md` to reference new archive locations
- Update `CLAUDE.md` documentation structure section
- Ensure archive directory is properly linked and discoverable
- Maintain clear separation between current and completed work

### 5. Preserve Development Knowledge
- Capture development patterns and strategies
- Document high-impact technical decisions
- Record business intelligence insights
- Create knowledge base for future development phases

## Archive Document Structure
Each archive document should include:

```markdown
# [Feature/Phase Name] Archive

## Overview
[Brief summary and status]

## Implementation Achievements
[Technical details and code references]

## Business Impact
[Metrics, validation, strategic value]

## Technical Insights
[Architectural patterns, lessons learned]

## Success Metrics
[Criteria validation and achievements]

## Lessons Learned
[Development insights and future guidance]
```

## Output Expectations
- Comprehensive historical record of completed work
- Clean, focused ACTIVE_WORK.md highlighting current priorities
- Searchable knowledge base for future development
- Clear project evolution documentation
- Preserved development insights and patterns

## Success Criteria
- All significant completed work is properly archived
- ACTIVE_WORK.md remains focused on current priorities
- Archive documents serve as both history and knowledge base
- Project documentation accurately reflects current state
- Development insights are preserved for future reference

## Notes
- Archive only completed work - do not archive active designs or work in progress
- Ensure archive documents are comprehensive enough to serve as knowledge base
- Maintain clear links between current documentation and archived work
- Focus on capturing insights that will be valuable for future development