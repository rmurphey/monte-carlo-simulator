import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { CLIHelper, SAMPLE_SIMULATION } from './cli-helper'

describe('CLI Core Functionality', () => {
  let cli: CLIHelper
  let testFile: string

  beforeEach(() => {
    cli = new CLIHelper()
    testFile = cli.createTestYAML(SAMPLE_SIMULATION)
  })

  afterEach(() => {
    cli.cleanup()
  })

  describe('run command', () => {
    it('should run basic simulation', () => {
      const result = cli.run(`run "${testFile}" --iterations 10`)
      
      expect(result.success).toBe(true)
      expect(result.output).toContain('Test Investment Analysis')
      expect(result.output).toContain('RESULTS SUMMARY')
    })

    it('should handle parameter overrides with --set', () => {
      const result = cli.run(`run "${testFile}" --set investment=50000 --iterations 5`)
      
      expect(result.success).toBe(true)
      expect(result.output).toContain('Test Investment Analysis')
      expect(result.output).toContain('RESULTS SUMMARY')
    })

    it('should validate parameter types', () => {
      const result = cli.run(`run "${testFile}" --set investment=invalid`)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('must be a number')
    })

    it('should reject unknown parameters', () => {
      const result = cli.run(`run "${testFile}" --set unknownParam=123`)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Unknown parameter')
    })
  })

  describe('parameter discovery', () => {
    it('should list parameters with --list-params', () => {
      const result = cli.run(`run "${testFile}" --list-params`)
      
      expect(result.success).toBe(true)
      expect(result.output).toContain('Test Investment Analysis')
      expect(result.output).toContain('investment')
      expect(result.output).toContain('returnRate')
      expect(result.output).toContain('Usage Examples')
    })

    it('should not show ARR parameters for standard simulations', () => {
      const result = cli.run(`run "${testFile}" --list-params`)
      
      expect(result.success).toBe(true)
      expect(result.output).not.toContain('annualRecurringRevenue')
      expect(result.output).not.toContain('budgetPercent')
    })
  })

  describe('output formats', () => {
    it('should support JSON output', () => {
      const result = cli.run(`run "${testFile}" --iterations 5 --format json`)
      
      expect(result.success).toBe(true)
      
      // Extract JSON from output (skip npm script headers)
      const jsonMatch = result.output.match(/\{[\s\S]*\}/)
      expect(jsonMatch).toBeTruthy()
      
      const parsed = JSON.parse(jsonMatch![0])
      expect(parsed).toHaveProperty('results')
      expect(parsed).toHaveProperty('summary')
    })

    it('should handle non-existent files gracefully', () => {
      const result = cli.run('run "non-existent.yaml"')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })
})