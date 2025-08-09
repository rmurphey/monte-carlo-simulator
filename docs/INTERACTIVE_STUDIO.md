# Examples-First Simulation Creation

## Overview

The Monte Carlo simulation framework uses an **examples-first approach** for creating business simulations. Users copy working examples and modify them directly for maximum simplicity, reliability, and speed.

## Current Approach: Copy-Modify-Validate-Run

### Workflow Steps

1. **Browse Examples**: Find a simulation similar to your use case
2. **Copy Example**: Copy the YAML file to your workspace  
3. **Modify Parameters**: Edit the YAML directly with your values
4. **Validate Configuration**: Ensure your changes are valid
5. **Run Simulation**: Execute with parameter control options

### Implementation

```bash
# 1. View available examples
npm run cli list

# 2. Copy a relevant example
cp examples/simulations/simple-roi-analysis.yaml my-analysis.yaml

# 3. Edit my-analysis.yaml with your parameters
# 4. Validate your changes
npm run cli validate my-analysis.yaml

# 5. Run your simulation
npm run cli run my-analysis.yaml
```

## Available Examples

The framework includes working examples for common business scenarios:

- **Simple ROI Analysis** - Basic investment return calculations
- **Technology Investment** - Software/tool adoption analysis
- **Team Scaling Decision** - Hiring vs efficiency investments
- **Marketing Campaign ROI** - Marketing spend optimization
- **AI Tool Adoption** - Conservative/aggressive AI investment scenarios

### Example Structure

```yaml
name: "Investment Analysis"
category: "Finance" 
description: "ROI analysis with uncertainty modeling"
version: "1.0.0"
tags: [finance, roi, investment]

parameters:
  - key: initialInvestment
    label: "Initial Investment ($)"
    type: number
    default: 100000
    min: 1000
    max: 10000000

simulation:
  logic: |
    const monthlyBenefit = initialInvestment * (0.01 + random() * 0.02)
    const annualReturn = monthlyBenefit * 12
    const roi = ((annualReturn - initialInvestment) / initialInvestment) * 100
    return { 
      monthlyBenefit: Math.round(monthlyBenefit),
      annualReturn: Math.round(annualReturn), 
      roi: Math.round(roi * 10) / 10 
    }
```

## Interactive Features

### Parameter Override

```bash
# Override specific parameters from command line
npm run cli run my-analysis.yaml --set initialInvestment=300000 --set riskFactor=0.15

# Use parameter files for complex scenarios
echo '{"initialInvestment": 500000, "timeline": 36}' > scenario.json
npm run cli run my-analysis.yaml --params scenario.json
```

### Real-time Parameter Adjustment

```bash
# Launch interactive mode for parameter exploration
npm run cli run my-analysis.yaml --interactive

# Features:
# - Real-time parameter sliders
# - Immediate result updates  
# - Before/after comparison
# - Parameter validation
```

### Validation and Testing

```bash
# Comprehensive validation
npm run cli validate my-analysis.yaml

# List available parameters
npm run cli run my-analysis.yaml --list-params

# Quick test run
npm run cli run my-analysis.yaml --iterations 100
```

## Benefits of Examples-First Approach

### **Simplicity**
- **No complex interfaces** - Direct file editing
- **No guided questionnaires** - Copy what works
- **No learning curve** - Standard YAML format

### **Reliability** 
- **Start from working configurations** - All examples are tested
- **Bulletproof validation** - AJV schema prevents errors
- **Known patterns** - Proven simulation structures

### **Speed**
- **Instant setup** - Copy and modify in seconds
- **No wizard steps** - Direct parameter editing
- **Fast iteration** - Edit, validate, run cycle

### **Agent-Friendly**
- **Programmatic generation** - Easy for AI assistants
- **Clear patterns** - Consistent structure across examples
- **Direct manipulation** - No complex API required

## Advanced Usage

### Custom Business Logic

Edit the `simulation.logic` section for custom calculations:

```yaml
simulation:
  logic: |
    // Your custom business logic
    const uncertainty = 0.8 + random() * 0.4  // 80-120% range
    const adjustedROI = baseROI * uncertainty
    const paybackMonths = initialCost / monthlyBenefit
    
    return {
      projectedROI: Math.round(adjustedROI * 10) / 10,
      paybackPeriod: Math.round(paybackMonths * 10) / 10,
      riskAdjustedValue: Math.round(netPresentValue * uncertainty)
    }
```

### Scenario Comparison

```bash
# Create multiple scenarios
cp examples/simulations/ai-tool-adoption/conservative.yaml my-conservative.yaml
cp examples/simulations/ai-tool-adoption/aggressive.yaml my-aggressive.yaml

# Compare results side by side
npm run cli run my-conservative.yaml --compare my-aggressive.yaml
```

### Export and Analysis

```bash
# Export results for further analysis
npm run cli run my-analysis.yaml --output results.json --format json
npm run cli run my-analysis.yaml --output results.csv --format csv

# High-precision runs for final decisions
npm run cli run my-analysis.yaml --iterations 10000 --output final-analysis.json
```

## Integration with Development Workflow

### NPX Support (Zero Setup)

```bash
# Run simulations without installation
npx github:rmurphey/monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml

# Parameter overrides work with NPX
npx github:rmurphey/monte-carlo-simulator run examples/simulations/technology-investment.yaml --set investment=200000
```

### Development Commands

```bash
# Test all examples (ensure they work)
npm test

# Build framework for distribution  
npm run build

# Lint and validate codebase
npm run lint
```

## Conclusion

The examples-first approach provides the optimal balance of simplicity, reliability, and power. By starting with working examples and modifying them directly, users can create sophisticated Monte Carlo simulations without complex interfaces or steep learning curves.

This approach is particularly effective for:
- **Business professionals** who need quick, reliable analysis
- **AI assistants** generating simulations programmatically  
- **Development teams** requiring consistent, testable patterns
- **Strategic decisions** where reliability and speed matter most