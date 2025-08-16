# Debugging Commands Implementation - 2025

**Date**: August 2025  
**Context**: Creating new Claude commands based on learnings from expensive debugging sessions  
**Purpose**: Codify efficient debugging practices into reusable commands  

## Implementation Summary

Created 5 new Claude debugging commands that implement the efficient debugging guidelines documented in `efficient-debugging-guidelines.md` and `debugging-lessons-parameter-schema.md`.

### New Commands Implemented

#### `/simple-test-case` 
- **Purpose**: Create minimal test cases for debugging
- **Context Script**: `npm run context:simple-test-case`
- **Features**: Debugging guidelines reminder, failing test detection, test file discovery
- **Implementation**: Follows "test fix inline first" pattern from debugging lessons

#### `/read-the-whole-error`
- **Purpose**: Systematic error message analysis
- **Context Script**: `npm run context:read-the-whole-error`
- **Features**: Anti-pattern warnings, error analysis checklist, assumption trap prevention
- **Implementation**: Prevents expensive assumption-driven debugging loops

#### `/find-working-equivalent`
- **Purpose**: Locate similar working code for comparison
- **Context Script**: `npm run context:find-working-equivalent`
- **Features**: Codebase structure mapping, working pattern discovery, comparison workflow
- **Implementation**: Core principle of comparison-driven debugging

#### `/minimal-change-test`
- **Purpose**: Test fixes inline before source modification
- **Context Script**: `npm run context:minimal-change-test`
- **Features**: Inline testing template, minimal change principles, test status
- **Implementation**: Prevents expensive debugging iterations

#### `/stop-and-reassess`
- **Purpose**: Circuit breaker for expensive debugging loops
- **Context Script**: `npm run context:stop-and-reassess`
- **Features**: 5-minute rule enforcement, emergency checklist, token efficiency targets
- **Implementation**: Debugging circuit breaker with systematic approach

## Technical Implementation

### Dual Implementation Approach
Implemented both actual Claude Code slash commands AND efficient npm context scripts for maximum flexibility.

### Files Created/Modified
1. **`/Users/rmurphey/.claude/commands/`** - Created 5 actual Claude Code slash commands
   - `simple-test-case` - Minimal test case creation
   - `read-the-whole-error` - Systematic error analysis
   - `find-working-equivalent` - Comparison-driven debugging
   - `minimal-change-test` - Inline fix testing
   - `stop-and-reassess` - Debugging circuit breaker
2. **`scripts/command-context.sh`** - Added 5 new context functions for token efficiency
3. **`package.json`** - Added npm script shortcuts for direct context access
4. **`CLAUDE.md`** - Updated documentation with new debugging command section

### Integration Approach
- **Token Efficient**: Uses existing context script pattern for minimal token usage
- **Systematic**: Each command provides structured guidance based on documented lessons
- **Prevention-Focused**: Emphasizes avoiding expensive debugging patterns
- **Checklist-Driven**: Provides actionable steps rather than general advice

### Usage Patterns

#### Claude Code Slash Commands (Primary Method)
```bash
# Use actual Claude Code commands in chat
/simple-test-case
/read-the-whole-error  
/find-working-equivalent
/minimal-change-test
/stop-and-reassess
```

#### Direct Context Scripts (Alternative/Backup)
```bash
# When starting debugging session
npm run context:simple-test-case

# When making assumptions about errors
npm run context:read-the-whole-error

# When debugging in isolation
npm run context:find-working-equivalent

# Before modifying source code
npm run context:minimal-change-test

# When debugging >5 minutes without progress
npm run context:stop-and-reassess
```

#### Hybrid Approach
The slash commands automatically use the context scripts, giving you both the convenience of `/command` syntax and the token efficiency of the context functions.

## Key Design Principles

### 1. **Based on Real Lessons**
Each command directly implements lessons from the expensive ParameterSchema debugging session that cost 15,000 tokens.

### 2. **Anti-Pattern Focused**
Commands actively warn against expensive debugging patterns:
- Assumption-driven debugging
- Adding debug code that won't execute
- Multiple variations of same approach
- Caching solutions without evidence

### 3. **Comparison-Driven**
Core philosophy: Find working equivalent, compare approaches, copy working pattern.

### 4. **Token Efficiency**
- Target: < 1,000 tokens per debugging session
- Time target: < 5 minutes per issue
- Approach changes: < 2
- Debug iterations: < 3

### 5. **Circuit Breaker Pattern**
`/stop-and-reassess` acts as emergency brake when debugging exceeds efficiency thresholds.

## Success Metrics

### Expected Improvements
- **93% token reduction**: From 15,000 to <1,000 tokens per debugging session
- **83% time reduction**: From 30+ minutes to <5 minutes per issue
- **Systematic approach**: Eliminate random debugging attempts
- **Pattern reuse**: Apply working solutions consistently

### Prevention Focus
These commands prevent the specific anti-patterns identified in the debugging lessons:
- ❌ "Must be caching" assumptions → ✅ Compare with working equivalent
- ❌ Complex debugging logic → ✅ Minimal change with proven pattern
- ❌ Property access mysteries → ✅ Use working data source patterns

## Documentation Integration

### CLAUDE.md Updates
- Added new "Debugging Commands" section
- Organized commands into Core vs Debugging categories  
- Updated Context Scripts section with debugging context
- Enhanced OSS Development Commands with debugging workflow

### Command Discovery
All commands follow existing pattern:
- Documented in CLAUDE.md Custom Commands section
- Available via npm scripts for easy access
- Integrated with existing context script architecture
- Include usage examples and anti-pattern warnings

## Future Enhancements

### Potential Additions
- **Pattern Library**: Build database of working vs broken patterns
- **Time Tracking**: Automatic debugging session duration monitoring
- **Success Rate**: Track which commands prevent expensive sessions
- **Integration**: Connect with existing `/hygiene` and quality workflows

This implementation transforms expensive debugging lessons into systematic, reusable commands that enforce efficient debugging practices and prevent costly token waste.