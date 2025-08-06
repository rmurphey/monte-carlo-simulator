import { BusinessSimulation, ParameterValues, ScenarioResults, BusinessKPIs, ARRParameters } from '../base/BusinessSimulation'
import { ParameterDefinition, OutputDefinition } from '../config/schema'
import { SimulationMetadata, ParameterGroup } from '../base/BaseSimulation'

export type LocationQuality = 'poor' | 'fair' | 'good' | 'excellent' | 'prime'
export type CuisineType = 'fast-casual' | 'casual-dining' | 'fine-dining' | 'ethnic-specialty' | 'quick-service'
export type StaffingModel = 'counter-service' | 'limited-service' | 'full-service' | 'fine-dining-service'
export type MarketingStrategy = 'digital-only' | 'traditional-local' | 'balanced' | 'premium-brand'

export interface LocationFactors {
  traffic: number
  rentMultiplier: number
  customerQuality: number
}

export interface CuisineFactors {
  turnover: number
  ticketVariation: number
  laborIntensity: number
}

export interface RestaurantKPIs extends BusinessKPIs {
  revenuePerSeat: number
  foodCostPercent: number
  laborCostPercent: number
  customerAcquisitionCost: number
  averageTableTurns: number
}

/**
 * Comprehensive restaurant simulation with industry-standard calculations
 * Eliminates duplication across restaurant scenario variations
 */
export class RestaurantSimulation extends BusinessSimulation {
  
  protected defineARRParameters(): ARRParameters {
    return {
      annualRecurringRevenue: 5000000,
      budgetPercent: 8,
      category: 'Restaurant Investment'
    }
  }

  defineMetadata(): SimulationMetadata {
    return {
      name: 'Restaurant Profitability Analysis',
      category: 'Business Operations',
      description: 'Restaurant financial analysis with industry KPIs and investment planning',
      version: '2.0.0',
      tags: ['restaurant', 'hospitality', 'profitability', 'operations', 'investment-planning']
    }
  }

  defineParameters(): ParameterDefinition[] {
    const baseParameters: ParameterDefinition[] = [
      {
        key: 'seatingCapacity',
        label: 'Seating Capacity',
        type: 'number',
        default: 120,
        min: 30,
        max: 400,
        step: 10,
        description: 'Maximum dining room capacity (industry standard: 80-200 seats)'
      },
      {
        key: 'averageTicket',
        label: 'Average Ticket Size ($)',
        type: 'number',
        default: 65.00,
        min: 15.00,
        max: 300.00,
        step: 5.00,
        description: 'Average customer spend per visit (fast-casual: $15-25, casual: $45-85, fine: $100-300)'
      },
      {
        key: 'cuisineType',
        label: 'Restaurant Category',
        type: 'select',
        default: 'casual-dining',
        options: ['fast-casual', 'casual-dining', 'fine-dining', 'ethnic-specialty', 'quick-service'],
        description: 'Restaurant category affecting pricing, turnover, and operational complexity'
      },
      {
        key: 'locationTier',
        label: 'Location Quality',
        type: 'select',
        default: 'prime-suburban',
        options: ['neighborhood', 'strip-mall', 'downtown', 'prime-suburban', 'tourist-district'],
        description: 'Location quality impacts foot traffic, rent, and customer demographics'
      },
      {
        key: 'staffingModel',
        label: 'Staffing Approach',
        type: 'select',
        default: 'full-service',
        options: ['counter-service', 'limited-service', 'full-service', 'fine-dining-service'],
        description: 'Service model affecting labor costs and customer experience'
      },
      {
        key: 'marketingStrategy',
        label: 'Marketing Focus',
        type: 'select',
        default: 'balanced',
        options: ['digital-only', 'traditional-local', 'balanced', 'premium-brand'],
        description: 'Marketing strategy affecting customer acquisition costs and brand positioning'
      }
    ]

    return this.addARRParameters(baseParameters)
  }

  defineOutputs(): OutputDefinition[] {
    return [
      {
        key: 'monthlyRevenue',
        label: 'Monthly Revenue ($)',
        description: 'Gross monthly revenue from all sources'
      },
      {
        key: 'monthlyNetProfit',
        label: 'Monthly Net Profit ($)',
        description: 'Monthly profit after all operating expenses'
      },
      {
        key: 'breakEvenMonths',
        label: 'Break-even Timeline (months)',
        description: 'Time to recover initial investment'
      },
      {
        key: 'annualROI',
        label: 'First Year ROI (%)',
        description: 'Return on investment for year one operations'
      },
      {
        key: 'revenuePerSeat',
        label: 'Revenue per Seat/Month ($)',
        description: 'Monthly revenue efficiency per available seat'
      },
      {
        key: 'foodCostPercent',
        label: 'Food Cost (% of Revenue)',
        description: 'Food and beverage costs as percentage of revenue'
      },
      {
        key: 'laborCostPercent',
        label: 'Labor Cost (% of Revenue)',
        description: 'Total labor costs as percentage of revenue'
      },
      {
        key: 'customerAcquisitionCost',
        label: 'Customer Acquisition Cost ($)',
        description: 'Marketing cost per new customer acquired'
      }
    ]
  }

