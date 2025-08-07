# User Simulations Workspace

## 🎯 Purpose: Your Custom Simulations

This directory is your **workspace** for creating, customizing, and maintaining your own simulation configurations.

## Directory Purpose Clarification

| Directory | Purpose | Used By | Validation |
|-----------|---------|---------|-----------|
| `/templates/` | **System templates** | TemplateLibrary, Agent generation | ✅ Strict |
| `/examples/` | **Learning examples** | Documentation, New users | ❌ Educational |
| `/simulations/` | **User workspace** | You, Your team | ❌ Freedom |

## 🚫 Important: NOT Used by System

- **TemplateLibrary ignores this directory** - it uses `/templates/` for agent workflows
- **Agents don't see these files** - they use production templates for generation
- **Full development freedom** - no validation requirements or restrictions

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

## Adding New Simulations

1. **Use descriptive names**: `[category]-[use-case]-[variant].yaml`
2. **Include comprehensive metadata**: name, description, tags, version
3. **Document parameters**: Clear labels and descriptions
4. **Define meaningful outputs**: Business-relevant metrics
5. **Add to this README**: Update documentation with usage examples

## Best Practices

- **Parameter ranges**: Set realistic min/max values
- **Business context**: Use `businessContext: true` for strategic simulations
- **Group parameters**: Organize related inputs into logical groups  
- **Validation**: Always validate simulations before committing
- **Testing**: Run with multiple scenarios to verify behavior