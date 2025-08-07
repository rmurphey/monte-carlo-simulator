# Quick Reference - AI Investment ROI Analysis

## Super Short Commands

```bash
# Interactive mode (recommended)
npm run ai:i

# Quick scenarios  
npm run ai              # Baseline analysis
npm run ai:conservative # Conservative scenario
npm run ai:aggressive   # Aggressive scenario
```

## Interactive Mode Features

Launch with `npm run ai:i`, then:

- **📝 Adjust Parameters**: Real-time parameter tweaking
- **🚀 Quick Results**: Instant 200-iteration feedback  
- **🏃 Full Analysis**: Run 1000+ iterations when ready
- **💾 Save Parameters**: Export scenarios you discover
- **📤 Export Results**: Save to JSON/CSV for analysis
- **🔄 Reset**: Return to defaults anytime

## Parameter Files

```bash
# Create custom scenario
echo '{"initialCost": 30000, "adoptionRate": 0.9}' > startup.json

# Run with custom parameters
npm run ai -- --params startup.json --verbose
```

## Business Scenarios

### Startup (High Growth)
- Initial Cost: $30k
- Adoption: 80%  
- Revenue Impact: 25%
- Baseline Revenue: $500k

### Mid-Market (Balanced)
- Initial Cost: $60k
- Adoption: 65%
- Revenue Impact: 18%  
- Baseline Revenue: $5M

### Enterprise (Conservative)
- Initial Cost: $150k
- Adoption: 40%
- Revenue Impact: 10%
- Baseline Revenue: $50M

## Key Outputs

- **ROI (%)**: Return on investment over 36 months
- **Total Cost ($)**: All implementation + subscription costs
- **Net Benefit ($)**: Benefit - Cost  
- **Break-even Month**: When benefits exceed costs
- **Risk Score (1-5)**: Risk assessment (1=Low, 5=High)

## Tips

1. **Start interactive**: `npm run ai:i` for exploration
2. **Test adoption rates**: Most critical parameter
3. **Model implementation delays**: Reality check  
4. **Save good scenarios**: Build a parameter library
5. **Export for presentations**: JSON/CSV output ready

Perfect for strategic decisions, budget planning, and stakeholder presentations.