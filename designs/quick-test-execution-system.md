# Quick Test Execution System Design

## Problem Statement

Agents can generate YAML simulations perfectly, but have no immediate feedback on whether the generated simulation actually works. The simulation runner already exists and works great - we just need to connect it to the generation workflow.

### Current Agent Workflow Gap
```
Agent Query → YAML Generation → ❌ No immediate feedback
```

### Target Agent Workflow  
```
Agent Query → YAML Generation → Quick Test ✅ → See Results Immediately
```

### Business Need
Connect existing YAML generation with existing simulation runner to complete the feedback loop for agents.

## User Stories

### Primary Agent User Story
**As an AI agent generating Monte Carlo simulations,**  
**I want to immediately see if my generated YAML works,**  
**So I know the simulation actually runs and produces results.**

**Acceptance Criteria:**
- `npm run cli studio generate "query" --test` runs the generated simulation
- See the same results output as the normal simulation runner
- Get clear feedback if the simulation has errors

## Simple Implementation

**The simulation runner already exists and works perfectly.** We just need to connect YAML generation to the existing runner.

### What Already Works
```bash
# This generates YAML perfectly
npm run cli studio generate "marketing ROI analysis"

# This runs simulations perfectly  
npm run cli run templates/marketing-campaign-roi.yaml
```

### What We Need
```bash
# This should generate YAML AND run it
npm run cli studio generate "marketing ROI analysis" --test
```

### Implementation
**File**: `src/cli/index.ts` (studio generate command)

Add `--test` flag that:
1. Generates YAML (existing code)
2. Calls existing simulation runner on the generated YAML
3. Done

```typescript
.command('generate')
  .argument('<query>', 'Natural language description')  
  .option('--validate', 'Validate generated YAML')
  .option('--test', 'Run simulation with generated YAML')
  .option('-o, --output <file>', 'Save to file')
  .action(async (query, options) => {
    // Generate YAML (existing)
    const yamlContent = await generateFromNaturalLanguage(query)
    
    // Show generated YAML (existing)
    console.log('Generated YAML Configuration:')
    console.log('─'.repeat(50))
    console.log(yamlContent)
    
    // NEW: If --test flag, run the simulation
    if (options.test) {
      console.log('\n🧪 Running Quick Test...\n')
      
      // Write to temp file and run existing simulation runner
      const tempFile = `/tmp/test-${Date.now()}.yaml`
      await fs.writeFile(tempFile, yamlContent)
      
      // Use existing run-simulation command
      await runSimulationCommand(tempFile, { iterations: 100 })
      
      // Clean up
      await fs.unlink(tempFile)
    }
  })
```

## Implementation Plan

**Total Time: ~30 minutes**

1. **Add `--test` flag to studio generate command** (15 minutes)
2. **Wire up to existing simulation runner** (10 minutes)  
3. **Test with a few examples** (5 minutes)

That's it.

## Success Metrics

✅ **`npm run cli studio generate "query" --test` generates YAML and runs it**  
✅ **Shows the same output as the normal simulation runner**  
✅ **Catches errors if the generated simulation is broken**

That's it.

---

**Simple 30-minute implementation connecting existing YAML generation with existing simulation runner.**