import { ConfigurationLoader } from '../config/loader'
import { promises as fs } from 'fs'
import { join, basename } from 'path'
import chalk from 'chalk'
import { runSimulation } from './run-simulation'

interface SelectionOptions {
  verbose?: boolean
}

interface SimulationInfo {
  name: string
  category: string
  description: string
  path: string
  tags: string[]
  scenarios?: string[]
}

export async function runInteractiveSelection(options: SelectionOptions = {}): Promise<void> {
  console.log(chalk.cyan.bold('🎯 Interactive Simulation Selection\n'))
  console.log(chalk.gray('Discover and run simulations with ease\n'))
  
  try {
    // Discover all available simulations
    const simulations = await discoverAllSimulations()
    
    if (simulations.length === 0) {
      console.log(chalk.yellow('No simulations found. Create one first with:'))
      console.log(chalk.white('npm run cli create [name]'))
      return
    }
    
    console.log(chalk.green(`✅ Found ${simulations.length} available simulations\n`))
    
    // Run the selection interface
    await selectAndRunSimulation(simulations, options)
    
  } catch (error) {
    console.error(chalk.red('❌ Selection failed:'), error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

async function discoverAllSimulations(): Promise<SimulationInfo[]> {
  const simulations: SimulationInfo[] = []
  const simulationsDir = 'simulations'
  
  try {
    const entries = await fs.readdir(simulationsDir, { withFileTypes: true })
    const loader = new ConfigurationLoader()
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Category directory - scan for simulations
        const categoryPath = join(simulationsDir, entry.name)
        const categoryFiles = await fs.readdir(categoryPath, { withFileTypes: true })
        
        const yamlFiles = categoryFiles.filter(f => f.name.endsWith('.yaml'))
        const scenarios: string[] = []
        
        for (const yamlFile of yamlFiles) {
          const filePath = join(categoryPath, yamlFile.name)
          try {
            const config = await loader.loadConfig(filePath)
            const scenarioName = basename(yamlFile.name, '.yaml')
            scenarios.push(scenarioName)
            
            // Add as separate simulation entry
            simulations.push({
              name: config.name,
              category: config.category,
              description: config.description,
              path: filePath,
              tags: config.tags || [],
              scenarios: [scenarioName]
            })
          } catch {
            // Skip invalid files
          }
        }
      } else if (entry.name.endsWith('.yaml')) {
        // Direct YAML file
        const filePath = join(simulationsDir, entry.name)
        try {
          const config = await loader.loadConfig(filePath)
          simulations.push({
            name: config.name,
            category: config.category,
            description: config.description,
            path: filePath,
            tags: config.tags || []
          })
        } catch {
          // Skip invalid files
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }
  
  return simulations.sort((a, b) => a.name.localeCompare(b.name))
}

async function selectAndRunSimulation(simulations: SimulationInfo[], options: SelectionOptions): Promise<void> {
  const inquirer = await import('inquirer')
  
  const choices = simulations.map(sim => ({
    name: `${chalk.cyan(sim.name)} ${chalk.gray('(' + sim.category + ')')} - ${sim.description.substring(0, 80)}${sim.description.length > 80 ? '...' : ''}`,
    value: sim.path
  }))
  
  const { selectedPath } = await inquirer.default.prompt([{
    type: 'list',
    name: 'selectedPath',
    message: 'Select a simulation to run:',
    choices,
    pageSize: 10
  }])
  
  // Ask for run options
  const { runMode } = await inquirer.default.prompt([{
    type: 'list',
    name: 'runMode',
    message: 'How would you like to run it?',
    choices: [
      { name: '🎮 Interactive Mode (adjust parameters real-time)', value: 'interactive' },
      { name: '🚀 Quick Run (1000 iterations)', value: 'quick' },
      { name: '📊 Detailed Analysis (verbose output)', value: 'detailed' },
      { name: '🔧 Custom Options...', value: 'custom' }
    ]
  }])
  
  let runOptions: any = { verbose: options.verbose }
  
  if (runMode === 'interactive') {
    runOptions.interactive = true
  } else if (runMode === 'detailed') {
    runOptions.verbose = true
    runOptions.iterations = 2000
  } else if (runMode === 'custom') {
    const customOptions = await inquirer.default.prompt([
      {
        type: 'confirm',
        name: 'interactive',
        message: 'Enable interactive mode?',
        default: false
      },
      {
        type: 'number',
        name: 'iterations',
        message: 'Number of iterations:',
        default: 1000,
        validate: (input?: number) => (input && input > 0) ? true : 'Must be a positive number'
      },
      {
        type: 'confirm',
        name: 'verbose',
        message: 'Verbose output?',
        default: false
      }
    ])
    runOptions = { ...runOptions, ...customOptions }
  }
  
  console.log(chalk.yellow('\n🚀 Starting simulation...\n'))
  
  // Extract just the filename for the run command
  const simulationName = selectedPath
  await runSimulation(simulationName, runOptions)
}

/*
async function browseByCategory(simulations: SimulationInfo[], categories: string[], _options: SelectionOptions): Promise<void> {
  const inquirer = await import('inquirer')
  
  const { selectedCategory } = await inquirer.default.prompt([{
    type: 'list',
    name: 'selectedCategory',
    message: 'Select a category:',
    choices: categories.map(cat => {
      const count = simulations.filter(s => s.category === cat).length
      return {
        name: `${cat} (${count} simulation${count !== 1 ? 's' : ''})`,
        value: cat
      }
    })
  }])
  
  const categorySimulations = simulations.filter(s => s.category === selectedCategory)
  displaySimulationsTable(categorySimulations)
}

async function browseByTags(simulations: SimulationInfo[], _options: SelectionOptions): Promise<void> {
  const inquirer = await import('inquirer')
  
  const allTags = [...new Set(simulations.flatMap(s => s.tags))].sort()
  
  if (allTags.length === 0) {
    console.log(chalk.yellow('No tags found in simulations'))
    return
  }
  
  const { selectedTags } = await inquirer.default.prompt([{
    type: 'checkbox',
    name: 'selectedTags',
    message: 'Select tags to filter by:',
    choices: allTags.map(tag => {
      const count = simulations.filter(s => s.tags.includes(tag)).length
      return {
        name: `${tag} (${count})`,
        value: tag
      }
    })
  }])
  
  if (selectedTags.length === 0) {
    console.log(chalk.yellow('No tags selected'))
    return
  }
  
  const taggedSimulations = simulations.filter(s => 
    selectedTags.some((tag: string) => s.tags.includes(tag))
  )
  
  console.log(chalk.blue.bold(`\n📋 Simulations with tags: ${selectedTags.join(', ')}\n`))
  displaySimulationsTable(taggedSimulations)
}

async function searchSimulations(simulations: SimulationInfo[], _options: SelectionOptions): Promise<void> {
  const inquirer = await import('inquirer')
  
  const { searchTerm } = await inquirer.default.prompt([{
    type: 'input',
    name: 'searchTerm',
    message: 'Search simulations (name, description, tags):',
    validate: (input: string) => input.trim().length > 0 ? true : 'Please enter a search term'
  }])
  
  const searchResults = simulations.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  
  if (searchResults.length === 0) {
    console.log(chalk.yellow(`No simulations found matching "${searchTerm}"`))
    return
  }
  
  console.log(chalk.blue.bold(`\n🔍 Search results for "${searchTerm}":\n`))
  displaySimulationsTable(searchResults)
}

function displayAllSimulations(simulations: SimulationInfo[]): void {
  console.log(chalk.blue.bold(`\n📋 All Available Simulations (${simulations.length}):\n`))
  displaySimulationsTable(simulations)
}

function displaySimulationsTable(simulations: SimulationInfo[]): void {
  simulations.forEach((sim, index) => {
    console.log(`${chalk.cyan((index + 1).toString().padStart(2))}. ${chalk.white.bold(sim.name)}`)
    console.log(`    ${chalk.gray('Category:')} ${chalk.yellow(sim.category)}`)
    console.log(`    ${chalk.gray('Description:')} ${sim.description}`)
    if (sim.tags.length > 0) {
      console.log(`    ${chalk.gray('Tags:')} ${sim.tags.map(t => chalk.blue(t)).join(', ')}`)
    }
    if (sim.scenarios && sim.scenarios.length > 1) {
      console.log(`    ${chalk.gray('Scenarios:')} ${sim.scenarios.join(', ')}`)
    }
    console.log(`    ${chalk.gray('Path:')} ${chalk.dim(sim.path)}`)
    console.log('')
  })
}
*/