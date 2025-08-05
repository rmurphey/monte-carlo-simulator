import { ConfigurationLoader } from '../config/loader'
import { ConfigurableSimulation } from '../../framework/ConfigurableSimulation'
import { promises as fs } from 'fs'
import { join, basename } from 'path'

interface RunOptions {
  scenario?: string
  params?: string
  iterations?: number
  output?: string
  format?: 'table' | 'json' | 'csv' | 'quiet'
  verbose?: boolean
  quiet?: boolean
  [key: string]: any // For parameter overrides
}

export async function runSimulation(simulationName: string, options: RunOptions = {}): Promise<void> {
  try {
    console.log(`🎯 Monte Carlo Simulation Runner\n`)
    
    // 1. Discover and load simulation configuration
    const configPath = await discoverSimulation(simulationName, options.scenario)
    const loader = new ConfigurationLoader()
    const config = await loader.loadConfig(configPath)
    
    console.log(`📊 ${config.name}`)
    if (config.description) {
      console.log(`${config.description}\n`)
    }
    
    // 2. Resolve parameters (scenario -> custom file -> CLI overrides)
    const parameters = await resolveParameters(config, options)
    
    // 3. Display configuration if verbose
    if (options.verbose && !options.quiet) {
      displayConfiguration(parameters, options.iterations || 1000)
    }
    
    // 4. Create and run simulation
    const simulation = new ConfigurableSimulation(config)
    const iterations = options.iterations || 1000
    
    if (!options.quiet) {
      console.log(`🚀 Running ${iterations.toLocaleString()} iterations...`)
    }
    
    const startTime = Date.now()
    const results = await simulation.runSimulation(
      parameters, 
      iterations,
      options.quiet ? undefined : (progress: number) => {
        // Simple progress indicator
        if (progress % 0.1 < 0.01) { // Update every 10%
          const percent = Math.round(progress * 100)
          const bar = '▓'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10))
          process.stdout.write(`\r${bar} ${percent}%`)
        }
      }
    )
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(1)
    
    if (!options.quiet) {
      console.log(`\r${'▓'.repeat(10)} 100% | ${iterations.toLocaleString()}/${iterations.toLocaleString()} | ${executionTime}s\n`)
    }
    
    // 5. Display results
    await displayResults(results, config, options)
    
    // 6. Save output if requested
    if (options.output) {
      await saveResults(results, config, parameters, options)
    }
    
    if (!options.quiet) {
      console.log('✅ Simulation completed successfully')
    }
    
  } catch (error) {
    console.error('❌ Simulation failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

async function discoverSimulation(simulationName: string, scenario?: string): Promise<string> {
  const examplesDir = 'examples/simulations'
  
  // Try to find simulation configuration
  const possiblePaths = [
    // Direct file path
    simulationName,
    
    // In examples directory
    join(examplesDir, `${simulationName}/${simulationName}.yaml`),
    join(examplesDir, `${simulationName}.yaml`),
    
    // Scenario-specific
    scenario ? join(examplesDir, `${simulationName}/${scenario}.yaml`) : null,
  ].filter(Boolean) as string[]
  
  for (const path of possiblePaths) {
    try {
      await fs.access(path)
      return path
    } catch {
      // Continue to next path
    }
  }
  
  // List available simulations for helpful error
  try {
    const available = await listAvailableSimulations()
    throw new Error(`Simulation '${simulationName}' not found.\n\nAvailable simulations:\n${available.map(s => `  - ${s}`).join('\n')}`)
  } catch {
    throw new Error(`Simulation '${simulationName}' not found and unable to list available simulations.`)
  }
}

async function listAvailableSimulations(): Promise<string[]> {
  const examplesDir = 'examples/simulations'
  const simulations: string[] = []
  
  try {
    const entries = await fs.readdir(examplesDir, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Check if directory has a main simulation file
        const mainFile = join(examplesDir, entry.name, `${entry.name}.yaml`)
        try {
          await fs.access(mainFile)
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
      const loader = new ConfigurationLoader()
      const customConfig = await loader.loadConfig(options.params)
      Object.assign(parameters, customConfig.parameters)
    } catch (error) {
      throw new Error(`Failed to load parameter file '${options.params}': ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  // 3. Apply command line parameter overrides
  for (const [key, value] of Object.entries(options)) {
    // Skip known CLI options
    if (['scenario', 'params', 'iterations', 'output', 'format', 'verbose', 'quiet'].includes(key)) {
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
      } else if (paramDef.type === 'boolean') {
        convertedValue = value === 'true' || value === true
      }
      
      parameters[key] = convertedValue
    }
  }
  
  return parameters
}

function displayConfiguration(parameters: Record<string, any>, iterations: number): void {
  console.log('📋 CONFIGURATION')
  console.log('━'.repeat(50))
  
  Object.entries(parameters).forEach(([key, value]) => {
    const displayValue = typeof value === 'number' ? value.toLocaleString() : String(value)
    console.log(`${key.padEnd(20)}: ${displayValue}`)
  })
  
  console.log(`${'iterations'.padEnd(20)}: ${iterations.toLocaleString()}`)
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
  console.log('📈 RESULTS SUMMARY')
  console.log('═'.repeat(50))
  
  Object.entries(results.summary).forEach(([key, stats]: [string, any]) => {
    const output = config.outputs.find((o: any) => o.key === key)
    const label = output?.label || key
    const mean = stats.mean?.toLocaleString() || 'N/A'
    const stdDev = stats.standardDeviation?.toLocaleString() || 'N/A'
    
    console.log(`${label.padEnd(25)}: ${mean} (±${stdDev})`)
  })
  
  if (options.verbose) {
    console.log('\n📊 STATISTICAL DISTRIBUTION')
    console.log(' '.repeat(16) + 'P10'.padStart(10) + 'P50'.padStart(10) + 'P90'.padStart(10))
    
    Object.entries(results.summary).forEach(([key, stats]: [string, any]) => {
      const output = config.outputs.find((o: any) => o.key === key)
      const label = (output?.label || key).substring(0, 15)
      const p10 = stats.percentile10?.toLocaleString() || 'N/A'
      const p50 = stats.median?.toLocaleString() || 'N/A'
      const p90 = stats.percentile90?.toLocaleString() || 'N/A'
      
      console.log(`${label.padEnd(15)} ${p10.padStart(10)} ${p50.padStart(10)} ${p90.padStart(10)}`)
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
  
  await fs.writeFile(options.output!, content, 'utf8')
  console.log(`💾 Results saved to ${options.output}`)
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