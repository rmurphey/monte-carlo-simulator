/**
 * Configuration copy/paste management
 */

export class ConfigManager {
  private textarea: HTMLTextAreaElement

  constructor(textareaId: string) {
    const element = document.getElementById(textareaId) as HTMLTextAreaElement
    if (!element) {
      throw new Error(`Textarea element ${textareaId} not found`)
    }
    this.textarea = element
  }

  updateConfig(parameters: Record<string, unknown>) {
    const config = JSON.stringify(parameters, null, 2)
    this.textarea.value = config
  }

  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.textarea.value)
    } catch (error) {
      // Fallback for older browsers or when clipboard API fails
      console.warn('Clipboard API failed, using fallback:', error)
      this.textarea.select()
      // Note: execCommand is deprecated but still widely supported as fallback
      document.execCommand('copy')
    }
  }

  async pasteFromClipboard(): Promise<Record<string, unknown> | null> {
    try {
      let text: string
      
      if (navigator.clipboard) {
        text = await navigator.clipboard.readText()
      } else {
        // Fallback - user will need to paste manually
        text = prompt('Paste configuration JSON:') || ''
      }
      
      if (!text.trim()) return null
      
      const config = JSON.parse(text)
      this.textarea.value = JSON.stringify(config, null, 2)
      return config
      
    } catch (error) {
      throw new Error(`Invalid JSON configuration: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  clear() {
    this.textarea.value = ''
  }
}