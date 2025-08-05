import React from 'react'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { StatisticalSummary } from './types'

interface HistogramProps {
  data: { binStart: number; binEnd: number; count: number; percentage: number }[]
  xAxisLabel?: string
  yAxisLabel?: string
  color?: string
}

export const Histogram: React.FC<HistogramProps> = ({ 
  data, 
  xAxisLabel = 'Value', 
  yAxisLabel = 'Count',
  color = '#3B82F6' 
}) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data.map(d => ({ ...d, binCenter: (d.binStart + d.binEnd) / 2 }))}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey="binCenter" 
        domain={['dataMin', 'dataMax']}
        type="number"
        label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }}
      />
      <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
      <Tooltip 
        formatter={(value: number, name: string) => [`${value} scenarios`, 'Count']}
        labelFormatter={(value: number) => `${xAxisLabel}: ${value.toFixed(1)}`}
      />
      <Bar dataKey="count" fill={color} />
    </BarChart>
  </ResponsiveContainer>
)

interface ScatterPlotProps {
  data: Array<{ x: number; y: number; [key: string]: any }>
  xKey: string
  yKey: string
  xAxisLabel?: string
  yAxisLabel?: string
  color?: string
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ 
  data, 
  xKey, 
  yKey, 
  xAxisLabel, 
  yAxisLabel,
  color = '#3B82F6' 
}) => (
  <ResponsiveContainer width="100%" height={300}>
    <ScatterChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey={xKey}
        type="number"
        label={{ value: xAxisLabel || xKey, position: 'insideBottom', offset: -10 }}
      />
      <YAxis 
        dataKey={yKey}
        type="number"
        label={{ value: yAxisLabel || yKey, angle: -90, position: 'insideLeft' }}
      />
      <Tooltip />
      <Scatter dataKey={yKey} fill={color} fillOpacity={0.6} />
    </ScatterChart>
  </ResponsiveContainer>
)

interface TimeSeriesProps {
  data: Array<{ period: number; [key: string]: number }>
  lines: Array<{ dataKey: string; name: string; color?: string }>
  xAxisLabel?: string
  yAxisLabel?: string
}

export const TimeSeries: React.FC<TimeSeriesProps> = ({ 
  data, 
  lines, 
  xAxisLabel = 'Period', 
  yAxisLabel = 'Value' 
}) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey="period"
        label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }}
      />
      <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
      <Tooltip />
      <Legend />
      {lines.map((line, index) => (
        <Line 
          key={line.dataKey}
          type="monotone" 
          dataKey={line.dataKey} 
          stroke={line.color || `hsl(${index * 60}, 70%, 50%)`}
          name={line.name}
          strokeWidth={2}
        />
      ))}
    </LineChart>
  </ResponsiveContainer>
)

interface StatsSummaryProps {
  summary: StatisticalSummary
  title: string
  formatValue?: (value: number) => string
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ 
  summary, 
  title,
  formatValue = (v) => v.toFixed(2)
}) => (
  <div className="bg-white border rounded-lg p-6">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="bg-blue-50 p-3 rounded">
        <div className="text-sm text-blue-600 font-medium">Mean</div>
        <div className="text-xl font-bold text-blue-800">{formatValue(summary.mean)}</div>
      </div>
      <div className="bg-green-50 p-3 rounded">
        <div className="text-sm text-green-600 font-medium">Median</div>
        <div className="text-xl font-bold text-green-800">{formatValue(summary.median)}</div>
      </div>
      <div className="bg-yellow-50 p-3 rounded">
        <div className="text-sm text-yellow-600 font-medium">Std Dev</div>
        <div className="text-xl font-bold text-yellow-800">{formatValue(summary.standardDeviation)}</div>
      </div>
      <div className="bg-red-50 p-3 rounded">
        <div className="text-sm text-red-600 font-medium">10th %ile</div>
        <div className="text-xl font-bold text-red-800">{formatValue(summary.percentile10)}</div>
      </div>
      <div className="bg-purple-50 p-3 rounded">
        <div className="text-sm text-purple-600 font-medium">90th %ile</div>
        <div className="text-xl font-bold text-purple-800">{formatValue(summary.percentile90)}</div>
      </div>
      <div className="bg-gray-50 p-3 rounded">
        <div className="text-sm text-gray-600 font-medium">Range</div>
        <div className="text-xl font-bold text-gray-800">
          {formatValue(summary.min)} - {formatValue(summary.max)}
        </div>
      </div>
    </div>
  </div>
)

interface RiskMetricsProps {
  data: {
    probabilityOfLoss: number
    valueAtRisk95: number
    valueAtRisk99: number
    expectedShortfall95: number
    expectedShortfall99: number
  }
  formatValue?: (value: number) => string
}

export const RiskMetrics: React.FC<RiskMetricsProps> = ({ 
  data,
  formatValue = (v) => v.toFixed(2)
}) => (
  <div className="bg-white border rounded-lg p-6">
    <h3 className="text-lg font-semibold mb-4">Risk Metrics</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-red-50 p-3 rounded">
        <div className="text-sm text-red-600 font-medium">Probability of Loss</div>
        <div className="text-xl font-bold text-red-800">{data.probabilityOfLoss.toFixed(1)}%</div>
      </div>
      <div className="bg-orange-50 p-3 rounded">
        <div className="text-sm text-orange-600 font-medium">VaR (95%)</div>
        <div className="text-xl font-bold text-orange-800">{formatValue(data.valueAtRisk95)}</div>
      </div>
      <div className="bg-red-100 p-3 rounded">
        <div className="text-sm text-red-700 font-medium">VaR (99%)</div>
        <div className="text-xl font-bold text-red-900">{formatValue(data.valueAtRisk99)}</div>
      </div>
      <div className="bg-pink-50 p-3 rounded">
        <div className="text-sm text-pink-600 font-medium">Expected Shortfall (95%)</div>
        <div className="text-xl font-bold text-pink-800">{formatValue(data.expectedShortfall95)}</div>
      </div>
    </div>
  </div>
)