/**
 * Parameter form generation and management
 */

import type { ParameterConfig } from '../cli/config/schema'
import { getElementOrThrow } from './utils'

export class ParameterForm {
  private container: HTMLElement
  private onChangeCallback?: () => void

  constructor(containerId: string) {
    this.container = getElementOrThrow(containerId)
  }

  setOnChangeCallback(callback: () => void) {
    this.onChangeCallback = callback
  }

  generateForm(parameters: ParameterConfig[]) {
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

  private createInput(param: ParameterConfig): HTMLInputElement {
    const input = document.createElement('input')
    input.id = param.key
    input.name = param.key
    input.className = 'parameter-input'

    switch (param.type) {
      case 'boolean':
        input.type = 'checkbox'
        input.checked = param.default as boolean
        break
        
      case 'number':
        input.type = 'number'
        input.value = String(param.default)
        if (param.min !== undefined) input.min = String(param.min)
        if (param.max !== undefined) input.max = String(param.max)
        if (param.step !== undefined) input.step = String(param.step)
        break
        
      default:
        input.type = 'text'
        input.value = String(param.default || '')
    }

    return input
  }

  private validateInput(input: HTMLInputElement, param: ParameterConfig) {
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

  setValues(values: Record<string, any>) {
    const inputs = this.container.querySelectorAll('.parameter-input') as NodeListOf<HTMLInputElement>
    
    inputs.forEach(input => {
      const value = values[input.name]
      if (value !== undefined) {
        if (input.type === 'checkbox') {
          input.checked = Boolean(value)
        } else {
          input.value = String(value)
        }
      }
    })
  }

  clear() {
    this.container.innerHTML = ''
  }
}