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

1. Open your browser to the development server URL
2. Adjust simulation parameters using the interactive controls
3. Click "Run Monte Carlo Simulation" to execute the analysis
4. Review results in the statistical summary and visualizations
5. Use preset scenarios to quickly explore different risk profiles

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