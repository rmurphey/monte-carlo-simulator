import { OutputConfig, ParameterConfig, SimulationConfig } from '../../web/types'

export interface ParameterValues {
  [key: string]: number | string | boolean
}

export interface ScenarioResults {
  [key: string]: number | string | boolean
}

export interface SimulationMetadata {
  name: string
  category: string
  description: string
  version: string
  tags: string[]
}

export interface ParameterGroup {
  name: string
  description: string
  parameters: string[]
}

/**
 * Abstract base class for all Monte Carlo simulations
 * Provides common utilities and enforces consistent architecture
 */
export abstract class BaseSimulation {
  protected parameters: ParameterValues = {}
  
  constructor(protected config?: SimulationConfig) {
    if (config) {
      this.initializeFromConfig(config)
    }
  }

  // Abstract methods that must be implemented by derived classes
  abstract defineMetadata(): SimulationMetadata
  abstract defineParameters(): ParameterConfig[]
  abstract defineOutputs(): OutputConfig[]
  abstract calculateScenario(_params: ParameterValues): ScenarioResults

  // Optional method for parameter grouping
  defineParameterGroups(): ParameterGroup[] {
    return []
  }

  /**
   * Generate complete simulation configuration
   */
  generateConfig(): SimulationConfig {
    const metadata = this.defineMetadata()
    const parameters = this.defineParameters()
    const outputs = this.defineOutputs()
    const groups = this.defineParameterGroups()
    
    return {
      name: metadata.name,
      category: metadata.category,
      description: metadata.description,
      version: metadata.version,
      tags: metadata.tags,
      parameters,
      outputs,
      simulation: {
        logic: this.generateSimulationLogic()
      },
      ...(groups.length > 0 && { groups })
    }
  }

  /**
   * Run simulation with given parameters
   */
  simulate(params: ParameterValues): ScenarioResults {
    this.parameters = { ...params }
    this.validateParameters()
    return this.calculateScenario(params)
  }

  /**
   * Generate multiple scenario comparisons
   */
  compareScenarios(scenarios: Array<{ name: string; parameters: ParameterValues }>): Array<{ name: string; results: ScenarioResults }> {
    return scenarios.map(scenario => ({
      name: scenario.name,
      results: this.simulate(scenario.parameters)
    }))
  }

  // Monte Carlo utility functions available to all simulations
  protected random(): number {
    return Math.random()
  }

  protected round(value: number, decimals = 0): number {
    const factor = Math.pow(10, decimals)
    return Math.round(value * factor) / factor
  }

  protected min(...values: number[]): number {
    return Math.min(...values)
  }

  protected max(...values: number[]): number {
    return Math.max(...values)
  }

  protected clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
  }

  protected normalDistribution(mean: number, stdDev: number): number {
    // Box-Muller transformation for normal distribution
    const u1 = this.random()
    const u2 = this.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return mean + stdDev * z0
  }

  protected triangularDistribution(min: number, max: number, mode: number): number {
    const u = this.random()
    const c = (mode - min) / (max - min)
    
    if (u < c) {
      return min + Math.sqrt(u * (max - min) * (mode - min))
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode))
    }
  }

  protected logNormalDistribution(mean: number, stdDev: number): number {
    return Math.exp(this.normalDistribution(mean, stdDev))
  }

  protected percentileDistribution(values: number[], percentile: number): number {
    const sorted = values.slice().sort((a, b) => a - b)
    const index = (percentile / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index - lower
    
    if (lower === upper) {
      return sorted[lower]
    }
    
    return sorted[lower] * (1 - weight) + sorted[upper] * weight
  }

  // Parameter validation
  private validateParameters(): void {
    const parameterDefs = this.defineParameters()
    const parameterMap = new Map(parameterDefs.map(p => [p.key, p]))
    
    for (const [key, value] of Object.entries(this.parameters)) {
      const def = parameterMap.get(key)
      if (!def) continue
      
      if (def.type === 'number' && typeof value === 'number') {
        if (def.min !== undefined && value < def.min) {
          throw new Error(`Parameter ${key} value ${value} is below minimum ${def.min}`)
        }
        if (def.max !== undefined && value > def.max) {
          throw new Error(`Parameter ${key} value ${value} exceeds maximum ${def.max}`)
        }
      }
      
      if (def.type === 'select' && def.options && !def.options.includes(value as string)) {
        throw new Error(`Parameter ${key} value ${value} is not in allowed options: ${def.options.join(', ')}`)
      }
    }
  }

  // Initialize from existing configuration (for backward compatibility)
  private initializeFromConfig(config: SimulationConfig): void {
    // Extract default values from parameters
    const defaultParams: ParameterValues = {}
    config.parameters.forEach((param: ParameterConfig) => {
      defaultParams[param.key] = param.default
    })
    this.parameters = defaultParams
  }

  // Generate simulation logic as string (for YAML export)
  private generateSimulationLogic(): string {
    // This will be overridden by derived classes that need to export to YAML
    // For now, return a placeholder that indicates this is a TypeScript-based simulation
    return `// This simulation is implemented in TypeScript
// Use the simulate() method to run calculations
throw new Error('This simulation must be run through the TypeScript API')`
  }

  // Helper method to get parameter value with type safety
  protected getParameter<T = number | string | boolean>(key: string, defaultValue?: T): T {
    const value = this.parameters[key]
    return value !== undefined ? value as T : defaultValue as T
  }

  // Helper method to check if parameter exists
  protected hasParameter(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.parameters, key)
  }

  // Generate parameter validation schema
  getParameterSchema(): Record<string, any> {
    const parameters = this.defineParameters()
    const schema: Record<string, any> = {}
    
    parameters.forEach(param => {
      schema[param.key] = {
        type: param.type,
        required: true,
        ...(param.min !== undefined && { min: param.min }),
        ...(param.max !== undefined && { max: param.max }),
        ...(param.options && { enum: param.options }),
        description: param.description
      }
    })
    
    return schema
  }
}