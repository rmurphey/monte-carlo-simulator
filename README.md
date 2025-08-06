# Agent-Friendly Monte Carlo Simulation Framework

A framework optimized for **AI agents** to rapidly create strategic business simulations through **declarative YAML configuration**. Designed to transform conversational questions like "When does generative AI cost outweigh benefits?" into rigorous Monte Carlo analysis.

## 🎯 Purpose

**Enable AI agents (like Claude Code) to generate strategic decision support simulations from natural language questions.**

Instead of manually coding simulations, agents can create sophisticated business analysis through configuration:

```yaml
name: "Generative AI Cost-Benefit Analysis"
category: "Technology Investment"
description: "Monte Carlo analysis of when AI tool costs exceed productivity benefits"
tags: ["ai", "cost-benefit", "strategy"]

parameters:
  - key: teamSize
    label: "Development Team Size"
    type: number
    default: 25
    min: 5
    max: 200

  - key: aiToolCostPerDev
    label: "AI Tool Cost per Developer ($/month)"
    type: number
    default: 20
    min: 10
    max: 100

outputs:
  - key: breakEvenMonth
    label: "Break-even Timeline (months)"
    description: "When AI costs start exceeding productivity benefits"

simulation:
  logic: |
    const monthlyAICost = teamSize * aiToolCostPerDev
    const productivityBenefit = teamSize * 8000 * 0.15  // 15% productivity gain
    const netBenefit = productivityBenefit - monthlyAICost
    
    return {
      breakEvenMonth: monthlyAICost / productivityBenefit
    }
```

## ⚡ Quick Start

**For AI Agents:**
```bash
# Generate simulation from strategic question
npx monte-carlo-simulator generate "When does generative AI cost outweigh benefits?"

# Run configuration-based simulation
npx monte-carlo-simulator run ai-cost-benefit-analysis.yaml --iterations 10000
```

**For Direct Use:**
```bash
# Run existing strategic simulations
npx monte-carlo-simulator run marketing-campaign-roi --compare conservative,aggressive
npx monte-carlo-simulator run software-project-timeline --scenario optimistic
```

## 🤖 Agent Integration

This framework is specifically designed for AI agents to create simulations through conversation:

### **Agent Workflow:**
1. **Question Analysis**: Agent parses strategic business questions
2. **Configuration Generation**: Agent creates YAML simulation config
3. **Parameter Refinement**: Interactive parameter adjustment through dialog
4. **Execution**: Monte Carlo simulation with business intelligence
5. **Strategic Insights**: Results formatted for executive decision-making

### **Supported Question Types:**
- **Technology Investment**: "Should we adopt AI coding tools?"
- **Resource Planning**: "Optimal team scaling strategy for next quarter?"
- **Timing Decisions**: "When to migrate to microservices architecture?"
- **Cost-Benefit Analysis**: "ROI of hiring 5 developers vs buying automation tools?"
- **Risk Assessment**: "What's our runway at current burn rate with market volatility?"

## 🧠 Business Intelligence Features

**Automatic Context Injection:**
- **ARR-based budgeting** that scales with company size
- **Strategic business functions**: ROI, payback period, runway calculation, NPV
- **Industry benchmarks** and realistic parameter validation
- **Scenario analysis**: Conservative/Neutral/Aggressive risk modeling

**Agent-Optimized:**
- **Config-first approach**: 90% of simulations through YAML, custom code when needed
- **Smart business context detection**: Automatically injects ARR/business functions for strategic simulations
- **Conversational refinement**: Easy parameter adjustment through dialog
- **Executive reporting**: Results formatted for C-level strategic decisions

## 📊 Example Agent-Generated Simulations

### Technology Investment Analysis
```yaml
name: "AI Adoption ROI Analysis"
businessContext: true  # Automatically injects ARR context
parameters:
  - key: toolCostsPerDev
    default: 30
    description: "Monthly cost per developer for AI tools"
simulation:
  logic: |
    const totalMonthlyCost = teamSize * toolCostsPerDev
    const productivityGain = calculateROI(arrBudget * 0.1, totalMonthlyCost * 12)
    return { roi: productivityGain, paybackMonths: calculatePaybackPeriod(totalMonthlyCost * 12, totalMonthlyCost) }
```

