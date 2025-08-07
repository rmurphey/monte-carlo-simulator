"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonteCarloEngine = void 0;
const StatisticalAnalyzer_1 = require("./StatisticalAnalyzer");
const ParameterSchema_1 = require("./ParameterSchema");
class MonteCarloEngine {
    analyzer = new StatisticalAnalyzer_1.StatisticalAnalyzer();
    _parameterSchema;
    getParameterSchema() {
        if (!this._parameterSchema) {
            this._parameterSchema = new ParameterSchema_1.ParameterSchema(this.getParameterDefinitions());
        }
        return this._parameterSchema;
    }
    validateParameters(parameters) {
        const schema = this.getParameterSchema();
        const result = schema.validateParameters(parameters);
        if (!result.isValid) {
            throw new Error(`Parameter validation failed: ${result.errors.join('; ')}`);
        }
    }
    async runSimulation(parameters, iterations = 1000, onProgress) {
        const startTime = new Date();
        this.validateParameters(parameters);
        if (iterations <= 0) {
            throw new Error('Iterations must be greater than 0');
        }
        const results = [];
        const errors = [];
        for (let i = 0; i < iterations; i++) {
            try {
                const scenarioResult = this.simulateScenario(parameters);
                results.push({
                    iteration: i,
                    ...scenarioResult
                });
            }
            catch (error) {
                errors.push({
                    iteration: i,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            // Report progress every 100 iterations or on completion
            if (onProgress && (i % 100 === 0 || i === iterations - 1)) {
                onProgress((i + 1) / iterations, i + 1);
            }
        }
        if (results.length === 0) {
            const firstError = errors.length > 0 ? errors[0].error : 'Unknown error';
            throw new Error(`All simulation iterations failed. First error: ${firstError}`);
        }
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();
        // Calculate statistical summaries for all numeric result keys
        const numericKeys = Object.keys(results[0])
            .filter(key => key !== 'iteration' && typeof results[0][key] === 'number');
        const summary = {};
        for (const key of numericKeys) {
            const values = results.map(r => Number(r[key]));
            summary[key] = this.analyzer.calculateSummary(values);
        }
        return {
            metadata: this.getMetadata(),
            parameters,
            results,
            summary,
            startTime,
            endTime,
            duration,
            errors: errors.length > 0 ? errors : undefined
        };
    }
}
exports.MonteCarloEngine = MonteCarloEngine;
//# sourceMappingURL=MonteCarloEngine.js.map