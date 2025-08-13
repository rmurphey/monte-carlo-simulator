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
exports.runSimulation = runSimulation;
const loader_1 = require("../config/loader");
const ConfigurableSimulation_1 = require("../../framework/ConfigurableSimulation");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const chalk_1 = __importDefault(require("chalk"));
const yaml = __importStar(require("js-yaml"));
const package_paths_1 = require("../utils/package-paths");
const session_manager_1 = require("../interactive/session-manager");
const document_generator_1 = require("../utils/document-generator");
// Helper function for parameter name suggestions
function findClosestParameter(input, available) {
    const inputLower = input.toLowerCase();
    return available.find(param => {
        const paramLower = param.toLowerCase();
        return paramLower.includes(inputLower) ||
            inputLower.includes(paramLower) ||
            levenshteinDistance(inputLower, paramLower) <= 2;
    }) || null;
}
function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
    }
    return matrix[str2.length][str1.length];
}
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
            displayConfiguration(parameters, options.iterations || 100);
        }
        const iterations = options.iterations || 100; // Reduced for faster first experience
        // Handle interactive mode with full config editing
        if (options.interactive) {
            const session = new session_manager_1.InteractiveSimulationSession(configPath, options);
            await session.start();
            return;
        }
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
        await displayResults(results, config, options, parameters);
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
async function discoverSimulation(simulationName, _scenario) {
    // First try the package-aware path resolver
    const resolvedPath = await package_paths_1.packagePaths.resolveSimulationPath(simulationName);
    if (resolvedPath) {
        return resolvedPath;
    }
    // Fallback: try direct file path (for absolute paths)
    if (simulationName.includes('/') || simulationName.includes('\\')) {
        try {
            await (0, promises_1.access)(simulationName);
            return simulationName;
        }
        catch {
            // Continue to error handling
        }
    }
    // List available simulations for helpful error
    try {
        const available = await listAvailableSimulations();
        if (available.length > 0) {
            throw new Error(`Simulation '${simulationName}' not found.\n\nAvailable simulations:\n${available.map(s => `  - ${s}`).join('\n')}`);
        }
        else {
            throw new Error(`Simulation '${simulationName}' not found. No simulations found in search paths.`);
        }
    }
    catch (error) {
        // If the error is our intentional "not found" error, re-throw it
        if (error instanceof Error && error.message.includes('Available simulations:')) {
            throw error;
        }
        // Otherwise it's a filesystem error, use fallback message
        throw new Error(`Simulation '${simulationName}' not found and unable to list available simulations.`);
    }
}
async function listAvailableSimulations() {
    const simulations = [];
    const searchPaths = package_paths_1.packagePaths.getSimulationSearchPaths();
    for (const searchPath of searchPaths) {
        try {
            const entries = await (0, promises_1.readdir)(searchPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    // Check if directory has a main simulation file
                    const mainFile = (0, path_1.join)(searchPath, entry.name, `${entry.name}.yaml`);
                    try {
                        await (0, promises_1.access)(mainFile);
                        if (!simulations.includes(entry.name)) {
                            simulations.push(entry.name);
                        }
                    }
                    catch {
                        // No main file, skip
                    }
                }
                else if (entry.name.endsWith('.yaml')) {
                    // Individual YAML file
                    const name = (0, path_1.basename)(entry.name, '.yaml');
                    if (!simulations.includes(name)) {
                        simulations.push(name);
                    }
                }
            }
        }
        catch {
            // Directory doesn't exist or can't be read, continue with next search path
        }
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
            const content = await (0, promises_1.readFile)(options.params, 'utf8');
            let customConfig;
            // Try parsing as JSON first (common case for parameter files)
            try {
                customConfig = JSON.parse(content);
            }
            catch {
                // If JSON fails, try YAML
                customConfig = yaml.load(content);
            }
            if (!customConfig || typeof customConfig !== 'object') {
                throw new Error('Parameter file must contain a valid object');
            }
            // Parameter files support two formats:
            // 1. Full simulation config with parameters array: { parameters: [{ key: "foo", default: 123 }] }
            // 2. Simple parameter object: { "foo": 123, "bar": "value" }
            // 
            // For format 1, we extract parameter defaults from the parameters array
            // For format 2, we use the object directly as key-value parameter overrides
            const customParams = customConfig.parameters
                ? customConfig.parameters.reduce((acc, param) => {
                    if (param.key && param.default !== undefined) {
                        acc[param.key] = param.default;
                    }
                    return acc;
                }, {})
                : customConfig;
            Object.assign(parameters, customParams);
        }
        catch (error) {
            throw new Error(`Failed to load parameter file '${options.params}': ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // 3. Apply --set parameter overrides
    if (options.set) {
        for (const setParam of options.set) {
            const [key, value] = setParam.split('=', 2);
            if (!key || value === undefined) {
                throw new Error(`Invalid --set format: '${setParam}'. Use --set paramName=value`);
            }
            // Check if this is a valid parameter for the simulation
            const paramDef = config.parameters.find((p) => p.key === key);
            if (!paramDef) {
                const availableParams = config.parameters.map((p) => `  • ${chalk_1.default.cyan(p.key)} - ${p.description || p.label}${p.type ? ` (${p.type})` : ''}`).join('\n');
                // Try to suggest closest match
                const suggestion = findClosestParameter(key, config.parameters.map((p) => p.key));
                const suggestionText = suggestion ? `\n\n💡 Did you mean '${chalk_1.default.yellow(suggestion)}'?` : '';
                throw new Error(`❌ Unknown parameter '${chalk_1.default.red(key)}' for simulation '${chalk_1.default.blue(config.name)}'.${suggestionText}

📋 Available parameters:
${availableParams}

🔍 Get detailed info: ${chalk_1.default.dim(`npm run cli -- run ${config.name.toLowerCase().replace(/\s+/g, '-')} --list-params`)}`);
            }
            // Convert value to appropriate type
            let convertedValue = value;
            if (paramDef.type === 'number') {
                convertedValue = Number(value);
                if (isNaN(convertedValue)) {
                    throw new Error(`Parameter '${key}' must be a number, got: ${value}`);
                }
                // Check min/max constraints
                if (paramDef.min !== undefined && convertedValue < paramDef.min) {
                    throw new Error(`Parameter '${key}' value ${convertedValue} is below minimum ${paramDef.min}`);
                }
                if (paramDef.max !== undefined && convertedValue > paramDef.max) {
                    throw new Error(`Parameter '${key}' value ${convertedValue} is above maximum ${paramDef.max}`);
                }
            }
            else if (paramDef.type === 'boolean') {
                convertedValue = value === 'true' || value === 'yes' || value === '1';
            }
            parameters[key] = convertedValue;
        }
    }
    // 4. Apply any additional command line parameter overrides (legacy support)
    for (const [key, value] of Object.entries(options)) {
        // Skip known CLI options
        if (['scenario', 'params', 'iterations', 'output', 'format', 'verbose', 'quiet', 'compare', 'set', 'listParams', 'interactive'].includes(key)) {
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
                // Check min/max constraints
                if (paramDef.min !== undefined && convertedValue < paramDef.min) {
                    throw new Error(`Parameter '${key}' value ${convertedValue} is below minimum ${paramDef.min}`);
                }
                if (paramDef.max !== undefined && convertedValue > paramDef.max) {
                    throw new Error(`Parameter '${key}' value ${convertedValue} is above maximum ${paramDef.max}`);
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
async function displayResults(results, config, options, parameters) {
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
    if (format === 'document') {
        const document = document_generator_1.documentGenerator.generateAnalysisDocument(results, config, parameters || {}, {
            includeCharts: true,
            includeRawData: false,
            includeRecommendations: true
        });
        console.log(document);
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
    // Add business interpretation
    console.log(chalk_1.default.blue.bold('\n💡 BUSINESS INTERPRETATION'));
    Object.entries(results.summary).forEach(([key, stats]) => {
        const mean = stats.mean;
        const stdDev = stats.standardDeviation;
        if (key === 'roiPercentage' || key.toLowerCase().includes('roi')) {
            console.log(`${chalk_1.default.cyan('ROI Analysis')}: ${mean?.toFixed(1)}% annual return`);
            console.log(`  → 68% confidence range: ${(mean - stdDev)?.toFixed(1)}% to ${(mean + stdDev)?.toFixed(1)}%`);
            if (mean > 15)
                console.log(`  → 📈 Strong ROI - significantly above market average (7-10%)`);
            else if (mean > 7)
                console.log(`  → ✅ Good ROI - above market average`);
            else if (mean > 0)
                console.log(`  → ⚠️ Modest ROI - below market average, consider alternatives`);
            else
                console.log(`  → ❌ Negative ROI - investment likely to lose money`);
        }
        if (key === 'paybackPeriod' || key.toLowerCase().includes('payback')) {
            const months = Math.round(mean);
            console.log(`${chalk_1.default.cyan('Payback Analysis')}: ~${months} months to recover investment`);
            if (months <= 12)
                console.log(`  → 🚀 Fast payback - excellent cash flow impact`);
            else if (months <= 24)
                console.log(`  → ✅ Reasonable payback - good investment timeline`);
            else if (months <= 36)
                console.log(`  → ⚠️ Slow payback - consider cash flow impact`);
            else
                console.log(`  → ❌ Very slow payback - high risk investment`);
        }
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
    let content;
    if (options.format === 'csv') {
        content = convertToCSV(results.results);
    }
    else if (options.format === 'document') {
        content = document_generator_1.documentGenerator.generateAnalysisDocument(results, config, parameters, {
            includeCharts: true,
            includeRawData: true,
            includeRecommendations: true
        });
    }
    else {
        content = JSON.stringify(outputData, null, 2);
    }
    await (0, promises_1.writeFile)(options.output, content, 'utf8');
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
    const iterations = options.iterations || 100;
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
    await (0, promises_1.writeFile)(options.output, content, 'utf8');
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