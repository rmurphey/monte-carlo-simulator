# Agent Guide - Monte Carlo Business Simulation Framework

## 🎯 Interactive Studio (Planned)

### Interactive Simulation Creation
```bash
# Coming: Interactive definition studio
npm run cli studio define

# Coming: Real-time parameter control
npm run cli studio run simulation.yaml
```

**Agent Integration**: Full programmatic API for controlling interactive sessions, real-time parameter updates, and streaming results. See [docs/INTERACTIVE_STUDIO.md](docs/INTERACTIVE_STUDIO.md) for complete specifications.

## ✅ Working Commands (Tested)

```bash
# These commands are verified working:
npm run cli run examples/simulations/simple-roi-analysis.yaml
npm run cli run examples/simulations/technology-investment.yaml
npm run cli run examples/simulations/team-scaling-decision.yaml
npm run cli run examples/simulations/ai-tool-adoption/ai-tool-adoption.yaml
npm run cli run examples/simulations/ai-tool-adoption/conservative.yaml
npm run cli run examples/simulations/ai-tool-adoption/aggressive.yaml

# CLI commands:
npm run cli --help
npm run cli list
npm run cli validate <file.yaml>
npm test  # 58 tests pass
```

## 📋 YAML Schema Requirements

### Required Fields
```yaml
name: string        # 1-100 characters
category: string    # min 1 character
description: string # 10-500 characters
version: string     # format "x.y.z" (e.g., "1.0.0")
tags: array        # min 1 item, max 10 items
parameters: array  # min 1 item, max 20 items
simulation:
  logic: string    # min 10 characters
```

### Optional Fields
```yaml
businessContext: boolean    # enables business intelligence functions
outputs: array             # min 1 item, max 10 items (nullable)
groups: array              # parameter grouping (nullable)
```

## 🔧 Parameter Schema

```yaml
parameters:
  - key: string           # required, unique identifier
    label: string         # required, human-readable name
    type: "number|boolean|string|select"  # required
    default: value        # required, matches type
    min: number          # optional, for numbers only
    max: number          # optional, for numbers only  
    step: number         # optional, for numbers only
    options: array       # required for type "select"
    description: string  # optional
```

### Parameter Type Examples
```yaml
# Number parameter
- key: investment
  type: number
  default: 50000
  min: 1000
  max: 1000000
  step: 1000

# Boolean parameter  
- key: riskEnabled
  type: boolean
  default: true

# Select parameter
- key: scenario
  type: select
  default: neutral
  options: [conservative, neutral, aggressive]
```

## 🎯 Simulation Logic Patterns

### Basic Structure
```javascript
// Available functions:
// random() - returns 0-1
// Math.round(), Math.max(), Math.min()

// Pattern: Calculate with uncertainty
const baseValue = parameter * (0.8 + random() * 0.4)  // ±20% variance
const result = Math.round(baseValue * 100) / 100      // round to 2 decimals

// Must return object matching outputs keys
return { 
  outputKey: result 
}
```

### Business Context Integration
```yaml
# Enable business intelligence functions:
businessContext: true
```

```javascript
// When businessContext: true, these functions are available:
calculateROI(investment, annualReturns)
calculatePaybackPeriod(investment, monthlyReturns)  
calculateRunway(currentCash, monthlyBurnRate)
calculateNPV(cashFlowArray, discountRate)

// Variables available:
arrBudget         # Annual recurring revenue budget
monthlyBudget     # arrBudget / 12
quarterlyBudget   # arrBudget / 4
```

## 📊 Proven Simulation Patterns

### 1. Simple ROI Calculation
```yaml
name: "ROI Analysis"
category: "Finance" 
description: "Basic ROI calculation with uncertainty modeling"
version: "1.0.0"
tags: [finance, roi]

parameters:
  - key: investment
    label: "Investment ($)"
    type: number
    default: 50000
  - key: monthlyBenefit
    label: "Monthly Benefit ($)" 
    type: number
    default: 5000

outputs:
  - key: roi
    label: "ROI Percentage"

simulation:
  logic: |
    const annualBenefit = monthlyBenefit * 12 * (0.8 + random() * 0.4)
    const roi = ((annualBenefit - investment) / investment) * 100
    return { roi: Math.round(roi * 10) / 10 }
```

