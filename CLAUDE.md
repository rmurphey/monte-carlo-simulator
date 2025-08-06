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
- **AGENT.md**: Focus on AI agents - technical specs, YAML patterns, validation rules
- **TECHNICAL.md**: Focus on framework internals - architecture, advanced features
- **examples/**: All examples must be tested and working before committing
- Maintain clear separation between human and agent documentation needs

## Project Management
- ACTIVE_WORK.md should always be up to date
- Completed work should be archived in archive/ directory with comprehensive insights

## Documentation Structure
- `ACTIVE_WORK.md` - Current priorities and next steps
- `README.md` - Human-focused project overview and business value proposition
- `AGENT.md` - Complete technical specifications for AI agents (YAML patterns, validation rules)
- `TECHNICAL.md` - Deep framework architecture and advanced technical details
- `examples/` - Working simulation examples with comprehensive agent patterns
  - `examples/README.md` - Agent-friendly simulation creation patterns
  - `examples/simulations/` - Tested, working YAML simulation files
- `archive/` - Completed designs, implementations, and development insights
  - `COMPLETED_WORK.md` - Original framework foundation archive
  - `business-intelligence-transformation.md` - ARR framework and professional CLI
  - `cli-simulation-generator-completed.md` - YAML-based simulation creation


# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.