"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractiveConfigBuilder = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const loader_1 = require("../config/loader");
const ConfigurableSimulation_1 = require("../../framework/ConfigurableSimulation");
class InteractiveConfigBuilder {
    loader = new loader_1.ConfigurationLoader();
    async buildConfiguration() {
        console.log('🚀 Monte Carlo Simulation Configuration Builder\n');
        console.log('💡 Tip: You can also copy and modify examples from examples/simulations/ directory\n');
        // Build from scratch - examples-first approach
        return await this.buildFromScratch();
    }
    async buildFromScratch() {
        console.log('🛠️  Building simulation from scratch...\n');
        // Basic information
        const basicInfo = await this.promptBasicInfo();
        // Parameters
        const parameters = await this.promptParameters();
        // Outputs  
        const outputs = await this.promptOutputs();
        // Simulation logic
        const logic = await this.promptSimulationLogic(parameters, outputs);
        // Optional: Parameter groups
        const groups = await this.promptParameterGroups(parameters);
        const config = {
            name: basicInfo.name,
            category: basicInfo.category,
            description: basicInfo.description,
            version: '1.0.0',
            tags: basicInfo.tags,
            parameters,
            outputs,
            simulation: { logic },
            ...(groups.length > 0 && { groups })
        };
        return config;
    }
    // Removed template usage prompting - using examples-first approach
    // Removed template selection - using examples-first approach
    // Removed template search - using examples-first approach
    // Removed template filtering - using examples-first approach
    // Removed template guidance display - using examples-first approach
    // Removed template browsing - using examples-first approach
    // Removed template customization - using examples-first approach
    // Removed customizeBasicInfo - using examples-first approach
    // Removed template-specific parameter customization - using examples-first approach
    // Removed template-specific all parameter customization - using examples-first approach
    // Removed customizeOutputs - using examples-first approach
    async promptBasicInfo() {
        const answers = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Simulation name:',
                validate: (input) => input.trim().length > 0 || 'Name is required'
            },
            {
                type: 'list',
                name: 'category',
                message: 'Category:',
                choices: ['Finance', 'Business', 'Healthcare', 'Technology', 'Manufacturing', 'Research', 'Other'],
                default: 'Finance'
            },
            {
                type: 'input',
                name: 'description',
                message: 'Description:',
                validate: (input) => input.trim().length > 0 || 'Description is required'
            },
            {
                type: 'input',
                name: 'tags',
                message: 'Tags (comma-separated):',
                filter: (input) => input ? input.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
            }
        ]);
        return answers;
    }
    async promptParameters() {
        const parameters = [];
        console.log('\n📊 Configure Input Parameters');
        console.log('Parameters define the inputs users can adjust when running your simulation.\n');
        let addMore = true;
        while (addMore) {
            const param = await this.promptSingleParameter();
            parameters.push(param);
            const { continueAdding } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'continueAdding',
                    message: 'Add another parameter?',
                    default: true
                }
            ]);
            addMore = continueAdding;
        }
        return parameters;
    }
    async promptSingleParameter(existingParam, _businessTip) {
        // Removed business tip display - using examples-first approach
        const basic = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'key',
                message: 'Parameter key (variable name):',
                default: existingParam?.key,
                validate: (input) => {
                    if (!input.trim())
                        return 'Key is required';
                    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(input))
                        return 'Key must be a valid variable name';
                    return true;
                }
            },
            {
                type: 'input',
                name: 'label',
                message: 'Display label:',
                default: existingParam?.label,
                validate: (input) => input.trim().length > 0 || 'Label is required'
            },
            {
                type: 'list',
                name: 'type',
                message: 'Parameter type:',
                default: existingParam?.type,
                choices: [
                    { name: 'Number', value: 'number' },
                    { name: 'Boolean (True/False)', value: 'boolean' },
                    { name: 'Text', value: 'string' },
                    { name: 'Select from options', value: 'select' }
                ]
            },
            {
                type: 'input',
                name: 'description',
                message: 'Description:',
                default: existingParam?.description,
                validate: (input) => input.trim().length > 0 || 'Description is required'
            }
        ]);
        let additional = {};
        if (basic.type === 'number') {
            const defaultVal = await inquirer_1.default.prompt({
                type: 'number',
                name: 'default',
                message: 'Default value:',
                default: existingParam?.type === 'number' ? existingParam.default : undefined,
                validate: (input) => input !== undefined && !isNaN(input) || 'Must be a valid number'
            });
            const minVal = await inquirer_1.default.prompt({
                type: 'number',
                name: 'min',
                message: 'Minimum value (optional):',
                default: existingParam?.type === 'number' ? existingParam.min : undefined
            });
            const maxVal = await inquirer_1.default.prompt({
                type: 'number',
                name: 'max',
                message: 'Maximum value (optional):',
                default: existingParam?.type === 'number' ? existingParam.max : undefined
            });
            const stepVal = await inquirer_1.default.prompt({
                type: 'number',
                name: 'step',
                message: 'Step size (optional):',
                default: existingParam?.type === 'number' ? existingParam.step : undefined
            });
            additional = {
                default: defaultVal.default,
                min: minVal.min,
                max: maxVal.max,
                step: stepVal.step
            };
        }
        else if (basic.type === 'boolean') {
            additional = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'default',
                    message: 'Default value:',
                    default: existingParam?.type === 'boolean' ? existingParam.default : false
                }
            ]);
        }
        else if (basic.type === 'string') {
            additional = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'default',
                    message: 'Default value:',
                    default: existingParam?.type === 'string' ? existingParam.default : ''
                }
            ]);
        }
        else if (basic.type === 'select') {
            const { options } = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'options',
                    message: 'Options (comma-separated):',
                    default: existingParam?.type === 'select' && existingParam.options ? existingParam.options.join(', ') : '',
                    validate: (input) => input.trim().length > 0 || 'At least one option is required',
                    filter: (input) => input.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0)
                }
            ]);
            const { defaultOption } = await inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'defaultOption',
                    message: 'Default option:',
                    choices: options,
                    default: existingParam?.type === 'select' ? existingParam.default : options[0]
                }
            ]);
            additional = { options, default: defaultOption };
        }
        return { ...basic, ...additional };
    }
    async promptOutputs() {
        const outputs = [];
        console.log('\n📈 Configure Output Metrics');
        console.log('Outputs define the metrics your simulation will calculate and track.\n');
        let addMore = true;
        while (addMore) {
            const output = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'key',
                    message: 'Output key (variable name):',
                    validate: (input) => {
                        if (!input.trim())
                            return 'Key is required';
                        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(input))
                            return 'Key must be a valid variable name';
                        return true;
                    }
                },
                {
                    type: 'input',
                    name: 'label',
                    message: 'Display label:',
                    validate: (input) => input.trim().length > 0 || 'Label is required'
                },
                {
                    type: 'input',
                    name: 'description',
                    message: 'Description:',
                    validate: (input) => input.trim().length > 0 || 'Description is required'
                }
            ]);
            outputs.push(output);
            const { continueAdding } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'continueAdding',
                    message: 'Add another output?',
                    default: false
                }
            ]);
            addMore = continueAdding;
        }
        return outputs;
    }
    async promptSimulationLogic(parameters, outputs) {
        console.log('\n⚡ Simulation Logic');
        console.log('Write JavaScript code that uses your parameters to calculate the outputs.');
        console.log('Available functions: random(), sqrt(), pow(), log(), exp(), abs(), min(), max(), floor(), ceil(), round()');
        console.log(`Available parameters: ${parameters.map(p => p.key).join(', ')}`);
        console.log(`Required outputs: return { ${outputs.map(o => o.key).join(', ')} }\n`);
        const { logic } = await inquirer_1.default.prompt([
            {
                type: 'editor',
                name: 'logic',
                message: 'Simulation logic (opens in your default editor):',
                default: this.generateDefaultLogic(parameters, outputs),
                validate: (input) => {
                    if (!input.trim())
                        return 'Simulation logic is required';
                    // Basic validation - check if it returns something
                    if (!input.includes('return')) {
                        return 'Logic must include a return statement';
                    }
                    return true;
                }
            }
        ]);
        return logic;
    }
    generateDefaultLogic(parameters, outputs) {
        const paramUsage = parameters.map(p => `  // ${p.description}\n  // ${p.key} = ${p.default}`).join('\n');
        // Generate meaningful default calculations based on parameter/output patterns
        const outputCalculations = outputs.map((output, index) => {
            const param = parameters[index] || parameters[0];
            if (!param)
                return `${output.key}: 100 * (0.8 + random() * 0.4)`;
            // Create realistic relationships between parameters and outputs
            if (output.key.toLowerCase().includes('roi') || output.key.toLowerCase().includes('return')) {
                return `${output.key}: Math.round(((${param.key} * (0.8 + random() * 0.4)) / ${param.key}) * 100 * 10) / 10`;
            }
            else if (output.key.toLowerCase().includes('cost')) {
                return `${output.key}: Math.round(${param.key} * (1.1 + random() * 0.2))`;
            }
            else if (output.key.toLowerCase().includes('time') || output.key.toLowerCase().includes('month') || output.key.toLowerCase().includes('period')) {
                return `${output.key}: Math.round((${param.key} / 1000) * (0.8 + random() * 0.4) * 10) / 10`;
            }
            else if (output.key.toLowerCase().includes('percent') || output.key.toLowerCase().includes('%')) {
                return `${output.key}: Math.round((${param.key} / 100) * (0.7 + random() * 0.6) * 10) / 10`;
            }
            else {
                // Generic calculation with uncertainty
                return `${output.key}: Math.round(${param.key} * (0.8 + random() * 0.4) * 10) / 10`;
            }
        }).join(',\n    ');
        return `// Simulation logic - modify these calculations for your specific scenario
${paramUsage}

  // Example calculations with Monte Carlo uncertainty
  // Replace these with your business logic
  
  return {
    ${outputCalculations}
  }`;
    }
    async promptParameterGroups(parameters) {
        if (parameters.length <= 3)
            return [];
        const { addGroups } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'addGroups',
                message: 'Group parameters for better organization?',
                default: false
            }
        ]);
        if (!addGroups)
            return [];
        console.log('\n📁 Parameter Groups');
        console.log('Group related parameters together for better user experience.\n');
        const groups = [];
        const availableParams = [...parameters];
        while (availableParams.length > 0) {
            const groupName = await inquirer_1.default.prompt({
                type: 'input',
                name: 'name',
                message: 'Group name:',
                validate: (input) => input.trim().length > 0 || 'Group name is required'
            });
            const groupDesc = await inquirer_1.default.prompt({
                type: 'input',
                name: 'description',
                message: 'Group description:',
                validate: (input) => input.trim().length > 0 || 'Description is required'
            });
            const groupParams = await inquirer_1.default.prompt({
                type: 'checkbox',
                name: 'parameters',
                message: 'Select parameters for this group:',
                choices: availableParams.map(p => ({ name: `${p.label} (${p.key})`, value: p.key })),
                validate: (input) => input.length > 0 || 'Select at least one parameter'
            });
            const group = {
                name: groupName.name,
                description: groupDesc.description,
                parameters: groupParams.parameters
            };
            groups.push(group);
            // Remove selected parameters from available list
            group.parameters.forEach((paramKey) => {
                const index = availableParams.findIndex(p => p.key === paramKey);
                if (index !== -1)
                    availableParams.splice(index, 1);
            });
            if (availableParams.length === 0)
                break;
            const { continueGrouping } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'continueGrouping',
                    message: `Create another group? (${availableParams.length} parameters remaining)`,
                    default: false
                }
            ]);
            if (!continueGrouping) {
                // Add remaining parameters to a default group
                if (availableParams.length > 0) {
                    groups.push({
                        name: 'Other Settings',
                        description: 'Additional parameters',
                        parameters: availableParams.map(p => p.key)
                    });
                }
                break;
            }
        }
        return groups;
    }
    async testConfiguration(config) {
        console.log('\n🧪 Testing Configuration...');
        try {
            const simulation = new ConfigurableSimulation_1.ConfigurableSimulation(config);
            const validation = simulation.validateConfiguration();
            if (!validation.valid) {
                console.error('❌ Configuration validation failed:');
                validation.errors.forEach(error => console.error(`   ${error}`));
                return false;
            }
            // Test with default parameters
            const defaultParams = {};
            config.parameters.forEach(param => {
                defaultParams[param.key] = param.default;
            });
            const result = simulation.simulateScenario(defaultParams);
            console.log('✅ Configuration test passed!');
            console.log('📊 Sample result:', result);
            return true;
        }
        catch (error) {
            console.error('❌ Configuration test failed:', error instanceof Error ? error.message : String(error));
            return false;
        }
    }
    async saveConfiguration(config) {
        const filename = `${config.name.toLowerCase().replace(/\s+/g, '-')}.yaml`;
        const { confirmSave, customPath } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'confirmSave',
                message: `Save configuration as ${filename}?`,
                default: true
            },
            {
                type: 'input',
                name: 'customPath',
                message: 'Custom file path (optional):',
                when: (answers) => answers.confirmSave,
                default: filename
            }
        ]);
        if (!confirmSave) {
            throw new Error('Save cancelled by user');
        }
        const filePath = customPath || filename;
        await this.loader.saveConfig(filePath, config);
        return filePath;
    }
}
exports.InteractiveConfigBuilder = InteractiveConfigBuilder;
//# sourceMappingURL=config-builder.js.map