/**
 * ARR Business Context - Core framework module for automatic ARR-based budgeting
 * 
 * This module provides automatic injection of business context variables into all simulations,
 * ensuring consistent ARR-based budgeting across the entire Monte Carlo platform.
 */

export interface ARRBusinessContext {
  // Core ARR parameters (automatically injected if not present)
  annualRecurringRevenue: number
  
  // Calculated business context (derived from ARR)
  totalAnnualBudget: number
  monthlyBudget: number
  quarterlyBudget: number
  
  // Department budget functions (percentage-based)
  getMarketingBudget: (percent: number) => number
  getSalesBudget: (percent: number) => number
  getOperationsBudget: (percent: number) => number
  getProductBudget: (percent: number) => number
  getRDBudget: (percent: number) => number
  getRestaurantBudget: (percent: number) => number
  getGeneralBudget: (percent: number) => number
  
  // Time-based budget helpers
  getMonthlyFromPercent: (percent: number) => number
  getQuarterlyFromPercent: (percent: number) => number
  getAnnualFromPercent: (percent: number) => number
}

export interface ARRInjectionConfig {
  // Default ARR value for simulations that don't specify one
  defaultARR: number
  
  // Whether to automatically inject ARR parameters
  autoInjectARR: boolean
  
  // ARR parameter configuration
  arrParameter: {
    key: string
    label: string
    description: string
    min: number
    max: number
    step: number
  }
}

export class ARRBusinessContextInjector {
  private config: ARRInjectionConfig
  
  constructor(config: Partial<ARRInjectionConfig> = {}) {
    this.config = {
      defaultARR: 2000000, // $2M default ARR
      autoInjectARR: true,
      arrParameter: {
        key: 'annualRecurringRevenue',
        label: 'Annual Recurring Revenue (ARR)',
        description: 'Company annual recurring revenue for business context and budget planning',
        min: 100000,
        max: 50000000,
        step: 50000
      },
      ...config
    }
  }
  
  /**
   * Creates ARR business context from parameters
   */
  createBusinessContext(parameters: Record<string, unknown>): ARRBusinessContext {
    const arr = this.extractARR(parameters)
    
    return {
      annualRecurringRevenue: arr,
      totalAnnualBudget: arr,
      monthlyBudget: arr / 12,
      quarterlyBudget: arr / 4,
      
      // Department budget functions
      getMarketingBudget: (percent: number) => arr * (percent / 100),
      getSalesBudget: (percent: number) => arr * (percent / 100),
      getOperationsBudget: (percent: number) => arr * (percent / 100),
      getProductBudget: (percent: number) => arr * (percent / 100),
      getRDBudget: (percent: number) => arr * (percent / 100),
      getRestaurantBudget: (percent: number) => arr * (percent / 100),
      getGeneralBudget: (percent: number) => arr * (percent / 100),
      
      // Time-based helpers
      getMonthlyFromPercent: (percent: number) => (arr / 12) * (percent / 100),
      getQuarterlyFromPercent: (percent: number) => (arr / 4) * (percent / 100),
      getAnnualFromPercent: (percent: number) => arr * (percent / 100)
    }
  }
  
  /**
   * Extracts ARR value from parameters, using default if not present
   */
  private extractARR(parameters: Record<string, unknown>): number {
    const arrValue = parameters[this.config.arrParameter.key]
    
    if (typeof arrValue === 'number' && arrValue > 0) {
      return arrValue
    }
    
    return this.config.defaultARR
  }
  
  /**
   * Checks if simulation parameters already include ARR
   */
  hasARRParameter(parameterKeys: string[]): boolean {
    return parameterKeys.includes(this.config.arrParameter.key)
  }
  
  /**
   * Gets the ARR parameter definition for auto-injection
   */
  getARRParameterDefinition(defaultValue?: number) {
    return {
      key: this.config.arrParameter.key,
      label: this.config.arrParameter.label,
      type: 'number' as const,
      default: defaultValue || this.config.defaultARR,
      min: this.config.arrParameter.min,
      max: this.config.arrParameter.max,
      step: this.config.arrParameter.step,
      description: this.config.arrParameter.description
    }
  }
  
  /**
   * Creates standardized ARR parameter group
   */
  getARRParameterGroup() {
    return {
      name: 'Business Context',
      description: 'Company annual recurring revenue for business context and budget planning',
      parameters: [this.config.arrParameter.key]
    }
  }
  
  /**
   * Creates the business context injection code for simulation logic
   */
  getBusinessContextInjectionCode(parameterKeys: string[]): string {
    const hasArrParam = parameterKeys.includes(this.config.arrParameter.key)
    
    return `
      // ARR Business Context (automatically injected by framework)
      const businessContext = {
        annualRecurringRevenue: ${this.config.arrParameter.key},
        totalAnnualBudget: ${this.config.arrParameter.key},
        monthlyBudget: ${this.config.arrParameter.key} / 12,
        quarterlyBudget: ${this.config.arrParameter.key} / 4,
        
        // Department budget functions
        getMarketingBudget: (percent) => ${this.config.arrParameter.key} * (percent / 100),
        getSalesBudget: (percent) => ${this.config.arrParameter.key} * (percent / 100),
        getOperationsBudget: (percent) => ${this.config.arrParameter.key} * (percent / 100),
        getProductBudget: (percent) => ${this.config.arrParameter.key} * (percent / 100),
        getRDBudget: (percent) => ${this.config.arrParameter.key} * (percent / 100),
        getRestaurantBudget: (percent) => ${this.config.arrParameter.key} * (percent / 100),
        getGeneralBudget: (percent) => ${this.config.arrParameter.key} * (percent / 100),
        
        // Time-based helpers
        getMonthlyFromPercent: (percent) => (${this.config.arrParameter.key} / 12) * (percent / 100),
        getQuarterlyFromPercent: (percent) => (${this.config.arrParameter.key} / 4) * (percent / 100),
        getAnnualFromPercent: (percent) => ${this.config.arrParameter.key} * (percent / 100)
      };
      ${!hasArrParam ? `
      // Legacy compatibility: direct ARR access (only if not already a parameter)
      const annualRecurringRevenue = ${this.config.arrParameter.key};` : ''}
    `
  }
}

// Global instance for framework-wide use
export const globalARRInjector = new ARRBusinessContextInjector()