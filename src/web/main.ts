/**
 * Main web application coordinator
 */

import { WebSimulationEngine } from './simulation-engine'
import { ParameterForm } from './parameter-forms'
import { Charts } from './charts'
import { Statistics } from './statistics'
import { ConfigManager } from './config-manager'

class WebApp {
  private simulation: WebSimulationEngine | null = null
  private parameterForm: ParameterForm
  private charts: Charts
  private statistics: Statistics
  private configManager: ConfigManager
  
  constructor() {
    this.parameterForm = new ParameterForm('parameter-form-container')
    this.charts = new Charts('charts-container')
    this.statistics = new Statistics('statistics-container')
    this.configManager = new ConfigManager('config-textarea')
    
    this.setupEventListeners()
    this.loadDefaultSimulation()
  }
  
  private setupEventListeners() {
    // Run simulation button
    const runButton = document.getElementById('run-simulation') as HTMLButtonElement
    runButton?.addEventListener('click', () => this.runSimulation())
    
    // Clear results button
    const clearButton = document.getElementById('clear-results') as HTMLButtonElement
    clearButton?.addEventListener('click', () => this.clearResults())
    
    // Copy/paste config buttons
    const copyButton = document.getElementById('copy-config') as HTMLButtonElement
    const pasteButton = document.getElementById('paste-config') as HTMLButtonElement
    
    copyButton?.addEventListener('click', () => this.configManager.copyToClipboard())
    pasteButton?.addEventListener('click', () => this.pasteConfig())
    
    // Parameter form changes
    this.parameterForm.setOnChangeCallback(() => {
      this.updateConfiguration()
    })
  }
  
  private async loadDefaultSimulation() {
    try {
      this.showStatus('Loading simulation...', 'info')
      
      // Create a simple default simulation for demonstration
      const defaultConfig = {
        name: 'Simple ROI Analysis',
        category: 'Financial Analysis',
        description: 'Basic return on investment simulation',
        version: '1.0.0',
        tags: ['finance', 'roi', 'investment'],
        parameters: [
          {
            key: 'initialInvestment',
            label: 'Initial Investment ($)',
            type: 'number' as const,
            default: 10000,
            min: 1000,
            max: 1000000,
            description: 'Starting investment amount'
          },
          {
            key: 'annualReturn',
            label: 'Expected Annual Return (%)',
            type: 'number' as const,
            default: 7.5,
            min: -50,
            max: 100,
            step: 0.1,
            description: 'Expected annual percentage return'
          },
          {
            key: 'volatility',
            label: 'Volatility (%)',
            type: 'number' as const,
            default: 15,
            min: 0,
            max: 100,
            step: 0.1,
            description: 'Standard deviation of returns'
          },
          {
            key: 'years',
            label: 'Investment Period (Years)',
            type: 'number' as const,
            default: 10,
            min: 1,
            max: 50,
            description: 'Number of years to simulate'
          },
          {
            key: 'iterations',
            label: 'Simulation Iterations',
            type: 'number' as const,
            default: 1000,
            min: 100,
            max: 10000,
            description: 'Number of simulation runs'
          }
        ],
        simulation: {
          logic: `
          const { initialInvestment, annualReturn, volatility, years, iterations } = params;
          const results = [];
          
          for (let i = 0; i < iterations; i++) {
            let value = initialInvestment;
            
            for (let year = 0; year < years; year++) {
              const randomReturn = (Math.random() - 0.5) * 2; // -1 to 1
              const yearReturn = (annualReturn / 100) + (randomReturn * volatility / 100);
              value *= (1 + yearReturn);
            }
            
            results.push({
              finalValue: Math.round(value),
              totalReturn: Math.round(value - initialInvestment),
              annualizedReturn: Math.round(((Math.pow(value / initialInvestment, 1 / years) - 1) * 100) * 100) / 100
            });
          }
          
          return results;
          `
        }
      }
      
      this.simulation = new WebSimulationEngine(defaultConfig)
      this.parameterForm.generateForm(defaultConfig.parameters)
      this.updateConfiguration()
      this.showStatus('Simulation loaded successfully', 'success')
      
    } catch (error) {
      this.showStatus(`Error loading simulation: ${error}`, 'error')
    }
  }
  
  private async runSimulation() {
    if (!this.simulation) {
      this.showStatus('No simulation loaded', 'error')
      return
    }
    
    if (!this.parameterForm.isValid()) {
      this.showStatus('Please fix invalid parameters', 'error')
      return
    }
    
    try {
      const runButton = document.getElementById('run-simulation') as HTMLButtonElement
      if (runButton) {
        runButton.disabled = true
        runButton.textContent = 'Running...'
      }
      
      this.showStatus('Running simulation...', 'info')
      
      const formParameters = this.parameterForm.getCurrentValues()
      const iterations = formParameters.iterations as number || 1000
      delete formParameters.iterations // Remove from parameters since it's passed separately
      
      const results = await this.simulation.runSimulation(formParameters, iterations)
      
      // Update visualizations
      this.charts.createHistograms(results.results)
      this.statistics.displayTable(results.summary)
      
      this.showStatus(`Simulation completed: ${results.results.length} iterations`, 'success')
      
    } catch (error) {
      this.showStatus(`Simulation error: ${error}`, 'error')
    } finally {
      const runButton = document.getElementById('run-simulation') as HTMLButtonElement
      if (runButton) {
        runButton.disabled = false
        runButton.textContent = 'Run Simulation'
      }
    }
  }
  
  private clearResults() {
    this.charts.clear()
    this.statistics.clear()
    this.showStatus('Results cleared', 'info')
  }
  
  private updateConfiguration() {
    if (!this.simulation) return
    
    const currentParameters = this.parameterForm.getCurrentValues()
    this.configManager.updateConfig(currentParameters)
  }
  
  private async pasteConfig() {
    try {
      const config = await this.configManager.pasteFromClipboard()
      if (config) {
        // Update form with pasted configuration
        Object.entries(config).forEach(([key, value]) => {
          const input = document.querySelector(`[name="${key}"]`) as HTMLInputElement
          if (input) {
            if (input.type === 'checkbox') {
              input.checked = Boolean(value)
            } else {
              input.value = String(value)
            }
          }
        })
        this.showStatus('Configuration pasted successfully', 'success')
      }
    } catch (error) {
      this.showStatus(`Error pasting configuration: ${error}`, 'error')
    }
  }
  
  private showStatus(message: string, type: 'info' | 'success' | 'error') {
    const container = document.getElementById('status-container')
    if (!container) return
    
    container.innerHTML = `<div class="status status-${type}">${message}</div>`
    
    // Auto-hide success and info messages after 3 seconds
    if (type !== 'error') {
      setTimeout(() => {
        container.innerHTML = ''
      }, 3000)
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new WebApp())
} else {
  new WebApp()
}