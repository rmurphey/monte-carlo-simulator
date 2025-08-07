import { ParameterDefinition } from './types';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export interface ParameterGroup {
    name: string;
    description?: string;
    parameters: string[];
}
export declare class ParameterSchema {
    private definitions;
    private groups;
    constructor(definitions: ParameterDefinition[]);
    addGroup(group: ParameterGroup): void;
    getGroups(): ParameterGroup[];
    getDefinitions(): ParameterDefinition[];
    getDefinition(key: string): ParameterDefinition | undefined;
    validateParameter(key: string, value: unknown): ValidationResult;
    validateParameters(parameters: Record<string, unknown>): ValidationResult;
    getDefaultParameters(): Record<string, unknown>;
    coerceParameters(parameters: Record<string, unknown>): Record<string, unknown>;
    generateUISchema(): {
        groups: Array<{
            name: string;
            description?: string;
            fields: Array<{
                key: string;
                label: string;
                type: string;
                defaultValue: unknown;
                constraints?: Record<string, unknown>;
                options?: string[];
                description?: string;
            }>;
        }>;
        ungrouped: Array<{
            key: string;
            label: string;
            type: string;
            defaultValue: unknown;
            constraints?: Record<string, unknown>;
            options?: string[];
            description?: string;
        }>;
    };
    private definitionToUIField;
}
