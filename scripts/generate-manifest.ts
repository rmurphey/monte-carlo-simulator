#!/usr/bin/env tsx

/**
 * Generate simulation manifest from YAML files
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

interface SimulationManifest {
  name: string
  filename: string
  display: string
  description: string
  category?: string
  version?: string
  tags?: string[]
}

function extractMetadataFromYAML(yamlContent: string): Partial<SimulationManifest> {
  const lines = yamlContent.split('\n')
  const metadata: any = {}
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    
    // Stop at first section (parameters:, outputs:, etc.)
    if (trimmed.endsWith(':') && !trimmed.includes(' ')) {
      if (!['name:', 'category:', 'description:', 'version:', 'tags:'].includes(trimmed)) {
        break
      }
    }
    
    if (trimmed.startsWith('name:')) {
      metadata.name = trimmed.split(':')[1].trim().replace(/['"]/g, '')
    } else if (trimmed.startsWith('category:')) {
      metadata.category = trimmed.split(':')[1].trim().replace(/['"]/g, '')
    } else if (trimmed.startsWith('description:')) {
      metadata.description = trimmed.split(':')[1].trim().replace(/['"]/g, '')
    } else if (trimmed.startsWith('version:')) {
      metadata.version = trimmed.split(':')[1].trim().replace(/['"]/g, '')
    } else if (trimmed.startsWith('tags:')) {
      const tagsText = trimmed.split(':')[1].trim()
      if (tagsText.startsWith('[') && tagsText.endsWith(']')) {
        metadata.tags = tagsText.slice(1, -1).split(',').map(t => t.trim().replace(/['"]/g, ''))
      }
    }
  }
  
  return metadata
}

function generateManifest() {
  const simulationsDir = join(process.cwd(), 'examples', 'simulations')
  const yamlFiles = readdirSync(simulationsDir).filter(file => file.endsWith('.yaml'))
  
  const manifest: SimulationManifest[] = []
  
  for (const filename of yamlFiles) {
    try {
      const filepath = join(simulationsDir, filename)
      const yamlContent = readFileSync(filepath, 'utf8')
      const metadata = extractMetadataFromYAML(yamlContent)
      
      const simulationName = filename.replace('.yaml', '')
      const entry: SimulationManifest = {
        name: simulationName,
        filename,
        display: metadata.name || simulationName,
        description: metadata.description || `${metadata.name || simulationName} simulation`,
        ...metadata
      }
      
      manifest.push(entry)
    } catch (error) {
      console.warn(`Failed to process ${filename}:`, error)
    }
  }
  
  // Sort by display name for consistent ordering
  manifest.sort((a, b) => a.display.localeCompare(b.display))
  
  const manifestPath = join(simulationsDir, 'manifest.json')
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  
  console.log(`Generated manifest with ${manifest.length} simulations:`)
  manifest.forEach(sim => console.log(`  - ${sim.display} (${sim.name})`))
}

generateManifest()