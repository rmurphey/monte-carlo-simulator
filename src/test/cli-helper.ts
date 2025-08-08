import { execSync } from 'child_process'
import { writeFileSync, mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

/**
 * Minimal CLI test helper - executes CLI commands and provides basic assertions
 */
export class CLIHelper {
  private tempDir: string

  constructor() {
    this.tempDir = mkdtempSync(join(tmpdir(), 'mcs-test-'))
  }

  /** Execute CLI command and return result */
  run(command: string): { success: boolean; output: string; error: string } {
    try {
      const output = execSync(`npm run cli -- ${command}`, {
        encoding: 'utf8',
        timeout: 30000,
        cwd: process.cwd()
      })
      return { success: true, output, error: '' }
    } catch (error: any) {
      return { 
        success: false, 
        output: error.stdout || '', 
        error: error.stderr || error.message 
      }
    }
  }

  /** Create temporary test YAML file */
  createTestYAML(content: string): string {
    const filePath = join(this.tempDir, `test-${Date.now()}.yaml`)
    writeFileSync(filePath, content)
    return filePath
  }

  /** Clean up temporary files */
  cleanup(): void {
    try {
      // Simple cleanup - remove temp files
      execSync(`rm -rf ${this.tempDir}`)
    } catch {
      // Ignore cleanup errors
    }
  }
}

/** Sample valid simulation YAML for testing */
export const SAMPLE_SIMULATION = `name: Test Investment Analysis
category: Testing
description: Simple test simulation for CLI testing
version: 1.0.0
tags: [test, investment]
parameters:
  - key: investment
    label: Investment Amount
    type: number
    default: 100000
    min: 1000
    max: 1000000
  - key: returnRate
    label: Expected Return (%)
    type: number
    default: 15
    min: 1
    max: 100
outputs:
  - key: finalValue
    label: Final Value
  - key: roi
    label: ROI (%)
simulation:
  logic: |
    const finalValue = investment * (1 + (returnRate / 100 + (random() - 0.5) * 0.2))
    const roi = ((finalValue - investment) / investment) * 100
    return { finalValue: Math.round(finalValue), roi: Math.round(roi * 10) / 10 }
`