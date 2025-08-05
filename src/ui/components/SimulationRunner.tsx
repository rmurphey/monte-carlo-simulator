import React, { useState, useCallback } from 'react'
import { MonteCarloEngine } from '../../framework/MonteCarloEngine'
import { SimulationResults } from '../../framework/types'
import { ParameterPanel } from './ParameterPanel'
import { ResultsDisplay } from './ResultsDisplay'

interface SimulationRunnerProps {
  simulation: MonteCarloEngine
  onBack: () => void
}

interface RunnerState {
  parameters: Record<string, unknown>
  results: SimulationResults | null
  isRunning: boolean
  progress: number
}

export const SimulationRunner: React.FC<SimulationRunnerProps> = ({ 
  simulation, 
  onBack 
}) => {
  const metadata = simulation.getMetadata()
  const schema = simulation.getParameterSchema()
  
  const [state, setState] = useState<RunnerState>({
    parameters: schema.getDefaultParameters(),
    results: null,
    isRunning: false,
    progress: 0
  })

  const handleParameterChange = useCallback((key: string, value: unknown) => {
    setState(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value
      }
    }))
  }, [])

  const handleRunSimulation = async (iterations: number = 1000) => {
    setState(prev => ({ ...prev, isRunning: true, progress: 0, results: null }))

    try {
      const results = await simulation.runSimulation(
        state.parameters,
        iterations,
        (progress, iteration) => {
          setState(prev => ({ ...prev, progress }))
        }
      )

      setState(prev => ({
        ...prev,
        results,
        isRunning: false,
        progress: 1
      }))
    } catch (error) {
      console.error('Simulation failed:', error)
      setState(prev => ({
        ...prev,
        isRunning: false,
        progress: 0
      }))
      alert(`Simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const validationResult = schema.validateParameters(state.parameters)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            ← Back to Browser
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{metadata.name}</h1>
            <p className="text-gray-600">{metadata.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            Category: {metadata.category}
          </div>
          <div className="text-sm text-gray-500">
            Version: {metadata.version}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameter Panel */}
        <div className="lg:col-span-1">
          <ParameterPanel
            schema={schema}
            parameters={state.parameters}
            onParameterChange={handleParameterChange}
            onRunSimulation={handleRunSimulation}
            isRunning={state.isRunning}
            progress={state.progress}
            validationResult={validationResult}
          />
        </div>

        {/* Results Display */}
        <div className="lg:col-span-2">
          {state.results ? (
            <ResultsDisplay results={state.results} />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Run</h3>
              <p className="text-gray-600">
                Configure your parameters and click "Run Simulation" to see results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}