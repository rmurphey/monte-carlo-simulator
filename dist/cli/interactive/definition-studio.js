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
exports.AgentOptimizedStudio = exports.RealTimeValidator = exports.GuidedWorkflow = exports.InteractiveDefinitionStudio = void 0;
exports.generateFromIntent = generateFromIntent;
exports.generateFromNaturalLanguage = generateFromNaturalLanguage;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const loader_1 = require("../config/loader");
const ConfigurableSimulation_1 = require("../../framework/ConfigurableSimulation");
const template_library_1 = require("./template-library");
const config_builder_1 = require("./config-builder");
const schema_1 = require("../config/schema");
const yaml_1 = __importDefault(require("yaml"));
/**
 * Interactive Definition Studio - Advanced guided simulation creation
 *
 * Extends the existing config-builder with:
 * - Guided step-by-step workflow
 * - Real-time validation with business context
 * - Agent-optimized creation patterns
 * - Advanced template integration
 * - Progress tracking and navigation
 */
class InteractiveDefinitionStudio {
    configBuilder;
    templateLibrary;
    loader;
    workflow;
    constructor() {
        this.configBuilder = new config_builder_1.InteractiveConfigBuilder();
        this.templateLibrary = new template_library_1.TemplateLibrary();
        this.loader = new loader_1.ConfigurationLoader();
        this.workflow = new GuidedWorkflow();
    }
    /**
     * Main entry point for interactive simulation creation
     */
    async createSimulation(options = {}) {
        console.log(chalk_1.default.cyan.bold('🎨 Interactive Simulation Definition Studio'));
        console.log(chalk_1.default.gray('Create sophisticated Monte Carlo simulations with guided assistance\n'));
        try {
            // Initialize template library
            await this.templateLibrary.loadTemplates();
            // Determine creation method based on options and user preference
            let config;
            if (options.quickStart) {
                config = await this.quickStart();
            }
            else if (options.template) {
                config = await this.customizeFromTemplate(options.template);
            }
            else if (options.agentMode) {
                config = await this.agentOptimizedCreation();
            }
            else {
                config = await this.guidedInteractiveCreation();
            }
            // Validate final configuration
            const validation = await this.validateConfiguration(config);
            if (!validation.valid) {
                console.log(chalk_1.default.red('\n❌ Configuration validation failed:'));
                validation.errors.forEach(error => {
                    console.log(chalk_1.default.red(`   • ${error.field}: ${error.message}`));
                    if (error.suggestion) {
                        console.log(chalk_1.default.yellow(`     💡 ${error.suggestion}`));
                    }
                });
                throw new Error('Configuration validation failed');
            }
            // Test configuration
            if (options.interactive !== false) {
                const testResult = await this.quickTestConfiguration(config);
                if (!testResult) {
                    console.log(chalk_1.default.yellow('\n⚠️  Configuration test failed. Proceeding anyway...'));
                }
            }
            // Save configuration
            const outputPath = options.output || this.generateFilename(config);
            await this.saveConfiguration(config, outputPath);
            // Success report
            this.displaySuccessReport(config, outputPath, validation);
            return outputPath;
        }
        catch (error) {
            console.error(chalk_1.default.red('\n❌ Studio creation failed:'), error instanceof Error ? error.message : String(error));
            throw error;
        }
    }
    /**
     * Quick start with business intelligence templates
     */
    async quickStart() {
        console.log(chalk_1.default.blue.bold('⚡ Quick Start - Business Intelligence Templates\n'));
        const templates = this.templateLibrary.getAllTemplates();
        if (templates.length === 0) {
            console.log(chalk_1.default.yellow('No templates available. Switching to guided creation...'));
            return this.guidedInteractiveCreation();
        }
        // Show template categories
        const { selectedCategory } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'selectedCategory',
                message: 'Select a business scenario:',
                choices: [
                    { name: `📊 Business Analysis (${templates.filter(t => t.info.category === 'Business').length} templates)`, value: 'Business' },
                    { name: `💰 Financial Planning (${templates.filter(t => t.info.category === 'Finance').length} templates)`, value: 'Finance' },
                    { name: `📈 Marketing ROI (${templates.filter(t => t.info.category === 'Marketing').length} templates)`, value: 'Marketing' },
                    { name: `🔧 Operations (${templates.filter(t => t.info.category === 'Operations').length} templates)`, value: 'Operations' },
                    { name: '🔍 Browse all templates', value: 'all' }
                ]
            }
        ]);
        const relevantTemplates = selectedCategory === 'all'
            ? templates
            : templates.filter(t => t.info.category === selectedCategory);
        const { templateId } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'templateId',
                message: 'Select a template:',
                choices: relevantTemplates.map(template => ({
                    name: `${template.info.name} - ${template.info.businessContext}`,
                    value: template.info.id,
                    short: template.info.name
                })),
                pageSize: 10
            }
        ]);
        const template = this.templateLibrary.getTemplate(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }
        return this.customizeTemplate(template);
    }
    /**
     * Customize simulation from existing template
     */
    async customizeFromTemplate(templateId) {
        const template = this.templateLibrary.getTemplate(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }
        return this.customizeTemplate(template);
    }
    /**
     * Agent-optimized creation workflow
     */
    async agentOptimizedCreation() {
        console.log(chalk_1.default.magenta.bold('🤖 Agent-Optimized Creation Mode\n'));
        // Gather agent context
        const context = await this.gatherAgentContext();
        // Find relevant templates based on context
        const relevantTemplates = await this.suggestTemplatesForContext(context);
        if (relevantTemplates.length > 0) {
            console.log(chalk_1.default.green(`✨ Found ${relevantTemplates.length} relevant templates for your scenario`));
            const { useTemplate } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'useTemplate',
                    message: 'Use a relevant business template as starting point?',
                    default: true
                }
            ]);
            if (useTemplate) {
                const { templateId } = await inquirer_1.default.prompt([
                    {
                        type: 'list',
                        name: 'templateId',
                        message: 'Select template:',
                        choices: relevantTemplates.map(template => ({
                            name: `${template.info.name} - ${template.info.useCase}`,
                            value: template.info.id
                        }))
                    }
                ]);
                const template = this.templateLibrary.getTemplate(templateId);
                if (template) {
                    return this.customizeTemplateForAgent(template, context);
                }
            }
        }
        // Build from scratch with agent context
        return this.buildFromScratchWithContext(context);
    }
    /**
     * Full guided interactive creation
     */
    async guidedInteractiveCreation() {
        console.log(chalk_1.default.green.bold('🧭 Guided Interactive Creation\n'));
        // Initialize workflow context
        const context = {
            currentStep: 'intro',
            completedSteps: [],
            simulationData: {},
            validationHistory: []
        };
        // Execute guided workflow
        return this.workflow.executeWorkflow('intro', context);
    }
    /**
     * Template customization with business guidance
     */
    async customizeTemplate(template) {
        console.log(chalk_1.default.blue(`\n🎨 Customizing: ${template.info.name}`));
        console.log(chalk_1.default.gray(template.info.businessContext));
        // Display business guidance
        console.log('\n' + chalk_1.default.cyan('💡 Business Guidance:'));
        console.log(chalk_1.default.gray(this.templateLibrary.generateBusinessGuidance(template)));
        const { customizationLevel } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'customizationLevel',
                message: 'How would you like to customize this template?',
                choices: [
                    { name: '⚡ Quick Setup (adjust key parameters only)', value: 'quick' },
                    { name: '🔧 Standard Customization (parameters + description)', value: 'standard' },
                    { name: '🛠️  Full Customization (all aspects)', value: 'full' },
                    { name: '✨ Use as-is (for testing)', value: 'none' }
                ]
            }
        ]);
        if (customizationLevel === 'none') {
            return { ...template.config };
        }
        let config = { ...template.config };
        // Basic customization
        if (customizationLevel !== 'quick') {
            config = await this.customizeBasicInfo(config);
        }
        // Key parameter adjustment
        config = await this.customizeKeyParameters(config, template);
        // Full customization options
        if (customizationLevel === 'full') {
            config = await this.customizeAdvancedOptions(config, template);
        }
        return config;
    }
    /**
     * Gather context for agent-optimized workflows
     */
    async gatherAgentContext() {
        const answers = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'intent',
                message: 'What type of analysis do you want to perform?',
                choices: [
                    { name: '📊 ROI Analysis - Return on investment calculations', value: 'roi_analysis' },
                    { name: '💰 Investment Planning - Capital allocation and budgeting', value: 'investment_planning' },
                    { name: '📈 Growth Modeling - Business growth and scaling analysis', value: 'growth_modeling' },
                    { name: '⚖️  Risk Assessment - Risk analysis and scenario planning', value: 'risk_assessment' },
                    { name: '🏭 Capacity Planning - Resource and operational planning', value: 'capacity_planning' }
                ]
            },
            {
                type: 'input',
                name: 'businessContext',
                message: 'Describe your business scenario (e.g., "SaaS company evaluating AI tool adoption"):',
                validate: (input) => input.trim().length > 10 || 'Please provide at least 10 characters'
            },
            {
                type: 'input',
                name: 'keyParameters',
                message: 'What key variables do you want to analyze? (comma-separated):',
                filter: (input) => input.split(',').map(s => s.trim()).filter(s => s.length > 0)
            },
            {
                type: 'input',
                name: 'expectedOutputs',
                message: 'What results do you want to calculate? (comma-separated):',
                filter: (input) => input.split(',').map(s => s.trim()).filter(s => s.length > 0)
            }
        ]);
        return answers;
    }
    /**
     * Suggest templates based on agent context
     */
    async suggestTemplatesForContext(context) {
        const allTemplates = this.templateLibrary.getAllTemplates();
        // Score templates based on context relevance
        const scoredTemplates = allTemplates.map(template => {
            let score = 0;
            // Intent matching
            const intentKeywords = {
                'roi_analysis': ['roi', 'return', 'investment', 'profitability'],
                'investment_planning': ['investment', 'budget', 'capital', 'planning'],
                'growth_modeling': ['growth', 'scaling', 'expansion', 'market'],
                'risk_assessment': ['risk', 'scenario', 'uncertainty', 'analysis'],
                'capacity_planning': ['capacity', 'resource', 'operational', 'planning'],
                'software_investment': ['software', 'technology', 'investment', 'productivity'],
                'marketing_campaign': ['marketing', 'campaign', 'customer', 'acquisition'],
                'team_scaling': ['team', 'hiring', 'scaling', 'workforce']
            };
            const keywords = intentKeywords[context.intent] || [];
            const templateText = `${template.info.name} ${template.info.description} ${template.info.tags.join(' ')}`.toLowerCase();
            keywords.forEach((keyword) => {
                if (templateText.includes(keyword.toLowerCase())) {
                    score += 2;
                }
            });
            // Business context matching
            context.keyParameters.forEach(param => {
                if (template.config.parameters.some(p => p.key.toLowerCase().includes(param.toLowerCase()))) {
                    score += 1;
                }
            });
            return { template, score };
        });
        // Return templates with score > 0, sorted by relevance
        return scoredTemplates
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5) // Top 5 most relevant
            .map(item => item.template);
    }
    /**
     * Customize template for agent with context
     */
    async customizeTemplateForAgent(template, context) {
        console.log(chalk_1.default.magenta(`\n🤖 Agent-optimizing template: ${template.info.name}`));
        let config = { ...template.config };
        // Auto-customize based on agent context
        config.name = `${context.businessContext} - ${template.info.name}`;
        config.description = `${template.config.description} - Customized for: ${context.businessContext}`;
        config.tags = [...config.tags, 'agent-generated', context.intent.replace('_', '-')];
        // Smart parameter adjustment based on context
        console.log(chalk_1.default.blue('\n🔄 Auto-adjusting parameters based on your scenario...'));
        for (const param of config.parameters) {
            // Check if this parameter matches agent's key parameters
            const matchingContextParam = context.keyParameters.find(cp => param.key.toLowerCase().includes(cp.toLowerCase()) ||
                param.label.toLowerCase().includes(cp.toLowerCase()));
            if (matchingContextParam) {
                console.log(chalk_1.default.green(`   ✓ Found relevant parameter: ${param.label}`));
                // Optionally prompt for adjustment
                const { shouldAdjust } = await inquirer_1.default.prompt([
                    {
                        type: 'confirm',
                        name: 'shouldAdjust',
                        message: `Adjust ${param.label}? (current: ${param.default})`,
                        default: false
                    }
                ]);
                if (shouldAdjust && param.type === 'number') {
                    const { newValue } = await inquirer_1.default.prompt({
                        type: 'number',
                        name: 'newValue',
                        message: `New value for ${param.label}:`,
                        default: param.default,
                        validate: (input) => (input !== undefined && !isNaN(input)) || 'Must be a valid number'
                    });
                    param.default = newValue;
                }
            }
        }
        return config;
    }
    /**
     * Build from scratch with agent context
     */
    async buildFromScratchWithContext(_context) {
        console.log(chalk_1.default.magenta('\n🤖 Building simulation from scratch with agent context...'));
        // Use existing config builder but with agent context awareness
        return this.configBuilder.buildConfiguration();
    }
    /**
     * Validate configuration with business context
     */
    async validateConfiguration(config) {
        try {
            const simulation = new ConfigurableSimulation_1.ConfigurableSimulation(config);
            const validation = simulation.validateConfiguration();
            return {
                valid: validation.valid,
                errors: validation.errors.map(error => ({
                    field: 'general',
                    message: error,
                    suggestion: this.generateSuggestion(error)
                }))
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: [{
                        field: 'configuration',
                        message: error instanceof Error ? error.message : String(error),
                        suggestion: 'Check the configuration syntax and required fields'
                    }]
            };
        }
    }
    /**
     * Quick test configuration during creation
     */
    async quickTestConfiguration(config) {
        try {
            console.log(chalk_1.default.blue('\n🧪 Running quick test...'));
            const simulation = new ConfigurableSimulation_1.ConfigurableSimulation(config);
            // Create test parameters
            const testParams = {};
            config.parameters.forEach(param => {
                testParams[param.key] = param.default;
            });
            // Run single simulation
            const result = simulation.simulateScenario(testParams);
            console.log(chalk_1.default.green('   ✓ Configuration test passed'));
            if (Object.keys(result).length > 0) {
                console.log(chalk_1.default.gray('   📊 Sample result:'), JSON.stringify(result, null, 2).substring(0, 200) + '...');
            }
            return true;
        }
        catch (error) {
            console.log(chalk_1.default.red('   ❌ Test failed:'), error instanceof Error ? error.message : String(error));
            return false;
        }
    }
    /**
     * Save configuration to file
     */
    async saveConfiguration(config, outputPath) {
        await this.loader.saveConfig(outputPath, config);
    }
    /**
     * Generate appropriate filename for configuration
     */
    generateFilename(config) {
        const baseName = config.name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
        return `simulations/${baseName}.yaml`;
    }
    /**
     * Display success report
     */
    displaySuccessReport(config, outputPath, validation) {
        console.log(chalk_1.default.green.bold('\n🎉 Simulation Created Successfully!'));
        console.log(chalk_1.default.white(`   📄 Name: ${config.name}`));
        console.log(chalk_1.default.white(`   📂 Saved to: ${outputPath}`));
        console.log(chalk_1.default.white(`   🔢 Parameters: ${config.parameters.length}`));
        console.log(chalk_1.default.white(`   📊 Outputs: ${config.outputs?.length || 'Auto-generated'}`));
        if (validation.businessInsights && validation.businessInsights.length > 0) {
            console.log(chalk_1.default.cyan('\n💡 Business Insights:'));
            validation.businessInsights.forEach(insight => {
                console.log(chalk_1.default.gray(`   • ${insight}`));
            });
        }
        console.log(chalk_1.default.blue('\n🚀 Next Steps:'));
        console.log(chalk_1.default.gray(`   • Test: npm run cli run ${outputPath}`));
        console.log(chalk_1.default.gray(`   • Validate: npm run cli validate ${outputPath}`));
        console.log(chalk_1.default.gray(`   • Interactive: npm run cli run ${outputPath} --interactive`));
    }
    // Helper methods
    async customizeBasicInfo(config) {
        const answers = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Simulation name:',
                default: config.name,
                validate: (input) => input.trim().length > 0 || 'Name is required'
            },
            {
                type: 'input',
                name: 'description',
                message: 'Description:',
                default: config.description,
                validate: (input) => input.trim().length > 0 || 'Description is required'
            }
        ]);
        return { ...config, ...answers };
    }
    async customizeKeyParameters(config, template) {
        console.log(chalk_1.default.blue('\n🔧 Key Parameter Adjustment'));
        console.log('Customize the most important parameters for your scenario.\n');
        // Focus on parameters with business tips or common business terms
        const keyParams = config.parameters.filter(param => template.guidance.parameterTips[param.key] ||
            ['arr', 'budget', 'cost', 'revenue', 'rate', 'target', 'investment'].some(term => param.key.toLowerCase().includes(term))).slice(0, 5);
        const updatedParams = [...config.parameters];
        for (const param of keyParams) {
            const tip = template.guidance.parameterTips[param.key];
            if (tip) {
                console.log(chalk_1.default.yellow(`💡 ${param.label}: ${tip}`));
            }
            if (param.type === 'number') {
                const { newValue } = await inquirer_1.default.prompt({
                    type: 'number',
                    name: 'newValue',
                    message: `${param.label}:`,
                    default: Number(param.default),
                    validate: (input) => (input !== undefined && !isNaN(input)) || 'Must be a valid number'
                });
                const paramIndex = updatedParams.findIndex(p => p.key === param.key);
                if (paramIndex !== -1) {
                    updatedParams[paramIndex] = { ...param, default: newValue };
                }
            }
        }
        return { ...config, parameters: updatedParams };
    }
    async customizeAdvancedOptions(config, _template) {
        // Advanced customization options can be added here
        return config;
    }
    generateSuggestion(error) {
        if (error.includes('parameter')) {
            return 'Check parameter definitions and ensure all required fields are present';
        }
        if (error.includes('output')) {
            return 'Verify output definitions match the simulation logic return values';
        }
        if (error.includes('logic')) {
            return 'Review simulation logic for syntax errors and ensure it returns the expected outputs';
        }
        return 'Check the configuration documentation for requirements';
    }
}
exports.InteractiveDefinitionStudio = InteractiveDefinitionStudio;
/**
 * Guided Workflow Engine for step-by-step creation
 */
