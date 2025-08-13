# Business Template Wizard

## 🎯 Strategic Goal
Provide industry-specific simulation templates with guided creation workflows that enable rapid, accurate business analysis for common decision patterns across different industries and functional areas.

## 📋 Current State
- Generic simulation examples require significant customization
- No industry-specific parameter defaults or business logic
- Manual parameter inference from business context
- Limited guidance for users unfamiliar with Monte Carlo methodology
- Copy-modify workflow requires understanding of YAML structure and business modeling

## 🚀 Target State
```bash
# Industry-specific template creation
npm run cli create --template saas-growth --interactive

# Guided wizard for specific business decisions
npm run cli wizard hiring-decision --team-size 50 --budget 500000

# Template discovery and recommendation
npm run cli templates --industry saas --function engineering

# Custom template creation from existing simulations
npm run cli template create --from my-analysis.yaml --name "Custom ROI Template"
```

## 📐 Technical Architecture

### Component 1: Template Library System
**Purpose**: Comprehensive library of industry and function-specific simulation templates

**Template Categories**:
```typescript
interface TemplateCategory {
  industry: {
    saas: SaaSTemplates;
    ecommerce: EcommerceTemplates;
    consulting: ConsultingTemplates;
    manufacturing: ManufacturingTemplates;
    healthcare: HealthcareTemplates;
    fintech: FintechTemplates;
  };
  function: {
    engineering: EngineeringTemplates;
    marketing: MarketingTemplates;
    sales: SalesTemplates;
    operations: OperationsTemplates;
    finance: FinanceTemplates;
    hr: HRTemplates;
  };
  decisionType: {
    hiring: HiringDecisionTemplates;
    investment: InvestmentTemplates;
    automation: AutomationTemplates;
    expansion: ExpansionTemplates;
    costOptimization: CostOptimizationTemplates;
  };
}
```

**Template Structure**:
```typescript
interface BusinessTemplate {
  id: string;
  name: string;
  category: {
    industry?: string;
    function?: string;
    decisionType?: string;
  };
  description: string;
  
  // Business context
  businessIntelligence: {
    benchmarks: IndustryBenchmarks;
    commonParameters: ParameterDefaults;
    riskFactors: RiskFactors;
    successMetrics: SuccessMetrics;
  };
  
  // Template configuration
  parameterTemplate: ParameterTemplate[];
  logicTemplate: string;
  outputTemplate: OutputTemplate[];
  
  // Guided creation
  wizard: WizardStep[];
  validationRules: ValidationRule[];
  
  // Examples and documentation
  examples: ExampleScenario[];
  documentation: TemplateDocumentation;
}
```

### Component 2: Interactive Template Wizard
**Purpose**: Guide users through template-based simulation creation with business context

**Wizard Flow**:
```typescript
interface WizardStep {
  id: string;
  title: string;
  description: string;
  type: 'parameter-input' | 'scenario-selection' | 'validation' | 'preview';
  
  // Parameter collection
  parameters?: {
    key: string;
    prompt: string;
    validation: ValidationRule;
    help: string;
    businessContext: string;
  }[];
  
  // Business guidance
  businessLogic?: {
    industryBenchmarks: Benchmark[];
    recommendedRanges: Range[];
    commonMistakes: string[];
    successFactors: string[];
  };
  
  // Navigation
  nextStep: (answers: WizardAnswers) => string;
  validation: (answers: WizardAnswers) => ValidationResult;
}
```

**Interactive Features**:
```bash
# SaaS Growth Template Wizard
npm run cli create --template saas-growth --interactive

🧙‍♂️ SaaS Growth Analysis Template Wizard
══════════════════════════════════════════

Step 1/5: Business Context
──────────────────────────
Company Stage: [Seed/Series A/Series B/Growth/Mature] → Series A
Current ARR: $2.4M
Team Size: 35 employees
Primary Growth Channel: [Product-led/Sales-led/Marketing-led] → Product-led

💡 Based on Series A SaaS companies:
   • Typical growth rate: 150-400% YoY
   • Customer acquisition cost: $500-$2,000
   • Churn rate range: 5-15% monthly

Step 2/5: Investment Decision
─────────────────────────────
Decision Type: [Team Expansion/Marketing Investment/Product Development] → Team Expansion
Investment Amount: $480,000
Timeframe: 12 months

💡 Series A team expansion typically:
   • 5-8 new hires for $480K budget
   • 3-6 month ramp-up period
   • 20-40% productivity improvement

[Continue] [Back] [Help] [Quit]
```

