import { StatisticalSummary } from './types';
export declare class StatisticalAnalyzer {
    calculateSummary(values: number[]): StatisticalSummary;
    calculateMean(values: number[]): number;
    calculateStandardDeviation(values: number[]): number;
    calculatePercentile(sortedValues: number[], percentile: number): number;
    calculateHistogram(values: number[], bins?: number): {
        binStart: number;
        binEnd: number;
        count: number;
        percentage: number;
    }[];
    calculateRiskMetrics(values: number[], threshold?: number): {
        probabilityOfLoss: number;
        valueAtRisk95: number;
        valueAtRisk99: number;
        expectedShortfall95: number;
        expectedShortfall99: number;
    };
}
