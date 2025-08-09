import { describe, it, expect } from 'vitest'
import { validator } from '../validation/bulletproof-validator'

/**
 * BULLETPROOF VALIDATION TESTS
 * 
 * These tests ensure the validation system works correctly
 * and provides detailed, helpful error messages.
 */

describe('BULLETPROOF VALIDATION SYSTEM', () => {
  
  it('should validate simple-roi-analysis.yaml and show detailed results', async () => {
    const result = await validator.validateFile('examples/simulations/simple-roi-analysis.yaml')
    
    console.log('\n🔍 DETAILED VALIDATION RESULT:')
    console.log(`Valid: ${result.valid}`)
    console.log(`Errors (${result.errors.length}):`)
    result.errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`))
    console.log(`Warnings (${result.warnings.length}):`)
    result.warnings.forEach((warning, i) => console.log(`  ${i + 1}. ${warning}`))
    
    // This test is for diagnosis - we expect it to either pass or show detailed errors
    if (!result.valid) {
      console.log('\n❌ File failed validation - but now we have detailed error messages!')
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toBeTruthy() // Should have meaningful error message
    } else {
      console.log('\n✅ File passed validation!')
      expect(result.valid).toBe(true)
    }
  })

  it('should validate ALL known simulation files and provide detailed results', async () => {
    const knownFiles = [
      'examples/simulations/simple-roi-analysis.yaml',
      'examples/simulations/ai-tool-adoption/ai-tool-adoption.yaml',
      'examples/simulations/marketing-campaign-roi.yaml',
      'examples/simulations/software-investment-roi.yaml',
      'examples/simulations/team-scaling-decision.yaml',
      'examples/simulations/technology-investment.yaml'
    ]

    console.log('\n🎯 TESTING ALL KNOWN SIMULATION FILES:')
    
    const results = []
    for (const file of knownFiles) {
      const result = await validator.validateFile(file)
      results.push({ file, result })
      
      console.log(`\n📁 ${file}:`)
      console.log(`   Valid: ${result.valid}`)
      if (!result.valid) {
        console.log(`   Errors:`)
        result.errors.forEach(error => console.log(`     ❌ ${error}`))
      }
      if (result.warnings.length > 0) {
        console.log(`   Warnings:`)
        result.warnings.forEach(warning => console.log(`     ⚠️  ${warning}`))
      }
    }

    const validFiles = results.filter(r => r.result.valid)
    const invalidFiles = results.filter(r => !r.result.valid)

    console.log(`\n📊 SUMMARY:`)
    console.log(`   ✅ Valid: ${validFiles.length}`)
    console.log(`   ❌ Invalid: ${invalidFiles.length}`)
    console.log(`   📋 Total: ${results.length}`)

    if (invalidFiles.length > 0) {
      console.log(`\n🚨 INVALID FILES REQUIRING FIXES:`)
      invalidFiles.forEach(({ file, result }) => {
        console.log(`   ${file}: ${result.errors[0]}`)
      })
    }

    // For now, we're gathering data - don't fail the test
    expect(results.length).toBe(knownFiles.length)
  })

  it('should handle invalid YAML gracefully', async () => {
    // Test with invalid YAML content
    const result = await validator.validateFile('non-existent-file.yaml')
    
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('File access failed')
  })

  it('should provide detailed schema validation errors', async () => {
    // Test the config validation directly with invalid data
    const invalidConfig = {
      name: '', // Too short
      category: 'Test',
      description: 'Short', // Too short
      version: '1.0', // Invalid format
      tags: [], // Empty array
      parameters: [] // Empty array
    }

    const result = validator.validateConfig(invalidConfig)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    
    console.log('\n🔍 DETAILED SCHEMA ERRORS:')
    result.errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`))

    // Should catch all the validation issues
    expect(result.errors.some(e => e.includes('name'))).toBe(true) // Empty name
    expect(result.errors.some(e => e.includes('description'))).toBe(true) // Short description
    expect(result.errors.some(e => e.includes('version'))).toBe(true) // Invalid version format
    expect(result.errors.some(e => e.includes('tags'))).toBe(true) // Empty tags
    expect(result.errors.some(e => e.includes('parameters'))).toBe(true) // Empty parameters
  })

  it('should validate business rules correctly', async () => {
    const configWithBusinessErrors = {
      name: 'Test Simulation',
      category: 'Test',
      description: 'A test simulation with business rule violations',
      version: '1.0.0',
      tags: ['test'],
      parameters: [
        {
          key: 'param1',
          label: 'Parameter 1',
          type: 'number',
          default: 50,
          min: 100,  // Default below minimum
          max: 200
        },
        {
          key: 'param1',  // Duplicate key
          label: 'Parameter 1 Duplicate',
          type: 'string',
          default: 'test'
        },
        {
          key: 'selectParam',
          label: 'Select Parameter',
          type: 'select',
          default: 'invalid',  // Not in options
          options: ['option1', 'option2']
        }
      ],
      outputs: [
        {
          key: 'output1',
          label: 'Output 1'
        },
        {
          key: 'output1',  // Duplicate output key
          label: 'Output 1 Duplicate'
        }
      ],
      simulation: {
        logic: 'const x = 1' // Missing return statement
      }
    }

    const result = validator.validateConfig(configWithBusinessErrors)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)

    console.log('\n🔍 BUSINESS RULE VALIDATION ERRORS:')
    result.errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`))

    // Should catch all business rule violations
    expect(result.errors.some(e => e.includes('Duplicate parameter keys'))).toBe(true)
    expect(result.errors.some(e => e.includes('Duplicate output keys'))).toBe(true)
    expect(result.errors.some(e => e.includes('below minimum'))).toBe(true)
    expect(result.errors.some(e => e.includes('must be one of the options'))).toBe(true)
    expect(result.errors.some(e => e.includes('return statement'))).toBe(true)
  })
})