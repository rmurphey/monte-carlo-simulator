import Ajv, { JSONSchemaType } from 'ajv'

export interface SimulationConfig {
  name: string
  category: string
  description: string
  version: string
  tags: string[]
  baseSimulation?: string  // Path to base simulation file to inherit from
  businessContext?: boolean // Optional flag to request ARR/business context injection
  parameters: ParameterConfig[]
  groups?: ParameterGroupConfig[]
  outputs?: OutputConfig[]  // Optional if inheriting from base
  simulation?: {            // Optional if inheriting from base
    logic: string
  }
}

export type ParameterType = 'number' | 'boolean' | 'string' | 'select'

export interface ParameterConfig {
  key: string
  label: string
  type: ParameterType
  default: number | boolean | string
  min?: number
  max?: number
  step?: number
  options?: string[]
  description?: string
}

export interface ParameterGroupConfig {
  name: string
  description?: string
  parameters: string[]
}

export interface OutputConfig {
  key: string
  label: string
  description?: string
}

const parameterSchema: JSONSchemaType<ParameterConfig> = {
  type: 'object',
  properties: {
    key: { type: 'string', minLength: 1 },
    label: { type: 'string', minLength: 1 },
    type: { type: 'string', enum: ['number', 'boolean', 'string', 'select'] },
    default: { type: ['number', 'boolean', 'string'] },
    min: { type: 'number', nullable: true },
    max: { type: 'number', nullable: true },
    step: { type: 'number', nullable: true },
    options: { 
      type: 'array', 
      items: { type: 'string' },
      nullable: true 
    },
    description: { type: 'string', nullable: true }
  },
  required: ['key', 'label', 'type', 'default'],
  additionalProperties: false
}

const groupSchema: JSONSchemaType<ParameterGroupConfig> = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    description: { type: 'string', nullable: true },
    parameters: { 
      type: 'array', 
      items: { type: 'string' },
      minItems: 1
    }
  },
  required: ['name', 'parameters'],
  additionalProperties: false
}

const outputSchema: JSONSchemaType<OutputConfig> = {
  type: 'object',
  properties: {
    key: { type: 'string', minLength: 1 },
    label: { type: 'string', minLength: 1 },
    description: { type: 'string', nullable: true }
  },
  required: ['key', 'label'],
  additionalProperties: false
}

const simulationConfigSchema: JSONSchemaType<SimulationConfig> = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    category: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 10, maxLength: 500 },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    tags: {
      type: 'array',
      items: { type: 'string', minLength: 1 },
      minItems: 1,
      maxItems: 10
    },
    baseSimulation: { type: 'string', nullable: true },
    businessContext: { type: 'boolean', nullable: true },
    parameters: {
      type: 'array',
      items: parameterSchema,
      minItems: 1,
      maxItems: 20
    },
    groups: {
      type: 'array',
      items: groupSchema,
      nullable: true
    },
    outputs: {
      type: 'array',
      items: outputSchema,
      minItems: 1,
      maxItems: 10,
      nullable: true
    },
    simulation: {
      type: 'object',
      properties: {
        logic: { type: 'string', minLength: 10 }
      },
      required: ['logic'],
      additionalProperties: false,
      nullable: true
    }
  },
  required: ['name', 'category', 'description', 'version', 'tags', 'parameters'],
  additionalProperties: false
}

export class ConfigurationValidator {
  private ajv: Ajv
  private validate: (data: unknown) => data is SimulationConfig
  
  constructor() {
    this.ajv = new Ajv({ allowUnionTypes: true })
    this.validate = this.ajv.compile(simulationConfigSchema)
  }
  
  validateConfig(config: unknown): { valid: boolean; errors: string[] } {
    const isValid = this.validate(config)
    
    if (isValid) {
      // Additional business logic validation
      return this.validateBusinessRules(config as SimulationConfig)
    }
    
    const errors = this.ajv.errorsText(this.ajv.errors || []).split(', ')
    return { valid: false, errors }
  }
  
  private validateBusinessRules(config: SimulationConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check for duplicate parameter keys
    const paramKeys = config.parameters.map(p => p.key)
    const duplicateKeys = paramKeys.filter((key, index) => paramKeys.indexOf(key) !== index)
    if (duplicateKeys.length > 0) {
      errors.push(`Duplicate parameter keys: ${duplicateKeys.join(', ')}`)
    }
    
    // Check for duplicate output keys (only if outputs exist)
    if (config.outputs) {
      const outputKeys = config.outputs.map(o => o.key)
      const duplicateOutputs = outputKeys.filter((key, index) => outputKeys.indexOf(key) !== index)
      if (duplicateOutputs.length > 0) {
        errors.push(`Duplicate output keys: ${duplicateOutputs.join(', ')}`)
      }
    }
    
    // Validate select parameters have options
    config.parameters.forEach(param => {
      if (param.type === 'select' && (!param.options || param.options.length === 0)) {
        errors.push(`Select parameter '${param.key}' must have options`)
      }
      
      if (param.type === 'select' && param.options && !param.options.includes(String(param.default))) {
        errors.push(`Default value for '${param.key}' must be one of the options`)
      }
    })
    
    // Validate number parameter constraints
    config.parameters.forEach(param => {
      if (param.type === 'number') {
        const defaultNum = Number(param.default)
        if (param.min !== undefined && defaultNum < param.min) {
          errors.push(`Default value for '${param.key}' is below minimum`)
        }
        if (param.max !== undefined && defaultNum > param.max) {
          errors.push(`Default value for '${param.key}' is above maximum`)
        }
      }
    })
    
    // Validate groups reference existing parameters
    if (config.groups) {
      config.groups.forEach(group => {
        group.parameters.forEach(paramKey => {
          if (!paramKeys.includes(paramKey)) {
            errors.push(`Group '${group.name}' references non-existent parameter '${paramKey}'`)
          }
        })
      })
    }
    
    // Validate simulation logic contains return statement (only if simulation logic exists)
    if (config.simulation && !config.simulation.logic.includes('return')) {
      errors.push('Simulation logic must contain a return statement')
    }
    
    // Validate simulation logic references output keys (only if both exist)
    if (config.simulation && config.outputs) {
      const logicReferencesOutputs = config.outputs.some(output => 
        config.simulation!.logic.includes(output.key)
      )
      if (!logicReferencesOutputs) {
        errors.push('Simulation logic should return at least one of the defined outputs')
      }
    }
    
    return { valid: errors.length === 0, errors }
  }
}