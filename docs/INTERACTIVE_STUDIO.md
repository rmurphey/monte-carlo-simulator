# Interactive Simulation Creation

## Overview

The framework provides an examples-first approach for creating Monte Carlo simulations. Instead of complex studio interfaces, users copy working examples and modify them directly.

## Current Approach

### Copy-Modify-Validate-Run Workflow
1. **Browse Examples**: Find a simulation similar to your use case
2. **Copy Example**: Copy the YAML file to your workspace
3. **Modify Parameters**: Edit the YAML directly with your values
4. **Validate Configuration**: Ensure your changes are valid
5. **Run Simulation**: Execute with real-time parameter control

## User Guide

### Creating a New Simulation
```bash
# 1. View available examples
npm run cli list

# 2. Copy a relevant example
cp examples/simulations/simple-roi-analysis.yaml my-analysis.yaml

# 3. Edit my-analysis.yaml with your parameters
# 4. Validate your changes
npm run cli validate my-analysis.yaml

# 5. Run your simulation
npm run cli run my-analysis.yaml
```

**Benefits of Examples-First Approach:**
- ✅ **Simple**: Direct file editing, no complex UI
- ✅ **Reliable**: Copy from known-working configurations
- ✅ **Fast**: No guided questionnaires or complex workflows  
- ✅ **Agent-Friendly**: Easy programmatic generation

### Parameter Definition Process
1. **Business Context Selection** - Choose ARR framework integration
2. **Parameter Creation** - Define inputs with validation ranges
3. **Logic Building** - Formula wizard with syntax checking
4. **Output Specification** - Define what to measure
5. **Test Validation** - Quick execution with small iteration count

### Starting a Realtime Session
```bash
npm run cli studio run my-simulation.yaml
```

**Interactive Interface:**
```
🚀 Realtime Simulation Runner
┌─────────────────────────────────────────────────────┐
│ AI Tool Adoption Analysis                           │
│                                                     │
│ Team Size: [■■■■■░░░] 25 devs    (↑↓ to adjust)    │
│ Tool Cost: [■■░░░░░░] $20/month  (↑↓ to adjust)    │
│ ROI: 847% ± 156%                                   │
│                                                     │
│ [r] Re-run  [s] Save  [c] Compare  [q] Quit       │
└─────────────────────────────────────────────────────┘
```

### Keyboard Controls
- **↑/↓**: Adjust selected parameter
- **Tab**: Switch between parameters
- **Enter**: Lock in value and re-run simulation
- **r**: Force re-run with current parameters
- **s**: Save current parameter set
- **c**: Compare with saved scenarios
- **q**: Quit to main menu

## Agent Integration Specifications

### Definition Phase API

#### Starting a Definition Session
```typescript
interface DefinitionStudio {
  // Start interactive definition
  startDefinition(question: string): Promise<DefinitionSession>
  
  // Get parameter suggestions based on question
  suggestParameters(question: string): Promise<ParameterSuggestion[]>
  
  // Validate parameter configuration
  validateParameters(params: ParameterInput[]): ValidationResult
  
  // Quick test with small iteration count
  quickTest(config: Partial<SimulationConfig>): Promise<TestResult>
}
```

#### Parameter Suggestion Format
```typescript
interface ParameterSuggestion {
  key: string
  label: string
  type: 'number' | 'boolean' | 'string'
  default: number | boolean | string
  min?: number
  max?: number
  description: string
  businessContext: string  // Why this parameter matters
  industryBenchmark?: string  // Typical values
}
```

#### Agent Interaction Patterns
```typescript
// Example agent interaction
const session = await studio.startDefinition("AI tool ROI analysis")
const suggestions = await session.getParameterSuggestions()

// Agent can accept suggestions or customize
const customParams = suggestions.map(s => ({
  ...s,
  default: agentCalculatedValue(s.businessContext)
}))

const config = await session.buildConfiguration(customParams)
const validation = await session.validateConfiguration(config)
```

### Execution Phase API

#### Realtime Control Interface
```typescript
interface RealtimeRunner {
  // Start interactive session
  startSession(config: SimulationConfig): Promise<RealtimeSession>
  
  // Update parameters during execution
  updateParameter(key: string, value: number): Promise<void>
  
  // Subscribe to results stream
  subscribeToResults(): Observable<SimulationResults>
  
  // Save/load parameter sets
  saveParameterSet(name: string): Promise<void>
  loadParameterSet(name: string): Promise<ParameterValues>
}
```

#### Results Stream Format
```typescript
interface LiveResults {
  iteration: number
  totalIterations: number
  currentResults: {
    [outputKey: string]: {
      currentValue: number
      runningMean: number
      runningStdDev: number
      confidenceInterval: [number, number]
    }
  }
  convergenceStatus: {
    [outputKey: string]: {
      isConverged: boolean
      stabilityScore: number  // 0-1, higher = more stable
      requiredIterations: number
    }
  }
  executionTime: number
  parametersChanged: boolean
}
```

