import inquirer from 'inquirer'
import { SimulationConfig, ParameterType } from '../config/schema'
import { ConfigurationLoader } from '../config/loader'
import { ConfigurableSimulation } from '../../framework/ConfigurableSimulation'
import { TemplateLibrary, BusinessTemplate } from './template-library'

interface ParameterInput {
  key: string
  label: string
  type: ParameterType
  default: number | string | boolean
  description: string
  min?: number
  max?: number
  step?: number
  options?: string[]
}

interface OutputInput {
  key: string
  label: string
  description: string
}

export class InteractiveConfigBuilder {
  private loader = new ConfigurationLoader()
  private templateLibrary = new TemplateLibrary()
  
  async buildConfiguration(): Promise<SimulationConfig> {
    console.log('🚀 Monte Carlo Simulation Configuration Builder\n')
    
    // Load templates
    await this.templateLibrary.loadTemplates()
    
    // Check if user wants to start from template
    const useTemplate = await this.promptTemplateUsage()
    
    if (useTemplate) {
      const template = await this.selectTemplate()
      if (template) {
        return await this.customizeTemplate(template)
      }
    }
    
    // Build from scratch
    return await this.buildFromScratch()
  }
  
  private async buildFromScratch(): Promise<SimulationConfig> {
    console.log('🛠️  Building simulation from scratch...\n')
    
    // Basic information
    const basicInfo = await this.promptBasicInfo()
    
    // Parameters
    const parameters = await this.promptParameters()
    
    // Outputs  
    const outputs = await this.promptOutputs()
    
    // Simulation logic
    const logic = await this.promptSimulationLogic(parameters, outputs)
    
    // Optional: Parameter groups
    const groups = await this.promptParameterGroups(parameters)
    
    const config: SimulationConfig = {
      name: basicInfo.name,
      category: basicInfo.category,
      description: basicInfo.description,
      version: '1.0.0',
      tags: basicInfo.tags,
      parameters,
      outputs,
      simulation: { logic },
      ...(groups.length > 0 && { groups })
    }
    
    return config
  }
  
  private async promptTemplateUsage(): Promise<boolean> {
    const templates = this.templateLibrary.getAllTemplates()
    
    if (templates.length === 0) {
      console.log('ℹ️  No business templates available. Building from scratch.\n')
      return false
    }
    
    const { useTemplate } = await inquirer.prompt([
      {
        type: 'list',
        name: 'useTemplate',
        message: 'How would you like to create your simulation?',
        choices: [
          { name: '📋 Start from business template (recommended)', value: true },
          { name: '🛠️  Build from scratch', value: false },
          { name: '🔍 Browse available templates first', value: 'browse' }
        ]
      }
    ])
    
    if (useTemplate === 'browse') {
      await this.browseTemplates()
      return await this.promptTemplateUsage()
    }
    
    return useTemplate
  }
  
