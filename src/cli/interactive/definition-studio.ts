import inquirer from 'inquirer'
import chalk from 'chalk'
import { SimulationConfig } from '../config/schema'
import { ConfigurationLoader } from '../config/loader'
import { ConfigurableSimulation } from '../../framework/ConfigurableSimulation'
import { TemplateLibrary, BusinessTemplate } from './template-library'
import { InteractiveConfigBuilder } from './config-builder'
import { ConfigurationValidator } from '../config/schema'
import yaml from 'yaml'

// Agent-optimized context interface for natural language integration
export interface AgentContext {
  intent: 'roi_analysis' | 'investment_planning' | 'growth_modeling' | 'risk_assessment' | 'capacity_planning' | 'software_investment' | 'marketing_campaign' | 'team_scaling'
  businessContext: string
  keyParameters: string[]
  expectedOutputs: string[]
  industryContext?: string
  timeHorizon?: 'quarterly' | 'annual' | 'multi_year'
  naturalLanguageQuery?: string
  targetAudience?: 'technical' | 'business' | 'executive'
  complexityLevel?: 'simple' | 'moderate' | 'advanced'
  priorityMetrics?: string[]
}

// Validation result with business context
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings?: string[]
  businessInsights?: string[]
}

export interface ValidationError {
  field: string
  message: string
  suggestion: string
  businessContext?: string
  exampleValue?: any
}

// Workflow step definition for guided creation
export interface WorkflowStep {
  id: string
  title: string
  description: string
  validator: (_data: any, _context: WorkflowContext) => Promise<ValidationResult>
  nextStep: (_data: any, _context: WorkflowContext) => string | null
  canSkip?: boolean
  businessTips?: string[]
}

export interface WorkflowContext {
  currentStep: string | null
  completedSteps: string[]
  simulationData: Partial<SimulationConfig>
  agentContext?: AgentContext
  templateUsed?: BusinessTemplate
  validationHistory: ValidationResult[]
}

export interface StudioOptions {
  interactive?: boolean
  verbose?: boolean
  output?: string
  template?: string
  agentMode?: boolean
  quickStart?: boolean
}

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
export class InteractiveDefinitionStudio {
  private configBuilder: InteractiveConfigBuilder
  private templateLibrary: TemplateLibrary
  private loader: ConfigurationLoader
  private workflow: GuidedWorkflow
  
  constructor() {
    this.configBuilder = new InteractiveConfigBuilder()
    this.templateLibrary = new TemplateLibrary()
    this.loader = new ConfigurationLoader()
    this.workflow = new GuidedWorkflow()
  }

