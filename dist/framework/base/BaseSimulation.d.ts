import { SimulationConfig, ParameterConfig, OutputConfig } from '@/cli/config/schema';
export interface ParameterValues {
    [key: string]: number | string | boolean;
}
export interface ScenarioResults {
    [key: string]: number | string | boolean;
}
export interface SimulationMetadata {
    name: string;
    category: string;
    description: string;
    version: string;
    tags: string[];
}
export interface ParameterGroup {
    name: string;
    description: string;
    parameters: string[];
}
/**
 * Abstract base class for all Monte Carlo simulations
 * Provides common utilities and enforces consistent architecture
 */
export declare abstract class BaseSimulation {
    protected config?: SimulationConfig | undefined;
    protected parameters: ParameterValues;
    constructor(config?: SimulationConfig | undefined);
    abstract defineMetadata(): SimulationMetadata;
    abstract defineParameters(): ParameterConfig[];
    abstract defineOutputs(): OutputConfig[];
    abstract calculateScenario(_params: ParameterValues): ScenarioResults;
    defineParameterGroups(): ParameterGroup[];
    /**
     * Generate complete simulation configuration
     */
    generateConfig(): SimulationConfig;
    /**
     * Run simulation with given parameters
     */
    simulate(params: ParameterValues): ScenarioResults;
    /**
     * Generate multiple scenario comparisons
     */
    compareScenarios(scenarios: Array<{
        name: string;
        parameters: ParameterValues;
    }>): Array<{
        name: string;
        results: ScenarioResults;
    }>;
    protected random(): number;
    protected round(value: number, decimals?: number): number;
    protected min(...values: number[]): number;
    protected max(...values: number[]): number;
    protected clamp(value: number, min: number, max: number): number;
    protected normalDistribution(mean: number, stdDev: number): number;
    protected triangularDistribution(min: number, max: number, mode: number): number;
    protected logNormalDistribution(mean: number, stdDev: number): number;
    protected percentileDistribution(values: number[], percentile: number): number;
    private validateParameters;
    private initializeFromConfig;
    private generateSimulationLogic;
    protected getParameter<T = number | string | boolean>(key: string, defaultValue?: T): T;
    protected hasParameter(key: string): boolean;
    getParameterSchema(): Record<string, any>;
}