#### Agent Integration Example
```typescript
// Agent controlling realtime session
const session = await runner.startSession(config)

// Subscribe to results
session.subscribeToResults().subscribe(results => {
  if (results.convergenceStatus.roi.stabilityScore > 0.95) {
    // Agent determines ROI has converged, can make decision
    agent.analyzeResults(results)
  }
})

// Agent adjusts parameters based on results
if (results.currentResults.roi.runningMean < targetROI) {
  await session.updateParameter('teamSize', currentTeamSize + 5)
}
```

## Configuration Format

### Studio Session Configuration
```yaml
# Interactive studio session metadata
studioSession:
  id: "ai-tool-analysis-session-001"
  created: "2025-08-06T12:00:00Z"
  question: "Should we adopt AI coding tools for our team?"
  
# Standard simulation configuration
name: "AI Tool Adoption Analysis"
category: "Technology Investment"
description: "Interactive analysis of AI tool ROI with real-time parameter adjustment"
version: "1.0.0"
tags: [ai, tools, roi, interactive]

# Interactive-specific metadata
interactiveMetadata:
  parameterRanges:
    teamSize:
      min: 5
      max: 100
      step: 1
      sliderPosition: 50  # UI state
    toolCost:
      min: 10
      max: 100
      step: 5
      sliderPosition: 20
      
  savedParameterSets:
    - name: "conservative"
      parameters: {teamSize: 15, toolCost: 30, productivityGain: 10}
    - name: "aggressive" 
      parameters: {teamSize: 25, toolCost: 20, productivityGain: 25}
      
  convergenceSettings:
    targetStability: 0.95
    maxIterations: 10000
    updateInterval: 100  # iterations between UI updates

# Standard simulation configuration continues...
parameters:
  - key: teamSize
    label: "Development Team Size"
    type: number
    default: 20
    min: 5
    max: 100
    
simulation:
  logic: |
    const monthlyCost = teamSize * toolCost
    const monthlyBenefit = teamSize * avgSalary * (productivityGain/100) / 12
    const roi = ((monthlyBenefit * 12 - monthlyCost * 12) / (monthlyCost * 12)) * 100
    return { roi: Math.round(roi * 10) / 10 }
```

## Implementation Details

### File Structure
```
src/cli/interactive/
├── definition-studio.ts      # Interactive definition builder
├── realtime-runner.ts        # Real-time parameter control
├── live-dashboard.ts         # Unicode visualization engine
├── session-manager.ts        # Save/load session state
└── parameter-controllers.ts  # Keyboard/slider controls
```

### Key Technical Features

#### Parameter Control System
- **Unicode Sliders**: Visual parameter adjustment with `■░` characters
- **Keyboard Navigation**: Tab between parameters, arrow keys to adjust
- **Range Validation**: Real-time bounds checking with visual feedback
- **Immediate Updates**: Parameter changes trigger simulation re-runs

#### Results Streaming
- **Observable Pattern**: RxJS streams for real-time result updates
- **Convergence Monitoring**: Track when results stabilize
- **Performance Optimization**: Efficient re-execution with parameter caching
- **Unicode Charts**: Simple distribution visualization in terminal

#### Session Persistence
- **Auto-save**: Session state preserved automatically
- **Parameter Sets**: Named parameter combinations for comparison
- **History Tracking**: Previous sessions and their results
- **Export Compatibility**: Sessions export to standard YAML format

## Error Handling

### Validation Errors
- **Parameter Bounds**: Clear feedback when values exceed ranges
- **Logic Errors**: Syntax checking with helpful error messages
- **Convergence Issues**: Warnings when results don't stabilize
- **Performance Limits**: Automatic iteration capping for responsiveness

### Recovery Mechanisms
- **Auto-save**: Session state preserved on crashes
- **Graceful Degradation**: Fall back to batch mode if interactive fails
- **Parameter Reset**: Quick reset to last known good state
- **Error Context**: Detailed error information for debugging

## Integration with Existing Framework

### Compatibility
- **Full YAML Compatibility**: Studio sessions export to standard simulation format
- **CLI Integration**: `studio` subcommand extends existing CLI structure
- **Config System**: Uses existing ConfigurationLoader and validation
- **Statistics Engine**: Leverages StatisticalAnalyzer for real-time updates

### Migration Path
- **Existing Simulations**: All current YAML files work in studio mode
- **Batch to Interactive**: Convert any simulation to interactive session
- **Export Options**: Studio sessions export to batch-compatible YAML

This documentation provides comprehensive guidance for both human users learning the interactive interface and AI agents that need to programmatically control simulation sessions.