import { ConfigurationLoader } from '../config/loader'

export async function createSimulation(name?: string, options: any = {}) {
  const loader = new ConfigurationLoader()
  
  try {
    // Generate a template configuration
    const template = loader.generateConfigTemplate()
    
    if (name) {
      template.name = name
    }
    
    if (options.category) {
      template.category = options.category
    }
    
    const outputPath = `${template.name.toLowerCase().replace(/\s+/g, '-')}.yaml`
    await loader.saveConfig(outputPath, template)
    console.log(`✅ Template simulation created at ${outputPath}`)
    
    if (options.interactive) {
      console.log('Interactive simulation builder not yet implemented')
    }
  } catch (error) {
    console.error('❌ Failed to create simulation:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}