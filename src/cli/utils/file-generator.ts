import { promises as fs } from 'fs'
import { dirname, join } from 'path'

export interface FileToGenerate {
  path: string
  content: string
  overwrite?: boolean
}

export class FileGenerator {
  private baseDir: string
  
  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir
  }
  
  async ensureDirectory(dirPath: string): Promise<void> {
    const fullPath = join(this.baseDir, dirPath)
    try {
      await fs.access(fullPath)
    } catch {
      await fs.mkdir(fullPath, { recursive: true })
    }
  }
  
  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = join(this.baseDir, filePath)
    try {
      await fs.access(fullPath)
      return true
    } catch {
      return false
    }
  }
  
  async writeFile(filePath: string, content: string, overwrite = false): Promise<void> {
    const fullPath = join(this.baseDir, filePath)
    
    // Check if file exists and overwrite is not allowed
    if (!overwrite && await this.fileExists(filePath)) {
      throw new Error(`File already exists: ${filePath}. Use overwrite: true to replace it.`)
    }
    
    // Ensure directory exists
    await this.ensureDirectory(dirname(filePath))
    
    // Write the file
    await fs.writeFile(fullPath, content, 'utf8')
  }
  
  async readFile(filePath: string): Promise<string> {
    const fullPath = join(this.baseDir, filePath)
    return await fs.readFile(fullPath, 'utf8')
  }
  
  async generateFiles(files: FileToGenerate[]): Promise<void> {
    const results: Array<{ path: string; status: 'created' | 'updated' | 'skipped' }> = []
    
    for (const file of files) {
      try {
        const exists = await this.fileExists(file.path)
        
        if (exists && !file.overwrite) {
          results.push({ path: file.path, status: 'skipped' })
          console.log(`⚠️  Skipped ${file.path} (already exists)`)
          continue
        }
        
        await this.writeFile(file.path, file.content, file.overwrite)
        results.push({ 
          path: file.path, 
          status: exists ? 'updated' : 'created' 
        })
        
        const icon = exists ? '📝' : '✨'
        console.log(`${icon} ${exists ? 'Updated' : 'Created'} ${file.path}`)
        
      } catch (error) {
        console.error(`❌ Failed to generate ${file.path}:`, error instanceof Error ? error.message : error)
        throw error
      }
    }
  }
  
  async appendToFile(filePath: string, content: string, marker?: string): Promise<void> {
    
    if (!await this.fileExists(filePath)) {
      throw new Error(`File does not exist: ${filePath}`)
    }
    
    const existingContent = await this.readFile(filePath)
    
    // If marker is provided, check if content is already present
    if (marker && existingContent.includes(marker)) {
      console.log(`📋 Content already present in ${filePath}`)
      return
    }
    
    // Append content
    const updatedContent = existingContent + '\n' + content
    await this.writeFile(filePath, updatedContent, true)
    
    console.log(`📝 Updated ${filePath}`)
  }
  
  async updateFileSection(
    filePath: string, 
    sectionStart: string, 
    sectionEnd: string, 
    newContent: string
  ): Promise<void> {
    if (!await this.fileExists(filePath)) {
      throw new Error(`File does not exist: ${filePath}`)
    }
    
    const content = await this.readFile(filePath)
    const startIndex = content.indexOf(sectionStart)
    const endIndex = content.indexOf(sectionEnd, startIndex)
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error(`Could not find section markers in ${filePath}`)
    }
    
    const beforeSection = content.substring(0, startIndex + sectionStart.length)
    const afterSection = content.substring(endIndex)
    
    const updatedContent = beforeSection + '\n' + newContent + '\n' + afterSection
    
    await this.writeFile(filePath, updatedContent, true)
    console.log(`📝 Updated section in ${filePath}`)
  }
}