# Phase 2 Workflow Blockers - Implementation Plan

## Overview

Strategic implementation plan for Phase 2 workflow blockers identified in the [technical design](../designs/phase-2-workflow-blockers-fix.md). Focuses on removing remaining user adoption barriers with incremental delivery.

## Implementation Phases

### 🔥 Phase 2A: Critical Fixes (Priority 1)
**Timeline**: 3-5 days  
**Impact**: Resolves major adoption blockers

#### Task 2A.1: NPX Distribution Fix
**Estimated Effort**: 4-6 hours

**Investigation Steps:**
```bash
# Test current NPX behavior
npx github:rmurphey/monte-carlo-simulator --help
npx github:rmurphey/monte-carlo-simulator list

# Check package.json bin configuration
# Verify dist/ directory completeness
# Test GitHub NPX limitations
```

**Implementation Options:**
1. **Option B (Recommended)**: Fix GitHub NPX workflow
   - Update `package.json` bin field to point to dist/cli/index.js
   - Ensure all dependencies are bundled or available
   - Add NPX-specific error handling and help
   - Test with fresh repository clone

2. **Option C (Fallback)**: Clear installation workflow
   - Create installation script in bin/install.sh
   - Add clear README section with git clone workflow
   - Provide troubleshooting guide

**Acceptance Criteria:**
- [ ] `npx github:rmurphey/monte-carlo-simulator list` works from any directory
- [ ] NPX commands match documented examples in README
- [ ] Clear error messages if NPX fails
- [ ] Alternative installation method documented

#### Task 2A.2: Discovery Consistency Fix  
**Estimated Effort**: 2-3 hours

**Implementation:**
```typescript
// Create unified discovery service
// src/cli/services/simulation-discovery.ts
export class SimulationDiscovery {
  private readonly searchPaths = [
    'examples/simulations',
    'simulations', 
    'scenarios'
  ]
  
  async discoverAll(): Promise<SimulationInfo[]>
  async discoverByCategory(category: string): Promise<SimulationInfo[]>
  async findById(id: string): Promise<SimulationInfo | null>
}
```

**Changes Required:**
- Extract discovery logic from `list-simulations.ts`
- Update `interactive-selection.ts` to use same discovery
- Ensure consistent sorting and presentation
- Add source indicators (framework vs user)

**Acceptance Criteria:**
- [ ] List and interactive commands show identical simulations
- [ ] Consistent ordering and metadata display
- [ ] Source indication clear (examples vs user simulations)

#### Task 2A.3: Interactive Creation Foundation
**Estimated Effort**: 6-8 hours

**Implementation Steps:**
1. Create missing `InteractiveConfigBuilder` class
2. Implement basic interactive workflow
3. Fix import error in `create-simulation.ts`
4. Add category selection and parameter wizard

**Core Features:**
```typescript
export class InteractiveConfigBuilder {
  async buildConfiguration(): Promise<SimulationConfig> {
    const name = await this.promptName()
    const category = await this.selectCategory()  
    const parameters = await this.defineParameters()
    const outputs = await this.defineOutputs()
    const logic = await this.selectLogicTemplate(category)
    
    return { name, category, parameters, outputs, simulation: { logic } }
  }
  
  async testConfiguration(config: SimulationConfig): Promise<boolean>
  async saveConfiguration(config: SimulationConfig): Promise<string>
}
```

**Acceptance Criteria:**
- [ ] `npm run cli create --interactive` launches interactive wizard
- [ ] Guided parameter creation with types and validation
- [ ] Category selection affects logic templates
- [ ] Generated simulations are immediately runnable

### ⚡ Phase 2B: Experience Improvements (Priority 2)
**Timeline**: 4-6 days
**Impact**: Professional tool quality

#### Task 2B.1: Professional Template System
**Estimated Effort**: 4-5 hours

**Template Categories:**
```typescript
const CATEGORY_TEMPLATES = {
  'Finance': {
    defaultParams: ['initialInvestment', 'expectedReturn', 'riskFactor'],
    logicTemplate: 'finance-roi-calculation.js',
    outputs: ['roi', 'paybackPeriod', 'netPresentValue']
  },
  'Marketing': {
    defaultParams: ['marketingSpend', 'conversionRate', 'customerLifetimeValue'],
    logicTemplate: 'marketing-roi-calculation.js', 
    outputs: ['customerAcquisitionCost', 'returnOnAdSpend', 'lifetimeValue']
  },
  'Technology': {
    defaultParams: ['implementationCost', 'productivityGain', 'adoptionRate'],
    logicTemplate: 'technology-roi-calculation.js',
    outputs: ['costSavings', 'productivityImprovement', 'roi']
  }
}
```

**Acceptance Criteria:**
- [ ] Category selection affects parameter suggestions
- [ ] Business-meaningful parameter names and defaults
- [ ] Industry-standard calculation templates
- [ ] Professional validation ranges

#### Task 2B.2: Parameter File Generation
**Estimated Effort**: 3-4 hours

