# Technical Documentation

## 🤖 Agent Integration

This framework is specifically designed for AI agents to create simulations through conversation:

### **Agent Workflow:**
1. **Question Analysis**: Agent parses strategic business questions
2. **Configuration Generation**: Agent creates YAML simulation config
3. **Parameter Refinement**: Interactive parameter adjustment through dialog
4. **Execution**: Monte Carlo simulation with business intelligence
5. **Strategic Insights**: Results formatted for executive decision-making

### **Supported Question Types:**
- **Technology Investment**: "Should we adopt AI coding tools?"
- **Resource Planning**: "Optimal team scaling strategy for next quarter?"
- **Timing Decisions**: "When to migrate to microservices architecture?"
- **Cost-Benefit Analysis**: "ROI of hiring 5 developers vs buying automation tools?"
- **Risk Assessment**: "What's our runway at current burn rate with market volatility?"

## 🧠 Business Intelligence Features

**Automatic Context Injection:**
- **ARR-based budgeting** that scales with company size
- **Strategic business functions**: ROI, payback period, runway calculation, NPV
- **Industry benchmarks** and realistic parameter validation
- **Scenario analysis**: Conservative/Neutral/Aggressive risk modeling

**Agent-Optimized:**
- **Config-first approach**: 90% of simulations through YAML, custom code when needed
- **Smart business context detection**: Automatically injects ARR/business functions for strategic simulations
- **Conversational refinement**: Easy parameter adjustment through dialog
- **Executive reporting**: Results formatted for C-level strategic decisions

## 🛠 Framework Architecture

### **Agent-Friendly Design:**
- **Declarative Configuration**: YAML-first simulation creation
- **Business Context Injection**: Automatic ARR/business intelligence functions
- **Formula Evaluation**: Rich expression language for business calculations
- **Extensible**: Custom TypeScript for complex logic when needed

### **Core Components:**
```
src/
├── framework/
│   ├── ConfigurableSimulation.ts    # YAML-driven simulation engine
│   ├── ARRBusinessContext.ts        # Business intelligence injection
│   ├── base/BusinessSimulation.ts   # Strategic business calculations
│   └── MonteCarloEngine.ts          # Statistical analysis engine
├── cli/
│   ├── commands/                    # Generation and execution commands  
│   └── interactive/                 # Conversational parameter refinement
└── examples/
    └── strategic-simulations/       # Agent-generated examples
```

## ⚙️ YAML Configuration Specification

### Basic Simulation Structure
```yaml
name: "Your Simulation Name"
category: "Technology Investment"  # Optional categorization
description: "Brief description of what this analyzes"
tags: ["tag1", "tag2"]  # Optional tags for organization

parameters:
  - key: parameterName
    label: "Human-readable parameter name"
    type: number  # number, boolean, string
    default: 100
    min: 1        # Optional bounds
    max: 1000
    description: "What this parameter represents"

outputs:
  - key: outputKey
    label: "Output Label"
    description: "What this output means"

simulation:
  logic: |
    // JavaScript simulation logic
    const result = parameterName * 2
    return {
      outputKey: result
    }
```

### Business Context Integration
```yaml
name: "Strategic Analysis with Business Context"
businessContext: true  # Enables ARR injection

parameters:
  - key: investment
    label: "Initial Investment ($)"
    type: number
    default: 50000

simulation:
  logic: |
    // Business functions automatically available:
    const roi = calculateROI(investment, annualBenefit)
    const payback = calculatePaybackPeriod(investment, monthlyBenefit)
    const runway = calculateRunway(currentCash, monthlyBurn)
    const npv = calculateNPV(cashFlows, discountRate)
    
    return {
      roi: roi,
      paybackMonths: payback
    }
```

### Advanced Features
```yaml
name: "Advanced Simulation"
parameters:
  - key: complexParam
    type: number
    default: 10
    validation: |
      // Custom validation logic
      return value > 0 && value < 1000

simulation:
  setup: |
    // One-time setup code
    const constants = { TAX_RATE: 0.25 }
  
  logic: |
    // Main simulation logic
    const grossProfit = revenue - costs
    const netProfit = grossProfit * (1 - constants.TAX_RATE)
    return { netProfit }
  
  iterations: 10000  # Override default iteration count
```

## 📊 Scenario System

### **Scenario Types**
- **Conservative**: Risk-averse parameters with proven benchmarks
- **Neutral**: Balanced approach with industry-standard metrics  
- **Aggressive**: Growth-focused parameters with higher risk/reward

### **Scenario Directory Structure**
```
examples/simulations/
└── your-simulation/
    ├── your-simulation.yaml      # Base simulation
    ├── conservative.yaml         # Risk-averse parameters
    ├── neutral.yaml             # Balanced parameters  
    └── aggressive.yaml          # Growth-focused parameters
```