class GuidedWorkflow {
    steps = new Map();
    constructor() {
        this.initializeSteps();
    }
    async executeWorkflow(startStep, context) {
        context.currentStep = startStep;
        while (context.currentStep) {
            const step = this.steps.get(context.currentStep);
            if (!step) {
                throw new Error(`Unknown workflow step: ${context.currentStep}`);
            }
            console.log(chalk_1.default.green.bold(`\n📋 ${step.title}`));
            console.log(chalk_1.default.gray(step.description));
            // Execute step and get data
            const stepData = await this.executeStep(step, context);
            // Validate step
            const validation = await step.validator(stepData, context);
            context.validationHistory.push(validation);
            if (!validation.valid) {
                console.log(chalk_1.default.red('\n❌ Step validation failed:'));
                validation.errors.forEach(error => {
                    console.log(chalk_1.default.red(`   • ${error.message}`));
                    if (error.suggestion) {
                        console.log(chalk_1.default.yellow(`     💡 ${error.suggestion}`));
                    }
                });
                continue; // Retry current step
            }
            // Update context
            context.completedSteps.push(context.currentStep);
            Object.assign(context.simulationData, stepData);
            // Determine next step
            const nextStepId = step.nextStep(stepData, context);
            context.currentStep = nextStepId;
        }
        // Return completed configuration
        return context.simulationData;
    }
    async executeStep(_step, _context) {
        // This would contain the actual step execution logic
        // For now, return placeholder
        return {};
    }
    initializeSteps(_context) {
        // Initialize workflow steps
        this.steps.set('intro', {
            id: 'intro',
            title: 'Welcome to Guided Creation',
            description: 'Let\'s create your simulation step by step',
            validator: async () => ({ valid: true, errors: [] }),
            nextStep: () => 'basic_info'
        });
        this.steps.set('basic_info', {
            id: 'basic_info',
            title: 'Basic Information',
            description: 'Define the basic properties of your simulation',
            validator: async () => ({ valid: true, errors: [] }),
            nextStep: () => null // Terminate workflow for now - will add more steps in phase completion
        });
        // More steps would be defined here...
    }
}
exports.GuidedWorkflow = GuidedWorkflow;
/**
 * Simple watch-based validator for real-time feedback
 * Uses existing ConfigurationValidator + simple file watching
 */
