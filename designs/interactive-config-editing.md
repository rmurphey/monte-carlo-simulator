# Interactive Config Editing Design

**Status:** Ready for Implementation  
**Priority:** High  
**Scope:** Major UX Feature

## Problem Statement

Users need to rapidly prototype and iterate on simulation configurations beyond simple parameter adjustment. The current `--interactive` flag concept focuses only on parameter tweaking, but users want to modify the entire simulation config - business logic, parameter definitions, outputs, and metadata - with immediate feedback.

## User Stories

### Primary User Story: Rapid Prototyping
**As a business analyst**, I want to modify simulation logic and see results immediately so that I can iterate quickly on business models without switching between files and terminal.

**Acceptance Criteria:**
- Can edit full YAML configuration from within running simulation
- Changes validated immediately with clear error messages
- Can test changes with quick runs before full execution
- Can undo changes and revert to previous versions

### Secondary User Story: Learning & Experimentation
**As a simulation creator**, I want to safely experiment with config changes so that I can understand how different settings affect results.

**Acceptance Criteria:**
- Original config files remain untouched during experimentation
- Can add/remove parameters and see immediate impact
- Can save interesting variations for future use
- Clear feedback on what changed between runs

## Technical Design

### Enhanced `--interactive` Flag Architecture

```typescript
// Core session management
class InteractiveSimulationSession {
  private config: SimulationConfig
  private originalConfigPath: string
  private tempConfigPath: string
  private lastResults: SimulationResults | null
  private configHistory: ConfigHistoryEntry[]
  
  async start(simulationPath: string, options: RunOptions): Promise<void>
  async runSimulation(): Promise<void>
  async enterMainLoop(): Promise<void>
  async handleCommand(command: string): Promise<void>
}

interface ConfigHistoryEntry {
  config: SimulationConfig
  timestamp: Date
  description: string
}
```

### User Workflow Design

#### Phase 1: Initial Run & Command Interface
```
🎯 Marketing Campaign ROI - Interactive Mode

Running initial simulation with current config...
✅ Completed 1000 iterations in 2.3s

📊 Results Summary:
Mean ROI: 127%    90th percentile: 189%    Risk of Loss: 23%

🎮 Interactive Commands:
  [r] Run again         [p] Edit parameters    [c] Edit config
  [s] Save changes      [e] Export results     [h] Help
  [q] Quit

Quick Actions: Ctrl+R (re-run) | Ctrl+S (save) | Ctrl+T (test run)
> 
```

#### Phase 2: Config Editing Sub-Menu
```
> c
📝 Configuration Editor

┌─ Current Config ─────────────────────────────────────┐
│ Name: Marketing Campaign ROI Analysis               │
│ Parameters: 9    Outputs: 4    Logic: 15 lines     │
│ Last Modified: Original config                      │
└─────────────────────────────────────────────────────┘

Config Editor Commands:
  [e] Edit full YAML    [p] Quick param edit   [l] Edit logic only
  [a] Add parameter     [d] Delete parameter   [o] Edit outputs
  [i] Edit basic info   [t] Test config        [u] Undo changes
  [r] Run with changes  [b] Back to main menu
> 
```

#### Phase 3: Live YAML Editing Experience
```
> e
📝 Opening config in editor...
  Editor: $EDITOR (/usr/bin/nano)
  File: /tmp/monte-carlo-session-abc123.yaml

[User edits in external editor, saves and exits]

✅ Config updated successfully
🔍 Changes detected:
  • Modified parameter: conversionRate (1.5% → 2.1%)
  • Updated simulation logic: added competitor analysis
  • Added new output: competitorImpact

⚙️  Validation Results:
  ✅ YAML syntax valid
  ✅ All parameters referenced in logic  
  ✅ Output calculations valid
  ✅ Required fields present

[t] Test run (100 iterations)    [r] Full run (1000 iterations)
[e] Edit again                   [u] Undo changes
> 
```

### Command Interface Specification

#### Main Interactive Loop Commands
```typescript
const MAIN_COMMANDS: Record<string, InteractiveCommand> = {
  'r': {
    key: 'r',
    description: 'Run simulation again with current config',
    action: () => this.runSimulation()
  },
  'p': {
    key: 'p', 
    description: 'Quick parameter editing (guided prompts)',
    action: () => this.quickParameterEdit()
  },
  'c': {
    key: 'c',
    description: 'Full configuration editing mode', 
    action: () => this.enterConfigEditMode()
  },
  's': {
    key: 's',
    description: 'Save current config to file',
    action: () => this.saveConfig()
  },
  'e': {
    key: 'e',
    description: 'Export results (CSV/JSON)',
    action: () => this.exportResults()
  },
  'v': {
    key: 'v',
    description: 'View current results and charts',
    action: () => this.viewResults()
  },
  'h': {
    key: 'h', 
    description: 'Help and command reference',
    action: () => this.showHelp()
  },
  'q': {
    key: 'q',
    description: 'Quit interactive mode',
    action: () => this.quit()
  }
}
```

