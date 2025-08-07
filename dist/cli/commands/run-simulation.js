"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSimulation = runSimulation;
const loader_1 = require("../config/loader");
const ConfigurableSimulation_1 = require("../../framework/ConfigurableSimulation");
const fs_1 = require("fs");
const path_1 = require("path");
const chalk_1 = __importDefault(require("chalk"));
async function runSimulation(simulationName, options = {}) {
    try {
        console.log(chalk_1.default.cyan.bold(`🎯 Monte Carlo Simulation Runner\n`));
        // Handle comparison mode
        if (options.compare) {
            await runComparisonMode(simulationName, options);
            return;
        }
        // 1. Discover and load simulation configuration
        const configPath = await discoverSimulation(simulationName, options.scenario);
        const loader = new loader_1.ConfigurationLoader();
        const config = await loader.loadConfig(configPath);
        console.log(chalk_1.default.blue.bold(`📊 ${config.name}`));
        if (config.description) {
            console.log(chalk_1.default.gray(`${config.description}\n`));
        }
        // 2. Create simulation first to get ARR-enhanced parameters
        const simulation = new ConfigurableSimulation_1.ConfigurableSimulation(config);
        const enhancedConfig = simulation.getConfiguration();
        // 3. Resolve parameters using enhanced config (scenario -> custom file -> CLI overrides)
        const parameters = await resolveParameters(enhancedConfig, options);
        // 4. Display configuration if verbose
        if (options.verbose && !options.quiet) {
            displayConfiguration(parameters, options.iterations || 1000);
        }
        const iterations = options.iterations || 1000;
        if (!options.quiet) {
            console.log(chalk_1.default.yellow(`🚀 Running ${iterations.toLocaleString()} iterations...`));
        }
        const startTime = Date.now();
        const results = await simulation.runSimulation(parameters, iterations, options.quiet ? undefined : (progress) => {
            // Colorful progress indicator
            if (progress % 0.1 < 0.01) { // Update every 10%
                const percent = Math.round(progress * 100);
                const completed = Math.floor(percent / 10);
                const remaining = 10 - completed;
                const bar = chalk_1.default.green('▓'.repeat(completed)) + chalk_1.default.gray('░'.repeat(remaining));
                process.stdout.write(`\r${bar} ${chalk_1.default.cyan(`${percent}%`)}`);
            }
        });
        const executionTime = ((Date.now() - startTime) / 1000).toFixed(1);
        if (!options.quiet) {
            const bar = chalk_1.default.green('▓'.repeat(10));
            console.log(`\r${bar} ${chalk_1.default.cyan('100%')} | ${chalk_1.default.white(iterations.toLocaleString())}/${chalk_1.default.white(iterations.toLocaleString())} | ${chalk_1.default.magenta(executionTime + 's')}\n`);
        }
        // 5. Display results
        await displayResults(results, config, options);
        // 6. Save output if requested
        if (options.output) {
            await saveResults(results, config, parameters, options);
        }
        if (!options.quiet) {
            console.log(chalk_1.default.green.bold('✅ Simulation completed successfully'));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red.bold('❌ Simulation failed:'), chalk_1.default.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
    }
}
async function discoverSimulation(simulationName, scenario) {
    const examplesDir = 'examples/simulations';
    // Try to find simulation configuration
    const possiblePaths = [
        // Direct file path
        simulationName,
        // Scenario-specific (try this first for scenario-based structure)
        scenario ? (0, path_1.join)(examplesDir, `${simulationName}/${scenario}.yaml`) : null,
        // In examples directory (scenario-based structure)
        (0, path_1.join)(examplesDir, `${simulationName}/${simulationName}.yaml`),
        // Legacy single file structure
        (0, path_1.join)(examplesDir, `${simulationName}.yaml`),
    ].filter(Boolean);
    for (const path of possiblePaths) {
        try {
            await fs_1.promises.access(path);
            return path;
        }
        catch {
            // Continue to next path
        }
    }
    // List available simulations for helpful error
    try {
        const available = await listAvailableSimulations();
        throw new Error(`Simulation '${simulationName}' not found.\n\nAvailable simulations:\n${available.map(s => `  - ${s}`).join('\n')}`);
    }
    catch {
        throw new Error(`Simulation '${simulationName}' not found and unable to list available simulations.`);
    }
}
async function listAvailableSimulations() {
    const examplesDir = 'examples/simulations';
    const simulations = [];
    try {
        const entries = await fs_1.promises.readdir(examplesDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                // Check if directory has a main simulation file
                const mainFile = (0, path_1.join)(examplesDir, entry.name, `${entry.name}.yaml`);
                try {
                    await fs_1.promises.access(mainFile);
                    simulations.push(entry.name);
                }
                catch {
                    // No main file, skip
                }
            }
            else if (entry.name.endsWith('.yaml')) {
                // Individual YAML file
                const name = (0, path_1.basename)(entry.name, '.yaml');
                simulations.push(name);
            }
        }
    }
    catch {
        // Directory doesn't exist or can't be read
    }
    return simulations.sort();
}
async function resolveParameters(config, options) {
    const parameters = {};
    // 1. Start with simulation defaults
    config.parameters.forEach((param) => {
        parameters[param.key] = param.default;
    });
    // 2. Apply custom parameter file if provided
    if (options.params) {
        try {
            const loader = new loader_1.ConfigurationLoader();
            const customConfig = await loader.loadConfig(options.params);
            Object.assign(parameters, customConfig.parameters);
        }
        catch (error) {
            throw new Error(`Failed to load parameter file '${options.params}': ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // 3. Apply command line parameter overrides
    for (const [key, value] of Object.entries(options)) {
        // Skip known CLI options
        if (['scenario', 'params', 'iterations', 'output', 'format', 'verbose', 'quiet', 'compare'].includes(key)) {
            continue;
        }
        // Check if this is a valid parameter for the simulation
        const paramDef = config.parameters.find((p) => p.key === key);
        if (paramDef) {
            // Convert value to appropriate type
            let convertedValue = value;
            if (paramDef.type === 'number') {
                convertedValue = Number(value);
                if (isNaN(convertedValue)) {
                    throw new Error(`Parameter '${key}' must be a number, got: ${value}`);
                }
            }
            else if (paramDef.type === 'boolean') {
                convertedValue = value === 'true' || value === true;
            }
            parameters[key] = convertedValue;
        }
    }
    return parameters;
}
function displayConfiguration(parameters, iterations) {
    console.log(chalk_1.default.blue.bold('📋 CONFIGURATION'));
    console.log(chalk_1.default.gray('━'.repeat(50)));
    Object.entries(parameters).forEach(([key, value]) => {
        const displayValue = typeof value === 'number' ? value.toLocaleString() : String(value);
        console.log(`${chalk_1.default.cyan(key.padEnd(20))}: ${chalk_1.default.white(displayValue)}`);
    });
    console.log(`${chalk_1.default.cyan('iterations'.padEnd(20))}: ${chalk_1.default.white(iterations.toLocaleString())}`);
    console.log('');
}
async function displayResults(results, config, options) {
    if (options.quiet)
        return;
    const format = options.format || 'table';
    if (format === 'json') {
        console.log(JSON.stringify(results, null, 2));
        return;
    }
    if (format === 'csv') {
        // Simple CSV output of raw results
        const headers = Object.keys(results.results[0] || {});
        console.log(headers.join(','));
        results.results.forEach((result) => {
            console.log(headers.map(h => result[h]).join(','));
        });
        return;
    }
    // Default table format
    console.log(chalk_1.default.green.bold('📈 RESULTS SUMMARY'));
    console.log(chalk_1.default.gray('═'.repeat(50)));
    Object.entries(results.summary).forEach(([key, stats]) => {
        const output = config.outputs.find((o) => o.key === key);
        const label = output?.label || key;
        const mean = stats.mean?.toLocaleString() || 'N/A';
        const stdDev = stats.standardDeviation?.toLocaleString() || 'N/A';
        console.log(`${chalk_1.default.cyan(label.padEnd(25))}: ${chalk_1.default.white(mean)} ${chalk_1.default.gray(`(±${stdDev})`)}`);
    });
    if (options.verbose) {
        console.log(chalk_1.default.blue.bold('\n📊 STATISTICAL DISTRIBUTION'));
        console.log(' '.repeat(16) + chalk_1.default.yellow('P10'.padStart(10)) + chalk_1.default.yellow('P50'.padStart(10)) + chalk_1.default.yellow('P90'.padStart(10)));
        Object.entries(results.summary).forEach(([key, stats]) => {
            const output = config.outputs.find((o) => o.key === key);
            const label = (output?.label || key).substring(0, 15);
            const p10 = stats.percentile10?.toLocaleString() || 'N/A';
            const p50 = stats.median?.toLocaleString() || 'N/A';
            const p90 = stats.percentile90?.toLocaleString() || 'N/A';
            console.log(`${chalk_1.default.cyan(label.padEnd(15))} ${chalk_1.default.white(p10.padStart(10))} ${chalk_1.default.white(p50.padStart(10))} ${chalk_1.default.white(p90.padStart(10))}`);
        });
    }
}
async function saveResults(results, config, parameters, options) {
    const outputData = {
        simulation: config.name,
        parameters,
        iterations: results.results.length,
        executionTime: new Date().toISOString(),
        results: options.format === 'json' ? results.results : undefined,
        summary: results.summary
    };
    const content = options.format === 'csv' ?
        convertToCSV(results.results) :
        JSON.stringify(outputData, null, 2);
    await fs_1.promises.writeFile(options.output, content, 'utf8');
    console.log(chalk_1.default.green(`💾 Results saved to ${chalk_1.default.white(options.output)}`));
}
function convertToCSV(results) {
    if (!results.length)
        return '';
    const headers = Object.keys(results[0]);
    const csvContent = [
        headers.join(','),
        ...results.map(result => headers.map(h => result[h]).join(','))
    ].join('\n');
    return csvContent;
}
async function runComparisonMode(simulationName, options) {
    const scenarios = options.compare.split(',').map(s => s.trim());
    const iterations = options.iterations || 1000;
    const results = [];
    console.log(chalk_1.default.magenta.bold(`🔬 Scenario Comparison: ${chalk_1.default.white(simulationName)}`));
    console.log(chalk_1.default.gray(`Comparing scenarios: ${chalk_1.default.white(scenarios.join(', '))}\n`));
    // Run each scenario
    for (const scenario of scenarios) {
        try {
            console.log(chalk_1.default.yellow(`🚀 Running ${chalk_1.default.white(scenario)} scenario (${chalk_1.default.white(iterations.toLocaleString())} iterations)...`));
            const configPath = await discoverSimulation(simulationName, scenario);
            const loader = new loader_1.ConfigurationLoader();
            const config = await loader.loadConfig(configPath);
            const simulation = new ConfigurableSimulation_1.ConfigurableSimulation(config);
            const enhancedConfig = simulation.getConfiguration();
            const parameters = await resolveParameters(enhancedConfig, { ...options, scenario });
            const startTime = Date.now();
            const result = await simulation.runSimulation(parameters, iterations);
            const executionTime = ((Date.now() - startTime) / 1000).toFixed(1);
            results.push({ scenario, config, results: result });
            console.log(chalk_1.default.green(`✅ ${chalk_1.default.white(scenario)} completed (${chalk_1.default.gray(executionTime + 's')})\n`));
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ ${chalk_1.default.white(scenario)} failed: ${chalk_1.default.red(error instanceof Error ? error.message : String(error))}\n`));
        }
    }
    if (results.length === 0) {
        console.error(chalk_1.default.red.bold('❌ No scenarios completed successfully'));
        return;
    }
    // Display comparison results
    await displayComparisonResults(results, options);
    // Save comparison results if requested
    if (options.output) {
        await saveComparisonResults(results, simulationName, options);
    }
    console.log(chalk_1.default.green.bold('✅ Scenario comparison completed successfully'));
}
async function displayComparisonResults(results, options) {
    if (options.quiet)
        return;
    const format = options.format || 'table';
    if (format === 'json') {
        const comparisonData = {
            comparison: results.map(r => ({
                scenario: r.scenario,
                simulation: r.config.name,
                summary: r.results.summary
            }))
        };
        console.log(JSON.stringify(comparisonData, null, 2));
        return;
    }
    // Table format comparison
    console.log(chalk_1.default.magenta.bold('📊 SCENARIO COMPARISON RESULTS'));
    console.log(chalk_1.default.gray('═'.repeat(80)));
    // Get all output keys from first result
    const outputKeys = Object.keys(results[0].results.summary);
    // Display comparison table for each output metric
    for (const outputKey of outputKeys) {
        const output = results[0].config.outputs.find((o) => o.key === outputKey);
        const label = output?.label || outputKey;
        console.log(chalk_1.default.blue.bold(`\n${label}:`));
        console.log(chalk_1.default.gray('─'.repeat(60)));
        console.log(chalk_1.default.yellow('Scenario'.padEnd(15)) + chalk_1.default.yellow('Mean'.padStart(15)) + chalk_1.default.yellow('P10'.padStart(12)) + chalk_1.default.yellow('P90'.padStart(12)));
        console.log(chalk_1.default.gray('─'.repeat(60)));
        results.forEach(({ scenario, results: scenarioResults }) => {
            const stats = scenarioResults.summary[outputKey];
            const mean = stats.mean?.toLocaleString() || 'N/A';
            const p10 = stats.percentile10?.toLocaleString() || 'N/A';
            const p90 = stats.percentile90?.toLocaleString() || 'N/A';
            console.log(chalk_1.default.cyan(scenario.padEnd(15)) +
                chalk_1.default.white(mean.padStart(15)) +
                chalk_1.default.white(p10.padStart(12)) +
                chalk_1.default.white(p90.padStart(12)));
        });
    }
    if (options.verbose) {
        console.log(chalk_1.default.blue.bold('\n📈 DETAILED COMPARISON'));
        console.log(chalk_1.default.gray('═'.repeat(80)));
        results.forEach(({ scenario, config, results: scenarioResults }, index) => {
            console.log(chalk_1.default.magenta.bold(`\n${index + 1}. ${scenario.toUpperCase()} SCENARIO`));
            console.log(chalk_1.default.gray(`   ${config.description}`));
            console.log(chalk_1.default.gray('   ' + '─'.repeat(50)));
            Object.entries(scenarioResults.summary).forEach(([key, stats]) => {
                const output = config.outputs.find((o) => o.key === key);
                const label = output?.label || key;
                const mean = stats.mean?.toLocaleString() || 'N/A';
                const stdDev = stats.standardDeviation?.toLocaleString() || 'N/A';
                console.log(`   ${chalk_1.default.cyan(label.padEnd(25))}: ${chalk_1.default.white(mean)} ${chalk_1.default.gray(`(±${stdDev})`)}`);
            });
        });
    }
}
async function saveComparisonResults(results, simulationName, options) {
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
    };
    const content = options.format === 'csv' ?
        convertComparisonToCSV(results) :
        JSON.stringify(comparisonData, null, 2);
    await fs_1.promises.writeFile(options.output, content, 'utf8');
    console.log(chalk_1.default.green(`💾 Comparison results saved to ${chalk_1.default.white(options.output)}`));
}
function convertComparisonToCSV(results) {
    const headers = ['scenario', 'metric', 'mean', 'median', 'std_dev', 'p10', 'p90'];
    const rows = [headers.join(',')];
    results.forEach(({ scenario, results: scenarioResults }) => {
        Object.entries(scenarioResults.summary).forEach(([key, stats]) => {
            rows.push([
                scenario,
                key,
                stats.mean || '',
                stats.median || '',
                stats.standardDeviation || '',
                stats.percentile10 || '',
                stats.percentile90 || ''
            ].join(','));
        });
    });
    return rows.join('\n');
}
//# sourceMappingURL=run-simulation.js.map