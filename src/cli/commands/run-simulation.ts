import { ConfigurationLoader } from '../config/loader'
import { ConfigurableSimulation } from '../../framework/ConfigurableSimulation'
import { readFile, readdir, access, writeFile } from 'fs/promises'
import { join, basename } from 'path'
import chalk from 'chalk'
import * as yaml from 'js-yaml'

interface RunOptions {
  scenario?: string
  compare?: string
  params?: string
  iterations?: number
  output?: string
  format?: 'table' | 'json' | 'csv' | 'quiet'
  verbose?: boolean
  quiet?: boolean
  set?: string[] // For --set param=value options
  [key: string]: any // For additional parameter overrides
}

export async function runSimulation(simulationName: string, options: RunOptions = {}): Promise<void> {
  try {
    console.log(chalk.cyan.bold(`🎯 Monte Carlo Simulation Runner\n`))
    
    // Handle comparison mode
    if (options.compare) {
      await runComparisonMode(simulationName, options)
      return
    }
    
    // 1. Discover and load simulation configuration
    const configPath = await discoverSimulation(simulationName, options.scenario)
    const loader = new ConfigurationLoader()
    const config = await loader.loadConfig(configPath)
    
    console.log(chalk.blue.bold(`📊 ${config.name}`))
    if (config.description) {
      console.log(chalk.gray(`${config.description}\n`))
    }
    
    // 2. Create simulation first to get ARR-enhanced parameters
    const simulation = new ConfigurableSimulation(config)
    const enhancedConfig = simulation.getConfiguration()
    
    // 3. Resolve parameters using enhanced config (scenario -> custom file -> CLI overrides)
    const parameters = await resolveParameters(enhancedConfig, options)
    
    // 4. Display configuration if verbose
    if (options.verbose && !options.quiet) {
      displayConfiguration(parameters, options.iterations || 1000)
    }
    const iterations = options.iterations || 1000
    
    // Handle interactive mode
    if (options.interactive) {
      await runInteractiveMode(simulation, enhancedConfig, parameters, iterations)
      return
    }
    
    if (!options.quiet) {
      console.log(chalk.yellow(`🚀 Running ${iterations.toLocaleString()} iterations...`))
    }
    
    const startTime = Date.now()
    const results = await simulation.runSimulation(
      parameters, 
      iterations,
      options.quiet ? undefined : (progress: number) => {
        // Colorful progress indicator
        if (progress % 0.1 < 0.01) { // Update every 10%
          const percent = Math.round(progress * 100)
          const completed = Math.floor(percent / 10)
          const remaining = 10 - completed
          const bar = chalk.green('▓'.repeat(completed)) + chalk.gray('░'.repeat(remaining))
          process.stdout.write(`\r${bar} ${chalk.cyan(`${percent}%`)}`)
        }
      }
    )
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(1)
    
    if (!options.quiet) {
      const bar = chalk.green('▓'.repeat(10))
      console.log(`\r${bar} ${chalk.cyan('100%')} | ${chalk.white(iterations.toLocaleString())}/${chalk.white(iterations.toLocaleString())} | ${chalk.magenta(executionTime + 's')}\n`)
    }
    
    // 5. Display results
    await displayResults(results, config, options)
    
    // 6. Save output if requested
    if (options.output) {
      await saveResults(results, config, parameters, options)
    }
    
    if (!options.quiet) {
      console.log(chalk.green.bold('✅ Simulation completed successfully'))
    }
    
  } catch (error) {
    console.error(chalk.red.bold('❌ Simulation failed:'), chalk.red(error instanceof Error ? error.message : String(error)))
    process.exit(1)
  }
}