### Component 3: Industry Benchmark Engine
**Purpose**: Provide realistic parameter defaults and validation based on industry data

**Benchmark Categories**:
```typescript
interface IndustryBenchmarks {
  saas: {
    customerAcquisitionCost: { median: 800, p25: 400, p75: 1500 };
    churnRate: { monthly: 0.08, annual: 0.15 };
    growthRate: { seed: 3.5, seriesA: 2.8, seriesB: 2.2 };
    revenuePerEmployee: { median: 180000, p25: 120000, p75: 250000 };
  };
  
  ecommerce: {
    conversionRate: { median: 0.025, p25: 0.015, p75: 0.045 };
    avgOrderValue: { median: 85, p25: 45, p75: 150 };
    customerLifetimeValue: { median: 650, p25: 300, p75: 1200 };
  };
  
  consulting: {
    utilizationRate: { median: 0.75, p25: 0.65, p75: 0.85 };
    billableRate: { junior: 150, senior: 300, principal: 500 };
    projectMargin: { median: 0.35, p25: 0.25, p75: 0.45 };
  };
}
```

**Smart Defaults Generation**:
```typescript
class BenchmarkEngine {
  async getSmartDefaults(
    industry: string, 
    companyStage: string, 
    decisionType: string
  ): Promise<ParameterDefaults> {
    // Industry-specific parameter suggestions
    const industryDefaults = this.getIndustryBenchmarks(industry);
    const stageAdjustments = this.getStageAdjustments(companyStage);
    const decisionContext = this.getDecisionContext(decisionType);
    
    return this.combineDefaults(industryDefaults, stageAdjustments, decisionContext);
  }
}
```

### Component 4: Template Customization System
**Purpose**: Allow users to create, modify, and share custom templates

**Template Operations**:
```bash
# Create custom template from existing simulation
npm run cli template create --from successful-analysis.yaml --name "SaaS Product Investment"

# Modify existing template
npm run cli template edit saas-growth --add-parameter headcount-growth

# Share template with team
npm run cli template export my-template --format shareable.json

# Import shared template
npm run cli template import team-hiring-template.json

# Template marketplace operations
npm run cli template publish saas-roi-analysis --public
npm run cli template search "marketing roi"
```

**Template Inheritance**:
```typescript
interface TemplateHierarchy {
  base: 'generic-roi-template';
  industry: 'saas-template';
  specific: 'saas-team-scaling-template';
  custom: 'company-specific-hiring-template';
}
```

## 🛠 Implementation Plan

### Phase 1: Core Template System (4-5 weeks)
**Template Library Foundation**:
- 15 essential business templates across 3 industries (SaaS, E-commerce, Consulting)
- Template discovery and selection system
- Basic parameter defaults and validation
- Template-based simulation generation

**Templates to Implement**:
```
SaaS Templates:
  • saas-team-scaling
  • saas-marketing-investment
  • saas-product-development
  • saas-customer-acquisition
  • saas-churn-reduction

E-commerce Templates:
  • ecommerce-inventory-optimization
  • ecommerce-marketing-channel-roi
  • ecommerce-fulfillment-automation
  • ecommerce-expansion-analysis

Consulting Templates:
  • consulting-team-utilization
  • consulting-practice-expansion
  • consulting-technology-investment
  • consulting-pricing-strategy
```

**CLI Command Structure**:
```bash
npm run cli templates                    # List all templates
npm run cli templates --industry saas   # Filter by industry
npm run cli create --template <id>      # Create from template
npm run cli template info <id>          # Show template details
```