  /**
   * Main entry point for interactive simulation creation
   */
  async createSimulation(options: StudioOptions = {}): Promise<string> {
    console.log(chalk.cyan.bold('🎨 Interactive Simulation Definition Studio'))
    console.log(chalk.gray('Create sophisticated Monte Carlo simulations with guided assistance\n'))
    
    try {
      // Initialize template library
      await this.templateLibrary.loadTemplates()
      
      // Determine creation method based on options and user preference
      let config: SimulationConfig
      
      if (options.quickStart) {
        config = await this.quickStart()
      } else if (options.template) {
        config = await this.customizeFromTemplate(options.template)
      } else if (options.agentMode) {
        config = await this.agentOptimizedCreation()
      } else {
        config = await this.guidedInteractiveCreation()
      }
      
      // Validate final configuration
      const validation = await this.validateConfiguration(config)
      if (!validation.valid) {
        console.log(chalk.red('\n❌ Configuration validation failed:'))
        validation.errors.forEach(error => {
          console.log(chalk.red(`   • ${error.field}: ${error.message}`))
          if (error.suggestion) {
            console.log(chalk.yellow(`     💡 ${error.suggestion}`))
          }
        })
        throw new Error('Configuration validation failed')
      }
      
      // Test configuration
      if (options.interactive !== false) {
        const testResult = await this.quickTestConfiguration(config)
        if (!testResult) {
          console.log(chalk.yellow('\n⚠️  Configuration test failed. Proceeding anyway...'))
        }
      }
      
      // Save configuration
      const outputPath = options.output || this.generateFilename(config)
      await this.saveConfiguration(config, outputPath)
      
      // Success report
      this.displaySuccessReport(config, outputPath, validation)
      
      return outputPath
      
    } catch (error) {
      console.error(chalk.red('\n❌ Studio creation failed:'), error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  /**
   * Quick start with business intelligence templates
   */
  async quickStart(): Promise<SimulationConfig> {
    console.log(chalk.blue.bold('⚡ Quick Start - Business Intelligence Templates\n'))
    
    const templates = this.templateLibrary.getAllTemplates()
    if (templates.length === 0) {
      console.log(chalk.yellow('No templates available. Switching to guided creation...'))
      return this.guidedInteractiveCreation()
    }
    
    // Show template categories
    const { selectedCategory } = await inquirer.prompt([
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
    ])
    
    const relevantTemplates = selectedCategory === 'all' 
      ? templates 
      : templates.filter(t => t.info.category === selectedCategory)
    
    const { templateId } = await inquirer.prompt([
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
    ])
    
    const template = this.templateLibrary.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }
    
    return this.customizeTemplate(template)
  }

  /**
   * Customize simulation from existing template
   */
  async customizeFromTemplate(templateId: string): Promise<SimulationConfig> {
    const template = this.templateLibrary.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }
    
    return this.customizeTemplate(template)
  }

  /**
   * Agent-optimized creation workflow
   */
  async agentOptimizedCreation(): Promise<SimulationConfig> {
    console.log(chalk.magenta.bold('🤖 Agent-Optimized Creation Mode\n'))
    
    // Gather agent context
    const context = await this.gatherAgentContext()
    
    // Find relevant templates based on context
    const relevantTemplates = await this.suggestTemplatesForContext(context)
    
    if (relevantTemplates.length > 0) {
      console.log(chalk.green(`✨ Found ${relevantTemplates.length} relevant templates for your scenario`))
      
      const { useTemplate } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useTemplate',
          message: 'Use a relevant business template as starting point?',
          default: true
        }
      ])
      