  private async selectTemplate(): Promise<BusinessTemplate | null> {
    const templates = this.templateLibrary.getAllTemplates()
    
    console.log('\n📁 Available Business Templates:')
    console.log('These templates include industry-standard parameters, proven formulas, and business intelligence metrics.\n')
    
    const choices = templates.map(template => ({
      name: `${template.info.name} - ${template.info.businessContext}`,
      value: template.info.id,
      short: template.info.name
    }))
    
    choices.push(new inquirer.Separator())
    choices.push({ name: '🔍 Search templates', value: 'search', short: 'Search' })
    choices.push({ name: '📊 Filter by category', value: 'filter', short: 'Filter' })
    choices.push({ name: '❌ Cancel - build from scratch', value: null, short: 'Cancel' })
    
    const { templateId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'templateId',
        message: 'Select a business template:',
        choices,
        pageSize: 12
      }
    ])
    
    if (templateId === 'search') {
      return await this.searchTemplates()
    } else if (templateId === 'filter') {
      return await this.filterTemplatesByCategory()
    } else if (templateId === null) {
      return null
    }
    
    const template = this.templateLibrary.getTemplate(templateId)
    if (template) {
      this.displayTemplateGuidance(template)
    }
    
    return template
  }
  
  private async searchTemplates(): Promise<BusinessTemplate | null> {
    const { query } = await inquirer.prompt([
      {
        type: 'input',
        name: 'query',
        message: 'Search templates (name, description, tags):',
        validate: (input: string) => input.trim().length > 0 || 'Search query is required'
      }
    ])
    
    const results = this.templateLibrary.searchTemplates(query)
    
    if (results.length === 0) {
      console.log('❌ No templates found matching your search.')
      return await this.selectTemplate()
    }
    
    const choices = results.map(template => ({
      name: `${template.info.name} - ${template.info.businessContext}`,
      value: template.info.id,
      short: template.info.name
    }))
    
    choices.push({ name: '🔙 Back to template selection', value: 'back', short: 'Back' })
    
    const { templateId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'templateId',
        message: `Found ${results.length} template(s):`,
        choices
      }
    ])
    
    if (templateId === 'back') {
      return await this.selectTemplate()
    }
    
    const template = this.templateLibrary.getTemplate(templateId)
    if (template) {
      this.displayTemplateGuidance(template)
    }
    
    return template
  }
  
  private async filterTemplatesByCategory(): Promise<BusinessTemplate | null> {
    const categories = this.templateLibrary.getTemplateCategories()
    
    const { category } = await inquirer.prompt([
      {
        type: 'list',
        name: 'category',
        message: 'Filter by category:',
        choices: [
          ...categories.map(cat => ({ name: cat, value: cat })),
          { name: '🔙 Back to template selection', value: 'back' }
        ]
      }
    ])
    
    if (category === 'back') {
      return await this.selectTemplate()
    }
    
    const templates = this.templateLibrary.getTemplatesByCategory(category)
    
    const choices = templates.map(template => ({
      name: `${template.info.name} - ${template.info.businessContext}`,
      value: template.info.id,
      short: template.info.name
    }))
    
    choices.push({ name: '🔙 Back to template selection', value: 'back', short: 'Back' })
    
    const { templateId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'templateId',
        message: `${category} templates:`,
        choices
      }
    ])
    
    if (templateId === 'back') {
      return await this.selectTemplate()
    }
    
    const template = this.templateLibrary.getTemplate(templateId)
    if (template) {
      this.displayTemplateGuidance(template)
    }
    
    return template
  }
  
  private displayTemplateGuidance(template: BusinessTemplate): void {
    console.log('\n' + '='.repeat(60))
    console.log(this.templateLibrary.generateBusinessGuidance(template))
    console.log('='.repeat(60) + '\n')
  }
  
  private async browseTemplates(): Promise<void> {
    const templates = this.templateLibrary.getAllTemplates()
    
    for (const template of templates) {
      console.log('\n' + '─'.repeat(50))
      console.log(`📋 ${template.info.name}`)
      console.log(`🏢 Category: ${template.info.category}`)
      console.log(`📝 ${template.info.description}`)
      console.log(`🎯 Industries: ${template.info.industryRelevance.join(', ')}`)
      console.log(`🏷️  Tags: ${template.info.tags.join(', ')}`)
    }
    
    console.log('\n' + '─'.repeat(50))
    
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...',
      }
    ])
  }
  
  private async customizeTemplate(template: BusinessTemplate): Promise<SimulationConfig> {
    console.log(`🎨 Customizing: ${template.info.name}\n`)
    
    const { customizationLevel } = await inquirer.prompt([
      {
        type: 'list',
        name: 'customizationLevel',
        message: 'How much do you want to customize this template?',
        choices: [
          { name: '⚡ Use as-is (recommended for testing)', value: 'none' },
          { name: '🔧 Light customization (name, description, basic parameters)', value: 'light' },
          { name: '🛠️  Full customization (modify all aspects)', value: 'full' }
        ]
      }
    ])
    
    if (customizationLevel === 'none') {
      return { ...template.config }
    }
    
    let config = { ...template.config }
    
    if (customizationLevel === 'light' || customizationLevel === 'full') {
      config = await this.customizeBasicInfo(config)
      config = await this.customizeKeyParameters(config, template)
    }
    
    if (customizationLevel === 'full') {
      config = await this.customizeAllParameters(config, template)
      config = await this.customizeOutputs(config)
      
      const { modifyLogic } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'modifyLogic',
          message: 'Modify simulation logic? (Advanced)',
          default: false
        }
      ])
      
      if (modifyLogic) {
        const logic = await this.promptSimulationLogic(config.parameters, config.outputs)
        config.simulation = { logic }
      }
    }
    
    return config
  }
  
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
    
    return {
      ...config,
      name: answers.name,
      description: answers.description
    }
  }
  
  private async customizeKeyParameters(config: SimulationConfig, template: BusinessTemplate): Promise<SimulationConfig> {
    console.log('\n🔧 Key Parameter Customization')
    console.log('Adjust the most important parameters for your specific use case.\n')
    
    const keyParams = config.parameters.filter(param => 
      template.guidance.parameterTips[param.key] || 
      param.key.toLowerCase().includes('arr') ||
      param.key.toLowerCase().includes('budget') ||
      param.key.toLowerCase().includes('target') ||
      param.key.toLowerCase().includes('rate')
    )
    
    const updatedParams = [...config.parameters]
    
    for (const param of keyParams.slice(0, 5)) { // Limit to top 5 most important
      const tip = template.guidance.parameterTips[param.key]
      if (tip) {
        console.log(`💡 ${param.label}: ${tip}`)
      }
      
      if (param.type === 'number') {
        const { newValue } = await inquirer.prompt([
          {
            type: 'number',
            name: 'newValue',
            message: `${param.label}:`,
            default: param.default,
            validate: (input?: number) => {
              if (input === undefined || isNaN(input)) return 'Must be a valid number'
              if (param.min !== undefined && input < param.min) return `Must be at least ${param.min}`
              if (param.max !== undefined && input > param.max) return `Must be at most ${param.max}`
              return true
            }
          }
        ])
        
        const paramIndex = updatedParams.findIndex(p => p.key === param.key)
        if (paramIndex !== -1) {
          updatedParams[paramIndex] = { ...param, default: newValue }
        }
      } else if (param.type === 'select') {
        const { newValue } = await inquirer.prompt([
          {
            type: 'list',
            name: 'newValue',
            message: `${param.label}:`,
            choices: param.options || [],
            default: param.default
          }
        ])
        
        const paramIndex = updatedParams.findIndex(p => p.key === param.key)
        if (paramIndex !== -1) {
          updatedParams[paramIndex] = { ...param, default: newValue }
        }
      }
      
      console.log() // Add spacing
    }
    
    return {
      ...config,
      parameters: updatedParams
    }
  }
  
  private async customizeAllParameters(config: SimulationConfig, template: BusinessTemplate): Promise<SimulationConfig> {
    const { customizeAll } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'customizeAll',
        message: 'Customize all parameters individually?',
        default: false
      }
    ])
    
    if (!customizeAll) {
      return config
    }
    
    const updatedParams = []
    
    for (const param of config.parameters) {
      const customized = await this.promptSingleParameter(param, template.guidance.parameterTips[param.key])
      updatedParams.push(customized)
    }
    
    return {
      ...config,
      parameters: updatedParams
    }
  }
  
  private async customizeOutputs(config: SimulationConfig): Promise<SimulationConfig> {
    const { customizeOutputs } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'customizeOutputs',
        message: 'Customize output metrics?',
        default: false
      }
    ])
    
    if (!customizeOutputs) {
      return config
    }
    
    const outputs = await this.promptOutputs()
    
    return {
      ...config,
      outputs
    }
  }
  
  private async promptBasicInfo() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Simulation name:',
        validate: (input: string) => input.trim().length > 0 || 'Name is required'
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
        validate: (input: string) => input.trim().length > 0 || 'Description is required'
      },
      {
        type: 'input',
        name: 'tags',
        message: 'Tags (comma-separated):',
        filter: (input: string) => input ? input.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
      }
    ])
    
    return answers
  }
  
  private async promptParameters(): Promise<ParameterInput[]> {
    const parameters: ParameterInput[] = []
    
    console.log('\n📊 Configure Input Parameters')
    console.log('Parameters define the inputs users can adjust when running your simulation.\n')
    
    let addMore = true
    while (addMore) {
      const param = await this.promptSingleParameter()
      parameters.push(param)
      
      const { continueAdding } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAdding',
          message: 'Add another parameter?',
          default: true
        }
      ])
      
      addMore = continueAdding
    }
    
    return parameters
  }
  
  private async promptSingleParameter(existingParam?: ParameterInput, businessTip?: string): Promise<ParameterInput> {
    if (businessTip) {
      console.log(`💡 Business Tip: ${businessTip}\n`)
    }
    
    const basic = await inquirer.prompt([
      {
        type: 'input',
        name: 'key',
        message: 'Parameter key (variable name):',
        default: existingParam?.key,
        validate: (input: string) => {
          if (!input.trim()) return 'Key is required'
          if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(input)) return 'Key must be a valid variable name'
          return true
        }
      },
      {
        type: 'input',
        name: 'label',
        message: 'Display label:',
        default: existingParam?.label,
        validate: (input: string) => input.trim().length > 0 || 'Label is required'
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
        validate: (input: string) => input.trim().length > 0 || 'Description is required'
      }
    ])
    
    let additional: any = {}
    
    if (basic.type === 'number') {
      const defaultVal = await inquirer.prompt({
        type: 'number',
        name: 'default',
        message: 'Default value:',
        default: existingParam?.type === 'number' ? existingParam.default as number : undefined,
        validate: (input?: number) => input !== undefined && !isNaN(input) || 'Must be a valid number'
      })
      
      const minVal = await inquirer.prompt({
        type: 'number',
        name: 'min',
        message: 'Minimum value (optional):',
        default: existingParam?.type === 'number' ? existingParam.min : undefined
      })
      
      const maxVal = await inquirer.prompt({
        type: 'number',
        name: 'max',
        message: 'Maximum value (optional):',
        default: existingParam?.type === 'number' ? existingParam.max : undefined
      })
      
      const stepVal = await inquirer.prompt({
        type: 'number',
        name: 'step',
        message: 'Step size (optional):',
        default: existingParam?.type === 'number' ? existingParam.step : undefined
      })
      
      additional = {
        default: defaultVal.default,
        min: minVal.min,
        max: maxVal.max,
        step: stepVal.step
      }
    } else if (basic.type === 'boolean') {
      additional = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'default',
          message: 'Default value:',
          default: existingParam?.type === 'boolean' ? existingParam.default as boolean : false
        }
      ])
    } else if (basic.type === 'string') {
      additional = await inquirer.prompt([
        {
          type: 'input',
          name: 'default',
          message: 'Default value:',
          default: existingParam?.type === 'string' ? existingParam.default as string : ''
        }
      ])
    } else if (basic.type === 'select') {
      const { options } = await inquirer.prompt([
        {
          type: 'input',
          name: 'options',
          message: 'Options (comma-separated):',
          default: existingParam?.type === 'select' && existingParam.options ? existingParam.options.join(', ') : '',
          validate: (input: string) => input.trim().length > 0 || 'At least one option is required',
          filter: (input: string) => input.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0)
        }
      ])
      
      const { defaultOption } = await inquirer.prompt([
        {
          type: 'list',
          name: 'defaultOption',
          message: 'Default option:',
          choices: options,
          default: existingParam?.type === 'select' ? existingParam.default : options[0]
        }
      ])
      
      additional = { options, default: defaultOption }
    }
    
    return { ...basic, ...additional }
  }
  
  private async promptOutputs(): Promise<OutputInput[]> {
    const outputs: OutputInput[] = []
    
    console.log('\n📈 Configure Output Metrics')
    console.log('Outputs define the metrics your simulation will calculate and track.\n')
    
    let addMore = true
    while (addMore) {
      const output = await inquirer.prompt([
        {
          type: 'input',
          name: 'key',
          message: 'Output key (variable name):',
          validate: (input: string) => {
            if (!input.trim()) return 'Key is required'
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(input)) return 'Key must be a valid variable name'
            return true
          }
        },
        {
          type: 'input',
          name: 'label',
          message: 'Display label:',
          validate: (input: string) => input.trim().length > 0 || 'Label is required'
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description:',
          validate: (input: string) => input.trim().length > 0 || 'Description is required'
        }
      ])
      
      outputs.push(output)
      
      const { continueAdding } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAdding',
          message: 'Add another output?',
          default: false
        }
      ])
      
      addMore = continueAdding
    }
    
    return outputs
  }
  
  private async promptSimulationLogic(parameters: ParameterInput[], outputs: OutputInput[]): Promise<string> {
    console.log('\n⚡ Simulation Logic')
    console.log('Write JavaScript code that uses your parameters to calculate the outputs.')
    console.log('Available functions: random(), sqrt(), pow(), log(), exp(), abs(), min(), max(), floor(), ceil(), round()')
    console.log(`Available parameters: ${parameters.map(p => p.key).join(', ')}`)
    console.log(`Required outputs: return { ${outputs.map(o => o.key).join(', ')} }\n`)
    
    const { logic } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'logic',
        message: 'Simulation logic (opens in your default editor):',
        default: this.generateDefaultLogic(parameters, outputs),
        validate: (input: string) => {
          if (!input.trim()) return 'Simulation logic is required'
          
          // Basic validation - check if it returns something
          if (!input.includes('return')) {
            return 'Logic must include a return statement'
          }
          
          return true
        }
      }
    ])
    
    return logic
  }
  
  private generateDefaultLogic(parameters: ParameterInput[], outputs: OutputInput[]): string {
    const paramUsage = parameters.map(p => `  // ${p.description}\n  // ${p.key} = ${p.default}`).join('\n')
    const outputReturn = outputs.map(o => `${o.key}: 0 // TODO: Calculate ${o.description.toLowerCase()}`).join(',\n    ')
    
    return `// Simulation logic - replace this with your calculations
${paramUsage}

  // Example calculation using random variation
  const result = ${parameters[0]?.key || '100'} * (0.8 + random() * 0.4)
  
  return {
    ${outputReturn}
  }`
  }
  
  private async promptParameterGroups(parameters: ParameterInput[]): Promise<any[]> {
    if (parameters.length <= 3) return []
    
    const { addGroups } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addGroups',
        message: 'Group parameters for better organization?',
        default: false
      }
    ])
    
    if (!addGroups) return []
    
    console.log('\n📁 Parameter Groups')
    console.log('Group related parameters together for better user experience.\n')
    
    const groups = []
    const availableParams = [...parameters]
    
    while (availableParams.length > 0) {
      const groupName = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Group name:',
        validate: (input: string) => input.trim().length > 0 || 'Group name is required'
      })
      
      const groupDesc = await inquirer.prompt({
        type: 'input',
        name: 'description',
        message: 'Group description:',
        validate: (input: string) => input.trim().length > 0 || 'Description is required'
      })
      
      const groupParams = await inquirer.prompt({
        type: 'checkbox',
        name: 'parameters',
        message: 'Select parameters for this group:',
        choices: availableParams.map(p => ({ name: `${p.label} (${p.key})`, value: p.key })),
        validate: (input: readonly unknown[]) => input.length > 0 || 'Select at least one parameter'
      })
      
      const group = {
        name: groupName.name,
        description: groupDesc.description,
        parameters: groupParams.parameters
      }
      
      groups.push(group)
      
      // Remove selected parameters from available list
      group.parameters.forEach((paramKey: string) => {
        const index = availableParams.findIndex(p => p.key === paramKey)
        if (index !== -1) availableParams.splice(index, 1)
      })
      
      if (availableParams.length === 0) break
      
      const { continueGrouping } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueGrouping',
          message: `Create another group? (${availableParams.length} parameters remaining)`,
          default: false
        }
      ])
      
      if (!continueGrouping) {
        // Add remaining parameters to a default group
        if (availableParams.length > 0) {
          groups.push({
            name: 'Other Settings',
            description: 'Additional parameters',
            parameters: availableParams.map(p => p.key)
          })
        }
        break
      }
    }
    
    return groups
  }
  
  async testConfiguration(config: SimulationConfig): Promise<boolean> {
    console.log('\n🧪 Testing Configuration...')
    
    try {
      const simulation = new ConfigurableSimulation(config)
      const validation = simulation.validateConfiguration()
      
      if (!validation.valid) {
        console.error('❌ Configuration validation failed:')
        validation.errors.forEach(error => console.error(`   ${error}`))
        return false
      }
      
      // Test with default parameters
      const defaultParams: Record<string, unknown> = {}
      config.parameters.forEach(param => {
        defaultParams[param.key] = param.default
      })
      
      const result = simulation.simulateScenario(defaultParams)
      console.log('✅ Configuration test passed!')
      console.log('📊 Sample result:', result)
      
      return true
    } catch (error) {
      console.error('❌ Configuration test failed:', error instanceof Error ? error.message : String(error))
      return false
    }
  }
  
  async saveConfiguration(config: SimulationConfig): Promise<string> {
    const filename = `${config.name.toLowerCase().replace(/\s+/g, '-')}.yaml`
    
    const { confirmSave, customPath } = await inquirer.prompt([
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
    ])
    
    if (!confirmSave) {
      throw new Error('Save cancelled by user')
    }
    
    const filePath = customPath || filename
    await this.loader.saveConfig(filePath, config)
    
    return filePath
  }
}