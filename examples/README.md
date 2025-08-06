# Working Simulation Examples

These are **tested, working examples** that demonstrate the Monte Carlo simulation framework patterns.

## Available Examples

### 1. [Simple ROI Analysis](simulations/simple-roi-analysis.yaml)
**Basic pattern for agents to learn from**
- Simple investment vs benefit calculation
- Boolean parameters and risk factors
- Basic Monte Carlo uncertainty modeling
- **Use case**: Quick ROI assessments

```bash
npm run cli run examples/simulations/simple-roi-analysis.yaml
```

### 2. [Technology Investment Decision](simulations/technology-investment.yaml) 
**Intermediate complexity for real business decisions**
- Multiple interdependent parameters
- Realistic business calculations (team productivity, adoption rates)
- Variance modeling with random factors
- **Use case**: Technology adoption decisions

```bash
npm run cli run examples/simulations/technology-investment.yaml
```

### 3. [Team Scaling Decision Analysis](simulations/team-scaling-decision.yaml)
**Advanced pattern with business context integration**
- Automatic business intelligence function injection (`calculateROI`, `calculatePaybackPeriod`)
- Complex interdependencies (coordination overhead, ramp-up time)
- Strategic business analysis patterns
- **Use case**: Hiring and scaling decisions

```bash
npm run cli run examples/simulations/team-scaling-decision.yaml
```

### 4. [AI Tool Adoption Scenarios](simulations/ai-tool-adoption/)
**Scenario-based risk analysis pattern**
- Base simulation with neutral assumptions
- Conservative scenario with pessimistic parameters
- Aggressive scenario with optimistic parameters
- **Use case**: Comparing risk scenarios for strategic decisions

```bash
# Compare different risk scenarios
npm run cli run examples/simulations/ai-tool-adoption/ai-tool-adoption.yaml
npm run cli run examples/simulations/ai-tool-adoption/conservative.yaml  
npm run cli run examples/simulations/ai-tool-adoption/aggressive.yaml
```

**Scenario Results Comparison:**
- Conservative: ROI 570% ± 151% (lower risk, lower reward)
- Aggressive: ROI 11,782% ± 1,761% (higher risk, higher reward)

## Key Patterns for Agents

### YAML Structure
```yaml
name: "Human-readable simulation name"
category: "Business|Technology|Finance"
description: "10-500 character description"
version: "1.0.0"
tags: [relevant, keywords]

# Optional: Enable business intelligence functions
businessContext: true

parameters:
  - key: parameterName
    label: "Human Label"
    type: number|boolean|string|select
    default: value
    min: minimum     # For numbers
    max: maximum     # For numbers
    description: "What this parameter controls"

outputs:
  - key: outputName
    label: "Human Label" 
    description: "What this output represents"

simulation:
  logic: |
    // JavaScript code with Monte Carlo uncertainty
    const calculation = parameter * random()
    return { outputName: calculation }
```

### Business Context Integration
When `businessContext: true`, these functions are automatically available:
- `calculateROI(investment, returns, timeframe)`
- `calculatePaybackPeriod(investment, monthlyReturns)`
- `calculateRunway(currentCash, monthlyBurnRate)`
- `calculateNPV(cashFlows, discountRate)`
- `arrBudget`, `monthlyBudget`, `quarterlyBudget` variables

### Monte Carlo Patterns
- Use `random()` for uncertainty (returns 0-1)
- Add variance: `baseValue * (0.8 + random() * 0.4)` (±20% variance)
- Model adoption rates: `adoptionRate * (0.7 + random() * 0.6)` (70-130% of expected)
- Calculate confidence intervals through repeated random sampling

### Scenario Pattern
Create risk scenarios by varying key parameters while keeping the same simulation logic:

```
simulations/
└── your-analysis/
    ├── your-analysis.yaml      # Base simulation (neutral)
    ├── conservative.yaml       # Pessimistic parameters
    └── aggressive.yaml         # Optimistic parameters
```

**Scenario Guidelines:**
- **Conservative**: Higher costs, lower benefits, slower adoption, more uncertainty
- **Aggressive**: Lower costs, higher benefits, faster adoption, less uncertainty
- **Keep same logic**: Only change parameter defaults and variance modeling
- **Document assumptions**: Explain why parameters differ between scenarios

### Validation Requirements
- Description: 10-500 characters
- Version: Format `x.y.z`
- Tags: At least 1 tag
- Parameters: At least 1 parameter
- Logic: At least 10 characters
- All required fields must be present

These examples provide proven patterns for agents to create strategic business simulations with risk scenario analysis.