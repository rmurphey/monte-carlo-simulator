#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const create_simulation_1 = require("./commands/create-simulation");
const list_simulations_1 = require("./commands/list-simulations");
const validate_simulation_1 = require("./commands/validate-simulation");
const run_simulation_1 = require("./commands/run-simulation");
// Helper function for collecting repeatable --set options
function collect(value, previous) {
    return previous.concat([value]);
}
const program = new commander_1.Command();
program
    .name('monte-carlo-cli')
    .description('CLI tools for Monte Carlo Simulation Framework')
    .version('1.0.0')
    .addHelpText('before', `
🎯 Monte Carlo Business Decision Framework - Examples-First Approach

Quick Start Workflow:
  1. npm run cli list                    # Discover 5+ working simulations
  2. npm run cli -- run <simulation-id> # Run with business insights
  3. npm run cli -- run <id> --set param=value  # Customize parameters

Popular Simulations:
  • simple-roi-analysis - Basic investment ROI (3 parameters, ~3 seconds)
  • technology-investment - Tech adoption analysis (4 parameters)  
  • marketing-campaign-roi - Marketing spend optimization (9 parameters)

Examples:
  npm run cli list
  npm run cli -- run simple-roi-analysis --set initialInvestment=250000
  npm run cli -- run simple-roi-analysis --list-params
`);
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
    .action(create_simulation_1.createSimulation);
program
    .command('list')
    .description('List existing simulations')
    .option('-c, --category <category>', 'filter by category')
    .option('-f, --format <format>', 'output format (table|json)', 'table')
    .action(list_simulations_1.listSimulations);
program
    .command('interactive')
    .alias('i')
    .description('Interactively select and run simulations')
    .option('-v, --verbose', 'show detailed output')
    .action(async (options) => {
    const { runInteractiveSelection } = await Promise.resolve().then(() => __importStar(require('./commands/interactive-selection')));
    await runInteractiveSelection(options);
});
program
    .command('validate')
    .description('Validate a simulation file')
    .argument('<file>', 'path to simulation file')
    .option('-v, --verbose', 'verbose output')
    .action(validate_simulation_1.validateSimulation);
// Removed studio commands - using examples-first approach
// Users should copy from examples/simulations/ directory instead
program
    .command('run')
    .description('Run a Monte Carlo simulation')
    .argument('<simulation>', 'simulation name or path')
    .option('-s, --scenario <scenario>', 'scenario to run (conservative, neutral, aggressive)')
    .option('-c, --compare <scenarios>', 'compare multiple scenarios (comma-separated)')
    .option('-p, --params <file>', 'custom parameter file (JSON/YAML)')
    .option('-i, --iterations <number>', 'number of iterations', '100')
    .option('-o, --output <file>', 'save results to file')
    .option('-f, --format <format>', 'output format (table, json, csv, document, quiet)', 'table')
    .option('-v, --verbose', 'show detailed output')
    .option('-q, --quiet', 'minimal output')
    .option('--interactive', 'launch interactive config editing session with full YAML editor')
    .option('--list-params', 'list available parameters for the simulation and exit')
    .option('--set <param=value>', 'set parameter value (repeatable)', collect, [])
    .addHelpText('after', `
Parameter Override Examples:
  Single parameter:       --set initialInvestment=300000
  Multiple parameters:    --set initialInvestment=300000 --set affectedEmployees=75
  Parameter file:         --params custom-scenario.json
  Combined approach:      --params base.json --set productivityGain=25
  
Quick Examples:
  Basic run:             run ai-investment-roi
  Override investment:   run ai-investment-roi --set initialInvestment=500000
  Test small team:       run ai-investment-roi --set affectedEmployees=10 --iterations 500
  Compare scenarios:     run ai-investment-roi --compare conservative,aggressive
  Interactive editing:   run simple-roi-analysis --interactive
  
Interactive Mode Commands:
  [r] Run simulation     [c] Edit config        [s] Save changes
  [e] Export results     [h] Help              [q] Quit
  
  Config Editor:
  [e] Edit full YAML     [t] Test config       [u] Undo changes
  
Use --list-params to see all available parameters for any simulation`)
    .action(async (simulation, options) => {
    // Handle --list-params option
    if (options.listParams) {
        const { listSimulationParameters } = await Promise.resolve().then(() => __importStar(require('./commands/list-simulation-parameters')));
        await listSimulationParameters(simulation);
        return;
    }
    // Convert iterations to number
    if (options.iterations) {
        options.iterations = parseInt(options.iterations, 10);
        if (isNaN(options.iterations)) {
            console.error('❌ Iterations must be a number');
            process.exit(1);
        }
    }
    await (0, run_simulation_1.runSimulation)(simulation, options);
});
// Parse command line arguments
program.parse();
//# sourceMappingURL=index.js.map