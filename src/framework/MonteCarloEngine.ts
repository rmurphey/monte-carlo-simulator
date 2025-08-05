import { ParameterDefinition, SimulationMetadata, SimulationResult, SimulationResults } from './types'
import { StatisticalAnalyzer } from './StatisticalAnalyzer'
import { ParameterSchema } from './ParameterSchema'

export abstract class MonteCarloEngine {
  protected analyzer = new StatisticalAnalyzer()
  private _parameterSchema?: ParameterSchema

  abstract getMetadata(): SimulationMetadata
  abstract getParameterDefinitions(): ParameterDefinition[]
  abstract simulateScenario(parameters: Record<string, unknown>): Record<string, number>

  getParameterSchema(): ParameterSchema {
    if (!this._parameterSchema) {
      this._parameterSchema = new ParameterSchema(this.getParameterDefinitions())
    }
    return this._parameterSchema
  }

  validateParameters(parameters: Record<string, unknown>): void {
    const schema = this.getParameterSchema()
    const result = schema.validateParameters(parameters)
    
    if (!result.isValid) {
      throw new Error(`Parameter validation failed: ${result.errors.join('; ')}`)
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