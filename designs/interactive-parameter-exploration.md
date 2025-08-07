# Interactive Parameter Exploration Design

## Overview
Implement the `--interactive` flag for real-time parameter adjustment during simulation execution, enabling the core exploration workflow documented in the agent beginner guide.

## Problem Statement

### Current Gap
- ✅ **Documentation**: Beginner guide extensively documents interactive exploration (lines 171-182)
- ✅ **CLI Flag**: `--interactive` option exists in run command
- ❌ **Implementation**: No actual interactive functionality
- ❌ **User Experience**: Users following documentation get no interactive mode

### User Impact
Users expect this workflow from the beginner guide:
```bash
npx github:rmurphey/monte-carlo-simulator run ai-investment.yaml --interactive
# Should open real-time parameter adjustment interface
# Currently does nothing - creates poor user experience
```

## Solution Architecture

### Core Components

#### 1. Interactive Parameter Interface
```typescript
// src/cli/interactive/parameter-controller.ts
interface ParameterController {
  displayParameters(config: SimulationConfig): void
  promptForChanges(currentParams: Record<string, any>): Promise<Record<string, any>>
  showParameterSliders(params: Parameter[]): Promise<Record<string, any>>
}
```

#### 2. Real-time Simulation Runner
```typescript
// src/cli/interactive/live-runner.ts
interface LiveRunner {
  runWithParameters(params: Record<string, any>): Promise<SimulationResults>
  displayResults(results: SimulationResults, previous?: SimulationResults): void
  showComparison(current: SimulationResults, previous: SimulationResults): void
}
```

#### 3. Interactive Loop Manager
```typescript
// src/cli/interactive/session-manager.ts
interface SessionManager {
  startInteractiveSession(simulation: ConfigurableSimulation, initialParams: Record<string, any>): Promise<void>
  handleParameterChanges(): Promise<void>
  saveSession(filename: string): Promise<void>
  exportResults(format: 'json' | 'csv'): Promise<void>
}
```

## Technical Implementation

### Phase 1: Basic Interactive Loop
```typescript
async function runInteractiveMode(simulation: ConfigurableSimulation, initialParams: Record<string, any>) {
  let currentParams = { ...initialParams }
  let currentResults: SimulationResults | undefined
  
  console.log(chalk.cyan.bold('\n🎛️  Interactive Parameter Exploration'))
  console.log(chalk.gray('Adjust parameters and see results update in real-time\n'))
  
  while (true) {
    // Show current parameter values
    displayCurrentParameters(currentParams)
    
    // Run simulation with current parameters
    const results = await simulation.runSimulation(currentParams, 1000)
    
    // Display results with comparison to previous run
    displayResultsWithComparison(results, currentResults)
    currentResults = results
    
    // Prompt for parameter changes
    const action = await promptForAction()
    
    if (action === 'exit') break
    if (action === 'adjust') {
      currentParams = await adjustParameters(currentParams, simulation.getConfiguration())
    }
    if (action === 'save') {
      await saveSession(currentParams, results)
    }
  }
}
```

### Phase 2: Enhanced UX
- **Progress Indicators**: Show simulation progress during execution
- **Result Comparison**: Side-by-side comparison with previous runs
- **Parameter Validation**: Real-time validation of parameter ranges
- **Quick Presets**: Save/load parameter configurations

### Phase 3: Advanced Features
- **Parameter Sliders**: Visual adjustment interface
- **Convergence Monitoring**: Show when simulation stabilizes
- **Sensitivity Analysis**: Highlight parameters with biggest impact

## User Interface Design

### Main Menu
```
🎛️  Interactive Parameter Exploration: AI Investment ROI Analysis

📊 Current Results (1,000 iterations):
   ROI Percentage: 280% ± 57%
   Payback Period: 4.5 ± 0.9 months
   3-Year NPV: $1,488K ± $359K

📋 Current Parameters:
   initialInvestment      : $250,000
   affectedEmployees      : 50
   productivityGain       : 15%
   adoptionRate          : 85%

🎯 Actions:
   [A] Adjust parameters    [S] Save session
   [C] Compare scenarios    [E] Export results
   [Q] Quit

Choice: 
```

