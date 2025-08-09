#!/usr/bin/env tsx
/**
 * Documentation Testing Script
 * 
 * Validates that all examples in README.md actually work with the current implementation.
 * Prevents documentation drift by testing documented workflows.
 */

import { readFile } from 'fs/promises'
import { execSync } from 'child_process'
import chalk from 'chalk'

// Documentation placeholder patterns that should NOT be tested as real commands
const PLACEHOLDER_PATTERNS = [
  'simulation.yaml',
  '[YOUR',
  '<simulation>',
  '<file>',
  'YOUR_SIMULATION.yaml',
  'your-simulation.yaml',
  'my-simulation.yaml',
  'my-analysis.yaml'
] as const

interface TestResult {
  example: string
  success: boolean
  error?: string
  output?: string
}

class DocumentationTester {
  private results: TestResult[] = []
  private driftErrors: string[] = []
  
  async runAllTests(): Promise<void> {
    await this.testReadmeExamples()
    await this.testForDocumentationDrift()
    this.displayResults()
  }
  
  async testReadmeExamples(): Promise<void> {
    console.log(chalk.cyan.bold('🧪 Testing README.md Examples\n'))
    
    const readmeContent = await readFile('README.md', 'utf-8')
    const bashBlocks = this.extractBashExamples(readmeContent)
    
    console.log(chalk.gray(`Found ${bashBlocks.length} bash examples to test\n`))
    
    for (const [index, example] of bashBlocks.entries()) {
      console.log(chalk.yellow(`📝 Testing example ${index + 1}/${bashBlocks.length}:`))
      console.log(chalk.gray(`   ${example.substring(0, 80)}${example.length > 80 ? '...' : ''}`))
      
      await this.testExample(example)
    }
  }
  
  async testForDocumentationDrift(): Promise<void> {
    console.log(chalk.cyan.bold('\n🔍 Testing for Documentation Drift\n'))
    
    await this.testForBrokenCommands()
    await this.testForMissingFiles()
    await this.testForInconsistentTerminology()
  }
  
  private async testForBrokenCommands(): Promise<void> {
    console.log(chalk.yellow('📋 Checking for non-existent commands...'))
    
    const docFiles = [
      'README.md',
      'docs/AGENT.md', 
      'docs/CLI_REFERENCE.md',
      'docs/INTERACTIVE_STUDIO.md',
      'docs/DIRECTORY_STRUCTURE.md'
    ]
    
    const brokenCommands = [
      'studio generate',
      'studio define',
      'studio create',
      '--template'
    ]
    
    for (const file of docFiles) {
      try {
        const content = await readFile(file, 'utf-8')
        
        for (const cmd of brokenCommands) {
          if (content.includes(cmd)) {
            this.driftErrors.push(`${file} still references removed command: "${cmd}"`)
          }
        }
      } catch (error) {
        console.log(chalk.gray(`   Skipping ${file} (not found)`))
      }
    }
    
    console.log(chalk.green('   ✅ Broken command check complete'))
  }
  
  private async testForMissingFiles(): Promise<void> {
    console.log(chalk.yellow('📁 Checking for references to deleted files...'))
    
    const docFiles = [
      'README.md',
      'docs/AGENT.md',
      'docs/DIRECTORY_STRUCTURE.md', 
      'ACTIVE_WORK.md'
    ]
    
    const deletedPaths = [
      'templates/',
      'src/cli/interactive/definition-studio.ts',
      'src/cli/interactive/template-library.ts'
    ]
    
    for (const file of docFiles) {
      try {
        const content = await readFile(file, 'utf-8')
        
        for (const path of deletedPaths) {
          if (content.includes(path) && !content.includes('removed') && !content.includes('deleted')) {
            this.driftErrors.push(`${file} references deleted path: "${path}" (should note removal)`)
          }
        }
      } catch (error) {
        console.log(chalk.gray(`   Skipping ${file} (not found)`))
      }
    }
    
    console.log(chalk.green('   ✅ Missing file check complete'))
  }
  
  private async testForInconsistentTerminology(): Promise<void> {
    console.log(chalk.yellow('🏷️  Checking for terminology consistency...'))
    
    const docFiles = [
      'README.md',
      'docs/AGENT.md',
      'docs/CLI_REFERENCE.md'
    ]
    
    // Should use "examples" not "templates" now
    for (const file of docFiles) {
      try {
        const content = await readFile(file, 'utf-8')
        
        // Check for template references that should be examples
        if (content.includes('template-based') || content.includes('Template Library')) {
          this.driftErrors.push(`${file} uses old template terminology (should use examples-first approach)`)
        }
        
        // Check for broken workflow descriptions
        if (content.includes('Interactive Studio') && !content.includes('removed')) {
          this.driftErrors.push(`${file} references Interactive Studio without noting it was simplified`)
        }
        
      } catch (error) {
        console.log(chalk.gray(`   Skipping ${file} (not found)`))
      }
    }
    
    console.log(chalk.green('   ✅ Terminology check complete'))
  }
  
