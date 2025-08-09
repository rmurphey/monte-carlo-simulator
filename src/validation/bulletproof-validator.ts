import { readFile, readdir } from 'fs/promises'
import { resolve } from 'path'
import * as yaml from 'js-yaml'
import Ajv, { JSONSchemaType, ErrorObject } from 'ajv'

/**
 * BULLETPROOF SCHEMA VALIDATOR
 * 
 * This is the SINGLE SOURCE OF TRUTH for YAML validation.
 * ALL validation must go through this class to ensure consistency.
 * 
 * NO schema issues can reach the repository when this is properly enforced.
 */

export interface SimulationConfig {
  name: string
  category: string
  description: string
  version: string
  tags: string[]
  baseSimulation?: string
  businessContext?: boolean
  parameters: ParameterConfig[]
  groups?: ParameterGroupConfig[]
  outputs?: OutputConfig[]
  simulation?: {
    logic: string
  }
}

export interface ParameterConfig {
  key: string
  label: string
  type: 'number' | 'boolean' | 'string' | 'select'
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

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  filePath?: string
}

const SIMULATION_SCHEMA: JSONSchemaType<SimulationConfig> = {
  type: 'object',
  properties: {
    name: { 
      type: 'string', 
      minLength: 1, 
      maxLength: 100,
      description: 'Human-readable simulation name'
    },
    category: { 
      type: 'string', 
      minLength: 1,
      description: 'Simulation category for organization'
    },
    description: { 
      type: 'string', 
      minLength: 10, 
      maxLength: 500,
      description: 'Detailed description of what the simulation does'
    },
    version: { 
      type: 'string', 
      pattern: '^\\d+\\.\\d+\\.\\d+$',
      description: 'Semantic version (e.g., 1.0.0)'
    },
    tags: {
      type: 'array',
      items: { type: 'string', minLength: 1 },
      minItems: 1,
      maxItems: 10,
      description: 'Tags for categorization and search'
    },
    baseSimulation: { 
      type: 'string', 
      nullable: true,
      description: 'Path to base simulation for inheritance'
    },
    businessContext: { 
      type: 'boolean', 
      nullable: true,
      description: 'Whether to inject business context parameters'
    },
    parameters: {
      type: 'array',
      items: {
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
      },
      minItems: 1,
      maxItems: 20,
      description: 'Simulation input parameters'
    },
    groups: {
      type: 'array',
      items: {
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
      },
      nullable: true,
      description: 'Parameter grouping for UI organization'
    },
    outputs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', minLength: 1 },
          label: { type: 'string', minLength: 1 },
          description: { type: 'string', nullable: true }
        },
        required: ['key', 'label'],
        additionalProperties: false
      },
      minItems: 1,
      maxItems: 10,
      nullable: true,
      description: 'Expected simulation outputs'
    },
    simulation: {
      type: 'object',
      properties: {
        logic: { 
          type: 'string', 
          minLength: 10,
          description: 'JavaScript logic for the simulation'
        }
      },
      required: ['logic'],
      additionalProperties: false,
      nullable: true,
      description: 'Simulation execution logic'
    }
  },
  required: ['name', 'category', 'description', 'version', 'tags', 'parameters'],
  additionalProperties: false
}

export class BulletproofValidator {
  private ajv: Ajv
  private schemaValidator: (data: unknown) => data is SimulationConfig

  constructor() {
    // Configure AJV for maximum error detail
    this.ajv = new Ajv({ 
      allowUnionTypes: true,
      allErrors: true, // Collect all errors, not just first
      verbose: true,   // Include more details in errors
      strict: true,    // Strict mode to catch schema issues
      validateFormats: true
    })
    
    this.schemaValidator = this.ajv.compile(SIMULATION_SCHEMA)
  }

  /**
   * Validate YAML file - THE authoritative validation method
   * This is the ONLY method that should be used for validation
   */
  async validateFile(filePath: string): Promise<ValidationResult> {
    try {
      // Step 1: Read and parse file
      const resolvedPath = resolve(filePath)
      const content = await readFile(resolvedPath, 'utf8')
      let parsed: unknown
      
      try {
        parsed = yaml.load(content)
        
        if (parsed === null || parsed === undefined) {
          return {
            valid: false,
            errors: [`YAML file appears to be empty or contains only comments`],
            warnings: [],
            filePath
          }
        }
      } catch (yamlError) {
        return {
          valid: false,
          errors: [`YAML parsing failed: ${yamlError instanceof Error ? yamlError.message : String(yamlError)}`],
          warnings: [],
          filePath
        }
      }

      // Step 2: Schema validation
      return this.validateConfig(parsed, filePath)
      
    } catch (fileError) {
      return {
        valid: false,
        errors: [`File access failed: ${fileError instanceof Error ? fileError.message : String(fileError)}`],
        warnings: [],
        filePath
      }
    }
  }