### Parameter Adjustment Interface
```
🔧 Adjust Parameters:

   [1] initialInvestment    : $250,000  (range: $10K - $10M)
   [2] affectedEmployees    : 50        (range: 5 - 10,000)
   [3] productivityGain     : 15%       (range: 2% - 50%)
   [4] adoptionRate        : 85%       (range: 50% - 100%)

   [R] Reset to defaults    [B] Back to main menu
   
Select parameter to modify (1-4):
```

### Results Comparison
```
📈 Results Comparison:

                          Previous    Current     Change
                          ========    =======     ======
ROI Percentage            280% ± 57%  320% ± 62%  +14% ⬆️
Payback Period (months)   4.5 ± 0.9   4.1 ± 0.8   -8%  ⬇️
3-Year NPV ($K)          1,488±359   1,672±401   +12% ⬆️

💡 Impact: Increasing productivityGain from 15% to 18% improved all metrics
```

## Implementation Plan

### Immediate (This Session)
1. **Create interactive session manager** in `src/cli/interactive/session-manager.ts`
2. **Implement basic parameter adjustment loop** with inquirer prompts
3. **Add result comparison display** with before/after metrics
4. **Update run command** to call interactive mode when `--interactive` flag used

### Next Session
1. **Enhanced UX improvements** - better formatting, progress indicators
2. **Parameter validation** - enforce ranges, type checking
3. **Session save/load** - persist interactive sessions
4. **Export capabilities** - CSV/JSON export of parameter exploration

### Future Enhancements
1. **Visual parameter sliders** using terminal UI libraries
2. **Convergence monitoring** - show when simulation stabilizes
3. **Sensitivity analysis** - automatic parameter impact assessment
4. **Batch parameter exploration** - automated parameter sweeps

## Integration Points

### Existing Systems
- ✅ **Parameter Override System**: Use newly implemented `--set` parameter resolution
- ✅ **ConfigurableSimulation**: Leverage existing simulation execution
- ✅ **Statistical Analysis**: Use existing results analysis and formatting
- ✅ **CLI Framework**: Integrate with existing run command structure

### New Dependencies
- **inquirer**: Already available for interactive prompts
- **chalk**: Already available for colored output
- **No new external dependencies needed**

## Success Criteria

### Functional Requirements
- ✅ `--interactive` flag launches interactive mode
- ✅ Users can adjust parameters and see immediate results
- ✅ Results display comparison between runs
- ✅ Session can be saved and resumed
- ✅ Works with all existing simulation configurations

### User Experience Requirements
- ✅ Intuitive menu-driven interface
- ✅ Clear parameter validation with helpful error messages
- ✅ Fast simulation re-execution (< 2 seconds for 1000 iterations)
- ✅ Results comparison shows impact of parameter changes
- ✅ Matches workflow documented in beginner guide

### Technical Requirements
- ✅ Integration with existing parameter override system
- ✅ Backward compatibility with all existing CLI options
- ✅ Clean error handling and graceful exit
- ✅ Memory efficient for multiple simulation runs

## Risk Assessment

### Low Risk
- **Implementation Complexity**: Builds on existing parameter and simulation systems
- **User Interface**: Simple menu-driven approach using proven inquirer patterns
- **Integration**: Minimal changes to existing CLI command structure

### Mitigations
- **Performance**: Limit default iterations to 1000 for fast feedback
- **Memory Usage**: Clean up previous simulation results after comparison
- **User Experience**: Provide clear exit options and help text

## Expected Outcomes

### Immediate Impact
- **Documentation Alignment**: Interactive mode actually works as documented
- **User Satisfaction**: Core exploration workflow becomes functional
- **NPX Experience**: Complete feature set available via GitHub NPX

### Long-term Value
- **Agent Effectiveness**: AI agents can guide users through full exploration workflow
- **User Engagement**: Interactive exploration increases simulation usage
- **Framework Completeness**: Core value proposition fully realized

---

*Design Status: Ready for Implementation*  
*Priority: HIGH - Closes critical documentation gap*  
*Estimated Development: 2-3 hours for basic implementation*