async function discoverSimulation(simulationName: string, scenario?: string): Promise<string> {
  const examplesDir = 'examples/simulations'
  
  // Try to find simulation configuration
  const possiblePaths = [
    // Direct file path
    simulationName,
    
    // Scenario-specific (try this first for scenario-based structure)
    scenario ? join(examplesDir, `${simulationName}/${scenario}.yaml`) : null,
    
    // In examples directory (scenario-based structure)
    join(examplesDir, `${simulationName}/${simulationName}.yaml`),
    
    // Legacy single file structure
    join(examplesDir, `${simulationName}.yaml`),
  ].filter(Boolean) as string[]
  
  for (const path of possiblePaths) {
    try {
      await access(path)
      return path
    } catch {
      // Continue to next path
    }
  }
  
  // List available simulations for helpful error
  try {
    const available = await listAvailableSimulations()
    if (available.length > 0) {
      throw new Error(`Simulation '${simulationName}' not found.\n\nAvailable simulations:\n${available.map(s => `  - ${s}`).join('\n')}`)
    } else {
      throw new Error(`Simulation '${simulationName}' not found. No simulations found in examples/simulations directory.`)
    }
  } catch (error) {
    // If the error is our intentional "not found" error, re-throw it
    if (error instanceof Error && error.message.includes('Available simulations:')) {
      throw error
    }
    // Otherwise it's a filesystem error, use fallback message
    throw new Error(`Simulation '${simulationName}' not found and unable to list available simulations.`)
  }
}

