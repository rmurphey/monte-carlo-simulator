/**
 * Simulation Registry and Loader for Web Context
 * Handles discovery, caching, and loading of simulation files
 */

interface SimulationManifest {
  name: string
  filename: string
  display: string
  description: string
  category?: string
  version?: string
  tags?: string[]
}

interface ParsedSimulation {
  name: string
  category: string
  description: string
  version: string
  tags: string[]
  parameters: any[]
  outputs?: any[]
  simulation: {
    logic: string
  }
}

export class SimulationLoader {
  private manifestCache: SimulationManifest[] | null = null
  private simulationCache = new Map<string, ParsedSimulation>()
  private readonly manifestUrl = '/examples/simulations/manifest.json'
  
  /**
   * Load and cache the simulation manifest
   */
  async loadManifest(): Promise<SimulationManifest[]> {
    if (this.manifestCache) {
      return this.manifestCache
    }
    
    try {
      const response = await fetch(this.manifestUrl)
      if (!response.ok) {
        throw new Error(`Failed to load simulation manifest: ${response.status}`)
      }
      
      this.manifestCache = await response.json()
      return this.manifestCache!
    } catch (error) {
      console.error('Failed to load simulation manifest:', error)
      throw new Error(`Cannot load simulation manifest: ${error}`)
    }
  }
  
  /**
   * Get simulation metadata by name
   */
  async getSimulationInfo(simulationName: string): Promise<SimulationManifest | null> {
    const manifest = await this.loadManifest()
    return manifest.find(sim => sim.filename.replace('.yaml', '') === simulationName) || null
  }
  
  /**
   * Load and parse a simulation YAML file
   */
  async loadSimulation(simulationName: string): Promise<ParsedSimulation> {
    // Check cache first
    if (this.simulationCache.has(simulationName)) {
      return this.simulationCache.get(simulationName)!
    }
    
    // Get simulation info from manifest
    const simInfo = await this.getSimulationInfo(simulationName)
    if (!simInfo) {
      throw new Error(`Simulation '${simulationName}' not found in manifest`)
    }
    
    try {
      // Fetch the YAML file
      const response = await fetch(`/examples/simulations/${simulationName}.yaml`)
      if (!response.ok) {
        throw new Error(`Simulation file not found: ${simulationName}.yaml (${response.status})`)
      }
      
      const yamlText = await response.text()
      const parsed = this.parseSimulationYAML(yamlText)
      
      // Cache the parsed simulation
      this.simulationCache.set(simulationName, parsed)
      
      return parsed
    } catch (error) {
      console.error(`Failed to load simulation '${simulationName}':`, error)
      throw error
    }
  }
  
