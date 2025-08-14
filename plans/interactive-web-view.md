# Interactive Static Web View for Monte Carlo Simulations

## Executive Summary

Add an interactive static web-based visualization interface to the Monte Carlo simulation framework. Single HTML file approach with embedded JavaScript - no server required, just open in browser.

## Requirements (Confirmed)

- **Deployment**: Static HTML file (open directly in browser)
- **Core Feature**: Interactive parameter editing via HTML forms
- **Technology Stack**: TypeScript + Chart.js (compiled to JavaScript)
- **Target Users**: Business analysts (presentations, "what-if" scenarios) and developers (debugging, validation)
- **Core Visualizations**:
  - Histogram/distribution charts showing result spread
  - Summary statistics tables
  - Real-time updates as parameters change
  - Parameter sensitivity analysis
  - Copy/paste current configuration as parameters are updated

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

## Technical Architecture - Static Site

### File Structure
```
src/web/
├── index.html              # Single-page application
├── types.ts                # Web-specific types (reuses framework types)
├── simulation-engine.ts    # Export alias to existing ConfigurableSimulation
├── parameter-forms.ts      # HTML form generation and management
├── charts.ts               # Chart.js histogram rendering
├── statistics.ts           # Statistics table display (reuses StatisticalAnalyzer)
├── config-manager.ts       # Copy/paste configuration functionality
├── main.ts                 # Main application coordinator
└── styles.css              # Basic styling

dist/web/                   # Compiled output
├── monte-carlo-web.html    # Self-contained HTML file
└── monte-carlo-web.js      # Compiled TypeScript bundle
```

### Core Components (No Server)
- **Simulation Engine**: Direct reuse of existing ConfigurableSimulation class
- **Parameter Forms**: HTML forms generated from existing ParameterDefinition types
- **Chart Rendering**: Chart.js histogram visualizations  
- **Statistics Display**: Reuses existing StatisticalAnalyzer output format
- **Configuration Management**: Copy/paste functionality using existing validation rules

### Data Flow (Browser Only)
1. User opens compiled HTML file in browser
2. Compiled JavaScript loads embedded simulation configurations
3. User selects simulation, existing ConfigurableSimulation instance created
4. Parameter forms generated from existing ParameterDefinition schema
5. Parameter changes trigger ConfigurableSimulation.runSimulation() 
6. Charts and statistics update using existing StatisticalAnalyzer output

## Implementation Plan - Static Site

### Core Implementation
**Goal**: Interactive parameter editing with histogram visualization

**Tasks**:
1. Create TypeScript modules that reuse existing framework components
2. Build HTML form generation using existing ParameterDefinition types
3. Add Chart.js histogram visualization for simulation results
4. Connect form changes to trigger existing ConfigurableSimulation.runSimulation()
5. Display statistics using existing StatisticalAnalyzer output format
6. Add copy/paste functionality for current parameter configuration
7. Set up TypeScript compilation and bundling for single-file deployment

**Deliverables**:
- Single HTML file that works offline
- Parameter editing for all existing simulations
- Histogram charts showing result distributions
- Summary statistics tables
- Real-time updates as parameters change
- Copy current configuration to clipboard functionality

## Technical Implementation Details

### Simulation Engine Port
```javascript
class ConfigurableSimulation {
  constructor(config) {
    this.config = config
    this.parameters = this.parseParameters(config.parameters)
  }
  
  run(iterations, parameterOverrides) {
    const results = []
    for (let i = 0; i < iterations; i++) {
      results.push(this.executeIteration(parameterOverrides))
    }
    return this.calculateStatistics(results)
  }
}
```

### Parameter Form Generation
```javascript
function generateParameterForm(simulation) {
  const form = document.createElement('form')
  simulation.parameters.forEach(param => {
    const field = createInputField(param)
    field.addEventListener('input', () => runSimulation())
    form.appendChild(field)
  })
  return form
}
```

### Real-time Chart Updates
```javascript
function updateCharts(results) {
  const histogram = createHistogram(results.data)
  const statsTable = createStatsTable(results.summary)
  
  // Update existing charts without full re-render
  histogramChart.data = histogram
  histogramChart.update('none') // No animation for smooth updates
}
```

