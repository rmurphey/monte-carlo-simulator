import React, { useState } from 'react'
import { ParameterSchema, ValidationResult } from '../../framework/ParameterSchema'

interface ParameterPanelProps {
  schema: ParameterSchema
  parameters: Record<string, unknown>
  onParameterChange: (key: string, value: unknown) => void
  onRunSimulation: (iterations: number) => void
  isRunning: boolean
  progress: number
  validationResult: ValidationResult
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({
  schema,
  parameters,
  onParameterChange,
  onRunSimulation,
  isRunning,
  progress,
  validationResult
}) => {
  const [iterations, setIterations] = useState(1000)
  const uiSchema = schema.generateUISchema()

  const renderParameterInput = (field: any) => {
    const value = parameters[field.key]
    
    switch (field.type) {
      case 'number':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.description && (
                <span className="block text-xs text-gray-500 font-normal">
                  {field.description}
                </span>
              )}
            </label>
            <input
              type="number"
              value={Number(value)}
              onChange={(e) => onParameterChange(field.key, parseFloat(e.target.value))}
              min={field.constraints?.min}
              max={field.constraints?.max}
              step={field.constraints?.step || 'any'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {field.constraints && (
              <div className="text-xs text-gray-500">
                Range: {field.constraints.min || 'No min'} - {field.constraints.max || 'No max'}
                {field.constraints.step && `, Step: ${field.constraints.step}`}
              </div>
            )}
          </div>
        )

      case 'boolean':
        return (
          <div key={field.key} className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => onParameterChange(field.key, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {field.label}
              </span>
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 ml-6">{field.description}</p>
            )}
          </div>
        )

      case 'select':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.description && (
                <span className="block text-xs text-gray-500 font-normal">
                  {field.description}
                </span>
              )}
            </label>
            <select
              value={String(value)}
              onChange={(e) => onParameterChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {field.options?.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Parameters</h2>
        
        {/* Grouped Parameters */}
        {uiSchema.groups.map((group) => (
          <div key={group.name} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
              {group.name}
            </h3>
            {group.description && (
              <p className="text-xs text-gray-600 mb-3">{group.description}</p>
            )}
            <div className="space-y-4">
              {group.fields.map(renderParameterInput)}
            </div>
          </div>
        ))}

        {/* Ungrouped Parameters */}
        {uiSchema.ungrouped.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
              Other Parameters
            </h3>
            <div className="space-y-4">
              {uiSchema.ungrouped.map(renderParameterInput)}
            </div>
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {!validationResult.isValid && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {validationResult.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Simulation Controls */}
      <div className="border-t pt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Iterations
          </label>
          <select
            value={iterations}
            onChange={(e) => setIterations(parseInt(e.target.value))}
            disabled={isRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value={100}>100 (Fast)</option>
            <option value={500}>500</option>
            <option value={1000}>1,000 (Recommended)</option>
            <option value={5000}>5,000</option>
            <option value={10000}>10,000 (Slow)</option>
          </select>
        </div>

        <button
          onClick={() => onRunSimulation(iterations)}
          disabled={isRunning || !validationResult.isValid}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isRunning ? 'Running Simulation...' : 'Run Monte Carlo Simulation'}
        </button>

        {/* Progress Bar */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Presets */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Presets</h4>
        <div className="space-y-2">
          <button
            onClick={() => {
              const defaults = schema.getDefaultParameters()
              Object.entries(defaults).forEach(([key, value]) => {
                onParameterChange(key, value)
              })
            }}
            disabled={isRunning}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}