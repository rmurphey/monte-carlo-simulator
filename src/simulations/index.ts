import { SimulationRegistry } from '../framework/SimulationRegistry'
import { AIInvestmentROI } from './AIInvestmentROI'

export function registerAllSimulations(): void {
  const registry = SimulationRegistry.getInstance()
  
  // Register AI Investment ROI simulation
  registry.register(
    () => {
      const simulation = new AIInvestmentROI()
      simulation.setupParameterGroups()
      return simulation
    },
    ['ai', 'finance', 'roi', 'investment', 'productivity']
  )
}

export { AIInvestmentROI }