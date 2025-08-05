export interface TemplateContext {
  [key: string]: string | number | boolean | string[] | TemplateContext
}

export class TemplateEngine {
  static render(template: string, context: TemplateContext): string {
    let result = template
    
    // Replace simple variables: {{variableName}}
    result = result.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const value = context[key]
      if (value === undefined) {
        throw new Error(`Template variable '${key}' is not defined`)
      }
      return String(value)
    })
    
    // Replace array variables: {{#each arrayName}}content{{/each}}
    result = result.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, key, content) => {
      const array = context[key]
      if (!Array.isArray(array)) {
        throw new Error(`Template variable '${key}' must be an array for #each`)
      }
      
      return array.map((item, index) => {
        let itemContent = content
        
        // Replace {{@index}} with current index
        itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index))
        
        // Replace {{this}} with current item (if primitive)
        if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
          itemContent = itemContent.replace(/\{\{this\}\}/g, String(item))
        }
        
        // Replace object properties: {{property}}
        if (typeof item === 'object' && item !== null) {
          itemContent = itemContent.replace(/\{\{(\w+)\}\}/g, (propMatch: string, propKey: string) => {
            const propValue = (item as any)[propKey]
            return propValue !== undefined ? String(propValue) : propMatch
          })
        }
        
        return itemContent
      }).join('')
    })
    
    // Replace conditional blocks: {{#if condition}}content{{/if}}
    result = result.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
      const condition = context[key]
      return condition ? content : ''
    })
    
    // Replace conditional blocks with else: {{#if condition}}content{{else}}other{{/if}}
    result = result.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, ifContent, elseContent) => {
      const condition = context[key]
      return condition ? ifContent : elseContent
    })
    
    return result
  }
  
  static renderFile(_templatePath: string, _context: TemplateContext): string {
    // For now, we'll pass templates as strings
    // In a full implementation, this would read from files
    throw new Error('renderFile not implemented - use render() with template strings')
  }
  
  static escape(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
}