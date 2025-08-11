# Terminology Alignment Design: Templates vs Examples

## Problem Statement

The project documentation and codebase have inconsistent terminology around "templates" causing confusion for both users and agents:

1. **Documentation refers to "templates"** extensively in:
   - `docs/DIRECTORY_STRUCTURE.md` - describes `/templates/` directory
   - `docs/AGENT.md` - references `studio` commands and template-based creation
   - `docs/CLI_REFERENCE.md` - mentions template creation commands
   - Various references to "TemplateLibrary" and template workflows

2. **Codebase reality**:
   - `/templates/` directory exists with 5 YAML files
   - `TemplateLibrary` class exists but appears unused
   - No `studio` commands in actual CLI
   - No template-based generation functionality implemented
   - Examples in `/examples/simulations/` serve the template role

3. **User confusion**:
   - Documentation promises features that don't exist
   - Agents attempt to use non-existent `studio generate` commands
   - Unclear distinction between templates, examples, and user simulations

## User Stories

### As an AI Agent
- I want consistent terminology so I can reliably generate working commands
- I want clear guidance on which files to use as starting points for simulation creation
- I want to understand the difference between examples, templates, and user simulations

### As a Human User
- I want to understand what files I can copy and modify vs what files are system-managed
- I want clear naming that reflects the actual purpose of each directory
- I want documentation that matches the actual implementation

### As a Developer
- I want consistent terminology across codebase and documentation
- I want clear separation of concerns between different file types
- I want to remove dead code and unimplemented features

## Current State Analysis

### What Exists
```
/templates/          - 5 YAML files, identical structure to examples
/examples/simulations/ - 6 YAML files, well-documented, tested
/simulations/        - User workspace with 3 scenarios
TemplateLibrary      - Complex class with BI metadata generation
definition-studio.ts - Unused studio infrastructure
```

### What's Missing
- No `studio` commands in CLI
- No template-based generation
- No business intelligence metadata usage
- No intelligent template selection

### What's Confusing
- `/templates/` and `/examples/simulations/` have identical content structure
- Documentation promises features that don't exist
- TemplateLibrary exists but isn't integrated with CLI

## Technical Design

### Option 1: Embrace Examples-First Approach (Recommended)

**Simplify to match actual usage patterns:**

```
/examples/simulations/  - "Starting point patterns" (keep)
/simulations/          - "User workspace" (keep)
/templates/            - Remove entirely
```

**Implementation:**
1. **Remove `/templates/` directory** - consolidate into examples
2. **Remove TemplateLibrary class** - unused complex infrastructure  
3. **Remove definition-studio.ts** - unused studio infrastructure
4. **Update all documentation** to use "examples" terminology
5. **Simplify to copy-and-modify workflow**

**Advantages:**
- Matches actual user behavior (copy from examples)
- Eliminates dead code and unimplemented features
- Clear, simple mental model
- Consistent with current working patterns

### Option 2: Implement Full Template System

**Complete the template vision:**

1. **Implement `studio` commands** in CLI
2. **Integrate TemplateLibrary** with actual template selection
3. **Add business intelligence metadata** to templates
4. **Create template-based generation** workflow

**Disadvantages:**
- Significant implementation effort
- Complex system for unclear benefit
- Current copy-from-examples works well
- Adds complexity without clear user value

### Option 3: Hybrid Approach

**Rename for clarity but keep structure:**

```
/patterns/     - Rename templates to "patterns" 
/examples/     - Keep as learning/documentation examples
/simulations/  - User workspace
```

## Agent Experience Design

### Current Agent Pain Points
1. Documentation references `npm run cli studio generate` (doesn't exist)
2. Unclear which files to use as starting points
3. Confusing terminology in guidance

### Proposed Agent Experience (Option 1)
```bash
# Clear, working commands
npm run cli run examples/simulations/simple-roi-analysis.yaml
cp examples/simulations/simple-roi-analysis.yaml my-analysis.yaml
npm run cli validate my-analysis.yaml
npm run cli run my-analysis.yaml
```

**Agent guidance becomes:**
- "Copy from examples/simulations/ directory"  
- "Modify the YAML file for your use case"
- "Validate and run your simulation"

## Implementation Plan

### Phase 1: Immediate Cleanup (1 day)
1. **Remove `/templates/` directory**
   - Content duplicated in `/examples/simulations/`
   - No loss of functionality
   
2. **Remove dead code**
   - Delete `TemplateLibrary` class
   - Delete `definition-studio.ts` 
   - Remove unused template infrastructure

3. **Update documentation**
   - Replace "template" with "example" throughout
   - Remove studio command references
   - Update workflow to copy-from-examples

### Phase 2: Documentation Consistency (1 day)  
1. **Update all docs files**
   - `AGENT.md` - Remove studio references
   - `CLI_REFERENCE.md` - Remove template commands
   - `DIRECTORY_STRUCTURE.md` - Remove templates section
   - `QUICK_REFERENCE.md` - Ensure examples-first language

2. **Update README links**
   - Remove broken TEMPLATE_USAGE.md references
   - Ensure all documentation links work

### Phase 3: Verification (1 day)
1. **Test all documented commands** 
2. **Validate agent workflows** work as documented
3. **Update examples** if needed for clarity
4. **Run full test suite**

## Success Criteria

### Measurable Outcomes
1. **Zero broken documentation links** ✅
2. **All documented commands work** ✅  
3. **Agent workflows match documentation** ✅
4. **Consistent terminology** across all files ✅
5. **Simplified codebase** with dead code removed ✅

### Agent Experience Validation
- Agent can follow documentation to create simulations
- No references to non-existent features
- Clear distinction between examples (copy from) and simulations (user workspace)

### User Experience Validation  
- New users understand the copy-from-examples workflow
- Documentation matches actual CLI capabilities
- Clear mental model: examples → copy → modify → run

## Dependencies

### Prerequisites
- Current codebase (no external dependencies)
- All tests passing (already achieved)

### Integration Requirements
- Maintain NPX compatibility
- Preserve all working examples
- Keep user simulations intact

## Risks & Mitigation

### Risk: Breaking User Workflows
**Mitigation**: Templates directory appears unused by actual users, only exists in documentation

### Risk: Removing Useful Code
**Mitigation**: TemplateLibrary and studio code is complex but unused - can restore from git if needed

### Risk: Agent Confusion During Transition
**Mitigation**: Quick implementation (3 days total) minimizes transition period

## Alternative Considered: Keep Templates

**Why not implement full template system?**
- Current examples-based workflow is simple and works well
- Template system adds complexity without clear user benefit  
- Users naturally copy and modify existing examples
- Implementation effort better spent on other features

## Conclusion

**Recommend Option 1: Examples-First Approach**

This aligns the codebase with actual usage patterns, eliminates dead code, and provides clear documentation that matches implementation. The copy-from-examples workflow is intuitive and already how users naturally work with the system.

**Timeline: 3 days for complete terminology alignment**