# Agent Beginner Guide: Creating Business Simulations

## What This Is For

This guide shows **complete beginners** how to use AI agents (like Claude, ChatGPT, etc.) to create business decision analysis with Monte Carlo simulations.

## The 30-Second Version

Tell any AI agent to run this command for you:

```bash
npx github:rmurphey/monte-carlo-simulator studio generate "Should we invest $100K in hiring 3 developers?" --test
```

The AI will generate a complete business analysis with probability ranges instead of single-point estimates.

## Step-by-Step Walkthrough

### Step 1: Ask Your AI Agent

Copy and paste this into Claude, ChatGPT, or any coding AI:

```
Please run this command for me and analyze the business decision:

npx github:rmurphey/monte-carlo-simulator studio generate "Should my startup invest $200K in AI tools for our 50-person development team?" --test
```

### Step 2: What Happens Next

The AI agent will:
1. **Generate** a complete business simulation from your question
2. **Test** it immediately to make sure it works
3. **Show results** like: *"75% chance of $400K+ annual savings, 20% chance of breaking even"*

### Step 3: Understanding the Output

Instead of "*AI tools will probably save money*" you get:
- **Probability ranges**: *75% chance of $400K+ savings*
- **Risk assessment**: *20% chance of breaking even* 
- **Confidence intervals**: *Expected ROI: 280% ± 65%*

## Example Business Questions That Work

```bash
# Technology decisions
npx github:rmurphey/monte-carlo-simulator studio generate "ROI of implementing CI/CD pipeline for 20 developers" --test

# Hiring decisions  
npx github:rmurphey/monte-carlo-simulator studio generate "Should we hire 5 junior devs or 3 senior devs?" --test

# Marketing decisions
npx github:rmurphey/monte-carlo-simulator studio generate "Marketing campaign ROI with $75K budget targeting B2B SaaS" --test

# Investment decisions
npx github:rmurphey/monte-carlo-simulator studio generate "Should we invest $500K in automation vs manual processes?" --test
```

## What Makes This Different

### Traditional Approach (Bad)
- *"Hiring 5 developers will increase productivity"* ← Single guess
- *"Marketing campaign will generate 10x ROI"* ← Overconfident  
- *"AI tools will save money"* ← Vague hope

### Monte Carlo Approach (Good)  
- *"5 developers: 70% chance of 2.5x productivity, 30% chance of <1.5x due to coordination overhead"*
- *"Marketing: 60% chance of 3-8x ROI, 40% chance of breaking even or loss"*
- *"AI tools: 75% chance of $200K+ savings, 15% chance of breaking even, 10% chance of $30K loss"*

## AI Agent Instructions (Copy/Paste Ready)

**For Claude/ChatGPT/etc:**

```
I need help analyzing a business decision using Monte Carlo simulation. 

Please run this command and help me interpret the results:
npx github:rmurphey/monte-carlo-simulator studio generate "[YOUR BUSINESS QUESTION HERE]" --test

Then explain:
1. What the probability ranges mean for my decision
2. What the biggest risks are  
3. Whether this looks like a good or bad investment
4. What additional factors I should consider

My question: [INSERT YOUR SPECIFIC BUSINESS DECISION]
```

## Common Business Questions by Role

### For CTOs/Engineering Leaders
```bash
# Team scaling analysis
"Should we hire 8 developers or invest $600K in automation tools?"

# Technology investment 
"ROI analysis of migrating to microservices architecture for 40-person team"

# Infrastructure decisions
"Cost-benefit analysis of moving to serverless vs scaling existing infrastructure"
```

### For Startup Founders
```bash  
# Resource allocation
"Should we spend $300K on marketing or hire 4 additional developers?"

# Product decisions
"ROI of building internal analytics vs using third-party tools"

# Growth strategy
"Should we expand to 2 new markets or focus on growing current market?"
```

### For Product Managers  
```bash
# Feature prioritization
"ROI analysis of building mobile app vs improving web experience"

# Market expansion
"Should we target enterprise customers or continue focusing on SMB?"

# Platform decisions
"Cost-benefit of building API platform vs focusing on core product"
```

## What You Get Back

Every analysis gives you:

### Financial Metrics
- **ROI**: Return on investment with confidence intervals
- **Payback Period**: How long until you recover costs
- **NPV**: Net present value over multiple years
- **Risk Scores**: Probability of different outcomes

