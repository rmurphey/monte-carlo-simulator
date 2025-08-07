import { SimulationConfig } from '../config/schema';
export declare class InteractiveConfigBuilder {
    private loader;
    private templateLibrary;
    buildConfiguration(): Promise<SimulationConfig>;
    private buildFromScratch;
    private promptTemplateUsage;
    private selectTemplate;
    private searchTemplates;
    private filterTemplatesByCategory;
    private displayTemplateGuidance;
    private browseTemplates;
    private customizeTemplate;
    private customizeBasicInfo;
    private customizeKeyParameters;
    private customizeAllParameters;
    private customizeOutputs;
    private promptBasicInfo;
    private promptParameters;
    private promptSingleParameter;
    private promptOutputs;
    private promptSimulationLogic;
    private generateDefaultLogic;
    private promptParameterGroups;
    testConfiguration(config: SimulationConfig): Promise<boolean>;
    saveConfiguration(config: SimulationConfig): Promise<string>;
}
