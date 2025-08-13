# Quick Reference - Creating Your Own Simulations

## 🚀 Getting Started

```bash
# Zero setup testing (NPX)
npx monte-carlo-simulator validate simple-roi-analysis

# Local development (full features)
git clone https://github.com/rmurphey/monte-carlo-simulator
cd monte-carlo-simulator && npm install && npm run build
npm run cli validate simple-roi-analysis
npm run cli run simple-roi-analysis
```

## 📝 Create Your First Simulation

### Basic Business ROI Example
```yaml
# my-roi-analysis.yaml
name: "My Investment Analysis"
category: "Finance"
description: "ROI analysis for my specific business decision with uncertainty modeling"
version: "1.0.0"
tags: [finance, roi, custom]

parameters:
  - key: initialInvestment
    label: "Initial Investment ($)"
    type: number
    default: 50000
    min: 1000
    max: 1000000
    description: "Upfront investment amount"
    
  - key: monthlyBenefit
    label: "Expected Monthly Benefit ($)"
    type: number
    default: 5000
    min: 100
    max: 50000
    description: "Expected monthly financial benefit"
    
  - key: riskFactor
    label: "Risk Factor"
    type: number
    default: 0.2
    min: 0.1
    max: 0.5
    description: "Uncertainty factor (0.1=low risk, 0.5=high risk)"

outputs:
  - key: roi
    label: "ROI Percentage"
    description: "Return on investment percentage"
  
  - key: paybackMonths
    label: "Payback Period (Months)"
    description: "Time to recover initial investment"

simulation:
  logic: |
    // Add uncertainty to monthly benefit
    const actualBenefit = monthlyBenefit * (1 + (random() - 0.5) * riskFactor * 2)
    const annualBenefit = actualBenefit * 12
    
    // Calculate ROI and payback period
    const roi = ((annualBenefit - initialInvestment) / initialInvestment) * 100
    const paybackMonths = initialInvestment / actualBenefit
    
    return {
      roi: Math.round(roi * 10) / 10,
      paybackMonths: Math.round(paybackMonths * 10) / 10
    }
```

### Test Your Simulation
```bash
# Validate schema and business rules
npm run cli validate my-roi-analysis.yaml

# Run with default parameters
npm run cli run my-roi-analysis.yaml

# Test with custom parameters
npm run cli run my-roi-analysis.yaml --set initialInvestment=100000 --set monthlyBenefit=8000
```

## 🎯 Common Simulation Patterns

### Technology Investment Decision
```yaml
name: "Technology Investment Decision"
category: "Technology"
description: "Evaluate technology investment with adoption and productivity factors"
version: "1.0.0"
tags: [technology, productivity, investment]

parameters:
  - key: toolCost
    label: "Tool Cost ($)"
    type: number
    default: 25000
  - key: teamSize
    label: "Team Size"
    type: number
    default: 10
  - key: productivityGain
    label: "Expected Productivity Gain (%)"
    type: number
    default: 20
    min: 5
    max: 50
  - key: adoptionRate
    label: "Adoption Rate (%)"
    type: number
    default: 80
    min: 30
    max: 95

outputs:
  - key: annualSavings
    label: "Annual Savings ($)"
  - key: roi
    label: "ROI (%)"

simulation:
  logic: |
    const avgSalary = 100000
    const actualAdoption = (adoptionRate / 100) * (0.7 + random() * 0.6)
    const actualGain = (productivityGain / 100) * (0.8 + random() * 0.4)
    
    const annualSavings = teamSize * avgSalary * actualAdoption * actualGain
    const roi = ((annualSavings - toolCost) / toolCost) * 100
    
    return {
      annualSavings: Math.round(annualSavings),
      roi: Math.round(roi * 10) / 10
    }
```

## 💡 Advanced Patterns

