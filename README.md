# Monte Carlo Simulation Framework

A comprehensive TypeScript/React framework for building and running Monte Carlo simulations with dynamic parameter interfaces and interactive visualizations.

## Features

- **Modular Framework**: Extensible architecture for building multiple simulation types
- **Dynamic Parameter Forms**: Auto-generated UI from parameter schemas with validation
- **Interactive Visualizations**: Statistical summaries, distributions, time series, and scatter plots  
- **Comprehensive Testing**: 34+ tests covering all framework components
- **Type Safety**: Full TypeScript implementation with strict mode
- **Real-time Progress**: Live updates during long-running simulations
- **Advanced Search**: Registry system with filtering, tagging, and categorization

## Current Simulation: AI Tool Investment ROI

Models the financial uncertainty around AI tool investments, incorporating:

- **Implementation Variables**: Setup costs, subscription fees, implementation timelines
- **Adoption Factors**: Success rates, user adoption, organizational change management
- **Market Dynamics**: Price increases, competitive responses, economic conditions
- **Financial Impact**: Revenue improvements, cost savings, operational benefits

### Key Metrics Analyzed

- Mean and median ROI across all scenarios
- 10th and 90th percentile outcomes
- Probability of negative ROI
- Cost vs benefit distribution analysis
- Implementation delay impact modeling

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- Modern web browser with JavaScript enabled

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd monte-carlo-simulation

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Usage

#### Running the Application
1. Open your browser to http://localhost:3000 
2. Browse available simulations in the grid view
3. Click on a simulation to open the parameter interface
4. Configure parameters using the dynamic forms
5. Run simulations and explore interactive results

#### Using the Framework Programmatically

**Creating a New Simulation:**
```typescript
import { MonteCarloEngine, ParameterDefinition, SimulationMetadata } from './framework'

export class ProductLaunchSimulation extends MonteCarloEngine {
  getMetadata(): SimulationMetadata {
    return {
      id: 'product-launch',
      name: 'Product Launch Success',
      description: 'Model market acceptance and revenue outcomes',
      category: 'Marketing',
      version: '1.0.0'
    }
  }

  getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'marketSize',
        label: 'Total Market Size',
        type: 'number',
        defaultValue: 1000000,
        min: 10000,
        max: 100000000,
        description: 'Total addressable market in dollars'
      },
      {
        key: 'captureRate',
        label: 'Market Capture Rate (%)',
        type: 'number',
        defaultValue: 0.05,
        min: 0.001,
        max: 0.5,
        step: 0.001,
        description: 'Expected market share as decimal'
      }
    ]
  }

  simulateScenario(parameters: Record<string, unknown>): Record<string, number> {
    const { marketSize, captureRate } = parameters as {
      marketSize: number
      captureRate: number
    }
    
    // Add uncertainty to parameters
    const actualCaptureRate = captureRate * (0.5 + Math.random())
    const marketVariability = 0.8 + (Math.random() * 0.4) // 80%-120%
    
    const revenue = marketSize * actualCaptureRate * marketVariability
    const success = revenue > marketSize * captureRate * 0.7 ? 1 : 0
    
    return {
      revenue,
      success,
      marketShare: actualCaptureRate
    }
  }
}
```

**Registering and Running Simulations:**
```typescript
import { SimulationRegistry } from './framework'
import { ProductLaunchSimulation } from './simulations/ProductLaunchSimulation'

// Register the simulation
const registry = SimulationRegistry.getInstance()
registry.register(
  () => new ProductLaunchSimulation(),
  ['marketing', 'product', 'revenue']
)

// Run a simulation programmatically
const simulation = registry.getSimulation('product-launch')
if (simulation) {
  const results = await simulation.runSimulation({
    marketSize: 5000000,
    captureRate: 0.03
  }, 1000)
  
  console.log('Mean Revenue:', results.summary.revenue.mean)
  console.log('Success Rate:', results.summary.success.mean * 100 + '%')
}
```

