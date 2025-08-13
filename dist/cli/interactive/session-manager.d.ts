import { SimulationConfig, RunOptions } from '../config/schema';
export interface ConfigHistoryEntry {
    config: SimulationConfig;
    timestamp: Date;
    description: string;
}
export interface InteractiveCommand {
    key: string;
    description: string;
    action: () => Promise<void>;
}
export declare class InteractiveSimulationSession {
    private config;
    private originalConfigPath;
    private tempManager;
    private editor;
    private results;
    private configHistory;
    private rl;
    private options;
    private simulation;
    constructor(configPath: string, options: RunOptions);
    start(): Promise<void>;
    private initialize;
    private runInitialSimulation;
    private displayResultsSummary;
    private enterMainLoop;
    private displayMainMenu;
    private getCommand;
    private handleMainCommand;
    private runSimulation;
    private quickParameterEdit;
    private enterConfigEditMode;
    private displayConfigSummary;
    private displayConfigMenu;
    private handleConfigCommand;
    private editFullConfig;
    private editLogicOnly;
    private testConfig;
    private updateConfig;
    private undoChanges;
    private saveConfig;
    private exportResults;
    private showHelp;
    private setupKeyboardShortcuts;
    private cleanup;
}
