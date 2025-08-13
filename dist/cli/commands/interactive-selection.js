"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInteractiveSelection = runInteractiveSelection;
const loader_1 = require("../config/loader");
const fs_1 = require("fs");
const path_1 = require("path");
const chalk_1 = __importDefault(require("chalk"));
const run_simulation_1 = require("./run-simulation");
const package_paths_1 = require("../utils/package-paths");
async function runInteractiveSelection(options = {}) {
    console.log(chalk_1.default.cyan.bold('🎯 Interactive Simulation Selection\n'));
    console.log(chalk_1.default.gray('Discover and run simulations with ease\n'));
    try {
        // Discover all available simulations
        const simulations = await discoverAllSimulations();
        if (simulations.length === 0) {
            console.log(chalk_1.default.yellow('No simulations found. Create one first with:'));
            console.log(chalk_1.default.white('npm run cli create [name]'));
            return;
        }
        console.log(chalk_1.default.green(`✅ Found ${simulations.length} available simulations\n`));
        // Run the selection interface
        await selectAndRunSimulation(simulations, options);
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Selection failed:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
async function discoverAllSimulations() {
    const simulations = [];
    const searchPaths = package_paths_1.packagePaths.getSimulationSearchPaths();
    const loader = new loader_1.ConfigurationLoader();
    for (const searchPath of searchPaths) {
        try {
            const entries = await fs_1.promises.readdir(searchPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    // Category directory - scan for simulations
                    const categoryPath = (0, path_1.join)(searchPath, entry.name);
                    try {
                        const categoryFiles = await fs_1.promises.readdir(categoryPath, { withFileTypes: true });
                        const yamlFiles = categoryFiles.filter(f => f.name.endsWith('.yaml'));
                        for (const yamlFile of yamlFiles) {
                            const filePath = (0, path_1.join)(categoryPath, yamlFile.name);
                            try {
                                const config = await loader.loadConfig(filePath);
                                const scenarioName = (0, path_1.basename)(yamlFile.name, '.yaml');
                                // Add as separate simulation entry
                                simulations.push({
                                    name: config.name,
                                    category: config.category,
                                    description: config.description,
                                    path: filePath,
                                    tags: config.tags || [],
                                    scenarios: [scenarioName]
                                });
                            }
                            catch {
                                // Skip invalid files
                            }
                        }
                    }
                    catch {
                        // Skip directories that can't be read
                    }
                }
                else if (entry.name.endsWith('.yaml')) {
                    // Direct YAML file
                    const filePath = (0, path_1.join)(searchPath, entry.name);
                    try {
                        const config = await loader.loadConfig(filePath);
                        // Check if already added (from another search path)
                        const existingSimulation = simulations.find(s => s.name === config.name);
                        if (!existingSimulation) {
                            simulations.push({
                                name: config.name,
                                category: config.category,
                                description: config.description,
                                path: filePath,
                                tags: config.tags || []
                            });
                        }
                    }
                    catch {
                        // Skip invalid files
                    }
                }
            }
        }
        catch {
            // Directory doesn't exist or can't be read, continue with next search path
        }
    }
    return simulations.sort((a, b) => a.name.localeCompare(b.name));
}
async function selectAndRunSimulation(simulations, options) {
    const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
    const choices = simulations.map(sim => ({
        name: `${chalk_1.default.cyan(sim.name)} ${chalk_1.default.gray('(' + sim.category + ')')} - ${sim.description.substring(0, 80)}${sim.description.length > 80 ? '...' : ''}`,
        value: sim.path
    }));
    const { selectedPath } = await inquirer.default.prompt([{
            type: 'list',
            name: 'selectedPath',
            message: 'Select a simulation to run:',
            choices,
            pageSize: 10
        }]);
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
        }]);
    let runOptions = { verbose: options.verbose };
    if (runMode === 'interactive') {
        runOptions.interactive = true;
    }
    else if (runMode === 'detailed') {
        runOptions.verbose = true;
        runOptions.iterations = 2000;
    }
    else if (runMode === 'custom') {
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
                validate: (input) => (input && input > 0) ? true : 'Must be a positive number'
            },
            {
                type: 'confirm',
                name: 'verbose',
                message: 'Verbose output?',
                default: false
            }
        ]);
        runOptions = { ...runOptions, ...customOptions };
    }
    console.log(chalk_1.default.yellow('\n🚀 Starting simulation...\n'));
    // Extract just the filename for the run command
    const simulationName = selectedPath;
    await (0, run_simulation_1.runSimulation)(simulationName, runOptions);
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
//# sourceMappingURL=interactive-selection.js.map