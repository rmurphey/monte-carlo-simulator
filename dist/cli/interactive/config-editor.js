"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractiveConfigEditor = void 0;
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
class InteractiveConfigEditor {
    async editFullConfig(configPath) {
        const editor = process.env.EDITOR || process.env.VISUAL || 'nano';
        console.log(chalk_1.default.blue(`📝 Opening in ${editor}...`));
        console.log(chalk_1.default.gray(`File: ${configPath}`));
        console.log(chalk_1.default.gray('Save and exit to continue'));
        console.log();
        return new Promise((resolve) => {
            const child = (0, child_process_1.spawn)(editor, [configPath], {
                stdio: 'inherit',
                shell: true
            });
            child.on('exit', (code) => {
                console.log(chalk_1.default.green('✅ Editor closed'));
                resolve(code === 0);
            });
            child.on('error', (error) => {
                console.error(chalk_1.default.red(`❌ Editor error: ${error.message}`));
                resolve(false);
            });
        });
    }
    async editParametersOnly(config) {
        // TODO: Implement guided parameter editing
        console.log(chalk_1.default.yellow('Parameter-only editing coming in next phase'));
        return config;
    }
    async editLogicOnly(config) {
        console.log(chalk_1.default.blue('📝 Logic Editor'));
        console.log(chalk_1.default.gray('Current logic:'));
        console.log(chalk_1.default.cyan(config.simulation?.logic || '// No logic defined'));
        console.log();
        console.log(chalk_1.default.yellow('Interactive logic editing coming in next phase'));
        console.log(chalk_1.default.gray('For now, use [e] Edit full YAML to modify logic'));
        return config;
    }
    async addParameter(config) {
        // TODO: Implement parameter addition wizard
        console.log(chalk_1.default.yellow('Add parameter wizard coming in next phase'));
        return config;
    }
    async deleteParameter(config) {
        // TODO: Implement parameter deletion
        console.log(chalk_1.default.yellow('Delete parameter feature coming in next phase'));
        return config;
    }
    async validateConfig(config) {
        const errors = [];
        const warnings = [];
        try {
            // Basic structure validation
            if (!config.name || !config.description) {
                errors.push('Missing required fields: name or description');
            }
            if (!config.parameters || config.parameters.length === 0) {
                warnings.push('No parameters defined');
            }
            if (!config.outputs || config.outputs.length === 0) {
                warnings.push('No outputs defined');
            }
            if (!config.simulation?.logic) {
                errors.push('No simulation logic defined');
            }
            // Validate parameter references in logic
            if (config.simulation?.logic) {
                const logic = config.simulation.logic;
                const parameterKeys = config.parameters?.map(p => p.key) || [];
                // Check if parameters are referenced in logic (basic check)
                parameterKeys.forEach(paramKey => {
                    if (!logic.includes(paramKey)) {
                        warnings.push(`Parameter '${paramKey}' not referenced in simulation logic`);
                    }
                });
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings,
                changes: [] // TODO: Implement change detection
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`],
                warnings,
                changes: []
            };
        }
    }
    async showConfigDiff(oldConfig, newConfig) {
        console.log(chalk_1.default.blue.bold('🔍 Changes detected:'));
        // Basic change detection
        const changes = [];
        if (oldConfig.name !== newConfig.name) {
            changes.push(`• Name: "${oldConfig.name}" → "${newConfig.name}"`);
        }
        if (oldConfig.description !== newConfig.description) {
            changes.push(`• Description changed`);
        }
        if (oldConfig.simulation?.logic !== newConfig.simulation?.logic) {
            changes.push(`• Simulation logic modified`);
        }
        if (oldConfig.parameters?.length !== newConfig.parameters?.length) {
            changes.push(`• Parameter count: ${oldConfig.parameters?.length} → ${newConfig.parameters?.length}`);
        }
        if (oldConfig.outputs?.length !== newConfig.outputs?.length) {
            changes.push(`• Output count: ${oldConfig.outputs?.length} → ${newConfig.outputs?.length}`);
        }
        if (changes.length === 0) {
            console.log(chalk_1.default.gray('No significant changes detected'));
        }
        else {
            changes.forEach(change => console.log(chalk_1.default.white(change)));
        }
        console.log();
    }
    async showValidationResults(validation) {
        console.log(chalk_1.default.blue('⚙️  Validation Results:'));
        if (validation.valid) {
            console.log(chalk_1.default.green('  ✅ Configuration is valid'));
        }
        else {
            console.log(chalk_1.default.red('  ❌ Configuration has errors'));
        }
        if (validation.errors.length > 0) {
            console.log(chalk_1.default.red('  Errors:'));
            validation.errors.forEach(error => {
                console.log(chalk_1.default.red(`    • ${error}`));
            });
        }
        if (validation.warnings.length > 0) {
            console.log(chalk_1.default.yellow('  Warnings:'));
            validation.warnings.forEach(warning => {
                console.log(chalk_1.default.yellow(`    • ${warning}`));
            });
        }
        if (validation.valid) {
            console.log(chalk_1.default.green('  ✅ YAML syntax valid'));
            console.log(chalk_1.default.green('  ✅ Required fields present'));
        }
        console.log();
    }
}
exports.InteractiveConfigEditor = InteractiveConfigEditor;
//# sourceMappingURL=config-editor.js.map