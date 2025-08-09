# CLI Reference Guide

## Overview

The Monte Carlo CLI provides comprehensive business simulation capabilities with bulletproof validation and production-grade reliability.

## 🚀 Quick Start

```bash
# Zero setup with NPX (recommended for quick analysis)
npx github:rmurphey/monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml

# Local installation (full features)
git clone https://github.com/rmurphey/monte-carlo-simulator
cd monte-carlo-simulator && npm install && npm run build
npm run cli run examples/simulations/simple-roi-analysis.yaml
```

## 📋 Command Overview

```bash
monte-carlo-cli [command] [options]

Commands:
  run         Run Monte Carlo simulations with parameter control
  validate    Bulletproof YAML validation with detailed error messages  
  list        List available simulations
  interactive Select and run simulations interactively
  create      Create new simulation configurations
  help        Command-specific help
```

## 🎯 Primary Commands

### `run` - Execute Simulations

**Basic Usage:**
```bash
# Local
npm run cli run <simulation> [options]

# NPX (zero setup)
npx github:rmurphey/monte-carlo-simulator run <simulation> [options]
```

**Key Options:**
- `-i, --iterations <number>` - Number of Monte Carlo iterations (default: 1000)
- `--set <param=value>` - Override parameters with validation
- `-p, --params <file>` - Load parameters from JSON/YAML file
- `--interactive` - Real-time parameter adjustment mode
- `--list-params` - Discover available parameters
- `-f, --format <format>` - Output format: table, json, csv, quiet
- `-o, --output <file>` - Save results to file
- `-v, --verbose` - Detailed output with configuration display

**Parameter Override Examples:**
```bash
# Single parameter
npm run cli run simple-roi-analysis --set initialInvestment=75000

# Multiple parameters  
npm run cli run simple-roi-analysis --set initialInvestment=75000 --set monthlyBenefit=6000

# With parameter file
echo '{"initialInvestment": 100000, "monthlyBenefit": 8000}' > my-params.json
npm run cli run simple-roi-analysis --params my-params.json

# Override parameter file values
npm run cli run simple-roi-analysis --params base.json --set monthlyBenefit=12000

# High iteration analysis  
npm run cli run technology-investment --set toolCost=150000 --iterations 5000 --verbose
```

**Scenario Comparison:**
```bash
# Compare multiple scenarios (advanced usage)
npm run cli run ai-tool-adoption --compare conservative,baseline,aggressive
```

**Interactive Mode:**
```bash
# Real-time parameter exploration (local only)
npm run cli run simple-roi-analysis --interactive

# Features:
# - Adjust parameters and see immediate results
# - Before/after comparison tracking
# - Parameter validation with helpful errors
# - Export scenarios when satisfied
```

### `validate` - Schema Validation

**Usage:**
```bash
# Bulletproof validation with detailed errors
npm run cli validate <file>
npx github:rmurphey/monte-carlo-simulator validate <file>

# Examples
npm run cli validate examples/simulations/simple-roi-analysis.yaml
npm run cli validate my-custom-simulation.yaml --verbose
```

**What Gets Validated:**
- JSON Schema compliance (AJV-based)
- Business rules (duplicate keys, constraints)
- Parameter type checking and ranges
- Required field validation
- YAML syntax and structure

**Example Error Output:**
```
❌ Wrong type at /parameters/0/default: expected number, got string (received: "abc")
❌ Missing required field: monthlyBenefit at /parameters  
❌ Default value 500 for parameter 'investment' is below minimum 1000
```

### `list` - Available Simulations

```bash
# Show all available simulations
npm run cli list

# With details
npm run cli list --verbose
```

### `interactive` - Simulation Browser

```bash
# Interactive simulation selection and execution
npm run cli interactive
```

## 🎛️ Parameter Management

### Parameter Discovery
```bash
# See all parameters for any simulation
npm run cli run <simulation> --list-params
npx github:rmurphey/monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml --list-params

# Output includes:
# - Parameter name, type, default value
# - Min/max ranges (for numbers)
# - Description and constraints
# - Usage examples
```

### Parameter Files

**JSON Format:**
```json
{
  "initialInvestment": 75000,
  "monthlyBenefit": 6000,
  "riskEnabled": true
}
```

**YAML Format:**
```yaml
initialInvestment: 75000
monthlyBenefit: 6000
riskEnabled: true
```

**Advanced Parameter File (Simulation Config Format):**
```json
{
  "parameters": [
    {"key": "initialInvestment", "default": 75000},
    {"key": "monthlyBenefit", "default": 6000}
  ]
}
```

### Parameter Validation

