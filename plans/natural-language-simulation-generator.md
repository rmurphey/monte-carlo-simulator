# Natural Language Simulation Generator

## 🎯 Strategic Goal
Enable AI agents and users to generate Monte Carlo simulations directly from natural language business questions, eliminating the need to manually construct YAML configurations.

## 📋 Current State
- Agents must copy and manually modify existing YAML examples
- No direct path from business question to working simulation
- Gap between natural language business problems and technical YAML configuration
- Manual parameter mapping and logic construction required

## 🚀 Target State
```bash
# Natural language to working simulation
npm run cli generate "Should we hire 5 senior developers at $150K each or invest $600K in automation tools for our 50-person engineering team?"

# Interactive refinement
npm run cli generate --interactive --prompt "ROI analysis for marketing campaign with $100K budget"

# Template-guided generation
npm run cli generate --template technology-investment --prompt "AI tool adoption for development team"
```

## 📐 Technical Architecture

### Component 1: Natural Language Parser
**Purpose**: Extract structured business parameters from natural language

**Implementation**:
- **Pattern Recognition Engine**: Identify business question types (ROI, hiring, technology, marketing)
- **Entity Extraction**: Parse monetary amounts, team sizes, timeframes, business metrics
- **Intent Classification**: Map questions to simulation categories and templates

**Key Patterns**:
```typescript
interface BusinessQuestionParsing {
  questionType: 'roi' | 'hiring' | 'technology' | 'marketing' | 'growth';
  entities: {
    investment?: number;
    teamSize?: number;
    timeframe?: string;
    costs?: number[];
    benefits?: string[];
  };
  uncertainty: string[];
  comparisonScenarios?: string[];
}
```

### Component 2: Template Matching Engine
**Purpose**: Select best-fit simulation template based on parsed business question

**Template Categories**:
- **Technology Investment**: Software tools, infrastructure, automation
- **Team Scaling**: Hiring decisions, productivity analysis, coordination overhead
- **Marketing ROI**: Campaign analysis, customer acquisition, growth strategies  
- **Product Decisions**: Feature development, market expansion, platform choices
- **Financial Analysis**: Cash flow, runway, investment comparisons

**Matching Algorithm**:
```typescript
interface TemplateScore {
  templateId: string;
  confidence: number;
  parameterMatches: string[];
  missingParameters: string[];
  suggestedDefaults: Record<string, any>;
}
```

### Component 3: Parameter Inference Engine
**Purpose**: Generate realistic parameter values and ranges from business context

**Inference Rules**:
- **Developer Salaries**: $120K-180K based on seniority mentions
- **Team Productivity**: 15-25% gains for automation tools
- **Adoption Rates**: 70-90% for internal tools, 40-60% for external
- **Implementation Time**: 3-12 months based on complexity indicators
- **Risk Factors**: Market uncertainty, technical complexity, team readiness

**Smart Defaults**:
```yaml
# From: "5 senior developers at $150K each"
parameters:
  - key: teamSize
    default: 5
    derived: "extracted from '5 senior developers'"
  - key: avgSalary  
    default: 150000
    derived: "extracted from '$150K each'"
  - key: seniorityLevel
    default: "senior"
    derived: "extracted from 'senior developers'"
```

### Component 4: Simulation Logic Generator
**Purpose**: Create appropriate Monte Carlo logic based on business question type

**Logic Templates**:
```javascript
// Technology Investment Pattern
const adoptionRate = ${adoptionRate} * (0.7 + random() * 0.6); // 70-130% variance
const productivityGain = ${productivityGain} * adoptionRate;
const annualSavings = ${teamSize} * ${avgSalary} * (productivityGain / 100);
const roi = ((annualSavings - ${investment}) / ${investment}) * 100;

// Hiring Decision Pattern  
const coordinationOverhead = ${teamSize} > 20 ? (0.05 + random() * 0.1) : 0.02;
const effectiveProductivity = ${productivityGain} * (1 - coordinationOverhead);
const netBenefit = (${salary} * effectiveProductivity) - ${salary};
```

## 🛠 Implementation Plan

### Phase 1: Core Generation Engine (2-3 weeks)
**CLI Command Structure**:
```bash
npm run cli generate [options] <business-question>

Options:
  --interactive    Launch interactive refinement session
  --template <id>  Force specific template selection
  --output <file>  Save generated simulation to file
  --validate       Validate generated configuration
  --dry-run        Show generated YAML without saving
```

**MVP Features**:
- Parse 5 common business question patterns
- Map to existing simulation templates  
- Extract monetary amounts and team sizes
- Generate basic parameter configurations
- Validate generated YAML with existing schema

### Phase 2: Advanced Parsing & Templates (3-4 weeks)
**Enhanced Features**:
- Industry-specific template matching
- Multi-scenario generation (conservative/aggressive)
- Uncertainty modeling from language cues ("might", "could", "risky")
- Comparative question handling ("A vs B" scenarios)

**Template Library Expansion**:
- SaaS Growth Analysis templates
- E-commerce Investment templates  
- Consulting ROI templates
- Manufacturing Efficiency templates

