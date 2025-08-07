export interface ParameterDefinition {
    key: string;
    label: string;
    type: 'number' | 'boolean' | 'string' | 'select';
    defaultValue: number | boolean | string;
    min?: number;
    max?: number;
    step?: number;
    options?: string[];
    description?: string;
}
export interface SimulationMetadata {
    id: string;
    name: string;
    description: string;
    category: string;
    version: string;
}
export interface SimulationResult {
    iteration: number;
    [key: string]: number | boolean | string;
}
export interface StatisticalSummary {
    mean: number;
    median: number;
    standardDeviation: number;
    percentile10: number;
    percentile25: number;
    percentile75: number;
    percentile90: number;
    min: number;
    max: number;
    count: number;
}
export interface SimulationResults {
    metadata: SimulationMetadata;
    parameters: Record<string, unknown>;
    results: SimulationResult[];
    summary: Record<string, StatisticalSummary>;
    startTime: Date;
    endTime: Date;
    duration: number;
    errors?: Array<{
        iteration: number;
        error: string;
    }>;
}
