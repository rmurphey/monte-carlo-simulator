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
  .command('validate')
  .description('Validate a simulation file')
  .argument('<file>', 'path to simulation file')
  .option('-v, --verbose', 'verbose output')
  .action(validateSimulation)

program
  .command('run')
  .description('Run a Monte Carlo simulation')
  .argument('<simulation>', 'simulation name or path')
  .option('-s, --scenario <scenario>', 'scenario to run (conservative, neutral, aggressive)')
  .option('-p, --params <file>', 'custom parameter file')
  .option('-i, --iterations <number>', 'number of iterations', '1000')
  .option('-o, --output <file>', 'save results to file')
  .option('-f, --format <format>', 'output format (table, json, csv, quiet)', 'table')
  .option('-v, --verbose', 'show detailed output')
  .option('-q, --quiet', 'minimal output')
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