      if (useTemplate) {
        const { templateId } = await inquirer.prompt([
          {
            type: 'list',
            name: 'templateId',
            message: 'Select template:',
            choices: relevantTemplates.map(template => ({
              name: `${template.info.name} - ${template.info.useCase}`,
              value: template.info.id
            }))
          }
        ])
        
        const template = this.templateLibrary.getTemplate(templateId)
        if (template) {
          return this.customizeTemplateForAgent(template, context)
        }
      }
    }
    
    // Build from scratch with agent context
    return this.buildFromScratchWithContext(context)
  }

  /**
   * Full guided interactive creation
   */
  async guidedInteractiveCreation(): Promise<SimulationConfig> {
    console.log(chalk.green.bold('🧭 Guided Interactive Creation\n'))
    
    // Initialize workflow context
    const context: WorkflowContext = {
      currentStep: 'intro',
      completedSteps: [],
      simulationData: {},
      validationHistory: []
    }
    
    // Execute guided workflow
    return this.workflow.executeWorkflow('intro', context)
  }

  /**
   * Template customization with business guidance
   */
  private async customizeTemplate(template: BusinessTemplate): Promise<SimulationConfig> {
    console.log(chalk.blue(`\n🎨 Customizing: ${template.info.name}`))
    console.log(chalk.gray(template.info.businessContext))
    
    // Display business guidance
    console.log('\n' + chalk.cyan('💡 Business Guidance:'))
    console.log(chalk.gray(this.templateLibrary.generateBusinessGuidance(template)))
    
    const { customizationLevel } = await inquirer.prompt([
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
    ])
    
    if (customizationLevel === 'none') {
      return { ...template.config }
    }
    
    let config = { ...template.config }
    
    // Basic customization
    if (customizationLevel !== 'quick') {
      config = await this.customizeBasicInfo(config)
    }
    
    // Key parameter adjustment
    config = await this.customizeKeyParameters(config, template)
    
    // Full customization options
    if (customizationLevel === 'full') {
      config = await this.customizeAdvancedOptions(config, template)
    }
    
    return config
  }

  /**
   * Gather context for agent-optimized workflows
   */
  private async gatherAgentContext(): Promise<AgentContext> {
    const answers = await inquirer.prompt([
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
        validate: (input: string) => input.trim().length > 10 || 'Please provide at least 10 characters'
      },
      {
        type: 'input',
        name: 'keyParameters',
        message: 'What key variables do you want to analyze? (comma-separated):',
        filter: (input: string) => input.split(',').map(s => s.trim()).filter(s => s.length > 0)
      },
      {
        type: 'input',
        name: 'expectedOutputs',
        message: 'What results do you want to calculate? (comma-separated):',
        filter: (input: string) => input.split(',').map(s => s.trim()).filter(s => s.length > 0)
      }
    ])
    
    return answers as AgentContext
  }

  /**
   * Suggest templates based on agent context
   */
  private async suggestTemplatesForContext(context: AgentContext): Promise<BusinessTemplate[]> {
    const allTemplates = this.templateLibrary.getAllTemplates()
    
    // Score templates based on context relevance
    const scoredTemplates = allTemplates.map(template => {
      let score = 0
      
      // Intent matching
      const intentKeywords: Record<AgentContext['intent'], string[]> = {
        'roi_analysis': ['roi', 'return', 'investment', 'profitability'],
        'investment_planning': ['investment', 'budget', 'capital', 'planning'],
        'growth_modeling': ['growth', 'scaling', 'expansion', 'market'],
        'risk_assessment': ['risk', 'scenario', 'uncertainty', 'analysis'],
        'capacity_planning': ['capacity', 'resource', 'operational', 'planning'],
        'software_investment': ['software', 'technology', 'investment', 'productivity'],
        'marketing_campaign': ['marketing', 'campaign', 'customer', 'acquisition'],
        'team_scaling': ['team', 'hiring', 'scaling', 'workforce']
      }
      
      const keywords = intentKeywords[context.intent] || []
      const templateText = `${template.info.name} ${template.info.description} ${template.info.tags.join(' ')}`.toLowerCase()
      
      keywords.forEach((keyword: string) => {
        if (templateText.includes(keyword.toLowerCase())) {
          score += 2
        }
      })
      
      // Business context matching
      context.keyParameters.forEach(param => {
        if (template.config.parameters.some(p => p.key.toLowerCase().includes(param.toLowerCase()))) {
          score += 1
        }
      })
      
      return { template, score }
    })
    
    // Return templates with score > 0, sorted by relevance
    return scoredTemplates
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)  // Top 5 most relevant
      .map(item => item.template)
  }

  /**
   * Customize template for agent with context
   */
  private async customizeTemplateForAgent(template: BusinessTemplate, context: AgentContext): Promise<SimulationConfig> {
    console.log(chalk.magenta(`\n🤖 Agent-optimizing template: ${template.info.name}`))
    
    let config = { ...template.config }
    
    // Auto-customize based on agent context
    config.name = `${context.businessContext} - ${template.info.name}`
    config.description = `${template.config.description} - Customized for: ${context.businessContext}`
    config.tags = [...config.tags, 'agent-generated', context.intent.replace('_', '-')]
    
    // Smart parameter adjustment based on context
    console.log(chalk.blue('\n🔄 Auto-adjusting parameters based on your scenario...'))
    
    for (const param of config.parameters) {
      // Check if this parameter matches agent's key parameters
      const matchingContextParam = context.keyParameters.find(cp => 
        param.key.toLowerCase().includes(cp.toLowerCase()) ||
        param.label.toLowerCase().includes(cp.toLowerCase())
      )
      
      if (matchingContextParam) {
        console.log(chalk.green(`   ✓ Found relevant parameter: ${param.label}`))
        
        // Optionally prompt for adjustment
        const { shouldAdjust } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'shouldAdjust',
            message: `Adjust ${param.label}? (current: ${param.default})`,
            default: false
          }
        ])
        
        if (shouldAdjust && param.type === 'number') {
          const { newValue } = await inquirer.prompt({
            type: 'number',
            name: 'newValue',
            message: `New value for ${param.label}:`,
            default: param.default as number,
            validate: (input?: number) => (input !== undefined && !isNaN(input)) || 'Must be a valid number'
          })
          
          param.default = newValue
        }
      }
    }
    
    return config
  }

  /**
   * Build from scratch with agent context
   */
  private async buildFromScratchWithContext(_context: AgentContext): Promise<SimulationConfig> {
    console.log(chalk.magenta('\n🤖 Building simulation from scratch with agent context...'))
    
    // Use existing config builder but with agent context awareness
    return this.configBuilder.buildConfiguration()
  }

  /**
   * Validate configuration with business context
   */
  private async validateConfiguration(config: SimulationConfig): Promise<ValidationResult> {
    try {
      const simulation = new ConfigurableSimulation(config)
      const validation = simulation.validateConfiguration()
      
      return {
        valid: validation.valid,
        errors: validation.errors.map(error => ({
          field: 'general',
          message: error,
          suggestion: this.generateSuggestion(error)
        }))
      }
    } catch (error) {
      return {
        valid: false,
        errors: [{
          field: 'configuration',
          message: error instanceof Error ? error.message : String(error),
          suggestion: 'Check the configuration syntax and required fields'
        }]
      }
    }
  }

  /**
   * Quick test configuration during creation
   */
  private async quickTestConfiguration(config: SimulationConfig): Promise<boolean> {
    try {
      console.log(chalk.blue('\n🧪 Running quick test...'))
      
      const simulation = new ConfigurableSimulation(config)
      
      // Create test parameters
      const testParams: Record<string, unknown> = {}
      config.parameters.forEach(param => {
        testParams[param.key] = param.default
      })
      
      // Run single simulation
      const result = simulation.simulateScenario(testParams)
      
      console.log(chalk.green('   ✓ Configuration test passed'))
      if (Object.keys(result).length > 0) {
        console.log(chalk.gray('   📊 Sample result:'), JSON.stringify(result, null, 2).substring(0, 200) + '...')
      }
      
      return true
    } catch (error) {
      console.log(chalk.red('   ❌ Test failed:'), error instanceof Error ? error.message : String(error))
      return false
    }
  }

  /**
   * Save configuration to file
   */
  private async saveConfiguration(config: SimulationConfig, outputPath: string): Promise<void> {
    await this.loader.saveConfig(outputPath, config)
  }

  /**
   * Generate appropriate filename for configuration
   */
  private generateFilename(config: SimulationConfig): string {
    const baseName = config.name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
    
    return `simulations/${baseName}.yaml`
  }

  /**
   * Display success report
   */
  private displaySuccessReport(config: SimulationConfig, outputPath: string, validation: ValidationResult): void {
    console.log(chalk.green.bold('\n🎉 Simulation Created Successfully!'))
    console.log(chalk.white(`   📄 Name: ${config.name}`))
    console.log(chalk.white(`   📂 Saved to: ${outputPath}`))
    console.log(chalk.white(`   🔢 Parameters: ${config.parameters.length}`))
    console.log(chalk.white(`   📊 Outputs: ${config.outputs?.length || 'Auto-generated'}`))
    
    if (validation.businessInsights && validation.businessInsights.length > 0) {
      console.log(chalk.cyan('\n💡 Business Insights:'))
      validation.businessInsights.forEach(insight => {
        console.log(chalk.gray(`   • ${insight}`))
      })
    }
    
    console.log(chalk.blue('\n🚀 Next Steps:'))
    console.log(chalk.gray(`   • Test: npm run cli run ${outputPath}`))
    console.log(chalk.gray(`   • Validate: npm run cli validate ${outputPath}`))
    console.log(chalk.gray(`   • Interactive: npm run cli run ${outputPath} --interactive`))
  }

  // Helper methods
  private async customizeBasicInfo(config: SimulationConfig): Promise<SimulationConfig> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Simulation name:',
        default: config.name,
        validate: (input: string) => input.trim().length > 0 || 'Name is required'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:',
        default: config.description,
        validate: (input: string) => input.trim().length > 0 || 'Description is required'
      }
    ])
    
    return { ...config, ...answers }
  }

  private async customizeKeyParameters(config: SimulationConfig, template: BusinessTemplate): Promise<SimulationConfig> {
    console.log(chalk.blue('\n🔧 Key Parameter Adjustment'))
    console.log('Customize the most important parameters for your scenario.\n')
    
    // Focus on parameters with business tips or common business terms
    const keyParams = config.parameters.filter(param => 
      template.guidance.parameterTips[param.key] ||
      ['arr', 'budget', 'cost', 'revenue', 'rate', 'target', 'investment'].some(term =>
        param.key.toLowerCase().includes(term)
      )
    ).slice(0, 5)
    
    const updatedParams = [...config.parameters]
    
    for (const param of keyParams) {
      const tip = template.guidance.parameterTips[param.key]
      if (tip) {
        console.log(chalk.yellow(`💡 ${param.label}: ${tip}`))
      }
      
      if (param.type === 'number') {
        const { newValue } = await inquirer.prompt({
          type: 'number',
          name: 'newValue',
          message: `${param.label}:`,
          default: Number(param.default),
          validate: (input?: number) => (input !== undefined && !isNaN(input)) || 'Must be a valid number'
        })
        
        const paramIndex = updatedParams.findIndex(p => p.key === param.key)
        if (paramIndex !== -1) {
          updatedParams[paramIndex] = { ...param, default: newValue }
        }
      }
    }
    
    return { ...config, parameters: updatedParams }
  }

  private async customizeAdvancedOptions(config: SimulationConfig, _template: BusinessTemplate): Promise<SimulationConfig> {
    // Advanced customization options can be added here
    return config
  }

  private generateSuggestion(error: string): string {
    if (error.includes('parameter')) {
      return 'Check parameter definitions and ensure all required fields are present'
    }
    if (error.includes('output')) {
      return 'Verify output definitions match the simulation logic return values'
    }
    if (error.includes('logic')) {
      return 'Review simulation logic for syntax errors and ensure it returns the expected outputs'
    }
    return 'Check the configuration documentation for requirements'
  }
}

