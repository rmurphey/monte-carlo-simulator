import { StatisticalSummary } from '../../framework/types';
import { SimulationConfig } from '../config/schema';
interface DocumentOptions {
    includeCharts?: boolean;
    includeRawData?: boolean;
    includeRecommendations?: boolean;
    title?: string;
}
interface CLISimulationResults {
    results: Array<Record<string, number | boolean | string>>;
    summary: Record<string, StatisticalSummary>;
}
export declare class DocumentGenerator {
    generateAnalysisDocument(results: CLISimulationResults, config: SimulationConfig, parameters: Record<string, any>, options?: DocumentOptions): string;
    private generateHistogram;
    private generateConfidenceChart;
    private generateKeyInsights;
    private generateRiskAnalysis;
    private generateRecommendations;
    private formatKey;
    private formatValue;
    private formatParameterValue;
}
export declare const documentGenerator: DocumentGenerator;
export {};
