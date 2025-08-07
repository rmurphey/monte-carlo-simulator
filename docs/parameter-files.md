# Parameter Files

Parameter files allow you to customize simulation inputs without modifying the original YAML configurations. This is essential for running the same simulation with different business scenarios, sensitivity analysis, and batch processing.

## Usage

```bash
# Run simulation with custom parameters
npm run cli run <simulation.yaml> --params <parameters.json>

# Example with AI investment analysis
npm run cli run simulations/ai-investment-roi/baseline.yaml --params my-scenario.json --verbose
```

## Parameter File Format

Parameter files are JSON documents containing key-value pairs that override simulation defaults:

```json
{
  "initialCost": 75000,
  "monthlySubscription": 7500,
  "implementationTime": 8,
  "adoptionRate": 0.6,
  "revenueImpact": 0.20,
  "costSavings": 35000,
  "baselineRevenue": 2000000
}
```

## Features

- **Type Safety**: Values are automatically converted to the correct type (number, boolean, string)
- **Validation**: Only parameters defined in the simulation are accepted
- **Partial Override**: Include only the parameters you want to change
- **Warning System**: Alerts for undefined parameters without failing the simulation

## Workflow Integration

Parameter files integrate with all CLI features:

```bash
# Verbose analysis with custom parameters
npm run cli run simulation.yaml --params custom.json --verbose --iterations 5000

# Save results with custom scenario
npm run cli run simulation.yaml --params scenario.json --output results.json --format json

# Compare scenarios
npm run cli run simulation.yaml --params conservative.json --quiet
npm run cli run simulation.yaml --params aggressive.json --quiet
```

## Business Use Cases

1. **Scenario Planning**: Model optimistic, realistic, and pessimistic cases
2. **Sensitivity Analysis**: Test how parameter changes affect outcomes
3. **Batch Processing**: Run multiple scenarios programmatically
4. **Client Presentations**: Customize analysis for different stakeholder groups
5. **A/B Testing**: Compare different strategic approaches

This feature makes the Monte Carlo framework suitable for production business analysis workflows.