### **Creating Scenarios**
```yaml
# Base: technology-investment.yaml
name: "Technology Investment Analysis"
parameters:
  - key: adoptionRate
    default: 70  # Neutral baseline

# Scenario: technology-investment/conservative.yaml  
name: "Technology Investment Analysis (Conservative)"
parameters:
  - key: adoptionRate
    default: 50    # Lower adoption assumption
  - key: productivityGain
    default: 10    # Conservative productivity gain
  - key: implementationTime
    default: 12    # Longer implementation time
```

### **Agent Scenario Generation Guidelines**
1. **Identify Risk Variables**: Which parameters have the highest uncertainty?
2. **Define Conservative Bounds**: What are realistic worst-case assumptions?
3. **Define Aggressive Bounds**: What are optimistic best-case scenarios?
4. **Maintain Business Logic**: Keep relationships between parameters realistic
5. **Document Assumptions**: Explain the reasoning behind scenario parameters

## 📈 Business Intelligence Functions

### Available Functions (when `businessContext: true`)

```typescript
// ROI Calculation
calculateROI(investment: number, annualBenefit: number): number
// Returns ROI as percentage

// Payback Period  
calculatePaybackPeriod(investment: number, monthlyBenefit: number): number
// Returns months to recover investment

// Runway Calculation
calculateRunway(currentCash: number, monthlyBurn: number): number
// Returns months of runway remaining

// Net Present Value
calculateNPV(cashFlows: number[], discountRate: number): number
// Returns NPV of cash flow series

// Team Scaling with Coordination Overhead
calculateTeamScaling(currentTeam: number, newHires: number): object
// Returns adjusted productivity accounting for coordination costs
```

### ARR Context Variables (automatically injected)
- `arrBudget`: Annual recurring revenue for budget calculations
- `teamSize`: Current team size for scaling calculations
- `monthlyBurn`: Current monthly burn rate
- `currentCash`: Available cash reserves

## 🔧 Custom TypeScript Extensions

For complex simulations that exceed YAML capabilities:

```typescript
import { ConfigurableSimulation } from '../framework/ConfigurableSimulation'
import { BusinessSimulation } from '../framework/base/BusinessSimulation'

export class CustomStrategicSimulation extends BusinessSimulation {
  constructor(config: SimulationConfig) {
    super(config)
  }

  protected runIteration(params: Record<string, any>): Record<string, number> {
    // Custom business logic here
    const complexCalculation = this.performComplexAnalysis(params)
    
    return {
      result: complexCalculation,
      confidence: this.calculateConfidence(complexCalculation)
    }
  }
  
  private performComplexAnalysis(params: Record<string, any>): number {
    // Your complex business logic
    return params.investment * this.calculateROI(params.investment, params.benefit)
  }
}
```

## 🎯 Agent Success Criteria

**Agent Optimization Targets:**
- **<5 minutes**: AI agent generates working simulation from strategic question
- **90% config-driven**: Simulations created through YAML without custom code  
- **Strategic relevance**: Results influence real CTO-level decisions
- **Business accuracy**: Industry-standard KPIs and realistic parameters

## 📊 Output Format Specification

### Standard Output Format
```typescript
interface SimulationResult {
  parameters: Record<string, any>     // Input parameters used
  outputs: Record<string, number>     // Simulation results
  statistics: {
    mean: Record<string, number>      // Mean values
    percentiles: {
      p10: Record<string, number>     // 10th percentile
      p50: Record<string, number>     // Median
      p90: Record<string, number>     // 90th percentile
    }
    confidence: Record<string, number> // Confidence intervals
  }
  metadata: {
    iterations: number                // Number of iterations run
    executionTime: number            // Runtime in milliseconds
    scenario?: string                // Scenario name if applicable
  }
}
```

### Scenario Comparison Output
```typescript
interface ScenarioComparison {
  scenarios: string[]                 // List of scenarios compared
  results: Record<string, SimulationResult> // Results by scenario
  comparison: {
    riskAdjustedReturns: Record<string, number>
    probabilityOfSuccess: Record<string, number>
    recommendedScenario: string
    confidenceLevel: number
  }
}
```

## 🚀 Extension Points

### Custom Business Functions
```typescript
// Add to ARRBusinessContext.ts
export function calculateCustomMetric(
  param1: number, 
  param2: number
): number {
  // Your custom business calculation
  return param1 * param2 * industryBenchmark
}
```

### Custom Validation
```yaml
parameters:
  - key: customParam
    validation: |
      // Custom validation in YAML
      if (value < 0) return "Value must be positive"
      if (value > industryMax) return "Value exceeds industry maximum"
      return true
```

### Output Formatters
```typescript
// Custom result formatting for specific domains
export function formatTechnologyInvestmentResults(
  results: SimulationResult
): string {
  // Domain-specific formatting
  return `ROI: ${results.outputs.roi}%, Payback: ${results.outputs.paybackMonths} months`
}
```

---

*This technical documentation supports the agent-friendly Monte Carlo simulation framework for strategic business analysis.*