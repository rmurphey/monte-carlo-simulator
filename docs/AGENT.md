# Agent Guide - Monte Carlo Business Simulation Framework

## 🎯 Examples-First Simulation Creation ✅ **IMPLEMENTED**

### Copy-From-Examples Workflow
```bash
# View available examples
npm run cli list

# Copy an example to modify
cp examples/simulations/simple-roi-analysis.yaml custom-analysis.yaml

# Validate your configuration
npm run cli validate custom-analysis.yaml

# Run your simulation
npm run cli run custom-analysis.yaml
```

### Agent-Optimized Pattern  
```bash
# 1. Start with working example
cp examples/simulations/technology-investment.yaml my-investment.yaml

# 2. Modify YAML parameters directly (no complex UI needed)
# 3. Validate configuration
npm run cli validate my-investment.yaml

# 4. Run simulation with validation
npm run cli run my-investment.yaml
```

**Agent Integration**: Simple copy-modify-validate-run workflow with bulletproof YAML validation. AJV-based schema validation prevents any invalid configurations. Direct file manipulation approach for maximum simplicity.

## ✅ Working Commands (Tested)

### NPX Commands (Zero Setup)
```bash
# Run simulations directly without installation
npx monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml
npx monte-carlo-simulator run examples/simulations/technology-investment.yaml
npx monte-carlo-simulator run examples/simulations/ai-tool-adoption/ai-tool-adoption.yaml

# Parameter discovery and validation  
npx monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml --list-params
npx monte-carlo-simulator validate examples/simulations/simple-roi-analysis.yaml

# Parameter overrides with bulletproof validation
npx monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml --set initialInvestment=75000
```

### Local Development Commands
```bash
# Full feature access (requires git clone + npm install)
npm run cli run examples/simulations/simple-roi-analysis.yaml --interactive
npm run cli validate custom-analysis.yaml
npm run cli --help
npm run cli list
```

**Directory Structure:**
- `/examples/simulations/` - Working examples with bulletproof validation
- `/docs/` - Agent specifications and validation documentation
- `/src/validation/` - BulletproofValidator system

## 🌐 Web Interface Alternative

### Interactive Simulation Selector ✅ **IMPLEMENTED**
For visual parameter exploration with instant feedback:

```bash
# Start web interface (headless by default)
npm run dev:web

# Or open in browser for interactive development  
npm run dev:web:open

# Access at: http://localhost:3000
# Direct simulation loading: http://localhost:3000/?simulation=simple-roi-analysis
```

**Web Interface Features:**
- **Simulation Dropdown**: Choose from 9+ available simulation templates
- **Dynamic Parameter Forms**: Parameters auto-update based on selected simulation
- **Value Preservation**: Compatible parameters preserved when switching simulations
- **Real-time Validation**: Instant parameter validation feedback
- **Complete Visualizations**: Charts, statistics, and configuration export

**Agent Use Cases:**
- **Parameter Exploration**: Visual sliders and inputs for quick testing
- **Simulation Comparison**: Switch between templates to compare approaches  
- **Configuration Export**: Generate parameter configurations for CLI use
- **Non-technical Stakeholders**: Share interactive interface for business review

## 🚀 NPX Quick Start Guide

### For Agents: Zero-Setup Analysis
```bash
# Instant business decision analysis (no installation required)
npx monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml

# Real business scenarios
npx monte-carlo-simulator run examples/simulations/technology-investment.yaml
npx monte-carlo-simulator run examples/simulations/team-scaling-decision.yaml

# AI tool adoption analysis  
npx monte-carlo-simulator run examples/simulations/ai-tool-adoption/ai-tool-adoption.yaml

# Get comprehensive Monte Carlo visualizations (histograms, risk analysis)
npx monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml --verbose
```

### Parameter Discovery & Validation
```bash
# Discover all parameters for any simulation
npx monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml --list-params

# Validate YAML configurations with bulletproof checking
npx monte-carlo-simulator validate examples/simulations/simple-roi-analysis.yaml

# Override parameters with validation
npx monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml --set initialInvestment=100000 --set monthlyBenefit=8000
```

**NPX Benefits for Agents:**
- **Zero setup required** - Works immediately without git clone or npm install
- **Bulletproof validation** - All YAML checked with detailed error messages  
- **Parameter discovery** - Dynamic parameter listing without static documentation
- **Rich visualizations** - ASCII histograms, confidence intervals, risk analysis included
- **Production reliability** - 87 tests ensure consistent behavior

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

## 🎛️ Interactive Parameter Exploration

### Real-Time Parameter Adjustment
```bash
# Launch interactive mode for any simulation
npx monte-carlo-simulator run simple-roi-analysis --interactive

# Override specific parameters from command line
npx monte-carlo-simulator run simple-roi-analysis --set initialInvestment=300000 --set monthlyBenefit=8000

# Discover available parameters for any simulation  
npx monte-carlo-simulator run simple-roi-analysis --list-params
```

**Interactive Features:**
- **Real-time parameter adjustment** - Change values and see immediate impact on results  
- **Before/after comparison** - Track how parameter changes affect outcomes
- **Parameter validation** - Type checking and range enforcement with helpful error messages
- **Dynamic parameter discovery** - No static documentation to maintain

### Exploration Workflow

#### Step 1: Generate and Save Your Simulation
```bash
# Generate but don't just test - SAVE it so you can modify it
cp examples/simulations/technology-investment.yaml ai-investment.yaml
npx monte-carlo-simulator run ai-investment.yaml
```

#### Step 2: Examine the Generated Model
```bash
# Look at what the AI created for you
cat ai-investment.yaml
```