#### Config Editor Sub-Commands
```typescript
const CONFIG_COMMANDS: Record<string, InteractiveCommand> = {
  'e': {
    key: 'e',
    description: 'Edit full YAML configuration in $EDITOR',
    action: () => this.editFullConfig()
  },
  'p': {
    key: 'p',
    description: 'Quick parameter editing with prompts',
    action: () => this.quickParameterEdit()
  },
  'l': {
    key: 'l',
    description: 'Edit simulation logic only',
    action: () => this.editLogicOnly()
  },
  'a': {
    key: 'a',
    description: 'Add new parameter (guided wizard)',
    action: () => this.addParameter()
  },
  'd': {
    key: 'd',
    description: 'Delete parameter (select from list)',
    action: () => this.deleteParameter()
  },
  'o': {
    key: 'o',
    description: 'Edit output definitions',
    action: () => this.editOutputs()
  },
  'i': {
    key: 'i',
    description: 'Edit basic info (name, description, tags)',
    action: () => this.editBasicInfo()
  },
  't': {
    key: 't',
    description: 'Test config with quick run (100 iterations)',
    action: () => this.testConfig()
  },
  'u': {
    key: 'u',
    description: 'Undo recent changes',
    action: () => this.undoChanges()
  },
  'r': {
    key: 'r',
    description: 'Run simulation with current config',
    action: () => this.runSimulation()
  },
  'b': {
    key: 'b',
    description: 'Back to main menu',
    action: () => this.exitConfigEditMode()
  }
}
```

#### Quick Actions (Keyboard Shortcuts)
- **Ctrl+R**: Instant re-run with current config
- **Ctrl+S**: Quick save to original file location
- **Ctrl+T**: Quick test run (100 iterations)
- **Ctrl+C**: Exit gracefully with cleanup

## Implementation Architecture

### Core Components

#### 1. Interactive Session Manager
```typescript
// src/cli/interactive/session-manager.ts
export class InteractiveSimulationSession {
  private config: SimulationConfig
  private originalConfigPath: string
  private tempManager: TempConfigManager
  private editor: InteractiveConfigEditor
  private results: SimulationResults | null
  
  constructor(configPath: string, options: RunOptions)
  
  async initialize(): Promise<void>
  async runMainLoop(): Promise<void>
  async cleanup(): Promise<void>
}
```

#### 2. Configuration Editor
```typescript
// src/cli/interactive/config-editor.ts  
export class InteractiveConfigEditor {
  async editFullConfig(configPath: string): Promise<SimulationConfig>
  async editParametersOnly(config: SimulationConfig): Promise<SimulationConfig>
  async editLogicOnly(config: SimulationConfig): Promise<SimulationConfig>
  async addParameter(config: SimulationConfig): Promise<SimulationConfig>
  async deleteParameter(config: SimulationConfig): Promise<SimulationConfig>
  async validateConfig(config: SimulationConfig): Promise<ValidationResult>
  async showConfigDiff(oldConfig: SimulationConfig, newConfig: SimulationConfig): void
}
```

#### 3. Temporary File Manager
```typescript
// src/cli/interactive/temp-config-manager.ts
export class TempConfigManager {
  async createTempConfig(original: SimulationConfig): Promise<string>
  async saveTempConfig(config: SimulationConfig, tempPath: string): Promise<void>
  async saveToOriginal(tempPath: string, originalPath: string): Promise<void>
  async discardChanges(tempPath: string): Promise<void>
  async createBackup(originalPath: string): Promise<string>
  async cleanup(): Promise<void>
}
```

### Integration Strategy

#### Extend Existing run-simulation.ts
```typescript
// Modify existing run-simulation.ts
export async function runSimulation(simulation: string, options: RunOptions): Promise<void> {
  // ... existing logic ...
  
  // NEW: Interactive mode detection
  if (options.interactive) {
    const session = new InteractiveSimulationSession(configPath, options)
    await session.start()
    return
  }
  
  // ... existing non-interactive logic ...
}
```

#### Leverage Existing Infrastructure
- **ConfigurationLoader**: YAML parsing and validation
- **ConfigurableSimulation**: Runtime execution
- **inquirer.js patterns**: Consistent prompt experience
- **Existing validation**: Parameter and schema validation
- **File handling**: Build on current file management patterns

### Editor Integration

