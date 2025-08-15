# Web Simulation Selector Implementation Plan

**Status**: Approved for Implementation  
**Priority**: High (Top item in ACTIVE_WORK.md)  
**Estimated Effort**: 4-7 hours  
**Target**: Complete functional simulation selector in web interface

## Problem Statement

The current web interface (`src/web/`) hard-codes a single "Simple ROI Analysis" simulation, but the framework has 13+ production-ready YAML simulation templates in `examples/simulations/`. Users cannot access these templates through the web interface, significantly limiting its utility.

## Current State Analysis

### ✅ Assets Available
- **Web Interface**: Fully functional with parameter editing, visualization, and configuration management
- **Simulation Templates**: 13+ validated YAML files with diverse business scenarios
- **Framework**: Production-ready with bulletproof validation and full test coverage
- **Infrastructure**: Vite dev server, TypeScript compilation, all tests passing

### ❌ Current Limitations
- Web view only shows hard-coded simulation
- No access to existing simulation library
- No way to test different business scenarios in web interface
- Disconnect between CLI capabilities and web functionality

## Implementation Plan

### Phase 1: Simulation Selector UI (1-2 hours)
**Goal**: Add dropdown for simulation selection

**Tasks**:
- Add simulation selector dropdown component above parameter form in sidebar
- Style dropdown to match existing design system
- Add loading states and error handling for dropdown
- Display simulation metadata (name, category, description) in dropdown options

**Files to Modify**:
- `src/web/index.html` - Add dropdown container
- `src/web/main.ts` - Add simulation loading logic
- CSS styling for dropdown in `index.html`

**Success Criteria**:
- Dropdown appears in sidebar with professional styling
- Shows "Loading simulations..." state
- Displays simulation names and descriptions
- Handles selection changes

### Phase 2: Dynamic Parameter Loading (2-3 hours)
**Goal**: Load simulation parameters dynamically based on selection

**Tasks**:
- Modify `loadDefaultSimulation()` to accept simulation selection
- Create simulation loader that parses YAML files via fetch
- Update `ParameterForm.generateForm()` to handle schema changes
- Preserve compatible parameter values when switching simulations
- Update configuration display when simulation changes

**Files to Modify**:
- `src/web/main.ts` - Core simulation loading logic
- `src/web/parameter-forms.ts` - Dynamic form generation
- `src/web/config-manager.ts` - Configuration updates

**Success Criteria**:
- Selecting simulation loads correct parameters
- Parameter form regenerates with new schema
- Configuration textarea updates automatically
- Compatible values preserved across switches

### Phase 3: Simulation Loading Infrastructure (1-2 hours)
**Goal**: Robust simulation management system

**Tasks**:
- Create simulation registry/loader for web context
- Add comprehensive error handling for invalid/missing simulations
- Implement simulation metadata caching
- Add fallback to default simulation on errors

**Files to Create/Modify**:
- `src/web/simulation-loader.ts` - New simulation loading utility
- `src/web/main.ts` - Integration with loader
- Error handling and user feedback

**Success Criteria**:
- Graceful handling of missing/invalid simulations
- Clear error messages for users
- Fallback behavior for edge cases
- Performance optimization with caching

## Technical Implementation Details

### Simulation Discovery
```typescript
// Load simulations from examples/simulations/
const simulationFiles = await fetch('/examples/simulations/manifest.json')
// Or scan directory if manifest not available
const simulations = await Promise.all(
  files.map(file => fetch(`/examples/simulations/${file}`))
)
```

### Parameter Schema Extraction
```typescript
// Parse YAML and extract parameter definitions
const simulation = yaml.parse(yamlContent)
const parameters = simulation.parameters
this.parameterForm.generateForm(parameters)
```

### State Management
```typescript
// Preserve compatible parameters across switches
const currentValues = this.parameterForm.getCurrentValues()
const compatibleValues = this.preserveCompatibleValues(currentValues, newSchema)
this.parameterForm.setValues(compatibleValues)
```

## User Experience Flow

1. **Load Web Interface**: Shows default simulation (Simple ROI Analysis)
2. **View Simulation Selector**: Dropdown shows all available simulations with descriptions
3. **Select Different Simulation**: Parameters update automatically, compatible values preserved
4. **Edit Parameters**: Standard parameter editing workflow continues
5. **Run Simulation**: Uses selected simulation logic and parameters
6. **Switch Simulations**: Seamless experience with state preservation

## Quality Assurance

### Testing Plan
- **Manual Testing**: Verify all 13+ simulations load correctly
- **Parameter Preservation**: Test value preservation across compatible parameters
- **Error Handling**: Test invalid simulations, network errors, malformed YAML
- **Performance**: Ensure smooth switching without lag
- **Cross-Browser**: Verify in multiple browsers

### Success Metrics
- All existing simulation templates accessible via web interface
- Smooth parameter switching with value preservation
- Professional user experience matching CLI functionality
- Zero regressions in existing web functionality

## Agent Impact

### Immediate Benefits
- **Complete Web Experience**: Agents can access all simulation templates via web
- **Visual Configuration**: Immediate feedback for YAML parameter testing
- **Business Scenario Access**: All 13+ business scenarios available in one interface
- **Rapid Prototyping**: Quick simulation testing and parameter adjustment

### Future Enablement
- **Template Management**: Foundation for simulation CRUD operations
- **Custom Simulations**: Platform for agent-generated simulation testing
- **Business Intelligence**: Visual access to all simulation categories
- **User Onboarding**: Professional demo environment for new users

## Dependencies

### Prerequisites
- ✅ Web dev server functional (`npm run dev:web`)
- ✅ All YAML templates validated and working
- ✅ TypeScript compilation working
- ✅ Existing web interface stable

### Risk Mitigation
- **Fallback Simulation**: Always maintain working default
- **Error Boundaries**: Graceful degradation for missing templates
- **Progressive Enhancement**: Core functionality works without selector
- **Backwards Compatibility**: No breaking changes to existing API

## Completion Criteria

### Phase 1 Complete
- [ ] Simulation dropdown visible and functional
- [ ] Shows all available simulations with metadata
- [ ] Professional styling consistent with existing design

### Phase 2 Complete
- [ ] Parameter forms update dynamically on simulation selection
- [ ] Configuration display reflects current simulation
- [ ] Compatible parameter values preserved across switches

### Phase 3 Complete
- [ ] Robust error handling for all edge cases
- [ ] Performance optimized with appropriate caching
- [ ] All 13+ simulations tested and working

### Final Success
- [ ] Web interface provides complete access to simulation library
- [ ] User experience matches or exceeds CLI functionality
- [ ] Foundation established for future simulation management features
- [ ] Documentation updated in ACTIVE_WORK.md

This implementation directly addresses the #1 priority in ACTIVE_WORK.md and creates the most impactful user-facing improvement possible with existing assets.