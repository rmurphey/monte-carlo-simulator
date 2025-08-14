import { beforeEach, describe, expect, it } from 'vitest'
import { AIInvestmentROI } from '../simulations/AIInvestmentROI'
import { SimulationRegistry } from '../framework/SimulationRegistry'
import { registerAllSimulations } from '../simulations'

describe('AIInvestmentROI', () => {
  let simulation: AIInvestmentROI

  beforeEach(() => {
    simulation = new AIInvestmentROI()
  })

  it('should have correct metadata', () => {
    const metadata = simulation.getMetadata()
    expect(metadata.id).toBe('ai-investment-roi')
    expect(metadata.name).toBe('AI Investment ROI')
    expect(metadata.category).toBe('Finance')
    expect(metadata.version).toBe('2.0.0')
  })

  it('should define comprehensive parameters', () => {
    const parameters = simulation.getParameterDefinitions()
    expect(parameters).toHaveLength(9)
    
    const paramKeys = parameters.map(p => p.key)
    expect(paramKeys).toContain('initialInvestment')
    expect(paramKeys).toContain('implementationTime')
    expect(paramKeys).toContain('productivityGain')
    expect(paramKeys).toContain('costSaving')
    expect(paramKeys).toContain('adoptionRate')
    expect(paramKeys).toContain('riskFactor')
    expect(paramKeys).toContain('evaluationPeriod')
  })

  it('should validate parameter constraints', () => {
    const schema = simulation.getParameterSchema()
    
    // Test valid parameters
    const validParams = {
      initialInvestment: 100000,
      implementationTime: 6,
      productivityGain: 0.15,
      costSaving: 0.08,
      marketGrowth: 0.12,
      adoptionRate: 0.7,
      maintenanceCost: 0.1,
      riskFactor: 0.2,
      evaluationPeriod: 5
    }
    
    const validResult = schema.validateParameters(validParams)
    expect(validResult.isValid).toBe(true)
    
    // Test invalid parameters
    const invalidParams = {
      ...validParams,
      initialInvestment: -1000, // Below minimum
      adoptionRate: 1.5 // Above maximum
    }
    
    const invalidResult = schema.validateParameters(invalidParams)
    expect(invalidResult.isValid).toBe(false)
    expect(invalidResult.errors.length).toBeGreaterThan(0)
  })

  it('should run single scenario simulation', () => {
    const parameters = {
      initialInvestment: 100000,
      implementationTime: 6,
      productivityGain: 0.15,
      costSaving: 0.08,
      marketGrowth: 0.12,
      adoptionRate: 0.7,
      maintenanceCost: 0.1,
      riskFactor: 0.2,
      evaluationPeriod: 5
    }

    const result = simulation.simulateScenario(parameters)
    
    expect(result).toHaveProperty('roi')
    expect(result).toHaveProperty('netPresentValue')
    expect(result).toHaveProperty('totalBenefit')
    expect(result).toHaveProperty('paybackPeriod')
    expect(result).toHaveProperty('actualAdoptionRate')
    expect(result).toHaveProperty('actualImplementationTime')
    expect(result).toHaveProperty('breakEven')
    expect(result).toHaveProperty('riskAdjustedROI')
    
    // Check value ranges
    expect(result.actualAdoptionRate).toBeGreaterThanOrEqual(0.1)
    expect(result.actualAdoptionRate).toBeLessThanOrEqual(1)
    expect(result.actualImplementationTime).toBeGreaterThan(0)
    expect(result.paybackPeriod).toBeLessThanOrEqual(20)
    expect(result.breakEven).toBeGreaterThanOrEqual(0)
    expect(result.breakEven).toBeLessThanOrEqual(1)
  })

  it('should run full Monte Carlo simulation', async () => {
    const parameters = {
      initialInvestment: 100000,
      implementationTime: 6,
      productivityGain: 0.15,
      costSaving: 0.08,
      marketGrowth: 0.12,
      adoptionRate: 0.7,
      maintenanceCost: 0.1,
      riskFactor: 0.2,
      evaluationPeriod: 5
    }

    const results = await simulation.runSimulation(parameters, 1000)
    
    expect(results.results).toHaveLength(1000)
    expect(results.summary).toHaveProperty('roi')
    expect(results.summary).toHaveProperty('netPresentValue')
    expect(results.summary).toHaveProperty('paybackPeriod')
    
    // Check statistical properties
    const roiSummary = results.summary.roi
    expect(roiSummary.count).toBe(1000)
    expect(roiSummary.mean).toBeDefined()
    expect(roiSummary.standardDeviation).toBeGreaterThan(0)
    expect(roiSummary.percentile10).toBeLessThan(roiSummary.percentile90)
  })

  it('should handle different risk scenarios', async () => {
    const baseParams = {
      initialInvestment: 100000,
      implementationTime: 6,
      productivityGain: 0.15,
      costSaving: 0.08,
      marketGrowth: 0.12,
      adoptionRate: 0.7,
      maintenanceCost: 0.1,
      riskFactor: 0.1, // Low risk
      evaluationPeriod: 5
    }

    const highRiskParams = { ...baseParams, riskFactor: 0.4 } // High risk

    const lowRiskResults = await simulation.runSimulation(baseParams, 500)
    const highRiskResults = await simulation.runSimulation(highRiskParams, 500)

    // High risk should have higher variance
    expect(highRiskResults.summary.roi.standardDeviation)
      .toBeGreaterThan(lowRiskResults.summary.roi.standardDeviation)
  })

  it('should setup parameter groups', () => {
    simulation.setupParameterGroups()
    const schema = simulation.getParameterSchema()
    const uiSchema = schema.generateUISchema()
    
    expect(uiSchema.groups).toHaveLength(3)
    expect(uiSchema.groups[0].name).toBe('Investment Parameters')
    expect(uiSchema.groups[1].name).toBe('Expected Benefits')
    expect(uiSchema.groups[2].name).toBe('Adoption & Risk')
    expect(uiSchema.ungrouped).toHaveLength(0) // All parameters should be grouped
  })

  it('should be registrable in SimulationRegistry', () => {
    const registry = SimulationRegistry.getInstance()
    registry.clear()
    
    registerAllSimulations()
    
    expect(registry.isRegistered('ai-investment-roi')).toBe(true)
    
    const registeredSimulation = registry.getSimulation('ai-investment-roi')
    expect(registeredSimulation).toBeInstanceOf(AIInvestmentROI)
    
    const entry = registry.getSimulationEntry('ai-investment-roi')
    expect(entry?.tags).toContain('ai')
    expect(entry?.tags).toContain('finance')
    expect(entry?.tags).toContain('roi')
  })

  it('should be discoverable through search', () => {
    const registry = SimulationRegistry.getInstance()
    registry.clear()
    registerAllSimulations()
    
    // Search by query
    const aiResults = registry.searchSimulations({ query: 'AI' })
    expect(aiResults).toHaveLength(1)
    expect(aiResults[0].id).toBe('ai-investment-roi')
    
    // Search by category
    const financeResults = registry.searchSimulations({ category: 'Finance' })
    expect(financeResults).toHaveLength(1)
    expect(financeResults[0].id).toBe('ai-investment-roi')
    
    // Search by tags
    const roiResults = registry.searchSimulations({ tags: ['roi'] })
    expect(roiResults).toHaveLength(1)
    expect(roiResults[0].id).toBe('ai-investment-roi')
  })
})