### Risk Assessment  
- **Best Case**: 90th percentile outcomes
- **Expected Case**: Most likely outcomes (50th percentile)  
- **Worst Case**: 10th percentile outcomes
- **Probability of Loss**: Chance of negative returns

### Business Insights
- **Industry Benchmarks**: How your decision compares to standards
- **Key Risk Factors**: What could go wrong
- **Optimization Suggestions**: How to improve odds
- **Implementation Timeline**: Realistic deployment expectations

## Beyond Just Answers: Exploring and Modifying Simulations

The real power comes from **exploring and tweaking** the simulation, not just getting one answer.

### Step 1: Generate and Save Your Simulation
```bash
# Generate but don't just test - SAVE it so you can modify it
npx github:rmurphey/monte-carlo-simulator studio generate "Should we invest $200K in AI tools for 50 developers?" --output ai-investment.yaml
```

### Step 2: Examine the Generated Model
```bash
# Look at what the AI created for you
cat ai-investment.yaml
```

You'll see a complete business model with:
- **Parameters you can adjust**: budget, team size, productivity gains, adoption rates
- **Business logic**: the actual calculations and assumptions
- **Risk factors**: implementation timeline, execution variance

### Step 3: Run Interactive Exploration
```bash
# Run the simulation interactively - you can change parameters in real-time
npx github:rmurphey/monte-carlo-simulator run ai-investment.yaml --interactive
```

**This lets you:**
- Adjust the investment amount and see immediate impact
- Change team size assumptions 
- Modify productivity gain estimates
- Adjust adoption rates and timelines
- See results update in real-time as you explore

### Step 4: Modify the Simulation File Directly

Edit `ai-investment.yaml` to change:

```yaml
parameters:
  - key: initialInvestment
    default: 200000    # Change this to explore different budgets
    min: 50000         # Set your own ranges
    max: 1000000
    
  - key: affectedEmployees  
    default: 50        # Try different team sizes
    min: 10
    max: 200
    
  - key: productivityGain
    default: 15        # Adjust expected productivity improvement  
    min: 5             # Conservative estimate
    max: 40            # Optimistic estimate
```

### Step 5: Compare Scenarios Side by Side
```bash
# Create multiple versions to compare
cp ai-investment.yaml conservative-scenario.yaml
cp ai-investment.yaml aggressive-scenario.yaml

# Edit each file with different assumptions, then compare:
npx github:rmurphey/monte-carlo-simulator run conservative-scenario.yaml
npx github:rmurphey/monte-carlo-simulator run aggressive-scenario.yaml
```

## Real Example: Exploring an AI Tool Investment

Here's exactly what the exploration process looks like:

### 1. Generate Your Starting Point
```bash
npx github:rmurphey/monte-carlo-simulator studio generate "ROI of $150K AI coding assistant for 30 developers" --output ai-tools.yaml
```

### 2. Look at What Was Generated
The AI creates a complete model with parameters like:
- `initialInvestment: 150000` (your budget)
- `affectedEmployees: 30` (team size) 
- `productivityGain: 15` (expected 15% productivity boost)
- `adoptionRate: 85` (85% of developers will use it effectively)
- `implementationMonths: 6` (rollout timeline)

### 3. Ask "What If" Questions by Changing Parameters

**What if adoption is lower?**
```bash
# Edit ai-tools.yaml, change adoptionRate from 85 to 60
npx github:rmurphey/monte-carlo-simulator run ai-tools.yaml
# Result: ROI drops from 280% to 180%
```

**What if we invest more in training?**
```bash
# Change initialInvestment to 200000, implementationMonths to 4  
npx github:rmurphey/monte-carlo-simulator run ai-tools.yaml
# Result: Higher upfront cost but faster payback
```

**What if productivity gains are higher?**
```bash
# Change productivityGain from 15 to 25
npx github:rmurphey/monte-carlo-simulator run ai-tools.yaml  
# Result: See how much ROI improves with better tools
```

### 4. Interactive Real-Time Exploration
```bash
# Launch interactive mode to adjust parameters with immediate feedback
npx github:rmurphey/monte-carlo-simulator run ai-tools.yaml --interactive
```

In interactive mode, you can:
- Move sliders to change investment amount
- Adjust team size and see breakeven points  
- Modify productivity assumptions in real-time
- Find the optimal investment level for your situation

