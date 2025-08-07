# NPX Distribution System Design

## Problem Statement

The Monte Carlo Business Decision Framework currently requires full repository cloning, which creates significant adoption friction. Users must run 4 commands and wait for installation before getting value, when they should be able to analyze business decisions instantly.

### Current User Journey (High Friction)
```bash
# 4 steps, 2+ minutes, requires git knowledge
git clone https://github.com/rmurphey/monte-carlo-simulator
cd monte-carlo-simulator 
npm install && npm run build
npm run cli studio generate "Should we invest $100K in AI tools?" --test
```

### Target User Journey (Zero Friction)  
```bash
# 1 step, instant, works anywhere
npx github:rmurphey/monte-carlo-simulator generate "Should we invest $100K in AI tools?" --test
```

## Business Impact

### Target Users Enabled
- **Casual evaluators** who won't clone repositories but will try npx
- **CI/CD workflows** needing business decision automation
- **Enterprise users** who can't clone external repositories
- **Conference demos** and workshops requiring instant setup
- **AI agents** in production environments needing reliable access

### Adoption Barriers Removed
- **Repository cloning** - many users won't do this for evaluation
- **Build process** - eliminates npm install/build steps
- **Path management** - no need to navigate directories
- **Version staleness** - always uses latest version
- **Professional credibility** - npm distribution signals production readiness

## Technical Architecture

### GitHub NPX Package Structure
```
monte-carlo-simulator/     # Existing repository
├── package.json           # Add bin configuration
├── dist/                  # Compiled TypeScript output
│   ├── cli/              # CLI entry points
│   ├── framework/        # Core simulation engine
│   └── templates/        # Business simulation templates
├── templates/            # Template YAML files (bundled)
├── examples/             # Example configurations (bundled)
└── README.md            # GitHub + NPX focused documentation
```

### Binary Configuration for GitHub NPX
**File**: `package.json` (additions to existing)
```json
{
  "name": "monte-carlo-simulator",
  "bin": {
    "monte-carlo-simulator": "./dist/cli/index.js",
    "mcs": "./dist/cli/index.js"
  },
  "files": [
    "dist/",
    "templates/",
    "examples/"
  ],
  "keywords": [
    "monte-carlo", "business-analysis", "roi", "risk-assessment", 
    "decision-making", "simulation", "business-intelligence"
  ]
}
```

### Resource Path Resolution
**Challenge**: Templates and examples need to work from node_modules  
**Solution**: Dynamic path resolution based on installation context

**File**: `src/cli/utils/resource-paths.ts`
```typescript
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

export function getResourcePaths() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  
  // When installed via npm/npx, resources are in package root
  const packageRoot = join(__dirname, '..', '..')
  
  return {
    templates: join(packageRoot, 'templates'),
    examples: join(packageRoot, 'examples'),
    schemas: join(packageRoot, 'dist', 'schemas')
  }
}
```

### Command Interface Design

#### Primary Commands (Optimized for GitHub NPX)
```bash
# Agent workflow - generate and test
npx github:rmurphey/monte-carlo-simulator generate "query" --test

# Interactive selection
npx github:rmurphey/monte-carlo-simulator interactive

# Run specific simulation
npx github:rmurphey/monte-carlo-simulator run template-name
npx github:rmurphey/monte-carlo-simulator run examples/roi-analysis.yaml

# Studio workflows
npx github:rmurphey/monte-carlo-simulator studio define --template software-roi
npx github:rmurphey/monte-carlo-simulator studio generate "marketing ROI" --output campaign.yaml
```

### User File Management Strategy

#### Where New Simulations Are Created

**Default Behavior**: Current working directory (like git, npm, etc.)
```bash
cd ~/my-business-projects
npx github:rmurphey/monte-carlo-simulator studio generate "hiring 5 devs vs automation" --output hiring-analysis.yaml
ls
# hiring-analysis.yaml (created in current directory)

npx github:rmurphey/monte-carlo-simulator run hiring-analysis.yaml
# Runs the file from current directory
```

