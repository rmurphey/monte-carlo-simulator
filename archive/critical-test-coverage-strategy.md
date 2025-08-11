# Critical Test Coverage Strategy

## Problem Statement

Current test coverage is **13.98%** with **0% coverage on ALL CLI commands and agent workflow integration** - the primary interface for both humans and AI agents. This creates significant reliability risk.

## Strategic Approach

### Phase 1: CLI Command Testing Infrastructure (Week 1)
**Target: 40% CLI coverage**

**Key Components:**
- `CLITestHarness` - Execute CLI commands in test environment with temp directories
- `MockConfigurationFactory` - Generate test YAML configurations for different scenarios
- Core command tests: `run`, `studio generate`, `--list-params`, `--set` parameter overrides

**Critical Tests:**
- Parameter discovery showing correct parameters (our recent fix)
- Parameter override validation and type checking
- Output format generation (JSON, CSV, table)
- Error handling for invalid files and parameters

### Phase 2: Agent Workflow Integration (Week 2)
**Target: 60% agent workflow coverage**

**Key Components:**
- Natural language to YAML generation testing
- Business context injection validation (ARR parameters)
- Configuration loading with error scenarios
- End-to-end workflow: generate → discover → override → run

**Critical Tests:**
- Agent workflow produces valid business insights
- Generated simulations pass validation
- Parameter discovery matches actual YAML content
- NPX vs local CLI consistency

### Phase 3: Integration & Polish (Week 3)
**Target: 70% overall coverage**

**Key Components:**
- Full agent workflow integration tests
- Error handling and edge cases
- Performance and timeout validation
- Cross-platform compatibility

## Architecture Decisions

### Test Infrastructure Pattern
```
src/test/
├── infrastructure/     # CLITestHarness, test utilities
├── fixtures/          # MockConfigurationFactory, sample data
├── cli/commands/      # Individual CLI command tests
├── cli/config/        # Configuration loading tests
├── integration/       # End-to-end workflow tests
└── framework/         # Existing unit tests (77% coverage)
```

### CLI Testing Strategy
- **Subprocess execution** - Test actual CLI commands via npm scripts
- **Temporary file management** - Create/cleanup test YAML files
- **Structured assertions** - Validate stdout/stderr patterns, exit codes
- **Timeout handling** - Prevent hanging tests with reasonable limits

### Key Test Categories

**1. Parameter Discovery & Override**
- Verify `--list-params` shows correct parameters only
- Test `--set param=value` type validation and error messages
- Validate parameter constraints (min/max, required fields)

**2. Agent Workflow Integration** 
- Natural language → valid YAML generation
- Generated simulations execute and produce realistic results
- Business context injection works correctly

**3. Configuration Loading**
- YAML/JSON parsing with clear error messages
- Schema validation and constraint checking
- File discovery across different path structures

**4. Output & Integration**
- Multiple output formats (JSON, CSV, table)
- File saving and data export functionality
- Error handling graceful degradation

## Success Metrics

| Risk Level | Component | Current | Target |
|------------|-----------|---------|--------|
| **Critical** | CLI Commands | 0% | 85% |
| **Critical** | Agent Workflow | 0% | 75% |
| **High** | Config Loading | 0% | 90% |
| **Medium** | Integration | 0% | 80% |

**Overall Target: 70% coverage (up from 13.98%)**

## Implementation Priority

### High Priority (Must Have)
1. Parameter discovery testing (`--list-params` fix validation)
2. Parameter override functionality (`--set` validation)
3. Basic CLI command execution (run, generate)
4. Configuration loading error handling

### Medium Priority (Should Have)
1. Output format generation
2. Agent workflow end-to-end testing
3. Business context injection validation
4. Performance and timeout testing

### Low Priority (Nice to Have)
1. Interactive mode testing
2. Cross-platform compatibility
3. Advanced error scenario coverage
4. NPX distribution validation

## Risk Mitigation

**Addresses Critical Gaps:**
- CLI command reliability (prevents parameter discovery bugs)
- Agent integration failures (automated workflow validation) 
- Configuration parsing errors (schema validation testing)
- Silent failures (comprehensive error handling tests)

**Benefits:**
- Automated regression prevention
- Faster development feedback cycles
- Higher confidence in agent workflows
- Better error messages through test-driven development

This strategy transforms the manual agent workflow testing we performed into automated, repeatable test coverage that prevents regression and ensures reliability for AI agent integration.