You'll see a complete business model with:
- **Parameters you can adjust**: budget, team size, productivity gains, adoption rates
- **Business logic**: the actual calculations and assumptions
- **Risk factors**: implementation timeline, execution variance

#### Step 3: Run Interactive Exploration
```bash
# Run the simulation interactively - you can change parameters in real-time
npx monte-carlo-simulator run ai-investment.yaml --interactive
```

**This lets you:**
- Adjust the investment amount and see immediate impact
- Change team size assumptions 
- Modify productivity gain estimates
- Adjust adoption rates and timelines
- See results update in real-time as you explore

#### Step 4: Modify the Simulation File Directly

Edit `ai-investment.yaml` to change:

```yaml
parameters:
  - key: initialInvestment
    default: 200000    # Change this to explore different budgets
    min: 50000         # Set your own ranges
    max: 1000000
    
  - key: affectedEmployees  
    default: 50        # Try different team sizes
    min: 10
    max: 200
    
  - key: productivityGain
    default: 15        # Adjust expected productivity improvement  
    min: 5             # Conservative estimate
    max: 40            # Optimistic estimate
```

#### Step 5: Compare Scenarios Side by Side
```bash
# Create multiple versions to compare
cp ai-investment.yaml conservative-scenario.yaml
cp ai-investment.yaml aggressive-scenario.yaml

# Edit each file with different assumptions, then compare:
npx monte-carlo-simulator run conservative-scenario.yaml
npx monte-carlo-simulator run aggressive-scenario.yaml
```

## 📊 Business Question Patterns

### Technology Investment Decisions
```bash
# Team scaling analysis
"Should we hire 8 developers or invest $600K in automation tools?"

# Technology investment 
"ROI analysis of migrating to microservices architecture for 40-person team"

# Infrastructure decisions
"Cost-benefit analysis of moving to serverless vs scaling existing infrastructure"

# Implementation with uncertainty
npx monte-carlo-simulator run examples/simulations/technology-investment.yaml
```

### Resource Allocation Decisions
```bash  
# Resource allocation
"Should we spend $300K on marketing or hire 4 additional developers?"

# Product decisions
"ROI of building internal analytics vs using third-party tools"

# Growth strategy
"Should we expand to 2 new markets or focus on growing current market?"

# Implementation with validation
npx monte-carlo-simulator run examples/simulations/marketing-campaign-roi.yaml --set budget=75000
```

### Feature and Product Decisions
```bash
# Feature prioritization
"ROI analysis of building mobile app vs improving web experience"

# Market expansion
"Should we target enterprise customers or continue focusing on SMB?"

# Platform decisions
"Cost-benefit of building API platform vs focusing on core product"

# Save for further analysis
cp examples/simulations/technology-investment.yaml automation-analysis.yaml
npx monte-carlo-simulator validate automation-analysis.yaml
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

## 🔍 Real Example: Exploring an AI Tool Investment

### Complete Exploration Workflow

#### 1. Generate Your Starting Point
```bash
cp examples/simulations/ai-tool-adoption/ai-tool-adoption.yaml ai-tools.yaml
npx monte-carlo-simulator validate ai-tools.yaml
```

#### 2. Examine Generated Parameters
The AI creates a complete model with parameters like:
- `initialInvestment: 150000` (your budget)
- `affectedEmployees: 30` (team size) 
- `productivityGain: 15` (expected 15% productivity boost)
- `adoptionRate: 85` (85% of developers will use it effectively)
- `implementationMonths: 6` (rollout timeline)

#### 3. Test "What If" Scenarios

**What if adoption is lower?**
```bash
# Edit ai-tools.yaml, change adoptionRate from 85 to 60
npx monte-carlo-simulator run ai-tools.yaml
# Result: ROI drops from 280% to 180%
```

**What if we invest more in training?**
```bash
# Change initialInvestment to 200000, implementationMonths to 4  
npx monte-carlo-simulator run ai-tools.yaml
# Result: Higher upfront cost but faster payback
```

**What if productivity gains are higher?**
```bash
# Change productivityGain from 15 to 25
npx monte-carlo-simulator run ai-tools.yaml  
# Result: See how much ROI improves with better tools
```

#### 4. Interactive Real-Time Exploration
```bash
# Launch interactive mode to adjust parameters with immediate feedback
npx monte-carlo-simulator run ai-tools.yaml --interactive
```

In interactive mode, you can:
- Move sliders to change investment amount
- Adjust team size and see breakeven points  
- Modify productivity assumptions in real-time
- Find the optimal investment level for your situation

#### 5. Compare Different Strategies
```bash
# Conservative approach: lower expectations
# Edit: productivityGain: 10, adoptionRate: 70, implementationMonths: 8
npx monte-carlo-simulator run ai-tools.yaml --output conservative-results.json

# Aggressive approach: higher expectations  
# Edit: productivityGain: 25, adoptionRate: 95, implementationMonths: 3
npx monte-carlo-simulator run ai-tools.yaml --output aggressive-results.json

# Compare the risk/reward profiles
```

## 🚨 Troubleshooting

### "Simulation seems wrong"
More specific questions get better results:
- ❌ *"Should we hire people?"*
- ✅ *"Should we hire 3 senior developers at $150K each for our 50-person SaaS startup?"*

### "Results don't make sense"
Remember: this shows probability ranges, not guarantees. A 70% chance of success means 30% chance of problems.

### Parameter Validation Errors
Use `--list-params` to see available parameters:
```bash
npx monte-carlo-simulator run simple-roi-analysis --list-params
```

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