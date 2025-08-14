# Claude Code Collaboration Guidelines

## Project Configuration
- **Quality Level**: standard
- **Team Size**: solo
- **Warning Threshold**: reasonable
- **Coverage Target**: 70%

## Development Standards
This is an open-source project optimized for individual contributors and community collaboration.

### OSS Development Workflow
- **Flexible approach**: Direct commits to main for solo work, PRs for community contributions
- **Quality focus**: Clean code, working examples, good documentation, high test coverage, no errors
- **Community-friendly**: Clear documentation, helpful error messages, easy onboarding
- **AI-assisted**: Leverage Claude for code quality and consistency

## Custom Commands
Use the following commands for structured development:
- `/hygiene` - Code quality check
- `/todo` - Update ACTIVE_WORK.md "Current Priorities" and "Recently Completed" sections
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

### Context Scripts (Token Optimization)
Use these scripts instead of individual bash commands to save tokens:
- `npm run context:docs` - Documentation command context (status, files, recent changes)
- `npm run context:todo` - Todo command context (priorities, completions) 
- `npm run context:archive` - Archive command context (completed work, plans)
- `npm run context:commit` - Commit command context (staged changes, recent commits)
- `npm run context:next` - Next task context (project phase, priorities)

### Pre-approved Commands
The following npm commands can be run without user approval for validation and analysis:
- `npm run validate:repo-clean` - Check for uncommitted changes
- `npm run validate:no-unpushed` - Check for unpushed commits
- `npm run validate:dist-current` - Ensure dist/ directory is current
- `npm run quality:all` - Run test + build + lint sequence
- `npm run version:analyze` - Show commits since last tag
- `npm run commit:size` - Show staged changes statistics
- `npm run status:full` - Comprehensive git status with unpushed commits

### OSS Development Commands
- `/hygiene` - Quick code quality check
- `/commit` - Commit with good practices
- `/docs` - Update documentation when needed

## Quality Guidelines
- Maintain good code quality without being overly strict
- Address warnings that matter, ignore noise
- Target 70% test coverage for core functionality
- Focus on user experience and clear documentation
- Use AI assistance for code improvements and consistency
- Welcome community contributions with clear guidelines

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