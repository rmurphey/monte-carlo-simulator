# User Simulations Workspace

## 🎯 Purpose: Your Custom Simulations

This directory is your **workspace** for creating, customizing, and maintaining your own simulation configurations.

## Directory Purpose Clarification

| Directory | Purpose | Used By | Validation |
|-----------|---------|---------|-----------|
| `/examples/simulations/` | **Starting point patterns** | Copy-from workflow, Learning | ✅ Strict |
| `/simulations/` | **User workspace** | You, Your team | ❌ Freedom |

## 📁 Personal Workspace

- **Development space** - Create and modify your custom simulations
- **Copy from examples** - Start by copying from `/examples/simulations/` directory
- **Full development freedom** - Experiment without validation requirements during development
- **Personal/proprietary** - Can include organization-specific business models

## Directory Structure

```
simulations/
├── README.md                    # This overview
├── ai-investment-roi/          # AI tool investment analysis
│   ├── README.md              # Detailed AI ROI documentation
│   ├── baseline.yaml          # Realistic baseline scenario
│   ├── conservative.yaml      # Low-risk scenario
│   └── aggressive.yaml        # High-risk, high-reward scenario
└── [future-categories]/       # Additional simulation categories
```

## Current Simulation Categories

### 🤖 AI Investment ROI (`ai-investment-roi/`)

**Purpose**: Model financial uncertainty around AI tool investments over 36 months.

**Quick Start**:
```bash
# Run baseline analysis
npm run cli run simulations/ai-investment-roi/baseline.yaml

# Compare risk scenarios
npm run cli run simulations/ai-investment-roi/conservative.yaml
npm run cli run simulations/ai-investment-roi/aggressive.yaml
```

**Key Features**:
- Implementation delay modeling (1-3x expected time)
- Adoption success/failure scenarios  
- Market price increases and competitive responses
- Break-even analysis and risk scoring

See [`ai-investment-roi/README.md`](ai-investment-roi/README.md) for detailed documentation.

## Organization Principles

### Directory Structure
- **Category directories**: Group related simulations by business domain
- **Descriptive filenames**: Clear, concise names within each category
- **Documentation**: Each category has its own README with usage examples

### File Naming
Within each category directory:
- `baseline.yaml` - Standard/realistic scenario
- `conservative.yaml` - Lower risk variant
- `aggressive.yaml` - Higher risk variant  
- `[specific-case].yaml` - Custom scenarios

### Example Categories (Future)
```
simulations/
├── marketing-campaigns/        # Marketing ROI analysis
├── product-launches/          # New product success modeling  
├── hiring-strategies/         # Team scaling cost-benefit
├── market-expansion/          # Geographic expansion ROI
└── technology-migrations/     # Infrastructure change analysis
```

## Creating New Simulations

### Copy-First Workflow
```bash
# Start by copying a relevant example
cp examples/simulations/technology-investment.yaml simulations/my-analysis.yaml

# Edit your copy to match your specific scenario
# Validate when ready
npm run cli validate simulations/my-analysis.yaml

# Run your simulation
npm run cli run simulations/my-analysis.yaml
```

### Development Guidelines
1. **Start with examples** - Copy from `/examples/simulations/` as starting points
2. **Use descriptive names**: `[category]-[use-case]-[variant].yaml`
3. **Include comprehensive metadata**: name, description, tags, version
4. **Document parameters**: Clear labels and descriptions
5. **Define meaningful outputs**: Business-relevant metrics

## Best Practices

- **Parameter ranges**: Set realistic min/max values
- **Business context**: Use `businessContext: true` for strategic simulations
- **Group parameters**: Organize related inputs into logical groups  
- **Validation**: Always validate simulations before committing
- **Testing**: Run with multiple scenarios to verify behavior