### Team Scaling Decision
```yaml
name: "Development Team Scaling Analysis"
parameters:
  - key: newHires
    label: "Additional Developers to Hire"
    default: 5
simulation:
  logic: |
    const hiringCost = newHires * 120000  // Annual salary
    const coordinationOverhead = (currentTeamSize + newHires) * 0.15 * 120000
    const featureVelocityGain = newHires * 0.8 * 52  // Features per year accounting for coordination
    return { totalCost: hiringCost + coordinationOverhead, featureGain: featureVelocityGain }
```

## 🛠 Framework Architecture

### **Agent-Friendly Design:**
- **Declarative Configuration**: YAML-first simulation creation
- **Business Context Injection**: Automatic ARR/business intelligence functions
- **Formula Evaluation**: Rich expression language for business calculations
- **Extensible**: Custom TypeScript for complex logic when needed

### **Core Components:**
```
src/
├── framework/
│   ├── ConfigurableSimulation.ts    # YAML-driven simulation engine
│   ├── ARRBusinessContext.ts        # Business intelligence injection
│   ├── base/BusinessSimulation.ts   # Strategic business calculations
│   └── MonteCarloEngine.ts          # Statistical analysis engine
├── cli/
│   ├── commands/                    # Generation and execution commands  
│   └── interactive/                 # Conversational parameter refinement
└── examples/
    └── strategic-simulations/       # Agent-generated examples
```

## 📈 Strategic Simulation Examples

**Current Working Simulations:**
- **[Marketing Campaign ROI](examples/simulations/marketing-campaign-roi/)** - ARR-scaled budget allocation and customer acquisition analysis
- **[Software Project Timeline](examples/simulations/software-project-timeline/)** - Feature velocity and team coordination modeling
- **[Technology Investment Analysis](examples/simulations/ai-investment-analysis/)** - Cost-benefit analysis for strategic technology decisions

## 🚀 Getting Started

### For AI Agents
1. **Analyze** strategic business question
2. **Generate** YAML configuration using framework patterns
3. **Execute** simulation with business context
4. **Refine** parameters through conversational feedback
5. **Report** results for strategic decision-making

### For Direct Use
```bash
npm install -g monte-carlo-simulator

# Create new simulation through conversation
monte-carlo-simulator create --interactive "Strategic Analysis"

# Run existing strategic analysis
monte-carlo-simulator run marketing-campaign-roi --scenario conservative
```

## 🎯 Success Criteria

**Agent Optimization Targets:**
- **<5 minutes**: AI agent generates working simulation from strategic question
- **90% config-driven**: Simulations created through YAML without custom code  
- **Strategic relevance**: Results influence real CTO-level decisions
- **Business accuracy**: Industry-standard KPIs and realistic parameters

## 📋 Current Status

- ✅ **Agent-Ready Framework**: YAML configuration system with business intelligence
- ✅ **Strategic Business Functions**: ROI, payback, runway, NPV calculations
- ✅ **Automatic Context Detection**: Smart ARR injection for business simulations
- ✅ **Test Coverage**: 51 passing tests with full framework validation
- ✅ **Professional CLI**: Colorized output with scenario comparison
- 📋 **Implementation Phase**: Converting completed designs into conversational generation

## 🔮 Vision

**Transform strategic questions into rigorous quantitative analysis through AI agent conversation.**

Questions like:
- *"When does generative AI cost outweigh benefits?"*
- *"Should we hire 5 developers or invest in automation?"*  
- *"What's the optimal team scaling strategy?"*
- *"When should we migrate to microservices?"*

Become **working Monte Carlo simulations** that provide **data-driven strategic insights** for executive decision-making.

## 🤝 Contributing

This project is designed for AI-assisted development. Agents can:
- Generate new simulation configurations
- Improve existing business logic patterns
- Add industry-specific calculation functions
- Create strategic analysis templates

## 📄 License

[Add appropriate license information]

---

*Built for AI agents to democratize strategic business analysis through conversation.*