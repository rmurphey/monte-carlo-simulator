import { SimulationConfig } from '../config/schema';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    changes: ConfigChange[];
}
export interface ConfigChange {
    type: 'parameter' | 'logic' | 'output' | 'metadata';
    action: 'added' | 'modified' | 'deleted';
    path: string;
    oldValue?: any;
    newValue?: any;
    description: string;
}
export declare class InteractiveConfigEditor {
    editFullConfig(configPath: string): Promise<boolean>;
    editParametersOnly(config: SimulationConfig): Promise<SimulationConfig>;
    editLogicOnly(config: SimulationConfig): Promise<SimulationConfig>;
    addParameter(config: SimulationConfig): Promise<SimulationConfig>;
    deleteParameter(config: SimulationConfig): Promise<SimulationConfig>;
    validateConfig(config: SimulationConfig): Promise<ValidationResult>;
    showConfigDiff(oldConfig: SimulationConfig, newConfig: SimulationConfig): Promise<void>;
    showValidationResults(validation: ValidationResult): Promise<void>;
}
