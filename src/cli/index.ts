#!/usr/bin/env node

import { Command } from 'commander'
import { createSimulation } from './commands/create-simulation'
import { listSimulations } from './commands/list-simulations'
import { validateSimulation } from './commands/validate-simulation'
import { runSimulation } from './commands/run-simulation'

const program = new Command()

program
  .name('monte-carlo-cli')
  .description('CLI tools for Monte Carlo Simulation Framework')
  .version('1.0.0')

program
  .command('create')
  .description('Create a new simulation')
  .argument('[name]', 'simulation name')
  .option('-c, --category <category>', 'simulation category')
  .option('-d, --description <description>', 'simulation description')
  .option('-i, --interactive', 'interactive mode with prompts')
  .option('-t, --template <template>', 'template to use', 'basic')
  .option('--no-test', 'skip test file generation')
  .option('--no-register', 'skip automatic registry registration')
  .action(createSimulation)

program
  .command('list')
  .description('List existing simulations')
  .option('-c, --category <category>', 'filter by category')
  .option('-f, --format <format>', 'output format (table|json)', 'table')
  .action(listSimulations)

program
  .command('interactive')
  .alias('i')
  .description('Interactively select and run simulations')
  .option('-v, --verbose', 'show detailed output')
  .action(async (options) => {
    const { runInteractiveSelection } = await import('./commands/interactive-selection')
    await runInteractiveSelection(options)
  })

program
  .command('validate')
  .description('Validate a simulation file')
  .argument('<file>', 'path to simulation file')
  .option('-v, --verbose', 'verbose output')
  .action(validateSimulation)

program
  .command('studio')
  .description('Interactive simulation studio for guided creation')
  .addCommand(
    new Command('define')
      .description('Create simulations with guided assistance')
      .option('-q, --quick-start', 'quick start with business templates')
      .option('-t, --template <template>', 'start from specific template')
      .option('-o, --output <file>', 'output file path')
      .option('-a, --agent-mode', 'agent-optimized creation workflow')
      .option('-v, --verbose', 'detailed progress information')
      .option('--no-interactive', 'skip interactive test during creation')
      .action(async (options) => {
        try {
          const { InteractiveDefinitionStudio } = await import('./interactive/definition-studio')
          const studio = new InteractiveDefinitionStudio()
          await studio.createSimulation(options)
        } catch (error) {
          console.error('❌ Studio command failed:', error instanceof Error ? error.message : String(error))
          process.exit(1)
        }
      })
  )

program
  .command('run')
  .description('Run a Monte Carlo simulation')
  .argument('<simulation>', 'simulation name or path')
  .option('-s, --scenario <scenario>', 'scenario to run (conservative, neutral, aggressive)')
  .option('-c, --compare <scenarios>', 'compare multiple scenarios (comma-separated)')
  .option('-p, --params <file>', 'custom parameter file')
  .option('-i, --iterations <number>', 'number of iterations', '1000')
  .option('-o, --output <file>', 'save results to file')
  .option('-f, --format <format>', 'output format (table, json, csv, quiet)', 'table')
  .option('-v, --verbose', 'show detailed output')
  .option('-q, --quiet', 'minimal output')
  .option('--interactive', 'launch interactive mode with real-time parameter adjustment')
  .action(async (simulation, options) => {
    // Convert iterations to number
    if (options.iterations) {
      options.iterations = parseInt(options.iterations, 10)
      if (isNaN(options.iterations)) {
        console.error('❌ Iterations must be a number')
        process.exit(1)
      }
    }
    
    await runSimulation(simulation, options)
  })

// Parse command line arguments
program.parse()