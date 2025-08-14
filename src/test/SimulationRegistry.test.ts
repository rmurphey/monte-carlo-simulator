import { beforeEach, describe, expect, it } from 'vitest'
import { SimulationRegistry } from '../framework/SimulationRegistry'
import { MonteCarloEngine } from '../framework/MonteCarloEngine'
import { ParameterDefinition, SimulationMetadata } from '../framework/types'

// Mock simulation classes for testing
class MockAISimulation extends MonteCarloEngine {
  getMetadata(): SimulationMetadata {
    return {
      id: 'ai-investment-roi',
      name: 'AI Investment ROI',
      description: 'Simulate AI tool investment returns',
      category: 'Finance',
      version: '1.0.0'
    }
  }

  getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'initialInvestment',
        label: 'Initial Investment',
        type: 'number',
        default: 100000,
        min: 1000,
        max: 1000000
      }
    ]
  }

  simulateScenario(): Record<string, number> {
    return { roi: Math.random() * 0.2 }
  }
}

class MockPortfolioSimulation extends MonteCarloEngine {
  getMetadata(): SimulationMetadata {
    return {
      id: 'portfolio-risk',
      name: 'Portfolio Risk Assessment',
      description: 'Analyze portfolio risk metrics',
      category: 'Finance',
      version: '1.1.0'
    }
  }

  getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'portfolioValue',
        label: 'Portfolio Value',
        type: 'number',
        default: 500000,
        min: 10000
      }
    ]
  }

  simulateScenario(): Record<string, number> {
    return { var95: Math.random() * -0.1 }
  }
}

class MockProductSimulation extends MonteCarloEngine {
  getMetadata(): SimulationMetadata {
    return {
      id: 'product-launch',
      name: 'Product Launch Success',
      description: 'Model product launch outcomes',
      category: 'Marketing',
      version: '2.0.0'
    }
  }

  getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'marketSize',
        label: 'Market Size',
        type: 'number',
        default: 1000000
      }
    ]
  }

  simulateScenario(): Record<string, number> {
    return { revenue: Math.random() * 1000000 }
  }
}