### Phase 3: Interactive Refinement (2-3 weeks)
**Interactive Features**:
```bash
# Generated simulation review and refinement
> npm run cli generate "Marketing campaign ROI for $100K budget" --interactive

🤖 Generated Simulation: Marketing Campaign ROI Analysis
📋 Extracted Parameters:
   • campaignBudget: $100,000
   • expectedConversion: 2.5% (industry average)
   • customerLifetimeValue: $2,400 (estimated)
   
🎛️ Refinement Options:
   [p] Adjust parameters  [s] Modify scenarios  [l] Update logic
   [t] Change template    [r] Regenerate       [✓] Accept & run
```

**Refinement Capabilities**:
- Parameter adjustment with business context
- Scenario modification (conservative/aggressive)
- Logic customization with guided prompts
- Template switching with parameter migration

### Phase 4: Advanced Business Intelligence (3-4 weeks)
**Smart Context Integration**:
- ARR-based parameter suggestions for SaaS companies
- Industry benchmarking for realistic defaults
- Competitive analysis integration
- Market timing and uncertainty factors

**Business Rule Engine**:
```typescript
interface BusinessRules {
  industryBenchmarks: {
    saas: { customerAcquisitionCost: [100, 500], churnRate: [0.05, 0.15] };
    ecommerce: { conversionRate: [0.02, 0.05], avgOrderValue: [50, 200] };
  };
  teamSizeRules: {
    coordinationOverhead: (size: number) => size > 10 ? 0.1 : 0.05;
    communicationCost: (size: number) => Math.pow(size, 1.2);
  };
}
```

## 🔧 Technical Implementation

### File Structure
```
src/
├── cli/commands/
│   └── generate-simulation.ts        # Main generate command
├── generation/
│   ├── natural-language-parser.ts   # Parse business questions
│   ├── template-matcher.ts          # Match templates to questions  
│   ├── parameter-inference.ts       # Infer realistic parameters
│   ├── logic-generator.ts           # Generate simulation logic
│   └── interactive-refiner.ts       # Interactive refinement session
├── templates/
│   ├── template-library.ts          # Template definitions
│   ├── business-rules.ts            # Industry benchmarks
│   └── pattern-matching.ts          # Question pattern recognition
└── validation/
    └── generation-validator.ts       # Validate generated configurations
```

### Core Classes
```typescript
class NaturalLanguageGenerator {
  async generateFromQuestion(question: string): Promise<SimulationConfig>;
  async parseBusinessQuestion(question: string): Promise<BusinessQuestionParsing>;
  async matchTemplate(parsing: BusinessQuestionParsing): Promise<TemplateScore[]>;
  async inferParameters(template: string, parsing: BusinessQuestionParsing): Promise<Parameter[]>;
  async generateLogic(template: string, parameters: Parameter[]): Promise<string>;
}

class InteractiveRefiner {
  async refineParameters(config: SimulationConfig): Promise<SimulationConfig>;
  async adjustScenarios(config: SimulationConfig): Promise<SimulationConfig>;
  async customizeLogic(config: SimulationConfig): Promise<SimulationConfig>;
}
```

## 📊 Success Metrics

### Technical Metrics
- **Generation Success Rate**: >85% of business questions produce valid YAML
- **Template Match Accuracy**: >90% confidence in template selection
- **Parameter Inference Quality**: >80% of inferred parameters within realistic ranges
- **Validation Pass Rate**: 100% of generated YAML passes schema validation

### User Experience Metrics
- **Question to Simulation Time**: <30 seconds for basic questions
- **Refinement Iterations**: <3 iterations to reach satisfactory simulation
- **Agent Adoption Rate**: Measure usage by AI agents vs manual YAML creation

### Business Impact Metrics
- **Simulation Creation Volume**: Track increase in simulation usage
- **Decision Quality**: Measure improved business decision outcomes
- **User Satisfaction**: Survey scores for generation vs manual process

## 🚀 Agent Integration Benefits

### For AI Agents
- **Direct Business Question Processing**: No manual YAML construction required
- **Contextual Parameter Generation**: Realistic business defaults automatically inferred
- **Validation Integration**: Generated simulations guaranteed to work
- **Iterative Refinement**: Programmatic access to improve generated simulations

### For Human Users
- **Natural Language Interface**: Business professionals can create simulations without technical knowledge
- **Interactive Refinement**: Guided process to improve simulation accuracy
- **Template Recommendations**: Smart suggestions based on business context
- **Learning Integration**: Generated simulations become starting points for further customization

## 🔗 Integration Points

### Existing Framework Integration
- **Schema Validation**: All generated YAML must pass existing bulletproof validation
- **Template System**: Extend existing examples as generation templates
- **CLI Architecture**: Integrate as new command in existing CLI framework
- **Interactive Session**: Build on existing `--interactive` mode capabilities

### Future Enhancement Hooks
- **Web Interface**: Generated simulations can feed into future web UI
- **API Integration**: REST endpoints for programmatic generation
- **Collaboration Features**: Generated simulations as starting points for team collaboration
- **Advanced Analytics**: Generated simulation patterns feed into optimization engine

This implementation transforms the framework from a technical tool requiring YAML expertise into an accessible business intelligence platform that speaks natural language while maintaining the robust foundation and validation system already in place.