**File Resolution Priority**:
1. **Explicit paths**: `./my-file.yaml`, `/absolute/path.yaml`
2. **Current directory**: `filename.yaml` 
3. **Bundled templates**: `software-investment-roi` (built-in)
4. **Bundled examples**: `examples/simple-roi-analysis.yaml`

#### Advanced File Management
```bash
# Generate without saving (display only)
npx monte-carlo-business@latest generate "query"

# Save to specific location
npx monte-carlo-business@latest generate "query" --output ./analysis/hiring-decision.yaml

# Quick save with auto-naming
npx monte-carlo-business@latest generate "query" --save
# Creates: monte-carlo-YYYY-MM-DD-HHMMSS.yaml in current directory

# List user's simulations in current directory
npx monte-carlo-business@latest list
# Shows: *.yaml files in current directory + bundled examples/templates
```

#### User Workflow Examples
```bash
# Typical user workflow
mkdir business-analysis-q4
cd business-analysis-q4

npx monte-carlo-business@latest generate "AI tool investment $200K" --output ai-investment.yaml
npx monte-carlo-business@latest generate "hiring 3 senior devs" --output hiring-analysis.yaml

# Files are created in their project directory
ls
# ai-investment.yaml
# hiring-analysis.yaml

# Run and compare
npx monte-carlo-business@latest run ai-investment.yaml --output ai-results.json
npx monte-carlo-business@latest run hiring-analysis.yaml --output hiring-results.json
```

### AI Agent Usage Documentation

#### For Human Users Directing AI Agents
```bash
# Tell your AI agent to run this exact command
npx github:rmurphey/monte-carlo-simulator generate "Should we invest $200K in AI tools for our 50-person development team?" --test

# AI agents can create custom analyses
npx github:rmurphey/monte-carlo-simulator studio generate "marketing campaign ROI analysis with $100K budget targeting B2B SaaS" --output marketing-analysis.yaml --test
```

#### For AI Agents (Direct Instructions)
```markdown
## AI Agent Instructions: Monte Carlo Business Analysis

### Primary Command Pattern
Use this exact format for business decision analysis:
```bash
npx github:rmurphey/monte-carlo-simulator generate "<natural language business question>" --test
```

### Agent Workflow
1. **Generate and Test**: Always use `--test` flag to immediately validate the simulation
2. **Save Results**: Use `--output filename.yaml` to save for later analysis
3. **Current Directory**: Files are created in the current working directory
4. **Immediate Feedback**: The `--test` flag runs the simulation and shows results immediately

### Example Agent Commands
```bash
# Technology investment analysis
npx github:rmurphey/monte-carlo-simulator generate "ROI analysis for implementing AI coding assistants for a 30-person engineering team, $50K annual cost" --test --output ai-coding-tools.yaml

# Hiring decision analysis  
npx github:rmurphey/monte-carlo-simulator generate "Should we hire 5 junior developers or 3 senior developers for a fast-growing startup?" --test --output hiring-strategy.yaml

# Marketing spend analysis
npx github:rmurphey/monte-carlo-simulator generate "Marketing campaign ROI for B2B SaaS, $75K budget, targeting mid-market companies" --test --output marketing-campaign.yaml
```

### Agent Best Practices
1. **Always use --test**: Gets immediate validation and results
2. **Descriptive queries**: Include budget amounts, team sizes, time frames
3. **Save important analyses**: Use --output for decisions you'll reference later
4. **Current directory awareness**: Files are created where the command runs
5. **Business context**: Include industry, company size, market context in queries

### File Management for Agents
- **Files created in current working directory** (like git, npm)
- **Use descriptive filenames**: `ai-investment-analysis.yaml`, `hiring-decision-q4.yaml`
- **Can reference later**: `npx github:rmurphey/monte-carlo-simulator run ai-investment-analysis.yaml`
- **No hidden directories**: Everything goes where you run the command
```

## Implementation Plan

### Phase 1: Package Preparation (2 hours)
1. **Update package.json configuration**
   - Add bin entries for CLI commands
   - Configure files array to include templates/examples
   - Add npm-appropriate keywords and description
   - Set proper entry points