### Phase 2: Interactive Wizard System (5-6 weeks)
**Guided Creation Workflow**:
- Multi-step wizard interface
- Context-aware parameter prompts
- Industry benchmark integration
- Real-time validation and suggestions
- Preview and refinement capabilities

**Wizard Features**:
```bash
# Launch interactive wizard
npm run cli wizard

🧙‍♂️ Business Simulation Wizard
══════════════════════════════

Step 1: What type of decision are you analyzing?
[1] Team hiring and scaling
[2] Technology investment  
[3] Marketing campaign ROI
[4] Product development
[5] Cost optimization
[6] Market expansion

Selection: 1

Step 2: What's your industry?
[1] SaaS/Software      [4] Consulting
[2] E-commerce         [5] Healthcare  
[3] Manufacturing      [6] Other

Selection: 1

🎯 Selected Template: SaaS Team Scaling Analysis
   Industry benchmarks: ✅ Loaded
   Parameter validation: ✅ Active
   Business context: ✅ Applied

Proceeding to guided parameter collection...
```

### Phase 3: Industry Benchmark Integration (3-4 weeks)
**Benchmark Data System**:
- Industry-specific parameter defaults
- Company stage adjustments (seed, Series A, B, growth, mature)
- Geographic and market adjustments
- Validation against industry norms

**Smart Suggestion Engine**:
- Parameter range validation with industry context
- Outlier detection with explanation
- Benchmark comparison in results
- Industry-specific risk factor modeling

### Phase 4: Template Marketplace & Customization (4-5 weeks)
**Template Sharing System**:
- Custom template creation from existing simulations
- Template import/export functionality
- Version control for template evolution
- Collaborative template development

**Advanced Features**:
- Template inheritance and composition
- Parameter group management
- Advanced validation rule creation
- Template documentation generation

## 🔧 Technical Implementation

### File Structure
```
src/
├── cli/commands/
│   ├── create-wizard.ts             # Interactive creation wizard
│   ├── template-management.ts       # Template CRUD operations
│   └── benchmark-integration.ts     # Industry benchmark lookup
├── templates/
│   ├── template-library.ts          # Template storage and retrieval
│   ├── template-engine.ts           # Template processing
│   ├── wizard-engine.ts             # Interactive wizard logic
│   └── benchmark-engine.ts          # Industry benchmark system
├── wizards/
│   ├── base-wizard.ts               # Common wizard functionality
│   ├── saas-wizard.ts               # SaaS-specific wizards
│   ├── ecommerce-wizard.ts          # E-commerce wizards
│   └── consulting-wizard.ts         # Consulting wizards
└── benchmarks/
    ├── industry-data.ts             # Industry benchmark data
    ├── stage-adjustments.ts         # Company stage factors
    └── market-adjustments.ts        # Geographic/market factors
```

### Template Storage Structure
```
templates/
├── industry/
│   ├── saas/
│   │   ├── team-scaling.yaml
│   │   ├── marketing-roi.yaml
│   │   └── product-development.yaml
│   ├── ecommerce/
│   │   ├── inventory-optimization.yaml
│   │   └── marketing-channel-roi.yaml
│   └── consulting/
│       ├── utilization-analysis.yaml
│       └── practice-expansion.yaml
├── function/
│   ├── engineering/
│   ├── marketing/
│   └── sales/
└── decision-type/
    ├── hiring/
    ├── investment/
    └── automation/
```

### Core Classes
```typescript
class TemplateWizard {
  async launchWizard(templateId?: string): Promise<SimulationConfig>;
  async runWizardStep(step: WizardStep, context: WizardContext): Promise<WizardAnswers>;
  async validateWizardAnswers(answers: WizardAnswers): Promise<ValidationResult>;
  async previewSimulation(config: SimulationConfig): Promise<PreviewResults>;
}

class TemplateLibrary {
  async discoverTemplates(filters: TemplateFilters): Promise<BusinessTemplate[]>;
  async getTemplate(id: string): Promise<BusinessTemplate>;
  async createFromTemplate(templateId: string, parameters: ParameterOverrides): Promise<SimulationConfig>;
  async saveCustomTemplate(config: SimulationConfig, metadata: TemplateMetadata): Promise<string>;
}

class BenchmarkEngine {
  async getBenchmarks(industry: string, stage: string): Promise<IndustryBenchmarks>;
  async validateParameter(value: number, benchmarks: Benchmark): Promise<ValidationResult>;
  async suggestParameterRange(parameter: string, context: BusinessContext): Promise<ParameterRange>;
}
```