async function listAvailableSimulations(): Promise<string[]> {
  const examplesDir = 'examples/simulations'
  const simulations: string[] = []
  
  try {
    const entries = await readdir(examplesDir, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Check if directory has a main simulation file
        const mainFile = join(examplesDir, entry.name, `${entry.name}.yaml`)
        try {
          await access(mainFile)
          simulations.push(entry.name)
        } catch {
          // No main file, skip
        }
      } else if (entry.name.endsWith('.yaml')) {
        // Individual YAML file
        const name = basename(entry.name, '.yaml')
        simulations.push(name)
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }
  
  return simulations.sort()
}

async function resolveParameters(config: any, options: RunOptions): Promise<Record<string, any>> {
  const parameters: Record<string, any> = {}
  
  // 1. Start with simulation defaults
  config.parameters.forEach((param: any) => {
    parameters[param.key] = param.default
  })
  
  // 2. Apply custom parameter file if provided
  if (options.params) {
    try {
      const content = await readFile(options.params, 'utf8')
      let customConfig: any
      
      // Try parsing as JSON first (common case for parameter files)
      try {
        customConfig = JSON.parse(content)
      } catch {
        // If JSON fails, try YAML
        customConfig = yaml.load(content)
      }
      
      if (!customConfig || typeof customConfig !== 'object') {
        throw new Error('Parameter file must contain a valid object')
      }
      
      // Parameter files support two formats:
      // 1. Full simulation config with parameters array: { parameters: [{ key: "foo", default: 123 }] }
      // 2. Simple parameter object: { "foo": 123, "bar": "value" }
      // 
      // For format 1, we extract parameter defaults from the parameters array
      // For format 2, we use the object directly as key-value parameter overrides
      const customParams = customConfig.parameters 
        ? customConfig.parameters.reduce((acc: Record<string, any>, param: any) => {
            if (param.key && param.default !== undefined) {
              acc[param.key] = param.default
            }
            return acc
          }, {})
        : customConfig
      
      Object.assign(parameters, customParams)
    } catch (error) {
      throw new Error(`Failed to load parameter file '${options.params}': ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  // 3. Apply --set parameter overrides
  if (options.set) {
    for (const setParam of options.set) {
      const [key, value] = setParam.split('=', 2)
      if (!key || value === undefined) {
        throw new Error(`Invalid --set format: '${setParam}'. Use --set paramName=value`)
      }
      
      // Check if this is a valid parameter for the simulation
      const paramDef = config.parameters.find((p: any) => p.key === key)
      if (!paramDef) {
        throw new Error(`Unknown parameter '${key}' for simulation '${config.name}'. Use --list-params to see available parameters.`)
      }
      
      // Convert value to appropriate type
      let convertedValue: any = value
      if (paramDef.type === 'number') {
        convertedValue = Number(value)
        if (isNaN(convertedValue)) {
          throw new Error(`Parameter '${key}' must be a number, got: ${value}`)
        }
        
        // Check min/max constraints
        if (paramDef.min !== undefined && convertedValue < paramDef.min) {
          throw new Error(`Parameter '${key}' value ${convertedValue} is below minimum ${paramDef.min}`)
        }
        if (paramDef.max !== undefined && convertedValue > paramDef.max) {
          throw new Error(`Parameter '${key}' value ${convertedValue} is above maximum ${paramDef.max}`)
        }
      } else if (paramDef.type === 'boolean') {
        convertedValue = value === 'true' || value === 'yes' || value === '1'
      }
      
      parameters[key] = convertedValue
    }
  }

  // 4. Apply any additional command line parameter overrides (legacy support)
  for (const [key, value] of Object.entries(options)) {
    // Skip known CLI options
    if (['scenario', 'params', 'iterations', 'output', 'format', 'verbose', 'quiet', 'compare', 'set', 'listParams', 'interactive'].includes(key)) {
      continue
    }
    
    // Check if this is a valid parameter for the simulation
    const paramDef = config.parameters.find((p: any) => p.key === key)
    if (paramDef) {
      // Convert value to appropriate type
      let convertedValue = value
      if (paramDef.type === 'number') {
        convertedValue = Number(value)
        if (isNaN(convertedValue)) {
          throw new Error(`Parameter '${key}' must be a number, got: ${value}`)
        }
        
        // Check min/max constraints
        if (paramDef.min !== undefined && convertedValue < paramDef.min) {
          throw new Error(`Parameter '${key}' value ${convertedValue} is below minimum ${paramDef.min}`)
        }
        if (paramDef.max !== undefined && convertedValue > paramDef.max) {
          throw new Error(`Parameter '${key}' value ${convertedValue} is above maximum ${paramDef.max}`)
        }
      } else if (paramDef.type === 'boolean') {
        convertedValue = value === 'true' || value === true
      }
      
      parameters[key] = convertedValue
    }
  }
  
  return parameters
}

function displayConfiguration(parameters: Record<string, any>, iterations: number): void {
  console.log(chalk.blue.bold('📋 CONFIGURATION'))
  console.log(chalk.gray('━'.repeat(50)))
  
  Object.entries(parameters).forEach(([key, value]) => {
    const displayValue = typeof value === 'number' ? value.toLocaleString() : String(value)
    console.log(`${chalk.cyan(key.padEnd(20))}: ${chalk.white(displayValue)}`)
  })
  
  console.log(`${chalk.cyan('iterations'.padEnd(20))}: ${chalk.white(iterations.toLocaleString())}`)
  console.log('')
}

async function displayResults(results: any, config: any, options: RunOptions): Promise<void> {
  if (options.quiet) return
  
  const format = options.format || 'table'
  
  if (format === 'json') {
    console.log(JSON.stringify(results, null, 2))
    return
  }
  
  if (format === 'csv') {
    // Simple CSV output of raw results
    const headers = Object.keys(results.results[0] || {})
    console.log(headers.join(','))
    results.results.forEach((result: any) => {
      console.log(headers.map(h => result[h]).join(','))
    })
    return
  }
  
  // Default table format
  console.log(chalk.green.bold('📈 RESULTS SUMMARY'))
  console.log(chalk.gray('═'.repeat(50)))
  
  Object.entries(results.summary).forEach(([key, stats]: [string, any]) => {
    const output = config.outputs.find((o: any) => o.key === key)
    const label = output?.label || key
    const mean = stats.mean?.toLocaleString() || 'N/A'
    const stdDev = stats.standardDeviation?.toLocaleString() || 'N/A'
    
    console.log(`${chalk.cyan(label.padEnd(25))}: ${chalk.white(mean)} ${chalk.gray(`(±${stdDev})`)}`)
  })
  
  if (options.verbose) {
    console.log(chalk.blue.bold('\n📊 STATISTICAL DISTRIBUTION'))
    console.log(' '.repeat(16) + chalk.yellow('P10'.padStart(10)) + chalk.yellow('P50'.padStart(10)) + chalk.yellow('P90'.padStart(10)))
    
    Object.entries(results.summary).forEach(([key, stats]: [string, any]) => {
      const output = config.outputs.find((o: any) => o.key === key)
      const label = (output?.label || key).substring(0, 15)
      const p10 = stats.percentile10?.toLocaleString() || 'N/A'
      const p50 = stats.median?.toLocaleString() || 'N/A'
      const p90 = stats.percentile90?.toLocaleString() || 'N/A'
      
      console.log(`${chalk.cyan(label.padEnd(15))} ${chalk.white(p10.padStart(10))} ${chalk.white(p50.padStart(10))} ${chalk.white(p90.padStart(10))}`)
    })
  }
}

async function saveResults(results: any, config: any, parameters: Record<string, any>, options: RunOptions): Promise<void> {
  const outputData = {
    simulation: config.name,
    parameters,
    iterations: results.results.length,
    executionTime: new Date().toISOString(),
    results: options.format === 'json' ? results.results : undefined,
    summary: results.summary
  }
  
  const content = options.format === 'csv' ? 
    convertToCSV(results.results) : 
    JSON.stringify(outputData, null, 2)
  
  await writeFile(options.output!, content, 'utf8')
  console.log(chalk.green(`💾 Results saved to ${chalk.white(options.output)}`))
}

function convertToCSV(results: any[]): string {
  if (!results.length) return ''
  
  const headers = Object.keys(results[0])
  const csvContent = [
    headers.join(','),
    ...results.map(result => headers.map(h => result[h]).join(','))
  ].join('\n')
  
  return csvContent
}

async function runComparisonMode(simulationName: string, options: RunOptions): Promise<void> {
  const scenarios = options.compare!.split(',').map(s => s.trim())
  const iterations = options.iterations || 1000
  const results: Array<{ scenario: string; config: any; results: any }> = []
  
  console.log(chalk.magenta.bold(`🔬 Scenario Comparison: ${chalk.white(simulationName)}`))
  console.log(chalk.gray(`Comparing scenarios: ${chalk.white(scenarios.join(', '))}\n`))
  
  // Run each scenario
  for (const scenario of scenarios) {
    try {
      console.log(chalk.yellow(`🚀 Running ${chalk.white(scenario)} scenario (${chalk.white(iterations.toLocaleString())} iterations)...`))
      
      const configPath = await discoverSimulation(simulationName, scenario)
      const loader = new ConfigurationLoader()
      const config = await loader.loadConfig(configPath)
      
      const simulation = new ConfigurableSimulation(config)
      const enhancedConfig = simulation.getConfiguration()
      const parameters = await resolveParameters(enhancedConfig, { ...options, scenario })
      
      const startTime = Date.now()
      const result = await simulation.runSimulation(parameters, iterations)
      const executionTime = ((Date.now() - startTime) / 1000).toFixed(1)
      
      results.push({ scenario, config, results: result })
      console.log(chalk.green(`✅ ${chalk.white(scenario)} completed (${chalk.gray(executionTime + 's')})\n`))
      
    } catch (error) {
      console.error(chalk.red(`❌ ${chalk.white(scenario)} failed: ${chalk.red(error instanceof Error ? error.message : String(error))}\n`))
    }
  }
  
  if (results.length === 0) {
    console.error(chalk.red.bold('❌ No scenarios completed successfully'))
    return
  }
  
  // Display comparison results
  await displayComparisonResults(results, options)
  
  // Save comparison results if requested
  if (options.output) {
    await saveComparisonResults(results, simulationName, options)
  }
  
  console.log(chalk.green.bold('✅ Scenario comparison completed successfully'))
}

async function displayComparisonResults(results: Array<{ scenario: string; config: any; results: any }>, options: RunOptions): Promise<void> {
  if (options.quiet) return
  
  const format = options.format || 'table'
  
  if (format === 'json') {
    const comparisonData = {
      comparison: results.map(r => ({
        scenario: r.scenario,
        simulation: r.config.name,
        summary: r.results.summary
      }))
    }
    console.log(JSON.stringify(comparisonData, null, 2))
    return
  }
  
  // Table format comparison
  console.log(chalk.magenta.bold('📊 SCENARIO COMPARISON RESULTS'))
  console.log(chalk.gray('═'.repeat(80)))
  
  // Get all output keys from first result
  const outputKeys = Object.keys(results[0].results.summary)
  
  // Display comparison table for each output metric
  for (const outputKey of outputKeys) {
    const output = results[0].config.outputs.find((o: any) => o.key === outputKey)
    const label = output?.label || outputKey
    
    console.log(chalk.blue.bold(`\n${label}:`))
    console.log(chalk.gray('─'.repeat(60)))
    console.log(chalk.yellow('Scenario'.padEnd(15)) + chalk.yellow('Mean'.padStart(15)) + chalk.yellow('P10'.padStart(12)) + chalk.yellow('P90'.padStart(12)))
    console.log(chalk.gray('─'.repeat(60)))
    
    results.forEach(({ scenario, results: scenarioResults }) => {
      const stats = scenarioResults.summary[outputKey]
      const mean = stats.mean?.toLocaleString() || 'N/A'
      const p10 = stats.percentile10?.toLocaleString() || 'N/A'
      const p90 = stats.percentile90?.toLocaleString() || 'N/A'
      
      console.log(
        chalk.cyan(scenario.padEnd(15)) + 
        chalk.white(mean.padStart(15)) + 
        chalk.white(p10.padStart(12)) + 
        chalk.white(p90.padStart(12))
      )
    })
  }
  
  if (options.verbose) {
    console.log(chalk.blue.bold('\n📈 DETAILED COMPARISON'))
    console.log(chalk.gray('═'.repeat(80)))
    
    results.forEach(({ scenario, config, results: scenarioResults }, index) => {
      console.log(chalk.magenta.bold(`\n${index + 1}. ${scenario.toUpperCase()} SCENARIO`))
      console.log(chalk.gray(`   ${config.description}`))
      console.log(chalk.gray('   ' + '─'.repeat(50)))
      
      Object.entries(scenarioResults.summary).forEach(([key, stats]: [string, any]) => {
        const output = config.outputs.find((o: any) => o.key === key)
        const label = output?.label || key
        const mean = stats.mean?.toLocaleString() || 'N/A'
        const stdDev = stats.standardDeviation?.toLocaleString() || 'N/A'
        
        console.log(`   ${chalk.cyan(label.padEnd(25))}: ${chalk.white(mean)} ${chalk.gray(`(±${stdDev})`)}`)
      })
    })
  }
}

async function saveComparisonResults(results: Array<{ scenario: string; config: any; results: any }>, simulationName: string, options: RunOptions): Promise<void> {
  const comparisonData = {
    simulation: simulationName,
    scenarios: results.map(r => r.scenario),
    timestamp: new Date().toISOString(),
    results: results.map(r => ({
      scenario: r.scenario,
      name: r.config.name,
      description: r.config.description,
      summary: r.results.summary,
      iterations: r.results.results.length
    }))
  }
  
  const content = options.format === 'csv' ? 
    convertComparisonToCSV(results) : 
    JSON.stringify(comparisonData, null, 2)
  
  await writeFile(options.output!, content, 'utf8')
  console.log(chalk.green(`💾 Comparison results saved to ${chalk.white(options.output)}`))
}

function convertComparisonToCSV(results: Array<{ scenario: string; config: any; results: any }>): string {
  const headers = ['scenario', 'metric', 'mean', 'median', 'std_dev', 'p10', 'p90']
  const rows = [headers.join(',')]
  
  results.forEach(({ scenario, results: scenarioResults }) => {
    Object.entries(scenarioResults.summary).forEach(([key, stats]: [string, any]) => {
      rows.push([
        scenario,
        key,
        stats.mean || '',
        stats.median || '',
        stats.standardDeviation || '',
        stats.percentile10 || '',
        stats.percentile90 || ''
      ].join(','))
    })
  })
  
  return rows.join('\n')
}

async function runInteractiveMode(
  simulation: ConfigurableSimulation, 
  config: any, 
  initialParams: Record<string, any>, 
  iterations: number
): Promise<void> {
  const inquirer = await import('inquirer')
  let currentParams = { ...initialParams }
  let previousResults: any = null
  
  console.log(chalk.cyan.bold('\n🎛️  Interactive Parameter Exploration'))
  console.log(chalk.gray(`Adjust parameters for: ${config.name}\n`))
  
  // Interactive menu loop: while(true) is correct pattern for CLI applications
  // - Blocks on await inquirer.prompt() (no CPU/memory consumption)
  // - User explicitly chooses "Exit" to break loop
  // - Standard pattern used by npm init, create-react-app, etc.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Run simulation with current parameters
    console.log(chalk.yellow(`🚀 Running ${iterations.toLocaleString()} iterations...`))
    const startTime = Date.now()
    const results = await simulation.runSimulation(currentParams, iterations)
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(1)
    
    console.log(chalk.green(`✅ Completed (${executionTime}s)\n`))
    
    // Display results
    console.log(chalk.green.bold('📈 RESULTS'))
    console.log(chalk.gray('═'.repeat(50)))
    Object.entries(results.summary).forEach(([key, stats]: [string, any]) => {
      const output = config.outputs.find((o: any) => o.key === key)
      const label = output?.label || key
      const mean = stats.mean?.toLocaleString() || 'N/A'
      const stdDev = stats.standardDeviation?.toLocaleString() || 'N/A'
      console.log(`${chalk.cyan(label.padEnd(25))}: ${chalk.white(mean)} ${chalk.gray(`(±${stdDev})`)}`)
    })
    
    // Show comparison if we have previous results
    if (previousResults) {
      console.log(chalk.blue.bold('\n📊 CHANGE FROM PREVIOUS'))
      console.log(chalk.gray('─'.repeat(50)))
      Object.entries(results.summary).forEach(([key, stats]: [string, any]) => {
        const prevStats = previousResults.summary[key]
        if (prevStats && typeof stats.mean === 'number' && typeof prevStats.mean === 'number') {
          const change = ((stats.mean - prevStats.mean) / prevStats.mean) * 100
          const changeStr = change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`
          const arrow = change >= 0 ? '⬆️' : '⬇️'
          const output = config.outputs.find((o: any) => o.key === key)
          const label = output?.label || key
          console.log(`${chalk.cyan(label.padEnd(25))}: ${chalk.white(changeStr)} ${arrow}`)
        }
      })
    }
    
    // Ask what to do next
    const answer = await inquirer.default.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Adjust parameters', value: 'adjust' },
        { name: 'Run again with same parameters', value: 'rerun' },
        { name: 'Exit interactive mode', value: 'exit' }
      ]
    }])
    
    if (answer.action === 'exit') {
      console.log(chalk.green('\n✅ Interactive session ended'))
      break
    }
    
    if (answer.action === 'rerun') {
      previousResults = results
      continue
    }
    
    if (answer.action === 'adjust') {
      // Show current parameters and let user pick which to change
      const paramChoices = config.parameters.map((param: any) => ({
        name: `${param.key}: ${currentParams[param.key]} ${param.description ? `(${param.description})` : ''}`,
        value: param.key
      }))
      paramChoices.push({ name: 'Back to results', value: 'back' })
      
      const paramAnswer = await inquirer.default.prompt([{
        type: 'list',
        name: 'param',
        message: 'Which parameter would you like to adjust?',
        choices: paramChoices
      }])
      
      if (paramAnswer.param === 'back') {
        continue
      }
      
      const paramDef = config.parameters.find((p: any) => p.key === paramAnswer.param)
      const currentValue = currentParams[paramAnswer.param]
      
      let newValue
      if (paramDef.type === 'number') {
        const numberAnswer = await inquirer.default.prompt([{
          type: 'input',
          name: 'value',
          message: `Enter new value for ${paramDef.key} (current: ${currentValue}):`,
          validate: (input: string) => {
            const num = Number(input)
            if (isNaN(num)) return 'Please enter a valid number'
            if (paramDef.min !== undefined && num < paramDef.min) return `Value must be >= ${paramDef.min}`
            if (paramDef.max !== undefined && num > paramDef.max) return `Value must be <= ${paramDef.max}`
            return true
          }
        }])
        newValue = Number(numberAnswer.value)
      } else if (paramDef.type === 'boolean') {
        const boolAnswer = await inquirer.default.prompt([{
          type: 'confirm',
          name: 'value',
          message: `${paramDef.key}:`,
          default: currentValue
        }])
        newValue = boolAnswer.value
      } else {
        const textAnswer = await inquirer.default.prompt([{
          type: 'input',
          name: 'value',
          message: `Enter new value for ${paramDef.key} (current: ${currentValue}):`
        }])
        newValue = textAnswer.value
      }
      
      previousResults = results
      currentParams[paramAnswer.param] = newValue
      console.log(chalk.green(`✅ Updated ${paramAnswer.param} to ${newValue}\n`))
    }
  }
}