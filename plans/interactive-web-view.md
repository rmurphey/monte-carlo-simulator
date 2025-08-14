# Interactive Web View for Monte Carlo Simulations

## Executive Summary

Add an interactive web-based visualization interface to the Monte Carlo simulation framework, enabling rich data visualization, real-time parameter adjustment, and enhanced business presentation capabilities via local web server launched from CLI.

## Requirements (Confirmed)

- **Deployment**: Local web server launched from CLI (`npm run web`)
- **Core Feature**: Interactive parameter editing via HTML forms
- **Technology Stack**: React + Plotly.js
- **Target Users**: Business analysts (presentations, "what-if" scenarios) and developers (debugging, validation)
- **All Visualizations Required**:
  - Histogram/distribution charts showing result spread
  - Real-time updates as simulation runs
  - Parameter sensitivity analysis
  - Scenario comparison (side-by-side results)
  - Summary statistics tables

## Current State Analysis

### Existing Architecture
- CLI-based framework with YAML simulation configurations
- Terminal-based interactive mode via session-manager.ts
- Text-based output with document generation
- 9 working business simulations (ROI analysis, investment decisions, etc.)
- Statistical analysis with comprehensive summary statistics

### Current Output Formats
- Table format (default CLI output)
- JSON/CSV export capabilities
- Document format with business insights
- Interactive terminal session for parameter editing

## Technical Architecture

### Web Server Integration
- Extend existing CLI to include `web` command
- Express.js server serving React application
- REST API endpoints for simulation operations
- Server-Sent Events (SSE) for real-time simulation updates
- Port auto-detection with browser auto-launch

### React Application Structure
```
src/web/
├── server/           # Express server
├── client/           # React application  
├── shared/           # Shared types/utilities
└── public/           # Static assets
```

### API Design
- `GET /api/simulations` - List available simulations
- `GET /api/simulations/:id` - Get simulation configuration
- `POST /api/simulations/:id/run` - Execute simulation
- `GET /api/simulations/:id/progress` - Server-Sent Events for real-time progress

## Implementation Plan

### Phase 1: Foundation (Weeks 1-2)
**Goal**: Basic web server with simulation listing and parameter editing

**Tasks**:
1. Add Express server to CLI commands
2. Create React application scaffold with Vite
3. Implement simulation listing from existing registry
4. Build parameter editing forms with validation
5. Basic result display (tables only)

**Deliverables**:
- `npm run web` command launches server and browser
- Parameter editing for all 9 existing simulations
- Basic result tables display
- Form validation matching existing CLI validation

### Phase 2: Core Visualizations (Weeks 3-4)
**Goal**: Essential charts and statistical displays

**Tasks**:
1. Integrate Plotly.js for interactive charts
2. Implement histogram/distribution visualizations
3. Add summary statistics tables with sorting/filtering
4. Create responsive layout for charts and controls
5. Export capabilities (PNG, PDF for charts)

**Deliverables**:
- Interactive histogram charts for all result outputs
- Statistical summary tables with percentiles
- Responsive design for different screen sizes
- Chart export functionality

### Phase 3: Real-time & Comparisons (Weeks 5-6)
**Goal**: Live simulation updates and scenario comparison

**Tasks**:
1. Server-Sent Events integration for real-time updates
2. Progress indicators during simulation execution
3. Side-by-side scenario comparison interface
4. Parameter sensitivity analysis visualization
5. Performance optimization for large datasets

**Deliverables**:
- Real-time chart updates during simulation runs
- Scenario comparison dashboard (2+ simulations)
- Parameter sensitivity heat maps/bar charts
- Efficient handling of 10K+ iteration results

### Phase 4: Business Features (Weeks 7-8)
**Goal**: Business analyst presentation and export features

**Tasks**:
1. Enhanced export options (business reports, presentations)
2. Simulation result history and comparison
3. "What-if" scenario bookmarking and sharing
4. Business insights generation and display
5. Performance profiling and optimization

**Deliverables**:
- Export to business formats (PDF reports, CSV data)
- Simulation result persistence and history
- Bookmark/share parameter configurations
- Business-friendly insights and recommendations

## Technical Implementation Details

### CLI Integration
```typescript
// src/cli/commands/web.ts
export async function webCommand(options: WebOptions) {
  const server = new WebServer({
    port: options.port || 3000,
    autoLaunch: options.open !== false
  })
  await server.start()
}
```

