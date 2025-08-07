# System Templates Directory

This directory contains production-ready simulation templates used by the framework's business intelligence system.

## ⚠️ Important Notice

**These templates are used by the `TemplateLibrary` class for agent-driven simulation generation.**

- **Do NOT modify** these files without understanding the impact on agent workflows
- **Do NOT add** experimental or incomplete templates here
- **Do NOT use** this directory for learning (see `/examples/` instead)

## Template Requirements

All templates in this directory must:

1. **Pass validation**: YAML syntax + JSON schema + business logic validation
2. **Include BI metadata**: Industry classification, business model, decision type
3. **Be production-ready**: Tested and working without errors
4. **Support agent generation**: Optimized for natural language → YAML workflows

## Current Templates

| Template | Business Model | Industry | Decision Type | Agent Keywords |
|----------|----------------|----------|---------------|----------------|
| `marketing-campaign-roi.yaml` | SaaS | Marketing, Digital Marketing | Tactical | marketing, campaign, acquisition, roi |
| `software-investment-roi.yaml` | B2B | Technology, Software Development | Investment | software, investment, technology, productivity |
| `team-scaling-decision.yaml` | B2B | General Business | Strategic | team, scaling, hiring, growth |
| `simple-roi-analysis.yaml` | B2B | General Business | Investment | roi, return, analysis, investment |
| `technology-investment.yaml` | B2B | Technology | Investment | investment, planning, technology, roi |

## Template Structure

Each template includes:

```yaml
name: Template Name
category: Business Category  
description: Detailed description
version: 1.0.0
tags: [keyword, tags, for, agent, matching]

parameters:
  # Input parameters with business context
  
outputs:  
  # Key business metrics and KPIs
  
simulation:
  logic: |
    # JavaScript business logic
    # Must be self-contained (no external functions)
```

## Adding New Templates

1. **Create template** in `/simulations/` first (development workspace)
2. **Test thoroughly** with agent generation and execution
3. **Add BI metadata** using `generateBusinessIntelligence()` patterns  
4. **Validate completely** - must pass all validation checks
5. **Move to `/templates/`** only when production-ready
6. **Update documentation** including this README

## Validation Process

Templates are validated with:
```typescript
// 1. YAML syntax validation
const config = yaml.parse(content)

// 2. Schema validation  
const validation = this.validator.validateConfig(config)

// 3. Business logic validation
const logicValidation = this.validateSimulationLogic(config.simulation.logic)
```

## Business Intelligence Integration

Templates automatically generate BI metadata including:
- **Industry categories**: Based on name, tags, and parameters
- **Business model**: SaaS, B2B, B2C, Marketplace, B2B2C
- **Decision type**: investment, operational, strategic, tactical  
- **Risk profile**: low, medium, high
- **Time horizon**: short, medium, long
- **Agent optimization**: keywords, context hints, parameter priority

## Framework Integration

Templates are loaded by:
```typescript
class TemplateLibrary {
  constructor() {
    this.templatesPath = path.join(__dirname, '..', '..', '..', 'templates')
  }
  
  async loadTemplates() {
    // Loads and validates all .yaml/.yml files in this directory
  }
}
```

## Maintenance

- Templates should be updated when business intelligence patterns evolve
- Deprecated templates should be moved to `/archive/templates/`  
- Version bumps should follow semantic versioning
- Breaking changes require updating dependent agent workflows

For learning and examples, see `/examples/simulations/` instead.