  /**
   * Validate parsed configuration object
   */
  validateConfig(config: unknown, filePath?: string): ValidationResult {
    const result: ValidationResult = {
      valid: false,
      errors: [],
      warnings: [],
      filePath
    }

    // Step 1: Basic type check
    if (!config || typeof config !== 'object') {
      result.errors.push('Configuration must be a valid object')
      return result
    }

    // Step 2: JSON Schema validation
    const isValidSchema = this.schemaValidator(config)
    if (!isValidSchema) {
      const schemaErrors = this.formatAjvErrors(this.schemaValidator.errors || [])
      result.errors.push(...schemaErrors)
    }

    // Step 3: Business logic validation (only if schema is valid)
    if (isValidSchema) {
      const businessValidation = this.validateBusinessRules(config as SimulationConfig)
      result.errors.push(...businessValidation.errors)
      result.warnings.push(...businessValidation.warnings)
    }

    result.valid = result.errors.length === 0
    return result
  }

  /**
   * Format AJV errors into human-readable messages
   */
  private formatAjvErrors(errors: ErrorObject[]): string[] {
    return errors.map(error => {
      const path = error.instancePath || '(root)'
      const message = error.message || 'Unknown error'
      const value = error.data !== undefined ? ` (received: ${JSON.stringify(error.data)})` : ''
      
      switch (error.keyword) {
        case 'required':
          return `Missing required field: ${error.params?.missingProperty} at ${path}`
        case 'type':
          return `Wrong type at ${path}: expected ${error.params?.type}, got ${typeof error.data}${value}`
        case 'minLength':
          return `Value too short at ${path}: minimum ${error.params?.limit} characters${value}`
        case 'maxLength':
          return `Value too long at ${path}: maximum ${error.params?.limit} characters${value}`
        case 'pattern':
          return `Invalid format at ${path}: ${message}${value}`
        case 'enum':
          return `Invalid value at ${path}: must be one of ${JSON.stringify(error.params?.allowedValues)}${value}`
        case 'minItems':
          return `Too few items at ${path}: minimum ${error.params?.limit} required${value}`
        case 'maxItems':
          return `Too many items at ${path}: maximum ${error.params?.limit} allowed${value}`
        default:
          return `Validation error at ${path}: ${message}${value}`
      }
    })
  }

  /**
   * Business logic validation beyond schema
   */
  private validateBusinessRules(config: SimulationConfig): { errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for duplicate parameter keys
    const paramKeys = config.parameters.map(p => p.key)
    const duplicateParams = paramKeys.filter((key, index) => paramKeys.indexOf(key) !== index)
    if (duplicateParams.length > 0) {
      errors.push(`Duplicate parameter keys: ${[...new Set(duplicateParams)].join(', ')}`)
    }

    // Check for duplicate output keys
    if (config.outputs) {
      const outputKeys = config.outputs.map(o => o.key)
      const duplicateOutputs = outputKeys.filter((key, index) => outputKeys.indexOf(key) !== index)
      if (duplicateOutputs.length > 0) {
        errors.push(`Duplicate output keys: ${[...new Set(duplicateOutputs)].join(', ')}`)
      }
    }

    // Validate select parameters have options
    config.parameters.forEach(param => {
      if (param.type === 'select') {
        if (!param.options || param.options.length === 0) {
          errors.push(`Select parameter '${param.key}' must have options array`)
        } else if (!param.options.includes(String(param.default))) {
          errors.push(`Default value '${param.default}' for parameter '${param.key}' must be one of the options: ${param.options.join(', ')}`)
        }
      }
    })

    // Validate number parameter constraints
    config.parameters.forEach(param => {
      if (param.type === 'number' && typeof param.default === 'number') {
        if (param.min !== undefined && param.default < param.min) {
          errors.push(`Default value ${param.default} for parameter '${param.key}' is below minimum ${param.min}`)
        }
        if (param.max !== undefined && param.default > param.max) {
          errors.push(`Default value ${param.default} for parameter '${param.key}' is above maximum ${param.max}`)
        }
        if (param.min !== undefined && param.max !== undefined && param.min > param.max) {
          errors.push(`Parameter '${param.key}' has invalid range: min (${param.min}) > max (${param.max})`)
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

    // Validate simulation logic
    if (config.simulation) {
      if (!config.simulation.logic.includes('return')) {
        errors.push('Simulation logic must contain a return statement')
      }

      // Check if simulation references output keys (warning, not error)
      if (config.outputs) {
        const logicReferencesOutputs = config.outputs.some(output => 
          config.simulation!.logic.includes(output.key)
        )
        if (!logicReferencesOutputs) {
          warnings.push('Simulation logic should reference at least one of the defined output keys')
        }
      }
    }

    // Validate required simulation or baseSimulation
    if (!config.simulation && !config.baseSimulation) {
      errors.push('Configuration must have either simulation logic or baseSimulation reference')
    }

    return { errors, warnings }
  }

  /**
   * Validate multiple files and return summary
   */
  async validateDirectory(directory: string): Promise<{
    totalFiles: number
    validFiles: number
    results: ValidationResult[]
  }> {
    const files = await readdir(directory)
    const yamlFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
    
    const results: ValidationResult[] = []
    
    for (const file of yamlFiles) {
      const filePath = `${directory}/${file}`
      const result = await this.validateFile(filePath)
      results.push(result)
    }
    
    return {
      totalFiles: yamlFiles.length,
      validFiles: results.filter(r => r.valid).length,
      results
    }
  }
}

// Export singleton instance for consistent usage
export const validator = new BulletproofValidator()