describe('SimulationRegistry', () => {
  let registry: SimulationRegistry

  beforeEach(() => {
    // Get fresh instance and clear it
    registry = SimulationRegistry.getInstance()
    registry.clear()
  })

  it('should be a singleton', () => {
    const registry1 = SimulationRegistry.getInstance()
    const registry2 = SimulationRegistry.getInstance()
    expect(registry1).toBe(registry2)
  })

  it('should register and retrieve simulations', () => {
    registry.register(() => new MockAISimulation())
    
    const simulation = registry.getSimulation('ai-investment-roi')
    expect(simulation).toBeInstanceOf(MockAISimulation)
    expect(simulation?.getMetadata().name).toBe('AI Investment ROI')
  })

  it('should register simulations with tags', () => {
    registry.register(() => new MockAISimulation(), ['ml', 'roi', 'finance'])
    
    const entry = registry.getSimulationEntry('ai-investment-roi')
    expect(entry?.tags).toEqual(['ml', 'roi', 'finance'])
  })

  it('should prevent duplicate registration', () => {
    registry.register(() => new MockAISimulation())
    
    expect(() => {
      registry.register(() => new MockAISimulation())
    }).toThrow("Simulation with id 'ai-investment-roi' is already registered")
  })

  it('should return null for non-existent simulation', () => {
    const simulation = registry.getSimulation('non-existent')
    expect(simulation).toBeNull()
  })

  it('should get all simulations sorted by name', () => {
    registry.register(() => new MockPortfolioSimulation())
    registry.register(() => new MockAISimulation())
    registry.register(() => new MockProductSimulation())

    const simulations = registry.getAllSimulations()
    expect(simulations).toHaveLength(3)
    expect(simulations[0].name).toBe('AI Investment ROI')
    expect(simulations[1].name).toBe('Portfolio Risk Assessment')
    expect(simulations[2].name).toBe('Product Launch Success')
  })

  it('should get simulations by category', () => {
    registry.register(() => new MockAISimulation())
    registry.register(() => new MockPortfolioSimulation())
    registry.register(() => new MockProductSimulation())

    const financeSimulations = registry.getSimulationsByCategory('Finance')
    expect(financeSimulations).toHaveLength(2)
    expect(financeSimulations.every(sim => sim.category === 'Finance')).toBe(true)

    const marketingSimulations = registry.getSimulationsByCategory('Marketing')
    expect(marketingSimulations).toHaveLength(1)
    expect(marketingSimulations[0].category).toBe('Marketing')
  })

  it('should get all categories', () => {
    registry.register(() => new MockAISimulation())
    registry.register(() => new MockPortfolioSimulation())
    registry.register(() => new MockProductSimulation())

    const categories = registry.getCategories()
    expect(categories).toEqual(['Finance', 'Marketing'])
  })

  it('should get all tags', () => {
    registry.register(() => new MockAISimulation(), ['ml', 'finance'])
    registry.register(() => new MockPortfolioSimulation(), ['risk', 'finance'])
    registry.register(() => new MockProductSimulation(), ['marketing', 'revenue'])

    const tags = registry.getTags()
    expect(tags).toEqual(['finance', 'marketing', 'ml', 'revenue', 'risk'])
  })

  it('should search simulations by query', () => {
    registry.register(() => new MockAISimulation())
    registry.register(() => new MockPortfolioSimulation())
    registry.register(() => new MockProductSimulation())

    const aiResults = registry.searchSimulations({ query: 'AI' })
    expect(aiResults).toHaveLength(1)
    expect(aiResults[0].name).toBe('AI Investment ROI')

    const riskResults = registry.searchSimulations({ query: 'risk' })
    expect(riskResults).toHaveLength(1)
    expect(riskResults[0].name).toBe('Portfolio Risk Assessment')
  })

  it('should search simulations by tags', () => {
    registry.register(() => new MockAISimulation(), ['ml', 'finance'])
    registry.register(() => new MockPortfolioSimulation(), ['risk', 'finance'])
    registry.register(() => new MockProductSimulation(), ['marketing'])

    const financeResults = registry.searchSimulations({ tags: ['finance'] })
    expect(financeResults).toHaveLength(2)

    const mlResults = registry.searchSimulations({ tags: ['ml'] })
    expect(mlResults).toHaveLength(1)
    expect(mlResults[0].name).toBe('AI Investment ROI')
  })

  it('should search with multiple criteria', () => {
    registry.register(() => new MockAISimulation(), ['ml', 'finance'])
    registry.register(() => new MockPortfolioSimulation(), ['risk', 'finance'])
    registry.register(() => new MockProductSimulation(), ['marketing'])

    const results = registry.searchSimulations({
      category: 'Finance',
      tags: ['ml']
    })
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('AI Investment ROI')
  })

  it('should sort search results', () => {
    registry.register(() => new MockPortfolioSimulation())
    registry.register(() => new MockAISimulation())
    registry.register(() => new MockProductSimulation())

    const byNameDesc = registry.searchSimulations({ 
      sortBy: 'name', 
      sortOrder: 'desc' 
    })
    expect(byNameDesc[0].name).toBe('Product Launch Success')
    expect(byNameDesc[2].name).toBe('AI Investment ROI')

    const byVersion = registry.searchSimulations({ 
      sortBy: 'version', 
      sortOrder: 'desc' 
    })
    expect(byVersion[0].version).toBe('2.0.0')
    expect(byVersion[2].version).toBe('1.0.0')
  })

  it('should check if simulation is registered', () => {
    expect(registry.isRegistered('ai-investment-roi')).toBe(false)
    
    registry.register(() => new MockAISimulation())
    expect(registry.isRegistered('ai-investment-roi')).toBe(true)
  })

  it('should get simulation count', () => {
    expect(registry.getSimulationCount()).toBe(0)
    
    registry.register(() => new MockAISimulation())
    expect(registry.getSimulationCount()).toBe(1)
    
    registry.register(() => new MockPortfolioSimulation())
    expect(registry.getSimulationCount()).toBe(2)
  })

  it('should unregister simulations', () => {
    registry.register(() => new MockAISimulation())
    expect(registry.isRegistered('ai-investment-roi')).toBe(true)
    
    const removed = registry.unregister('ai-investment-roi')
    expect(removed).toBe(true)
    expect(registry.isRegistered('ai-investment-roi')).toBe(false)
    
    const notRemoved = registry.unregister('non-existent')
    expect(notRemoved).toBe(false)
  })

  it('should clear all simulations', () => {
    registry.register(() => new MockAISimulation())
    registry.register(() => new MockPortfolioSimulation())
    expect(registry.getSimulationCount()).toBe(2)
    
    registry.clear()
    expect(registry.getSimulationCount()).toBe(0)
  })
})