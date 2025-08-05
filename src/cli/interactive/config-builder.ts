import inquirer from 'inquirer'
import { SimulationConfig, ParameterType } from '../config/schema'
import { ConfigurationLoader } from '../config/loader'
import { ConfigurableSimulation } from '../../framework/ConfigurableSimulation'

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
  
  async buildConfiguration(): Promise<SimulationConfig> {
    console.log('🚀 Monte Carlo Simulation Configuration Builder\n')
    
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
  
  private async promptSingleParameter(): Promise<ParameterInput> {
    const basic = await inquirer.prompt([
      {
        type: 'input',
        name: 'key',
        message: 'Parameter key (variable name):',
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
        type: 'list',
        name: 'type',
        message: 'Parameter type:',
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
        validate: (input: string) => input.trim().length > 0 || 'Description is required'
      }
    ])
    
    let additional: any = {}
    
    if (basic.type === 'number') {
      const defaultVal = await inquirer.prompt({
        type: 'number',
        name: 'default',
        message: 'Default value:',
        validate: (input?: number) => input !== undefined && !isNaN(input) || 'Must be a valid number'
      })
      
      const minVal = await inquirer.prompt({
        type: 'number',
        name: 'min',
        message: 'Minimum value (optional):'
      })
      
      const maxVal = await inquirer.prompt({
        type: 'number',
        name: 'max',
        message: 'Maximum value (optional):'
      })
      
      const stepVal = await inquirer.prompt({
        type: 'number',
        name: 'step',
        message: 'Step size (optional):'
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
          default: false
        }
      ])
    } else if (basic.type === 'string') {
      additional = await inquirer.prompt([
        {
          type: 'input',
          name: 'default',
          message: 'Default value:',
          default: ''
        }
      ])
    } else if (basic.type === 'select') {
      const { options } = await inquirer.prompt([
        {
          type: 'input',
          name: 'options',
          message: 'Options (comma-separated):',
          validate: (input: string) => input.trim().length > 0 || 'At least one option is required',
          filter: (input: string) => input.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0)
        }
      ])
      
      const { defaultOption } = await inquirer.prompt([
        {
          type: 'list',
          name: 'defaultOption',
          message: 'Default option:',
          choices: options
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