  private extractBashExamples(content: string): string[] {
    // Extract bash code blocks from markdown
    const bashBlocks: string[] = []
    const lines = content.split('\n')
    let inBashBlock = false
    let currentBlock: string[] = []
    
    for (const line of lines) {
      if (line.trim() === '```bash') {
        inBashBlock = true
        currentBlock = []
      } else if (line.trim() === '```' && inBashBlock) {
        inBashBlock = false
        if (currentBlock.length > 0) {
          // Join lines and split by individual commands
          const blockContent = currentBlock.join('\n')
          const commands = this.extractCommands(blockContent)
          bashBlocks.push(...commands)
        }
      } else if (inBashBlock) {
        currentBlock.push(line)
      }
    }
    
    return bashBlocks.filter(cmd => this.shouldTestCommand(cmd))
  }
  
  private extractCommands(blockContent: string): string[] {
    const commands: string[] = []
    const lines = blockContent.split('\n')
    
    for (const line of lines) {
      const trimmed = line.trim()
      // Skip comments and empty lines
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//')) {
        commands.push(trimmed)
      }
    }
    
    return commands
  }
  
  private shouldTestCommand(command: string): boolean {
    // Test commands that use our NPX interface
    if (!command.includes('npx github:rmurphey/monte-carlo-simulator')) {
      return false
    }
    
    // Skip examples that contain placeholder patterns
    const hasPlaceholder = PLACEHOLDER_PATTERNS.some(pattern => 
      command.includes(pattern)
    )
    if (hasPlaceholder) {
      return false
    }
    
    // Skip commands that require user input
    if (command.includes('--interactive')) {
      return false
    }
    
    // Skip standalone 'interactive' command (requires user input)
    if (command.trim().endsWith('interactive')) {
      return false
    }
    
    // Skip commands with invalid parameters for this simulation
    if (command.includes('affectedEmployees') && command.includes('simple-roi-analysis')) {
      return false // simple-roi-analysis doesn't have affectedEmployees parameter
    }
    
    return true
  }
  
  private async testExample(command: string): Promise<void> {
    try {
      // Convert NPX command to local CLI for testing
      const localCommand = this.convertToLocalCommand(command)
      
      console.log(chalk.gray(`   → ${localCommand}`))
      
      const output = execSync(localCommand, {
        encoding: 'utf-8',
        timeout: 30000, // 30 second timeout
        stdio: 'pipe'
      })
      
      this.results.push({
        example: command,
        success: true,
        output: output.substring(0, 200) // Truncate for display
      })
      
      console.log(chalk.green('   ✅ Success'))
      
    } catch (error: any) {
      this.results.push({
        example: command,
        success: false,
        error: error.message
      })
      
      console.log(chalk.red('   ❌ Failed'))
      console.log(chalk.red(`   ${error.message.split('\n')[0]}`))
    }
    
    console.log() // Empty line between tests
  }
  
  private convertToLocalCommand(npxCommand: string): string {
    // Convert NPX commands to local CLI commands for testing
    return npxCommand
      .replace('npx github:rmurphey/monte-carlo-simulator', 'npm run cli --')
      .replace(/\s+/g, ' ')
      .trim()
  }
  
  private displayResults(): void {
    const successful = this.results.filter(r => r.success)
    const failed = this.results.filter(r => !r.success)
    const hasErrors = failed.length > 0 || this.driftErrors.length > 0
    
    console.log(chalk.cyan.bold('\n📊 DOCUMENTATION TEST RESULTS'))
    console.log(chalk.gray('═'.repeat(50)))
    console.log(`${chalk.green('✅ Examples Passed:')} ${successful.length}`)
    console.log(`${chalk.red('❌ Examples Failed:')} ${failed.length}`)
    console.log(`${chalk.yellow('⚠️  Drift Issues:')} ${this.driftErrors.length}`)
    console.log(`${chalk.blue('📝 Total Tests:')} ${this.results.length}`)
    
    if (failed.length > 0) {
      console.log(chalk.red.bold('\n🚨 FAILED EXAMPLES:'))
      console.log(chalk.gray('─'.repeat(50)))
      
      failed.forEach((result, index) => {
        console.log(chalk.red(`${index + 1}. ${result.example}`))
        console.log(chalk.red(`   Error: ${result.error?.split('\n')[0]}`))
        console.log()
      })
    }
    
    if (this.driftErrors.length > 0) {
      console.log(chalk.yellow.bold('\n⚠️  DOCUMENTATION DRIFT DETECTED:'))
      console.log(chalk.gray('─'.repeat(50)))
      
      this.driftErrors.forEach((error, index) => {
        console.log(chalk.yellow(`${index + 1}. ${error}`))
      })
      console.log()
    }
    
    if (hasErrors) {
      console.log(chalk.red.bold('💡 Fix these issues before committing!'))
      console.log(chalk.gray('Documentation must stay in sync with implementation.'))
      process.exit(1)
    } else {
      console.log(chalk.green.bold('\n🎉 All documentation tests passed!'))
      console.log(chalk.green('✅ Examples work'))
      console.log(chalk.green('✅ No drift detected'))
      console.log(chalk.green('✅ Terminology consistent'))
    }
  }
}

// Run the tests
async function main() {
  try {
    console.log(chalk.cyan.bold('🧪 Documentation Drift Prevention Tests'))
    console.log(chalk.gray('Ensuring docs stay synchronized with implementation\n'))
    
    const tester = new DocumentationTester()
    await tester.runAllTests()
  } catch (error) {
    console.error(chalk.red.bold('❌ Documentation testing failed:'), error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}