# Design: CLI for Creating New Simulations

## Problem Statement

Developers need a streamlined way to create new Monte Carlo simulations without manually writing boilerplate code. Currently, creating a new simulation requires:
- Understanding the framework interfaces
- Writing parameter definitions manually
- Creating test files
- Registering the simulation properly
- Following naming conventions

## Design Goals

1. **Developer Experience**: One command creates a complete simulation scaffold
2. **Best Practices**: Generated code follows framework patterns and conventions
3. **Testing Ready**: Includes test templates and proper registration
4. **Type Safety**: Generated TypeScript code with proper interfaces
5. **Documentation**: Auto-generated parameter descriptions and examples

## Revised Architecture: Configuration-Based Approach

### CLI Tool Structure
```
src/cli/
├── index.ts                 # Main CLI entry point
├── commands/
│   ├── create-simulation.ts  # Create YAML/JSON config files
│   ├── list-simulations.ts   # Show existing simulations
│   └── validate.ts           # Validate simulation configs
├── config/
│   ├── schema.ts            # Configuration schema validation
│   └── loader.ts            # Load and parse simulation configs
└── utils/
    ├── file-generator.ts
    ├── name-converter.ts
    └── validation.ts

simulations/                 # Configuration files
├── ai-investment-roi.yaml
├── portfolio-risk.yaml
└── product-launch.yaml
```

### Command Interface
```bash
# Create new simulation
npm run create-simulation <name> [options]

# Examples
npm run create-simulation "Portfolio Risk Assessment" --category="Finance"
npm run create-simulation "Product Launch" --category="Marketing" --template="basic"
npm run create-simulation "Supply Chain" --category="Operations" --interactive

# List existing simulations
npm run list-simulations

# Validate simulation definition
npm run validate-simulation ./src/simulations/MySimulation.ts
```

### Configuration File Format
```yaml
# simulations/portfolio-risk-assessment.yaml
name: Portfolio Risk Assessment
category: Finance
description: Analyze portfolio risk metrics using Monte Carlo methods
version: 1.0.0
tags:
  - finance
  - risk
  - portfolio

parameters:
  - key: portfolioValue
    label: Portfolio Value ($)
    type: number
    default: 500000
    min: 10000
    max: 10000000
    description: Total value of the investment portfolio
    
  - key: riskFactor
    label: Risk Factor
    type: number
    default: 0.2
    min: 0.05
    max: 0.5
    step: 0.01
    description: Portfolio volatility factor
    
  - key: timeHorizon
    label: Time Horizon
    type: select
    default: "1-year"
    options: ["1-month", "3-month", "6-month", "1-year", "2-year"]
    description: Investment time horizon

groups:
  - name: Portfolio Settings
    description: Core portfolio configuration
    parameters: [portfolioValue, timeHorizon]
    
  - name: Risk Parameters
    description: Risk modeling parameters
    parameters: [riskFactor]

outputs:
  - key: var95
    label: Value at Risk (95%)
    description: Maximum expected loss with 95% confidence
    
  - key: expectedReturn
    label: Expected Return
    description: Expected portfolio return over time horizon

simulation:
  logic: |
    // Convert time horizon to months
    const monthsMap = { "1-month": 1, "3-month": 3, "6-month": 6, "1-year": 12, "2-year": 24 }
    const months = monthsMap[timeHorizon] || 12
    
    // Add uncertainty to risk factor
    const actualRisk = riskFactor * (0.8 + Math.random() * 0.4)
    
    // Calculate time-adjusted returns
    const timeAdjustment = Math.sqrt(months / 12)
    const dailyVolatility = actualRisk / Math.sqrt(252)
    
    // Simulate return
    const randomReturn = (Math.random() - 0.5) * 2 * dailyVolatility * timeAdjustment
    const expectedReturn = portfolioValue * randomReturn
    
    // Calculate VaR (95th percentile loss)
    const var95 = portfolioValue * actualRisk * timeAdjustment * -1.645
    
    return { var95, expectedReturn }
```

### Interactive Mode
```
? Simulation name: Portfolio Risk Assessment
? Category: (Finance/Marketing/Operations/Other) Finance
? Description: Analyze portfolio risk metrics using Monte Carlo methods
? Add parameter: Portfolio Value
  ? Type: number
  ? Default: 500000
  ? Min: 10000
  ? Max: 10000000
? Add another parameter? Yes
? Add parameter: Risk Factor
  ? Type: number
  ? Default: 0.2
  ? Min: 0.05
  ? Max: 0.5
? Add simulation logic interactively? No (will open editor)

✨ Generated:
  - simulations/portfolio-risk-assessment.yaml
  - Validation passed ✓
  - Ready to use in framework
```

## Technical Implementation

### 1. Configuration Schema
```typescript
interface SimulationConfig {
  name: string
  category: string
  description: string
  version: string
  tags: string[]
  parameters: ParameterDefinition[]
  groups?: ParameterGroup[]
  outputs: OutputDefinition[]
  simulation: {
    logic: string
  }
}

interface OutputDefinition {
  key: string
  label: string
  description?: string
}
```

