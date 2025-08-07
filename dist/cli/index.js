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
const program = new commander_1.Command();
program
    .name('monte-carlo-cli')
    .description('CLI tools for Monte Carlo Simulation Framework')
    .version('1.0.0');
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
program
    .command('studio')
    .description('Interactive simulation studio for guided creation')
    .addCommand(new commander_1.Command('define')
    .description('Create simulations with guided assistance')
    .option('-q, --quick-start', 'quick start with business templates')
    .option('-t, --template <template>', 'start from specific template')
    .option('-o, --output <file>', 'output file path')
    .option('-a, --agent-mode', 'agent-optimized creation workflow')
    .option('-v, --verbose', 'detailed progress information')
    .option('--no-interactive', 'skip interactive test during creation')
    .action(async (options) => {
    try {
        const { InteractiveDefinitionStudio } = await Promise.resolve().then(() => __importStar(require('./interactive/definition-studio')));
        const studio = new InteractiveDefinitionStudio();
        await studio.createSimulation(options);
    }
    catch (error) {
        console.error('❌ Studio command failed:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}))
    .addCommand(new commander_1.Command('generate')
    .description('Generate simulation from natural language description')
    .argument('<query>', 'natural language description of desired simulation')
    .option('-o, --output <file>', 'output YAML file path')
    .option('-v, --verbose', 'detailed generation information')
    .option('--validate', 'enable real-time validation feedback')
    .option('--test', 'run simulation with generated YAML')
    .action(async (query, options) => {
    try {
        const { generateFromNaturalLanguage } = await Promise.resolve().then(() => __importStar(require('./interactive/definition-studio')));
        const yamlContent = await generateFromNaturalLanguage(query, {
            validate: options.validate || options.verbose
        });
        if (options.output) {
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            await fs.writeFile(options.output, yamlContent);
            console.log(`✅ Generated simulation saved to: ${options.output}`);
        }
        else {
            console.log('Generated YAML Configuration:');
            console.log('─'.repeat(50));
            console.log(yamlContent);
        }
        if (options.test) {
            console.log('\n🧪 Running Quick Test...\n');
            // Write to temp file and run existing simulation runner
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            const path = await Promise.resolve().then(() => __importStar(require('path')));
            const os = await Promise.resolve().then(() => __importStar(require('os')));
            const tempFile = path.join(os.tmpdir(), `test-${Date.now()}.yaml`);
            await fs.writeFile(tempFile, yamlContent);
            try {
                // Use existing run-simulation command
                const { runSimulation } = await Promise.resolve().then(() => __importStar(require('./commands/run-simulation')));
                await runSimulation(tempFile, { iterations: 100 });
            }
            finally {
                // Clean up temp file
                try {
                    await fs.unlink(tempFile);
                }
                catch (cleanupError) {
                    // Ignore cleanup errors
                }
            }
        }
        if (options.verbose) {
            console.log('\n🤖 Agent Analysis Complete');
        }
    }
    catch (error) {
        console.error('❌ Generation failed:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}));
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