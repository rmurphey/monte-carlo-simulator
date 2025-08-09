import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { runSimulation } from '../cli/commands/run-simulation'
import { listSimulationParameters } from '../cli/commands/list-simulation-parameters'
import { writeFileSync, unlinkSync, mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

// Mock console methods to capture output and prevent test spam
const mockConsoleLog = vi.fn()
const mockConsoleError = vi.fn()
const mockProcessExit = vi.fn()

vi.stubGlobal('console', {
  log: mockConsoleLog,
  error: mockConsoleError
})

// Mock process.exit to prevent tests from actually exiting
vi.stubGlobal('process', {
  ...process,
  exit: mockProcessExit
})

// Note: Using existing simulation files instead of inline test configurations

describe('CLI Commands (Direct Unit Tests)', () => {
  let tempDir: string
  let testSimulationPath: string

  beforeEach(() => {
    // Use existing working simulation instead of creating one
    testSimulationPath = 'examples/simulations/simple-roi-analysis.yaml'
    
    // Still need tempDir for parameter file tests
    tempDir = mkdtempSync(join(tmpdir(), 'cli-test-'))
    
    // Clear mocks
    mockConsoleLog.mockClear()
    mockConsoleError.mockClear() 
    mockProcessExit.mockClear()
  })

  afterEach(() => {
    // No cleanup needed for existing simulation file
  })

  describe('runSimulation function', () => {
    it('should execute simulation and produce results', async () => {
      await runSimulation(testSimulationPath, { 
        iterations: 10 
      })
      
      // Should not call process.exit (indicating success)
      expect(mockProcessExit).not.toHaveBeenCalled()
      
      // Should display results
      const outputCalls = mockConsoleLog.mock.calls.flat().join(' ')
      expect(outputCalls).toContain('RESULTS SUMMARY')
      expect(outputCalls).toMatch(/ROI.*:\s*[\d.,-]+/)
      expect(outputCalls).toMatch(/Payback.*:\s*[\d.,]+/)
    })

    it('should handle parameter overrides correctly', async () => {
      await runSimulation(testSimulationPath, {
        iterations: 5,
        set: ['initialInvestment=50000', 'monthlyBenefit=6000']
      })
      
      expect(mockProcessExit).not.toHaveBeenCalled()
      
      const outputCalls = mockConsoleLog.mock.calls.flat().join(' ')
      expect(outputCalls).toContain('RESULTS SUMMARY')
    })

    it('should validate parameter types and reject invalid values', async () => {
      await runSimulation(testSimulationPath, {
        set: ['initialInvestment=invalid-number']
      })
      
      // Should call process.exit(1) on error
      expect(mockProcessExit).toHaveBeenCalledWith(1)
      
      const errorCalls = mockConsoleError.mock.calls.flat().join(' ')
      expect(errorCalls).toContain('Parameter \'initialInvestment\' must be a number')
    })

    it('should reject unknown parameters with helpful message', async () => {
      await runSimulation(testSimulationPath, {
        set: ['unknownParam=123']
      })
      
      expect(mockProcessExit).toHaveBeenCalledWith(1)
      
      const errorCalls = mockConsoleError.mock.calls.flat().join(' ')
      expect(errorCalls).toContain('Unknown parameter \'unknownParam\'')
      expect(errorCalls).toContain('--list-params')
    })

    it('should enforce parameter constraints', async () => {
      // Test value below minimum (1000)
      await runSimulation(testSimulationPath, {
        set: ['initialInvestment=500'] // Below min of 1000
      })
      
      expect(mockProcessExit).toHaveBeenCalledWith(1)
    })

    it('should produce valid JSON output format', async () => {
      await runSimulation(testSimulationPath, {
        iterations: 3,
        format: 'json'
      })
      
      expect(mockProcessExit).not.toHaveBeenCalled()
      
      // Find JSON output in console calls
      const outputCalls = mockConsoleLog.mock.calls.flat()
      const jsonOutput = outputCalls.find(call => {
        try {
          const parsed = JSON.parse(call)
          return parsed.results && parsed.summary
        } catch {
          return false
        }
      })
      
      expect(jsonOutput).toBeTruthy()
      
      const parsed = JSON.parse(jsonOutput!)
      expect(parsed).toHaveProperty('results')
      expect(parsed).toHaveProperty('summary')
      expect(Array.isArray(parsed.results)).toBe(true)
      expect(parsed.results.length).toBe(3)
      expect(parsed.summary).toHaveProperty('roi')
      expect(parsed.summary).toHaveProperty('paybackMonths')
    })

    it('should handle file not found with helpful error', async () => {
      await runSimulation('non-existent-file.yaml', {})
      
      expect(mockProcessExit).toHaveBeenCalledWith(1)
      
      const errorCalls = mockConsoleError.mock.calls.flat().join(' ')
      expect(errorCalls).toContain('not found')
    })
  })

  describe('listSimulationParameters function', () => {
    it('should list parameters with correct structure', async () => {
      await listSimulationParameters(testSimulationPath)
      
      expect(mockProcessExit).not.toHaveBeenCalled()
      
      const outputCalls = mockConsoleLog.mock.calls.flat().join(' ')
      
      // Should show parameter information
      expect(outputCalls).toContain('initialInvestment')
      expect(outputCalls).toContain('50000') // default value
      expect(outputCalls).toContain('monthlyBenefit')
      expect(outputCalls).toContain('5000') // default value
      
      // Should include usage examples
      expect(outputCalls).toContain('Usage Examples')
      expect(outputCalls).toContain('Parameter File Example')
    })

    it('should show parameter types and constraints', async () => {
      await listSimulationParameters(testSimulationPath)
      
      expect(mockProcessExit).not.toHaveBeenCalled()
      
      const outputCalls = mockConsoleLog.mock.calls.flat().join(' ')
      
      // Should show type information
      expect(outputCalls).toContain('number')
      
      // Should show constraints
      expect(outputCalls).toMatch(/1000.*1000000/) // min-max range for initialInvestment
    })

    it('should handle file not found gracefully', async () => {
      await listSimulationParameters('non-existent-file.yaml')
      
      expect(mockProcessExit).toHaveBeenCalledWith(1)
      
      const errorCalls = mockConsoleError.mock.calls.flat().join(' ')
      expect(errorCalls).toContain('Failed to list parameters')
    })
  })

  describe('parameter resolution and validation', () => {
    it('should correctly resolve multiple parameter sources', async () => {
      // Create a custom parameter file
      const paramFile = join(tempDir, 'custom-params.json')
      writeFileSync(paramFile, JSON.stringify({
        initialInvestment: 75000,
        monthlyBenefit: 6000
      }))
      
      try {
        await runSimulation(testSimulationPath, {
          params: paramFile,
          set: ['monthlyBenefit=7000'], // Should override param file
          iterations: 5
        })
        
        expect(mockProcessExit).not.toHaveBeenCalled()
      } finally {
        try {
          unlinkSync(paramFile)
        } catch {
          // File cleanup
        }
      }
    })

    it('should handle malformed parameter files gracefully', async () => {
      const invalidParamFile = join(tempDir, 'invalid-params.json')
      writeFileSync(invalidParamFile, '{ invalid json }')
      
      try {
        await runSimulation(testSimulationPath, {
          params: invalidParamFile
        })
        
        expect(mockProcessExit).toHaveBeenCalledWith(1)
        
        const errorCalls = mockConsoleError.mock.calls.flat().join(' ')
        expect(errorCalls).toContain('Simulation execution failed')
      } finally {
        try {
          unlinkSync(invalidParamFile)
        } catch {
          // File cleanup
        }
      }
    })
  })
})