**New Command Implementation:**
```bash
npm run cli generate-params <simulation-id> [options]
  --template <conservative|aggressive|balanced>
  --interactive
  --output <filename>
```

**Features:**
- Generate parameter files from simulation schemas
- Template-based value selection
- Interactive parameter customization
- Validation during generation

**Acceptance Criteria:**
- [ ] Generate valid parameter files for any simulation
- [ ] Template variations (conservative/aggressive/balanced)
- [ ] Interactive parameter value selection
- [ ] Generated files work with `--params` flag

### 🎨 Phase 2C: Polish & Validation (Priority 3)
**Timeline**: 2-3 days
**Impact**: Production readiness

#### Task 2C.1: Comprehensive Testing
**Estimated Effort**: 4-5 hours

**Test Coverage:**
- NPX workflow testing on clean systems
- Interactive creation end-to-end testing  
- Parameter file generation and usage
- Discovery consistency across commands
- Error handling and edge cases

#### Task 2C.2: Documentation Updates
**Estimated Effort**: 2-3 hours

**Documentation Changes:**
- Update README with working NPX examples
- Interactive creation workflow documentation
- Parameter file creation examples
- Troubleshooting guide for common issues

## Technical Implementation Details

### NPX Distribution Investigation

**Test Plan:**
```bash
# Test current state
mkdir /tmp/test-npx
cd /tmp/test-npx
npx github:rmurphey/monte-carlo-simulator list

# Investigate issues
# - Check if bin field is correct
# - Verify dist/ completeness  
# - Test dependency resolution
# - Validate CLI entry point
```

**Common NPX Issues:**
1. **Missing bin field** in package.json
2. **Incorrect path** to CLI entry point
3. **Missing dependencies** in dist/
4. **Permission issues** with executable files

### Interactive Builder Architecture

```typescript
// src/cli/interactive/config-builder.ts
export class InteractiveConfigBuilder {
  private inquirer = require('inquirer')
  private validator = new ConfigurationValidator()
  
  // Core workflow methods
  async buildConfiguration(): Promise<SimulationConfig>
  async selectCategory(): Promise<string>
  async defineParameters(): Promise<ParameterConfig[]>
  async defineOutputs(): Promise<OutputConfig[]>
  async selectLogicTemplate(category: string): Promise<string>
  
  // Validation and testing
  async testConfiguration(config: SimulationConfig): Promise<boolean>
  async saveConfiguration(config: SimulationConfig): Promise<string>
}
```

### Discovery Service Architecture

```typescript
// src/cli/services/simulation-discovery.ts
export interface SimulationInfo {
  id: string
  name: string
  category: string
  description: string
  path: string
  source: 'framework' | 'user' | 'scenario'
  tags: string[]
  parameterCount: number
  outputCount: number
}

export class SimulationDiscovery {
  async discoverAll(): Promise<SimulationInfo[]>
  async findById(id: string): Promise<SimulationInfo | null>
  async discoverByCategory(category: string): Promise<SimulationInfo[]>
  async discoverByTags(tags: string[]): Promise<SimulationInfo[]>
}
```

## Quality Assurance

### Testing Strategy
1. **Unit Tests**: Core discovery and builder logic
2. **Integration Tests**: End-to-end CLI workflows
3. **NPX Tests**: Fresh environment NPX testing
4. **Documentation Tests**: All examples must work

### Performance Targets
- **Discovery Speed**: <2 seconds for full simulation discovery
- **Interactive Creation**: <30 seconds for complete workflow
- **NPX Startup**: <5 seconds for initial command execution

### Error Handling
- **NPX Failures**: Clear fallback instructions
- **Interactive Cancellation**: Graceful exit without broken state
- **Invalid Templates**: Validation with helpful error messages
- **Network Issues**: Offline-capable functionality

## Risk Mitigation

### Technical Risks
1. **NPX Reliability**: Always provide git clone alternative
2. **Interactive Dependencies**: Version lock inquirer.js
3. **Template Complexity**: Start simple, iterate based on usage

### Process Risks  
1. **Scope Creep**: Stick to identified blockers only
2. **Perfect vs Good**: Ship working solutions, iterate later
3. **Testing Overhead**: Focus on critical paths first

## Success Metrics

### Phase 2A Success
- [ ] NPX workflow documented and tested
- [ ] Interactive creation replaces template generation
- [ ] Discovery consistency across all commands

### Phase 2B Success  
- [ ] Professional template quality 
- [ ] Parameter file generation working
- [ ] Category-specific business logic

### Phase 2C Success
- [ ] 100% documentation example success rate
- [ ] Performance targets met
- [ ] Error handling comprehensive

## Delivery Strategy

### Incremental Delivery
- Each phase can ship independently
- Phase 2A addresses critical adoption blockers
- Phase 2B adds professional polish
- Phase 2C ensures production readiness

### User Validation
- Test NPX workflow with external users
- Validate interactive creation with non-technical users  
- Gather feedback on template quality and business relevance

---

This implementation plan provides a clear path to resolve remaining workflow blockers while maintaining the framework's agent-friendly architecture and examples-first approach.