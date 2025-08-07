export interface SimulationConfig {
    name: string;
    category: string;
    description: string;
    version: string;
    tags: string[];
    baseSimulation?: string;
    businessContext?: boolean;
    parameters: ParameterConfig[];
    groups?: ParameterGroupConfig[];
    outputs?: OutputConfig[];
    simulation?: {
        logic: string;
    };
}
export type ParameterType = 'number' | 'boolean' | 'string' | 'select';
export interface ParameterConfig {
    key: string;
    label: string;
    type: ParameterType;
    default: number | boolean | string;
    min?: number;
    max?: number;
    step?: number;
    options?: string[];
    description?: string;
}
export interface ParameterGroupConfig {
    name: string;
    description?: string;
    parameters: string[];
}
export interface OutputConfig {
    key: string;
    label: string;
    description?: string;
}
export declare class ConfigurationValidator {
    private ajv;
    private validate;
    constructor();
    validateConfig(config: unknown): {
        valid: boolean;
        errors: string[];
    };
    private validateBusinessRules;
}