/**
 * Guided Workflow Engine for step-by-step creation
 */
export class GuidedWorkflow {
  private steps: Map<string, WorkflowStep> = new Map()
  
  constructor() {
    this.initializeSteps()
  }
  
  async executeWorkflow(startStep: string, context: WorkflowContext): Promise<SimulationConfig> {
    context.currentStep = startStep
    
    while (context.currentStep) {
      const step = this.steps.get(context.currentStep)
      if (!step) {
        throw new Error(`Unknown workflow step: ${context.currentStep}`)
      }
      
      console.log(chalk.green.bold(`\n📋 ${step.title}`))
      console.log(chalk.gray(step.description))
      
      // Execute step and get data
      const stepData = await this.executeStep(step, context)
      
      // Validate step
      const validation = await step.validator(stepData, context)
      context.validationHistory.push(validation)
      
      if (!validation.valid) {
        console.log(chalk.red('\n❌ Step validation failed:'))
        validation.errors.forEach(error => {
          console.log(chalk.red(`   • ${error.message}`))
          if (error.suggestion) {
            console.log(chalk.yellow(`     💡 ${error.suggestion}`))
          }
        })
        continue // Retry current step
      }
      
      // Update context
      context.completedSteps.push(context.currentStep)
      Object.assign(context.simulationData, stepData)
      
      // Determine next step
      const nextStepId = step.nextStep(stepData, context)
      context.currentStep = nextStepId
    }
    
    // Return completed configuration
    return context.simulationData as SimulationConfig
  }
  