  defineParameterGroups(): ParameterGroup[] {
    return [
      {
        name: 'Investment & Scale',
        description: 'ARR-based investment planning and restaurant size',
        parameters: ['annualRecurringRevenue', 'budgetPercent', 'seatingCapacity']
      },
      {
        name: 'Business Model',
        description: 'Restaurant positioning, service model, and pricing strategy',
        parameters: ['averageTicket', 'cuisineType', 'staffingModel']
      },
      {
        name: 'Market Position',
        description: 'Location strategy and marketing approach',
        parameters: ['locationTier', 'marketingStrategy']
      }
    ]
  }

  calculateScenario(params: ParameterValues): ScenarioResults {
    // ARR-based investment calculation
    const totalInvestmentBudget = this.calculateARRBudget(
      params.annualRecurringRevenue as number,
      params.budgetPercent as number
    )
    const startupCosts = totalInvestmentBudget * 0.75  // 75% for startup
    const annualOperatingBudget = totalInvestmentBudget * 0.25  // 25% for annual operations
    const monthlyOperatingBudget = annualOperatingBudget / 12

    // Calculate location and cuisine impacts
    const locationFactors = this.getLocationFactors(params.locationTier as string)
    const cuisineFactors = this.getCuisineFactors(params.cuisineType as CuisineType)
    const staffingCosts = this.getStaffingCosts(params.staffingModel as StaffingModel)
    const marketingEfficiency = this.getMarketingEfficiency(params.marketingStrategy as MarketingStrategy)

    // Calculate base rent (8-12% of operating budget based on location)
    const rentPercent = 0.08 + (locationFactors.rentMultiplier - 0.6) * 0.04
    const monthlyRent = monthlyOperatingBudget * rentPercent

    // Calculate staffing
    const seatingCapacity = params.seatingCapacity as number
    const totalStaff = Math.ceil(seatingCapacity * staffingCosts.staffPerSeat)
    const monthlyLaborCosts = totalStaff * staffingCosts.hourlyWage * 40 * 4.33

    // Revenue modeling with seasonal and operational variation
    const seasonalVariation = this.applySeasonalVariation(1.0, 15)  // 15% seasonal variation
    const baseUtilization = 0.45 + this.random() * 0.25  // 45-70% seat utilization
    const actualTurnover = cuisineFactors.turnover * (0.85 + this.random() * 0.30) * seasonalVariation

    // Daily customer calculation
    const dailyCapacity = seatingCapacity * baseUtilization * locationFactors.traffic * actualTurnover
    const averageTicket = params.averageTicket as number
    const actualTicket = averageTicket * cuisineFactors.ticketVariation * locationFactors.customerQuality * (0.90 + this.random() * 0.20)

    // Monthly revenue
    const monthlyRevenue = dailyCapacity * actualTicket * 30

    // Operating costs calculation
    const targetFoodCostPercent = 0.29 + this.random() * 0.08  // 29-37% industry range
    const foodCosts = monthlyRevenue * targetFoodCostPercent

    // Marketing spend based on strategy and revenue
    const marketingBudget = monthlyOperatingBudget * 0.15  // 15% of operating budget
    const customerReachCost = marketingEfficiency.costPer1000Reach
    const customersReached = (marketingBudget / customerReachCost) * 1000
    const newCustomersAcquired = customersReached * marketingEfficiency.conversionRate
    const customerAcquisitionCost = newCustomersAcquired > 0 ? marketingBudget / newCustomersAcquired : 0

    // Additional operating expenses
    const utilitiesAndInsurance = 4200 + this.random() * 2000
    const maintenanceRepairs = monthlyRevenue * 0.02  // 2% of revenue
    const administrativeExpenses = 2800 + this.random() * 1200

    const totalMonthlyOperatingCosts = monthlyRent + monthlyLaborCosts + foodCosts + 
                                     marketingBudget + utilitiesAndInsurance + 
                                     maintenanceRepairs + administrativeExpenses

    // Profitability calculations
    const monthlyNetProfit = monthlyRevenue - totalMonthlyOperatingCosts
    const breakEvenMonths = monthlyNetProfit > 0 ? startupCosts / monthlyNetProfit : 999
    const annualNetProfit = monthlyNetProfit * 12
    const annualROI = startupCosts > 0 ? (annualNetProfit / startupCosts) * 100 : 0

    // Restaurant-specific KPIs
    const restaurantKPIs = this.generateRestaurantKPIs(
      monthlyRevenue,
      totalMonthlyOperatingCosts,
      startupCosts,
      seatingCapacity,
      foodCosts,
      monthlyLaborCosts,
      actualTurnover,
      customerAcquisitionCost
    )

    return {
      monthlyRevenue: this.round(monthlyRevenue),
      monthlyNetProfit: this.round(monthlyNetProfit),
      breakEvenMonths: this.round(Math.min(breakEvenMonths, 999), 1),
      annualROI: this.round(annualROI, 1),
      revenuePerSeat: this.round(restaurantKPIs.revenuePerSeat),
      foodCostPercent: this.round(restaurantKPIs.foodCostPercent, 1),
      laborCostPercent: this.round(restaurantKPIs.laborCostPercent, 1),
      customerAcquisitionCost: this.round(restaurantKPIs.customerAcquisitionCost, 2)
    }
  }