  /**
   * Parse YAML simulation content
   */
  private parseSimulationYAML(yamlText: string): ParsedSimulation {
    const lines = yamlText.split('\n')
    const simulation: any = {
      name: '',
      category: 'General',
      description: '',
      version: '1.0.0',
      tags: [],
      parameters: [],
      outputs: []
    }
    
    let currentSection = ''
    let currentParameter: any = null
    let currentOutput: any = null
    let simulationLogic = ''
    let inSimulationSection = false
    let logicIndent = 0
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      
      const indent = line.length - line.trimStart().length
      
      // Handle simulation logic section
      if (inSimulationSection && trimmed.startsWith('logic:')) {
        const logicStart = line.indexOf('|')
        if (logicStart !== -1) {
          // Multi-line logic with | indicator
          continue
        } else {
          // Single line logic
          simulationLogic = trimmed.split(':')[1].trim()
        }
        continue
      }
      
      if (inSimulationSection && indent > logicIndent) {
        // Accumulate logic lines
        simulationLogic += line.substring(logicIndent) + '\n'
        continue
      }
      
      // Handle top-level properties
      if (indent === 0) {
        inSimulationSection = false
        
        this.parseSimulationProperty(simulation, trimmed)
        
        if (trimmed === 'parameters:') {
          currentSection = 'parameters'
        } else if (trimmed === 'outputs:') {
          currentSection = 'outputs'
        } else if (trimmed === 'simulation:') {
          currentSection = 'simulation'
          inSimulationSection = true
          logicIndent = 4 // Expect logic to be indented 4 spaces
        }
      } 
      // Handle parameters section
      else if (currentSection === 'parameters' && indent === 2) {
        if (trimmed.startsWith('- key:')) {
          if (currentParameter) {
            simulation.parameters.push(currentParameter)
          }
          currentParameter = {
            key: trimmed.split(':')[1].trim().replace(/['"]/g, ''),
            label: '',
            type: 'number',
            default: 0
          }
        }
      } else if (currentParameter && indent === 4 && currentSection === 'parameters') {
        if (trimmed.startsWith('label:')) {
          currentParameter.label = trimmed.split(':')[1].trim().replace(/['"]/g, '')
        } else if (trimmed.startsWith('type:')) {
          currentParameter.type = trimmed.split(':')[1].trim().replace(/['"]/g, '')
        } else if (trimmed.startsWith('default:')) {
          const defaultValue = trimmed.split(':')[1].trim().replace(/['"]/g, '')
          currentParameter.default = currentParameter.type === 'number' ? 
            parseFloat(defaultValue) : 
            currentParameter.type === 'boolean' ? 
              defaultValue === 'true' : 
              defaultValue
        } else if (trimmed.startsWith('min:')) {
          currentParameter.min = parseFloat(trimmed.split(':')[1].trim())
        } else if (trimmed.startsWith('max:')) {
          currentParameter.max = parseFloat(trimmed.split(':')[1].trim())
        } else if (trimmed.startsWith('step:')) {
          currentParameter.step = parseFloat(trimmed.split(':')[1].trim())
        } else if (trimmed.startsWith('description:')) {
          currentParameter.description = trimmed.split(':')[1].trim().replace(/['"]/g, '')
        }
      }
      // Handle outputs section
      else if (currentSection === 'outputs' && indent === 2) {
        if (trimmed.startsWith('- key:')) {
          if (currentOutput) {
            simulation.outputs.push(currentOutput)
          }
          currentOutput = {
            key: trimmed.split(':')[1].trim().replace(/['"]/g, ''),
            label: '',
            description: ''
          }
        }
      } else if (currentOutput && indent === 4 && currentSection === 'outputs') {
        if (trimmed.startsWith('label:')) {
          currentOutput.label = trimmed.split(':')[1].trim().replace(/['"]/g, '')
        } else if (trimmed.startsWith('description:')) {
          currentOutput.description = trimmed.split(':')[1].trim().replace(/['"]/g, '')
        }
      }
    }
    
    // Add the last parameter and output
    if (currentParameter) {
      simulation.parameters.push(currentParameter)
    }
    if (currentOutput) {
      simulation.outputs.push(currentOutput)
    }
    
    // Add simulation logic
    simulation.simulation = {
      logic: simulationLogic.trim() || `
      // Default simulation logic for ${simulation.name}
      const results = [];
      const iterations = params.iterations || 1000;
      
      for (let i = 0; i < iterations; i++) {
        const result = {
          value: Math.random() * 1000,
          profit: (Math.random() - 0.5) * 500
        };
        results.push(result);
      }
      
      return results;
      `
    }
    
    return simulation
  }
  
  /**
   * Clear all caches (useful for development/testing)
   */
  private parseSimulationProperty(simulation: any, trimmed: string) {
    if (trimmed.startsWith('name:')) {
      simulation.name = trimmed.split(':')[1].trim().replace(/['"]/g, '')
    } else if (trimmed.startsWith('category:')) {
      simulation.category = trimmed.split(':')[1].trim().replace(/['"]/g, '')
    } else if (trimmed.startsWith('description:')) {
      simulation.description = trimmed.split(':')[1].trim().replace(/['"]/g, '')
    } else if (trimmed.startsWith('version:')) {
      simulation.version = trimmed.split(':')[1].trim().replace(/['"]/g, '')
    } else if (trimmed.startsWith('tags:')) {
      const tagsText = trimmed.split(':')[1].trim()
      if (tagsText.startsWith('[') && tagsText.endsWith(']')) {
        simulation.tags = tagsText.slice(1, -1).split(',').map(t => t.trim().replace(/['"]/g, ''))
      }
    }
  }

  clearCache() {
    this.manifestCache = null
    this.simulationCache.clear()
  }
}