## 📊 Template Examples

### SaaS Team Scaling Template
```yaml
id: saas-team-scaling
name: SaaS Team Scaling Decision Analysis
category:
  industry: saas
  function: engineering
  decisionType: hiring

businessIntelligence:
  benchmarks:
    revenuePerEmployee: 180000
    rampUpTime: 3
    productivityGain: 0.25
  riskFactors:
    coordinationOverhead: true
    cultureImpact: true
    marketTiming: false

parameters:
  - key: currentTeamSize
    label: Current Team Size
    type: number
    default: 25
    benchmarkValidation:
      industry: saas
      stage: seriesA
      metric: teamSize

  - key: newHires
    label: Number of New Hires
    type: number
    default: 8
    validation:
      min: 1
      max: 50
      businessRule: "Should be 10-40% of current team size"

wizard:
  - step: business-context
    title: Business Context
    parameters: [currentARR, teamSize, stage]
    
  - step: hiring-decision
    title: Hiring Decision
    parameters: [newHires, avgSalary, timeline]
    
  - step: risk-assessment
    title: Risk Factors
    parameters: [coordinationRisk, marketRisk]
```

## 🚀 Agent Integration Benefits

### For AI Agents
- **Structured Template Discovery**: Programmatic access to industry-specific templates
- **Guided Parameter Collection**: Systematic approach to gather business parameters
- **Benchmark Validation**: Automatic validation against industry norms
- **Template Customization**: Create reusable templates for common business patterns

### For Business Users
- **Industry Expertise**: Built-in knowledge of industry benchmarks and best practices
- **Guided Experience**: Step-by-step creation process with context and explanations
- **Reduced Errors**: Template validation prevents common business modeling mistakes
- **Learning Integration**: Understand business modeling principles through guided creation

## 📈 Success Metrics

### Template Usage
- **Template Adoption Rate**: Percentage of simulations created using templates vs from scratch
- **Template Completion Rate**: Percentage of wizard sessions that result in working simulations
- **Template Accuracy**: Validation rate of template-generated simulations
- **Template Diversity**: Coverage across industries and decision types

### User Experience
- **Time to Simulation**: Reduction in time from business question to working analysis
- **User Satisfaction**: Survey scores for template vs manual creation process
- **Learning Curve**: Improvement in user understanding of business modeling
- **Template Sharing**: Usage of custom template creation and sharing features

### Business Impact
- **Decision Quality**: Improved accuracy of business parameter estimation
- **Analysis Consistency**: Standardization of business analysis approaches
- **Knowledge Sharing**: Reuse of successful analysis patterns across teams
- **Onboarding Speed**: Faster adoption of simulation framework by new users

## 🔗 Integration Points

### Existing Framework Integration
- **Schema Validation**: All templates generate valid YAML configurations
- **Simulation Engine**: Templates leverage existing MonteCarloEngine
- **CLI Architecture**: Templates integrate seamlessly with existing command structure
- **Interactive Session**: Wizard mode extends existing interactive capabilities

### Future Enhancement Hooks
- **Natural Language Integration**: Templates can be selected and customized via natural language
- **Comparison Engine**: Template-based scenarios feed into comparison analysis
- **Export Pipeline**: Template metadata enhances business reporting
- **Collaboration Features**: Templates enable standardized team analysis workflows

This template wizard system transforms the framework from a technical tool into an accessible business intelligence platform that incorporates industry expertise and best practices while maintaining the flexibility and rigor of the underlying Monte Carlo engine.