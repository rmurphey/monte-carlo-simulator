import React, { useState, useEffect } from 'react'
import { SimulationBrowser } from './components/SimulationBrowser'
import { SimulationRunner } from './components/SimulationRunner'
import { SimulationRegistry } from '../framework/SimulationRegistry'
import { SimulationMetadata, MonteCarloEngine } from '../framework'
import { registerAllSimulations } from '../simulations'

interface AppState {
  view: 'browser' | 'simulation'
  selectedSimulation: MonteCarloEngine | null
  availableSimulations: SimulationMetadata[]
}

export const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'browser',
    selectedSimulation: null,
    availableSimulations: []
  })

  useEffect(() => {
    // Register all simulations and get available ones
    const registry = SimulationRegistry.getInstance()
    registerAllSimulations()
    
    const simulations = registry.getAllSimulations()
    setState(prev => ({
      ...prev,
      availableSimulations: simulations
    }))
  }, [])

  const handleSimulationSelect = (simulationId: string) => {
    const registry = SimulationRegistry.getInstance()
    const simulation = registry.getSimulation(simulationId)
    
    if (simulation) {
      setState(prev => ({
        ...prev,
        view: 'simulation',
        selectedSimulation: simulation
      }))
    }
  }

  const handleBackToBrowser = () => {
    setState(prev => ({
      ...prev,
      view: 'browser',
      selectedSimulation: null
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state.view === 'browser' ? (
          <SimulationBrowser
            simulations={state.availableSimulations}
            onSimulationSelect={handleSimulationSelect}
          />
        ) : state.selectedSimulation ? (
          <SimulationRunner
            simulation={state.selectedSimulation}
            onBack={handleBackToBrowser}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading simulation...</p>
          </div>
        )}
      </div>
    </div>
  )
}