### 2. Configuration Loader & Validator
```typescript
import yaml from 'js-yaml'
import Ajv from 'ajv'

class ConfigurationLoader {
  private ajv = new Ajv()
  private schema = { /* JSON schema for validation */ }
  
  async loadConfig(filePath: string): Promise<SimulationConfig> {
    const content = await fs.readFile(filePath, 'utf8')
    const config = yaml.load(content) as SimulationConfig
    
    if (!this.ajv.validate(this.schema, config)) {
      throw new Error(`Invalid configuration: ${this.ajv.errorsText()}`)
    }
    
    return config
  }
  
  async saveConfig(filePath: string, config: SimulationConfig): Promise<void> {
    const yamlContent = yaml.dump(config, { indent: 2 })
    await fs.writeFile(filePath, yamlContent, 'utf8')
  }
}
```

### 3. Runtime Simulation Engine
```typescript
class ConfigurableSimulation extends MonteCarloEngine {
  constructor(private config: SimulationConfig) {
    super()
  }
  
  getMetadata(): SimulationMetadata {
    return {
      id: toId(this.config.name),
      name: this.config.name,
      description: this.config.description,
      category: this.config.category,
      version: this.config.version
    }
  }
  
  getParameterDefinitions(): ParameterDefinition[] {
    return this.config.parameters
  }
  
  simulateScenario(parameters: Record<string, unknown>): Record<string, number> {
    // Execute the JavaScript logic from config.simulation.logic
    const func = new Function(...Object.keys(parameters), this.config.simulation.logic)
    return func(...Object.values(parameters))
  }
  
  setupParameterGroups(): void {
    if (!this.config.groups) return
    
    const schema = this.getParameterSchema()
    this.config.groups.forEach(group => {
      schema.addGroup({
        name: group.name,
        description: group.description,
        parameters: group.parameters
      })
    })
  }
}
```

### 3. Code Templates

**Simulation Template:**
```typescript
// templates/simulation.template.ts
export const SIMULATION_TEMPLATE = `
import { MonteCarloEngine } from '../framework/MonteCarloEngine'
import { ParameterDefinition, SimulationMetadata } from '../framework/types'

export class {{className}} extends MonteCarloEngine {
  getMetadata(): SimulationMetadata {
    return {
      id: '{{id}}',
      name: '{{name}}',
      description: '{{description}}',
      category: '{{category}}',
      version: '1.0.0'
    }
  }

  getParameterDefinitions(): ParameterDefinition[] {
    return [
      {{parameters}}
    ]
  }

  simulateScenario(parameters: Record<string, unknown>): Record<string, number> {
    const p = parameters as {
      {{parameterTypes}}
    }

    // TODO: Implement your simulation logic here
    {{simulationLogic}}

    return {
      {{outputMetrics}}
    }
  }

  setupParameterGroups(): void {
    const schema = this.getParameterSchema()
    
    {{parameterGroups}}
  }
}
`
```

**Test Template:**
```typescript
// templates/test.template.ts  
export const TEST_TEMPLATE = `
import { describe, it, expect, beforeEach } from 'vitest'
import { {{className}} } from '../simulations/{{className}}'
import { SimulationRegistry } from '../framework/SimulationRegistry'

describe('{{className}}', () => {
  let simulation: {{className}}

  beforeEach(() => {
    simulation = new {{className}}()
  })

  it('should have correct metadata', () => {
    const metadata = simulation.getMetadata()
    expect(metadata.id).toBe('{{id}}')
    expect(metadata.name).toBe('{{name}}')
    expect(metadata.category).toBe('{{category}}')
    expect(metadata.version).toBe('1.0.0')
  })

  it('should define required parameters', () => {
    const parameters = simulation.getParameterDefinitions()
    expect(parameters).toHaveLength({{parameterCount}})
    
    const paramKeys = parameters.map(p => p.key)
    {{parameterTests}}
  })

  it('should validate parameters correctly', () => {
    const schema = simulation.getParameterSchema()
    
    const validParams = {
      {{validParameterExample}}
    }
    
    const result = schema.validateParameters(validParams)
    expect(result.isValid).toBe(true)
  })

  it('should run single scenario', () => {
    const parameters = {
      {{validParameterExample}}
    }

    const result = simulation.simulateScenario(parameters)
    
    {{outputValidationTests}}
  })

  it('should run full simulation', async () => {
    const parameters = {
      {{validParameterExample}}
    }

    const results = await simulation.runSimulation(parameters, 100)
    
    expect(results.results).toHaveLength(100)
    expect(results.summary).toBeDefined()
    {{summaryValidationTests}}
  })

  it('should setup parameter groups', () => {
    simulation.setupParameterGroups()
    const schema = simulation.getParameterSchema()
    const uiSchema = schema.generateUISchema()
    
    expect(uiSchema.groups.length).toBeGreaterThan(0)
  })

  it('should register in simulation registry', () => {
    const registry = SimulationRegistry.getInstance()
    registry.clear()
    
    registry.register(() => new {{className}}(), [{{tags}}])
    
    expect(registry.isRegistered('{{id}}')).toBe(true)
    const registeredSim = registry.getSimulation('{{id}}')
    expect(registeredSim).toBeInstanceOf({{className}})
  })
})
`
```

