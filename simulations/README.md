# User Simulations Directory

This directory is for **your custom simulation files**.

## Purpose

- 📁 **User workspace**: Create your own `.yaml` simulation files here
- 🚫 **Not tracked in git**: Your custom simulations stay private
- 📋 **Templates available**: All examples are in `examples/simulations/`

## Getting Started

1. **Copy a template**:
   ```bash
   cp examples/simulations/simple-roi-analysis.yaml simulations/my-analysis.yaml
   ```

2. **Edit your simulation**:
   - Modify parameters for your business
   - Change investment amounts, team sizes, etc.

3. **Run your custom analysis**:
   ```bash
   npx monte-carlo-simulator run my-analysis.yaml
   ```

## Available Templates

Browse all templates with:
```bash
npx monte-carlo-simulator list
```

Templates include:
- ROI Analysis
- Team Scaling Decisions  
- Technology Investments
- Marketing Campaign ROI
- QA Strategy Comparison
- Sales Team Effectiveness
- AI Cost Impact Analysis

## File Organization

```
simulations/           # ← Your custom files (gitignored)
├── my-analysis.yaml
├── company-roi.yaml
└── team-decision.yaml

examples/simulations/  # ← Framework templates (part of package)
├── simple-roi-analysis.yaml
├── technology-investment.yaml
└── ...
```

Start by copying any template from `examples/simulations/` and customizing it for your needs!