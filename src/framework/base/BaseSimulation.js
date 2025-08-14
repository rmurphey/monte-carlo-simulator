/**
 * Abstract base class for all Monte Carlo simulations
 * Provides common utilities and enforces consistent architecture
 */
export class BaseSimulation {
    constructor(config) {
        this.config = config;
        this.parameters = {};
        if (config) {
            this.initializeFromConfig(config);
        }
    }
    // Optional method for parameter grouping
    defineParameterGroups() {
        return [];
    }
    /**
     * Generate complete simulation configuration
     */
    generateConfig() {
        const metadata = this.defineMetadata();
        const parameters = this.defineParameters();
        const outputs = this.defineOutputs();
        const groups = this.defineParameterGroups();
        return {
            name: metadata.name,
            category: metadata.category,
            description: metadata.description,
            version: metadata.version,
            tags: metadata.tags,
            parameters,
            outputs,
            simulation: {
                logic: this.generateSimulationLogic()
            },
            ...(groups.length > 0 && { groups })
        };
    }
    /**
     * Run simulation with given parameters
     */
    simulate(params) {
        this.parameters = { ...params };
        this.validateParameters();
        return this.calculateScenario(params);
    }
    /**
     * Generate multiple scenario comparisons
     */
    compareScenarios(scenarios) {
        return scenarios.map(scenario => ({
            name: scenario.name,
            results: this.simulate(scenario.parameters)
        }));
    }
    // Monte Carlo utility functions available to all simulations
    random() {
        return Math.random();
    }
    round(value, decimals = 0) {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }
    min(...values) {
        return Math.min(...values);
    }
    max(...values) {
        return Math.max(...values);
    }
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    normalDistribution(mean, stdDev) {
        // Box-Muller transformation for normal distribution
        const u1 = this.random();
        const u2 = this.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + stdDev * z0;
    }
    triangularDistribution(min, max, mode) {
        const u = this.random();
        const c = (mode - min) / (max - min);
        if (u < c) {
            return min + Math.sqrt(u * (max - min) * (mode - min));
        }
        else {
            return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
        }
    }
    logNormalDistribution(mean, stdDev) {
        return Math.exp(this.normalDistribution(mean, stdDev));
    }
    percentileDistribution(values, percentile) {
        const sorted = values.slice().sort((a, b) => a - b);
        const index = (percentile / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        if (lower === upper) {
            return sorted[lower];
        }
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
    // Parameter validation
    validateParameters() {
        const parameterDefs = this.defineParameters();
        const parameterMap = new Map(parameterDefs.map(p => [p.key, p]));
        for (const [key, value] of Object.entries(this.parameters)) {
            const def = parameterMap.get(key);
            if (!def)
                continue;
            if (def.type === 'number' && typeof value === 'number') {
                if (def.min !== undefined && value < def.min) {
                    throw new Error(`Parameter ${key} value ${value} is below minimum ${def.min}`);
                }
                if (def.max !== undefined && value > def.max) {
                    throw new Error(`Parameter ${key} value ${value} exceeds maximum ${def.max}`);
                }
            }
            if (def.type === 'select' && def.options && !def.options.includes(value)) {
                throw new Error(`Parameter ${key} value ${value} is not in allowed options: ${def.options.join(', ')}`);
            }
        }
    }
    // Initialize from existing configuration (for backward compatibility)
    initializeFromConfig(config) {
        // Extract default values from parameters
        const defaultParams = {};
        config.parameters.forEach(param => {
            defaultParams[param.key] = param.default;
        });
        this.parameters = defaultParams;
    }
    // Generate simulation logic as string (for YAML export)
    generateSimulationLogic() {
        // This will be overridden by derived classes that need to export to YAML
        // For now, return a placeholder that indicates this is a TypeScript-based simulation
        return `// This simulation is implemented in TypeScript
// Use the simulate() method to run calculations
throw new Error('This simulation must be run through the TypeScript API')`;
    }
    // Helper method to get parameter value with type safety
    getParameter(key, defaultValue) {
        const value = this.parameters[key];
        return value !== undefined ? value : defaultValue;
    }
    // Helper method to check if parameter exists
    hasParameter(key) {
        return Object.prototype.hasOwnProperty.call(this.parameters, key);
    }
    // Generate parameter validation schema
    getParameterSchema() {
        const parameters = this.defineParameters();
        const schema = {};
        parameters.forEach(param => {
            schema[param.key] = {
                type: param.type,
                required: true,
                ...(param.min !== undefined && { min: param.min }),
                ...(param.max !== undefined && { max: param.max }),
                ...(param.options && { enum: param.options }),
                description: param.description
            };
        });
        return schema;
    }
}
//# sourceMappingURL=BaseSimulation.js.map