# Business Intelligence Template System Integration

## Problem Statement

The agent-friendly Monte Carlo simulation framework currently has template library issues that impact agent experience and limit business intelligence capabilities:

1. **Template Loading Errors**: Persistent "Skipping template marketing-campaign-roi.yaml: YAML formatting issue" warnings reduce agent confidence
2. **Limited BI Integration**: Template system lacks business intelligence context and metadata
3. **Restricted Agent Options**: Natural language generation limited by template availability and quality
4. **Missing Business Context**: Templates don't provide sufficient business intelligence hints for agent optimization

**Business Need**: Complete Phase 2 by resolving template library issues and integrating comprehensive business intelligence features to enhance agent simulation generation capabilities.

## User Stories

### Primary Agent User Story
**As an AI agent generating business simulations,**
**I want a reliable template library with comprehensive business intelligence metadata,**
**So that I can confidently generate simulations without warnings and with rich business context.**

**Acceptance Criteria:**
- All templates load without YAML formatting errors
- Template selection includes business intelligence context
- Agent natural language generation has access to expanded template library
- Business metadata enhances template auto-selection accuracy

### Secondary Developer User Story
**As a business analyst using the framework,**
**I want templates with rich business intelligence features,**
**So that I can create more sophisticated and contextually appropriate simulations.**

## Current State Analysis

### Template Library Status
```bash
# Current templates (6 available)
examples/simulations/
├── ai-tool-adoption/ (directory)
├── marketing-campaign-roi.yaml ⚠️ YAML formatting issue
├── simple-roi-analysis.yaml ✅ working
├── software-investment-roi.yaml ✅ working
├── team-scaling-decision.yaml ✅ working
└── technology-investment.yaml ✅ working
```

### Issues Identified
1. **YAML Formatting**: marketing-campaign-roi.yaml has parsing errors
2. **Template Coverage**: Limited template variety for agent generation
3. **BI Metadata**: Templates lack comprehensive business intelligence context
4. **Agent Experience**: Persistent warnings impact agent confidence

## Solution Design

### Phase A: Template Library Cleanup (30 minutes)

#### A1: Fix YAML Formatting Issues
**Target**: `examples/simulations/marketing-campaign-roi.yaml`

**Root Cause Analysis**:
- Template was copied from `src/cli/templates/` which had formatting issues
- YAML syntax errors prevent template loading
- Error occurs during TemplateLibrary.loadTemplates()

**Solution**:
1. Validate YAML syntax with `yaml.parse()`
2. Fix formatting issues (indentation, syntax errors)
3. Ensure template matches SimulationConfig schema
4. Test template loading in agent workflows

#### A2: Template Validation System
**Implementation**:
```typescript
// Add to TemplateLibrary class
private validateTemplateYaml(templatePath: string, content: string): boolean {
  try {
    const config = yaml.parse(content) as SimulationConfig
    const validator = new ConfigurationValidator()
    const validation = validator.validateConfig(config)
    
    if (!validation.valid) {
      console.warn(`⚠️  Template ${path.basename(templatePath)}: ${validation.errors.join(', ')}`)
      return false
    }
    return true
  } catch (error) {
    console.warn(`⚠️  Template ${path.basename(templatePath)}: YAML syntax error - ${error.message}`)
    return false
  }
}
```

### Phase B: Business Intelligence Integration (60-90 minutes)

#### B1: Enhanced Template Metadata
**Extend BusinessTemplate interface**:
```typescript
export interface BusinessTemplate {
  config: SimulationConfig
  info: TemplateInfo
  guidance: {
    whenToUse: string
    parameterTips: Record<string, string>
    businessInsights: string[]
    industryBenchmarks?: Record<string, string>
  }
  // NEW: Business Intelligence Extensions
  businessIntelligence: {
    industry: string[]
    businessModel: 'B2B' | 'B2C' | 'B2B2C' | 'Marketplace' | 'SaaS'
    decisionType: 'investment' | 'operational' | 'strategic' | 'tactical'
    riskProfile: 'low' | 'medium' | 'high'
    timeHorizon: 'short' | 'medium' | 'long'
    kpiCategories: string[]
    agentOptimization: {
      keywords: string[]
      contextHints: string[]
      parameterPriority: string[]
    }
  }
}
```

