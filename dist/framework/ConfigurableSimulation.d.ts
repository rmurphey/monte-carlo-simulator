import { MonteCarloEngine } from './MonteCarloEngine';
import { SimulationMetadata, ParameterDefinition, SimulationResults } from './types';
import { SimulationConfig } from '../cli/config/schema';
export declare class ConfigurableSimulation extends MonteCarloEngine {
    private config;
    private arrInjector;
    private enhancedConfig;
    constructor(config: SimulationConfig);
    /**
     * Enhances simulation config with optional business context injection
     * Only injects ARR if explicitly requested or detected via strategic keywords
     */
    private enhanceConfigWithBusinessContext;
    /**
     * Determines if this simulation should have business context injected
     */
    private shouldInjectBusinessContext;
    /**
     * Injects business context into simulation logic
     */
    private injectBusinessContext;
    getMetadata(): SimulationMetadata;
    getParameterDefinitions(): ParameterDefinition[];
    simulateScenario(parameters: Record<string, unknown>): Record<string, number | string | boolean>;
    setupParameterGroups(): void;
    getOutputDefinitions(): import("../cli/config/schema").OutputConfig[];
    getConfiguration(): SimulationConfig;
    validateConfiguration(): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Run Monte Carlo simulation with multiple iterations and statistical analysis
     */
    runSimulation(parameters: Record<string, unknown>, iterations?: number, onProgress?: (_progress: number, _iteration: number) => void): Promise<SimulationResults>;
}