### Risk Analysis with Multiple Scenarios
```yaml
name: "Marketing Campaign Risk Analysis"
category: "Marketing"
description: "Marketing campaign with multiple risk scenarios and budget constraints"
version: "1.0.0"
tags: [marketing, risk, budget]

parameters:
  - key: campaignBudget
    label: "Campaign Budget ($)"
    type: number
    default: 50000
  - key: expectedConversion
    label: "Expected Conversion Rate (%)"
    type: number
    default: 2.5
    min: 0.5
    max: 10
  - key: averageOrderValue
    label: "Average Order Value ($)"
    type: number
    default: 150
  - key: marketVolatility
    label: "Market Volatility"
    type: select
    default: "medium"
    options: ["low", "medium", "high"]

simulation:
  logic: |
    // Risk factors based on market volatility
    const volatilityMultipliers = { low: 0.1, medium: 0.3, high: 0.6 }
    const volatility = volatilityMultipliers[marketVolatility] || 0.3
    
    // Add uncertainty to conversion and order value
    const actualConversion = (expectedConversion / 100) * (1 + (random() - 0.5) * volatility)
    const actualOrderValue = averageOrderValue * (1 + (random() - 0.5) * volatility)
    
    // Calculate results
    const visitors = campaignBudget / 2 // Assume $2 per visitor
    const conversions = visitors * actualConversion
    const revenue = conversions * actualOrderValue
    const roi = ((revenue - campaignBudget) / campaignBudget) * 100
    
    return {
      revenue: Math.round(revenue),
      conversions: Math.round(conversions),
      roi: Math.round(roi * 10) / 10,
      riskLevel: marketVolatility
    }
```

## 🔧 Development Workflow

### 1. Create Your Simulation
```bash
# Create your YAML file
cat > my-analysis.yaml << EOF
name: "My Business Decision"
category: "Business"
description: "Custom analysis for my specific business scenario"
version: "1.0.0"
tags: [business, custom]

parameters:
  - key: investment
    label: "Investment Amount ($)"
    type: number
    default: 10000

outputs:
  - key: result
    label: "Analysis Result"

simulation:
  logic: |
    const result = investment * (0.8 + random() * 0.4)
    return { result: Math.round(result) }
EOF
```

### 2. Validate Schema
```bash
# Check for errors before running
npm run cli validate my-analysis.yaml
```

### 3. Test and Iterate
```bash
# Quick test with low iterations
npm run cli run my-analysis.yaml --iterations 100

# Test parameter overrides
npm run cli run my-analysis.yaml --set investment=25000

# Full analysis when satisfied
npm run cli run my-analysis.yaml --iterations 5000 --verbose
```

### 4. Parameter Discovery
```bash
# See all available parameters
npm run cli run my-analysis.yaml --list-params
```

## 📊 Learning from Examples

Use existing simulations as starting points:
```bash
# Copy and customize existing patterns
cp examples/simulations/simple-roi-analysis.yaml my-custom-analysis.yaml

# Study working patterns
cat examples/simulations/technology-investment.yaml
cat examples/simulations/team-scaling-decision.yaml
```

## 🎯 Quick Tips for Simulation Creation

1. **Start simple** - Begin with basic parameters and outputs
2. **Validate early** - Use `npm run cli validate` before running
3. **Test incremental changes** - Small iterations during development
4. **Use meaningful uncertainty** - `random()` should reflect real-world variability
5. **Document parameters** - Clear descriptions help with parameter discovery
6. **Test edge cases** - Use min/max parameter values to validate logic
7. **Round outputs** - Use `Math.round()` for cleaner results

## 🚨 Common Pitfalls to Avoid

- **Missing required fields** - Validation will catch these
- **Invalid simulation logic** - Must contain `return` statement
- **Parameter constraint violations** - Default values outside min/max ranges
- **Duplicate keys** - Parameter and output keys must be unique
- **Type mismatches** - Ensure parameter defaults match their declared types

## 📚 Full Documentation

- **[CLI_REFERENCE.md](CLI_REFERENCE.md)** - Complete CLI guide with all commands
- **[VALIDATION.md](VALIDATION.md)** - Schema validation and error handling
- **[AGENT.md](AGENT.md)** - Agent integration and advanced patterns
- **[examples/README.md](../examples/README.md)** - Working simulation examples