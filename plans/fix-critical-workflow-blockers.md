# Fix Critical Workflow Blockers Plan

## Strategic Context

### Problem Statement
Despite achieving production-grade reliability (87 passing tests, bulletproof validation), the Monte Carlo simulation framework has critical workflow blockers that prevent user adoption:

1. **Discovery Failure**: `list` command returns "No valid simulation configurations found" despite 8+ working examples
2. **Creation Failure**: Interactive creation workflow crashes immediately, blocking custom simulation development  
3. **Trust Failure**: README promises NPX access that doesn't work, destroying first-user credibility
4. **Workflow Friction**: No clear path from discovery → customization → execution

These foundational issues prevent users from experiencing the framework's excellent technical architecture.

### Business Impact
- **100% user drop-off** at discovery phase (can't find simulations)
- **Zero custom simulation creation** (interactive workflow broken)
- **Immediate credibility loss** from NPX false promises
- **Agent adoption blocked** by non-functional core commands

### Strategic Priority
**Foundation before features** - Fix core user workflows before adding advanced capabilities like export features. Export is meaningless if users can't discover, create, or run simulations.

## Root Cause Analysis

### Issue #1: List Command Failure
```bash
npm run cli list
# Output: "No valid simulation configurations found"
# Expected: Lists examples/simulations/*.yaml files
```

**Root Cause**: Directory lookup hardcoded to `./simulations` but examples are in `examples/simulations/`  
**Evidence**: Framework has 8 validated working examples that should be discoverable  
**Impact**: Complete adoption blocker - users cannot find available simulations

### Issue #2: Interactive Creation Failure  
```bash
npm run cli create --interactive
# Immediately exits with user force closure
```

**Root Cause**: Likely prompt handling or async/await issues in interactive CLI  
**Evidence**: User reports immediate failure without interaction  
**Impact**: Primary simulation creation workflow completely broken

### Issue #3: NPX Documentation Mismatch
```bash
npx github:rmurphey/monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml
# README claims this works but likely fails without npm publication
```

**Root Cause**: Documentation promises functionality that doesn't exist  
**Evidence**: Package not published to npm, NPX GitHub access questionable  
**Impact**: First-user experience failures destroy framework credibility

### Issue #4: Workflow Guidance Gap
**Root Cause**: No clear user journey from discovery to execution  
**Evidence**: Users don't know how to go from `list` to `run` to customization  
**Impact**: Even when basic commands work, users struggle with workflow

## User Story Impact

### Current (Broken) User Journey
1. **Discovery**: `npm run cli list` → "No simulations found" → User gives up ❌
2. **Alternative Discovery**: User explores filesystem manually → Finds examples → Confused about workflow
3. **Creation**: `npm run cli create --interactive` → Immediate crash → User gives up ❌  
4. **NPX Route**: Follow README NPX instructions → Command failures → User loses trust ❌

### Target (Fixed) User Journey  
1. **Discovery**: `npm run cli list` → Shows 8 available simulations → User picks one ✅
2. **Execution**: `npm run cli run simple-roi-analysis` → Works immediately → User gains confidence ✅
3. **Customization**: `npm run cli create --interactive` → Guided creation workflow → User creates custom simulation ✅
4. **Advanced Usage**: Parameter overrides, validation, iteration → User becomes power user ✅

## Technical Requirements

### Fix #1: List Command Discovery (Priority 1)
```typescript
// Current: Only looks in ./simulations  
// Target: Look in examples/simulations/, ./simulations, and configurable paths

interface SimulationDiscovery {
  searchPaths: string[];          // ['examples/simulations', 'simulations', './']
  recursive: boolean;             // Search subdirectories
  validExtensions: string[];      // ['.yaml', '.yml']
  validationLevel: 'basic' | 'full';  // Quick scan vs full validation
}

// Expected output:
// Available simulations:
//   simple-roi-analysis - Basic ROI calculation with risk modeling
//   technology-investment - IT investment analysis with adoption curves  
//   team-scaling-decision - Human resource scaling with productivity modeling
//   [... 5 more ...]
```

### Fix #2: Interactive Creation Workflow (Priority 2)  
```typescript
// Identify and fix root cause in interactive prompts
interface InteractiveCreation {
  steps: CreationStep[];          // Guided workflow steps
  validation: ValidationLevel;    // Real-time input validation  
  templates: TemplateOption[];    // Base templates to start from
  outputPath: string;             // Where to save created simulation
}

// Expected workflow:
// 1. Choose base template (simple-roi, technology-investment, custom)
// 2. Configure parameters interactively with validation
// 3. Preview generated YAML
// 4. Save and validate new simulation
// 5. Offer to run immediately for testing
```

### Fix #3: NPX Documentation Alignment (Priority 3)
**Option A: Fix NPX support**
- Publish package to npm registry
- Ensure all documented NPX commands work
- Test npx installation path

**Option B: Remove NPX claims (Recommended)**
- Update README to focus on git clone workflow
- Remove misleading "Zero-Setup NPX Access" sections  
- Provide clear git-based quick start

### Fix #4: Workflow Guidance Enhancement (Priority 4)
```bash
# Enhanced CLI help and guidance
npm run cli --help          # Shows clear workflow: list → run → create → customize
npm run cli list --help     # Shows discovery options and filtering
npm run cli run --help      # Shows execution options and parameter overrides  
npm run cli create --help   # Shows creation workflows and templates
```

## Implementation Architecture

### Component Changes Required

#### src/cli/commands/list.ts
```typescript
// Current: Hard-coded ./simulations lookup
// Target: Configurable multi-path discovery

class SimulationDiscovery {
  private readonly searchPaths = [
    'examples/simulations',     // Framework examples
    'simulations',              // User simulations  
    '.',                        // Current directory
  ];
  
  async discoverSimulations(): Promise<SimulationInfo[]> {
    // Multi-path recursive search with validation
    // Return rich simulation metadata for display
  }
}
```

#### src/cli/commands/create.ts  
```typescript
// Debug and fix interactive prompt handling
// Likely issues: async/await, signal handling, process.stdin

class InteractiveCreator {
  async createInteractive(): Promise<void> {
    try {
      // Robust prompt handling with error recovery
      // Template selection → Parameter configuration → Validation → Save
    } catch (error) {
      // Graceful error handling with helpful messages
    }
  }
}
```

#### CLI Help System Enhancement
```typescript
// Enhanced help text with workflow guidance
class HelpSystem {
  generateWorkflowGuidance(): string {
    return `
    Common workflows:
    1. Discover: npm run cli list
    2. Run example: npm run cli run <simulation-name>  
    3. Customize: npm run cli run <simulation> --set param=value
    4. Create new: npm run cli create --interactive
    `;
  }
}
```

## Development Phases

### Phase 1: Critical Discovery Fix (Day 1 - 4 hours)
**Morning (2 hours):**
- [ ] **Analyze current list command implementation** - Identify hardcoded paths
- [ ] **Implement multi-path discovery** - Add examples/simulations to search paths
- [ ] **Test with existing examples** - Verify all 8 examples discovered correctly  
- [ ] **Update list output format** - Include descriptions and categories

**Afternoon (2 hours):**  
- [ ] **Add filtering and search options** - Category, tag, keyword filtering
- [ ] **Enhance display formatting** - Rich output with simulation metadata
- [ ] **Write comprehensive tests** - Test discovery across multiple paths
- [ ] **Update CLI help text** - Document list command options and workflow

**Success Criteria:**
- ✅ `npm run cli list` shows all 8 existing examples
- ✅ Rich output includes simulation names, descriptions, categories
- ✅ Filtering options work (by tag, category, keyword)
- ✅ Clear help text explains discovery workflow

### Phase 2: Interactive Creation Fix (Day 2-3 - 8 hours)
**Day 2 (4 hours):**
- [ ] **Debug interactive creation failure** - Identify root cause of immediate exit
- [ ] **Fix prompt handling** - Resolve async/await or signal handling issues
- [ ] **Test basic interactive flow** - Ensure prompts appear and accept input
- [ ] **Add error recovery** - Graceful handling of user interruption

**Day 3 (4 hours):**
- [ ] **Implement guided creation workflow** - Template selection → Configuration → Save  
- [ ] **Add real-time validation** - Parameter validation with helpful error messages
- [ ] **Add preview functionality** - Show generated YAML before saving
- [ ] **Test creation → execution workflow** - Create simulation then run it immediately

**Success Criteria:**
- ✅ `npm run cli create --interactive` launches without crashing
- ✅ Guided workflow completes successfully with valid output
- ✅ Real-time validation catches parameter errors
- ✅ Created simulations can be run immediately

### Phase 3: Documentation Alignment (Day 4 - 2 hours)  
**Quick Investigation (30 minutes):**
- [ ] **Test current NPX claims** - Verify which NPX commands actually work
- [ ] **Assess NPX implementation effort** - Determine if fixing is worth it

**Documentation Update (1.5 hours):**
- [ ] **Update README quick start** - Remove or fix NPX references  
- [ ] **Enhance git-based workflow** - Clear clone → install → run instructions
- [ ] **Test all documented examples** - Ensure every README example works
- [ ] **Update AGENT.md** - Fix agent-facing workflow documentation

**Success Criteria:**
- ✅ All README examples work as documented
- ✅ Clear git-based quick start workflow  
- ✅ No misleading NPX claims (unless they actually work)
- ✅ Agent documentation aligns with working functionality

### Phase 4: Workflow Enhancement (Day 5 - 4 hours)
**Morning (2 hours):**
- [ ] **Enhanced CLI help system** - Workflow guidance in help text
- [ ] **Command chaining suggestions** - list → run → create workflow hints  
- [ ] **Add examples to help output** - Show common usage patterns
- [ ] **Parameter discovery integration** - Link list output to parameter exploration

**Afternoon (2 hours):**
- [ ] **Integration testing** - End-to-end workflow testing from discovery to creation
- [ ] **User experience validation** - Time discovery-to-execution workflow  
- [ ] **Documentation testing** - Validate all updated documentation examples
- [ ] **Performance testing** - Ensure list command is fast even with many simulations

**Success Criteria:**
- ✅ Clear user workflow from discovery to execution
- ✅ Help system provides actionable guidance
- ✅ Discovery-to-execution time <5 minutes for new users
- ✅ All components work together seamlessly

## Testing Strategy

### Unit Tests
```typescript
describe('SimulationDiscovery', () => {
  it('should discover simulations in examples/simulations', () => {
    const discovery = new SimulationDiscovery();
    const simulations = await discovery.discoverSimulations();
    expect(simulations.length).toBeGreaterThan(6);
  });
  
  it('should include simulation metadata', () => {
    // Test rich metadata extraction from YAML headers
  });
  
  it('should handle missing directories gracefully', () => {
    // Test when simulations/ doesn't exist
  });
});

describe('InteractiveCreator', () => {
  it('should complete creation workflow without crashing', () => {
    // Mock user input and test full workflow
  });
  
  it('should validate parameters in real-time', () => {
    // Test parameter validation during creation
  });
});
```

### Integration Tests  
```bash
# Test complete user workflows
npm run test:workflow-discovery     # list → run workflow
npm run test:workflow-creation      # create → validate → run workflow  
npm run test:documentation-examples # All README examples work
npm run test:agent-workflows        # Agent-specific workflow patterns
```

### User Acceptance Testing
```bash
# Time-boxed user workflows (should complete in <5 minutes each)
1. New user discovers and runs first simulation
2. User creates custom simulation interactively  
3. User customizes existing simulation with parameters
4. Agent programmatically discovers and runs multiple simulations
```

## Success Criteria

### Immediate Impact (Week 1)
- [ ] **Discovery Success**: `npm run cli list` shows all available simulations 
- [ ] **Creation Success**: Interactive creation completes without crashes
- [ ] **Documentation Accuracy**: All documented examples work as described
- [ ] **Workflow Clarity**: Users can go from discovery to execution in <5 minutes

### User Experience Metrics
- [ ] **Time to First Success**: New user runs first simulation within 5 minutes
- [ ] **Creation Success Rate**: Interactive creation completes >90% of attempts
- [ ] **Documentation Trust**: Zero gaps between documentation and functionality
- [ ] **Agent Effectiveness**: AI agents can discover and use framework without human intervention

### Technical Quality Metrics
- [ ] **Test Coverage**: All critical path workflows covered by automated tests
- [ ] **Error Handling**: Graceful degradation and helpful error messages
- [ ] **Performance**: List command executes in <2 seconds even with many simulations
- [ ] **Compatibility**: Works across macOS, Linux, and Windows environments

## Risk Mitigation

### Technical Risks
- **Risk**: List command changes break existing workflows
- **Mitigation**: Maintain backward compatibility, comprehensive testing

- **Risk**: Interactive creation fix introduces new bugs  
- **Mitigation**: Thorough debugging, incremental testing, rollback capability

### User Experience Risks
- **Risk**: Documentation changes confuse existing users
- **Mitigation**: Clear migration notes, maintain working examples

- **Risk**: Workflow changes disrupt agent patterns
- **Mitigation**: Update AGENT.md simultaneously, test agent workflows

## Dependencies

### Prerequisites
- Current codebase with 87 passing tests ✅
- Working example simulations in examples/simulations/ ✅  
- Functional CLI infrastructure ✅
- YAML validation system ✅

### External Dependencies
- No new external dependencies required
- Uses existing CLI framework (commander.js, inquirer.js)
- Leverages current validation system

## Documentation Updates Required

### README.md
- Fix or remove NPX references
- Clear git-based quick start workflow
- Discovery → execution → creation workflow examples

### docs/CLI_REFERENCE.md  
- Updated list command documentation
- Interactive creation workflow guide
- Complete workflow examples

### docs/AGENT.md
- Working command patterns (no broken NPX references)
- Programmatic discovery and execution workflows
- Agent-friendly creation patterns

## Next Steps

1. **Create detailed design document** in designs/fix-critical-workflow-blockers.md
2. **Start with Phase 1** (list command fix) - highest impact, lowest risk
3. **Test thoroughly** with existing examples to ensure no regressions
4. **Get user feedback** on improved discovery workflow
5. **Proceed incrementally** through remaining phases

This plan addresses the foundational user experience issues that currently prevent framework adoption, providing far more value than advanced features like export capabilities. Once users can successfully discover, run, and create simulations, then advanced features like export become valuable additions.