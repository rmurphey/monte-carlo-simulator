import { ParameterDefinition } from './config/schema'

export interface ARRParameters {
  annualRecurringRevenue: number
  budgetPercent: number
  category: string
}

export interface BusinessContextInjection {
  arrBudget: number
  monthlyBudget: number
  quarterlyBudget: number
}

/**
 * Handles ARR-based business context injection for strategic simulations
 * Provides standard business intelligence functions without industry-specific logic
 */
export class ARRBusinessContextInjector {
  
  /**
   * Check if parameters already include ARR
   */
  hasARRParameter(parameterKeys: string[]): boolean {
    return parameterKeys.includes('annualRecurringRevenue')
  }

  /**
   * Get ARR parameter definition for strategic simulations
   */
  getARRParameterDefinition(category: string = 'Strategic Investment'): ParameterDefinition {
    return {
      key: 'annualRecurringRevenue',
      label: 'Annual Recurring Revenue (ARR)',
      type: 'number',
      default: 5000000,
      min: 100000,
      max: 1000000000,
      step: 50000,
      description: `Company's annual recurring revenue for ${category} investment planning`
    }
  }

  /**
   * Get parameter group for ARR context
   */
  getARRParameterGroup() {
    return {
      name: 'Business Context',
      description: 'Company financial context for strategic decision-making',
      parameters: ['annualRecurringRevenue', 'budgetPercent']
    }
  }

  /**
   * Generate business context injection code
   */
  getBusinessContextInjectionCode(parameterKeys: string[]): string {
    const hasARR = this.hasARRParameter(parameterKeys)
    
    if (!hasARR) {
      return `// No business context injection - ARR not provided`
    }

    return `
// Business Context Injection
const arrBudget = annualRecurringRevenue * (budgetPercent || 10) / 100
const monthlyBudget = arrBudget / 12
const quarterlyBudget = arrBudget / 4

// Business Intelligence Functions
const calculateROI = (investment, returns, timeframe = 1) => {
  if (investment <= 0) return 0
  return ((returns - investment) / investment) * 100 / timeframe
}

const calculatePaybackPeriod = (investment, monthlyReturns) => {
  if (monthlyReturns <= 0) return 999
  return investment / monthlyReturns
}

const calculateRunway = (currentCash, monthlyBurnRate) => {
  if (monthlyBurnRate <= 0) return 999
  return currentCash / monthlyBurnRate
}

const calculateNPV = (cashFlows, discountRate) => {
  return cashFlows.reduce((npv, cashFlow, year) => {
    return npv + cashFlow / Math.pow(1 + discountRate, year)
  }, 0)
}

const calculateCAC = (marketingSpend, customersAcquired) => {
  if (customersAcquired <= 0) return 0
  return marketingSpend / customersAcquired
}
`
  }

  /**
   * Create business context for a strategic simulation
   */
  createBusinessContext(arr: number, budgetPercent: number = 10): BusinessContextInjection {
    const arrBudget = arr * (budgetPercent / 100)
    
    return {
      arrBudget,
      monthlyBudget: arrBudget / 12,
      quarterlyBudget: arrBudget / 4
    }
  }
}

// Global instance for easy access
export const globalARRInjector = new ARRBusinessContextInjector()