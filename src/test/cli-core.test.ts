import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { CLIHelper, SAMPLE_SIMULATION } from './cli-helper'

describe('CLI Integration Tests', () => {
  let cli: CLIHelper
  let testFile: string

  beforeEach(() => {
    cli = new CLIHelper()
    testFile = cli.createTestYAML(SAMPLE_SIMULATION)
  })

  afterEach(() => {
    cli.cleanup()
  })

  describe('simulation execution', () => {
    it('should execute simulation and produce numerical results', () => {
      const result = cli.run(`run "${testFile}" --iterations 10`)
      
      expect(result.success).toBe(true)
      expect(result.output).toMatch(/Final Value.*:\s*[\d,]+/)
      expect(result.output).toMatch(/ROI.*:\s*[-\d.]+/)
    })

    it('should respect parameter overrides and change results', () => {
      // Test with low investment
      const lowResult = cli.run(`run "${testFile}" --set investment=10000 --iterations 5`)
      expect(lowResult.success).toBe(true)
      
      // Test with high investment  
      const highResult = cli.run(`run "${testFile}" --set investment=100000 --iterations 5`)
      expect(highResult.success).toBe(true)
      
      // Both should succeed but produce different outputs
      expect(lowResult.output).not.toBe(highResult.output)
    })

    it('should validate parameter types with specific error messages', () => {
      const result = cli.run(`run "${testFile}" --set investment=invalid`)
      
      expect(result.success).toBe(false)
      expect(result.error).toMatch(/Parameter 'investment' must be a number/)
    })

    it('should accept values within parameter constraints', () => {
      // Test minimum constraint (1000 is minimum in YAML)
      const validMinResult = cli.run(`run "${testFile}" --set investment=1000 --iterations 3`)
      expect(validMinResult.success).toBe(true)
      
      // Test maximum constraint (1000000 is maximum in YAML)
      const validMaxResult = cli.run(`run "${testFile}" --set investment=1000000 --iterations 3`)
      expect(validMaxResult.success).toBe(true)
    })

    it('should reject unknown parameters with helpful error', () => {
      const result = cli.run(`run "${testFile}" --set unknownParam=123`)
      
      expect(result.success).toBe(false)
      expect(result.error).toMatch(/Unknown parameter 'unknownParam'/)
      expect(result.error).toContain('--list-params')
    })
  })

  describe('parameter discovery - agent workflow critical', () => {
    it('should list exact parameters from YAML without injection', () => {
      const result = cli.run(`run "${testFile}" --list-params`)
      
      expect(result.success).toBe(true)
      
      // Should contain YAML-defined parameters
      expect(result.output).toMatch(/investment.*100000/)
      expect(result.output).toMatch(/returnRate.*15/)
      
      // Should NOT contain auto-injected ARR parameters
      expect(result.output).not.toContain('annualRecurringRevenue')
      expect(result.output).not.toContain('budgetPercent')
      
      // Should provide agent-useful information
      expect(result.output).toContain('Usage Examples')
      expect(result.output).toContain('Parameter File Example')
    })
  })

  describe('output formats - agent data consumption', () => {
    it('should produce valid JSON with required structure', () => {
      const result = cli.run(`run "${testFile}" --iterations 5 --format json`)
      
      expect(result.success).toBe(true)
      
      // Extract JSON from output (skip npm script headers)
      const jsonMatch = result.output.match(/\{[\s\S]*\}/)
      expect(jsonMatch).toBeTruthy()
      
      const parsed = JSON.parse(jsonMatch![0])
      expect(parsed).toHaveProperty('results')
      expect(parsed).toHaveProperty('summary')
      expect(Array.isArray(parsed.results)).toBe(true)
      expect(parsed.results.length).toBe(5) // Should match iterations
      
      // Validate summary structure
      expect(parsed.summary).toHaveProperty('finalValue')
      expect(parsed.summary).toHaveProperty('roi')
      expect(typeof parsed.summary.finalValue.mean).toBe('number')
    })
  })

  describe('error handling', () => {
    it('should provide helpful error with simulation list for non-existent files', () => {
      const result = cli.run('run "non-existent-simulation.yaml"')
      
      expect(result.success).toBe(false)
      expect(result.error).toMatch(/Simulation.*not found/)
      expect(result.error).toContain('Available simulations:')
      expect(result.error).toContain('simple-roi-analysis')
    })

    it('should handle malformed commands gracefully', () => {
      const result = cli.run('run') // Missing required argument
      
      expect(result.success).toBe(false)
      expect(result.error.length).toBeGreaterThan(0)
    })
  })
})