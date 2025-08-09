# Project Directory Structure

This document explains the purpose and usage of each directory in the Monte Carlo simulation framework.

## Core Directory Purposes

### `/examples/simulations/` - Starting Point Patterns
**Purpose**: Working simulation configurations that users copy and modify for their needs.

**Used by**: 
- Copy-from-examples workflow (primary user pattern)
- Agent simulation generation starting points
- Documentation examples and testing

**Contents**:
- Production-ready YAML simulation configurations
- Well-documented examples with business context
- Validated configurations that pass schema validation

**Usage Pattern**:
```bash
# Copy an example to start your simulation
cp examples/simulations/simple-roi-analysis.yaml my-analysis.yaml

# Modify parameters in your copy
# Validate your changes
npm run cli validate my-analysis.yaml

# Run your simulation
npm run cli run my-analysis.yaml
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
- Personal workspace for custom business scenarios

---

## Directory Usage Matrix

| Directory | Agent Generation | User Learning | User Creation | Production Use |
|-----------|------------------|---------------|---------------|----------------|
| `/examples/simulations/` | ✅ Starting Point | ✅ Primary | ✅ Copy From | ✅ Reference |
| `/simulations/` | ❌ No | ❌ No | ✅ Primary | ✅ Yes |

## Code Integration

The framework code understands these directory purposes:

```typescript
// Examples-first approach - simple file operations
class ConfigBuilder {
  // Users copy from /examples/simulations/ for starting points
  // Creates new simulations in /simulations/ by default
  // Simple copy-modify-validate-run workflow
}

// Resource paths point to examples directory
export function getResourcePaths() {
  return {
    examples: path.join(packageRoot, 'examples', 'simulations'),
    docs: path.join(packageRoot, 'docs')
  }
}
```

## File Management Guidelines

### Adding New Examples (`/examples/simulations/`)
1. Must pass comprehensive validation (YAML + schema + business logic)
2. Should include comprehensive comments and business context
3. Demonstrate specific framework features or use cases
4. Should work out-of-the-box for users to copy and modify
5. Focus on educational value and clear documentation

### Creating User Simulations (`/simulations/`)
1. User workspace for custom simulations
2. Copy from examples as starting points
3. Modify parameters for specific use cases
4. Validate before running

### User Simulations (`/simulations/`)
1. Users have full control over content and structure
2. No validation requirements (development freedom)
3. Can use any naming conventions or organization
4. May include proprietary business models

## Migration and Maintenance

When moving files between directories:
1. **Example → Simulation**: Copy from examples/ to create custom simulation
2. **Simulation → Example**: Add documentation and validation for sharing
3. **Example Improvements**: Update examples/ with better patterns and documentation

This structure ensures clear separation of concerns while supporting both agent-driven automation and human usability.