class RealTimeValidator {
    configValidator;
    constructor() {
        this.configValidator = new schema_1.ConfigurationValidator();
    }
    /**
     * Quick validation for immediate feedback
     */
    validateConfig(config) {
        // Use existing proven validator
        return this.configValidator.validateConfig(config);
    }
    /**
     * Quick YAML syntax check
     */
    validateYaml(yamlContent) {
        try {
            yaml_1.default.parse(yamlContent);
            return { valid: true };
        }
        catch (error) {
            return { valid: false, error: error instanceof Error ? error.message : 'YAML syntax error' };
        }
    }
    /**
     * Preview structure without complex formatting
     */
    previewConfig(config) {
        const params = config.parameters?.length || 0;
        const outputs = config.outputs?.length || 0;
        return `${config.name || 'Untitled'} (${params} params, ${outputs} outputs)`;
    }
}
exports.RealTimeValidator = RealTimeValidator;
/**
 * Agent-optimized studio for context-aware simulation creation
 * Provides sophisticated intent recognition and template matching
 */
class AgentOptimizedStudio {
    templateLibrary;
    constructor() {
        this.templateLibrary = new template_library_1.TemplateLibrary();
    }
    /**
     * Initialize template library for agent operations
     */
    async initialize() {
        await this.templateLibrary.loadTemplates();
    }
    /**
     * Parse natural language query into structured agent context
     */
    parseIntent(naturalLanguageQuery) {
        const query = naturalLanguageQuery.toLowerCase();
        // Intent recognition based on business keywords
        let intent = 'roi_analysis';
        if (query.includes('software') && (query.includes('investment') || query.includes('roi'))) {
            intent = 'software_investment';
        }
        else if (query.includes('marketing') || query.includes('campaign') || query.includes('customer acquisition')) {
            intent = 'marketing_campaign';
        }
        else if (query.includes('team') && (query.includes('scaling') || query.includes('hiring'))) {
            intent = 'team_scaling';
        }
        else if (query.includes('growth') || query.includes('scaling') || query.includes('expansion')) {
            intent = 'growth_modeling';
        }
        else if (query.includes('risk') || query.includes('uncertainty') || query.includes('volatility')) {
            intent = 'risk_assessment';
        }
        else if (query.includes('capacity') || query.includes('planning') || query.includes('resource')) {
            intent = 'capacity_planning';
        }
        else if (query.includes('investment') || query.includes('planning')) {
            intent = 'investment_planning';
        }
        // Extract industry context
        let industryContext;
        if (query.includes('saas') || query.includes('software'))
            industryContext = 'Software';
        else if (query.includes('restaurant') || query.includes('hospitality'))
            industryContext = 'Hospitality';
        else if (query.includes('manufacturing') || query.includes('production'))
            industryContext = 'Manufacturing';
        else if (query.includes('ecommerce') || query.includes('retail'))
            industryContext = 'E-commerce';
        // Determine complexity level
        let complexityLevel = 'moderate';
        if (query.includes('simple') || query.includes('basic') || query.includes('quick')) {
            complexityLevel = 'simple';
        }
        else if (query.includes('complex') || query.includes('advanced') || query.includes('sophisticated')) {
            complexityLevel = 'advanced';
        }
        // Extract key parameters from query
        const keyParameters = [];
        if (query.includes('budget'))
            keyParameters.push('budget');
        if (query.includes('revenue') || query.includes('arr'))
            keyParameters.push('revenue');
        if (query.includes('cost'))
            keyParameters.push('cost');
        if (query.includes('time') || query.includes('timeline'))
            keyParameters.push('timeline');
        if (query.includes('team') || query.includes('employee'))
            keyParameters.push('team_size');
        if (query.includes('conversion'))
            keyParameters.push('conversion_rate');
        if (query.includes('productivity'))
            keyParameters.push('productivity_gain');
        return {
            intent,
            naturalLanguageQuery,
            industryContext,
            complexityLevel,
            keyParameters,
            businessContext: query,
            expectedOutputs: ['roi', 'payback_period', 'npv']
        };
    }
    /**
     * Find best template match based on agent context with intelligent BI-aware scoring
     */
    async findBestTemplate(context) {
        await this.initialize();
        // Multi-factor template scoring system
        const scoredTemplates = this.templateLibrary.getAllTemplates().map(template => ({
            template,
            score: this.calculateTemplateScore(template, context)
        }));
        // Sort by score and return best match
        scoredTemplates.sort((a, b) => b.score - a.score);
        return scoredTemplates[0]?.score > 0 ? scoredTemplates[0].template : null;
    }
    /**
     * Calculate comprehensive template matching score using business intelligence metadata
     */
    calculateTemplateScore(template, context) {
        let score = 0;
        // Intent matching (40% weight) - exact match gets full points
        if (this.matchesIntent(template, context.intent)) {
            score += 40;
        }
        // Industry context matching (30% weight)
        if (context.industryContext && template.businessIntelligence.industry.some(industry => industry.toLowerCase().includes(context.industryContext.toLowerCase()) ||
            context.industryContext.toLowerCase().includes(industry.toLowerCase()))) {
            score += 30;
        }
        // Business model alignment (20% weight)
        const inferredBusinessModel = this.inferBusinessModel(context);
        if (inferredBusinessModel && template.businessIntelligence.businessModel === inferredBusinessModel) {
            score += 20;
        }
        // Keyword relevance (10% weight)
        const keywordScore = this.calculateKeywordRelevance(template, context);
        score += keywordScore * 0.1;
        return score;
    }
    /**
     * Check if template matches the given intent
     */
    matchesIntent(template, intent) {
        const intentKeywords = {
            software_investment: ['software', 'investment', 'technology', 'productivity'],
            marketing_campaign: ['marketing', 'campaign', 'customer', 'acquisition'],
            team_scaling: ['team', 'scaling', 'hiring', 'growth'],
            roi_analysis: ['roi', 'return', 'analysis', 'investment'],
            investment_planning: ['investment', 'planning', 'technology', 'roi'],
            growth_modeling: ['growth', 'saas', 'revenue', 'scaling'],
            risk_assessment: ['risk', 'assessment', 'uncertainty'],
            capacity_planning: ['capacity', 'planning', 'operational', 'efficiency']
        };
        const keywords = intentKeywords[intent] || [];
        const templateKeywords = template.businessIntelligence.agentOptimization.keywords.map(k => k.toLowerCase());
        const templateName = template.config.name.toLowerCase();
        return keywords.some(keyword => templateKeywords.includes(keyword) ||
            templateName.includes(keyword));
    }
    /**
     * Infer business model from agent context
     */
    inferBusinessModel(context) {
        const query = context.naturalLanguageQuery?.toLowerCase() || context.businessContext?.toLowerCase() || '';
        if (query.includes('saas') || query.includes('subscription') || query.includes('recurring')) {
            return 'SaaS';
        }
        else if (query.includes('b2c') || query.includes('consumer') || query.includes('retail')) {
            return 'B2C';
        }
        else if (query.includes('marketplace') || query.includes('platform')) {
            return 'Marketplace';
        }
        else if (query.includes('b2b2c')) {
            return 'B2B2C';
        }
        else if (query.includes('b2b') || query.includes('enterprise')) {
            return 'B2B';
        }
        return null;
    }
    /**
     * Calculate keyword relevance score between template and context
     */
    calculateKeywordRelevance(template, context) {
        const contextKeywords = [
            ...context.keyParameters,
            ...context.expectedOutputs,
            ...(context.priorityMetrics || [])
        ].map(k => k.toLowerCase());
        if (context.naturalLanguageQuery) {
            // Extract keywords from natural language query
            const queryWords = context.naturalLanguageQuery
                .toLowerCase()
                .split(/\s+/)
                .filter(word => word.length > 3 && !['this', 'that', 'with', 'from', 'they', 'have'].includes(word));
            contextKeywords.push(...queryWords);
        }
        const templateKeywords = template.businessIntelligence.agentOptimization.keywords.map(k => k.toLowerCase());
        let matches = 0;
        for (const keyword of contextKeywords) {
            if (templateKeywords.some(tk => tk.includes(keyword) || keyword.includes(tk))) {
                matches++;
            }
        }
        return contextKeywords.length > 0 ? (matches / contextKeywords.length) * 100 : 0;
    }
    /**
     * Generate context-aware parameter suggestions
     */
    generateParameterSuggestions(template, context) {
        const suggestions = {};
        // Apply complexity-based defaults
        if (context.complexityLevel === 'simple') {
            // Use conservative, safe defaults
            template.config.parameters.forEach(param => {
                if (param.key.toLowerCase().includes('budget')) {
                    const defaultValue = typeof param.default === 'number' ? param.default :
                        typeof param.min === 'number' ? param.min : 10000;
                    suggestions[param.key] = Math.round(defaultValue * 0.8);
                }
                else if (param.key.toLowerCase().includes('timeline')) {
                    const defaultValue = typeof param.default === 'number' ? param.default : 6;
                    suggestions[param.key] = Math.max(defaultValue, 3);
                }
            });
        }
        else if (context.complexityLevel === 'advanced') {
            // Use more aggressive defaults
            template.config.parameters.forEach(param => {
                if (param.key.toLowerCase().includes('growth') || param.key.toLowerCase().includes('productivity')) {
                    const defaultValue = typeof param.default === 'number' ? param.default : 10;
                    suggestions[param.key] = Math.round(defaultValue * 1.3);
                }
            });
        }
        // Apply industry-specific defaults
        if (context.industryContext === 'Software' || context.industryContext === 'Technology') {
            template.config.parameters.forEach(param => {
                if (param.key.toLowerCase().includes('productivity')) {
                    const defaultValue = typeof param.default === 'number' ? param.default : 15;
                    suggestions[param.key] = Math.max(defaultValue, 20); // Higher productivity gains for software
                }
            });
        }
        return suggestions;
    }
    /**
     * Validate agent context and provide structured feedback
     */
    validateContext(context) {
        const suggestions = [];
        const warnings = [];
        // Check for missing critical context
        if (!context.businessContext || context.businessContext.length < 10) {
            suggestions.push('Provide more detailed business context for better simulation accuracy');
        }
        if (!context.expectedOutputs || context.expectedOutputs.length === 0) {
            suggestions.push('Specify expected outputs to ensure simulation meets your analytical needs');
        }
        if (!context.industryContext) {
            suggestions.push('Include industry context for more relevant parameter recommendations');
        }
        // Warn about complexity mismatches
        if (context.complexityLevel === 'simple' && context.keyParameters.length > 5) {
            warnings.push('Many parameters specified for simple analysis - consider moderate complexity level');
        }
        if (context.complexityLevel === 'advanced' && context.keyParameters.length < 3) {
            warnings.push('Few parameters for advanced analysis - consider including more business variables');
        }
        return {
            valid: suggestions.length <= 2, // Allow up to 2 suggestions for agent-generated contexts
            suggestions,
            warnings
        };
    }
}
exports.AgentOptimizedStudio = AgentOptimizedStudio;
/**
 * Agent-optimized entry point for natural language integration
 */