2. **Implement resource path resolution**
   - Create resource-paths utility for dynamic path resolution
   - Update template-library.ts to use dynamic paths
   - Update CLI commands to handle bundled resources
   - Test resource loading from node_modules context

3. **Bundle validation**
   - Ensure all templates/examples are included in package
   - Verify examples work from bundled context
   - Test CLI commands with resolved paths

### Phase 2: GitHub NPX Configuration (30 minutes)
4. **Optimize for GitHub npx usage**
   - Update README with `npx github:` examples
   - Configure package metadata for GitHub distribution
   - Test GitHub npx execution locally

5. **Validation and testing**
   - Test `npx github:rmurphey/monte-carlo-simulator` works locally
   - Verify resource loading from GitHub context
   - Validate file management behavior

### Phase 3: Documentation & Launch (2 hours)
6. **Create comprehensive file management documentation**
   - Document file resolution priority system
   - Create user workflow examples for different scenarios
   - Add troubleshooting guide for file not found issues
   - Document best practices for project organization
   - Create migration guide from git clone to npx usage

7. **Update all documentation**
   - README.md with npx-first examples and file management section
   - Update TL;DR section to show npx usage
   - Add installation alternatives (clone vs npx)
   - Create npm package description
   - Document current directory behavior prominently

8. **GitHub distribution and validation**
   - Push changes to GitHub repository
   - Test `npx github:` commands work on clean machine
   - Validate file management behavior across platforms
   - Update GitHub README and documentation

## User Experience Design

### NPX-First Documentation Structure

#### Quick Start (Zero Setup)
```markdown
## ⚡ Instant Analysis - No Setup Required

**Analyze any business decision in 30 seconds:**

```bash
# Generate and test any business analysis
npx monte-carlo-business@latest generate "Should we invest $200K in AI tools?" --test

# Interactive simulation browser
npx monte-carlo-business@latest interactive

# Run proven examples
npx monte-carlo-business@latest run software-investment-roi
```

**Result**: Get *"75% chance of $400K+ savings, 20% chance of breaking even"* instead of *"AI tools will probably save money"*.

#### Advanced Workflows
```bash
# Create custom simulation
npx monte-carlo-business@latest studio define --template marketing-roi

# Export results for presentation
npx monte-carlo-business@latest run my-analysis --format json --output results.json

