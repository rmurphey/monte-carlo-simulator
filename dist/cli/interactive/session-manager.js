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
exports.InteractiveSimulationSession = void 0;
const readline = __importStar(require("readline"));
const chalk_1 = __importDefault(require("chalk"));
const loader_1 = require("../config/loader");
const ConfigurableSimulation_1 = require("../../framework/ConfigurableSimulation");
const config_editor_1 = require("./config-editor");
const temp_config_manager_1 = require("./temp-config-manager");
class InteractiveSimulationSession {
    config;
    originalConfigPath;
    tempManager;
    editor;
    results = null;
    configHistory = [];
    rl;
    options;
    simulation;
    constructor(configPath, options) {
        this.originalConfigPath = configPath;
        this.options = options;
        this.tempManager = new temp_config_manager_1.TempConfigManager();
        this.editor = new config_editor_1.InteractiveConfigEditor();
        // Setup readline interface
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    async start() {
        try {
            await this.initialize();
            await this.runInitialSimulation();
            await this.enterMainLoop();
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ Session error: ${error instanceof Error ? error.message : String(error)}`));
        }
        finally {
            await this.cleanup();
        }
    }
    async initialize() {
        // Load configuration
        const loader = new loader_1.ConfigurationLoader();
        this.config = await loader.loadConfig(this.originalConfigPath);
        // Create simulation instance
        this.simulation = new ConfigurableSimulation_1.ConfigurableSimulation(this.config);
        // Add initial config to history
        this.configHistory.push({
            config: { ...this.config },
            timestamp: new Date(),
            description: 'Original configuration'
        });
        console.log(chalk_1.default.blue.bold(`🎯 ${this.config.name} - Interactive Mode`));
        console.log(chalk_1.default.gray(`Config: ${this.originalConfigPath}`));
        console.log();
    }
    async runInitialSimulation() {
        console.log(chalk_1.default.blue('Running initial simulation with current config...'));
        // Get default parameters
        const defaultParams = {};
        this.simulation.getParameterDefinitions().forEach(param => {
            defaultParams[param.key] = param.defaultValue;
        });
        // Run simulation with progress
        const iterations = this.options.iterations || 1000;
        this.results = await this.simulation.runSimulation(defaultParams, iterations, (progress, iteration) => {
            if (iteration % Math.max(1, Math.floor(iterations / 10)) === 0) {
                process.stdout.write(`\r${chalk_1.default.blue('Progress:')} ${Math.round(progress * 100)}%`);
            }
        });
        console.log(`\r${chalk_1.default.green('✅ Completed')} ${iterations} iterations in ${(this.results.duration / 1000).toFixed(1)}s`);
        this.displayResultsSummary();
    }
    displayResultsSummary() {
        if (!this.results)
            return;
        console.log();
        console.log(chalk_1.default.blue.bold('📊 Results Summary:'));
        Object.entries(this.results.summary).forEach(([key, stats]) => {
            if (typeof stats === 'object' && stats.mean !== undefined) {
                const mean = typeof stats.mean === 'number' ? stats.mean.toFixed(1) : stats.mean;
                const p90 = typeof stats.percentile90 === 'number' ? stats.percentile90.toFixed(1) : stats.percentile90;
                console.log(chalk_1.default.white(`${key}: ${chalk_1.default.cyan(mean)} (90th percentile: ${chalk_1.default.cyan(p90)})`));
            }
        });
        console.log();
    }
    async enterMainLoop() {
        // Interactive menu loop: while(true) is correct pattern for CLI applications
        // - Blocks on await this.getCommand() (no CPU/memory consumption)
        // - User explicitly chooses "q" to break loop
        // - Standard pattern used by npm init, create-react-app, etc.
        // eslint-disable-next-line no-constant-condition
        while (true) {
            this.displayMainMenu();
            const command = await this.getCommand();
            if (command === 'q') {
                break;
            }
            await this.handleMainCommand(command);
        }
    }
    displayMainMenu() {
        console.log(chalk_1.default.blue.bold('🎮 Interactive Commands:'));
        console.log(`  ${chalk_1.default.cyan('[r]')} Run again         ${chalk_1.default.cyan('[p]')} Edit parameters    ${chalk_1.default.cyan('[c]')} Edit config`);
        console.log(`  ${chalk_1.default.cyan('[s]')} Save changes      ${chalk_1.default.cyan('[e]')} Export results     ${chalk_1.default.cyan('[h]')} Help`);
        console.log(`  ${chalk_1.default.cyan('[q]')} Quit`);
        console.log();
        console.log(chalk_1.default.gray('Quick Actions: Ctrl+R (re-run) | Ctrl+S (save) | Ctrl+T (test run)'));
        process.stdout.write('> ');
    }
    async getCommand() {
        return new Promise((resolve) => {
            this.rl.question('', (answer) => {
                resolve(answer.trim().toLowerCase());
            });
        });
    }
    async handleMainCommand(command) {
        try {
            switch (command) {
                case 'r':
                    await this.runSimulation();
                    break;
                case 'p':
                    await this.quickParameterEdit();
                    break;
                case 'c':
                    await this.enterConfigEditMode();
                    break;
                case 's':
                    await this.saveConfig();
                    break;
                case 'e':
                    await this.exportResults();
                    break;
                case 'h':
                    this.showHelp();
                    break;
                default:
                    console.log(chalk_1.default.yellow(`Unknown command: ${command}. Type 'h' for help.`));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ Command error: ${error instanceof Error ? error.message : String(error)}`));
        }
        console.log();
    }
    async runSimulation() {
        console.log(chalk_1.default.blue('🔄 Running simulation...'));
        // Get current parameters
        const defaultParams = {};
        this.simulation.getParameterDefinitions().forEach(param => {
            defaultParams[param.key] = param.defaultValue;
        });
        const iterations = this.options.iterations || 1000;
        this.results = await this.simulation.runSimulation(defaultParams, iterations);
        console.log(chalk_1.default.green(`✅ Completed ${iterations} iterations in ${(this.results.duration / 1000).toFixed(1)}s`));
        this.displayResultsSummary();
    }
    async quickParameterEdit() {
        console.log(chalk_1.default.blue('📝 Quick Parameter Edit'));
        console.log(chalk_1.default.gray('(Full parameter editing coming in next phase)'));
        console.log(chalk_1.default.yellow('Use [c] Edit config for full configuration editing'));
    }
    async enterConfigEditMode() {
        console.log(chalk_1.default.blue.bold('📝 Configuration Editor'));
        console.log();
        this.displayConfigSummary();
        // Config editing loop: while(true) is correct pattern for sub-menu navigation
        // - Blocks on await this.getCommand() (no CPU/memory consumption)
        // - User explicitly chooses "b" (back) to break loop
        // eslint-disable-next-line no-constant-condition
        while (true) {
            this.displayConfigMenu();
            const command = await this.getCommand();
            if (command === 'b') {
                break;
            }
            await this.handleConfigCommand(command);
        }
    }
    displayConfigSummary() {
        const paramCount = this.config.parameters?.length || 0;
        const outputCount = this.config.outputs?.length || 0;
        const logicLines = this.config.simulation?.logic?.split('\n').length || 0;
        const lastModified = this.configHistory[this.configHistory.length - 1]?.description || 'Original config';
        console.log('┌─ Current Config ─────────────────────────────────────┐');
        console.log(`│ Name: ${this.config.name.padEnd(42)} │`);
        console.log(`│ Parameters: ${paramCount}    Outputs: ${outputCount}    Logic: ${logicLines} lines${' '.repeat(Math.max(0, 7 - logicLines.toString().length))} │`);
        console.log(`│ Last Modified: ${lastModified.padEnd(34)} │`);
        console.log('└─────────────────────────────────────────────────────┘');
        console.log();
    }
    displayConfigMenu() {
        console.log(chalk_1.default.blue('Config Editor Commands:'));
        console.log(`  ${chalk_1.default.cyan('[e]')} Edit full YAML    ${chalk_1.default.cyan('[p]')} Quick param edit   ${chalk_1.default.cyan('[l]')} Edit logic only`);
        console.log(`  ${chalk_1.default.cyan('[a]')} Add parameter     ${chalk_1.default.cyan('[d]')} Delete parameter   ${chalk_1.default.cyan('[o]')} Edit outputs`);
        console.log(`  ${chalk_1.default.cyan('[i]')} Edit basic info   ${chalk_1.default.cyan('[t]')} Test config        ${chalk_1.default.cyan('[u]')} Undo changes`);
        console.log(`  ${chalk_1.default.cyan('[r]')} Run with changes  ${chalk_1.default.cyan('[b]')} Back to main menu`);
        process.stdout.write('> ');
    }
    async handleConfigCommand(command) {
        try {
            switch (command) {
                case 'e':
                    await this.editFullConfig();
                    break;
                case 'l':
                    await this.editLogicOnly();
                    break;
                case 't':
                    await this.testConfig();
                    break;
                case 'r':
                    await this.runSimulation();
                    break;
                case 'u':
                    await this.undoChanges();
                    break;
                case 'p':
                case 'a':
                case 'd':
                case 'o':
                case 'i':
                    console.log(chalk_1.default.yellow(`Command '${command}' coming in next implementation phase`));
                    break;
                default:
                    console.log(chalk_1.default.yellow(`Unknown command: ${command}. Type 'b' to go back.`));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ Config command error: ${error instanceof Error ? error.message : String(error)}`));
        }
        console.log();
    }
    async editFullConfig() {
        const tempPath = await this.tempManager.createTempConfig(this.config);
        const success = await this.editor.editFullConfig(tempPath);
        if (success) {
            const loader = new loader_1.ConfigurationLoader();
            const newConfig = await loader.loadConfig(tempPath);
            await this.updateConfig(newConfig, 'Full YAML edit');
        }
    }
    async editLogicOnly() {
        const updatedConfig = await this.editor.editLogicOnly(this.config);
        await this.updateConfig(updatedConfig, 'Logic-only edit');
    }
    async testConfig() {
        console.log(chalk_1.default.blue('🧪 Testing config with quick run (100 iterations)...'));
        const defaultParams = {};
        this.simulation.getParameterDefinitions().forEach(param => {
            defaultParams[param.key] = param.defaultValue;
        });
        const testResults = await this.simulation.runSimulation(defaultParams, 100);
        console.log(chalk_1.default.green(`✅ Test completed in ${(testResults.duration / 1000).toFixed(1)}s`));
        // Show brief results
        Object.entries(testResults.summary).forEach(([key, stats]) => {
            if (typeof stats === 'object' && stats.mean !== undefined) {
                const mean = typeof stats.mean === 'number' ? stats.mean.toFixed(1) : stats.mean;
                console.log(chalk_1.default.white(`${key}: ${chalk_1.default.cyan(mean)}`));
            }
        });
    }
    async updateConfig(newConfig, description) {
        // Add to history
        this.configHistory.push({
            config: { ...this.config },
            timestamp: new Date(),
            description
        });
        // Update current config
        this.config = newConfig;
        this.simulation = new ConfigurableSimulation_1.ConfigurableSimulation(this.config);
        console.log(chalk_1.default.green(`✅ Config updated: ${description}`));
        // Show changes if possible
        // TODO: Implement change detection in next phase
    }
    async undoChanges() {
        if (this.configHistory.length <= 1) {
            console.log(chalk_1.default.yellow('No changes to undo'));
            return;
        }
        // Remove current state and restore previous
        this.configHistory.pop();
        const previousState = this.configHistory[this.configHistory.length - 1];
        this.config = { ...previousState.config };
        this.simulation = new ConfigurableSimulation_1.ConfigurableSimulation(this.config);
        console.log(chalk_1.default.green(`✅ Reverted to: ${previousState.description}`));
    }
    async saveConfig() {
        await this.tempManager.saveToOriginal(this.originalConfigPath, this.config);
        console.log(chalk_1.default.green(`✅ Saved changes to ${this.originalConfigPath}`));
    }
    async exportResults() {
        if (!this.results) {
            console.log(chalk_1.default.yellow('No results to export. Run simulation first.'));
            return;
        }
        console.log(chalk_1.default.blue('📤 Export functionality coming in next implementation phase'));
        console.log(chalk_1.default.gray('Results available in this.results'));
    }
    showHelp() {
        console.log(chalk_1.default.blue.bold('🎮 Interactive Mode Help'));
        console.log();
        console.log(chalk_1.default.white('Main Commands:'));
        console.log(`  ${chalk_1.default.cyan('r')} - Run simulation again with current configuration`);
        console.log(`  ${chalk_1.default.cyan('p')} - Quick parameter editing (guided prompts)`);
        console.log(`  ${chalk_1.default.cyan('c')} - Full configuration editing mode`);
        console.log(`  ${chalk_1.default.cyan('s')} - Save current configuration to file`);
        console.log(`  ${chalk_1.default.cyan('e')} - Export results (CSV/JSON)`);
        console.log(`  ${chalk_1.default.cyan('h')} - Show this help`);
        console.log(`  ${chalk_1.default.cyan('q')} - Quit interactive mode`);
        console.log();
        console.log(chalk_1.default.white('Quick Actions:'));
        console.log(`  ${chalk_1.default.cyan('Ctrl+R')} - Instant re-run`);
        console.log(`  ${chalk_1.default.cyan('Ctrl+S')} - Quick save`);
        console.log(`  ${chalk_1.default.cyan('Ctrl+T')} - Quick test (100 iterations)`);
        console.log(`  ${chalk_1.default.cyan('Ctrl+C')} - Exit gracefully`);
        console.log();
    }
    setupKeyboardShortcuts() {
        // Handle Ctrl+C for graceful exit
        process.on('SIGINT', async () => {
            console.log(chalk_1.default.yellow('\n🔄 Shutting down gracefully...'));
            await this.cleanup();
            process.exit(0);
        });
        // TODO: Implement other keyboard shortcuts in next phase
        // Ctrl+R, Ctrl+S, Ctrl+T require more complex readline handling
    }
    async cleanup() {
        this.rl.close();
        await this.tempManager.cleanup();
    }
}
exports.InteractiveSimulationSession = InteractiveSimulationSession;
//# sourceMappingURL=session-manager.js.map