async function generateFromIntent(context) {
    const agentStudio = new AgentOptimizedStudio();
    try {
        // Validate agent context
        const validation = agentStudio.validateContext(context);
        if (!validation.valid) {
            throw new Error(`Context validation failed: ${validation.suggestions.join(', ')}`);
        }
        // Find optimal template for agent context
        const template = await agentStudio.findBestTemplate(context);
        if (!template) {
            throw new Error(`No suitable template found for intent: ${context.intent}`);
        }
        // Generate context-aware parameter suggestions
        const parameterSuggestions = agentStudio.generateParameterSuggestions(template, context);
        // Create simulation configuration with agent optimizations
        const config = {
            ...template.config,
            name: `${template.config.name} (Agent Generated)`,
            description: `${template.config.description} | Generated from: ${context.naturalLanguageQuery || context.businessContext}`,
            parameters: template.config.parameters.map(param => ({
                ...param,
                default: parameterSuggestions[param.key] !== undefined ? parameterSuggestions[param.key] : param.default
            }))
        };
        // Return YAML configuration
        const yaml = await Promise.resolve().then(() => __importStar(require('yaml')));
        return yaml.default.stringify(config);
    }
    catch (error) {
        throw new Error(`Agent simulation generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Enhanced agent entry point with natural language processing
 */
async function generateFromNaturalLanguage(query, options) {
    const agentStudio = new AgentOptimizedStudio();
    // Parse natural language into structured context
    const parsedContext = agentStudio.parseIntent(query);
    // Ensure all required fields are present
    const fullContext = {
        intent: parsedContext.intent || 'roi_analysis',
        businessContext: parsedContext.businessContext || query,
        keyParameters: parsedContext.keyParameters || [],
        expectedOutputs: parsedContext.expectedOutputs || ['roi'],
        industryContext: parsedContext.industryContext,
        timeHorizon: 'annual',
        naturalLanguageQuery: query,
        targetAudience: 'business',
        complexityLevel: parsedContext.complexityLevel || 'moderate'
    };
    const yamlResult = await generateFromIntent(fullContext);
    // Add real-time validation if requested
    if (options?.validate) {
        const validator = new RealTimeValidator();
        const yamlValidation = validator.validateYaml(yamlResult);
        if (!yamlValidation.valid) {
            console.log(chalk_1.default.yellow(`⚠️  YAML Validation Warning: ${yamlValidation.error}`));
        }
        try {
            const config = yaml_1.default.parse(yamlResult);
            const configValidation = validator.validateConfig(config);
            if (!configValidation.valid) {
                console.log(chalk_1.default.red('❌ Configuration Validation Errors:'));
                configValidation.errors.forEach(error => console.log(chalk_1.default.red(`   • ${error}`)));
            }
            else {
                console.log(chalk_1.default.green('✅ Configuration validated successfully'));
                console.log(chalk_1.default.gray(`📝 Preview: ${validator.previewConfig(config)}`));
            }
        }
        catch (error) {
            console.log(chalk_1.default.red(`❌ Failed to parse generated YAML: ${error instanceof Error ? error.message : error}`));
        }
    }
    return yamlResult;
}
//# sourceMappingURL=definition-studio.js.map