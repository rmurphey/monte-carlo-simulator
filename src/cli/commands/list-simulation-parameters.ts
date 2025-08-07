import { ConfigurationLoader } from '../config/loader'
import { ConfigurableSimulation } from '../../framework/ConfigurableSimulation'
import { promises as fs } from 'fs'
import { join } from 'path'
import chalk from 'chalk'

export async function listSimulationParameters(simulationName: string): Promise<void> {
  try {
    // Discover simulation configuration
    const configPath = await discoverSimulation(simulationName)
    const loader = new ConfigurationLoader()
    const config = await loader.loadConfig(configPath)
    
    // Create simulation to get ARR-enhanced parameters
    const simulation = new ConfigurableSimulation(config)
    const enhancedConfig = simulation.getConfiguration()
    
    console.log(chalk.cyan.bold(`📋 Parameters for ${enhancedConfig.name}\n`))
    
    if (enhancedConfig.description) {
      console.log(chalk.gray(`${enhancedConfig.description}\n`))
    }
    
    console.log(chalk.blue.bold('Available Parameters:'))
    console.log(chalk.gray('═'.repeat(80)))
    
    enhancedConfig.parameters.forEach((param: any) => {
      const name = chalk.cyan(param.key.padEnd(20))
      const type = chalk.yellow(`(${param.type})`.padEnd(10))
      const defaultVal = chalk.white(String(param.default).padEnd(15))
      const description = chalk.gray(param.description || param.label || '')
      
      console.log(`${name} ${type} ${chalk.dim('default:')} ${defaultVal} ${description}`)
      
      if (param.min !== undefined || param.max !== undefined) {
        const range = `${param.min !== undefined ? param.min : '?'} - ${param.max !== undefined ? param.max : '?'}`
        console.log(chalk.dim(`${' '.repeat(20)} ${type} ${chalk.dim('range:')}   ${chalk.dim(range)}`))
      }
    })
    
    console.log(chalk.blue.bold('\nUsage Examples:'))
    console.log(chalk.gray('─'.repeat(50)))
    
    // Generate some example overrides
    const examples = generateParameterExamples(enhancedConfig)
    examples.forEach(example => {
      console.log(chalk.green(`  ${example}`))
    })
    
    console.log(chalk.blue.bold('\nParameter File Example:'))
    console.log(chalk.gray('─'.repeat(30)))
    console.log(chalk.dim('// custom-params.json'))
    const paramFile = generateParameterFileExample(enhancedConfig)
    console.log(chalk.white(paramFile))
    console.log('')
    console.log(chalk.green(`  run ${simulationName} --params custom-params.json`))
    
  } catch (error) {
    console.error(chalk.red.bold('❌ Failed to list parameters:'), chalk.red(error instanceof Error ? error.message : String(error)))
    process.exit(1)
  }
}

async function discoverSimulation(simulationName: string): Promise<string> {
  const examplesDir = 'examples/simulations'
  
  const possiblePaths = [
    simulationName,
    join(examplesDir, `${simulationName}/${simulationName}.yaml`),
    join(examplesDir, `${simulationName}.yaml`),
  ]
  
  for (const path of possiblePaths) {
    try {
      await fs.access(path)
      return path
    } catch {
      continue
    }
  }
  
  throw new Error(`Simulation '${simulationName}' not found`)
}

function generateParameterExamples(config: any): string[] {
  const examples: string[] = []
  const params = config.parameters.slice(0, 3) // Take first 3 for examples
  
  if (params.length > 0) {
    // Single parameter override
    const firstParam = params[0]
    let exampleValue = firstParam.default
    if (firstParam.type === 'number') {
      exampleValue = Math.round(firstParam.default * 1.5)
    }
    examples.push(`run ${config.name?.toLowerCase().replace(/\s+/g, '-') || 'simulation'} --${firstParam.key} ${exampleValue}`)
    
    // Multiple parameter overrides
    if (params.length > 1) {
      const overrides = params.slice(0, 2).map((p: any) => {
        let val = p.default
        if (p.type === 'number') val = Math.round(p.default * 0.8)
        return `--${p.key} ${val}`
      }).join(' ')
      examples.push(`run ${config.name?.toLowerCase().replace(/\s+/g, '-') || 'simulation'} ${overrides}`)
    }
    
    // With iterations override
    examples.push(`run ${config.name?.toLowerCase().replace(/\s+/g, '-') || 'simulation'} --${firstParam.key} ${exampleValue} --iterations 5000`)
  }
  
  return examples
}

function generateParameterFileExample(config: any): string {
  const example: Record<string, any> = {}
  
  config.parameters.slice(0, 4).forEach((param: any) => {
    let value = param.default
    if (param.type === 'number') {
      value = Math.round(param.default * 1.2)
    }
    example[param.key] = value
  })
  
  return JSON.stringify(example, null, 2)
}