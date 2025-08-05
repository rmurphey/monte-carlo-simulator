import React, { useState, useMemo } from 'react'
import { SimulationMetadata } from '../../framework/types'

interface SimulationBrowserProps {
  simulations: SimulationMetadata[]
  onSimulationSelect: (simulationId: string) => void
}

export const SimulationBrowser: React.FC<SimulationBrowserProps> = ({ 
  simulations, 
  onSimulationSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = useMemo(() => {
    const cats = new Set(simulations.map(sim => sim.category))
    return ['all', ...Array.from(cats).sort()]
  }, [simulations])

  const filteredSimulations = useMemo(() => {
    return simulations.filter(sim => {
      const matchesSearch = sim.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sim.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || sim.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [simulations, searchTerm, selectedCategory])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Monte Carlo Simulation Framework</h1>
        <p className="mt-2 text-gray-600">
          Choose a simulation to explore various scenarios with uncertainty modeling
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search simulations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSimulations.map(simulation => (
          <div
            key={simulation.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSimulationSelect(simulation.id)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{simulation.name}</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                v{simulation.version}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {simulation.description}
            </p>
            
            <div className="flex justify-between items-center">
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {simulation.category}
              </span>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Run Simulation →
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSimulations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No simulations found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}