import { BaseSimulation, ParameterValues, ScenarioResults } from './BaseSimulation'
import { ParameterDefinition } from '../config/schema'

export interface BusinessKPIs {
  roi?: number
  paybackPeriod?: number
  breakEvenMonths?: number
  marginPercent?: number
  growthRate?: number
  customerAcquisitionCost?: number
  customerLifetimeValue?: number
  revenuePerUnit?: number
}

export interface ARRParameters {
  annualRecurringRevenue: number
  budgetPercent: number
  category: string
}

/**
 * Base class for business-focused Monte Carlo simulations
 * Includes ARR framework and standard business intelligence metrics
 */
export abstract class BusinessSimulation extends BaseSimulation {
  
  // Business simulation classes should implement this to define ARR parameters
  protected abstract defineARRParameters(): ARRParameters

  /**
   * Calculate total budget based on ARR and percentage allocation
   */
  protected calculateARRBudget(arrValue?: number, budgetPercent?: number): number {
    const arr = arrValue || this.getParameter<number>('annualRecurringRevenue')
    const percent = budgetPercent || this.getParameter<number>('budgetPercent', 10)
    
    if (!arr) {
      throw new Error('Annual Recurring Revenue (ARR) parameter is required for business simulations')
    }
    
    return arr * (percent / 100)
  }

  /**
   * Calculate monthly budget from ARR allocation
   */
  protected calculateMonthlyARRBudget(arrValue?: number, budgetPercent?: number): number {
    return this.calculateARRBudget(arrValue, budgetPercent) / 12
  }

  /**
   * Calculate return on investment percentage
   */
  protected calculateROI(investment: number, returns: number, timeframe: number = 1): number {
    if (investment <= 0) return 0
    return ((returns - investment) / investment) * 100 / timeframe
  }

  /**
   * Calculate payback period in months
   */
  protected calculatePaybackPeriod(investment: number, monthlyReturns: number): number {
    if (monthlyReturns <= 0) return 999
    return investment / monthlyReturns
  }

  /**
   * Calculate break-even timeline
   */
  protected calculateBreakEven(fixedCosts: number, unitPrice: number, unitCost: number, monthlyVolume: number): number {
    const monthlyMargin = (unitPrice - unitCost) * monthlyVolume
    if (monthlyMargin <= 0) return 999
    return fixedCosts / monthlyMargin
  }

  /**
   * Calculate Customer Acquisition Cost
   */
  protected calculateCAC(marketingSpend: number, customersAcquired: number): number {
    if (customersAcquired <= 0) return 0
    return marketingSpend / customersAcquired
  }

  /**
   * Calculate Customer Lifetime Value
   */
  protected calculateCLV(avgOrderValue: number, purchaseFrequency: number, customerLifespan: number, grossMargin: number = 0.3): number {
    return avgOrderValue * purchaseFrequency * customerLifespan * grossMargin
  }

  /**
   * Calculate Net Present Value with discount rate
   */
  protected calculateNPV(cashFlows: number[], discountRate: number): number {
    return cashFlows.reduce((npv, cashFlow, year) => {
      return npv + cashFlow / Math.pow(1 + discountRate, year)
    }, 0)
  }

  /**
   * Calculate compound growth rate
   */
  protected calculateCAGR(startingValue: number, endingValue: number, periods: number): number {
    if (startingValue <= 0 || endingValue <= 0 || periods <= 0) return 0
    return (Math.pow(endingValue / startingValue, 1 / periods) - 1) * 100
  }

  /**
   * Generate standard business KPIs
   */
  protected generateBusinessKPIs(
    revenue: number,
    costs: number,
    investment: number,
    customersAcquired: number = 0,
    marketingSpend: number = 0
  ): BusinessKPIs {
    const netProfit = revenue - costs
    const roi = this.calculateROI(investment, revenue)
    const paybackPeriod = this.calculatePaybackPeriod(investment, netProfit / 12)
    const marginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0
    
    const kpis: BusinessKPIs = {
      roi: this.round(roi, 1),
      paybackPeriod: this.round(this.min(paybackPeriod, 999), 1),
      marginPercent: this.round(marginPercent, 1),
      revenuePerUnit: revenue
    }

    if (customersAcquired > 0 && marketingSpend > 0) {
      kpis.customerAcquisitionCost = this.round(this.calculateCAC(marketingSpend, customersAcquired), 2)
    }

    return kpis
  }

