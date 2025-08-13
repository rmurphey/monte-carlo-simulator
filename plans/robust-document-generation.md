# Robust Document Generation Plan

## Problem Statement

The current document generation system has hardcoded logic for specific simulation types and metric names, making it fragile for new simulations. It won't reliably work for all current and future simulations because:

1. **Hardcoded simulation type detection** - Only handles `roi`, `qa`, `testing`, `team`, `technology` patterns
2. **Hardcoded metric name matching** - Looks for specific metric names that may not exist in other simulations  
3. **No fallback for unknown simulation types** - New simulation types won't get proper narrative sections
4. **Brittle metric key matching** - Uses exact string matches that break when simulation authors use different naming conventions

## Proposed Solution

### 1. Dynamic Content Generation Based on Simulation Config

Instead of hardcoded type detection, use the simulation's own metadata:

```typescript
// Use config metadata for narrative generation
const businessQuestion = config.businessQuestion || generateQuestionFromDescription(config.description)
const modelOverview = config.modelOverview || generateGenericOverview(config, results)
```

### 2. Flexible Metric Analysis

Analyze available metrics dynamically instead of hardcoded lookups:

```typescript
// Categorize metrics by common patterns
const metricCategories = {
  roi: findMetricsByPattern(summary, /roi|return/i),
  cost: findMetricsByPattern(summary, /cost|expense/i),  
  benefit: findMetricsByPattern(summary, /benefit|saving|value/i),
  time: findMetricsByPattern(summary, /time|period|duration/i),
  risk: findMetricsByPattern(summary, /risk|variance|deviation/i)
}
```

### 3. Enhanced Simulation Schema

Extend the YAML schema to support narrative metadata:

```yaml
name: "Custom Analysis"
description: "..."
businessQuestion: "Should we proceed with this initiative and what are the risks?"
modelOverview: "This model evaluates... by considering..."
narrativeHints:
  - primary_metric: "totalValue"
  - risk_indicators: ["variance", "downside"]
  - key_tradeoffs: ["cost_vs_benefit", "speed_vs_quality"]
```

### 4. Fallback Content Generation

Robust fallbacks for when metadata is missing:

```typescript
private generateRobustNarrative(config, parameters, results) {
  // 1. Try explicit config
  if (config.businessQuestion) return config.businessQuestion
  
  // 2. Try pattern-based detection (current approach)  
  const patternBased = this.generateByPattern(config, parameters)
  if (patternBased) return patternBased
  
  // 3. Generate from description + parameters
  return this.generateFromContext(config.description, parameters, results)
}
```

## Implementation Plan

### Phase 1: Immediate Robustness (1-2 hours)
- [ ] Add generic fallback narrative that works for any simulation
- [ ] Implement flexible metric discovery using regex patterns
- [ ] Add error handling for missing metrics
- [ ] Test with all existing simulations

### Phase 2: Dynamic Content System (3-4 hours)  
- [ ] Extend YAML schema with optional narrative fields
- [ ] Implement dynamic metric categorization
- [ ] Add parameter-based question generation
- [ ] Create narrative templates for common business scenarios

### Phase 3: Advanced Narrative Intelligence (Future)
- [ ] ML-based content generation from simulation structure
- [ ] Auto-detect simulation intent from parameters and outputs
- [ ] Generate context-aware insights and recommendations
- [ ] Support for custom narrative templates per simulation

## Success Criteria

1. **All existing simulations** generate meaningful narratives without code changes
2. **New simulations** work out-of-the-box with reasonable default narratives
3. **Simulation authors** can optionally enhance narratives with YAML metadata
4. **Zero breaking changes** to existing simulation configurations
5. **Performance** remains acceptable (< 100ms additional processing time)

## Testing Strategy

- Test all existing simulations in examples/ and simulations/ directories
- Create test simulations with unusual metric names and structures
- Verify fallback behavior with minimal simulation configs
- Performance benchmark with large result sets

## Risk Mitigation

- Keep current hardcoded logic as fallback to prevent regressions
- Gradual rollout with feature flag for new narrative system
- Comprehensive test coverage before removing old logic