### 4. CLI Command Implementation
```typescript
// commands/create-simulation.ts
import inquirer from 'inquirer'
import { SimulationGenerator, ParameterBuilder } from '../utils'

export async function createSimulation(name?: string, options: any = {}) {
  const config = await (options.interactive ? 
    promptForConfig(name) : 
    parseOptionsConfig(name, options)
  )
  
  console.log(`🚀 Creating simulation: ${config.name}`)
  
  await SimulationGenerator.create(config)
  
  console.log(`✅ Successfully created:`)
  console.log(`   📄 src/simulations/${config.className}.ts`)
  console.log(`   🧪 src/test/${config.className}.test.ts`)
  console.log(`   📝 Updated src/simulations/index.ts`)
  console.log(``)
  console.log(`Next steps:`)
  console.log(`   1. Implement simulation logic in simulateScenario()`)
  console.log(`   2. Run tests: npm test ${config.className}`)
  console.log(`   3. Start dev server: npm run dev`)
}

async function promptForConfig(name?: string): Promise<SimulationConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Simulation name:',
      default: name,
      validate: (input) => input.length > 0
    },
    {
      type: 'list',
      name: 'category',
      message: 'Category:',
      choices: ['Finance', 'Marketing', 'Operations', 'Other']
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description:',
      validate: (input) => input.length > 10
    }
  ])

  // Interactive parameter definition
  const parameters = await promptForParameters()
  const outputMetrics = await promptForOutputMetrics()
  const tags = await promptForTags()

  return {
    name: answers.name,
    className: nameToClassName(answers.name),
    id: nameToId(answers.name),
    category: answers.category,
    description: answers.description,
    parameters,
    outputMetrics,
    tags
  }
}
```

### 5. Package.json Scripts
```json
{
  "scripts": {
    "create-simulation": "tsx src/cli/index.ts create",
    "list-simulations": "tsx src/cli/index.ts list",
    "validate-simulation": "tsx src/cli/index.ts validate"
  }
}
```

## Usage Examples

### Basic Usage
```bash
# Quick creation with defaults
npm run create-simulation "Customer Churn Analysis" --category="Marketing"

# Interactive mode with full customization
npm run create-simulation --interactive

# Using template
npm run create-simulation "Risk Model" --template="financial" --category="Finance"
```

### Generated Output Structure
```
src/simulations/CustomerChurnAnalysis.ts    # Main simulation class
src/test/CustomerChurnAnalysis.test.ts      # Complete test suite
src/simulations/index.ts                    # Updated with registration
```

## Implementation Benefits

1. **Faster Development**: Reduces simulation creation time from hours to minutes
2. **Consistency**: All simulations follow the same patterns and conventions
3. **Testing**: Every simulation gets comprehensive test coverage automatically
4. **Documentation**: Generated code includes proper TypeScript types and JSDoc
5. **Best Practices**: Enforces framework patterns and validation rules

## Extension Points

1. **Custom Templates**: Support for domain-specific simulation templates
2. **Parameter Libraries**: Reusable parameter definitions for common use cases
3. **Validation Rules**: Custom business logic validation generators
4. **Integration**: Git hooks for automatic testing of generated simulations

## Success Metrics

- Reduce simulation creation time by 80%
- Ensure 100% of generated simulations pass all tests
- Maintain consistent code quality across all generated simulations
- Enable non-framework-experts to create simulations successfully

## Implementation Plan

### Phase 1: Core CLI Infrastructure
- [ ] Set up CLI entry point and command parsing
- [ ] Create basic template engine
- [ ] Implement file generation utilities
- [ ] Add name conversion utilities (camelCase, kebab-case, etc.)

### Phase 2: Template System
- [ ] Create simulation class template
- [ ] Create test file template
- [ ] Implement parameter definition generation
- [ ] Add registry update functionality

### Phase 3: Interactive Mode
- [ ] Add inquirer.js for interactive prompts
- [ ] Implement parameter builder prompts
- [ ] Create output metrics configuration
- [ ] Add tag and category selection

### Phase 4: Advanced Features
- [ ] Add template validation
- [ ] Implement custom templates support
- [ ] Create list-simulations command
- [ ] Add simulation validation command

### Phase 5: Integration & Polish
- [ ] Add comprehensive CLI tests
- [ ] Create documentation and examples
- [ ] Integrate with package.json scripts
- [ ] Add error handling and user feedback

---

**Design Status**: Approved for Implementation  
**Priority**: High - Developer Experience Enhancement  
**Estimated Effort**: 2-3 weeks  
**Dependencies**: Core framework (✅ Complete)