### 2. Team Productivity Analysis
```yaml
name: "Team Productivity Investment"
category: "Technology"
description: "Productivity investment with adoption and coordination factors"
version: "1.0.0"
tags: [team, productivity, technology]

parameters:
  - key: teamSize
    type: number
    default: 20
  - key: toolCost
    type: number
    default: 25000
  - key: productivityGain
    type: number
    default: 15

simulation:
  logic: |
    const adoptionRate = 0.75 * (0.8 + random() * 0.4)
    const effectiveGain = (productivityGain / 100) * adoptionRate
    const avgSalary = 120000
    const annualSavings = teamSize * avgSalary * effectiveGain
    const roi = ((annualSavings - toolCost) / toolCost) * 100
    return { roi: Math.round(roi * 10) / 10 }
```

### 3. Business Intelligence Pattern
```yaml
businessContext: true  # Enables business functions

simulation:
  logic: |
    // Business functions automatically available
    const roi = calculateROI(investment, annualBenefit)
    const payback = calculatePaybackPeriod(investment, monthlyBenefit)
    
    return { 
      roi: Math.round(roi * 10) / 10,
      paybackMonths: Math.round(payback * 10) / 10
    }
```

## 🎭 Scenario Patterns

### Directory Structure
```
simulations/
└── analysis-name/
    ├── analysis-name.yaml    # Base (neutral)
    ├── conservative.yaml     # Pessimistic  
    └── aggressive.yaml       # Optimistic
```

### Scenario Parameter Variations
```yaml
# Conservative scenario - higher costs, lower benefits
- key: toolCost
  default: 40000    # Higher cost
- key: productivityGain  
  default: 8        # Lower gain
- key: adoptionRate
  default: 55       # Slower adoption

# Aggressive scenario - lower costs, higher benefits  
- key: toolCost
  default: 20000    # Lower cost
- key: productivityGain
  default: 25       # Higher gain  
- key: adoptionRate
  default: 90       # Faster adoption
```

## ⚠️ Common Errors to Avoid

### Schema Validation Errors
```yaml
# ❌ Wrong - too short description
description: "test"

# ✅ Correct - 10+ characters
description: "Analysis of technology investment with uncertainty modeling"

# ❌ Wrong - missing required fields
name: "Test"
# Missing: category, description, version, tags, parameters

# ✅ Correct - all required fields present
name: "Test Analysis"
category: "Business"  
description: "Strategic business analysis with Monte Carlo modeling"
version: "1.0.0"
tags: [business]
parameters: [...]
```

### Simulation Logic Errors
```javascript
// ❌ Wrong - undefined variables
return { result: undefinedVariable }

// ❌ Wrong - missing return statement
const calculation = investment * 0.1
// Missing: return { ... }

// ✅ Correct - use defined parameters, return object
const result = investment * productivityGain * random()
return { roi: Math.round(result * 10) / 10 }
```

## 🚀 Rapid Simulation Creation

### 1. Copy Working Pattern
```bash
cp examples/simulations/simple-roi-analysis.yaml my-analysis.yaml
```

### 2. Modify Key Fields
```yaml
name: "Your Analysis Name"
description: "Your specific business decision analysis"
tags: [relevant, keywords]

parameters:
  - key: yourParameter
    label: "Your Parameter Label"
    type: number
    default: yourValue
```

### 3. Adapt Logic
```javascript
simulation:
  logic: |
    // Use your parameter names
    const result = yourParameter * (0.8 + random() * 0.4)
    return { yourOutput: Math.round(result) }
```

### 4. Test Immediately
```bash
npm run cli validate my-analysis.yaml
npm run cli run my-analysis.yaml
```

## 📈 Output Format

### Standard Results
```
🔬 Monte Carlo Simulation: Your Analysis Name
📊 Results (1,000 iterations):
   Output Name: 1,234 ± 567 (mean ± std deviation)
   ROI Percentage: 123.4% ± 45.6%
✅ Simulation completed successfully
```

### Data Structure
- **Mean**: Expected value across all iterations
- **±**: Standard deviation (uncertainty range)
- **Iterations**: Default 1,000 Monte Carlo samples

## 🔗 Reference Links

- **Human documentation**: [README.md](README.md)
- **Technical details**: [TECHNICAL.md](TECHNICAL.md) 
- **Example patterns**: [examples/README.md](examples/README.md)
- **Test cases**: `src/test/` directory

## ✅ Validation Checklist

Before creating simulations, verify:
- [ ] All required fields present
- [ ] Description 10-500 characters
- [ ] Version format "x.y.z"
- [ ] At least 1 tag
- [ ] At least 1 parameter
- [ ] Simulation logic returns object
- [ ] Output keys match simulation return values
- [ ] Test with `npm run cli validate filename.yaml`