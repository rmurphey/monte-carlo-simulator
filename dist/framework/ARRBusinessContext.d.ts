import { ParameterConfig } from '@/cli/config/schema';
export interface ARRParameters {
    annualRecurringRevenue: number;
    budgetPercent: number;
    category: string;
}
export interface BusinessContextInjection {
    arrBudget: number;
    monthlyBudget: number;
    quarterlyBudget: number;
}
/**
 * Handles ARR-based business context injection for strategic simulations
 * Provides standard business intelligence functions without industry-specific logic
 */
export declare class ARRBusinessContextInjector {
    /**
     * Check if parameters already include ARR
     */
    hasARRParameter(parameterKeys: string[]): boolean;
    /**
     * Get ARR parameter definition for strategic simulations
     */
    getARRParameterDefinition(category?: string): ParameterConfig;
    /**
     * Get parameter group for ARR context
     */
    getARRParameterGroup(): {
        name: string;
        description: string;
        parameters: string[];
    };
    /**
     * Generate business context injection code
     */
    getBusinessContextInjectionCode(parameterKeys: string[]): string;
    /**
     * Create business context for a strategic simulation
     */
    createBusinessContext(arr: number, budgetPercent?: number): BusinessContextInjection;
}
export declare const globalARRInjector: ARRBusinessContextInjector;
