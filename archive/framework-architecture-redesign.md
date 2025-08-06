# Framework Architecture Redesign

## Executive Summary

The Monte Carlo Simulation Framework has identified **57% code duplication** across scenarios, creating maintenance burden and development friction. This design implements a **BaseSimulation inheritance system** to eliminate duplication while enabling rapid creation of new business scenarios.

## Problem Analysis

### Current Code Duplication Patterns

**1. Massive Parameter Duplication**
- Restaurant scenarios: 263 lines of identical parameters across conservative/neutral/aggressive variants
- Marketing scenarios: Similar parameter definitions repeated with only default value changes
- Every scenario redefines: outputs, groups, simulation logic patterns

**2. Logic Duplication** 
- **Core business calculations repeated**: location multipliers, cuisine factors, utilization calculations
- **Industry KPI calculations duplicated**: food cost %, labor cost %, revenue per seat
- **ARR framework injection repeated** across business scenarios
- **Scenario variation logic duplicated**: conservative vs aggressive parameter adjustments

**3. Configuration Overhead**
- **Parameter groups redefined** for every scenario variation
- **Output definitions identical** across scenario families
- **Validation logic duplicated** in multiple simulation files

### Quantified Impact
- **Restaurant family**: 3 scenarios × 263 lines = 789 lines → can be reduced to ~200 lines (74% reduction)
- **Marketing family**: 4 scenarios with similar duplication patterns
- **Overall framework**: Estimated 57% code reduction achievable

## Architecture Solution

### 1. BaseSimulation Inheritance Hierarchy

```typescript
// Base class for all simulations
abstract class BaseSimulation {
  protected config: SimulationConfig
  protected parameters: ParameterValues
  
  abstract defineParameters(): ParameterDefinition[]
  abstract defineOutputs(): OutputDefinition[]
  abstract calculateScenario(): ScenarioResults
  
  // Common utilities available to all simulations
  protected random(): number
  protected round(value: number): number
  protected min(a: number, b: number): number
  protected max(a: number, b: number): number
}

// Business-specific base classes
abstract class BusinessSimulation extends BaseSimulation {
  // ARR framework automatically available
  protected getARRBudget(category: string, percentage: number): number
  protected calculateROI(investment: number, returns: number): number
  protected generateBusinessKPIs(): Record<string, number>
}

abstract class RestaurantSimulation extends BusinessSimulation {
  // Restaurant-specific common logic
  protected calculateLocationImpact(quality: LocationQuality): number
  protected calculateCuisineFactors(type: CuisineType): CuisineFactors
  protected calculateFoodCosts(revenue: number, target: number): number
  protected calculateLaborCosts(staff: number, wage: number): number
  protected generateRestaurantKPIs(): RestaurantKPIs
}
```

### 2. Scenario Variation System

```typescript
// Scenario strategy pattern
interface ScenarioStrategy {
  name: string
  description: string
  parameterAdjustments: Record<string, ParameterAdjustment>
  calculationAdjustments: CalculationAdjustments
}

class RestaurantConservativeStrategy implements ScenarioStrategy {
  name = "Conservative Restaurant Strategy"
  parameterAdjustments = {
    startupCosts: { multiplier: 0.8, description: "20% below market average" },
    averageTicket: { multiplier: 0.85, description: "Competitive pricing" },
    // ... other adjustments
  }
  calculationAdjustments = {
    utilizationRange: [0.25, 0.45], // More conservative utilization
    seasonalVariance: 0.15,         // Lower seasonal impact
    // ... other calculation adjustments
  }
}
```

### 3. Template Generation System

```typescript
// Dynamic scenario generation
class ScenarioTemplateGenerator {
  static generateRestaurantScenarios(): SimulationConfig[] {
    const baseRestaurant = new RestaurantSimulationTemplate()
    const strategies = [
      new RestaurantConservativeStrategy(),
      new RestaurantNeutralStrategy(), 
      new RestaurantAggressiveStrategy()
    ]
    
    return strategies.map(strategy => 
      baseRestaurant.generateScenario(strategy)
    )
  }
}
```

## Implementation Architecture

### Phase 1: Foundation Classes

**BaseSimulation Class**
- Abstract base with common Monte Carlo utilities
- Parameter validation and type safety
- Standard output formatting and KPI calculation
- Error handling and edge case management

**BusinessSimulation Class**
- ARR framework integration built-in
- Standard business KPI calculations (ROI, payback, margins)
- Industry benchmark validation
- Scenario comparison utilities

### Phase 2: Industry-Specific Classes

**RestaurantSimulation Class**
- Location impact calculation (6 quality tiers)
- Cuisine type operational factors (4 categories)
- Industry-standard cost calculations (food, labor, utilities)
- Restaurant-specific KPIs (revenue per seat, table turns, etc.)

