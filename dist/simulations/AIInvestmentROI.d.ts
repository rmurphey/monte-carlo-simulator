import { MonteCarloEngine } from '../framework/MonteCarloEngine';
import { ParameterDefinition, SimulationMetadata } from '../framework/types';
export declare class AIInvestmentROI extends MonteCarloEngine {
    getMetadata(): SimulationMetadata;
    getParameterDefinitions(): ParameterDefinition[];
    simulateScenario(parameters: Record<string, unknown>): Record<string, number>;
    private randomize;
    setupParameterGroups(): void;
}