# Compare scenarios
npx monte-carlo-business@latest run analysis --compare conservative,aggressive
```

### Command Design Principles

#### 1. **Immediate Value**
Every npx command should provide immediate, meaningful output without additional setup.

#### 2. **Progressive Disclosure**
- Basic commands work out of the box
- Advanced features available with flags
- Expert workflows available for power users

#### 3. **Self-Documenting**
```bash
npx monte-carlo-business@latest --help              # Show all commands
npx monte-carlo-business@latest generate --help     # Command-specific help
npx monte-carlo-business@latest examples            # List available examples
```

## Technical Implementation Details

### Resource Bundling Strategy

#### Templates (System Resources)
- Bundle all `/templates/*.yaml` files in npm package
- Resolve paths dynamically at runtime
- Ensure template-library.ts works from node_modules

#### Examples (Learning Resources)
- Include `/examples/` directory in package
- Maintain file structure for relative references
- Enable `run examples/filename.yaml` commands

#### Schemas (Validation Resources)
- Bundle YAML schemas for validation
- Include in dist/ for compiled access
- Support --validate flag in npx context

### Path Resolution Implementation

**Before (Development)**:
```typescript
// Hardcoded paths for local development
this.templatesPath = path.join(__dirname, '..', '..', '..', 'templates')
```

**After (NPX Compatible)**:
```typescript
// Dynamic resolution for npm/development contexts
import { getResourcePaths } from '../utils/resource-paths'

constructor() {
  const paths = getResourcePaths()
  this.templatesPath = paths.templates
  this.examplesPath = paths.examples
}
```

### CLI Command Resolution

#### Template References
```bash
# These should all work from npx
npx monte-carlo-business run software-investment-roi  # Built-in template
npx monte-carlo-business run examples/simple-roi-analysis.yaml  # Bundled example
npx monte-carlo-business run ./my-custom.yaml  # Local file
```

#### Resource Loading Priority
1. **Local files** (./filename.yaml) - highest priority
2. **Built-in templates** (template-name) - medium priority  
3. **Bundled examples** (examples/filename.yaml) - fallback

## Success Metrics

### Adoption Metrics
- **Time to first value**: < 30 seconds (vs 2+ minutes currently)
- **Setup barrier elimination**: 0 installation steps required
- **User conversion**: Measure trial-to-usage conversion improvement
- **Professional credibility**: npm download statistics

### Technical Validation
- **npx execution time**: < 5 seconds for simple commands
- **Resource loading**: All templates/examples accessible
- **Cross-platform compatibility**: Windows/Mac/Linux support
- **Version consistency**: Latest features always available

### User Experience Validation
- **Command discoverability**: Help system guides users effectively
- **Error handling**: Clear messages for common issues
- **Output formatting**: Professional results suitable for business use
- **Integration capabilities**: Works in CI/CD and automation contexts

## Risk Mitigation

### Potential Issues

#### 1. **Package Size**
- **Risk**: Large package due to bundled templates/examples
- **Mitigation**: Use .npmignore to exclude unnecessary files
- **Monitoring**: Track package size, target < 10MB

#### 2. **Resource Path Resolution**
- **Risk**: Templates not found in different installation contexts
- **Mitigation**: Comprehensive path resolution with fallbacks
- **Testing**: Validate in development, npm global, npx contexts

#### 3. **Version Management**  
- **Risk**: Breaking changes affect existing npx users
- **Mitigation**: Semantic versioning with major version for breaking changes
- **Strategy**: Maintain backward compatibility in CLI interface

#### 4. **Package Name Availability**
- **Risk**: Preferred names taken on npm registry
- **Options**: `monte-carlo-business`, `business-monte-carlo`, `mcb-simulator`
- **Validation**: Check availability before implementation

## Documentation Architecture

### Comprehensive File Management Documentation

#### README.md Sections Required
1. **File Management Overview** (New Section)
   ```markdown
   ## 📁 File Management & Project Organization
   
   ### Where Your Simulations Are Created
   Monte Carlo Business creates files in your **current working directory** - just like git, npm, and other CLI tools.
   
   ### Quick Start Pattern
   ```bash
   mkdir my-business-analysis
   cd my-business-analysis
   npx monte-carlo-business@latest generate "query" --output decision.yaml
   npx monte-carlo-business@latest run decision.yaml
   ```
   
   ### File Resolution Priority
   1. **Your files** (current directory) - highest priority
   2. **Built-in templates** (software-investment-roi, marketing-campaign-roi)
   3. **Example simulations** (examples/simple-roi-analysis.yaml)
   ```

2. **User Workflows Documentation** (New Section)
   ```markdown
   ## 🎯 Common Workflows
   
   ### Single Analysis Workflow
   [Step-by-step examples]
   
   ### Project-Based Analysis
   [Multiple simulations in organized directories]
   
   ### Team Collaboration
   [Version control and sharing patterns]
   ```

3. **Troubleshooting Guide** (New Section)
   ```markdown
   ## 🔧 Troubleshooting
   
   ### "File not found" Errors
   - Check your current working directory with `pwd`
   - Use `npx monte-carlo-business@latest list` to see available files
   - Verify file names match exactly (case-sensitive)
   
   ### Template vs User File Conflicts
   [How resolution priority works]
   
   ### Path Issues
   [Cross-platform path handling]
   ```

#### New Documentation Files Required
- `docs/FILE_MANAGEMENT.md` - Comprehensive file management guide
- `docs/USER_WORKFLOWS.md` - Detailed workflow examples and best practices
- `docs/MIGRATION_GUIDE.md` - Moving from git clone to npx usage
- `docs/TROUBLESHOOTING.md` - Common issues and solutions
- `docs/AI_AGENT_USAGE.md` - Complete guide for AI agents using the system
- `docs/NPX_GITHUB_USAGE.md` - GitHub NPX usage patterns and examples

#### CLI Help Text Updates
```bash
npx github:rmurphey/monte-carlo-simulator --help
# Should include section on file management and GitHub NPX usage

npx github:rmurphey/monte-carlo-simulator run --help
# Should explain file resolution priority

npx github:rmurphey/monte-carlo-simulator generate --help  
# Should explain where files are created and include agent usage examples
```

### Documentation Content Specifications

#### File Management Guide Content
```markdown
# File Management Guide

## Core Principles
1. **Current Directory First**: Files created where you run the command
2. **No Hidden Directories**: No ~/.monte-carlo or similar
3. **User Control**: You decide where files go
4. **Standard CLI Behavior**: Works like git, npm, docker

## Resolution Priority System
[Detailed explanation with examples]

## Best Practices
### Project Organization
- Create dedicated directories for analysis projects
- Use descriptive filenames
- Version control your simulations
- Export results for presentations

### Team Collaboration
- Share simulation YAML files via version control
- Use consistent naming conventions
- Document parameter assumptions
- Include results in project documentation
```

#### Migration Guide Content  
```markdown
# Migration Guide: Git Clone → NPX

## Why Migrate?
- Zero setup time
- Always latest version
- No repository management
- Works in any directory

## Step-by-Step Migration
### Old Workflow (Git Clone)
```bash
git clone https://github.com/rmurphey/monte-carlo-simulator
cd monte-carlo-simulator
npm install && npm run build
npm run cli studio generate "query" --output analysis.yaml
```

### New Workflow (NPX)
```bash
mkdir my-analysis
cd my-analysis  
npx monte-carlo-business@latest generate "query" --output analysis.yaml
```

## File Location Changes
[Explain how file paths change]

## Command Changes
[Map old commands to new npx commands]
```

#### Troubleshooting Guide Content
```markdown
# Troubleshooting Guide

## File Not Found Errors

### Problem: "Cannot find file 'analysis.yaml'"
**Cause**: File doesn't exist in current directory
**Solution**: 
```bash
pwd  # Check your location
ls *.yaml  # List YAML files
npx monte-carlo-business@latest list  # Show available simulations
```

### Problem: "Template 'my-template' not found"
**Cause**: Typo in template name or trying to use custom template as built-in
**Solutions**:
- Use exact template name: `software-investment-roi`
- For custom templates, use full path: `./my-template.yaml`
- List available templates: `npx monte-carlo-business@latest list --templates`

## Path and Directory Issues
[Platform-specific guidance]
```

## Implementation Files Reference

### New Files Required
- `src/cli/utils/resource-paths.ts` - Dynamic path resolution
- `.npmignore` - Exclude development files from package
- `docs/FILE_MANAGEMENT.md` - Comprehensive file management guide
- `docs/USER_WORKFLOWS.md` - Detailed workflow examples  
- `docs/MIGRATION_GUIDE.md` - Git clone to npx migration
- `docs/TROUBLESHOOTING.md` - Common issues and solutions

### Modified Files
- `package.json` - Add bin configuration, files array, keywords
- `src/cli/interactive/template-library.ts` - Use dynamic resource paths
- `README.md` - Add file management sections and npx-first examples
- `src/cli/commands/*.ts` - Update help text to include file management info
- Various CLI command files - Update to use resource path utilities

### Testing Requirements
- Local npm pack and installation testing
- NPX execution testing from clean environment
- Resource loading validation across installation contexts
- **File management behavior validation** across different directories
- **Cross-platform file path testing** (Windows/Mac/Linux)
- **File resolution priority testing** with overlapping names

---

**Design Summary**: Transform the Monte Carlo Business Framework from a development-only tool to a professional, instantly-accessible business analysis platform via npm/npx distribution, eliminating adoption friction while maintaining all existing functionality.

**Impact**: Enable casual users, enterprise environments, and AI agents to access sophisticated business decision analysis with zero setup, significantly expanding the framework's reach and utility.

**Timeline**: 4 hours total implementation for complete npx-ready package with professional distribution.