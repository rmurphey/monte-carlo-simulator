# Quick Reference

## 🚀 Instant Start

```bash
# Zero setup (NPX) - works immediately
npx github:rmurphey/monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml

# Local development (full features)
git clone https://github.com/rmurphey/monte-carlo-simulator
cd monte-carlo-simulator && npm install && npm run build
npm run cli run examples/simulations/simple-roi-analysis.yaml
```

## 📊 Common Analysis Patterns

### Quick Business ROI Analysis
```bash
# Basic ROI simulation
npx github:rmurphey/monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml

# With custom parameters
npx github:rmurphey/monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml --set initialInvestment=75000 --set monthlyBenefit=6000
```

### Technology Investment Decision
```bash
# Technology investment analysis
npx github:rmurphey/monte-carlo-simulator run examples/simulations/technology-investment.yaml

# Team scaling decision
npx github:rmurphey/monte-carlo-simulator run examples/simulations/team-scaling-decision.yaml
```

### AI Tool Adoption Analysis
```bash
# AI tool adoption scenarios
npx github:rmurphey/monte-carlo-simulator run examples/simulations/ai-tool-adoption/ai-tool-adoption.yaml
npx github:rmurphey/monte-carlo-simulator run examples/simulations/ai-tool-adoption/conservative.yaml
npx github:rmurphey/monte-carlo-simulator run examples/simulations/ai-tool-adoption/aggressive.yaml
```

## 🔧 Essential Commands

```bash
# Discover parameters for any simulation
npx github:rmurphey/monte-carlo-simulator run <simulation> --list-params

# Validate YAML with bulletproof checking
npx github:rmurphey/monte-carlo-simulator validate <file>

# Interactive mode (local only)  
npm run cli run <simulation> --interactive

# High-precision analysis
npm run cli run <simulation> --iterations 5000 --verbose
```

## 📋 Parameter Override Examples

```bash
# Single parameter
--set initialInvestment=100000

# Multiple parameters
--set initialInvestment=100000 --set monthlyBenefit=8000 --set riskEnabled=false

# Parameter file
echo '{"initialInvestment": 100000, "monthlyBenefit": 8000}' > params.json
--params params.json

# Combined approach
--params base.json --set monthlyBenefit=12000
```

## 📈 Output Formats

```bash
# Table (default) - human readable
npm run cli run simulation.yaml

# JSON - programmatic processing  
npm run cli run simulation.yaml --format json

# CSV - spreadsheet analysis
npm run cli run simulation.yaml --format csv --output results.csv

# Quiet - minimal output for scripting
npm run cli run simulation.yaml --format quiet
```

## 🎯 Quick Tips

1. **Start with NPX** - No installation required for basic analysis
2. **Use --list-params** - Discover available parameters quickly  
3. **Validate first** - Check YAML syntax before running
4. **Small iterations** - Use 100-500 for quick testing, 1000+ for final results
5. **Save successful parameters** - Build reusable parameter files

## 📚 Full Documentation

- **[CLI_REFERENCE.md](CLI_REFERENCE.md)** - Complete CLI guide
- **[VALIDATION.md](VALIDATION.md)** - Schema validation system  
- **[AGENT.md](AGENT.md)** - Agent integration guide
- **[examples/README.md](../examples/README.md)** - Simulation patterns