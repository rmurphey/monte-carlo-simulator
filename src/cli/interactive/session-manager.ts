import * as readline from 'readline'
import chalk from 'chalk'
import { SimulationConfig, RunOptions } from '../config/schema'
import { ConfigurationLoader } from '../config/loader'
import { ConfigurableSimulation } from '../../framework/ConfigurableSimulation'
import { SimulationResults } from '../../framework/types'
import { InteractiveConfigEditor } from './config-editor'
import { TempConfigManager } from './temp-config-manager'

// Check if terminal supports interactive input
function isInteractiveEnvironment(): boolean {
  return !!(
    process.stdin.isTTY && 
    process.stdout.isTTY &&
    !process.env.CLAUDECODE &&
    !process.env.CLAUDE_CODE_SSE_PORT
  )
}

export interface ConfigHistoryEntry {
  config: SimulationConfig
  timestamp: Date
  description: string
}

export interface InteractiveCommand {
  key: string
  description: string
  action: () => Promise<void>
}

export class InteractiveSimulationSession {
  private config!: SimulationConfig
  private originalConfigPath: string
  private tempManager: TempConfigManager
  private editor: InteractiveConfigEditor
  private results: SimulationResults | null = null
  private configHistory: ConfigHistoryEntry[] = []
  private rl: readline.Interface
  private options: RunOptions
  private simulation!: ConfigurableSimulation

  constructor(configPath: string, options: RunOptions) {
    this.originalConfigPath = configPath
    this.options = options
    this.tempManager = new TempConfigManager()
    this.editor = new InteractiveConfigEditor()
    
    // Check if environment supports interactive mode
    if (!isInteractiveEnvironment()) {
      throw new Error(
        `❌ Interactive mode requires a real terminal with TTY support.\n\n` +
        `This environment does not support interactive input.\n` +
        `Please run this command in a regular terminal instead.\n\n` +
        `Alternative: Use parameter flags directly:\n` +
        `  npm run cli -- run ${this.getSimulationName()} --set param=value\n` +
        `  npm run cli -- run ${this.getSimulationName()} --list-params`
      )
    }
    
    // Setup readline interface for terminals
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts()
  }

  private getSimulationName(): string {
    return this.originalConfigPath.split('/').pop()?.replace('.yaml', '') || 'simulation'
  }

  async start(): Promise<void> {
    try {
      await this.initialize()
      await this.runInitialSimulation()
      await this.enterMainLoop()
    } catch (error) {
      console.error(chalk.red(`❌ Session error: ${error instanceof Error ? error.message : String(error)}`))
    } finally {
      await this.cleanup()
    }
  }

  private async initialize(): Promise<void> {
    // Load configuration
    const loader = new ConfigurationLoader()
    this.config = await loader.loadConfig(this.originalConfigPath)
    
    // Create simulation instance
    this.simulation = new ConfigurableSimulation(this.config)
    
    // Add initial config to history
    this.configHistory.push({
      config: { ...this.config },
      timestamp: new Date(),
      description: 'Original configuration'
    })

    console.log(chalk.blue.bold(`🎯 ${this.config.name} - Interactive Mode`))
    console.log(chalk.gray(`Config: ${this.originalConfigPath}`))
    console.log()
  }

  private async runInitialSimulation(): Promise<void> {
    console.log(chalk.blue('Running initial simulation with current config...'))
    
    // Get current parameter values from config
    const currentParams: Record<string, unknown> = {}
    this.config.parameters?.forEach(param => {
      currentParams[param.key] = param.default
    })

    // Run simulation with progress
    const iterations = this.options.iterations || 1000
    this.results = await this.simulation.runSimulation(
      currentParams,
      iterations,
      (progress, iteration) => {
        if (iteration % Math.max(1, Math.floor(iterations / 10)) === 0) {
          process.stdout.write(`\r${chalk.blue('Progress:')} ${Math.round(progress * 100)}%`)
        }
      }
    )

    console.log(`\r${chalk.green('✅ Completed')} ${iterations} iterations in ${(this.results.duration / 1000).toFixed(1)}s`)
    
    this.displayResultsSummary()
  }

