# Interactive Config Editing

The interactive config editing feature transforms the Monte Carlo simulation framework into a comprehensive development environment for rapid simulation prototyping and iteration.

## Overview

Interactive mode enables real-time configuration editing with external editor integration, making it easy to:
- Modify simulation parameters, logic, and outputs
- Test changes immediately with quick runs
- Safely experiment with config variants
- Maintain config history with undo/redo functionality
- Save successful iterations permanently

## Getting Started

Launch any simulation in interactive mode:

```bash
npm run cli -- run examples/simulations/simple-roi-analysis.yaml --interactive
```

The session will:
1. **Load and run** the simulation with current config
2. **Display results** with statistical summary
3. **Enter command loop** for interactive editing

## Interactive Commands

### Main Session Commands

| Command | Description | Example |
|---------|-------------|---------|
| `r` | Run simulation again with current config | Re-execute with latest changes |
| `c` | Enter config editing mode | Access full configuration editor |
| `s` | Save current config to original file | Persist changes with backup |
| `e` | Export results (CSV/JSON) | Save simulation results |
| `h` | Show help and command reference | Display all available commands |
| `q` | Quit interactive mode | Exit with cleanup |

### Config Editor Commands

When you press `c` to enter config editing mode:

| Command | Description | Example |
|---------|-------------|---------|
| `e` | Edit full YAML in external editor | Opens config in $EDITOR |
| `l` | Edit simulation logic only | Modify business logic code |
| `t` | Test config with quick run (100 iterations) | Validate changes quickly |
| `u` | Undo recent changes | Revert to previous config |
| `r` | Run simulation with current config | Full execution with changes |
| `b` | Back to main menu | Return to main session |

### Quick Actions (Keyboard Shortcuts)

- **Ctrl+R**: Instant re-run with current config
- **Ctrl+S**: Quick save to original file location  
- **Ctrl+T**: Quick test run (100 iterations)
- **Ctrl+C**: Exit gracefully with cleanup

## External Editor Integration

The interactive editor supports multiple external editors through environment variables:

### Editor Priority
1. `$EDITOR` environment variable
2. `$VISUAL` environment variable  
3. `nano` (fallback default)

### Common Editor Examples
```bash
# Use VS Code
export EDITOR="code --wait"
npm run cli -- run simulation.yaml --interactive

# Use vim
export EDITOR="vim"
npm run cli -- run simulation.yaml --interactive

# Use nano (default)
npm run cli -- run simulation.yaml --interactive
```

### Editor Workflow
1. Press `c` to enter config editor
2. Press `e` to edit full YAML
3. Editor opens with temporary config file
4. Make changes and save in editor
5. Exit editor to return to session
6. Automatic validation and change detection
7. Test with `t` or run with `r`

## Safety Features

### Temporary File Management
- **Safe experimentation**: Original files never modified until explicitly saved
- **Automatic cleanup**: Temporary files removed on session exit
- **Backup creation**: Original files backed up before saving changes
- **Crash recovery**: Temporary files cleaned up even on unexpected exit

### Config History and Undo
- **Change tracking**: All modifications tracked with timestamps
- **Undo functionality**: Revert to any previous config state
- **Change detection**: Automatic diff display showing what changed
- **Session isolation**: Each session maintains independent history

## Validation and Error Handling

### Real-Time Validation
When config changes are made:
- **YAML syntax**: Immediate syntax validation
- **Schema compliance**: Structural validation against framework schema
- **Parameter references**: Logic validates parameter usage
- **Output definitions**: Ensures outputs match logic returns

### Change Detection
The system automatically detects and displays:
- **Parameter changes**: Modified values with before/after comparison
- **Logic updates**: Simulation code modifications
- **Structure changes**: Added/removed parameters or outputs
- **Metadata updates**: Name, description, or tag changes

## Workflow Examples

### Basic Config Editing
```bash
# Start interactive session
npm run cli -- run simple-roi-analysis.yaml --interactive

# Results displayed, enter config mode
> c

# Edit full configuration
> e
# [Editor opens, make changes, save, exit]

# Validate changes
🔍 Changes detected:
  • Modified parameter: initialInvestment (100000 → 250000)
  • Updated description: Added risk analysis

# Test with quick run
> t
✅ Test completed in 0.1s
result: 425.2

# Save changes permanently
> s
✅ Saved changes to simple-roi-analysis.yaml
📋 Backup created: simple-roi-analysis.backup.2025-01-15T10-30-45.yaml
```

### Iterative Development
```bash
# Start session
npm run cli -- run complex-simulation.yaml --interactive

# Multiple edit cycles
> c
> e  # Make changes
> t  # Quick test
> u  # Undo if not satisfied
> e  # Try different approach  
> r  # Full run when satisfied
> s  # Save final version
```

### Safe Experimentation
```bash
# Work with valuable production config
npm run cli -- run production-analysis.yaml --interactive

# Experiment freely - original file protected
> c
> e  # Radical changes to logic
> t  # Test impact
# If results unsatisfactory:
> u  # Safely undo all changes
# Original file remains untouched
```

## Agent Integration

### Programmatic Control
Agents can drive interactive sessions programmatically:

```bash
# Command sequences via environment
MONTE_CARLO_COMMANDS="c,e,t,s,q" npm run cli -- run simulation.yaml --interactive

# Pipe command sequences
echo -e "c\ne\nr\ns\nq" | npm run cli -- run simulation.yaml --interactive
```

### Machine-Readable Output
Interactive mode supports structured output for agents:
- **JSON result format**: `--format json` for programmatic parsing
- **Validation feedback**: Structured error and warning messages
- **Change detection**: Machine-readable diff information

## Best Practices

### Development Workflow
1. **Start simple**: Begin with working examples, then modify
2. **Test incrementally**: Use `t` command for quick validation
3. **Save milestones**: Use `s` to save successful iterations
4. **Use undo freely**: Experiment knowing you can always revert

### Team Collaboration  
1. **Backup awareness**: Always check backup files when sharing configs
2. **Session isolation**: Each developer can safely work on copies
3. **Change documentation**: Use git commits to document major iterations
4. **Testing discipline**: Always run full test suite after major changes

### Performance Optimization
1. **Quick tests first**: Use `t` (100 iterations) before full runs
2. **Iteration tuning**: Adjust iteration counts based on parameter complexity
3. **Editor efficiency**: Configure fast-loading editors for quick cycles
4. **Session management**: Exit and restart sessions for major structural changes

## Troubleshooting

### Common Issues
- **Editor not opening**: Check `$EDITOR` environment variable
- **Changes not saving**: Ensure editor saves file before exiting  
- **Validation errors**: Use `t` command to see detailed error messages
- **Temporary files**: Session cleanup handles most issues automatically

### Recovery
- **Session crash**: Temporary files auto-cleaned on next session start
- **Config corruption**: Original files remain safe, use backups if needed
- **Undo exhausted**: Reload original file to start fresh

---

*Interactive config editing enables rapid simulation development while maintaining safety and professional workflow standards.*