# Terminal Interactive Mode Implementation Plan

## Problem Statement

Interactive mode needs to work properly in real terminals with TTY support, while gracefully failing in environments like Claude Code that don't support interactive input.

**Goal**: Create true readline-based interactivity that works in real terminals and clearly errors in unsupported environments.

## Solution: Terminal-Only Interactive Mode

### Core Architecture

Use **standard readline interface** for true interactivity:
- Works in real terminals with TTY support
- Proper menu-driven navigation with immediate responses
- Clear error messages for unsupported environments
- No workarounds for non-interactive environments

## Implementation Plan

### 1. Environment Detection

#### TTY Support Check
```typescript
function isInteractiveEnvironment(): boolean {
  return !!(
    process.stdin.isTTY && 
    process.stdout.isTTY &&
    !process.env.CLAUDECODE &&
    !process.env.CLAUDE_CODE_SSE_PORT
  )
}
```

#### Error Handling
- Detect non-interactive environments (Claude Code, CI/CD, etc.)
- Throw clear error message with alternatives
- Suggest using `--set` flags for parameter modification

### 2. Interactive Interface

#### Entry Point
```bash
npm run cli -- run ai-cost-impact --interactive
```
(Works only in real terminals)

#### Menu Navigation
- Simple readline interface with menu options
- User types single characters (r, p, c, q, etc.)
- Immediate response and action execution
- Parameter editing with validation
- Simulation re-running with updated parameters

### 3. User Experience Flow

#### Terminal Interactive Session
```
🎯 Interactive AI Cost Impact Analysis

📊 Initial Results:
  • Year 1 AI Costs: $21,420
  • Final Year Costs: $116,544
  • 5-Year Total: $315,824

🎮 Interactive Commands:
  [r] Run again         [p] Edit parameters    [c] Edit config
  [s] Save changes      [e] Export results     [h] Help
  [q] Quit

> _
```

User types 'p' and presses Enter to edit parameters, gets immediate response.

#### After Parameter Edit
```
✅ Updated Engineering Team Size: 45 → 100

📊 Updated Parameters:
  1. Engineering Team Size: 100 (+55)
  2. Cost Increase Rate: 35%
  3. Productivity Gain: 28%

🎮 Next Actions:
  npm run cli -- interactive continue --action=run-sim
  npm run cli -- interactive continue --action=edit-param --param=costIncreaseRate --value=50

💡 Run simulation to see impact of your changes
```

### 4. Technical Implementation

#### File Structure
```
src/cli/interactive/
├── session-manager.ts         # Session state management
├── action-handlers/
│   ├── edit-parameter.ts      # Parameter editing actions
│   ├── run-simulation.ts      # Simulation execution
│   ├── show-parameters.ts     # Display current state
│   ├── reset-parameters.ts    # Reset to defaults
│   ├── compare-results.ts     # Compare simulation results
│   └── save-parameters.ts     # Export parameters
├── session-storage.ts         # File-based persistence
└── interactive-command.ts     # CLI command entry point
```

#### Core Classes
```typescript
class InteractiveSessionManager {
  createSession(simulationId: string): Session
  loadSession(sessionId: string): Session | null
  saveSession(session: Session): void
  executeAction(sessionId: string, action: Action): ActionResult
  cleanupExpiredSessions(): void
}

interface ActionHandler {
  execute(session: Session, params: ActionParams): ActionResult
}
```

### 5. CLI Integration

#### New CLI Commands
- `interactive continue` - Execute action in existing session
- `interactive list` - Show active sessions
- `interactive cleanup` - Remove expired sessions

#### Parameter Handling
- Existing `--set` flags work with interactive mode
- Session remembers parameter changes between commands
- Validation applied to all parameter changes

### 6. Environment Compatibility

#### Claude Code Environment
- ✅ No blocking input required
- ✅ Commands work via copy/paste
- ✅ State persists between executions
- ✅ Clear visual feedback

#### Terminal Environment  
- ✅ Same commands work identically
- ✅ Shell history/tab completion support
- ✅ Copy/paste or manual typing
- ✅ Consistent experience

## Implementation Steps

### Phase 1: Core Session Management
1. Create session storage system
2. Implement session lifecycle management
3. Add session cleanup mechanisms
4. Create CLI command structure

### Phase 2: Action Handlers
1. Implement parameter editing actions
2. Add simulation execution actions
3. Create state display actions
4. Build comparison and reset features

### Phase 3: User Experience Polish
1. Design clear menu displays
2. Add helpful error messages
3. Implement session expiration handling
4. Add comprehensive help text

### Phase 4: Testing & Validation
1. Test in Claude Code environment
2. Test in various terminal environments
3. Validate session persistence
4. Test parameter validation

## Success Criteria

### Functional Requirements
- ✅ User can start interactive session
- ✅ User can edit parameters via commands
- ✅ User can run simulations with modified parameters
- ✅ User can see results and make further changes
- ✅ Session state persists between commands
- ✅ Works identically in Claude Code and terminals

### User Experience Requirements  
- ✅ Clear, intuitive command menus
- ✅ Immediate feedback on all actions
- ✅ Helpful error messages
- ✅ No confusing or broken states
- ✅ Discoverable next actions

### Technical Requirements
- ✅ No blocking input mechanisms
- ✅ Reliable state persistence
- ✅ Proper session cleanup
- ✅ Parameter validation
- ✅ Error handling

## Benefits

This approach provides:
- **True Interactivity**: User makes choices and sees immediate results
- **Universal Compatibility**: Works in any command environment  
- **Stateful Experience**: Changes persist across command executions
- **Clean Interface**: Simple commands, clear feedback
- **Reliable**: File-based state survives process restarts

This solves the fundamental Claude Code input limitation while creating an excellent interactive experience in all environments.