  private displayResultsSummary(): void {
    if (!this.results) return

    console.log()
    console.log(chalk.blue.bold('📊 Results Summary:'))
    
    Object.entries(this.results.summary).forEach(([key, stats]) => {
      if (typeof stats === 'object' && stats.mean !== undefined) {
        const mean = typeof stats.mean === 'number' ? stats.mean.toFixed(1) : stats.mean
        const p90 = typeof stats.percentile90 === 'number' ? stats.percentile90.toFixed(1) : stats.percentile90
        console.log(chalk.white(`${key}: ${chalk.cyan(mean)} (90th percentile: ${chalk.cyan(p90)})`))
      }
    })
    console.log()
  }

  private async enterMainLoop(): Promise<void> {
    console.log(chalk.blue('🎮 Interactive Mode - Terminal Required'))
    console.log(chalk.gray('Use menu options below to interact with the simulation'))
    console.log()

    // Interactive menu loop: while(true) is correct pattern for CLI applications
    // - Blocks on await this.getCommand() (no CPU/memory consumption)
    // - User explicitly chooses "q" to break loop
    // - Standard pattern used by npm init, create-react-app, etc.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        this.displayMainMenu()
        
        const command = await this.getCommand()
        
        if (command === 'q') {
          console.log(chalk.green('👋 Goodbye!'))
          break
        }

        await this.handleMainCommand(command)
      } catch (error) {
        console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`))
        console.log(chalk.gray('Type "q" to quit or try again'))
      }
    }
  }

  private displayMainMenu(): void {
    console.log(chalk.blue.bold('🎮 Interactive Commands:'))
    console.log(`  ${chalk.cyan('[r]')} Run again         ${chalk.cyan('[p]')} Edit parameters    ${chalk.cyan('[c]')} Edit config`)
    console.log(`  ${chalk.cyan('[s]')} Save changes      ${chalk.cyan('[e]')} Export results     ${chalk.cyan('[h]')} Help`)
    console.log(`  ${chalk.cyan('[q]')} Quit`)
    console.log()
    console.log(chalk.gray('Quick Actions: Ctrl+R (re-run) | Ctrl+S (save) | Ctrl+T (test run)'))
    process.stdout.write('> ')
  }

  private async getCommand(): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question('> ', (answer) => {
        resolve(answer.trim().toLowerCase())
      })
    })
  }

  private async handleMainCommand(command: string): Promise<void> {
    try {
      switch (command) {
        case 'r':
          await this.runSimulation()
          break
        case 'p':
          await this.quickParameterEdit()
          break
        case 'c':
          await this.enterConfigEditMode()
          break
        case 's':
          await this.saveConfig()
          break
        case 'e':
          await this.exportResults()
          break
        case 'h':
          this.showHelp()
          break
        default:
          console.log(chalk.yellow(`Unknown command: ${command}. Type 'h' for help.`))
      }
    } catch (error) {
      console.error(chalk.red(`❌ Command error: ${error instanceof Error ? error.message : String(error)}`))
    }
    console.log()
  }

  private async runSimulation(): Promise<void> {
    console.log(chalk.blue('🔄 Running simulation...'))
    
    // Get current parameter values from config (may have been edited)
    const currentParams: Record<string, unknown> = {}
    this.config.parameters?.forEach(param => {
      currentParams[param.key] = param.default
    })

    const iterations = this.options.iterations || 1000
    this.results = await this.simulation.runSimulation(currentParams, iterations)
    
    console.log(chalk.green(`✅ Completed ${iterations} iterations in ${(this.results.duration / 1000).toFixed(1)}s`))
    this.displayResultsSummary()
  }

  private async quickParameterEdit(): Promise<void> {
    console.log(chalk.blue('📝 Quick Parameter Edit'))
    console.log(chalk.gray('Current parameter values:'))
    console.log()

    // Display current parameters
    this.config.parameters?.forEach((param, index) => {
      const value = param.default
      const displayValue = typeof value === 'number' ? value.toLocaleString() : String(value)
      console.log(`${chalk.cyan((index + 1).toString().padStart(2))}. ${chalk.white(param.label || param.key)}: ${chalk.yellow(displayValue)}`)
      if (param.description) {
        console.log(`    ${chalk.gray(param.description)}`)
      }
      if (param.type === 'number' && (param.min !== undefined || param.max !== undefined)) {
        console.log(`    ${chalk.gray(`Range: ${param.min || 'no min'} - ${param.max || 'no max'}`)}`)
      }
      console.log()
    })

    console.log(chalk.blue('Commands:'))
    console.log(`  ${chalk.cyan('[number]')} Edit parameter by number (e.g., '1' to edit first parameter)`)
    console.log(`  ${chalk.cyan('[r]')} Run simulation with current values`)
    console.log(`  ${chalk.cyan('[b]')} Back to main menu`)
    console.log()

    // Parameter editing loop
    // eslint-disable-next-line no-constant-condition
    while (true) {
      process.stdout.write(chalk.cyan('Select parameter to edit (number/r/b): '))
      const command = await this.getCommand()

      if (command === 'b') {
        break
      }

      if (command === 'r') {
        await this.runSimulation()
        continue
      }

      const paramIndex = parseInt(command) - 1
      if (!isNaN(paramIndex) && paramIndex >= 0 && paramIndex < (this.config.parameters?.length || 0)) {
        await this.editSingleParameter(paramIndex)
      } else {
        console.log(chalk.yellow(`Invalid selection. Enter 1-${this.config.parameters?.length || 0}, 'r', or 'b'`))
      }
    }
  }

  private async editSingleParameter(paramIndex: number): Promise<void> {
    const param = this.config.parameters![paramIndex]
    const currentValue = param.default
    
    console.log(chalk.blue(`\nEditing: ${chalk.white(param.label || param.key)}`))
    if (param.description) {
      console.log(chalk.gray(param.description))
    }
    console.log(chalk.gray(`Current value: ${chalk.yellow(String(currentValue))}`))
    
    if (param.type === 'number' && (param.min !== undefined || param.max !== undefined)) {
      console.log(chalk.gray(`Valid range: ${param.min || 'no min'} - ${param.max || 'no max'}`))
    }
    
    process.stdout.write(chalk.cyan('Enter new value (or press Enter to keep current): '))
    const input = await this.getCommand()
    
    if (input === '') {
      console.log(chalk.gray('Value unchanged'))
      return
    }

    try {
      let newValue: any = input
      
      if (param.type === 'number') {
        newValue = Number(input)
        if (isNaN(newValue)) {
          throw new Error('Must be a valid number')
        }
        
        if (param.min !== undefined && newValue < param.min) {
          throw new Error(`Value must be at least ${param.min}`)
        }
        if (param.max !== undefined && newValue > param.max) {
          throw new Error(`Value must be at most ${param.max}`)
        }
      } else if (param.type === 'boolean') {
        const lowerInput = input.toLowerCase()
        if (['true', 'yes', '1', 'on'].includes(lowerInput)) {
          newValue = true
        } else if (['false', 'no', '0', 'off'].includes(lowerInput)) {
          newValue = false
        } else {
          throw new Error('Must be true/false, yes/no, 1/0, or on/off')
        }
      }

      // Update parameter default value
      param.default = newValue
      
      // Update simulation with new config
      this.simulation = new ConfigurableSimulation(this.config)
      
      // Add to history
      this.configHistory.push({
        config: { ...this.config },
        timestamp: new Date(),
        description: `Updated ${param.label || param.key} to ${newValue}`
      })
      
      console.log(chalk.green(`✅ Updated ${param.label || param.key} to ${chalk.yellow(String(newValue))}`))
      
    } catch (error) {
      console.log(chalk.red(`❌ Invalid value: ${error instanceof Error ? error.message : String(error)}`))
    }
    
    console.log()
  }

  private async enterConfigEditMode(): Promise<void> {
    console.log(chalk.blue.bold('📝 Configuration Editor'))
    console.log()
    
    this.displayConfigSummary()
    
    // Config editing loop: while(true) is correct pattern for sub-menu navigation
    // - Blocks on await this.getCommand() (no CPU/memory consumption)
    // - User explicitly chooses "b" (back) to break loop
    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.displayConfigMenu()
      
      const command = await this.getCommand()
      
      if (command === 'b') {
        break
      }

      await this.handleConfigCommand(command)
    }
  }

  private displayConfigSummary(): void {
    const paramCount = this.config.parameters?.length || 0
    const outputCount = this.config.outputs?.length || 0
    const logicLines = this.config.simulation?.logic?.split('\n').length || 0
    const lastModified = this.configHistory[this.configHistory.length - 1]?.description || 'Original config'

    console.log('┌─ Current Config ─────────────────────────────────────┐')
    console.log(`│ Name: ${this.config.name.padEnd(42)} │`)
    console.log(`│ Parameters: ${paramCount}    Outputs: ${outputCount}    Logic: ${logicLines} lines${' '.repeat(Math.max(0, 7 - logicLines.toString().length))} │`)
    console.log(`│ Last Modified: ${lastModified.padEnd(34)} │`)
    console.log('└─────────────────────────────────────────────────────┘')
    console.log()
  }

  private displayConfigMenu(): void {
    console.log(chalk.blue('Config Editor Commands:'))
    console.log(`  ${chalk.cyan('[e]')} Edit full YAML    ${chalk.cyan('[p]')} Quick param edit   ${chalk.cyan('[l]')} Edit logic only`)
    console.log(`  ${chalk.cyan('[a]')} Add parameter     ${chalk.cyan('[d]')} Delete parameter   ${chalk.cyan('[o]')} Edit outputs`)
    console.log(`  ${chalk.cyan('[i]')} Edit basic info   ${chalk.cyan('[t]')} Test config        ${chalk.cyan('[u]')} Undo changes`)
    console.log(`  ${chalk.cyan('[r]')} Run with changes  ${chalk.cyan('[b]')} Back to main menu`)
    process.stdout.write('> ')
  }

  private async handleConfigCommand(command: string): Promise<void> {
    try {
      switch (command) {
        case 'e':
          await this.editFullConfig()
          break
        case 'l':
          await this.editLogicOnly()
          break
        case 't':
          await this.testConfig()
          break
        case 'r':
          await this.runSimulation()
          break
        case 'u':
          await this.undoChanges()
          break
        case 'p':
        case 'a':
        case 'd':
        case 'o':
        case 'i':
          console.log(chalk.yellow(`Command '${command}' coming in next implementation phase`))
          break
        default:
          console.log(chalk.yellow(`Unknown command: ${command}. Type 'b' to go back.`))
      }
    } catch (error) {
      console.error(chalk.red(`❌ Config command error: ${error instanceof Error ? error.message : String(error)}`))
    }
    console.log()
  }

  private async editFullConfig(): Promise<void> {
    const tempPath = await this.tempManager.createTempConfig(this.config)
    const success = await this.editor.editFullConfig(tempPath)
    
    if (success) {
      const loader = new ConfigurationLoader()
      const newConfig = await loader.loadConfig(tempPath)
      await this.updateConfig(newConfig, 'Full YAML edit')
    }
  }

  private async editLogicOnly(): Promise<void> {
    const updatedConfig = await this.editor.editLogicOnly(this.config)
    await this.updateConfig(updatedConfig, 'Logic-only edit')
  }

  private async testConfig(): Promise<void> {
    console.log(chalk.blue('🧪 Testing config with quick run (100 iterations)...'))
    
    // Get current parameter values from config
    const currentParams: Record<string, unknown> = {}
    this.config.parameters?.forEach(param => {
      currentParams[param.key] = param.default
    })

    const testResults = await this.simulation.runSimulation(currentParams, 100)
    console.log(chalk.green(`✅ Test completed in ${(testResults.duration / 1000).toFixed(1)}s`))
    
    // Show brief results
    Object.entries(testResults.summary).forEach(([key, stats]) => {
      if (typeof stats === 'object' && stats.mean !== undefined) {
        const mean = typeof stats.mean === 'number' ? stats.mean.toFixed(1) : stats.mean
        console.log(chalk.white(`${key}: ${chalk.cyan(mean)}`))
      }
    })
  }

  private async updateConfig(newConfig: SimulationConfig, description: string): Promise<void> {
    // Add to history
    this.configHistory.push({
      config: { ...this.config },
      timestamp: new Date(),
      description
    })

    // Update current config
    this.config = newConfig
    this.simulation = new ConfigurableSimulation(this.config)
    
    console.log(chalk.green(`✅ Config updated: ${description}`))
    
    // Show changes if possible
    // TODO: Implement change detection in next phase
  }

  private async undoChanges(): Promise<void> {
    if (this.configHistory.length <= 1) {
      console.log(chalk.yellow('No changes to undo'))
      return
    }

    // Remove current state and restore previous
    this.configHistory.pop()
    const previousState = this.configHistory[this.configHistory.length - 1]
    
    this.config = { ...previousState.config }
    this.simulation = new ConfigurableSimulation(this.config)
    
    console.log(chalk.green(`✅ Reverted to: ${previousState.description}`))
  }

  private async saveConfig(): Promise<void> {
    await this.tempManager.saveToOriginal(this.originalConfigPath, this.config)
    console.log(chalk.green(`✅ Saved changes to ${this.originalConfigPath}`))
  }

  private async exportResults(): Promise<void> {
    if (!this.results) {
      console.log(chalk.yellow('No results to export. Run simulation first.'))
      return
    }

    console.log(chalk.blue('📤 Export functionality coming in next implementation phase'))
    console.log(chalk.gray('Results available in this.results'))
  }

  private showHelp(): void {
    console.log(chalk.blue.bold('🎮 Interactive Mode Help'))
    console.log()
    console.log(chalk.white('Main Commands:'))
    console.log(`  ${chalk.cyan('r')} - Run simulation again with current configuration`)
    console.log(`  ${chalk.cyan('p')} - Quick parameter editing (guided prompts)`)
    console.log(`  ${chalk.cyan('c')} - Full configuration editing mode`)
    console.log(`  ${chalk.cyan('s')} - Save current configuration to file`)
    console.log(`  ${chalk.cyan('e')} - Export results (CSV/JSON)`)
    console.log(`  ${chalk.cyan('h')} - Show this help`)
    console.log(`  ${chalk.cyan('q')} - Quit interactive mode`)
    console.log()
    console.log(chalk.white('Quick Actions:'))
    console.log(`  ${chalk.cyan('Ctrl+R')} - Instant re-run`)
    console.log(`  ${chalk.cyan('Ctrl+S')} - Quick save`)
    console.log(`  ${chalk.cyan('Ctrl+T')} - Quick test (100 iterations)`)
    console.log(`  ${chalk.cyan('Ctrl+C')} - Exit gracefully`)
    console.log()
  }

  private setupKeyboardShortcuts(): void {
    // Handle Ctrl+C for graceful exit
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n🔄 Shutting down gracefully...'))
      await this.cleanup()
      process.exit(0)
    })

    // TODO: Implement other keyboard shortcuts in next phase
    // Ctrl+R, Ctrl+S, Ctrl+T require more complex readline handling
  }



  private async cleanup(): Promise<void> {
    this.rl.close()
    await this.tempManager.cleanup()
  }
}