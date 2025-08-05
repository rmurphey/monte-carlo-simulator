import { ParameterDefinition, SimulationMetadata, SimulationResult, SimulationResults } from './types'
import { StatisticalAnalyzer } from './StatisticalAnalyzer'

export abstract class MonteCarloEngine {
  protected analyzer = new StatisticalAnalyzer()

  abstract getMetadata(): SimulationMetadata
  abstract getParameterDefinitions(): ParameterDefinition[]
  abstract simulateScenario(parameters: Record<string, unknown>): Record<string, number>

  validateParameters(parameters: Record<string, unknown>): void {
    const definitions = this.getParameterDefinitions()
    
    for (const def of definitions) {
      const value = parameters[def.key]
      
      if (value === undefined || value === null) {
        throw new Error(`Missing required parameter: ${def.key}`)
      }

      if (def.type === 'number') {
        const numValue = Number(value)
        if (isNaN(numValue)) {
          throw new Error(`Parameter ${def.key} must be a number`)
        }
        if (def.min !== undefined && numValue < def.min) {
          throw new Error(`Parameter ${def.key} must be >= ${def.min}`)
        }
        if (def.max !== undefined && numValue > def.max) {
          throw new Error(`Parameter ${def.key} must be <= ${def.max}`)
        }
      }

      if (def.type === 'boolean' && typeof value !== 'boolean') {
        throw new Error(`Parameter ${def.key} must be a boolean`)
      }

      if (def.type === 'select' && def.options && !def.options.includes(String(value))) {
        throw new Error(`Parameter ${def.key} must be one of: ${def.options.join(', ')}`)
      }
    }
  }

  async runSimulation(
    parameters: Record<string, unknown>, 
    iterations: number = 1000,
    onProgress?: (progress: number, iteration: number) => void
  ): Promise<SimulationResults> {
    const startTime = new Date()
    
    this.validateParameters(parameters)
    
    if (iterations <= 0) {
      throw new Error('Iterations must be greater than 0')
    }
    
    const results: SimulationResult[] = []
    const errors: Array<{ iteration: number, error: string }> = []
    
    for (let i = 0; i < iterations; i++) {
      try {
        const scenarioResult = this.simulateScenario(parameters)
        results.push({
          iteration: i,
          ...scenarioResult
        })
      } catch (error) {
        errors.push({
          iteration: i,
          error: error instanceof Error ? error.message : String(error)
        })
      }
      
      // Report progress every 100 iterations or on completion
      if (onProgress && (i % 100 === 0 || i === iterations - 1)) {
        onProgress((i + 1) / iterations, i + 1)
      }
    }
    
    if (results.length === 0) {
      throw new Error('All simulation iterations failed')
    }
    
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    
    // Calculate statistical summaries for all numeric result keys
    const numericKeys = Object.keys(results[0])
      .filter(key => key !== 'iteration' && typeof results[0][key] === 'number')
    
    const summary: Record<string, any> = {}
    for (const key of numericKeys) {
      const values = results.map(r => Number(r[key]))
      summary[key] = this.analyzer.calculateSummary(values)
    }

    return {
      metadata: this.getMetadata(),
      parameters,
      results,
      summary,
      startTime,
      endTime,
      duration,
      errors: errors.length > 0 ? errors : undefined
    }
  }
}