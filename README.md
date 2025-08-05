# Monte Carlo Simulation Framework

A web-based platform for creating and running Monte Carlo simulations to model financial and business uncertainty. Currently includes an AI tool investment ROI simulation with plans for expansion into a comprehensive simulation library.

## Features

- **Interactive Parameter Controls**: Real-time sliders and inputs for simulation parameters
- **Statistical Analysis**: Comprehensive risk metrics including percentiles, mean, median, and probability distributions
- **Rich Visualizations**: Multiple chart types including histograms, scatter plots, and distribution analysis
- **Scenario Presets**: Quick-load configurations for conservative, realistic, and aggressive scenarios
- **Risk Assessment**: Clear identification of negative ROI probability and outcome ranges

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

## Development Roadmap

See [plans/monte-carlo-framework.md](plans/monte-carlo-framework.md) for the complete development plan.

### Upcoming Features

- **Multiple Simulation Types**: Portfolio risk, product launch success, market penetration
- **Simulation Framework**: Reusable core engine for building new simulations
- **Enhanced UI**: Simulation browser, comparison tools, export capabilities
- **Advanced Analytics**: Correlation analysis, sensitivity testing, scenario optimization

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

### Planned Technologies

- **TypeScript**: Type safety across the entire codebase
- **Vite**: Fast build system and development server
- **Vitest**: Testing framework for unit and integration tests
- **Playwright**: End-to-end and visual regression testing

## License

[Add appropriate license information]

## Support

For questions, issues, or feature requests, please [create an issue](../../issues) in the repository.