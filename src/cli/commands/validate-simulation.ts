import { ConfigurationLoader } from '../config/loader'
import { ConfigurableSimulation } from '../../framework/ConfigurableSimulation'

export async function validateSimulation(file: string, options: any = {}) {
  const loader = new ConfigurationLoader()
  
  try {
    console.log(`🔍 Validating ${file}...`)
    
    // First validate the file structure
    const validation = await loader.validateConfigFile(file)
    
    if (!validation.valid) {
      console.error('❌ Configuration file validation failed:')
      validation.errors.forEach(error => console.error(`   ${error}`))
      process.exit(1)
    }
    
    // Load and validate simulation logic
    const config = await loader.loadConfig(file)
    const simulation = new ConfigurableSimulation(config)
    const logicValidation = simulation.validateConfiguration()
    
    if (!logicValidation.valid) {
      console.error('❌ Simulation logic validation failed:')
      logicValidation.errors.forEach(error => console.error(`   ${error}`))
      process.exit(1)
    }
    
    console.log('✅ Configuration is valid!')
    
    if (options.verbose) {
      const metadata = simulation.getMetadata()
      console.log('\n📋 Configuration Details:')
      console.log(`   Name: ${metadata.name}`)
      console.log(`   Category: ${metadata.category}`)
      console.log(`   Version: ${metadata.version}`)
      console.log(`   Parameters: ${config.parameters.length}`)
      console.log(`   Outputs: ${config.outputs?.length || 0}`)
      
      if (config.tags?.length) {
        console.log(`   Tags: ${config.tags.join(', ')}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}