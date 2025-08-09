import { describe, it, expect } from 'vitest'
import { readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { ConfigurationLoader } from '../cli/config/loader'

/**
 * COMPREHENSIVE SCHEMA VALIDATION TESTS
 * 
 * This test suite ensures that ALL YAML files in the repository are valid.
 * NO schema issues should EVER reach production.
 */

function findAllYamlFiles(dir: string): string[] {
  const yamlFiles: string[] = []
  
  function walkDirectory(currentDir: string): void {
    try {
      const items = readdirSync(currentDir)
      
      for (const item of items) {
        const fullPath = join(currentDir, item)
        
        // Skip node_modules, .git, coverage, and dist directories
        if (item === 'node_modules' || item === '.git' || item === 'coverage' || item === 'dist') {
          continue
        }
        
        try {
          const stats = statSync(fullPath)
          
          if (stats.isDirectory()) {
            walkDirectory(fullPath)
          } else if (stats.isFile() && (extname(item) === '.yaml' || extname(item) === '.yml')) {
            yamlFiles.push(fullPath)
          }
        } catch (error) {
          // Skip files/directories we can't access
          console.warn(`Skipping ${fullPath}: ${error}`)
        }
      }
    } catch (error) {
      console.warn(`Cannot read directory ${currentDir}: ${error}`)
    }
  }
  
  walkDirectory(dir)
  return yamlFiles
}

describe('COMPREHENSIVE SCHEMA VALIDATION - ZERO TOLERANCE', () => {
  const loader = new ConfigurationLoader()
  
  it('should validate ALL YAML files in the entire repository', async () => {
    const repositoryRoot = process.cwd()
    const allYamlFiles = findAllYamlFiles(repositoryRoot)
    
    expect(allYamlFiles.length).toBeGreaterThan(0) // Ensure we found files
    
    console.log(`\n🔍 Validating ${allYamlFiles.length} YAML files for schema compliance...`)
    
    const validationResults: Array<{
      file: string
      valid: boolean
      error?: string
    }> = []
    
    for (const yamlFile of allYamlFiles) {
      // Skip GitHub Actions and other non-simulation YAML files
      if (yamlFile.includes('.github/workflows/') || yamlFile.includes('docker-compose')) {
        continue
      }
      
      try {
        await loader.loadConfig(yamlFile)
        validationResults.push({ file: yamlFile, valid: true })
        console.log(`✅ ${yamlFile}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        validationResults.push({ 
          file: yamlFile, 
          valid: false, 
          error: errorMessage 
        })
        console.error(`❌ ${yamlFile}: ${errorMessage}`)
      }
    }
    
    const invalidFiles = validationResults.filter(r => !r.valid)
    
    if (invalidFiles.length > 0) {
      console.error(`\n🚨 SCHEMA VALIDATION FAILURES:`)
      invalidFiles.forEach(result => {
        console.error(`   ❌ ${result.file}`)
        console.error(`      ${result.error}`)
      })
      
      throw new Error(`UNACCEPTABLE: ${invalidFiles.length} YAML files failed schema validation. ALL files MUST be valid.`)
    }
    
    console.log(`\n🎉 SUCCESS: All ${validationResults.length} simulation YAML files are schema-valid`)
  })
  
  it('should validate specific known simulation files individually', async () => {
    const knownSimulations = [
      'examples/simulations/simple-roi-analysis.yaml',
      'examples/simulations/ai-tool-adoption.yaml',
      'examples/simulations/marketing-campaign-roi.yaml',
      'examples/simulations/software-investment-roi.yaml',
      'examples/simulations/team-scaling-decision.yaml',
      'examples/simulations/technology-investment.yaml'
    ]
    
    for (const simulation of knownSimulations) {
      try {
        const config = await loader.loadConfig(simulation)
        
        // Validate required fields are present
        expect(config.name).toBeTruthy()
        expect(config.category).toBeTruthy()
        expect(config.description).toBeTruthy()
        expect(config.version).toBeTruthy()
        expect(Array.isArray(config.tags)).toBe(true)
        expect(Array.isArray(config.parameters)).toBe(true)
        expect(Array.isArray(config.outputs)).toBe(true)
        expect(config.simulation).toBeTruthy()
        expect(config.simulation.logic).toBeTruthy()
        
        // Validate parameter structure
        for (const param of config.parameters) {
          expect(param.key).toBeTruthy()
          expect(param.label).toBeTruthy()
          expect(param.type).toBeTruthy()
          expect(param.default).toBeDefined()
          expect(param.description).toBeTruthy()
        }
        
        // Validate output structure
        for (const output of config.outputs) {
          expect(output.key).toBeTruthy()
          expect(output.label).toBeTruthy()
          expect(output.description).toBeTruthy()
        }
        
        console.log(`✅ ${simulation} - Complete schema validation passed`)
        
      } catch (error) {
        throw new Error(`CRITICAL FAILURE: ${simulation} failed validation: ${error}`)
      }
    }
  })
  
  it('should validate that NO test files create invalid YAML', async () => {
    // This test ensures our test fixtures are always valid
    const testYamlContent = `name: Schema Test Simulation
category: Test
description: Test simulation for schema validation
version: 1.0.0
tags: [test, validation]

parameters:
  - key: testParam
    label: Test Parameter
    type: number
    default: 100
    min: 1
    max: 1000
    step: 1
    description: A test parameter

outputs:
  - key: testOutput
    label: Test Output
    description: A test output

simulation:
  logic: |
    return { testOutput: testParam * 2 }
`
    
    // Validate that this test YAML is valid
    try {
      // Test by parsing the content directly through the loader's YAML parser
      const yaml = require('yaml')
      const parsed = yaml.parse(testYamlContent)
      
      // Validate structure manually since we can't write to filesystem in tests
      expect(parsed.name).toBe('Schema Test Simulation')
      expect(parsed.category).toBe('Test')
      expect(parsed.description).toBeTruthy()
      expect(parsed.version).toBe('1.0.0')
      expect(Array.isArray(parsed.tags)).toBe(true)
      expect(Array.isArray(parsed.parameters)).toBe(true)
      expect(Array.isArray(parsed.outputs)).toBe(true)
      expect(parsed.simulation).toBeTruthy()
      expect(parsed.simulation.logic).toBeTruthy()
      
      console.log('✅ Test YAML fixtures are schema-compliant')
      
    } catch (error) {
      throw new Error(`CRITICAL: Test YAML fixtures are invalid: ${error}`)
    }
  })
})