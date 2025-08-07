import { ParameterDefinition, SimulationMetadata, SimulationResults } from './types';
import { StatisticalAnalyzer } from './StatisticalAnalyzer';
import { ParameterSchema } from './ParameterSchema';
export declare abstract class MonteCarloEngine {
    protected analyzer: StatisticalAnalyzer;
    private _parameterSchema?;
    abstract getMetadata(): SimulationMetadata;
    abstract getParameterDefinitions(): ParameterDefinition[];
    abstract simulateScenario(_parameters: Record<string, unknown>): Record<string, number>;
    getParameterSchema(): ParameterSchema;
    validateParameters(parameters: Record<string, unknown>): void;
    runSimulation(parameters: Record<string, unknown>, iterations?: number, onProgress?: (_progress: number, _iteration: number) => void): Promise<SimulationResults>;
}
