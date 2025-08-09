# Claude Code Collaboration Guidelines

## Project Configuration
- **Quality Level**: strict
- **Team Size**: large
- **Warning Threshold**: 0
- **Coverage Target**: 70%

## Development Standards
This project follows strict quality standards optimized for large team coordination.

### Large Team Workflow
- **Structured branching**: Feature branches, release branches, strict review process
- **Process consistency**: Standardized commits, comprehensive documentation
- **Knowledge management**: Detailed specs, architecture decisions, team handoffs
- **AI governance**: Use Claude with team guidelines for consistent code standards
- Commit after every todo is completed

## Custom Commands
Use the following commands for structured development:
- `/hygiene` - Code quality check
- `/todo` - Task management
- `/commit` - Structured commits
- `/learn` - Knowledge capture
- `/docs` - Documentation updates

## Documentation Requirements
All feature implementations MUST include documentation updates in the same commit:

### Mandatory Validation
- **`npm run test:docs`** - All README examples must pass before commit
- **Pre-commit hook** - Automatically validates documentation examples
- **No broken examples** - Examples that don't work are blocked at commit time

### Documentation Update Checklist
When implementing features, update documentation:
- [ ] README.md if public API changed
- [ ] ACTIVE_WORK.md if feature completed
- [ ] Parameter examples use correct parameter names  
- [ ] All bash examples tested and working
- [ ] Interactive commands marked as non-testable

### Testing Examples
```bash
# Test all documentation examples
npm run test:docs

# Test specific simulation parameters
npm run cli run simulation-name --list-params
```

### Large Team Commands
- `/design` - Formal feature design documentation
- `/estimate` - Detailed project estimation
- `/maintainability` - Code health analysis
- `/version-tag` - Release management
- `/defer` - Formal backlog management

## Quality Guidelines
- Maintain strict code quality standards
- Keep warnings at zero
- Target 70% test coverage
- Enforce strict process compliance for team coordination
- Require comprehensive documentation and testing
- Use AI assistance for maintaining consistency across large codebase
- Implement formal code review and approval processes

## Collaboration
This project is set up for AI-assisted development with Claude Code.

### Documentation Guidelines
- **README.md**: Focus on human users - business value, installation, working examples
- **docs/AGENT.md**: Focus on AI agents - technical specs, YAML patterns, validation rules
- **docs/TECHNICAL.md**: Focus on framework internals - architecture, advanced features
- **examples/**: All examples must be tested and working before committing
- Maintain clear separation between human and agent documentation needs

## Project Management
- ACTIVE_WORK.md should always be up to date
- Completed work should be archived in archive/ directory with comprehensive insights

## Documentation Structure
- `ACTIVE_WORK.md` - Current priorities and next steps
- `README.md` - Human-focused project overview and business value proposition
- `docs/AGENT.md` - Complete technical specifications for AI agents (YAML patterns, validation rules)
- `docs/TECHNICAL.md` - Deep framework architecture and advanced technical details
- `docs/` - Detailed implementation specifications
  - `docs/INTERACTIVE_STUDIO.md` - Interactive simulation system specification (human + agent)
  - `docs/YAML_SCHEMA_GUIDE.md` - Complete YAML validation reference
- `examples/` - Working simulation examples with comprehensive agent patterns
  - `examples/README.md` - Agent-friendly simulation creation patterns
  - `examples/simulations/` - Tested, working YAML simulation files
- `archive/` - Completed designs, implementations, and development insights
  - `COMPLETED_WORK.md` - Original framework foundation archive
  - `business-intelligence-transformation.md` - ARR framework and professional CLI
  - `cli-simulation-generator-completed.md` - YAML-based simulation creation
  - `documentation-restructure-2025.md` - Human/agent documentation separation
  - `working-examples-system-2025.md` - Professional example system implementation
  - `agent-friendly-framework-implementation-2025.md` - Config-driven simulation architecture
  - `phase-2-business-intelligence-template-system-2025.md` - BI metadata and intelligent template selection
  - `directory-architecture-restructure-2025.md` - Proper directory separation and documentation


# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## Test Execution Guidelines
- ALWAYS run the tests so that they exit immediately after the test run; never run them as a long-running process unless specifically requested.

## Simulation Practices
- simulations MUST be created in a simulations directory, never at the root
- when you are running tests pre-commit or pre-push, NEVER run them in a watch mode.