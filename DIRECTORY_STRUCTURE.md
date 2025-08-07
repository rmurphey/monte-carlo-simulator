# Project Directory Structure

This document explains the purpose and usage of each directory in the Monte Carlo simulation framework.

## Core Directory Purposes

### `/templates/` - System Templates
**Purpose**: Business intelligence templates used by the TemplateLibrary for agent-driven simulation generation.

**Used by**: 
- `TemplateLibrary` class for intelligent template selection
- Agent natural language → YAML generation
- Interactive studio template-based creation

**Contents**:
- Production-ready YAML simulation configurations
- Templates with comprehensive business intelligence metadata
- Validated templates that pass schema and logic validation

**Do NOT**:
- Modify these files directly without understanding BI impact
- Use for learning examples (use `/examples/` instead)
- Create user-specific simulations here (use `/simulations/` instead)

```typescript
// Code reference - TemplateLibrary constructor
this.templatesPath = path.join(__dirname, '..', '..', '..', 'templates')
```

---

### `/examples/` - Learning and Documentation Examples
**Purpose**: Curated examples that demonstrate framework capabilities and teach users.

**Used by**:
- Documentation and tutorials
- New user onboarding
- Testing and validation of framework features
- README examples and demos

**Contents**:
- `/examples/simulations/` - Well-documented simulation examples
- `/examples/parameters/` - Parameter file examples for different scenarios
- Working examples that showcase framework capabilities

**Characteristics**:
- Heavily documented with business context
- Designed for educational purposes
- May include variations (conservative/aggressive scenarios)
- Focus on clarity over production optimization

---

### `/simulations/` - User-Created Simulations
**Purpose**: Workspace for users to create, customize, and maintain their own simulation configurations.

**Used by**:
- End users creating custom simulations
- Business analysts developing specific models
- Teams working on organization-specific scenarios

**Contents**:
- Custom YAML configurations created by users
- Organization-specific simulation models
- Experimental and work-in-progress simulations

**Characteristics**:
- User-controlled content
- May not follow strict validation (development workspace)
- Can include private/proprietary business models
- Not used by system template selection

---

## Directory Usage Matrix

| Directory | TemplateLibrary | Agent Generation | User Learning | User Creation | Production Use |
|-----------|-----------------|------------------|---------------|---------------|----------------|
| `/templates/` | ✅ Primary | ✅ Source | ❌ No | ❌ No | ✅ Yes |
| `/examples/` | ❌ No | ❌ No | ✅ Primary | ✅ Reference | ❌ No |
| `/simulations/` | ❌ No | ❌ No | ❌ No | ✅ Primary | ✅ Yes |

## Code Integration

The framework code understands these directory purposes:

```typescript
// Template system uses /templates/ for intelligent selection
class TemplateLibrary {
  constructor() {
    this.templatesPath = path.join(__dirname, '..', '..', '..', 'templates')
  }
}

// File generators respect directory purposes
class FileGenerator {
  // Creates new simulations in /simulations/ by default
  // Uses /templates/ for template-based generation
  // References /examples/ for documentation
}
```

## File Management Guidelines

### Adding New Templates (`/templates/`)
1. Must pass comprehensive validation (YAML + schema + business logic)
2. Requires business intelligence metadata
3. Should be tested with agent generation
4. Must include proper industry/business model classification

### Creating Examples (`/examples/`)
1. Focus on educational value and documentation
2. Include comprehensive comments and business context
3. Demonstrate specific framework features or use cases
4. Should work out-of-the-box for new users

### User Simulations (`/simulations/`)
1. Users have full control over content and structure
2. No validation requirements (development freedom)
3. Can use any naming conventions or organization
4. May include proprietary business models

## Migration and Maintenance

When moving files between directories:
1. **Template → Example**: Add documentation, remove BI optimization
2. **Example → Template**: Add BI metadata, ensure production validation
3. **Template → Simulation**: Copy to user workspace, no system impact
4. **Simulation → Template**: Full validation required, BI metadata needed

This structure ensures clear separation of concerns while supporting both agent-driven automation and human usability.