### Configuration Copy/Paste
```javascript
function copyCurrentConfig() {
  const currentParams = getCurrentParameterValues()
  const configText = JSON.stringify(currentParams, null, 2)
  navigator.clipboard.writeText(configText)
  showNotification('Configuration copied to clipboard!')
}

function getCurrentParameterValues() {
  const params = {}
  document.querySelectorAll('.parameter-input').forEach(input => {
    params[input.name] = parseInputValue(input.value, input.type)
  })
  return params
}
```

### Build Process
```bash
# TypeScript compilation and bundling for web deployment
npm run build:web
# Output: dist/web/monte-carlo-web.html (self-contained)
#         dist/web/monte-carlo-web.js (compiled TypeScript bundle)

# Build process:
# 1. Compile TypeScript modules to JavaScript
# 2. Bundle with existing framework components  
# 3. Embed simulation configurations as JSON
# 4. Create single HTML file with embedded JS and CSS
```

## Integration with Existing Framework

### Preserve CLI Functionality  
- Static web interface complements, doesn't replace CLI
- All existing CLI commands remain functional
- Shared simulation logic (ported to JavaScript)
- Consistent parameter validation across interfaces

### YAML Configuration Compatibility
- Same YAML simulation files work in both CLI and web
- Parameter schemas generate both CLI help and web forms
- Consistent validation rules and error messages
- Same statistical output format

## Required Documentation Updates

### README.md Updates
- Add static web interface to Quick Start section
- Update examples to show web interface option
- Add web interface screenshots
- Document build process for web interface

### CLI Reference Updates  
- Document `npm run build:web` command
- Add web interface workflow examples
- Cross-reference between CLI and web interface capabilities

### New Documentation Files Required
- `docs/WEB_INTERFACE.md` - Complete web interface user guide
  - Getting started (just open HTML file)
  - Parameter editing workflows
  - Visualization guide (charts, comparisons, exports)
  - Offline usage and sharing
- `docs/STATIC_DEPLOYMENT.md` - Deployment options
  - Local file usage
  - Web server deployment options
  - Sharing and distribution

### Example Updates
- `examples/README.md` - Add web interface usage patterns
- Add web interface screenshots to `examples/` directory
- Create downloadable example HTML files

### Package.json Documentation
- Update description to mention web interface
- Add web-related keywords
- Document new npm build script

## Success Criteria

- [ ] All 9 simulations run in browser with identical results to CLI
- [ ] Parameter forms work for editing simulation inputs
- [ ] Interactive histograms display result distributions
- [ ] Real-time updates as user adjusts parameters
- [ ] Basic statistics tables show mean, std dev, percentiles
- [ ] Copy current configuration to clipboard functionality
- [ ] Single HTML file works completely offline

## Risk Mitigation

### Technical Risks
- **JavaScript performance**: Business simulations are simple math, should be fast enough
- **Browser compatibility**: Target modern browsers (Chrome, Firefox, Safari)

### Business Risks  
- **Feature scope creep**: Strict phase boundaries with clear deliverables
- **Adoption vs CLI**: Position as complementary tool for different use cases
- **Maintenance burden**: Leverage existing simulation logic, minimal new dependencies

## Development Environment Setup

### Prerequisites
- Existing Monte Carlo framework
- Modern web browser for testing
- Basic web development tools

### No New Dependencies Required
- Uses CDN versions of Chart.js and js-yaml
- All code in vanilla JavaScript
- No build process beyond file copying
- No package.json changes needed

### Development Workflow
1. `npm run build:web` - Copy YAML configs and build static HTML
2. Open `dist/monte-carlo-web.html` in browser
3. Test parameter editing and visualizations
4. Iterate on JavaScript files and rebuild

## Cost Estimate

**Claude Code assisted development**: ~1-2 days effective work
**Estimated cost**: $30-60 in Claude Code usage

**Benefits**:
- No ongoing server costs
- Easy to share and distribute  
- Works completely offline
- Minimal maintenance overhead
- Professional business presentation tool