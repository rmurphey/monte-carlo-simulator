import { MonteCarloEngine } from '../framework/MonteCarloEngine'
import { ParameterDefinition, SimulationMetadata } from '../framework/types'

export class AIInvestmentROI extends MonteCarloEngine {
  getMetadata(): SimulationMetadata {
    return {
      id: 'ai-investment-roi',
      name: 'AI Investment ROI',
      description: 'Simulate return on investment for AI tool implementations with uncertainty modeling',
      category: 'Finance',
      version: '2.0.0'
    }
  }

  getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        key: 'initialInvestment',
        label: 'Initial Investment ($)',
        type: 'number',
        default: 100000,
        min: 10000,
        max: 10000000,
        step: 10000,
        description: 'Total upfront investment in AI tools and implementation'
      },
      {
        key: 'implementationTime',
        label: 'Implementation Time (months)',
        type: 'number',
        default: 6,
        min: 1,
        max: 24,
        step: 1,
        description: 'Expected time to fully implement the AI solution'
      },
      {
        key: 'productivityGain',
        label: 'Productivity Gain (%)',
        type: 'number',
        default: 0.15,
        min: 0,
        max: 1,
        step: 0.01,
        description: 'Expected productivity increase as a decimal (0.15 = 15%)'
      },
      {
        key: 'costSaving',
        label: 'Cost Saving (%)',
        type: 'number',
        default: 0.08,
        min: 0,
        max: 0.5,
        step: 0.01,
        description: 'Expected cost reduction as a decimal (0.08 = 8%)'
      },
      {
        key: 'marketGrowth',
        label: 'Market Growth Rate (%)',
        type: 'number',
        default: 0.12,
        min: -0.1,
        max: 0.5,
        step: 0.01,
        description: 'Annual market growth rate'
      },
      {
        key: 'adoptionRate',
        label: 'Employee Adoption Rate (%)',
        type: 'number',
        default: 0.7,
        min: 0.1,
        max: 1,
        step: 0.05,
        description: 'Expected employee adoption rate (0.7 = 70%)'
      },
      {
        key: 'maintenanceCost',
        label: 'Annual Maintenance Cost (%)',
        type: 'number',
        default: 0.1,
        min: 0.05,
        max: 0.3,
        step: 0.01,
        description: 'Annual maintenance as % of initial investment'
      },
      {
        key: 'riskFactor',
        label: 'Risk/Uncertainty Factor',
        type: 'number',
        default: 0.2,
        min: 0.05,
        max: 0.5,
        step: 0.05,
        description: 'Overall uncertainty factor for parameter variation'
      },
      {
        key: 'evaluationPeriod',
        label: 'Evaluation Period (years)',
        type: 'number',
        default: 5,
        min: 1,
        max: 10,
        step: 1,
        description: 'Time period for ROI calculation'
      }
    ]
  }

  simulateScenario(parameters: Record<string, unknown>): Record<string, number> {
    const p = parameters as {
      initialInvestment: number
      implementationTime: number
      productivityGain: number
      costSaving: number
      marketGrowth: number
      adoptionRate: number
      maintenanceCost: number
      riskFactor: number
      evaluationPeriod: number
    }

    // Randomize key parameters with uncertainty
    const actualProductivityGain = this.randomize(p.productivityGain, p.riskFactor)
    const actualCostSaving = this.randomize(p.costSaving, p.riskFactor)
    const actualAdoptionRate = Math.min(1, Math.max(0.1, this.randomize(p.adoptionRate, 0.3)))
    const actualImplementationTime = Math.max(1, this.randomize(p.implementationTime, 0.4))
    const actualMarketGrowth = this.randomize(p.marketGrowth, p.riskFactor * 0.5)

    // Calculate annual benefits
    const baseAnnualProductivityBenefit = p.initialInvestment * actualProductivityGain * actualAdoptionRate
    const baseAnnualCostSaving = p.initialInvestment * actualCostSaving * actualAdoptionRate

    // Account for implementation delay
    const delayPenalty = Math.max(0, (actualImplementationTime - p.implementationTime) / 12)
    const delayMultiplier = 1 - (delayPenalty * 0.1)

    // Calculate present value of benefits over evaluation period
    let totalPresentValue = 0
    let cumulativeBenefit = 0
    let paybackPeriod = p.evaluationPeriod + 1 // Default to beyond evaluation period

    for (let year = 1; year <= p.evaluationPeriod; year++) {
      // Benefits grow with market growth and improve over time as adoption matures
      const maturityFactor = Math.min(1, year / 2) // Full maturity by year 2
      const growthFactor = Math.pow(1 + actualMarketGrowth, year - 1)
      
      const annualProductivityBenefit = baseAnnualProductivityBenefit * delayMultiplier * maturityFactor * growthFactor
      const annualCostSaving = baseAnnualCostSaving * delayMultiplier * maturityFactor * growthFactor
      const annualMaintenance = p.initialInvestment * p.maintenanceCost * Math.pow(1.03, year - 1) // 3% inflation
      
      const netAnnualBenefit = annualProductivityBenefit + annualCostSaving - annualMaintenance
      
      // Discount to present value (assume 8% discount rate)
      const discountRate = 0.08
      const presentValue = netAnnualBenefit / Math.pow(1 + discountRate, year)
      totalPresentValue += presentValue
      
      // Track cumulative benefit for payback calculation
      cumulativeBenefit += netAnnualBenefit
      if (paybackPeriod > p.evaluationPeriod && cumulativeBenefit >= p.initialInvestment) {
        paybackPeriod = year + (p.initialInvestment - (cumulativeBenefit - netAnnualBenefit)) / netAnnualBenefit
      }
    }

    // Calculate final metrics
    const netPresentValue = totalPresentValue - p.initialInvestment
    const roi = netPresentValue / p.initialInvestment
    const totalBenefit = totalPresentValue
    const breakEven = netPresentValue >= 0

    return {
      roi,
      netPresentValue,
      totalBenefit,
      paybackPeriod: Math.min(paybackPeriod, 20), // Cap at 20 years
      actualAdoptionRate,
      actualImplementationTime,
      breakEven: breakEven ? 1 : 0,
      riskAdjustedROI: roi * (1 - p.riskFactor * 0.1) // Risk adjustment
    }
  }

  private randomize(baseValue: number, uncertainty = 0.2): number {
    const min = baseValue * (1 - uncertainty)
    const max = baseValue * (1 + uncertainty)
    return min + Math.random() * (max - min)
  }

  setupParameterGroups(): void {
    const schema = this.getParameterSchema()
    
    schema.addGroup({
      name: 'Investment Parameters',
      description: 'Core investment and implementation details',
      parameters: ['initialInvestment', 'implementationTime', 'evaluationPeriod']
    })

    schema.addGroup({
      name: 'Expected Benefits',
      description: 'Projected productivity and cost benefits',
      parameters: ['productivityGain', 'costSaving', 'marketGrowth']
    })

    schema.addGroup({
      name: 'Adoption & Risk',
      description: 'Human factors and risk considerations',
      parameters: ['adoptionRate', 'maintenanceCost', 'riskFactor']
    })
  }
}