  private async executeStep(_step: WorkflowStep, _context: WorkflowContext): Promise<any> {
    // This would contain the actual step execution logic
    // For now, return placeholder
    return {}
  }
  
  private initializeSteps(_context?: WorkflowContext): void {
    // Initialize workflow steps
    this.steps.set('intro', {
      id: 'intro',
      title: 'Welcome to Guided Creation',
      description: 'Let\'s create your simulation step by step',
      validator: async () => ({ valid: true, errors: [] }),
      nextStep: () => 'basic_info'
    })
    
    this.steps.set('basic_info', {
      id: 'basic_info', 
      title: 'Basic Information',
      description: 'Define the basic properties of your simulation',
      validator: async () => ({ valid: true, errors: [] }),
      nextStep: () => null  // Terminate workflow for now - will add more steps in phase completion
    })
    
    // More steps would be defined here...
  }
}

/**
 * Simple watch-based validator for real-time feedback
 * Uses existing ConfigurationValidator + simple file watching
 */
export class RealTimeValidator {
  private configValidator: ConfigurationValidator

  constructor() {
    this.configValidator = new ConfigurationValidator()
  }

  /**
   * Quick validation for immediate feedback
   */
  validateConfig(config: Partial<SimulationConfig>): { valid: boolean; errors: string[] } {
    // Use existing proven validator
    return this.configValidator.validateConfig(config)
  }

