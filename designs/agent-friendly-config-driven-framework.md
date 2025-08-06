# Agent-Friendly Config-Driven Simulation Framework

## Executive Summary

Design a Monte Carlo simulation framework optimized for AI agents (like Claude Code) to rapidly create strategic business simulations through **config-first, code-optional** approach. Agents generate YAML configurations for 90% of simulations, with simple TypeScript hooks for complex business logic when needed.

## Design Philosophy

### **Config-First Principle**
- **Default approach**: Agents generate declarative YAML configurations
- **Rich expression**: YAML can handle most business logic through formulas and relationships
- **Simple patterns**: Consistent structure agents can learn and replicate

### **Code-Optional Escape Hatches**
- **When needed**: Complex algorithms, advanced mathematics, external API calls
- **Minimal friction**: Drop into TypeScript for specific calculations
- **Seamless integration**: Custom code works alongside config-driven logic

### **Agent-Optimized**
- **Predictable patterns**: Agents learn framework structure once, apply everywhere
- **Rich documentation**: Clear examples and patterns for agents to follow
- **Immediate execution**: Generate → Run → Results workflow

## Core Architecture

### 1. Enhanced YAML Configuration Schema

**Rich parameter definitions with business context:**
```yaml
name: "Generative AI Cost-Benefit Analysis"
category: "Technology Investment"
description: "Monte Carlo analysis of when AI tool costs exceed productivity benefits"

parameters:
  # Simple parameter definition
  - key: teamSize
    label: "Development Team Size"
    type: number
    default: 25
    min: 5
    max: 200
    description: "Number of developers who would use AI tools"
    
  # Parameter with business context
  - key: aiToolCostPerDev
    label: "AI Tool Cost per Developer ($/month)"
    type: number
    default: 20
    min: 10
    max: 100
    industryBenchmark: "GitHub Copilot: $20/month, Cursor: $20/month"
    description: "Monthly cost per developer for AI coding tools"
    
  # Parameter with growth modeling
  - key: costGrowthRate
    label: "Annual Cost Growth Rate (%)"
    type: number
    default: 15
    min: 0
    max: 50
    growthPattern: "compound"
    description: "Expected annual increase in AI tool pricing"

# Relationships between parameters
relationships:
  - type: "dependent"
    parameters: ["teamSize", "totalMonthlyCost"]
    formula: "teamSize * aiToolCostPerDev"
    description: "Total cost scales with team size"
    
  - type: "time-dependent"
    parameters: ["aiToolCostPerDev", "month"]
    formula: "aiToolCostPerDev * (1 + costGrowthRate/100)^(month/12)"
    description: "Tool costs compound annually"

# Business calculations in declarative format
calculations:
  monthlyAICost:
    formula: "teamSize * aiToolCostPerDev * (1 + costGrowthRate/100)^(month/12)"
    uncertainty: "normal(1.0, 0.1)"  # ±10% execution variance
    
  productivityBenefit:
    formula: "teamSize * avgDeveloperSalary * (productivityGainPercent/100)"
    uncertainty: "triangular(0.8, 1.0, 1.3)"  # Triangular distribution
    decayFunction: "exp(-month * 0.02)"  # 2% monthly decay
    
  netBenefit:
    formula: "productivityBenefit - monthlyAICost"
    
  breakEvenMonth:
    formula: "findRoot(netBenefit, 0, 60)"  # Find when net benefit = 0

outputs:
  - key: breakEvenMonth
    label: "Break-even Timeline (months)"
    description: "When AI costs start exceeding productivity benefits"
    
  - key: twelveMonthROI
    label: "12-Month ROI (%)"
    description: "Return on investment over first 12 months"
    formula: "((sum(productivityBenefit, 0, 12) - sum(monthlyAICost, 0, 12)) / sum(monthlyAICost, 0, 12)) * 100"
```

### 2. Rich Formula Expression Language

**Built-in business functions for YAML:**
```yaml
calculations:
  # Time series functions
  cumulativeValue:
    formula: "sum(monthlyValue, 0, currentMonth)"
    
  # Growth functions  
  compoundGrowth:
    formula: "initialValue * (1 + growthRate)^periods"
    
  # Distribution functions
  uncertainValue:
    formula: "baseValue * normal(1.0, 0.2)"  # 20% standard deviation
    
  # Business logic functions
  paybackPeriod:
    formula: "investment / monthlyReturns"
    constraint: "monthlyReturns > 0"
    
  # Conditional logic
  seasonalAdjustment:
    formula: "if(month % 12 in [11, 0, 1], baseValue * 1.3, baseValue)"
    description: "30% boost in Q4/Q1"
```

### 3. Code Escape Hatches

**When YAML isn't sufficient, seamless TypeScript integration:**

