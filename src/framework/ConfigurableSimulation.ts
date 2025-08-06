import { MonteCarloEngine } from './MonteCarloEngine'
import { SimulationMetadata, ParameterDefinition } from './types'
import { SimulationConfig, ParameterConfig } from '../cli/config/schema'
import { toId } from '../cli/utils/name-converter'
import { globalARRInjector, ARRBusinessContextInjector } from './ARRBusinessContext'

export class ConfigurableSimulation extends MonteCarloEngine {
  private arrInjector: ARRBusinessContextInjector
  private enhancedConfig: SimulationConfig
  
  constructor(private config: SimulationConfig) {
    super()
    this.arrInjector = globalARRInjector
    this.enhancedConfig = this.enhanceConfigWithBusinessContext(config)
  }

  /**
   * Enhances simulation config with optional business context injection
   * Only injects ARR if explicitly requested or detected via strategic keywords
   */
  private enhanceConfigWithBusinessContext(config: SimulationConfig): SimulationConfig {
    const parameterKeys = config.parameters.map(p => p.key)
    
    // Check if simulation needs business context
    const needsBusinessContext = this.shouldInjectBusinessContext(config)
    
    if (!needsBusinessContext) {
      return config
    }
    
    // Check if ARR is already present
    if (this.arrInjector.hasARRParameter(parameterKeys)) {
      // ARR already exists, just enhance simulation logic
      return {
        ...config,
        simulation: {
          logic: this.injectBusinessContext(config.simulation?.logic || '', parameterKeys)
        }
      }
    }
    
    // Inject ARR parameter and business context
    const arrParam = this.arrInjector.getARRParameterDefinition('Strategic Analysis')
    const budgetParam: ParameterDefinition = {
      key: 'budgetPercent',
      label: 'Budget Allocation (% of ARR)',
      type: 'number',
      default: 10,
      min: 1,
      max: 50,
      step: 0.5,
      description: 'Budget as percentage of ARR for this strategic analysis'
    }
    const arrGroup = this.arrInjector.getARRParameterGroup()
    const allParameterKeys = [arrParam.key, budgetParam.key, ...parameterKeys]
    
    return {
      ...config,
      parameters: [arrParam, budgetParam, ...config.parameters],
      groups: [arrGroup, ...(config.groups || [])],
      simulation: {
        logic: this.injectBusinessContext(config.simulation?.logic || '', allParameterKeys)
      }
    }
  }

  /**
   * Determines if this simulation should have business context injected
   */
  private shouldInjectBusinessContext(config: SimulationConfig): boolean {
    // Check for explicit business context request
    if (config.businessContext === true) {
      return true
    }
    
    // Check for strategic/business keywords in various places
    const strategicKeywords = [
      'roi', 'investment', 'cost', 'benefit', 'revenue', 'profit', 'budget',
      'runway', 'burn', 'hiring', 'scaling', 'strategy', 'payback', 'npv'
    ]
    
    const textToCheck = [
      config.name.toLowerCase(),
      config.description.toLowerCase(),
      config.category.toLowerCase(),
      ...(config.tags?.map(t => t.toLowerCase()) || []),
      config.simulation?.logic?.toLowerCase() || ''
    ].join(' ')
    
    return strategicKeywords.some(keyword => textToCheck.includes(keyword))
  }
  
  /**
   * Injects business context into simulation logic
   */
  private injectBusinessContext(originalLogic: string, parameterKeys: string[] = []): string {
    const contextInjection = this.arrInjector.getBusinessContextInjectionCode(parameterKeys)
    
    return `${contextInjection}
    
    // Original simulation logic:
    ${originalLogic}`
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
    return this.enhancedConfig.parameters.map(param => ({
      key: param.key,
      label: param.label,
      type: param.type,
      defaultValue: param.default,
      min: param.min,
      max: param.max,
      step: param.step,
      options: param.options,
      description: param.description
    }))
  }
  
  simulateScenario(parameters: Record<string, unknown>): Record<string, number> {
    try {
      // Create a safe execution context
      const parameterNames = Object.keys(parameters)
      const parameterValues = Object.values(parameters)
      
      // Add some common utilities to the execution context
      const mathUtils = {
        random: Math.random,
        sqrt: Math.sqrt,
        pow: Math.pow,
        log: Math.log,
        exp: Math.exp,
        abs: Math.abs,
        min: Math.min,
        max: Math.max,
        floor: Math.floor,
        ceil: Math.ceil,
        round: Math.round
      }
      
      // Create the function with parameter names and logic
      const functionBody = `
        const { random, sqrt, pow, log, exp, abs, min, max, floor, ceil, round } = mathUtils;
        ${this.enhancedConfig.simulation?.logic || ''}
      `
      
      const simulationFunction = new Function(
        ...parameterNames,
        'mathUtils',
        functionBody
      )
      
      // Execute the simulation logic
      const result = simulationFunction(...parameterValues, mathUtils)
      
      // Validate the result
      if (typeof result !== 'object' || result === null) {
        throw new Error('Simulation logic must return an object')
      }
      
      // Ensure all values are numbers
      const numericResult: Record<string, number> = {}
      for (const [key, value] of Object.entries(result)) {
        const numValue = Number(value)
        if (isNaN(numValue)) {
          throw new Error(`Output '${key}' must be a number, got: ${typeof value}`)
        }
        numericResult[key] = numValue
      }
      
      // Validate that returned keys match expected outputs
      const expectedOutputs = (this.enhancedConfig.outputs || this.config.outputs || []).map(o => o.key)
      const actualOutputs = Object.keys(numericResult)
      
      const missingOutputs = expectedOutputs.filter(key => !actualOutputs.includes(key))
      if (missingOutputs.length > 0) {
        throw new Error(`Missing expected outputs: ${missingOutputs.join(', ')}`)
      }
      
      return numericResult
      
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Simulation execution failed: ${error.message}`)
      }
      throw new Error(`Simulation execution failed: ${String(error)}`)
    }
  }
  
  setupParameterGroups(): void {
    if (!this.enhancedConfig.groups) return
    
    const schema = this.getParameterSchema()
    
    this.enhancedConfig.groups.forEach(group => {
      schema.addGroup({
        name: group.name,
        description: group.description,
        parameters: group.parameters
      })
    })
  }
  
  getOutputDefinitions() {
    return this.enhancedConfig.outputs || this.config.outputs || []
  }
  
  getConfiguration(): SimulationConfig {
    return { ...this.enhancedConfig }
  }
  
  validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    try {
      // Test with default parameters
      const defaultParams: Record<string, unknown> = {}
      this.getParameterDefinitions().forEach(param => {
        defaultParams[param.key] = param.defaultValue
      })
      
      const result = this.simulateScenario(defaultParams)
      
      // Verify all expected outputs are present
      const expectedOutputs = (this.enhancedConfig.outputs || this.config.outputs || []).map(o => o.key)
      const actualOutputs = Object.keys(result)
      
      const missingOutputs = expectedOutputs.filter(key => !actualOutputs.includes(key))
      if (missingOutputs.length > 0) {
        errors.push(`Simulation doesn't return expected outputs: ${missingOutputs.join(', ')}`)
      }
      
    } catch (error) {
      errors.push(`Simulation logic validation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}