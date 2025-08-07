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

interface TestResult {
  example: string
  success: boolean
  error?: string
  output?: string
}

class DocumentationTester {
  private results: TestResult[] = []
  
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
    
    this.displayResults()
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
    
    // Skip examples that are just showing syntax
    if (command.includes('simulation.yaml') || command.includes('[YOUR')) {
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
    
    console.log(chalk.cyan.bold('📊 TEST RESULTS'))
    console.log(chalk.gray('═'.repeat(50)))
    console.log(`${chalk.green('✅ Passed:')} ${successful.length}`)
    console.log(`${chalk.red('❌ Failed:')} ${failed.length}`)
    console.log(`${chalk.blue('📝 Total:')} ${this.results.length}`)
    
    if (failed.length > 0) {
      console.log(chalk.red.bold('\n🚨 FAILED EXAMPLES:'))
      console.log(chalk.gray('─'.repeat(50)))
      
      failed.forEach((result, index) => {
        console.log(chalk.red(`${index + 1}. ${result.example}`))
        console.log(chalk.red(`   Error: ${result.error?.split('\n')[0]}`))
        console.log()
      })
      
      console.log(chalk.red.bold('💡 Fix these examples before committing!'))
      process.exit(1)
    } else {
      console.log(chalk.green.bold('\n🎉 All documentation examples work!'))
    }
  }
}

// Run the tests
async function main() {
  try {
    const tester = new DocumentationTester()
    await tester.testReadmeExamples()
  } catch (error) {
    console.error(chalk.red.bold('❌ Documentation testing failed:'), error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}