```yaml
# Main config remains in YAML
name: "Complex AI Adoption Analysis"
parameters:
  - key: teamComposition
    label: "Team Experience Distribution"
    type: "custom"
    customType: "experienceDistribution"

# Custom code for complex logic
customCode: |
  // Custom parameter processing
  function processTeamComposition(teamComposition) {
    const seniorDevs = teamComposition.senior || 0
    const midDevs = teamComposition.mid || 0  
    const juniorDevs = teamComposition.junior || 0
    
    // Complex adoption curve modeling
    const adoptionRate = calculateAdoptionCurve(seniorDevs, midDevs, juniorDevs)
    const productivityMultiplier = calculateProductivityImpact(teamComposition)
    
    return { adoptionRate, productivityMultiplier }
  }
  
  // Custom business logic that's too complex for YAML
  function calculateDiminishingReturns(baseProductivity, month) {
    const learningPhase = month < 3 ? (month / 3) : 1
    const plateauEffect = month > 6 ? Math.exp(-(month - 6) * 0.05) : 1
    return baseProductivity * learningPhase * plateauEffect
  }

calculations:
  # Use custom code in YAML calculations
  adjustedProductivity:
    formula: "calculateDiminishingReturns(baseProductivity, month)"
    description: "Productivity with learning curve and plateau effects"
```

### 4. Agent-Friendly Configuration Patterns

**Standardized patterns agents can learn:**

```yaml
# Pattern 1: Cost-Benefit Analysis
patternType: "costBenefit"
timeHorizon: 24  # months
costs:
  - name: "toolCosts"
    formula: "teamSize * costPerUser"
    growth: "compound(15)"  # 15% annual growth
benefits:  
  - name: "productivityGains"
    formula: "teamSize * avgSalary * productivityPercent"
    decay: "exponential(0.02)"  # 2% monthly decay

# Pattern 2: Timing Analysis  
patternType: "timing"
question: "When should we adopt?"
trigger:
  condition: "benefits > costs * 1.2"  # 20% safety margin
  description: "Adopt when benefits exceed costs by 20%"

# Pattern 3: Scenario Comparison
patternType: "scenarios"  
scenarios:
  conservative:
    productivityGainPercent: 10
    costGrowthRate: 20
  aggressive:
    productivityGainPercent: 25  
    costGrowthRate: 10
```

### 5. Extensive Business Function Library

**Pre-built functions agents can use:**

```typescript
// Available in both YAML formulas and custom code
class BusinessFunctions {
  // Financial calculations
  static npv(cashFlows: number[], discountRate: number): number
  static irr(cashFlows: number[]): number
  static paybackPeriod(investment: number, monthlyReturns: number): number
  static roi(gains: number, investment: number): number
  
  // Growth modeling  
  static compoundGrowth(initial: number, rate: number, periods: number): number
  static exponentialDecay(initial: number, decayRate: number, time: number): number
  static logisticGrowth(capacity: number, rate: number, time: number): number
  
  // Distribution functions
  static triangular(min: number, mode: number, max: number): number
  static lognormal(mean: number, stddev: number): number
  static beta(alpha: number, beta: number): number
  
  // Business-specific functions
  static customerChurn(baseRate: number, satisfactionScore: number): number
  static seasonalAdjustment(baseValue: number, month: number, pattern: SeasonalPattern): number
  static marketPenetration(totalMarket: number, time: number, saturationRate: number): number
}
```

### 6. Agent Workflow Integration

**Optimized for agent code generation:**

```typescript
// Simple API for agents to use
class AgentSimulationBuilder {
  // Generate from conversation
  static async createFromQuestion(question: string, context: BusinessContext): Promise<SimulationConfig> {
    const suggestedConfig = await this.generateBaseConfig(question, context)
    return suggestedConfig
  }
  
  // Refine through dialog
  static refineConfig(config: SimulationConfig, refinements: ConfigRefinement[]): SimulationConfig {
    return this.applyRefinements(config, refinements)
  }
  
  // Execute and get results
  static async runSimulation(config: SimulationConfig, iterations: number = 10000): Promise<SimulationResults> {
    const simulation = new ConfigDrivenSimulation(config)
    return simulation.run(iterations)
  }
}

// Agent usage example:
const question = "When does generative AI cost outweigh benefits?"
const context = { teamSize: 25, industry: "software", budget: 4500000 }

const config = await AgentSimulationBuilder.createFromQuestion(question, context)
const results = await AgentSimulationBuilder.runSimulation(config)
```

## Implementation Architecture

### 1. Config-Driven Simulation Engine