  // Restaurant-specific business logic (eliminating duplication)
  
  private getLocationFactors(locationTier: string): LocationFactors {
    const factors: Record<string, LocationFactors> = {
      'neighborhood': { traffic: 0.7, rentMultiplier: 0.6, customerQuality: 0.8 },
      'strip-mall': { traffic: 0.8, rentMultiplier: 0.7, customerQuality: 0.9 },
      'downtown': { traffic: 1.1, rentMultiplier: 1.3, customerQuality: 1.0 },
      'prime-suburban': { traffic: 1.0, rentMultiplier: 1.0, customerQuality: 1.1 },
      'tourist-district': { traffic: 1.4, rentMultiplier: 1.8, customerQuality: 0.9 }
    }
    return factors[locationTier] || factors['prime-suburban']
  }

  private getCuisineFactors(cuisineType: CuisineType): CuisineFactors {
    const factors: Record<CuisineType, CuisineFactors> = {
      'quick-service': { turnover: 4.0, ticketVariation: 0.7, laborIntensity: 0.6 },
      'fast-casual': { turnover: 3.5, ticketVariation: 0.8, laborIntensity: 0.7 },
      'casual-dining': { turnover: 2.5, ticketVariation: 1.0, laborIntensity: 1.0 },
      'fine-dining': { turnover: 1.8, ticketVariation: 1.4, laborIntensity: 1.3 },
      'ethnic-specialty': { turnover: 2.2, ticketVariation: 1.1, laborIntensity: 1.1 }
    }
    return factors[cuisineType] || factors['casual-dining']
  }

  private getStaffingCosts(staffingModel: StaffingModel): { hourlyWage: number; staffPerSeat: number } {
    const costs: Record<StaffingModel, { hourlyWage: number; staffPerSeat: number }> = {
      'counter-service': { hourlyWage: 16.50, staffPerSeat: 0.08 },
      'limited-service': { hourlyWage: 18.00, staffPerSeat: 0.10 },
      'full-service': { hourlyWage: 22.50, staffPerSeat: 0.15 },
      'fine-dining-service': { hourlyWage: 28.00, staffPerSeat: 0.20 }
    }
    return costs[staffingModel] || costs['full-service']
  }

  private getMarketingEfficiency(strategy: MarketingStrategy): { costPer1000Reach: number; conversionRate: number } {
    const efficiency: Record<MarketingStrategy, { costPer1000Reach: number; conversionRate: number }> = {
      'digital-only': { costPer1000Reach: 8.0, conversionRate: 0.012 },
      'traditional-local': { costPer1000Reach: 15.0, conversionRate: 0.018 },
      'balanced': { costPer1000Reach: 12.0, conversionRate: 0.015 },
      'premium-brand': { costPer1000Reach: 25.0, conversionRate: 0.008 }
    }
    return efficiency[strategy] || efficiency['balanced']
  }

  private generateRestaurantKPIs(
    monthlyRevenue: number,
    monthlyOperatingCosts: number,
    startupCosts: number,
    seatingCapacity: number,
    foodCosts: number,
    laborCosts: number,
    tableTurns: number,
    customerAcquisitionCost: number
  ): RestaurantKPIs {
    const baseKPIs = this.generateBusinessKPIs(
      monthlyRevenue * 12, // Annual revenue
      monthlyOperatingCosts * 12, // Annual costs
      startupCosts
    )

    return {
      ...baseKPIs,
      revenuePerSeat: seatingCapacity > 0 ? monthlyRevenue / seatingCapacity : 0,
      foodCostPercent: monthlyRevenue > 0 ? (foodCosts / monthlyRevenue) * 100 : 0,
      laborCostPercent: monthlyRevenue > 0 ? (laborCosts / monthlyRevenue) * 100 : 0,
      customerAcquisitionCost,
      averageTableTurns: tableTurns
    }
  }
}