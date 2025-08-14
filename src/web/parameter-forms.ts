/**
 * Parameter form generation and management
 */

import type { ParameterDefinition } from '../framework/types'

export class ParameterFormManager {
  private container: HTMLElement
  private onChangeCallback?: () => void

  constructor(containerId: string) {
    const element = document.getElementById(containerId)
    if (!element) {
      throw new Error(`Container element ${containerId} not found`)
    }
    this.container = element
  }

  setOnChangeCallback(callback: () => void) {
    this.onChangeCallback = callback
  }

  generateForm(parameters: ParameterDefinition[]) {
    this.container.innerHTML = ''

    parameters.forEach(param => {
      const fieldContainer = document.createElement('div')
      fieldContainer.className = 'parameter-field'

      // Create label
      const label = document.createElement('label')
      label.textContent = param.label
      label.htmlFor = param.key
      if (param.description) {
        label.title = param.description
      }

      // Create input based on parameter type
      const input = this.createInput(param)
      input.addEventListener('input', () => {
        this.validateInput(input, param)
        this.onChangeCallback?.()
      })

      fieldContainer.appendChild(label)
      fieldContainer.appendChild(input)
      this.container.appendChild(fieldContainer)
    })
  }

  private createInput(param: ParameterDefinition): HTMLInputElement {
    const input = document.createElement('input')
    input.id = param.key
    input.name = param.key
    input.className = 'parameter-input'

    switch (param.type) {
      case 'boolean':
        input.type = 'checkbox'
        input.checked = param.defaultValue as boolean
        break
        
      case 'number':
        input.type = 'number'
        input.value = String(param.defaultValue)
        if (param.min !== undefined) input.min = String(param.min)
        if (param.max !== undefined) input.max = String(param.max)
        if (param.step !== undefined) input.step = String(param.step)
        break
        
      default:
        input.type = 'text'
        input.value = String(param.defaultValue || '')
    }

    return input
  }

  private validateInput(input: HTMLInputElement, param: ParameterDefinition) {
    input.classList.remove('invalid')

    if (param.type === 'number') {
      const value = parseFloat(input.value)
      if (isNaN(value)) {
        input.classList.add('invalid')
        return
      }
      
      if (param.min !== undefined && value < param.min) {
        input.classList.add('invalid')
        return
      }
      
      if (param.max !== undefined && value > param.max) {
        input.classList.add('invalid')
        return
      }
    }
  }

  getCurrentValues(): Record<string, any> {
    const values: Record<string, any> = {}
    const inputs = this.container.querySelectorAll('.parameter-input') as NodeListOf<HTMLInputElement>

    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        values[input.name] = input.checked
      } else if (input.type === 'number') {
        values[input.name] = parseFloat(input.value) || 0
      } else {
        values[input.name] = input.value
      }
    })

    return values
  }

  isValid(): boolean {
    const invalidInputs = this.container.querySelectorAll('.parameter-input.invalid')
    return invalidInputs.length === 0
  }

  clear() {
    this.container.innerHTML = ''
  }
}