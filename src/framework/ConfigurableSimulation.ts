import { MonteCarloEngine } from './MonteCarloEngine'
import { SimulationMetadata, ParameterDefinition } from './types'
import { SimulationConfig } from '../cli/config/schema'
import { toId } from '../cli/utils/name-converter'

export class ConfigurableSimulation extends MonteCarloEngine {
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
    return this.config.parameters.map(param => ({
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
        ${this.config.simulation.logic}
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
      const expectedOutputs = this.config.outputs.map(o => o.key)
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
  
  getOutputDefinitions() {
    return this.config.outputs
  }
  
  getConfiguration(): SimulationConfig {
    return { ...this.config } // Return a copy to prevent mutations
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
      const expectedOutputs = this.config.outputs.map(o => o.key)
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