**Using Parameter Groups:**
```typescript
export class MySimulation extends MonteCarloEngine {
  // ... other methods
  
  setupParameterGroups(): void {
    const schema = this.getParameterSchema()
    
    schema.addGroup({
      name: 'Market Parameters',
      description: 'Market size and competition factors',
      parameters: ['marketSize', 'competitionLevel']
    })
    
    schema.addGroup({
      name: 'Product Factors',
      description: 'Product pricing and positioning',
      parameters: ['price', 'qualityScore']
    })
  }
}
```

**Advanced Registry Usage:**
```typescript
const registry = SimulationRegistry.getInstance()

// Search for simulations
const financeSimulations = registry.searchSimulations({
  category: 'Finance',
  sortBy: 'name'
})

// Find simulations by tags
const aiSimulations = registry.searchSimulations({
  tags: ['ai', 'ml'],
  sortOrder: 'desc'
})

// Get all categories
const categories = registry.getCategories()
console.log('Available categories:', categories)
```

**Extending Statistical Analysis:**
```typescript
import { StatisticalAnalyzer } from './framework'

class CustomAnalyzer extends StatisticalAnalyzer {
  calculateCorrelation(values1: number[], values2: number[]): number {
    // Custom correlation calculation
    const n = values1.length
    const sum1 = values1.reduce((a, b) => a + b, 0)
    const sum2 = values2.reduce((a, b) => a + b, 0)
    const sum1Sq = values1.reduce((a, b) => a + b * b, 0)
    const sum2Sq = values2.reduce((a, b) => a + b * b, 0)
    const pSum = values1.reduce((a, b, i) => a + b * values2[i], 0)
    
    const num = pSum - (sum1 * sum2 / n)
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n))
    
    return den === 0 ? 0 : num / den
  }
}
```

**Custom Parameter Validation:**
```typescript
import { ParameterSchema, ValidationResult } from './framework'

class CustomParameterSchema extends ParameterSchema {
  validateBusinessLogic(parameters: Record<string, unknown>): ValidationResult {
    const errors: string[] = []
    
    // Custom business rule validation
    const marketSize = Number(parameters.marketSize)
    const captureRate = Number(parameters.captureRate)
    
    if (marketSize * captureRate > 50000000) {
      errors.push('Projected revenue exceeds realistic market expectations')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

## Architecture

The current implementation is a single React component (`index.js`) that will be refactored into a modular framework supporting multiple simulation types.

### Planned Architecture

```
src/
├── framework/          # Core Monte Carlo engine
├── simulations/        # Individual simulation modules
├── ui/                # Web interface components
└── utils/             # Shared utilities

tests/
├── unit/              # Unit tests for components
├── integration/       # End-to-end workflow tests
├── performance/       # Load and timing tests
└── visual/            # Screenshot regression tests
```

## Development Status

See [ACTIVE_WORK.md](ACTIVE_WORK.md) for current development progress and recent achievements.

### Framework Status: ✅ Complete

The Monte Carlo Simulation Framework is production-ready with:

- ✅ **Core Framework**: Complete with all components (MonteCarloEngine, ParameterSchema, SimulationRegistry, StatisticalAnalyzer)
- ✅ **Web Interface**: Full React application with simulation browser and dynamic parameter forms  
- ✅ **AI Investment ROI**: Comprehensive simulation with enhanced NPV calculations
- ✅ **Testing**: 34+ comprehensive tests across all components
- ✅ **TypeScript**: Strict mode throughout for type safety

## Contributing

This project follows conventional commit standards and requires comprehensive testing for all contributions.

### Development Guidelines

- Commits should be < 500 lines (< 200 lines preferred)
- Use TypeScript for type safety
- Maintain 90%+ test coverage
- Follow existing code conventions and patterns

## Technology Stack

- **React 18**: User interface and state management
- **Recharts**: Data visualization and charting
- **JavaScript/ES6+**: Core simulation logic
- **CSS-in-JS**: Component styling with Tailwind-like utilities

### Production Technologies

- **TypeScript**: Type safety across the entire codebase ✅
- **Vite**: Fast build system and development server ✅
- **Vitest**: Testing framework for unit and integration tests ✅
- **React 18**: Modern UI with concurrent features ✅
- **Tailwind CSS**: Utility-first styling ✅
- **Recharts**: Interactive data visualization ✅

## License

[Add appropriate license information]

## Support

For questions, issues, or feature requests, please [create an issue](../../issues) in the repository.