### 5. Compare Different Strategies
```bash
# Conservative approach: lower expectations
# Edit: productivityGain: 10, adoptionRate: 70, implementationMonths: 8
npx github:rmurphey/monte-carlo-simulator run ai-tools.yaml --output conservative-results.json

# Aggressive approach: higher expectations  
# Edit: productivityGain: 25, adoptionRate: 95, implementationMonths: 3
npx github:rmurphey/monte-carlo-simulator run ai-tools.yaml --output aggressive-results.json

# Compare the risk/reward profiles
```

## Why This Matters More Than Just Getting Answers

### Traditional Consulting Approach
- Pay $10K for a report
- Get one number: "*ROI will be 280%*"
- Can't explore alternatives
- Can't test your assumptions

### Interactive Monte Carlo Approach  
- Generate unlimited scenarios
- Test every assumption: "*What if adoption is only 60% instead of 85%?*"
- Find breakeven points: "*At what team size does this become profitable?*"
- Optimize decisions: "*Should we invest $100K or $200K?*"
- Understand risks: "*What's the worst-case scenario?*"

**The simulation becomes your business modeling sandbox** - not just a one-time calculation.

## Advanced Usage

Once you're comfortable, you can:

### Compare Different Scenarios
```bash
# Generate multiple options
npx github:rmurphey/monte-carlo-simulator studio generate "hiring 3 senior devs" --output option-a.yaml
npx github:rmurphey/monte-carlo-simulator studio generate "hiring 6 junior devs" --output option-b.yaml

# Compare results
npx github:rmurphey/monte-carlo-simulator run option-a.yaml
npx github:rmurphey/monte-carlo-simulator run option-b.yaml
```

### Interactive Mode
```bash
# Browse all available simulations
npx github:rmurphey/monte-carlo-simulator interactive
```

## Troubleshooting

### "Command not found" 
Make sure your AI agent can run terminal commands. Most can, but some require specific setup.

### "Simulation seems wrong"
The AI generates simulations based on your question. More specific questions get better results:
- ❌ *"Should we hire people?"*
- ✅ *"Should we hire 3 senior developers at $150K each for our 50-person SaaS startup?"*

### "Results don't make sense"
Remember: this shows probability ranges, not guarantees. A 70% chance of success means 30% chance of problems.

## Getting Started Right Now

1. **Open your AI agent** (Claude, ChatGPT, etc.)
2. **Copy this exact text**:
```
Please run this command to analyze a business decision for me:

npx github:rmurphey/monte-carlo-simulator studio generate "Should I invest $50K in marketing automation for my 10-person B2B SaaS startup?" --test

Then explain what the results mean and whether this looks like a good investment.
```
3. **Replace the question** with your actual business decision
4. **Send it** to your AI agent

That's it! You'll get back a complete risk-adjusted analysis instead of gut-feeling guesses.

## Why This Matters

**Before**: *"Marketing will probably work"* → Spend $50K hoping for the best  
**After**: *"Marketing: 65% chance of 3-8x ROI, 35% chance of breaking even"* → Make data-driven decisions

Turn risky business guesses into confident decisions with actual probability ranges.

## Using AI Agents to Help You Explore

Don't want to edit YAML files manually? Ask your AI agent to help:

### Ask for Parameter Adjustments
```
I have this simulation file ai-tools.yaml. Can you:

1. Show me how to make the assumptions more conservative
2. Create a version where we test different budget levels ($100K, $150K, $200K) 
3. Help me understand which parameters have the biggest impact on ROI

Here's my current file: [paste the YAML content]
```

### Ask for Scenario Comparisons  
```
I want to compare 3 scenarios for this AI tool investment:

1. Conservative: Lower productivity gains, slower adoption
2. Realistic: Current assumptions  
3. Aggressive: Higher productivity gains, faster adoption

Can you help me create these 3 versions and run them?

My base simulation: [paste YAML]
```

### Ask for Interactive Exploration Guidance
```
I'm running this simulation interactively:
npx github:rmurphey/monte-carlo-simulator run ai-tools.yaml --interactive

What parameters should I focus on adjusting to:
- Find the minimum viable investment
- Understand the biggest risk factors  
- Optimize for best risk-adjusted return

Guide me through the exploration process.
```

**The key insight**: You're not just getting one answer - you're getting a complete business model you can explore, modify, and optimize for your specific situation.