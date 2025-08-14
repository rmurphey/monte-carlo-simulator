/**
 * Web-specific types for browser environment
 */

export type ParameterType = 'number' | 'boolean' | 'string' | 'select'

export interface ParameterConfig {
  key: string
  label: string
  type: ParameterType
  default: number | boolean | string
  min?: number
  max?: number
  step?: number
  options?: string[]
  description?: string
}

export interface OutputConfig {
  key: string
  label: string
  type: 'number' | 'string' | 'boolean'
  format?: string
  description?: string
}

export interface SimulationConfig {
  name: string
  category: string
  description: string
  version: string
  tags: string[]
  parameters: ParameterConfig[]
  outputs?: OutputConfig[]
  simulation: {
    logic: string
  }
}

export interface SimulationResult {
  [key: string]: number | string | boolean
}

export interface StatisticalSummary {
  [key: string]: {
    mean: number
    std: number
    min: number
    max: number
    p10: number
    p50: number
    p90: number
  }
}

export interface HistogramData {
  labels: string[]
  data: number[]
}