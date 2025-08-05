import { promises as fs } from 'fs'
import { dirname, join, extname, resolve, isAbsolute } from 'path'
import * as yaml from 'js-yaml'
import { SimulationConfig, ConfigurationValidator, ParameterConfig, ParameterGroupConfig, OutputConfig } from './schema'

export class ConfigurationLoader {
  private validator = new ConfigurationValidator()
  private loadedConfigs = new Map<string, SimulationConfig>() // Cache to prevent circular references
  
  async loadConfig(filePath: string): Promise<SimulationConfig> {
    try {
      // Normalize path to prevent circular reference issues
      const normalizedPath = resolve(filePath)
      
      // Check cache first
      if (this.loadedConfigs.has(normalizedPath)) {
        return this.loadedConfigs.get(normalizedPath)!
      }
      
      const content = await fs.readFile(filePath, 'utf8')
      let config = this.parseContent(content, filePath) as SimulationConfig
      
      // Handle base simulation inheritance
      if (config.baseSimulation) {
        config = await this.mergeWithBase(config, filePath)
      }
      
      const validation = this.validator.validateConfig(config)
      if (!validation.valid) {
        throw new Error(`Invalid configuration in ${filePath}:\n${validation.errors.join('\n')}`)
      }
      
      // Cache the resolved config
      this.loadedConfigs.set(normalizedPath, config)
      
      return config
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load configuration from ${filePath}: ${error.message}`)
      }
      throw error
    }
  }
  
  private async mergeWithBase(config: SimulationConfig, configPath: string): Promise<SimulationConfig> {
    const basePath = this.resolveBasePath(config.baseSimulation!, configPath)
    const baseConfig = await this.loadConfig(basePath)
    
    // Create merged configuration
    const merged: SimulationConfig = {
      // Base simulation properties as defaults
      name: config.name,
      category: config.category,
      description: config.description,
      version: config.version,
      tags: config.tags,
      
      // Parameters: merge arrays, child overrides base
      parameters: this.mergeParameters(baseConfig.parameters, config.parameters),
      
      // Groups: merge arrays, child overrides base  
      groups: this.mergeGroups(baseConfig.groups, config.groups),
      
      // Outputs: merge arrays, child overrides base (child can add or override outputs)
      outputs: this.mergeOutputs(baseConfig.outputs, config.outputs || []),
      
      // Simulation logic: child overrides base completely
      simulation: {
        logic: config.simulation?.logic || baseConfig.simulation.logic
      }
    }
    
    return merged
  }
  
  private resolveBasePath(basePath: string, configPath: string): string {
    if (isAbsolute(basePath)) {
      return basePath
    }
    
    // Resolve relative to the config file's directory
    return resolve(dirname(configPath), basePath)
  }
  
  private mergeParameters(baseParams: ParameterConfig[], childParams: ParameterConfig[]): ParameterConfig[] {
    const merged = new Map<string, ParameterConfig>()
    
    // Add all base parameters
    for (const param of baseParams) {
      merged.set(param.key, { ...param })
    }
    
    // Override with child parameters
    for (const param of childParams) {
      merged.set(param.key, { ...param })
    }
    
    return Array.from(merged.values())
  }
  
  private mergeGroups(baseGroups: ParameterGroupConfig[] = [], childGroups: ParameterGroupConfig[] = []): ParameterGroupConfig[] {
    const merged = new Map<string, ParameterGroupConfig>()
    
    // Add all base groups
    for (const group of baseGroups) {
      merged.set(group.name, { ...group, parameters: [...group.parameters] })
    }
    
    // Override with child groups
    for (const group of childGroups) {
      merged.set(group.name, { ...group, parameters: [...group.parameters] })
    }
    
    return Array.from(merged.values())
  }
  
  private mergeOutputs(baseOutputs: OutputConfig[], childOutputs: OutputConfig[]): OutputConfig[] {
    const merged = new Map<string, OutputConfig>()
    
    // Add all base outputs
    for (const output of baseOutputs) {
      merged.set(output.key, { ...output })
    }
    
    // Override with child outputs
    for (const output of childOutputs) {
      merged.set(output.key, { ...output })
    }
    
    return Array.from(merged.values())
  }
  
  async loadMultipleConfigs(directory: string): Promise<SimulationConfig[]> {
    try {
      const files = await fs.readdir(directory)
      const configFiles = files.filter(file => 
        file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json')
      )
      
      const configs: SimulationConfig[] = []
      const errors: string[] = []
      
      for (const file of configFiles) {
        try {
          const config = await this.loadConfig(join(directory, file))
          configs.push(config)
        } catch (error) {
          errors.push(`${file}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
      
      if (errors.length > 0) {
        console.warn(`⚠️  Failed to load some configurations:\n${errors.join('\n')}`)
      }
      
      return configs
    } catch (error) {
      throw new Error(`Failed to load configurations from ${directory}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  async saveConfig(filePath: string, config: SimulationConfig): Promise<void> {
    try {
      // Validate before saving
      const validation = this.validator.validateConfig(config)
      if (!validation.valid) {
        throw new Error(`Invalid configuration:\n${validation.errors.join('\n')}`)
      }
      
      // Ensure directory exists
      await fs.mkdir(dirname(filePath), { recursive: true })
      
      // Determine format from extension
      const ext = extname(filePath).toLowerCase()
      let content: string
      
      if (ext === '.json') {
        content = JSON.stringify(config, null, 2)
      } else {
        // Default to YAML
        content = yaml.dump(config, {
          indent: 2,
          lineWidth: 100,
          noRefs: true,
          sortKeys: false
        })
      }
      
      await fs.writeFile(filePath, content, 'utf8')
    } catch (error) {
      throw new Error(`Failed to save configuration to ${filePath}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  private parseContent(content: string, filePath: string): unknown {
    const ext = extname(filePath).toLowerCase()
    
    if (ext === '.json') {
      try {
        return JSON.parse(content)
      } catch (error) {
        throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`)
      }
    } else {
      // Assume YAML for .yaml, .yml, or any other extension
      try {
        return yaml.load(content)
      } catch (error) {
        throw new Error(`Invalid YAML: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }
  
  async validateConfigFile(filePath: string): Promise<{ valid: boolean; errors: string[] }> {
    try {
      await this.loadConfig(filePath)
      return { valid: true, errors: [] }
    } catch (error) {
      return { 
        valid: false, 
        errors: [error instanceof Error ? error.message : String(error)]
      }
    }
  }
  
  async getConfigMetadata(filePath: string): Promise<{
    name: string
    category: string
    version: string
    parameterCount: number
    outputCount: number
  } | null> {
    try {
      const config = await this.loadConfig(filePath)
      return {
        name: config.name,
        category: config.category,
        version: config.version,
        parameterCount: config.parameters.length,
        outputCount: config.outputs.length
      }
    } catch {
      return null
    }
  }
  
  generateConfigTemplate(): SimulationConfig {
    return {
      name: 'My Simulation',
      category: 'Finance',
      description: 'Description of what this simulation models',
      version: '1.0.0',
      tags: ['example', 'template'],
      parameters: [
        {
          key: 'sampleParameter',
          label: 'Sample Parameter',
          type: 'number',
          default: 100,
          min: 0,
          max: 1000,
          description: 'A sample numeric parameter'
        }
      ],
      outputs: [
        {
          key: 'result',
          label: 'Result',
          description: 'The simulation result'
        }
      ],
      simulation: {
        logic: `
// Your simulation logic here
const result = sampleParameter * (0.8 + Math.random() * 0.4)
return { result }
        `.trim()
      }
    }
  }
}