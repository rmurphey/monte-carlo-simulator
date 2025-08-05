import { describe, it, expect } from 'vitest'
import { ParameterSchema } from '../framework/ParameterSchema'
import { ParameterDefinition } from '../framework/types'

describe('ParameterSchema', () => {
  const testDefinitions: ParameterDefinition[] = [
    {
      key: 'iterations',
      label: 'Number of Iterations',
      type: 'number',
      defaultValue: 1000,
      min: 100,
      max: 10000,
      step: 100
    },
    {
      key: 'riskFree',
      label: 'Risk-free Rate',
      type: 'number',
      defaultValue: 0.03,
      min: 0,
      max: 0.1,
      step: 0.001
    },
    {
      key: 'useAdvancedModel',
      label: 'Use Advanced Model',
      type: 'boolean',
      defaultValue: false
    },
    {
      key: 'scenario',
      label: 'Scenario Type',
      type: 'select',
      defaultValue: 'conservative',
      options: ['conservative', 'moderate', 'aggressive']
    }
  ]

  it('should validate correct parameters', () => {
    const schema = new ParameterSchema(testDefinitions)
    
    const validParams = {
      iterations: 1000,
      riskFree: 0.03,
      useAdvancedModel: true,
      scenario: 'moderate'
    }

    const result = schema.validateParameters(validParams)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject invalid number parameters', () => {
    const schema = new ParameterSchema(testDefinitions)
    
    const invalidParams = {
      iterations: 50, // Below minimum
      riskFree: 0.15, // Above maximum
      useAdvancedModel: true,
      scenario: 'moderate'
    }

    const result = schema.validateParameters(invalidParams)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain("Parameter 'Number of Iterations' must be >= 100")
    expect(result.errors).toContain("Parameter 'Risk-free Rate' must be <= 0.1")
  })

  it('should reject invalid select parameters', () => {
    const schema = new ParameterSchema(testDefinitions)
    
    const invalidParams = {
      iterations: 1000,
      riskFree: 0.03,
      useAdvancedModel: true,
      scenario: 'invalid_option'
    }

    const result = schema.validateParameters(invalidParams)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain("Parameter 'Scenario Type' must be one of: conservative, moderate, aggressive")
  })

  it('should detect missing parameters', () => {
    const schema = new ParameterSchema(testDefinitions)
    
    const incompleteParams = {
      iterations: 1000,
      riskFree: 0.03
      // Missing useAdvancedModel and scenario
    }

    const result = schema.validateParameters(incompleteParams)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain("Missing required parameter: Use Advanced Model")
    expect(result.errors).toContain("Missing required parameter: Scenario Type")
  })

  it('should generate default parameters', () => {
    const schema = new ParameterSchema(testDefinitions)
    
    const defaults = schema.getDefaultParameters()
    expect(defaults).toEqual({
      iterations: 1000,
      riskFree: 0.03,
      useAdvancedModel: false,
      scenario: 'conservative'
    })
  })

  it('should coerce parameter types', () => {
    const schema = new ParameterSchema(testDefinitions)
    
    const rawParams = {
      iterations: '1500',
      riskFree: '0.04',
      useAdvancedModel: 'true',
      scenario: 'moderate'
    }

    const coerced = schema.coerceParameters(rawParams)
    expect(coerced).toEqual({
      iterations: 1500,
      riskFree: 0.04,
      useAdvancedModel: true,
      scenario: 'moderate'
    })
  })

  it('should support parameter groups', () => {
    const schema = new ParameterSchema(testDefinitions)
    
    schema.addGroup({
      name: 'Simulation Settings',
      description: 'Basic simulation configuration',
      parameters: ['iterations', 'scenario']
    })

    schema.addGroup({
      name: 'Financial Parameters',
      description: 'Market and risk parameters',
      parameters: ['riskFree', 'useAdvancedModel']
    })

    const uiSchema = schema.generateUISchema()
    expect(uiSchema.groups).toHaveLength(2)
    expect(uiSchema.groups[0].name).toBe('Simulation Settings')
    expect(uiSchema.groups[0].fields).toHaveLength(2)
    expect(uiSchema.ungrouped).toHaveLength(0)
  })

  it('should generate UI schema', () => {
    const schema = new ParameterSchema(testDefinitions)
    
    const uiSchema = schema.generateUISchema()
    expect(uiSchema.ungrouped).toHaveLength(4)
    
    const iterationsField = uiSchema.ungrouped.find(f => f.key === 'iterations')
    expect(iterationsField).toBeDefined()
    expect(iterationsField?.constraints).toEqual({
      min: 100,
      max: 10000,
      step: 100
    })

    const scenarioField = uiSchema.ungrouped.find(f => f.key === 'scenario')
    expect(scenarioField?.options).toEqual(['conservative', 'moderate', 'aggressive'])
  })
})