  /**
   * Quick YAML syntax check
   */
  validateYaml(yamlContent: string): { valid: boolean; error?: string } {
    try {
      yaml.parse(yamlContent)
      return { valid: true }
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'YAML syntax error' }
    }
  }

  /**
   * Preview structure without complex formatting
   */
  previewConfig(config: Partial<SimulationConfig>): string {
    const params = config.parameters?.length || 0
    const outputs = config.outputs?.length || 0
    return `${config.name || 'Untitled'} (${params} params, ${outputs} outputs)`
  }
}

/**
 * Agent-optimized studio for context-aware simulation creation
 * Provides sophisticated intent recognition and template matching
 */
export class AgentOptimizedStudio {
  private templateLibrary: TemplateLibrary
  
  constructor() {
    this.templateLibrary = new TemplateLibrary()
  }
  
  /**
   * Initialize template library for agent operations
   */
  async initialize(): Promise<void> {
    await this.templateLibrary.loadTemplates()
  }
  
  /**
   * Parse natural language query into structured agent context
   */
  parseIntent(naturalLanguageQuery: string): Partial<AgentContext> {
    const query = naturalLanguageQuery.toLowerCase()
    
    // Intent recognition based on business keywords
    let intent: AgentContext['intent'] = 'roi_analysis'
    
    if (query.includes('software') && (query.includes('investment') || query.includes('roi'))) {
      intent = 'software_investment'
    } else if (query.includes('marketing') || query.includes('campaign') || query.includes('customer acquisition')) {
      intent = 'marketing_campaign'
    } else if (query.includes('team') && (query.includes('scaling') || query.includes('hiring'))) {
      intent = 'team_scaling'
    } else if (query.includes('growth') || query.includes('scaling') || query.includes('expansion')) {
      intent = 'growth_modeling'
    } else if (query.includes('risk') || query.includes('uncertainty') || query.includes('volatility')) {
      intent = 'risk_assessment'
    } else if (query.includes('capacity') || query.includes('planning') || query.includes('resource')) {
      intent = 'capacity_planning'
    } else if (query.includes('investment') || query.includes('planning')) {
      intent = 'investment_planning'
    }
    
    // Extract industry context
    let industryContext: string | undefined
    if (query.includes('saas') || query.includes('software')) industryContext = 'Software'
    else if (query.includes('restaurant') || query.includes('hospitality')) industryContext = 'Hospitality'
    else if (query.includes('manufacturing') || query.includes('production')) industryContext = 'Manufacturing'
    else if (query.includes('ecommerce') || query.includes('retail')) industryContext = 'E-commerce'
    
    // Determine complexity level
    let complexityLevel: AgentContext['complexityLevel'] = 'moderate'
    if (query.includes('simple') || query.includes('basic') || query.includes('quick')) {
      complexityLevel = 'simple'
    } else if (query.includes('complex') || query.includes('advanced') || query.includes('sophisticated')) {
      complexityLevel = 'advanced'
    }
    
    // Extract key parameters from query
    const keyParameters: string[] = []
    if (query.includes('budget')) keyParameters.push('budget')
    if (query.includes('revenue') || query.includes('arr')) keyParameters.push('revenue')
    if (query.includes('cost')) keyParameters.push('cost')
    if (query.includes('time') || query.includes('timeline')) keyParameters.push('timeline')
    if (query.includes('team') || query.includes('employee')) keyParameters.push('team_size')
    if (query.includes('conversion')) keyParameters.push('conversion_rate')
    if (query.includes('productivity')) keyParameters.push('productivity_gain')
    
    return {
      intent,
      naturalLanguageQuery,
      industryContext,
      complexityLevel,
      keyParameters,
      businessContext: query,
      expectedOutputs: ['roi', 'payback_period', 'npv']
    }
  }
  
