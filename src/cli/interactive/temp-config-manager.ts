import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import * as yaml from 'js-yaml'
import { SimulationConfig } from '../config/schema'

export class TempConfigManager {
  private tempPaths: Set<string> = new Set()
  private sessionId: string

  constructor() {
    this.sessionId = `monte-carlo-session-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
  }

  async createTempConfig(config: SimulationConfig): Promise<string> {
    const tempDir = os.tmpdir()
    const tempPath = path.join(tempDir, `${this.sessionId}.yaml`)
    
    try {
      // Convert config to YAML
      const yamlContent = yaml.dump(config, {
        indent: 2,
        lineWidth: 100,
        noRefs: true,
        sortKeys: false
      })

      await fs.writeFile(tempPath, yamlContent, 'utf8')
      this.tempPaths.add(tempPath)
      
      return tempPath
    } catch (error) {
      throw new Error(`Failed to create temp config: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async saveTempConfig(config: SimulationConfig, tempPath: string): Promise<void> {
    try {
      const yamlContent = yaml.dump(config, {
        indent: 2,
        lineWidth: 100,
        noRefs: true,
        sortKeys: false
      })

      await fs.writeFile(tempPath, yamlContent, 'utf8')
    } catch (error) {
      throw new Error(`Failed to save temp config: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async saveToOriginal(originalPath: string, config: SimulationConfig): Promise<void> {
    try {
      // Create backup first
      const backupPath = await this.createBackup(originalPath)
      console.log(`📋 Backup created: ${backupPath}`)

      // Convert config to YAML
      const yamlContent = yaml.dump(config, {
        indent: 2,
        lineWidth: 100,
        noRefs: true,
        sortKeys: false
      })

      await fs.writeFile(originalPath, yamlContent, 'utf8')
    } catch (error) {
      throw new Error(`Failed to save to original file: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async discardChanges(tempPath: string): Promise<void> {
    try {
      if (this.tempPaths.has(tempPath)) {
        await fs.unlink(tempPath).catch(() => {
          // Ignore errors if file already deleted
        })
        this.tempPaths.delete(tempPath)
      }
    } catch (error) {
      // Ignore errors when discarding changes
      console.warn(`Warning: Could not delete temp file ${tempPath}`)
    }
  }

  async createBackup(originalPath: string): Promise<string> {
    try {
      const parsedPath = path.parse(originalPath)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupPath = path.join(
        parsedPath.dir,
        `${parsedPath.name}.backup.${timestamp}${parsedPath.ext}`
      )

      await fs.copyFile(originalPath, backupPath)
      return backupPath
    } catch (error) {
      throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async cleanup(): Promise<void> {
    const cleanupPromises = Array.from(this.tempPaths).map(async (tempPath) => {
      try {
        await fs.unlink(tempPath)
      } catch (error) {
        // Ignore cleanup errors
        console.warn(`Warning: Could not cleanup temp file ${tempPath}`)
      }
    })

    await Promise.allSettled(cleanupPromises)
    this.tempPaths.clear()
  }

  getTempPaths(): string[] {
    return Array.from(this.tempPaths)
  }
}