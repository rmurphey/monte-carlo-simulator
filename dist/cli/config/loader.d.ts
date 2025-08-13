import { SimulationConfig } from './schema';
export declare class ConfigurationLoader {
    private validator;
    private loadedConfigs;
    loadConfig(filePath: string): Promise<SimulationConfig>;
    private mergeWithBase;
    private resolveBasePath;
    private mergeParameters;
    private mergeGroups;
    private mergeOutputs;
    loadMultipleConfigs(directory: string): Promise<SimulationConfig[]>;
    saveConfig(filePath: string, config: SimulationConfig): Promise<void>;
    private parseContent;
    validateConfigFile(filePath: string): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    getConfigMetadata(filePath: string): Promise<{
        name: string;
        category: string;
        version: string;
        parameterCount: number;
        outputCount: number;
    } | null>;
    generateConfigTemplate(): SimulationConfig;
}
