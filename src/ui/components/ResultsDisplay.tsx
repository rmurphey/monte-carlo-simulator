import React, { useState, useMemo } from 'react'
import { SimulationResults } from '../../framework/types'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter
} from 'recharts'

interface ResultsDisplayProps {
  results: SimulationResults
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>()
  
  const metrics = Object.keys(results.summary)
  const primaryMetric = selectedMetric || metrics[0]

  // Generate histogram data for the selected metric
  const histogramData = useMemo(() => {
    if (!primaryMetric) return []
    
    const values = results.results
      .map(r => Number(r[primaryMetric]))
      .filter(v => !isNaN(v))
      .sort((a, b) => a - b)
    
    if (values.length === 0) return []
    
    const bins = 20
    const min = Math.min(...values)
    const max = Math.max(...values)
    const binWidth = (max - min) / bins
    
    const histogram = []
    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binWidth
      const binEnd = binStart + binWidth
      const count = values.filter(v => v >= binStart && (i === bins - 1 ? v <= binEnd : v < binEnd)).length
      
      histogram.push({
        binStart,
        binEnd,
        binCenter: binStart + binWidth / 2,
        count,
        percentage: (count / values.length) * 100
      })
    }
    
    return histogram
  }, [results, primaryMetric])

  // Time series data (first 100 iterations)
  const timeSeriesData = useMemo(() => {
    return results.results.slice(0, 100).map((result, index) => ({
      iteration: index + 1,
      [primaryMetric]: Number(result[primaryMetric])
    }))
  }, [results, primaryMetric])

  // Scatter plot data for two metrics comparison
  const scatterData = useMemo(() => {
    if (metrics.length < 2) return []
    
    const metric1 = metrics[0]
    const metric2 = metrics[1]
    
    return results.results.slice(0, 200).map((result, index) => ({
      [metric1]: Number(result[metric1]),
      [metric2]: Number(result[metric2]),
      iteration: index + 1
    }))
  }, [results, metrics])

  const formatValue = (value: number, key: string) => {
    if (key.toLowerCase().includes('roi') || key.toLowerCase().includes('rate')) {
      return `${(value * 100).toFixed(1)}%`
    }
    if (key.toLowerCase().includes('cost') || key.toLowerCase().includes('benefit') || key.toLowerCase().includes('value')) {
      return `$${(value / 1000).toFixed(0)}k`
    }
    if (key.toLowerCase().includes('time') || key.toLowerCase().includes('period')) {
      return `${value.toFixed(1)} ${value === 1 ? 'month' : 'months'}`
    }
    return value.toFixed(2)
  }

  const summary = results.summary[primaryMetric]

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Results Summary</h2>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Metric:</label>
            <select
              value={primaryMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              {metrics.map(metric => (
                <option key={metric} value={metric}>
                  {metric}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Mean</h3>
            <p className="text-xl font-bold text-blue-600">
              {formatValue(summary.mean, primaryMetric)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">90th Percentile</h3>
            <p className="text-xl font-bold text-green-600">
              {formatValue(summary.percentile90, primaryMetric)}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-800">10th Percentile</h3>
            <p className="text-xl font-bold text-red-600">
              {formatValue(summary.percentile10, primaryMetric)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Std Dev</h3>
            <p className="text-xl font-bold text-purple-600">
              {formatValue(summary.standardDeviation, primaryMetric)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Median:</span>
            <span className="ml-1 font-medium">{formatValue(summary.median, primaryMetric)}</span>
          </div>
          <div>
            <span className="text-gray-600">Min:</span>
            <span className="ml-1 font-medium">{formatValue(summary.min, primaryMetric)}</span>
          </div>
          <div>
            <span className="text-gray-600">Max:</span>
            <span className="ml-1 font-medium">{formatValue(summary.max, primaryMetric)}</span>
          </div>
          <div>
            <span className="text-gray-600">25th %ile:</span>
            <span className="ml-1 font-medium">{formatValue(summary.percentile25, primaryMetric)}</span>
          </div>
          <div>
            <span className="text-gray-600">75th %ile:</span>
            <span className="ml-1 font-medium">{formatValue(summary.percentile75, primaryMetric)}</span>
          </div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribution of {primaryMetric}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={histogramData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="binCenter"
              tickFormatter={(value) => formatValue(value, primaryMetric)}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: any) => [`${value} scenarios`, 'Count']}
              labelFormatter={(value) => `${primaryMetric}: ${formatValue(Number(value), primaryMetric)}`}
            />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Time Series */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {primaryMetric} Over Iterations (First 100)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="iteration" />
            <YAxis tickFormatter={(value) => formatValue(value, primaryMetric)} />
            <Tooltip 
              formatter={(value: any) => [formatValue(Number(value), primaryMetric), primaryMetric]}
              labelFormatter={(value) => `Iteration ${value}`}
            />
            <Line 
              type="monotone" 
              dataKey={primaryMetric} 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Scatter Plot for Two Metrics */}
      {metrics.length >= 2 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {metrics[0]} vs {metrics[1]} (Sample of 200)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={metrics[0]}
                tickFormatter={(value) => formatValue(value, metrics[0])}
              />
              <YAxis 
                dataKey={metrics[1]}
                tickFormatter={(value) => formatValue(value, metrics[1])}
              />
              <Tooltip 
                formatter={(value: any, name) => [formatValue(Number(value), String(name)), name]}
              />
              <Scatter 
                dataKey={metrics[1]} 
                fill="#3B82F6" 
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Simulation Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Simulation Details</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Iterations:</span>
            <span className="ml-1 font-medium">{results.results.length.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">Duration:</span>
            <span className="ml-1 font-medium">{(results.duration / 1000).toFixed(1)}s</span>
          </div>
          <div>
            <span className="text-gray-600">Started:</span>
            <span className="ml-1 font-medium">{results.startTime.toLocaleTimeString()}</span>
          </div>
          <div>
            <span className="text-gray-600">Completed:</span>
            <span className="ml-1 font-medium">{results.endTime.toLocaleTimeString()}</span>
          </div>
        </div>
        
        {results.errors && results.errors.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h5 className="text-sm font-medium text-yellow-800 mb-1">
              Warnings ({results.errors.length} iterations failed)
            </h5>
            <div className="text-xs text-yellow-700">
              {results.errors.slice(0, 3).map((error, index) => (
                <div key={index}>Iteration {error.iteration}: {error.error}</div>
              ))}
              {results.errors.length > 3 && (
                <div>... and {results.errors.length - 3} more</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}