```typescript
class ConfigDrivenSimulation extends BaseSimulation {
  constructor(private config: EnhancedSimulationConfig) {
    super()
  }
  
  calculateScenario(params: ParameterValues): ScenarioResults {
    // Execute YAML-defined calculations
    const calculationResults = this.executeConfigCalculations(params)
    
    // Execute any custom code
    const customResults = this.executeCustomCode(params, calculationResults)
    
    // Combine and return results
    return { ...calculationResults, ...customResults }
  }
  
  private executeConfigCalculations(params: ParameterValues): Partial<ScenarioResults> {
    const results: Record<string, number> = {}
    
    // Process relationships first
    const enrichedParams = this.processRelationships(params)
    
    // Execute calculations in dependency order
    for (const calc of this.config.calculations) {
      results[calc.name] = this.evaluateFormula(calc.formula, enrichedParams, results)
      
      // Apply uncertainty if specified
      if (calc.uncertainty) {
        results[calc.name] = this.applyUncertainty(results[calc.name], calc.uncertainty)
      }
    }
    
    return results
  }
}
```

### 2. Formula Evaluation Engine

```typescript
class FormulaEvaluator {
  // Evaluate business formulas with built-in functions
  static evaluate(formula: string, variables: Record<string, any>): number {
    const context = {
      ...variables,
      ...BusinessFunctions,  // All business functions available
      random: () => Math.random(),
      // Time-based functions
      sum: (expr: string, start: number, end: number) => this.evaluateSum(expr, start, end, variables),
      findRoot: (expr: string, min: number, max: number) => this.findRoot(expr, min, max, variables)
    }
    
    return this.safeEvaluate(formula, context)
  }
  
  // Safe formula evaluation (no arbitrary code execution)
  private static safeEvaluate(formula: string, context: Record<string, any>): number {
    // Use a safe expression evaluator that only allows mathematical operations
    // and whitelisted functions
    return this.mathEvaluator.evaluate(formula, context)
  }
}
```

### 3. Agent Helper Documentation

**Generate comprehensive examples for agents:**

```markdown
# Agent Quick Start Guide

## Common Patterns

### 1. Cost-Benefit Analysis
```yaml
name: "AI Tool ROI Analysis"
patternType: "costBenefit"
costs:
  monthlyToolCost: "teamSize * costPerDev * (1 + growthRate)^(month/12)"
benefits:
  productivityGain: "teamSize * avgSalary * (gainPercent/100) * exp(-month * decayRate)"
question: "breakEvenMonth"
```

### 2. Technology Adoption Timing
```yaml
name: "When to Adopt New Technology"
trigger:
  condition: "benefits > costs * safetyMargin"
  optimize: "minimize(month)"
scenarios: ["conservative", "aggressive"]
```

### 3. Resource Planning
```yaml
name: "Team Scaling Analysis"  
resources:
  developers: "initialTeam + growthRate * month"
  costs: "developers * avgSalary + infrastructure + tools"
optimization:
  objective: "maximize(deliveredFeatures - costs)"
  constraints: ["budget < maxBudget", "quality > minQuality"]
```

## Available Functions
- Financial: `npv()`, `irr()`, `paybackPeriod()`, `roi()`
- Growth: `compound()`, `exponential()`, `logistic()`  
- Distributions: `normal()`, `triangular()`, `lognormal()`
- Business: `seasonalAdjust()`, `marketPenetration()`, `churnRate()`
```

## Benefits for Agents

### **Rapid Simulation Creation**
- **5 minutes**: Agent generates YAML config for most business questions
- **Immediate execution**: Config → Results with no compilation step
- **Rich expression**: Complex business logic in declarative format

### **Predictable Patterns**
- **Learn once, apply everywhere**: Consistent configuration structure
- **Rich examples**: Comprehensive pattern library for agents to reference
- **Clear documentation**: Function reference and usage patterns

### **Seamless Complexity Handling**
- **Start simple**: YAML for straightforward business logic
- **Add complexity**: Custom code only when needed
- **No rewrites**: Extend YAML configs with code incrementally

## Success Metrics

### **Agent Productivity**
- **<5 minutes**: Time to generate working simulation from business question
- **90% config-driven**: Percentage of simulations requiring no custom code
- **<10 iterations**: Conversation rounds to refine simulation parameters

### **Simulation Quality**
- **Industry accuracy**: Results align with business benchmarks
- **Statistical rigor**: Proper Monte Carlo methodology and distributions
- **Business relevance**: Insights actionable for strategic decisions

## Conclusion

This config-driven framework with code escape hatches provides the perfect balance for agent-generated simulations. Agents can rapidly create sophisticated Monte Carlo analyses through declarative YAML, while having the flexibility to add custom logic when business requirements demand it.

The framework optimizes for the agent workflow: **Question → Config → Results → Refinement**, enabling strategic decision support through conversational simulation generation.