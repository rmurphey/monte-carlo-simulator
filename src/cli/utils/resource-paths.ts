import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

/**
 * Get resource paths for templates, examples, and other bundled resources.
 * Works in both development and NPX installation contexts.
 */
export function getResourcePaths() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  
  // When installed via npm/npx, we're in node_modules/monte-carlo-simulator/dist/cli/utils/
  // When in development, we're in src/cli/utils/
  
  // Try to find package root by looking for package.json
  let packageRoot = __dirname
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    const packageJsonPath = join(packageRoot, 'package.json')
    if (existsSync(packageJsonPath)) {
      break
    }
    packageRoot = join(packageRoot, '..')
    attempts++
  }
  
  if (attempts >= maxAttempts) {
    throw new Error('Could not find package root (package.json not found)')
  }
  
  const paths = {
    templates: join(packageRoot, 'templates'),
    examples: join(packageRoot, 'examples'),
    docs: join(packageRoot, 'docs'),
    schemas: join(packageRoot, 'dist', 'schemas')
  }
  
  // Validate that critical paths exist
  if (!existsSync(paths.templates)) {
    throw new Error(`Templates directory not found at: ${paths.templates}`)
  }
  
  if (!existsSync(paths.examples)) {
    throw new Error(`Examples directory not found at: ${paths.examples}`)
  }
  
  return paths
}

/**
 * Get the package root directory
 */
export function getPackageRoot(): string {
  const paths = getResourcePaths()
  return dirname(paths.templates) // templates is in package root
}

/**
 * Resolve a resource file path, checking multiple possible locations
 * @param filename - File to find (e.g., 'simple-roi-analysis.yaml')
 * @param category - Category of resource ('templates', 'examples', 'docs')
 */
export function resolveResourceFile(filename: string, category: 'templates' | 'examples' | 'docs'): string | null {
  const paths = getResourcePaths()
  const categoryPath = paths[category]
  
  // Direct file in category directory
  const directPath = join(categoryPath, filename)
  if (existsSync(directPath)) {
    return directPath
  }
  
  // For examples, also check simulations subdirectory
  if (category === 'examples') {
    const simulationsPath = join(categoryPath, 'simulations', filename)
    if (existsSync(simulationsPath)) {
      return simulationsPath
    }
  }
  
  return null
}

/**
 * List available resources in a category
 */
export function listResourceFiles(category: 'templates' | 'examples' | 'docs'): string[] {
  const paths = getResourcePaths()
  const fs = require('fs')
  
  const categoryPath = paths[category]
  if (!existsSync(categoryPath)) {
    return []
  }
  
  const files: string[] = []
  
  // Get files directly in category directory
  const directFiles = fs.readdirSync(categoryPath)
    .filter((f: string) => f.endsWith('.yaml') || f.endsWith('.md'))
    .filter((f: string) => f !== 'README.md') // Exclude README files from listings
  
  files.push(...directFiles)
  
  // For examples, also check simulations subdirectory
  if (category === 'examples') {
    const simulationsPath = join(categoryPath, 'simulations')
    if (existsSync(simulationsPath)) {
      const simulationFiles = fs.readdirSync(simulationsPath)
        .filter((f: string) => f.endsWith('.yaml'))
        .map((f: string) => `simulations/${f}`)
      files.push(...simulationFiles)
    }
  }
  
  return files.sort()
}