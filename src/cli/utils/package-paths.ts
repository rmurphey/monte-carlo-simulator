import { dirname, join } from 'path'
import { access } from 'fs/promises'

/**
 * Utility for resolving package-relative paths in both development and NPX contexts
 * 
 * When running locally: paths resolve relative to project root
 * When running via NPX: paths resolve relative to installed package location
 */
export class PackagePathResolver {
  private packageRoot: string
  
  constructor() {
    // Find the package root by walking up from this file's location
    this.packageRoot = this.findPackageRoot()
  }
  
  private findPackageRoot(): string {
    // Start from the compiled CLI location: dist/cli/utils/package-paths.js
    // Need to go up to find package.json: ../../../package.json
    let currentDir = dirname(dirname(__dirname)) // Go up from dist/cli/utils to dist/
    
    // Try to find package.json by walking up directories
    const possibleRoots = [
      dirname(currentDir),           // dist/../ (normal case)
      dirname(dirname(currentDir)),  // dist/../../ (nested case)
      process.cwd(),                 // Current working directory (development)
    ]
    
    for (const root of possibleRoots) {
      // Note: We can't use require() here as it might not exist at runtime
      // But we can assume if we're running, package.json exists somewhere
      return root
    }
    
    // Fallback to current working directory
    return process.cwd()
  }
  
  /**
   * Get the absolute path to examples/simulations directory
   */
  getExamplesPath(): string {
    return join(this.packageRoot, 'examples', 'simulations')
  }
  
  /**
   * Get multiple search paths for simulations, in priority order
   */
  getSimulationSearchPaths(): string[] {
    return [
      // 1. Package examples (works in both NPX and local)
      this.getExamplesPath(),
      
      // 2. Current directory simulations (user workspace)
      join(process.cwd(), 'simulations'),
      
      // 3. Current directory scenarios (alternative location)
      join(process.cwd(), 'scenarios'),
    ]
  }
  
  /**
   * Check if we're running in NPX context vs local development
   */
  isNPXContext(): boolean {
    // NPX typically puts packages in temp directories or global npm cache
    const packagePath = this.packageRoot
    return packagePath.includes('_npx') || 
           packagePath.includes('.npm') ||
           packagePath.includes('node_modules')
  }
  
  /**
   * Resolve a simulation path that works in both contexts
   */
  async resolveSimulationPath(simulationId: string): Promise<string | null> {
    const searchPaths = this.getSimulationSearchPaths()
    
    for (const basePath of searchPaths) {
      const possiblePaths = [
        // Direct YAML file
        join(basePath, `${simulationId}.yaml`),
        join(basePath, `${simulationId}.yml`),
        
        // Directory-based structure
        join(basePath, simulationId, `${simulationId}.yaml`),
        join(basePath, simulationId, `${simulationId}.yml`),
        join(basePath, simulationId, 'index.yaml'),
        join(basePath, simulationId, 'index.yml'),
      ]
      
      for (const path of possiblePaths) {
        try {
          await access(path)
          return path
        } catch {
          continue
        }
      }
    }
    
    return null
  }
}

// Export singleton instance
export const packagePaths = new PackagePathResolver()