import { ParameterDefinition } from './types'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface ParameterGroup {
  name: string
  description?: string
  parameters: string[]
}

export class ParameterSchema {
  private definitions: Map<string, ParameterDefinition> = new Map()
  private groups: ParameterGroup[] = []

  constructor(definitions: ParameterDefinition[]) {
    for (const def of definitions) {
      this.definitions.set(def.key, def)
    }
  }

  addGroup(group: ParameterGroup): void {
    // Validate that all parameters in the group exist
    for (const paramKey of group.parameters) {
      if (!this.definitions.has(paramKey)) {
        throw new Error(`Parameter '${paramKey}' in group '${group.name}' does not exist`)
      }
    }
    this.groups.push(group)
  }

  getGroups(): ParameterGroup[] {
    return [...this.groups]
  }

  getDefinitions(): ParameterDefinition[] {
    return Array.from(this.definitions.values())
  }

  getDefinition(key: string): ParameterDefinition | undefined {
    return this.definitions.get(key)
  }

  validateParameter(key: string, value: unknown): ValidationResult {
    const def = this.definitions.get(key)
    if (!def) {
      return {
        isValid: false,
        errors: [`Unknown parameter: ${key}`]
      }
    }

    const errors: string[] = []

    // Check for required parameters
    if (value === undefined || value === null) {
      errors.push(`Parameter '${def.label}' is required`)
      return { isValid: false, errors }
    }

    // Type-specific validation
    switch (def.type) {
      case 'number': {
        const numValue = Number(value)
        if (isNaN(numValue)) {
          errors.push(`Parameter '${def.label}' must be a number`)
        } else {
          if (def.min !== undefined && numValue < def.min) {
            errors.push(`Parameter '${def.label}' must be >= ${def.min}`)
          }
          if (def.max !== undefined && numValue > def.max) {
            errors.push(`Parameter '${def.label}' must be <= ${def.max}`)
          }
          if (def.step !== undefined && def.min !== undefined) {
            const steps = Math.round((numValue - def.min) / def.step)
            const expectedValue = def.min + (steps * def.step)
            if (Math.abs(numValue - expectedValue) > 0.0001) {
              errors.push(`Parameter '${def.label}' must be in steps of ${def.step}`)
            }
          }
        }
        break
      }

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`Parameter '${def.label}' must be a boolean`)
        }
        break

      case 'select':
        if (!def.options) {
          errors.push(`Parameter '${def.label}' has no options defined`)
        } else if (!def.options.includes(String(value))) {
          errors.push(`Parameter '${def.label}' must be one of: ${def.options.join(', ')}`)
        }
        break

      default:
        errors.push(`Unknown parameter type: ${def.type}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  validateParameters(parameters: Record<string, unknown>): ValidationResult {
    const allErrors: string[] = []

    // Validate each provided parameter
    for (const [key, value] of Object.entries(parameters)) {
      const result = this.validateParameter(key, value)
      allErrors.push(...result.errors)
    }

    // Check for missing required parameters
    for (const def of this.definitions.values()) {
      if (!(def.key in parameters)) {
        allErrors.push(`Missing required parameter: ${def.label}`)
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    }
  }

  getDefaultParameters(): Record<string, unknown> {
    const defaults: Record<string, unknown> = {}
    for (const def of this.definitions.values()) {
      defaults[def.key] = def.default
    }
    return defaults
  }

  coerceParameters(parameters: Record<string, unknown>): Record<string, unknown> {
    const coerced: Record<string, unknown> = {}
    
    for (const [key, value] of Object.entries(parameters)) {
      const def = this.definitions.get(key)
      if (!def) {
        coerced[key] = value
        continue
      }

      switch (def.type) {
        case 'number':
          coerced[key] = Number(value)
          break
        case 'boolean':
          coerced[key] = Boolean(value)
          break
        case 'select':
          coerced[key] = String(value)
          break
        default:
          coerced[key] = value
      }
    }

    return coerced
  }

  generateUISchema(): {
    groups: Array<{
      name: string
      description?: string
      fields: Array<{
        key: string
        label: string
        type: string
        defaultValue: unknown
        constraints?: Record<string, unknown>
        options?: string[]
        description?: string
      }>
    }>
    ungrouped: Array<{
      key: string
      label: string
      type: string
      defaultValue: unknown
      constraints?: Record<string, unknown>
      options?: string[]
      description?: string
    }>
  } {
    const groupedParams = new Set<string>()
    const groups = this.groups.map(group => ({
      name: group.name,
      description: group.description,
      fields: group.parameters.map(paramKey => {
        groupedParams.add(paramKey)
        const def = this.definitions.get(paramKey)!
        return this.definitionToUIField(def)
      })
    }))

    const ungrouped = Array.from(this.definitions.values())
      .filter(def => !groupedParams.has(def.key))
      .map(def => this.definitionToUIField(def))

    return { groups, ungrouped }
  }

  private definitionToUIField(def: ParameterDefinition) {
    const constraints: Record<string, unknown> = {}
    if (def.min !== undefined) constraints.min = def.min
    if (def.max !== undefined) constraints.max = def.max
    if (def.step !== undefined) constraints.step = def.step

    return {
      key: def.key,
      label: def.label,
      type: def.type,
      defaultValue: def.default,
      constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
      options: def.options,
      description: def.description
    }
  }
}