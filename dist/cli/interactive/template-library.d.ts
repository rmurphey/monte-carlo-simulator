import { SimulationConfig } from '../config/schema';
export interface TemplateInfo {
    id: string;
    name: string;
    category: string;
    description: string;
    tags: string[];
    businessContext: string;
    useCase: string;
    industryRelevance: string[];
}
export interface BusinessTemplate {
    config: SimulationConfig;
    info: TemplateInfo;
    guidance: {
        whenToUse: string;
        parameterTips: Record<string, string>;
        businessInsights: string[];
        industryBenchmarks?: Record<string, string>;
    };
    businessIntelligence: {
        industry: string[];
        businessModel: 'B2B' | 'B2C' | 'B2B2C' | 'Marketplace' | 'SaaS';
        decisionType: 'investment' | 'operational' | 'strategic' | 'tactical';
        riskProfile: 'low' | 'medium' | 'high';
        timeHorizon: 'short' | 'medium' | 'long';
        kpiCategories: string[];
        agentOptimization: {
            keywords: string[];
            contextHints: string[];
            parameterPriority: string[];
        };
    };
}
export declare class TemplateLibrary {
    private templatesPath;
    private templates;
    private validator;
    constructor();
    loadTemplates(): Promise<void>;
    /**
     * Comprehensive template validation with detailed error reporting
     */
    private validateTemplate;
    /**
     * Validate simulation logic for common errors
     */
    private validateSimulationLogic;
    private createBusinessTemplate;
    private extractBusinessContext;
    private extractUseCase;
    private extractIndustryRelevance;
    private generateWhenToUse;
    private generateParameterTips;
    private generateBusinessInsights;
    private extractIndustryBenchmarks;
    private generateBusinessIntelligence;
    getTemplatesByCategory(category: string): BusinessTemplate[];
    getTemplatesByTag(tag: string): BusinessTemplate[];
    getTemplate(id: string): BusinessTemplate | undefined;
    getAllTemplates(): BusinessTemplate[];
    getTemplateCategories(): string[];
    searchTemplates(query: string): BusinessTemplate[];
    generateBusinessGuidance(template: BusinessTemplate): string;
}