#### B2: Intelligent Template Auto-Selection
**Enhance AgentOptimizedStudio.findBestTemplate()**:
```typescript
async findBestTemplate(context: AgentContext): Promise<BusinessTemplate | null> {
  await this.initialize()
  
  // NEW: Multi-factor template scoring
  const scoredTemplates = this.templateLibrary.getAllTemplates().map(template => ({
    template,
    score: this.calculateTemplateScore(template, context)
  }))
  
  // Sort by score and return best match
  scoredTemplates.sort((a, b) => b.score - a.score)
  return scoredTemplates[0]?.score > 0 ? scoredTemplates[0].template : null
}

private calculateTemplateScore(template: BusinessTemplate, context: AgentContext): number {
  let score = 0
  
  // Intent matching (40% weight)
  if (this.matchesIntent(template, context.intent)) score += 40
  
  // Industry context (30% weight)  
  if (context.industryContext && template.businessIntelligence.industry.includes(context.industryContext)) {
    score += 30
  }
  
  // Business model alignment (20% weight)
  if (this.inferBusinessModel(context) === template.businessIntelligence.businessModel) {
    score += 20
  }
  
  // Keyword relevance (10% weight)
  const keywordScore = this.calculateKeywordRelevance(template, context)
  score += keywordScore * 0.1
  
  return score
}
```

#### B3: Agent Workflow Optimization
**Enhanced Context Processing**:
```typescript
// Extend parseIntent method
parseIntent(naturalLanguageQuery: string): Partial<AgentContext> {
  const query = naturalLanguageQuery.toLowerCase()
  
  return {
    // Existing parsing logic...
    
    // NEW: Business Intelligence Inference
    businessModel: this.inferBusinessModel(query),
    decisionType: this.inferDecisionType(query),
    riskTolerance: this.inferRiskProfile(query),
    urgency: this.inferTimeHorizon(query)
  }
}
```

### Phase C: Validation & Testing (30 minutes)

#### C1: Comprehensive Template Testing
```bash
# Test all templates load without errors
npm run cli studio generate "test all templates" --validate

# Test each template individually
npm run cli run examples/simulations/marketing-campaign-roi.yaml --quiet
npm run cli run examples/simulations/simple-roi-analysis.yaml --quiet
# ... test all templates
```

#### C2: Agent Workflow Validation
```bash
# Test various natural language inputs
npm run cli studio generate "Marketing campaign for B2B SaaS company" --validate
npm run cli studio generate "Should we invest in AI development tools" --validate
npm run cli studio generate "Team scaling decision for startup" --validate
```

## Implementation Timeline

### Week 1: Template System Enhancement
- **Day 1**: Phase A - Template library cleanup (✅ immediate impact)
- **Day 2**: Phase B1 - BI metadata integration
- **Day 3**: Phase B2 - Intelligent template selection
- **Day 4**: Phase B3 - Agent workflow optimization  
- **Day 5**: Phase C - Testing and validation

### Success Metrics
- ✅ Zero template loading warnings
- 📈 Expanded template library (6+ working templates)
- 🎯 Improved agent template selection accuracy
- 💼 Rich business intelligence context in all templates
- 🤖 Enhanced agent natural language → YAML generation

## Technical Architecture

### Component Integration
```
AgentOptimizedStudio
├── TemplateLibrary (enhanced)
│   ├── validateTemplateYaml() (new)
│   ├── loadTemplatesWithBI() (enhanced)
│   └── BusinessTemplate (extended interface)
├── Enhanced Template Scoring
│   ├── calculateTemplateScore() (new)
│   ├── inferBusinessContext() (new)
│   └── multiFactorMatching() (new)
└── RealTimeValidator (existing)
    └── Enhanced template validation
```

### Data Flow
1. **Agent Query** → Natural Language Processing
2. **Context Inference** → Business Intelligence Extraction
3. **Template Scoring** → Multi-factor Template Selection
4. **YAML Generation** → Enhanced Parameter Suggestions
5. **Validation** → Real-time BI-aware Feedback

## Risk Mitigation

### Technical Risks
- **Template Compatibility**: All changes maintain backward compatibility
- **Performance**: Template scoring cached for repeated queries
- **Validation**: Comprehensive testing before template updates

### Business Risks
- **Agent Experience**: Gradual rollout with fallback to existing templates
- **Quality**: Each template manually validated before inclusion
- **Documentation**: All changes documented with examples

## Success Criteria

### Phase Completion Indicators
1. ✅ All templates load without warnings or errors
2. 📊 Business intelligence metadata complete for all templates
3. 🎯 Agent template selection accuracy >90% for common business scenarios
4. 📈 Agent natural language generation covers 8+ business scenario types
5. 🧪 Comprehensive test coverage for all template operations

### Agent Experience Improvements
- Elimination of template loading warnings
- Richer business context in simulation generation
- More accurate template auto-selection
- Enhanced parameter suggestions with business intelligence

## Future Enhancements

### Phase 4 Preparation
- Template versioning system
- Dynamic template generation
- Industry-specific template collections
- A/B testing framework for template effectiveness

**This design provides a comprehensive foundation for completing Phase 2 and transitioning smoothly into Phase 3 enhanced features.**