  /**
   * Apply seasonal variation to a value
   */
  protected applySeasonalVariation(baseValue: number, seasonalVariationPercent: number): number {
    const variation = (this.random() - 0.5) * (seasonalVariationPercent / 100)
    return baseValue * (1 + variation)
  }

  /**
   * Model market competition impact
   */
  protected applyCompetitionImpact(baseValue: number, competitionLevel: 'low' | 'moderate' | 'high' | 'saturated'): number {
    const competitionMultipliers = {
      low: 1.2,
      moderate: 1.0,
      high: 0.8,
      saturated: 0.6
    }
    
    const baseMultiplier = competitionMultipliers[competitionLevel]
    const variance = 0.8 + this.random() * 0.4  // ±20% execution variance
    
    return baseValue * baseMultiplier * variance
  }

  /**
   * Model economic cycle impact
   */
  protected applyEconomicCycleImpact(baseValue: number, economicCycle: 'recession' | 'recovery' | 'expansion' | 'peak'): number {
    const cycleMultipliers = {
      recession: 0.7,
      recovery: 0.9,
      expansion: 1.1,
      peak: 1.0
    }
    
    return baseValue * cycleMultipliers[economicCycle]
  }

  /**
   * Calculate confidence intervals for results
   */
  protected calculateConfidenceInterval(values: number[], confidence: number = 0.95): { lower: number; upper: number; mean: number } {
    const sorted = values.slice().sort((a, b) => a - b)
    const alpha = 1 - confidence
    const lowerIndex = Math.floor(sorted.length * (alpha / 2))
    const upperIndex = Math.ceil(sorted.length * (1 - alpha / 2)) - 1
    const mean = sorted.reduce((sum, val) => sum + val, 0) / sorted.length
    
    return {
      lower: sorted[lowerIndex],
      upper: sorted[upperIndex],
      mean
    }
  }

  /**
   * Run Monte Carlo simulation with multiple iterations
   */
  runMonteCarloAnalysis(parameters: ParameterValues, iterations: number = 1000): {
    results: ScenarioResults[]
    statistics: {
      mean: Record<string, number>
      median: Record<string, number>
      confidenceInterval95: Record<string, { lower: number; upper: number }>
      standardDeviation: Record<string, number>
    }
  } {
    const results: ScenarioResults[] = []
    
    for (let i = 0; i < iterations; i++) {
      const result = this.calculateScenario(parameters)
      results.push(result)
    }
    
    // Calculate statistics
    const outputKeys = Object.keys(results[0]).filter(key => typeof results[0][key] === 'number')
    const statistics = {
      mean: {} as Record<string, number>,
      median: {} as Record<string, number>,
      confidenceInterval95: {} as Record<string, { lower: number; upper: number }>,
      standardDeviation: {} as Record<string, number>
    }
    
    outputKeys.forEach(key => {
      const values = results.map(r => r[key] as number)
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      const stdDev = Math.sqrt(variance)
      
      const ci = this.calculateConfidenceInterval(values, 0.95)
      
      statistics.mean[key] = this.round(mean, 2)
      statistics.median[key] = this.round(ci.mean, 2)
      statistics.confidenceInterval95[key] = {
        lower: this.round(ci.lower, 2),
        upper: this.round(ci.upper, 2)
      }
      statistics.standardDeviation[key] = this.round(stdDev, 2)
    })
    
    return { results, statistics }
  }

  /**
   * Add ARR parameters to the parameter definition list
   */
  protected addARRParameters(existingParameters: ParameterDefinition[]): ParameterDefinition[] {
    const arrParams = this.defineARRParameters()
    
    const arrParameterDefs: ParameterDefinition[] = [
      {
        key: 'annualRecurringRevenue',
        label: 'Annual Recurring Revenue (ARR)',
        type: 'number',
        default: arrParams.annualRecurringRevenue,
        min: 100000,
        max: 1000000000,
        step: 50000,
        description: `Company's annual recurring revenue for ${arrParams.category} investment planning`
      },
      {
        key: 'budgetPercent',
        label: `${arrParams.category} Budget (% of ARR)`,
        type: 'number',
        default: arrParams.budgetPercent,
        min: 1,
        max: 50,
        step: 0.5,
        description: `${arrParams.category} budget as percentage of ARR`
      }
    ]
    
    return [...arrParameterDefs, ...existingParameters]
  }
}