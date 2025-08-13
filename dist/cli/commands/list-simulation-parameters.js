"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSimulationParameters = listSimulationParameters;
const loader_1 = require("../config/loader");
const ConfigurableSimulation_1 = require("../../framework/ConfigurableSimulation");
const fs_1 = require("fs");
const path_1 = require("path");
const chalk_1 = __importDefault(require("chalk"));
async function listSimulationParameters(simulationName) {
    try {
        // Discover simulation configuration
        const configPath = await discoverSimulation(simulationName);
        const loader = new loader_1.ConfigurationLoader();
        const config = await loader.loadConfig(configPath);
        // For parameter listing, show original parameters unless business context was explicitly requested
        // This prevents confusion when ARR parameters are auto-injected based on keywords
        const displayConfig = config.businessContext === true ?
            new ConfigurableSimulation_1.ConfigurableSimulation(config).getConfiguration() :
            config;
        console.log(chalk_1.default.cyan.bold(`📋 Parameters for ${displayConfig.name}\n`));
        if (displayConfig.description) {
            console.log(chalk_1.default.gray(`${displayConfig.description}\n`));
        }
        console.log(chalk_1.default.blue.bold('Available Parameters:'));
        console.log(chalk_1.default.gray('═'.repeat(80)));
        displayConfig.parameters.forEach((param) => {
            const name = chalk_1.default.cyan(param.key.padEnd(20));
            const type = chalk_1.default.yellow(`(${param.type})`.padEnd(10));
            const defaultVal = chalk_1.default.white(String(param.default).padEnd(15));
            const description = chalk_1.default.gray(param.description || param.label || '');
            console.log(`${name} ${type} ${chalk_1.default.dim('default:')} ${defaultVal} ${description}`);
            if (param.min !== undefined || param.max !== undefined) {
                const range = `${param.min !== undefined ? param.min : '?'} - ${param.max !== undefined ? param.max : '?'}`;
                console.log(chalk_1.default.dim(`${' '.repeat(20)} ${type} ${chalk_1.default.dim('range:')}   ${chalk_1.default.dim(range)}`));
            }
        });
        console.log(chalk_1.default.blue.bold('\nUsage Examples:'));
        console.log(chalk_1.default.gray('─'.repeat(50)));
        // Generate some example overrides
        const examples = generateParameterExamples(displayConfig);
        examples.forEach(example => {
            console.log(chalk_1.default.green(`  ${example}`));
        });
        console.log(chalk_1.default.blue.bold('\nParameter File Example:'));
        console.log(chalk_1.default.gray('─'.repeat(30)));
        console.log(chalk_1.default.dim('// custom-params.json'));
        const paramFile = generateParameterFileExample(displayConfig);
        console.log(chalk_1.default.white(paramFile));
        console.log('');
        console.log(chalk_1.default.green(`  run ${simulationName} --params custom-params.json`));
    }
    catch (error) {
        console.error(chalk_1.default.red.bold('❌ Failed to list parameters:'), chalk_1.default.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
    }
}
async function discoverSimulation(simulationName) {
    const examplesDir = 'examples/simulations';
    const possiblePaths = [
        simulationName,
        (0, path_1.join)(examplesDir, `${simulationName}/${simulationName}.yaml`),
        (0, path_1.join)(examplesDir, `${simulationName}.yaml`),
    ];
    for (const path of possiblePaths) {
        try {
            await fs_1.promises.access(path);
            return path;
        }
        catch {
            continue;
        }
    }
    throw new Error(`Simulation '${simulationName}' not found`);
}
function generateParameterExamples(config) {
    const examples = [];
    const params = config.parameters.slice(0, 3); // Take first 3 for examples
    if (params.length > 0) {
        // Single parameter override
        const firstParam = params[0];
        let exampleValue = firstParam.default;
        if (firstParam.type === 'number') {
            exampleValue = Math.round(firstParam.default * 1.5);
        }
        examples.push(`run ${config.name?.toLowerCase().replace(/\s+/g, '-') || 'simulation'} --${firstParam.key} ${exampleValue}`);
        // Multiple parameter overrides
        if (params.length > 1) {
            const overrides = params.slice(0, 2).map((p) => {
                let val = p.default;
                if (p.type === 'number')
                    val = Math.round(p.default * 0.8);
                return `--${p.key} ${val}`;
            }).join(' ');
            examples.push(`run ${config.name?.toLowerCase().replace(/\s+/g, '-') || 'simulation'} ${overrides}`);
        }
        // With iterations override
        examples.push(`run ${config.name?.toLowerCase().replace(/\s+/g, '-') || 'simulation'} --${firstParam.key} ${exampleValue} --iterations 5000`);
    }
    return examples;
}
function generateParameterFileExample(config) {
    const example = {};
    config.parameters.slice(0, 4).forEach((param) => {
        let value = param.default;
        if (param.type === 'number') {
            value = Math.round(param.default * 1.2);
        }
        example[param.key] = value;
    });
    return JSON.stringify(example, null, 2);
}
//# sourceMappingURL=list-simulation-parameters.js.map