**Type Checking:**
```bash
npm run cli run simulation.yaml --set investment=abc
# ❌ Parameter 'investment' must be a number, got: abc
```

**Range Validation:**
```bash
npm run cli run simulation.yaml --set investment=500  
# ❌ Parameter 'investment' value 500 is below minimum 1000
```

**Unknown Parameters:**
```bash
npm run cli run simulation.yaml --set unknownParam=123
# ❌ Unknown parameter 'unknownParam'. Use --list-params to see available parameters
```

## 📊 Output Formats

### Table Format (Default)
```bash
npm run cli run simple-roi-analysis

# Output:
# 📈 RESULTS SUMMARY
# ══════════════════════════════════════════════════
# ROI Percentage           : 15.2 ± 8.4
# Payback Period (Months)  : 11.3 ± 2.1
```

### JSON Format
```bash
npm run cli run simple-roi-analysis --format json

# Structured output for programmatic use
# Includes full results array and statistical summary
```

### CSV Format  
```bash
npm run cli run simple-roi-analysis --format csv --output results.csv

# Spreadsheet-ready format
# Headers: parameter names and iteration results
```

### Quiet Mode
```bash
npm run cli run simple-roi-analysis --format quiet

# Minimal output for scripting
# Only essential results, no formatting
```

## 🔧 Advanced Usage

### Batch Processing
```bash
# Process multiple parameter scenarios
for investment in 50000 75000 100000; do
  npm run cli run simple-roi-analysis --set initialInvestment=$investment --format csv >> results.csv
done
```

### Scripting Integration  
```bash
# Use in shell scripts with error handling
if npm run cli run simulation.yaml --format quiet > /dev/null 2>&1; then
  echo "Simulation successful"
else
  echo "Simulation failed"
  exit 1
fi
```

### High-Performance Analysis
```bash
# Large iteration counts for precision
npm run cli run technology-investment --iterations 10000 --format json --output detailed-results.json

# Verbose output for debugging
npm run cli run simulation.yaml --verbose --iterations 100
```

## 🚨 Error Handling

### Common Errors and Solutions

**File Not Found:**
```bash
# ❌ Simulation 'missing.yaml' not found
# ✅ Solution: Check file path and available simulations
npm run cli list
```

**Invalid YAML:**
```bash  
# ❌ YAML parsing failed: unexpected character
# ✅ Solution: Validate YAML syntax
npm run cli validate problematic-file.yaml
```

**Parameter Errors:**
```bash
# ❌ Parameter validation failed  
# ✅ Solution: Check parameter constraints
npm run cli run simulation.yaml --list-params
```

### Exit Codes
- `0` - Success
- `1` - Validation error, file not found, or parameter error

## 🎨 Best Practices

### For Development
1. **Always validate** before running: `npm run cli validate file.yaml`  
2. **Use --list-params** to discover available options
3. **Start with small iterations** (100-500) for testing
4. **Use --verbose** for debugging parameter issues

### For Production
1. **Use high iteration counts** (5000+) for reliable results
2. **Save results to files** with `--output` option
3. **Use JSON format** for programmatic processing
4. **Parameter files** for repeatable analysis

### For Exploration  
1. **Start interactive**: `npm run cli run simulation.yaml --interactive`
2. **Use NPX** for quick testing without installation
3. **Compare scenarios** to understand sensitivity
4. **Export successful parameter combinations**

## 🔗 Integration Examples

### CI/CD Pipeline
```yaml
- name: Validate Simulations
  run: |
    npm run cli validate simulations/*.yaml
    npm run cli run business-analysis.yaml --iterations 1000 --format json --output results.json
```

### Automated Reporting
```bash
#!/bin/bash
# Generate weekly business analysis report
npm run cli run quarterly-forecast.yaml \
  --params current-metrics.json \
  --iterations 5000 \
  --format csv \
  --output "reports/forecast-$(date +%Y-%m-%d).csv"
```

## 📚 Related Documentation

- **[VALIDATION.md](VALIDATION.md)** - Bulletproof validation system details
- **[AGENT.md](AGENT.md)** - Agent integration and NPX usage  
- **[examples/README.md](../examples/README.md)** - Simulation examples and patterns
- **[TECHNICAL.md](TECHNICAL.md)** - Framework architecture and customization

## 🆘 Getting Help

```bash
# Command-specific help
npm run cli <command> --help

# General help
npm run cli --help  

# Parameter discovery
npm run cli run <simulation> --list-params

# Validation with detailed errors
npm run cli validate <file> --verbose
```

The CLI provides production-grade business simulation capabilities with comprehensive validation, flexible parameter management, and multiple output formats suitable for both interactive exploration and automated analysis.