### React Components Architecture
- `SimulationList` - Browse available simulations
- `ParameterEditor` - Interactive form for parameter adjustment
- `SimulationRunner` - Execute and monitor simulation progress
- `ResultsViewer` - Chart and table display
- `ScenarioComparator` - Side-by-side comparison interface

### Data Flow
1. User selects simulation from list
2. Parameter editor loads simulation schema
3. Form validation prevents invalid configurations  
4. Server-Sent Events stream results during execution
5. Charts update incrementally as results arrive
6. Final summary statistics computed and displayed

### Performance Considerations
- Incremental result streaming (batches of 100 iterations)
- Chart data sampling for datasets >1000 points
- Lazy loading of simulation configurations
- Memory-efficient result storage
- Browser-side caching of simulation schemas

## Integration with Existing Framework

### Leverage Current Architecture
- Reuse `ConfigurableSimulation` for execution
- Extend `StatisticalAnalyzer` for web-friendly output
- Integrate with existing parameter validation
- Maintain compatibility with all YAML simulations

### Preserve CLI Functionality  
- Web interface complements, doesn't replace CLI
- All existing CLI commands remain functional
- Shared result formats between CLI and web
- Consistent parameter validation across interfaces

## Success Criteria

### Phase 1 Success
- [ ] `npm run web` launches server and opens browser automatically
- [ ] Parameter editing works for all 9 existing simulations
- [ ] Form validation prevents invalid configurations
- [ ] Basic result display matches CLI table output

### Phase 2 Success
- [ ] Interactive histograms display for all output metrics
- [ ] Statistical summary tables with sorting capabilities
- [ ] Responsive design works on desktop and tablet
- [ ] Chart export generates high-quality images

### Phase 3 Success
- [ ] Real-time chart updates during simulation execution
- [ ] Side-by-side comparison of 2+ scenarios
- [ ] Parameter sensitivity analysis clearly identifies key drivers
- [ ] Performance acceptable for 10K+ iteration simulations

### Phase 4 Success
- [ ] Export generates business-ready reports and presentations
- [ ] Simulation history enables parameter configuration reuse
- [ ] Business insights help non-technical users understand results
- [ ] Performance optimized for production workloads

## Risk Mitigation

### Technical Risks
- **Large dataset performance**: Implement data sampling and incremental loading
- **Browser compatibility**: Use modern React with fallbacks, target Chrome/Firefox/Safari
- **Real-time complexity**: Progressive enhancement - works without SSE (fallback to polling)

### Business Risks  
- **Feature scope creep**: Strict phase boundaries with user testing at each phase
- **Adoption vs CLI**: Position as complementary tool, not replacement
- **Maintenance burden**: Leverage existing TypeScript/Node.js skills, minimize new dependencies

## Required Documentation Updates

### README.md Updates
- Add `npm run web` command to Quick Start section
- Update CLI command reference with web interface option
- Add web interface screenshots to examples
- Update installation requirements for web dependencies

### CLI Reference Updates  
- Document new `web` command with all options
- Add web interface workflow examples
- Update parameter override examples to show both CLI and web methods
- Cross-reference between CLI and web interface capabilities

### New Documentation Files Required
- `docs/WEB_INTERFACE.md` - Complete web interface user guide
  - Getting started with web interface
  - Parameter editing workflows
  - Visualization guide (charts, comparisons, exports)
  - Troubleshooting common issues
- `docs/API_REFERENCE.md` - REST API documentation for developers
  - All endpoint specifications
  - Request/response examples
  - Error handling
  - Server-Sent Events protocol

### Agent Documentation Updates
- `docs/AGENT.md` - Add web interface patterns for AI agents
  - How agents can describe web interface workflows
  - Web-specific simulation examples
  - Integration patterns for automated testing

### Example Updates
- `examples/README.md` - Add web interface usage patterns
- Add web interface screenshots to `examples/` directory
- Create web-specific workflow examples

### Package.json Documentation
- Update description to mention web interface
- Add web-related keywords
- Document new npm scripts

## Development Environment Setup

### Prerequisites
- Existing Monte Carlo framework
- Node.js 18+ with npm
- Modern browser for testing

### New Dependencies
```json
{
  "express": "^4.18.0",
  "react": "^18.2.0", 
  "plotly.js": "^2.26.0",
  "vite": "^4.4.0"
}
```

### Development Workflow
1. `npm run dev` - Development mode with hot reload
2. `npm run web` - Production mode local server  
3. `npm run build:web` - Build static assets for deployment
4. `npm run test:web` - Web component testing