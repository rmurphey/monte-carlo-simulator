import { BaseSimulation } from './BaseSimulation';
export interface ParameterValues {
    [key: string]: unknown;
}
export interface ScenarioResults {
    [key: string]: number | string;
}
export interface BusinessKPIs {
    roi?: number;
    paybackPeriod?: number;
    breakEvenMonths?: number;
    marginPercent?: number;
    growthRate?: number;
    customerAcquisitionCost?: number;
    customerLifetimeValue?: number;
    revenuePerUnit?: number;
}
/**
 * Base class for business-focused Monte Carlo simulations
 * Provides essential business intelligence functions without industry-specific logic
 */
export declare abstract class BusinessSimulation extends BaseSimulation {
    /**
     * Calculate return on investment percentage
     */
    protected calculateROI(investment: number, returns: number, timeframe?: number): number;
    /**
     * Calculate payback period in months
     */
    protected calculatePaybackPeriod(investment: number, monthlyReturns: number): number;
    /**
     * Calculate break-even timeline
     */
    protected calculateBreakEven(fixedCosts: number, unitPrice: number, unitCost: number, monthlyVolume: number): number;
    /**
     * Calculate Customer Acquisition Cost
     */
    protected calculateCAC(marketingSpend: number, customersAcquired: number): number;
    /**
     * Calculate Customer Lifetime Value
     */
    protected calculateCLV(avgOrderValue: number, purchaseFrequency: number, customerLifespan: number, grossMargin?: number): number;
    /**
     * Calculate Net Present Value with discount rate
     */
    protected calculateNPV(cashFlows: number[], discountRate: number): number;
    /**
     * Calculate compound annual growth rate
     */
    protected calculateCAGR(startingValue: number, endingValue: number, periods: number): number;
    /**
     * Calculate monthly burn rate and runway
     */
    protected calculateRunway(currentCash: number, monthlyBurnRate: number): number;
    /**
     * Calculate team scaling costs with coordination overhead
     */
    protected calculateTeamScalingCost(currentTeamSize: number, newHires: number, avgSalary: number, coordinationOverhead?: number): number;
    /**
     * Generate standard business KPIs
     */
    protected generateBusinessKPIs(revenue: number, costs: number, investment: number, customersAcquired?: number, marketingSpend?: number): BusinessKPIs;
    /**
     * Apply seasonal variation to a value
     */
    protected applySeasonalVariation(baseValue: number, seasonalVariationPercent: number): number;
    /**
     * Model market competition impact
     */
    protected applyCompetitionImpact(baseValue: number, competitionLevel: 'low' | 'moderate' | 'high' | 'saturated'): number;
    /**
     * Calculate confidence intervals for results
     */
    protected calculateConfidenceInterval(values: number[], confidence?: number): {
        lower: number;
        upper: number;
        mean: number;
    };
    /**
     * Run Monte Carlo simulation with multiple iterations
     */
    runMonteCarloAnalysis(parameters: ParameterValues, iterations?: number): {
        results: ScenarioResults[];
        statistics: {
            mean: Record<string, number>;
            median: Record<string, number>;
            confidenceInterval95: Record<string, {
                lower: number;
                upper: number;
            }>;
            standardDeviation: Record<string, number>;
        };
    };
    abstract calculateScenario(_params: ParameterValues): ScenarioResults;
}
