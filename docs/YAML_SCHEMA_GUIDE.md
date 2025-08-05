# Monte Carlo Simulation YAML Schema Guide

This guide provides comprehensive documentation for the YAML configuration schema used in the Monte Carlo Simulation Framework. It's designed to enable AI tools like Claude Code to create new simulation configurations through interactive prompting.

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Root Configuration](#root-configuration)
3. [Parameters](#parameters)
4. [Parameter Groups](#parameter-groups)
5. [Outputs](#outputs)
6. [Simulation Logic](#simulation-logic)
7. [Validation Rules](#validation-rules)
8. [Examples](#examples)
9. [AI Prompting Guidelines](#ai-prompting-guidelines)

## Schema Overview

The YAML schema defines a complete Monte Carlo simulation configuration that can be executed at runtime without writing TypeScript code. Each configuration file represents a self-contained simulation with parameters, outputs, and JavaScript logic.

**File Extension**: `.yaml` or `.yml`
**Validation**: JSON Schema with AJV
**Runtime**: ConfigurableSimulation class

## Root Configuration

```yaml
name: string          # Required: Human-readable simulation name
category: string      # Required: Classification category
description: string   # Required: Detailed description of what the simulation models
version: string       # Required: Semantic version (e.g., "1.0.0")
tags: string[]        # Optional: Array of descriptive tags
parameters: []        # Required: Array of input parameters
groups: []           # Optional: Parameter grouping for UI organization
outputs: []          # Required: Array of output metrics
simulation:          # Required: Simulation logic configuration
  logic: string      # Required: JavaScript code as multiline string
```

### Root Field Details

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `name` | string | ✅ | Display name for the simulation | Min length: 1, Used for ID generation |
| `category` | string | ✅ | Business category | Common: Finance, Business, Healthcare, Technology |
| `description` | string | ✅ | What the simulation models | Min length: 1, Should explain business context |
| `version` | string | ✅ | Semantic version | Format: "X.Y.Z" |
| `tags` | string[] | ❌ | Searchable keywords | Each tag min length: 1 |

## Parameters

Parameters define the inputs that users can adjust when running the simulation. Each parameter becomes a variable available in the simulation logic.

```yaml
parameters:
  - key: string           # Required: Variable name (must be valid JS identifier)
    label: string         # Required: Human-readable display name
    type: enum            # Required: number | boolean | string | select
    default: any          # Required: Default value matching the type
    description: string   # Optional: Help text for users
    
    # Number-specific fields
    min: number          # Optional: Minimum allowed value
    max: number          # Optional: Maximum allowed value  
    step: number         # Optional: Increment/decrement step size
    
    # Select-specific fields
    options: string[]    # Required for select type: Available choices
```

### Parameter Types

#### Number Parameters
```yaml
- key: initialInvestment
  label: Initial Investment
  type: number
  default: 100000
  min: 1000
  max: 10000000
  step: 1000
  description: Starting capital amount in dollars
```

#### Boolean Parameters
```yaml
- key: includeTaxes
  label: Include Tax Calculations
  type: boolean
  default: true
  description: Whether to factor in tax implications
```

#### String Parameters
```yaml
- key: companyName
  label: Company Name
  type: string
  default: "ACME Corp"
  description: Name of the company being analyzed
```

#### Select Parameters
```yaml
- key: riskProfile
  label: Risk Profile
  type: select
  default: "moderate"
  options: ["conservative", "moderate", "aggressive"]
  description: Investment risk tolerance level
```

### Parameter Validation Rules

- `key`: Must be valid JavaScript identifier (`/^[a-zA-Z_][a-zA-Z0-9_]*$/`)
- `label`: Must be non-empty string
- `type`: Must be one of: `number`, `boolean`, `string`, `select`
- `default`: Must match the specified type
- `min`/`max`: Only valid for `number` type
- `options`: Required for `select` type, must have at least one option
- `description`: Optional but recommended for user guidance

## Parameter Groups

Groups organize related parameters together in the UI for better user experience. Recommended for simulations with 4+ parameters.

```yaml
groups:
  - name: string         # Required: Group display name
    description: string  # Optional: Group description
    parameters: string[] # Required: Array of parameter keys
```

### Parameter Group Example
```yaml
groups:
  - name: Financial Settings
    description: Core financial parameters
    parameters: [initialInvestment, interestRate, inflationRate]
    
  - name: Risk Factors
    description: Risk and uncertainty parameters
    parameters: [volatility, riskProfile, marketRisk]
```

### Parameter Group Rules

- All `parameters` must reference existing parameter `key` values
- Each parameter can only belong to one group
- Ungrouped parameters are automatically placed in a default group
- Groups with only one parameter are discouraged

## Outputs

Outputs define the metrics that the simulation calculates and tracks. Each output becomes a required return value from the simulation logic.

```yaml
outputs:
  - key: string        # Required: Variable name (must be valid JS identifier)
    label: string      # Required: Human-readable display name
    description: string # Required: What this output represents
```

### Output Example
```yaml
outputs:
  - key: netPresentValue
    label: Net Present Value
    description: Discounted value of future cash flows minus initial investment
    
  - key: roi
    label: Return on Investment
    description: Percentage return calculated as (gain - cost) / cost * 100
    
  - key: breakEvenPoint
    label: Break-even Point
    description: Number of months until investment breaks even
```

### Output Validation Rules

- `key`: Must be valid JavaScript identifier
- `label`: Must be non-empty string
- `description`: Must be non-empty string explaining the business meaning
- All output keys must be returned by the simulation logic
- Output values must be numeric (converted automatically if needed)

## Simulation Logic

The simulation logic is JavaScript code that uses the input parameters to calculate the output values. It runs in a sandboxed environment with mathematical utilities available.

```yaml
simulation:
  logic: |
    // Available: all parameter variables
    // Available: random(), sqrt(), pow(), log(), exp(), abs(), min(), max(), floor(), ceil(), round()
    
    // Your calculation logic here
    const calculatedValue = initialInvestment * (1 + interestRate)
    
    // Must return an object with all output keys
    return {
      netPresentValue: calculatedValue,
      roi: (calculatedValue - initialInvestment) / initialInvestment * 100
    }
```

### Simulation Logic Rules

1. **Must return an object** containing all output keys
2. **All parameters are available** as variables in the scope
3. **Mathematical functions available**: `random()`, `sqrt()`, `pow()`, `log()`, `exp()`, `abs()`, `min()`, `max()`, `floor()`, `ceil()`, `round()`
4. **Return values must be numeric** (or convertible to numbers)
5. **Code is sandboxed** - no access to external modules or filesystem
6. **Errors are caught and reported** with helpful context

### Simulation Logic Best Practices

- **Use comments** to explain complex calculations
- **Include randomness** for Monte Carlo variation: `random()` returns 0-1
- **Handle edge cases** like division by zero
- **Use meaningful variable names** for intermediate calculations
- **Test with default parameters** before deployment

## Validation Rules

The complete validation includes both schema validation and business logic validation:

### Schema Validation
- JSON Schema validation using AJV
- Type checking for all fields
- Required field validation
- Enum value validation

### Business Logic Validation
- No duplicate parameter keys
- No duplicate output keys
- Parameter groups reference valid parameters
- Simulation logic syntax validation
- Return value validation

### Runtime Validation
- Simulation logic execution test
- Output completeness check
- Numeric conversion validation
- Error handling verification

## Examples

### Complete Example: Product Launch ROI

```yaml
name: Product Launch ROI Analysis
category: Business
description: Analyzes return on investment for new product launches considering market uncertainty and competition
version: 1.0.0
tags: [business, roi, product-launch, marketing]

parameters:
  - key: developmentCost
    label: Development Cost
    type: number
    default: 500000
    min: 50000
    max: 5000000
    step: 10000
    description: Total cost to develop the product

  - key: marketingBudget
    label: Marketing Budget
    type: number
    default: 200000
    min: 10000
    max: 2000000
    step: 5000
    description: Budget allocated for marketing and promotion

  - key: unitPrice
    label: Unit Price
    type: number
    default: 99.99
    min: 1
    max: 10000
    step: 0.01
    description: Selling price per unit

  - key: marketSize
    label: Target Market Size
    type: number
    default: 1000000
    min: 1000
    max: 100000000
    step: 1000
    description: Number of potential customers

  - key: competitionLevel
    label: Competition Level
    type: select
    default: moderate
    options: [low, moderate, high, intense]
    description: Level of market competition

  - key: includeSeasonality
    label: Include Seasonal Effects
    type: boolean
    default: true
    description: Whether to model seasonal demand variations

groups:
  - name: Investment Parameters
    description: Initial costs and investments
    parameters: [developmentCost, marketingBudget]
    
  - name: Market Parameters
    description: Market size and pricing
    parameters: [unitPrice, marketSize, competitionLevel]
    
  - name: Model Options
    description: Simulation configuration options
    parameters: [includeSeasonality]

outputs:
  - key: totalRevenue
    label: Total Revenue
    description: Gross revenue over the analysis period
    
  - key: netProfit
    label: Net Profit
    description: Total profit after all costs
    
  - key: roi
    label: Return on Investment
    description: ROI percentage calculated as (profit / investment) * 100
    
  - key: paybackPeriod
    label: Payback Period
    description: Number of months to recover initial investment

simulation:
  logic: |
    // Competition impact factors
    const competitionFactors = {
      low: 1.2,
      moderate: 1.0,
      high: 0.8,
      intense: 0.6
    }
    
    // Base market penetration (randomized)
    const basePenetration = 0.02 + random() * 0.08  // 2-10%
    const competitionFactor = competitionFactors[competitionLevel]
    const adjustedPenetration = basePenetration * competitionFactor
    
    // Seasonal adjustment
    let seasonalMultiplier = 1.0
    if (includeSeasonality) {
      // Simulate seasonal variation
      seasonalMultiplier = 0.7 + random() * 0.6  // 70% to 130%
    }
    
    // Calculate units sold
    const unitsSold = marketSize * adjustedPenetration * seasonalMultiplier
    
    // Calculate financial metrics
    const totalRevenue = unitsSold * unitPrice
    const totalInvestment = developmentCost + marketingBudget
    const netProfit = totalRevenue - totalInvestment
    const roi = (netProfit / totalInvestment) * 100
    
    // Calculate payback period (months)
    const monthlyProfit = netProfit / 12
    const paybackPeriod = monthlyProfit > 0 ? totalInvestment / monthlyProfit : 999
    
    return {
      totalRevenue: totalRevenue,
      netProfit: netProfit,
      roi: roi,
      paybackPeriod: min(paybackPeriod, 999)  // Cap at 999 months
    }
```

### Simple Example: Investment Growth

```yaml
name: Simple Investment Growth
category: Finance
description: Models compound growth of an investment over time
version: 1.0.0
tags: [finance, investment, compound-growth]

parameters:
  - key: principal
    label: Initial Investment
    type: number
    default: 10000
    min: 100
    max: 1000000
    description: Starting investment amount

  - key: rate
    label: Annual Interest Rate
    type: number
    default: 0.07
    min: 0.01
    max: 0.5
    step: 0.001
    description: Expected annual return rate (as decimal)

  - key: years
    label: Investment Period
    type: number
    default: 10
    min: 1
    max: 50
    description: Number of years to invest

outputs:
  - key: finalValue
    label: Final Value
    description: Investment value after the specified period

simulation:
  logic: |
    // Add some randomness to the annual return
    const actualRate = rate * (0.8 + random() * 0.4)  // ±20% variation
    
    // Compound growth calculation
    const finalValue = principal * pow(1 + actualRate, years)
    
    return {
      finalValue: finalValue
    }
```

## AI Prompting Guidelines

When using AI tools like Claude Code to create YAML configurations, follow these guidelines:

### Step 1: Business Understanding
```
Prompt: "I want to create a Monte Carlo simulation for [BUSINESS SCENARIO]. 
Help me understand what parameters and outputs would be most relevant."

Example: "I want to create a Monte Carlo simulation for evaluating 
the profitability of opening a new restaurant location."
```

### Step 2: Parameter Definition  
```
Prompt: "Based on [BUSINESS SCENARIO], help me define the input parameters. 
For each parameter, suggest:
- Appropriate parameter type (number/boolean/string/select)
- Realistic default values and ranges
- Clear descriptions for business users"
```

### Step 3: Output Metrics
```
Prompt: "What are the key business metrics I should track as outputs 
for [BUSINESS SCENARIO]? Each output should be:
- Quantifiable and numeric
- Relevant to business decision-making
- Calculable from the input parameters"
```

### Step 4: Simulation Logic
```
Prompt: "Help me write the JavaScript simulation logic that:
- Uses Monte Carlo methods (includes randomness)
- Calculates realistic business scenarios
- Handles edge cases appropriately
- Returns all required outputs
- Uses the available math functions effectively"
```

### Step 5: Validation and Testing
```
Prompt: "Review this YAML configuration for:
- Schema compliance
- Business logic accuracy
- Parameter relationships
- Realistic default values
- Complete output coverage"
```

### Interactive Creation Template

```
AI: I'll help you create a Monte Carlo simulation configuration. Let's start with some questions:

1. What business scenario are you modeling?
2. What decision are you trying to support?
3. What are the key uncertain factors?
4. What outcomes do you want to measure?
5. Who will be using this simulation?

Based on your answers, I'll generate a complete YAML configuration that follows the schema and includes:
✅ Appropriate parameters with realistic defaults
✅ Relevant business outputs
✅ Monte Carlo simulation logic with proper randomization
✅ Validation and error handling
✅ Clear documentation and descriptions
```

### Common Patterns

#### Financial Simulations
- Parameters: amounts, rates, time periods, risk factors
- Outputs: NPV, ROI, payback period, risk metrics
- Logic: compound growth, cash flow analysis, risk adjustments

#### Business Operations
- Parameters: capacity, demand, costs, efficiency factors
- Outputs: revenue, profit, utilization, break-even points
- Logic: operational modeling, resource constraints, market dynamics

#### Project Management
- Parameters: duration estimates, resource costs, risk factors
- Outputs: total duration, cost, success probability
- Logic: critical path analysis, resource allocation, risk modeling

#### Market Analysis
- Parameters: market size, penetration rates, pricing, competition
- Outputs: market share, revenue potential, competitive position
- Logic: market dynamics, competitive responses, adoption curves

### Validation Checklist

Before finalizing a YAML configuration, verify:

- [ ] All required fields are present
- [ ] Parameter keys are valid JavaScript identifiers
- [ ] Default values match parameter types
- [ ] Number parameters have realistic min/max ranges
- [ ] Select parameters have meaningful options
- [ ] Output descriptions explain business value
- [ ] Simulation logic uses appropriate randomization
- [ ] All outputs are calculated and returned
- [ ] Business logic is realistic and defensible
- [ ] Edge cases are handled appropriately

This guide enables AI tools to create sophisticated, business-relevant Monte Carlo simulations through structured prompting and validation.