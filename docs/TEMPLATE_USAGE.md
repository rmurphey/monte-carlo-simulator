# Template System Usage Guide

## 🎯 For Agents: Template-Driven Generation

### Natural Language → YAML Generation
The framework provides intelligent template selection for agent-driven simulation creation:

```bash
# Agent generates YAML from natural language
npm run cli studio generate "B2B SaaS marketing campaign ROI analysis"
npm run cli studio generate "Software investment ROI for development team"
npm run cli studio generate "Team scaling decision for startup"
```

### How Agent Template Selection Works

1. **Intent Analysis**: Natural language query parsed for business intent
2. **Multi-Factor Scoring**: Templates scored using business intelligence metadata:
   - **Intent matching** (40% weight): Keywords, business context
   - **Industry context** (30% weight): SaaS, Technology, Marketing, etc.
   - **Business model** (20% weight): B2B, B2C, SaaS, Marketplace  
   - **Keyword relevance** (10% weight): Query terms vs template keywords

3. **Template Selection**: Highest-scoring template used for generation
4. **Context-Aware Generation**: Parameters adjusted based on inferred business context

### Template Library Source
```typescript
// TemplateLibrary loads from /templates/ directory
this.templatesPath = path.join(__dirname, '..', '..', '..', 'templates')
```

**System Templates**: `/templates/` directory contains production-ready templates optimized for agent workflows.

---

## 🧑‍💼 For Humans: Template Creation & Validation

### Template Creation Workflow

1. **Start in Development**: Create templates in `/simulations/` workspace
2. **Test & Iterate**: No validation requirements, full development freedom
3. **Validate**: Use comprehensive validation before promoting to system templates
4. **Promote**: Move tested templates to `/templates/` for agent use

### Template Validation Process

Templates must pass three validation layers:

```typescript
// 1. YAML Syntax Validation
const config = yaml.parse(content)

// 2. JSON Schema Validation  
const schemaValidation = this.validator.validateConfig(config)

// 3. Business Logic Validation
const logicValidation = this.validateSimulationLogic(config.simulation.logic)
```

### Comprehensive Template Structure

```yaml
name: "Business-focused simulation name"
category: "Marketing & Growth" | "Technology Investment" | "Business"
description: "Detailed business description (10-500 chars)"
version: "1.0.0"
tags: [business, keywords, for, agent, matching]

parameters:
  - key: parameterName
    label: "Human-readable label"
    type: number | select | boolean
    default: defaultValue
    min: minimumValue      # For numbers
    max: maximumValue      # For numbers  
    step: stepValue        # For numbers
    options: [opt1, opt2]  # For select
    description: "Business context and usage"

groups:  # Optional: Organize related parameters
  - name: "Parameter Group Name"
    description: "Group description"
    parameters: [param1, param2]

outputs:
  - key: outputName
    label: "Business metric name"
    description: "What this metric represents for business decisions"

simulation:
  logic: |
    // Self-contained JavaScript (no external functions)
    // Use random() for Monte Carlo uncertainty
    // Return object matching output keys
    
    const calculation = parameter * (0.8 + random() * 0.4) // ±20% variance
    
    return {
      outputName: Math.round(calculation * 100) / 100
    }
```

### Business Intelligence Metadata

Templates automatically generate BI metadata for agent optimization:

- **Industry Classification**: Based on name, tags, and parameter patterns
- **Business Model**: SaaS, B2B, B2C, Marketplace, B2B2C  
- **Decision Type**: investment, operational, strategic, tactical
- **Risk Profile**: low, medium, high
- **Time Horizon**: short, medium, long
- **Agent Keywords**: For natural language matching

### Validation Requirements

#### ✅ Required Elements
- Name, category, description, version, tags
- At least 1 parameter and 1 output
- Working JavaScript simulation logic
- All referenced parameters defined
- Valid YAML syntax and schema compliance

#### ❌ Common Issues
```yaml
# ❌ Invalid - undefined functions
simulation:
  logic: |
    return { roi: calculateROI(investment, returns) }  # calculateROI not defined

# ✅ Valid - self-contained logic  
simulation:
  logic: |
    const roi = returns > 0 ? ((returns - investment) / investment) * 100 : -100
    return { roi: Math.round(roi * 10) / 10 }
```

```yaml
# ❌ Invalid - unquoted strings with special characters
description: Marketing spend as % of ARR (B2B: 8-15%, B2C: 15-25%)

# ✅ Valid - properly quoted
description: "Marketing spend as % of ARR (B2B: 8-15%, B2C: 15-25%)"
```

---

## 📁 Directory Usage

### `/templates/` - System Templates (Production)
- **Used by**: TemplateLibrary, Agent workflows
- **Purpose**: Production-ready templates for intelligent selection
- **Requirements**: Full validation, BI metadata, production testing
- **Modification**: Restricted - affects agent workflows

### `/examples/` - Learning Examples (Documentation) 
- **Used by**: New users, documentation, tutorials
- **Purpose**: Educational examples with extensive documentation
- **Requirements**: Clarity over efficiency, comprehensive comments
- **Modification**: Focus on teaching framework concepts

### `/simulations/` - User Workspace (Development)
- **Used by**: End users, development teams
- **Purpose**: Custom simulations, experimentation, organization-specific models  
- **Requirements**: None - full development freedom
- **Modification**: User-controlled, no system impact

## 🚀 Quick Start Examples

### Agent Generation (Natural Language)
```bash
# Marketing analysis
npm run cli studio generate "B2B SaaS customer acquisition campaign"

# Investment decisions  
npm run cli studio generate "Software development tool ROI analysis"

# Strategic planning
npm run cli studio generate "Team scaling decision for growing startup"
```

### Human Template Development
```bash
# 1. Create in development workspace
vim simulations/my-business-analysis.yaml

# 2. Test during development
npm run cli run simulations/my-business-analysis.yaml

# 3. Validate before promoting
npm run cli studio generate "test my template" --validate

# 4. Promote to system templates (if needed for agents)
cp simulations/my-business-analysis.yaml templates/
```

### Template Execution
```bash  
# Run system templates
npm run cli run templates/marketing-campaign-roi.yaml
npm run cli run templates/software-investment-roi.yaml

# Run examples for learning
npm run cli run examples/simulations/ai-tool-adoption/baseline.yaml

# Run your custom simulations
npm run cli run simulations/my-custom-analysis.yaml
```

This system provides both powerful agent automation and flexible human development workflows.