# Monte Carlo Business Intelligence Platform

A professional TypeScript/React framework for building and running Monte Carlo simulations with industry-standard KPIs, ARR-based budgeting, and actionable business intelligence.

## ⚡ Quick Start for AI Tools

**For AI assistants like Claude Code:** This framework supports creating Monte Carlo simulations through YAML configuration files. 

📚 **[Complete YAML Schema Guide](docs/YAML_SCHEMA_GUIDE.md)** - Comprehensive documentation for AI-assisted simulation creation
📁 **[Example Configurations](examples/simulations/)** - Ready-to-use simulation templates for common business scenarios

### Available Business Intelligence Simulations
- **[Restaurant Profitability Analysis](examples/simulations/restaurant-profitability/)** - Industry KPIs: food cost %, labor cost %, table turnover, CAC analysis
- **[Marketing Campaign ROI](examples/simulations/marketing-campaign-roi/)** - ARR-based budgeting, CAC:CLV ratios, viral growth modeling
- **[Software Project Timeline](examples/simulations/software-project-timeline/)** - Feature velocity, team scaling, business-friendly metrics
- **[ARR Framework Demo](examples/simulations/arr-framework-demo/)** - Universal business context scaling from startup to professional

### Create New Simulations
```bash
# Interactive configuration builder
npm run cli create --interactive "Your Simulation Name"

# Generate from template
npm run cli create "Your Simulation Name" --template
```

## Professional Business Intelligence Features

- **ARR-Based Business Context**: Universal Annual Recurring Revenue framework for realistic budgeting
- **Industry-Standard KPIs**: Food cost %, CAC:CLV ratios, table turnover, feature velocity metrics
- **Professional CLI**: Colorized terminal output with scenario comparison and progress visualization
- **Scenario Risk Analysis**: Conservative/Neutral/Aggressive business planning with statistical confidence
- **Configuration-Driven**: Create simulations using YAML files - no TypeScript required
- **Business Intelligence Outputs**: Actionable strategic insights for C-suite decision making
- **Comprehensive Testing**: 58+ tests covering all framework components
- **Type Safety**: Full TypeScript implementation with strict mode

## Business Intelligence Platform Capabilities

### 🎯 **Strategic Planning & Risk Analysis**
- **Restaurant Operations**: 28.9% food cost management, $2.04 CAC optimization, 1.98 table turn efficiency
- **Marketing Intelligence**: ARR-scaled budgets ($80K→$900K), 0.255 CAC:CLV sustainability ratios
- **Software Development**: 3.3 features/week velocity, team scaling efficiency modeling
- **Financial Planning**: ARR-based business context from $500K startup to $10M+ professional scale

### 📊 **Professional Terminal Interface**
- **Colorized Output**: Rich terminal UI with progress bars and statistical visualization
- **Scenario Comparison**: Conservative/Neutral/Aggressive risk analysis with confidence intervals
- **Business Reporting**: JSON, CSV, and table formats for strategic presentations
- **Parameter Override**: Real-time what-if analysis for executive decision making

### 🏢 **Industry-Grade Business Context**
- **Universal ARR Framework**: Automatic budget scaling based on company Annual Recurring Revenue
- **Department Budget Functions**: Marketing, Sales, Operations, Product, R&D budget allocation
- **Business Intelligence Validation**: Industry benchmark compliance and realistic KPI modeling

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

#### Professional CLI Commands

**Run Business Intelligence Simulations:**
```bash
# Run individual scenarios with industry KPIs
npm run cli run restaurant-profitability --scenario conservative --iterations 1000
npm run cli run marketing-campaign-roi --scenario aggressive --verbose

# Compare business scenarios with colorized output  
npm run cli run restaurant-profitability --compare conservative,neutral,aggressive
npm run cli run marketing-campaign-roi --compare conservative,aggressive --output analysis.json

# Override parameters for what-if analysis
npm run cli run restaurant-profitability --scenario conservative --seatingCapacity 80 --averageTicket 40

# Export results for business reporting
npm run cli run marketing-campaign-roi --scenario neutral --format csv --output marketing-analysis.csv
```

**Create New Simulations:**
```bash
# Interactive configuration builder (recommended for AI tools)
npm run cli create --interactive "Simulation Name"

# Generate template configuration
npm run cli create "Simulation Name" --category Finance --description "Custom description"

# List available configuration files
npm run cli list

# Validate a configuration file
npm run cli validate path/to/simulation.yaml --verbose
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

### Platform Status: ✅ Professional Business Intelligence Ready

The Monte Carlo Business Intelligence Platform is production-ready with:

- ✅ **ARR Business Intelligence Framework**: Universal ARR-based budgeting with automatic business context injection
- ✅ **Professional CLI**: Colorized terminal output with scenario comparison and progress visualization
- ✅ **Industry-Standard KPIs**: Restaurant profitability, marketing CAC analysis, software development velocity
- ✅ **Business Scenario Coverage**: Conservative/Neutral/Aggressive risk analysis across all simulation types
- ✅ **Core Framework**: Complete with all components (MonteCarloEngine, ParameterSchema, SimulationRegistry, StatisticalAnalyzer)
- ✅ **Web Interface**: Full React application with simulation browser and dynamic parameter forms
- ✅ **Comprehensive Testing**: 58+ tests covering all framework components with ARR validation
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