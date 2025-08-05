# Monte Carlo Simulation Framework

A practical tool for running business scenario analysis with Monte Carlo simulations. Built for personal use but designed to be useful for anyone who needs to model business uncertainty with realistic parameters.

## ⚡ Quick Start

**Run simulations directly:**
```bash
npx monte-carlo-simulator run restaurant-profitability --scenario conservative
npx monte-carlo-simulator run marketing-campaign-roi --compare conservative,aggressive
```

**For AI tools:** Create new simulations through YAML configuration files.
📚 **[YAML Schema Guide](docs/YAML_SCHEMA_GUIDE.md)** - Documentation for creating custom simulations
📁 **[Example Configurations](examples/simulations/)** - Ready-to-use templates

### Available Simulations
- **[Restaurant Profitability Analysis](examples/simulations/restaurant-profitability/)** - Industry KPIs: food cost %, labor cost %, table turnover, CAC analysis
- **[Marketing Campaign ROI](examples/simulations/marketing-campaign-roi/)** - ARR-based budgeting, CAC:CLV ratios, viral growth modeling
- **[Software Project Timeline](examples/simulations/software-project-timeline/)** - Feature velocity, team scaling, business-friendly metrics
- **[ARR Framework Demo](examples/simulations/arr-framework-demo/)** - Universal business context scaling from startup to professional

### Create New Simulations
```bash
# Interactive configuration builder with business guidance
npm run cli create --interactive "Your Simulation Name"

# Generate from template
npm run cli create "Your Simulation Name" --template
```

**Coming Soon**: Industry-specific templates and enhanced business guidance - [see design](designs/interactive-cli-enhancement.md)

## Features

- **Business-Realistic Parameters**: ARR-based budgeting that scales with company size
- **Industry Metrics**: Food cost %, CAC:CLV ratios, table turnover, feature velocity
- **Scenario Comparison**: Conservative/Neutral/Aggressive risk analysis
- **Colorized CLI**: Terminal output with progress bars and statistical summaries
- **YAML Configuration**: Create new simulations without writing code
- **Export Options**: JSON, CSV, and table formats for further analysis

## Current Simulations

**Restaurant Profitability**: Industry KPIs including 28.9% food cost management, $2.04 CAC optimization, and 1.98 table turn efficiency tracking.

**Marketing Campaign ROI**: ARR-scaled budgets ($80K→$900K), 0.255 CAC:CLV sustainability ratios, and viral growth modeling with 15%→25% organic conversion rates.

**Software Project Timeline**: Feature velocity (3.3 features/week), team scaling efficiency, and business-friendly metrics replacing academic story points.

**ARR Framework Demo**: Universal business context that automatically scales from $500K startup to $10M+ company budgets with department allocation functions.

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)

### Installation

**As a global tool:**
```bash
npm install -g monte-carlo-simulator
monte-carlo-simulator run restaurant-profitability --scenario conservative
```

**Or use directly with npx:**
```bash
npx monte-carlo-simulator run marketing-campaign-roi --compare conservative,aggressive
```

**For development:**
```bash
git clone <repository-url>
cd monte-carlo-simulation
npm install
npm run dev  # Start web interface
```

### Usage

#### Command Line Usage

**Run simulations:**
```bash
# Single scenario
monte-carlo-simulator run restaurant-profitability --scenario conservative --iterations 1000

# Compare scenarios
monte-carlo-simulator run marketing-campaign-roi --compare conservative,aggressive

# Override parameters
monte-carlo-simulator run restaurant-profitability --scenario conservative --seatingCapacity 80

# Export results
monte-carlo-simulator run marketing-campaign-roi --format csv --output analysis.csv
```

**Create and manage simulations:**
```bash
# Interactive builder
monte-carlo-simulator create --interactive "Simulation Name"

# List available simulations
monte-carlo-simulator list

# Validate configuration
monte-carlo-simulator validate path/to/simulation.yaml
```

#### Running the Web Application
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

Modular TypeScript framework with business intelligence capabilities.

### Current Architecture

```
src/
├── framework/                    # Core Monte Carlo engine with ARR business intelligence
│   ├── ARRBusinessContext.ts     # Universal ARR-based budgeting system
│   ├── ConfigurableSimulation.ts # YAML-driven simulation execution
│   ├── MonteCarloEngine.ts       # Statistical analysis engine
│   └── index.ts
├── cli/                         # Professional command-line interface
│   ├── commands/                # CLI command implementations
│   ├── interactive/             # Interactive simulation builder
│   └── index.ts
├── ui/                         # React web interface
└── test/                       # Comprehensive test suite (58+ tests)

examples/simulations/           # Business scenario configurations
├── restaurant-profitability/   # Industry KPI modeling
├── marketing-campaign-roi/     # ARR-based marketing analysis
├── software-project-timeline/  # Feature velocity tracking
└── arr-framework-demo/         # Business context demonstration

designs/                        # Technical design documents
└── interactive-cli-enhancement.md
```

## Development Status

See [ACTIVE_WORK.md](ACTIVE_WORK.md) for current development progress and recent achievements.

### Current Status: ✅ Production Ready with Business Intelligence

The Monte Carlo Simulation Framework includes:

- ✅ **ARR Business Intelligence**: Universal ARR-based budgeting with automatic business context injection across all simulation types
- ✅ **Professional CLI**: Colorized terminal output with scenario comparison, progress bars, and business reporting (JSON/CSV/table formats)
- ✅ **Industry-Standard KPIs**: Restaurant profitability (food cost %, labor cost %), marketing CAC analysis, software development velocity
- ✅ **Validated Business Scenarios**: Conservative/Neutral/Aggressive risk analysis with realistic industry benchmarks
- ✅ **Core Framework**: Complete with all components (MonteCarloEngine, ParameterSchema, SimulationRegistry, StatisticalAnalyzer)
- ✅ **Web Interface**: Full React application with simulation browser and dynamic parameter forms
- ✅ **Comprehensive Testing**: 58+ tests covering all framework components with ARR validation
- ✅ **TypeScript**: Strict mode throughout for type safety

### 🚀 **Next Phase: Enhanced User Experience** - [Design](designs/interactive-cli-enhancement.md)

- **Industry Templates**: Pre-built scenarios for common business analysis (restaurant, SaaS, retail, marketing)
- **Business Guidance**: Contextual help and realistic parameter suggestions during simulation creation
- **Enhanced Logic**: Pattern-based business formula generation with industry-standard calculations

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
- **Commander.js**: Professional CLI with parameter handling ✅
- **Chalk**: Colorized terminal output for business reporting ✅
- **Vite**: Fast build system and development server ✅
- **Vitest**: Testing framework for unit and integration tests ✅
- **React 18**: Modern UI with concurrent features ✅
- **Tailwind CSS**: Utility-first styling ✅
- **Recharts**: Interactive data visualization ✅

## License

[Add appropriate license information]

## Support

For questions, issues, or feature requests, please [create an issue](../../issues) in the repository.