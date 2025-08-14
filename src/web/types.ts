/**
 * Web-specific types (reuse framework types where possible)
 */

import type { SimulationResults } from '../framework/types'

// Re-export framework types for web components
export type { ParameterDefinition, StatisticalSummary } from '../framework/types'

// Web-specific types only
export type WebSimulationResult = SimulationResults

export interface HistogramData {
  labels: string[]
  data: number[]
}