**SaaSSimulation Class**
- MRR/ARR calculations and projections
- Churn modeling and retention analysis
- CAC:LTV optimization
- Subscription business metrics

**MarketingSimulation Class**
- Multi-channel attribution modeling
- Customer acquisition cost optimization
- Lifetime value calculations
- Campaign ROI analysis

### Phase 3: Scenario Strategy System

**Strategy Pattern Implementation**
- Conservative/Neutral/Aggressive parameter sets
- Risk-adjusted calculation modifiers
- Market assumption variations
- Outcome confidence intervals

## Benefits Analysis

### Development Velocity
- **New restaurant scenario**: 5 minutes vs 2-3 hours currently
- **New industry simulation**: 1-2 days vs 1-2 weeks currently
- **Template library expansion**: 20+ scenarios possible vs current 6

### Code Quality
- **Single source of truth** for business logic
- **Consistent calculation methods** across all scenarios
- **Centralized bug fixes** benefit all scenarios
- **Type safety** for all parameter interactions

### Maintainability 
- **57% code reduction** improves readability and reduces maintenance burden
- **Inheritance testing** validates all scenarios automatically
- **Business logic updates** propagate to all derived scenarios
- **Consistent API** for all simulation interactions

### Business Impact
- **Rapid scenario creation** enables quick business analysis
- **Consistent methodology** across all business intelligence outputs
- **Template quality** improves through centralized logic
- **Industry expansion** becomes feasible (manufacturing, healthcare, etc.)

## File Structure

```
src/framework/
├── base/
│   ├── BaseSimulation.ts           # Core simulation abstract class
│   ├── BusinessSimulation.ts       # Business intelligence base class
│   └── SimulationStrategy.ts       # Strategy pattern interfaces
├── industries/
│   ├── RestaurantSimulation.ts     # Restaurant business logic
│   ├── SaaSSimulation.ts          # SaaS business logic  
│   ├── MarketingSimulation.ts     # Marketing business logic
│   └── ManufacturingSimulation.ts # Manufacturing business logic
├── strategies/
│   ├── restaurant/                # Restaurant scenario strategies
│   ├── saas/                     # SaaS scenario strategies
│   └── marketing/                # Marketing scenario strategies
└── generators/
    ├── ScenarioGenerator.ts       # Dynamic scenario generation
    └── TemplateLibrary.ts         # Enhanced template management
```

## Migration Strategy

### Phase 1: Foundation (Week 1-2)
1. Create BaseSimulation abstract class with Monte Carlo utilities
2. Create BusinessSimulation class with ARR framework
3. Migrate one restaurant scenario to validate architecture
4. Test framework with existing CLI and web interface

### Phase 2: Industry Classes (Week 3-4)
1. Implement RestaurantSimulation with all business logic
2. Create scenario strategy system for conservative/neutral/aggressive
3. Generate restaurant scenarios dynamically
4. Validate against existing restaurant scenario outputs

### Phase 3: Framework Expansion (Week 5-6)
1. Implement SaaSSimulation and MarketingSimulation classes
2. Create comprehensive strategy library
3. Update CLI template system to use new architecture
4. Create migration utilities for existing scenarios

### Phase 4: Testing & Documentation (Week 7)
1. Comprehensive test suite for all base classes
2. Performance benchmarks vs current implementation
3. Update all documentation and examples
4. Create developer guide for adding new industries

## Success Metrics

### Technical Metrics
- **Code reduction**: Target 57% reduction in simulation logic
- **Development time**: New scenarios in <30 minutes
- **Test coverage**: >90% coverage for all base classes
- **Performance**: No regression in simulation execution time

### Business Metrics
- **Template library**: 20+ production-ready scenarios
- **Industry coverage**: 6+ industry verticals
- **User adoption**: Faster onboarding and scenario creation
- **Quality consistency**: Standardized business intelligence across all scenarios

## Risk Mitigation

### Technical Risks
- **Breaking changes**: Maintain backward compatibility with ConfigurableSimulation
- **Performance impact**: Benchmark inheritance overhead
- **Complexity management**: Clear inheritance documentation and examples

### Business Risks
- **Migration effort**: Gradual migration with parallel systems
- **User disruption**: Maintain existing CLI/web interfaces during transition
- **Quality regression**: Comprehensive validation against existing outputs

## Conclusion

The BaseSimulation inheritance architecture provides a scalable foundation for the Monte Carlo Framework's evolution into a comprehensive business intelligence platform. The 57% code reduction, combined with rapid scenario creation capabilities, positions the framework for expansion across multiple industries while maintaining the high-quality business intelligence that users expect.

This architecture transforms simulation development from a time-intensive manual process to a systematic, template-driven approach that scales with business needs.