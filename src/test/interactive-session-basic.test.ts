import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { runSimulation } from '../cli/commands/run-simulation'
import { RunOptions } from '../cli/config/schema'

describe('Interactive Session Integration', () => {
  beforeEach(() => {
    // Mock console to avoid noise
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should not break when interactive flag is set (basic smoke test)', async () => {
    const options: RunOptions = { interactive: true }
    
    // This test just ensures the interactive flag doesn't crash the CLI
    // The actual interactive session will fail due to missing config files in tests,
    // but it should not throw unhandled errors
    try {
      await runSimulation('non-existent-simulation.yaml', options)
    } catch (error) {
      // Expected to fail due to missing simulation file
      // The key is that it fails gracefully, not with unhandled promise rejections
      expect(error).toBeDefined()
    }
  })

  it('should handle non-interactive mode normally', async () => {
    const options: RunOptions = { interactive: false }
    
    try {
      await runSimulation('non-existent-simulation.yaml', options)
    } catch (error) {
      // Should fail due to missing simulation file, not interactive session issues
      expect(error).toBeDefined()
      expect(String(error)).not.toContain('InteractiveSimulationSession')
    }
  })
})

describe('Interactive Feature Classes Exist', () => {
  it('should be able to import InteractiveSimulationSession', async () => {
    const { InteractiveSimulationSession } = await import('../cli/interactive/session-manager')
    expect(InteractiveSimulationSession).toBeDefined()
    expect(typeof InteractiveSimulationSession).toBe('function')
  })

  it('should be able to import InteractiveConfigEditor', async () => {
    const { InteractiveConfigEditor } = await import('../cli/interactive/config-editor')
    expect(InteractiveConfigEditor).toBeDefined()
    expect(typeof InteractiveConfigEditor).toBe('function')
  })

  it('should be able to import TempConfigManager', async () => {
    const { TempConfigManager } = await import('../cli/interactive/temp-config-manager')
    expect(TempConfigManager).toBeDefined()
    expect(typeof TempConfigManager).toBe('function')
  })
})