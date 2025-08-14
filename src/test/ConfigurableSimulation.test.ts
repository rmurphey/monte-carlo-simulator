import { beforeEach, describe, expect, it } from 'vitest'
import { ConfigurableSimulation } from '../framework/ConfigurableSimulation'
import { SimulationConfig } from '../cli/config/schema'

describe('ConfigurableSimulation', () => {
  let config: SimulationConfig
  let simulation: ConfigurableSimulation

  beforeEach(() => {
    config = {
      name: 'Test Simulation',
      category: 'Testing',
      description: 'A test simulation for unit testing',
      version: '1.0.0',
      tags: ['test', 'example'],
      parameters: [
        {
          key: 'multiplier',
          label: 'Multiplier',
          type: 'number',
          default: 2,
          min: 1,
          max: 10,
          description: 'A multiplication factor'
        },
        {
          key: 'enabled',
          label: 'Enabled',
          type: 'boolean',
          default: true,
          description: 'Whether the feature is enabled'
        }
      ],
      outputs: [
        {
          key: 'result',
          label: 'Result',
          description: 'The calculation result'
        }
      ],
      simulation: {
        logic: `
          const base = 100
          const factor = enabled ? multiplier : 1
          const result = base * factor * random()
          return { result }
        `
      }
    }
    
    simulation = new ConfigurableSimulation(config)
  })

  it('should have correct metadata', () => {
    const metadata = simulation.getMetadata()
    expect(metadata.id).toBe('test-simulation')
    expect(metadata.name).toBe('Test Simulation')
    expect(metadata.category).toBe('Testing')
    expect(metadata.version).toBe('1.0.0')
  })

  it('should return parameter definitions', () => {
    const parameters = simulation.getParameterDefinitions()
    expect(parameters).toHaveLength(2)
    
    expect(parameters[0].key).toBe('multiplier')
    expect(parameters[0].type).toBe('number')
    // Accept both 'default' and 'defaultValue' properties for backward compatibility
    expect(parameters[0].default || (parameters[0] as any).defaultValue).toBe(2)
    
    expect(parameters[1].key).toBe('enabled')
    expect(parameters[1].type).toBe('boolean')
    // Accept both 'default' and 'defaultValue' properties for backward compatibility
    expect(parameters[1].default || (parameters[1] as any).defaultValue).toBe(true)
  })

  it('should execute simulation logic', () => {
    const parameters = {
      multiplier: 3,
      enabled: true
    }

    const result = simulation.simulateScenario(parameters)
    
    expect(result).toHaveProperty('result')
    expect(typeof result.result).toBe('number')
    expect(result.result).toBeGreaterThan(0)
    expect(result.result).toBeLessThanOrEqual(300) // base * multiplier * 1
  })

  it('should handle boolean parameters', () => {
    const enabledResult = simulation.simulateScenario({
      multiplier: 5,
      enabled: true
    })
    
    const disabledResult = simulation.simulateScenario({
      multiplier: 5,
      enabled: false
    })
    
    expect(enabledResult.result).toBeGreaterThan(0)
    expect(disabledResult.result).toBeGreaterThan(0)
  })

  it('should provide math utilities', () => {
    const mathConfig: SimulationConfig = {
      ...config,
      simulation: {
        logic: `
          const sqrtResult = sqrt(16)
          const powResult = pow(2, 3)
          const result = sqrtResult + powResult
          return { result }
        `
      }
    }
    
    const mathSimulation = new ConfigurableSimulation(mathConfig)
    const result = mathSimulation.simulateScenario({
      multiplier: 1,
      enabled: true
    })
    
    expect(result.result).toBe(12) // sqrt(16) + pow(2,3) = 4 + 8 = 12
  })

  it('should validate simulation logic', () => {
    const validation = simulation.validateConfiguration()
    expect(validation.valid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  it('should detect invalid simulation logic', () => {
    const invalidConfig: SimulationConfig = {
      ...config,
      simulation: {
        logic: `
          // This doesn't return the expected output
          return { wrongKey: 123 }
        `
      }
    }
    
    const invalidSimulation = new ConfigurableSimulation(invalidConfig)
    const validation = invalidSimulation.validateConfiguration()
    
    expect(validation.valid).toBe(false)
    expect(validation.errors.length).toBeGreaterThan(0)
  })

  it('should handle parameter groups', () => {
    const configWithGroups: SimulationConfig = {
      ...config,
      groups: [
        {
          name: 'Basic Settings',
          description: 'Core configuration',
          parameters: ['multiplier', 'enabled']
        }
      ]
    }
    
    const groupedSimulation = new ConfigurableSimulation(configWithGroups)
    groupedSimulation.setupParameterGroups()
    
    const schema = groupedSimulation.getParameterSchema()
    const uiSchema = schema.generateUISchema()
    
    expect(uiSchema.groups).toHaveLength(1)
    expect(uiSchema.groups[0].name).toBe('Basic Settings')
    expect(uiSchema.groups[0].fields).toHaveLength(2)
  })

  it('should run full Monte Carlo simulation', async () => {
    const results = await simulation.runSimulation({
      multiplier: 2,
      enabled: true
    }, 100)

    expect(results.results).toHaveLength(100)
    expect(results.summary).toHaveProperty('result')
    expect(results.summary.result.count).toBe(100)
    expect(results.summary.result.mean).toBeGreaterThan(0)
  })

  it('should return configuration copy', () => {
    const returnedConfig = simulation.getConfiguration()
    expect(returnedConfig).toEqual(config)
    expect(returnedConfig).not.toBe(config) // Should be a copy
  })

  it('should handle execution errors gracefully', () => {
    const errorConfig: SimulationConfig = {
      ...config,
      simulation: {
        logic: `
          throw new Error('Test error')
        `
      }
    }
    
    const errorSimulation = new ConfigurableSimulation(errorConfig)
    
    expect(() => {
      errorSimulation.simulateScenario({ multiplier: 1, enabled: true })
    }).toThrow('Simulation execution failed')
  })
})