#### External Editor Support
```typescript
async function openConfigInEditor(configPath: string): Promise<boolean> {
  const editor = process.env.EDITOR || process.env.VISUAL || 'nano'
  
  console.log(chalk.blue(`📝 Opening in ${editor}...`))
  console.log(chalk.gray(`File: ${configPath}`))
  console.log(chalk.gray('Save and exit to continue'))
  
  const { spawn } = await import('child_process')
  
  return new Promise((resolve) => {
    const child = spawn(editor, [configPath], {
      stdio: 'inherit',
      shell: true
    })
    
    child.on('exit', (code) => {
      console.log(chalk.green('✅ Editor closed'))
      resolve(code === 0)
    })
    
    child.on('error', (error) => {
      console.error(chalk.red(`❌ Editor error: ${error.message}`))
      resolve(false)
    })
  })
}
```

### Validation & Feedback System

#### Real-Time Config Validation
```typescript
interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  changes: ConfigChange[]
}

interface ConfigChange {
  type: 'parameter' | 'logic' | 'output' | 'metadata'
  action: 'added' | 'modified' | 'deleted'
  path: string
  oldValue?: any
  newValue?: any
  description: string
}
```

#### Change Detection and Display
```typescript
async function showConfigChanges(oldConfig: SimulationConfig, newConfig: SimulationConfig): Promise<void> {
  const changes = detectChanges(oldConfig, newConfig)
  
  if (changes.length === 0) {
    console.log(chalk.gray('No changes detected'))
    return
  }
  
  console.log(chalk.blue.bold(`🔍 Changes detected (${changes.length}):`))
  
  changes.forEach(change => {
    const icon = change.action === 'added' ? '➕' : change.action === 'modified' ? '📝' : '❌'
    console.log(`  ${icon} ${change.description}`)
    
    if (change.oldValue && change.newValue) {
      console.log(chalk.gray(`    ${change.oldValue} → ${change.newValue}`))
    }
  })
}
```

## Agent Experience Optimization

### Agent-Friendly Command Patterns
The interactive mode should support agents through:

1. **Programmatic commands**: Accept command sequences via environment or file
2. **Batch mode support**: Process multiple edits in sequence
3. **JSON output mode**: Machine-readable results and status
4. **Validation-first approach**: Comprehensive config checking before execution

### Agent Workflow Integration
```bash
# Agent can drive interactive session programmatically
echo "c\ne\nr\ns\nq" | npm run cli -- run simulation --interactive

# Or via environment variable
MONTE_CARLO_COMMANDS="edit_config,test_run,save,quit" npm run cli -- run simulation --interactive
```

## Implementation Plan

### Phase 1: Core Session Framework (Week 1)
- [ ] Create InteractiveSimulationSession class
- [ ] Implement basic command loop with readline
- [ ] Add main menu commands (run, quit, help)
- [ ] Test integration with existing run-simulation.ts

### Phase 2: Configuration Editing (Week 2) 
- [ ] Create InteractiveConfigEditor class
- [ ] Implement external editor integration
- [ ] Add config validation and change detection
- [ ] Create TempConfigManager for safe file handling

### Phase 3: Advanced Editing Features (Week 3)
- [ ] Add parameter editing wizards (add/delete/modify)
- [ ] Implement logic-only and output-only editing modes
- [ ] Add undo/redo functionality with config history
- [ ] Create guided parameter addition wizard

### Phase 4: Polish & Agent Integration (Week 4)
- [ ] Add keyboard shortcuts (Ctrl+R, Ctrl+S, etc.)
- [ ] Implement result viewing and export from session
- [ ] Add agent-friendly command scripting
- [ ] Create comprehensive help system and documentation

## Success Criteria

### User Experience Metrics
- [ ] Can edit config and see results in under 30 seconds
- [ ] Config validation catches 95%+ of syntax errors immediately
- [ ] Zero data loss - original configs never corrupted
- [ ] Undo functionality works for all editing operations

### Technical Metrics
- [ ] All existing CLI functionality remains unchanged
- [ ] Interactive mode integrates seamlessly with current architecture
- [ ] Temporary files properly cleaned up on exit/crash
- [ ] Editor integration works with common editors (nano, vim, code, etc.)

### Agent Integration Metrics
- [ ] Agents can drive interactive sessions programmatically
- [ ] Machine-readable output available for all operations
- [ ] Command sequences can be automated and batched
- [ ] Config changes can be validated before execution

## Future Enhancements

### Advanced Features (Post-MVP)
- **Multi-config comparison**: Edit and compare multiple config variants
- **Template integration**: Apply business intelligence templates during editing
- **Live preview**: Real-time parameter impact visualization
- **Collaborative editing**: Share sessions across team members
- **Version control integration**: Git integration for config changes

### Agent Intelligence Features
- **Smart suggestions**: Recommend parameter ranges based on business context
- **Error recovery**: Automatic fixes for common config mistakes
- **Performance optimization**: Suggest iterations counts based on parameter complexity
- **Business intelligence**: Automatic ARR context injection during editing

---

*This design transforms the `--interactive` flag from simple parameter adjustment into a comprehensive simulation development environment while maintaining backward compatibility and building on existing framework architecture.*