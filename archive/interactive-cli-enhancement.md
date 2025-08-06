# Interactive CLI Enhancement Design

## Overview

Design for enhancing the Monte Carlo simulation framework's interactive CLI to better guide users through creating business-realistic simulations. Focus on utility and ROI rather than feature proliferation.

## Problem Statement

The current interactive CLI is technically complete but could better guide users toward creating meaningful business scenarios. Users need help understanding:
- When to use ARR framework for business simulations
- Realistic parameter ranges for business scenarios  
- Industry-standard formulas and calculations
- Pre-built scenarios they can customize

## Proposed Features & ROI Analysis

### 1. Industry-Specific Templates
**Description**: Pre-built YAML templates for common business scenarios (restaurant, SaaS, retail, marketing, project estimation).

**ROI Assessment**: 🟢 **High**
- **Effort**: Medium (create 5-8 quality templates)
- **Impact**: Very High (immediate utility, showcases capabilities)
- **User Value**: Users get working simulations immediately
- **Maintenance**: Low (templates are static)

**Implementation Details**:
- Restaurant profitability with industry KPIs
- SaaS metrics (MRR, churn, CAC:CLV)
- Marketing campaign ROI with viral coefficients
- Software project estimation with team scaling
- Retail inventory and demand planning
- Manufacturing capacity optimization

### 2. Business Context Guidance
**Description**: Enhanced prompts that help users understand when ARR framework applies and suggest realistic business parameters.

**ROI Assessment**: 🟢 **High**
- **Effort**: Low (mostly prompts and guidance text)
- **Impact**: High (prevents unrealistic simulations, improves utility)
- **User Value**: Guides users to create meaningful business scenarios
- **Maintenance**: Minimal

**Implementation Details**:
- Context-aware help text based on parameter types
- Suggested parameter ranges for business scenarios
- ARR framework explanation and adoption guidance
- Industry benchmarks and realistic defaults

### 3. Enhanced Simulation Logic Examples
**Description**: Context-aware code generation with business-realistic formulas and better default logic.

**ROI Assessment**: 🟡 **Medium-High**
- **Effort**: Medium (smart template generation based on parameters)
- **Impact**: High (reduces barrier to entry, improves simulation quality)
- **User Value**: Users don't need to understand Monte Carlo math
- **Maintenance**: Medium (logic templates need validation)

**Implementation Details**:
- Pattern recognition for business scenarios
- Pre-built formulas for common calculations (CAC, churn, seasonal variation)
- Monte Carlo variation patterns (multiplicative vs additive uncertainty)
- Industry-standard calculation methods

### 4. ARR Framework Integration Prompts
**Description**: Automatically detect business scenarios and offer to inject ARR parameters with suggested defaults.

**ROI Assessment**: 🟡 **Medium**
- **Effort**: Medium (integration with existing ARR injection system)
- **Impact**: Medium (streamlines ARR adoption but framework already works)
- **User Value**: Reduces setup friction for business simulations
- **Maintenance**: Low (leverages existing ARR code)

**Implementation Details**:
- Pattern detection for business vs academic scenarios
- ARR parameter injection with scenario-appropriate defaults
- Department budget allocation suggestions
- Company size scaling recommendations

### 5. Business Scenario Wizard (Lower Priority)
**Description**: Multi-step wizard that asks business questions first, then derives technical parameters.

**ROI Assessment**: 🔴 **Low-Medium**
- **Effort**: High (complex decision tree, many business domains)
- **Impact**: Medium (nice-to-have but current approach works)
- **User Value**: Easier for non-technical users but adds complexity
- **Maintenance**: High (business logic changes frequently)

## Implementation Phases

### Phase 1: High ROI Quick Wins
**Timeline**: 1-2 weeks
**Goal**: Immediate utility improvement

1. **Industry-Specific Templates**
   - Create 5-6 production-ready business scenario templates
   - Include realistic parameters, industry KPIs, and proven formulas
   - Document each template with business context and use cases

2. **Business Context Guidance**
   - Add contextual help and guidance prompts
   - Improve parameter suggestion logic
   - Enhance default simulation logic generation

### Phase 2: Medium ROI Enhancements  
**Timeline**: 2-3 weeks
**Goal**: Reduce technical barrier to entry

3. **Enhanced Logic Examples**
   - Pattern-based simulation logic generation
   - Business formula library integration
   - Improved error handling and validation

4. **ARR Integration Prompts**
   - Automatic business scenario detection
   - ARR parameter injection suggestions
   - Department budget allocation guidance

### Phase 3: Advanced Features
**Timeline**: TBD (Low priority)
**Goal**: Advanced user experience

5. **Business Scenario Wizard**
   - Multi-step business-first approach
   - Complex decision tree implementation
   - Non-technical user optimization

## Success Criteria

### Immediate (Phase 1)
- [ ] Users can create working business simulations in <5 minutes
- [ ] Templates provide realistic, actionable business insights
- [ ] Generated simulations match industry benchmarks

### Medium-term (Phase 2)
- [ ] 80% of created simulations use business-realistic parameters
- [ ] ARR framework adoption increases for business scenarios
- [ ] User-reported simulation quality improves

### Long-term (Phase 3)
- [ ] Non-technical users can create meaningful simulations
- [ ] Template usage exceeds custom creation
- [ ] Community contributions of new templates

## Technical Considerations

### Architecture
- Extend existing `InteractiveConfigBuilder` class
- Create `TemplateLibrary` for pre-built scenarios
- Add `BusinessContextHelper` for guidance and suggestions
- Integrate with existing ARR injection system

### File Structure
```
src/cli/
├── interactive/
│   ├── config-builder.ts          # Enhanced with business guidance
│   ├── template-library.ts        # Industry-specific templates
│   ├── business-context-helper.ts # Guidance and suggestions
│   └── logic-generator.ts         # Enhanced simulation logic
└── templates/
    ├── restaurant-profitability.yaml
    ├── saas-metrics.yaml
    ├── marketing-roi.yaml
    ├── project-estimation.yaml
    └── retail-planning.yaml
```

### Quality Assurance
- All templates must pass comprehensive validation
- Business formulas verified against industry standards
- User testing with non-technical business users
- Documentation includes business context for each template

## Risks and Mitigation

### Risk: Template Quality
**Mitigation**: Focus on 5-6 high-quality templates rather than many mediocre ones

### Risk: Business Logic Complexity
**Mitigation**: Start with proven, simple formulas; add complexity incrementally

### Risk: Maintenance Burden
**Mitigation**: Prioritize static templates and simple guidance over complex logic

### Risk: User Confusion
**Mitigation**: Extensive testing with target users; clear documentation

## Implementation Notes

This design prioritizes practical utility over feature completeness. The goal is to make the tool more useful for business scenario analysis while maintaining the clean, focused architecture.

Each phase delivers immediate value and can be deployed independently. Success is measured by user ability to create realistic, actionable business simulations quickly and easily.