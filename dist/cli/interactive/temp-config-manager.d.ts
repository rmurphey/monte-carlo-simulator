import { SimulationConfig } from '../config/schema';
export declare class TempConfigManager {
    private tempPaths;
    private sessionId;
    constructor();
    createTempConfig(config: SimulationConfig): Promise<string>;
    saveTempConfig(config: SimulationConfig, tempPath: string): Promise<void>;
    saveToOriginal(originalPath: string, config: SimulationConfig): Promise<void>;
    discardChanges(tempPath: string): Promise<void>;
    createBackup(originalPath: string): Promise<string>;
    cleanup(): Promise<void>;
    getTempPaths(): string[];
}