  /**
   * Find best template match based on agent context
   */
  async findBestTemplate(context: AgentContext): Promise<BusinessTemplate | null> {
    await this.initialize()
    
    // Intent-based template mapping
    const intentTemplateMap: Record<AgentContext['intent'], string[]> = {
      software_investment: ['software-investment-roi'],
      marketing_campaign: ['marketing-campaign-roi'],
      team_scaling: ['team-scaling-decision'],
      roi_analysis: ['simple-roi-analysis'],
      investment_planning: ['technology-investment'],
      growth_modeling: ['saas-growth-model'],
      risk_assessment: ['risk-assessment'],
      capacity_planning: ['capacity-planning']
    }
    
    const preferredTemplateIds = intentTemplateMap[context.intent] || []
    
    // Try to find exact template match
    for (const templateId of preferredTemplateIds) {
      const template = this.templateLibrary.getTemplate(templateId)
      if (template) return template
    }
    
    // Fallback to industry-based search
    if (context.industryContext) {
      const industryTemplates = this.templateLibrary.getAllTemplates()
        .filter(t => t.info.industryRelevance.includes(context.industryContext!))
      if (industryTemplates.length > 0) return industryTemplates[0]
    }
    
    // Fallback to keyword search
    if (context.naturalLanguageQuery) {
      const searchResults = this.templateLibrary.searchTemplates(context.naturalLanguageQuery)
      if (searchResults.length > 0) return searchResults[0]
    }
    
    return null
  }
  
  /**
   * Generate context-aware parameter suggestions
   */
  generateParameterSuggestions(template: BusinessTemplate, context: AgentContext): Record<string, any> {
    const suggestions: Record<string, any> = {}
    
    // Apply complexity-based defaults
    if (context.complexityLevel === 'simple') {
      // Use conservative, safe defaults
      template.config.parameters.forEach(param => {
        if (param.key.toLowerCase().includes('budget')) {
          const defaultValue = typeof param.default === 'number' ? param.default : 
                              typeof param.min === 'number' ? param.min : 10000
          suggestions[param.key] = Math.round(defaultValue * 0.8)
        } else if (param.key.toLowerCase().includes('timeline')) {
          const defaultValue = typeof param.default === 'number' ? param.default : 6
          suggestions[param.key] = Math.max(defaultValue, 3)
        }
      })
    } else if (context.complexityLevel === 'advanced') {
      // Use more aggressive defaults
      template.config.parameters.forEach(param => {
        if (param.key.toLowerCase().includes('growth') || param.key.toLowerCase().includes('productivity')) {
          const defaultValue = typeof param.default === 'number' ? param.default : 10
          suggestions[param.key] = Math.round(defaultValue * 1.3)
        }
      })
    }
    
    // Apply industry-specific defaults
    if (context.industryContext === 'Software' || context.industryContext === 'Technology') {
      template.config.parameters.forEach(param => {
        if (param.key.toLowerCase().includes('productivity')) {
          const defaultValue = typeof param.default === 'number' ? param.default : 15
          suggestions[param.key] = Math.max(defaultValue, 20) // Higher productivity gains for software
        }
      })
    }
    
    return suggestions
  }
  
