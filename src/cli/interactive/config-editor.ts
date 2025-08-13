import { spawn } from 'child_process'
import chalk from 'chalk'
import { SimulationConfig } from '../config/schema'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  changes: ConfigChange[]
}

export interface ConfigChange {
  type: 'parameter' | 'logic' | 'output' | 'metadata'
  action: 'added' | 'modified' | 'deleted'
  path: string
  oldValue?: any
  newValue?: any
  description: string
}

export class InteractiveConfigEditor {
  
  async editFullConfig(configPath: string): Promise<boolean> {
    const editor = process.env.EDITOR || process.env.VISUAL || 'nano'
    
    console.log(chalk.blue(`📝 Opening in ${editor}...`))
    console.log(chalk.gray(`File: ${configPath}`))
    console.log(chalk.gray('Save and exit to continue'))
    console.log()

    return new Promise((resolve) => {
      const child = spawn(editor, [configPath], {
        stdio: 'inherit',
        shell: true
      })
      
      child.on('exit', (code) => {
        console.log(chalk.green('✅ Editor closed'))
        resolve(code === 0)
      })
      
      child.on('error', (error) => {
        console.error(chalk.red(`❌ Editor error: ${error.message}`))
        resolve(false)
      })
    })
  }

  async editParametersOnly(config: SimulationConfig): Promise<SimulationConfig> {
    // TODO: Implement guided parameter editing
    console.log(chalk.yellow('Parameter-only editing coming in next phase'))
    return config
  }

  async editLogicOnly(config: SimulationConfig): Promise<SimulationConfig> {
    console.log(chalk.blue('📝 Logic Editor'))
    console.log(chalk.gray('Current logic:'))
    console.log(chalk.cyan(config.simulation?.logic || '// No logic defined'))
    console.log()
    console.log(chalk.yellow('Interactive logic editing coming in next phase'))
    console.log(chalk.gray('For now, use [e] Edit full YAML to modify logic'))
    
    return config
  }

  async addParameter(config: SimulationConfig): Promise<SimulationConfig> {
    // TODO: Implement parameter addition wizard
    console.log(chalk.yellow('Add parameter wizard coming in next phase'))
    return config
  }

  async deleteParameter(config: SimulationConfig): Promise<SimulationConfig> {
    // TODO: Implement parameter deletion
    console.log(chalk.yellow('Delete parameter feature coming in next phase'))
    return config
  }

  async validateConfig(config: SimulationConfig): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      // Basic structure validation
      if (!config.name || !config.description) {
        errors.push('Missing required fields: name or description')
      }

      if (!config.parameters || config.parameters.length === 0) {
        warnings.push('No parameters defined')
      }

      if (!config.outputs || config.outputs.length === 0) {
        warnings.push('No outputs defined')
      }

      if (!config.simulation?.logic) {
        errors.push('No simulation logic defined')
      }

      // Validate parameter references in logic
      if (config.simulation?.logic) {
        const logic = config.simulation.logic
        const parameterKeys = config.parameters?.map(p => p.key) || []
        
        // Check if parameters are referenced in logic (basic check)
        parameterKeys.forEach(paramKey => {
          if (!logic.includes(paramKey)) {
            warnings.push(`Parameter '${paramKey}' not referenced in simulation logic`)
          }
        })
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        changes: [] // TODO: Implement change detection
      }
    } catch (error) {
      return {
        valid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`],
        warnings,
        changes: []
      }
    }
  }

  async showConfigDiff(oldConfig: SimulationConfig, newConfig: SimulationConfig): Promise<void> {
    console.log(chalk.blue.bold('🔍 Changes detected:'))
    
    // Basic change detection
    const changes: string[] = []

    if (oldConfig.name !== newConfig.name) {
      changes.push(`• Name: "${oldConfig.name}" → "${newConfig.name}"`)
    }

    if (oldConfig.description !== newConfig.description) {
      changes.push(`• Description changed`)
    }

    if (oldConfig.simulation?.logic !== newConfig.simulation?.logic) {
      changes.push(`• Simulation logic modified`)
    }

    if (oldConfig.parameters?.length !== newConfig.parameters?.length) {
      changes.push(`• Parameter count: ${oldConfig.parameters?.length} → ${newConfig.parameters?.length}`)
    }

    if (oldConfig.outputs?.length !== newConfig.outputs?.length) {
      changes.push(`• Output count: ${oldConfig.outputs?.length} → ${newConfig.outputs?.length}`)
    }

    if (changes.length === 0) {
      console.log(chalk.gray('No significant changes detected'))
    } else {
      changes.forEach(change => console.log(chalk.white(change)))
    }
    console.log()
  }

  async showValidationResults(validation: ValidationResult): Promise<void> {
    console.log(chalk.blue('⚙️  Validation Results:'))
    
    if (validation.valid) {
      console.log(chalk.green('  ✅ Configuration is valid'))
    } else {
      console.log(chalk.red('  ❌ Configuration has errors'))
    }

    if (validation.errors.length > 0) {
      console.log(chalk.red('  Errors:'))
      validation.errors.forEach(error => {
        console.log(chalk.red(`    • ${error}`))
      })
    }

    if (validation.warnings.length > 0) {
      console.log(chalk.yellow('  Warnings:'))
      validation.warnings.forEach(warning => {
        console.log(chalk.yellow(`    • ${warning}`))
      })
    }

    if (validation.valid) {
      console.log(chalk.green('  ✅ YAML syntax valid'))
      console.log(chalk.green('  ✅ Required fields present'))
    }

    console.log()
  }
}