  /**
   * Validate agent context and provide structured feedback
   */
  validateContext(context: AgentContext): { valid: boolean; suggestions: string[]; warnings: string[] } {
    const suggestions: string[] = []
    const warnings: string[] = []
    
    // Check for missing critical context
    if (!context.businessContext || context.businessContext.length < 10) {
      suggestions.push('Provide more detailed business context for better simulation accuracy')
    }
    
    if (!context.expectedOutputs || context.expectedOutputs.length === 0) {
      suggestions.push('Specify expected outputs to ensure simulation meets your analytical needs')
    }
    
    if (!context.industryContext) {
      suggestions.push('Include industry context for more relevant parameter recommendations')
    }
    
    // Warn about complexity mismatches
    if (context.complexityLevel === 'simple' && context.keyParameters.length > 5) {
      warnings.push('Many parameters specified for simple analysis - consider moderate complexity level')
    }
    
    if (context.complexityLevel === 'advanced' && context.keyParameters.length < 3) {
      warnings.push('Few parameters for advanced analysis - consider including more business variables')
    }
    
    return {
      valid: suggestions.length <= 2, // Allow up to 2 suggestions for agent-generated contexts
      suggestions,
      warnings
    }
  }
}

/**
 * Agent-optimized entry point for natural language integration
 */
export async function generateFromIntent(context: AgentContext): Promise<string> {
  const agentStudio = new AgentOptimizedStudio()
  
  try {
    // Validate agent context
    const validation = agentStudio.validateContext(context)
    if (!validation.valid) {
      throw new Error(`Context validation failed: ${validation.suggestions.join(', ')}`)
    }
    
    // Find optimal template for agent context
    const template = await agentStudio.findBestTemplate(context)
    if (!template) {
      throw new Error(`No suitable template found for intent: ${context.intent}`)
    }
    
    // Generate context-aware parameter suggestions
    const parameterSuggestions = agentStudio.generateParameterSuggestions(template, context)
    
    // Create simulation configuration with agent optimizations
    const config: SimulationConfig = {
      ...template.config,
      name: `${template.config.name} (Agent Generated)`,
      description: `${template.config.description} | Generated from: ${context.naturalLanguageQuery || context.businessContext}`,
      parameters: template.config.parameters.map(param => ({
        ...param,
        default: parameterSuggestions[param.key] !== undefined ? parameterSuggestions[param.key] : param.default
      }))
    }
    
    // Return YAML configuration
    const yaml = await import('yaml')
    return yaml.default.stringify(config)
    
  } catch (error) {
    throw new Error(`Agent simulation generation failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Enhanced agent entry point with natural language processing
 */
export async function generateFromNaturalLanguage(query: string, options?: { validate?: boolean }): Promise<string> {
  const agentStudio = new AgentOptimizedStudio()
  
  // Parse natural language into structured context
  const parsedContext = agentStudio.parseIntent(query)
  
  // Ensure all required fields are present
  const fullContext: AgentContext = {
    intent: parsedContext.intent || 'roi_analysis',
    businessContext: parsedContext.businessContext || query,
    keyParameters: parsedContext.keyParameters || [],
    expectedOutputs: parsedContext.expectedOutputs || ['roi'],
    industryContext: parsedContext.industryContext,
    timeHorizon: 'annual',
    naturalLanguageQuery: query,
    targetAudience: 'business',
    complexityLevel: parsedContext.complexityLevel || 'moderate'
  }
  
  const yamlResult = await generateFromIntent(fullContext)
  
  // Add real-time validation if requested
  if (options?.validate) {
    const validator = new RealTimeValidator()
    const yamlValidation = validator.validateYaml(yamlResult)
    
    if (!yamlValidation.valid) {
      console.log(chalk.yellow(`⚠️  YAML Validation Warning: ${yamlValidation.error}`))
    }
    
    try {
      const config = yaml.parse(yamlResult) as SimulationConfig
      const configValidation = validator.validateConfig(config)
      
      if (!configValidation.valid) {
        console.log(chalk.red('❌ Configuration Validation Errors:'))
        configValidation.errors.forEach(error => console.log(chalk.red(`   • ${error}`)))
      } else {
        console.log(chalk.green('✅ Configuration validated successfully'))
        console.log(chalk.gray(`📝 Preview: ${validator.previewConfig(config)}`))
      }
    } catch (error) {
      console.log(chalk.red(`❌ Failed to parse generated YAML: ${error instanceof Error ? error.message : error}`))
    }
  }
  
  return yamlResult
}