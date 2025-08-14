import { StatisticalSummary } from '../../framework/types'
import { SimulationConfig } from '../config/schema'
import { handleFallback, logWarning } from '../../utils/error-handling'

interface DocumentOptions {
  includeCharts?: boolean
  includeRawData?: boolean
  includeRecommendations?: boolean
  title?: string
}

// Interface for the results structure as actually used in the CLI
// The framework types are too permissive - this reflects the runtime reality
interface CLISimulationResults {
  results: Array<Record<string, number | boolean | string>>  // Individual iteration results
  summary: Record<string, StatisticalSummary>                // Computed statistics (always numeric)
}

export class DocumentGenerator {
  generateAnalysisDocument(
    results: CLISimulationResults, 
    config: SimulationConfig,
    parameters: Record<string, any>,
    options: DocumentOptions = {}
  ): string {
    const {
      includeCharts = true,
      includeRawData = false,
      includeRecommendations = true,
      title
    } = options

    const doc = []
    
    // Header
    doc.push('═'.repeat(80))
    doc.push(`📊 MONTE CARLO SIMULATION ANALYSIS REPORT`)
    doc.push('═'.repeat(80))
    doc.push('')
    
    // Title and metadata
    doc.push(`🎯 **${title || config.name}**`)
    doc.push(`📋 ${config.description}`)
    doc.push(`🏷️  Category: ${config.category}`)
    doc.push(`🔖 Tags: ${config.tags?.join(', ') || 'None'}`)
    doc.push(`📅 Generated: ${new Date().toLocaleString()}`)
    doc.push(`🎲 Iterations: ${results.results.length.toLocaleString()}`)
    doc.push('')

    // Business Question and Model Overview
    doc.push('📋 BUSINESS QUESTION & MODEL OVERVIEW')
    doc.push('─'.repeat(50))
    doc.push(this.generateBusinessQuestion(config, parameters))
    doc.push('')
    doc.push(this.generateModelDiscussion(config, parameters, results))
    doc.push('')

    // Executive Summary
    doc.push('📈 EXECUTIVE SUMMARY')
    doc.push('─'.repeat(50))
    
    const summary = results.summary
    const sortedOutputs = Object.entries(summary).sort((a, b) => {
      // Prioritize common business metrics
      const priorities: Record<string, number> = {
        roi: 10, netBenefit: 9, totalSavings: 8, annualSavings: 8,
        cost: 7, annualCost: 7, benefit: 6, revenue: 6
      }
      const aPriority = priorities[a[0].toLowerCase()] || 0
      const bPriority = priorities[b[0].toLowerCase()] || 0
      return bPriority - aPriority
    })

    for (const [key, stats] of sortedOutputs) {
      const outputConfig = config.outputs?.find(o => o.key === key)
      const label = outputConfig?.label || this.formatKey(key)
      const description = outputConfig?.description || ''
      
      doc.push(`• ${label}: ${this.formatValue(stats.mean)} ± ${this.formatValue(stats.standardDeviation)}`)
      if (description) {
        doc.push(`  ${description}`)
      }
    }
    doc.push('')

    // Key Insights
    doc.push('💡 KEY INSIGHTS')
    doc.push('─'.repeat(50))
    doc.push(...this.generateKeyInsights(results, config, parameters))
    doc.push('')

    // Parameter Configuration
    doc.push('⚙️ SIMULATION PARAMETERS')
    doc.push('─'.repeat(50))
    
    for (const [key, value] of Object.entries(parameters)) {
      const paramConfig = config.parameters.find(p => p.key === key)
      const label = paramConfig?.label || this.formatKey(key)
      const formattedValue = this.formatParameterValue(value, paramConfig?.type)
      doc.push(`• ${label}: ${formattedValue}`)
    }
    doc.push('')

    // Statistical Analysis
    doc.push('📊 DETAILED STATISTICAL ANALYSIS')
    doc.push('─'.repeat(50))
    
    for (const [key, stats] of Object.entries(summary)) {
      const outputConfig = config.outputs?.find(o => o.key === key)
      const label = outputConfig?.label || this.formatKey(key)
      
      doc.push(`${label}:`)
      doc.push(`  Mean: ${this.formatValue(stats.mean)}`)
      doc.push(`  Standard Deviation: ${this.formatValue(stats.standardDeviation)}`)
      doc.push(`  Range: ${this.formatValue(stats.min)} to ${this.formatValue(stats.max)}`)
      doc.push(`  Confidence Intervals:`)
      doc.push(`    10th percentile: ${this.formatValue(stats.percentile10)}`)
      doc.push(`    50th percentile: ${this.formatValue(stats.median)} (median)`)
      doc.push(`    90th percentile: ${this.formatValue(stats.percentile90)}`)
      doc.push('')
    }

    // Text-based visualizations
    if (includeCharts) {
      doc.push('📈 DISTRIBUTION VISUALIZATIONS')
      doc.push('─'.repeat(50))
      
      for (const [key, stats] of Object.entries(summary)) {
        const outputConfig = config.outputs?.find(o => o.key === key)
        const label = outputConfig?.label || this.formatKey(key)
        
        doc.push(`${label} Distribution:`)
        const numericValues = results.results
          .map(r => r[key])
          .filter((v): v is number => typeof v === 'number')
        if (numericValues.length > 0) {
          doc.push(this.generateHistogram(numericValues))
        } else {
          doc.push('No numeric data available for histogram')
        }
        doc.push('')
        
        doc.push(`${label} Confidence Intervals:`)
        doc.push(this.generateConfidenceChart(stats))
        doc.push('')
      }
    }

    // Risk Analysis
    doc.push('⚠️ RISK ANALYSIS')
    doc.push('─'.repeat(50))
    doc.push(...this.generateRiskAnalysis(results, config))
    doc.push('')

    // Recommendations
    if (includeRecommendations) {
      doc.push('🎯 STRATEGIC RECOMMENDATIONS')
      doc.push('─'.repeat(50))
      doc.push(...this.generateRecommendations(results, config, parameters))
      doc.push('')
    }

    // Raw data appendix
    if (includeRawData) {
      doc.push('📋 RAW DATA APPENDIX')
      doc.push('─'.repeat(50))
      doc.push('First 10 simulation results:')
      doc.push('')
      
      const headers = Object.keys(results.results[0] || {})
      doc.push('| ' + headers.map(h => h.padEnd(12)).join(' | ') + ' |')
      doc.push('|' + headers.map(() => '-'.repeat(14)).join('|') + '|')
      
      for (let i = 0; i < Math.min(10, results.results.length); i++) {
        const row = results.results[i]
        doc.push('| ' + headers.map(h => {
          const value = row[h]
          const formatted = typeof value === 'number' ? this.formatValue(value) : String(value)
          return formatted.padEnd(12)
        }).join(' | ') + ' |')
      }
      doc.push('')
      doc.push(`... and ${results.results.length - 10} more results`)
      doc.push('')
    }

    // Footer
    doc.push('═'.repeat(80))
    doc.push('Generated by Monte Carlo Business Decision Framework')
    doc.push(`📊 Framework: Examples-First Monte Carlo Simulation`)
    doc.push(`🔗 GitHub: https://github.com/rmurphey/monte-carlo-simulator`)
    doc.push('═'.repeat(80))

    return doc.join('\n')
  }

  private generateModelDiscussion(config: SimulationConfig, parameters: Record<string, any>, results: CLISimulationResults): string {
    // Try explicit config first if available
    if ((config as any).modelOverview) {
      return (config as any).modelOverview
    }
    
    const discussion = []
    const name = config.name.toLowerCase()
    const summary = results.summary
    
    // Try pattern-based discussion
    const patternDiscussion = this.generateModelDiscussionByPattern(name, summary, parameters)
    if (patternDiscussion.length > 0) {
      discussion.push(...patternDiscussion)
    } else {
      // Enhanced fallback using metric analysis
      discussion.push(...this.generateModelDiscussionFromMetrics(config, summary, results))
    }
    
    // Add key modeling insights
    const keyOutputs = Object.keys(summary).length
    const iterations = results.results.length
    discussion.push(``)
    discussion.push(`The simulation ran ${iterations.toLocaleString()} iterations across ${keyOutputs} key metrics, capturing the inherent uncertainty in business decisions. This probabilistic approach reveals not just what might happen on average, but the full range of possible outcomes and their likelihood.`)
    
    return discussion.join('\n')
  }

  private generateModelDiscussionByPattern(name: string, summary: Record<string, StatisticalSummary>, parameters: Record<string, any>): string[] {
    const discussion = []
    
    // Model overview based on simulation type
    if (name.includes('roi') || name.includes('investment')) {
      discussion.push('**What this model shows:**')
      discussion.push('This Monte Carlo simulation models the financial return on investment by running thousands of scenarios with varying assumptions. The model accounts for uncertainty in key variables like costs, benefits, and market conditions to provide a realistic range of possible outcomes rather than a single point estimate.')
      
      // Find ROI metric with flexible naming using regex patterns
      const roiStats = this.findMetricByPattern(summary, /roi|return/i)
      if (roiStats) {
        const confidence = Math.abs((roiStats.percentile90 - roiStats.percentile10) / roiStats.mean * 100).toFixed(0)
        discussion.push(``)
        discussion.push(`The analysis shows an expected ROI of ${this.formatValue(roiStats.mean)}%, but with significant variability (${confidence}% confidence range). This uncertainty reflects real-world conditions where actual results can vary substantially from initial projections.`)
      }
      
      // Add payback period insight if available
      const paybackStats = this.findMetricByPattern(summary, /payback.*period/i)
      if (paybackStats) {
        discussion.push(`The payback period averages ${this.formatValue(paybackStats.mean)} months, with outcomes ranging from ${this.formatValue(paybackStats.percentile10)} to ${this.formatValue(paybackStats.percentile90)} months in 80% of scenarios.`)
      }
    } else if (name.includes('qa') || name.includes('quality') || name.includes('testing')) {
      discussion.push('**What this model shows:**')
      discussion.push('This simulation models the economic impact of quality assurance by comparing the costs of QA activities against the value of prevented defects. It accounts for variability in bug rates, fix costs, customer impact, and testing effectiveness to provide a comprehensive cost-benefit analysis.')
      
      const bugsPreventedStats = this.findMetricByPattern(summary, /bugs.*prevented/i)
      const totalSavingsStats = this.findMetricByPattern(summary, /total.*savings/i) || this.findMetricByPattern(summary, /savings/i)
      if (bugsPreventedStats && totalSavingsStats) {
        const avgBugsPerRelease = (bugsPreventedStats.mean / (parameters.releasesPerYear || 12)).toFixed(1)
        discussion.push(``)
        discussion.push(`The model shows QA preventing approximately ${this.formatValue(bugsPreventedStats.mean)} bugs annually (${avgBugsPerRelease} per release), generating ${this.formatValue(totalSavingsStats.mean)} in total value. The wide range in outcomes reflects the unpredictable nature of software defects and their varying business impact.`)
      }
    } else if (name.includes('team') || name.includes('scaling') || name.includes('hiring')) {
      discussion.push('**What this model shows:**')
      discussion.push('This model evaluates team scaling decisions by comparing the costs of additional personnel against productivity gains. It factors in hiring costs, onboarding time, coordination overhead, and the diminishing returns that often occur with larger teams.')
    } else if (name.includes('technology') || name.includes('tool')) {
      discussion.push('**What this model shows:**')
      discussion.push('This analysis models technology investment returns by comparing tool costs against productivity improvements. The simulation accounts for adoption curves, training time, maintenance costs, and the varying impact of tools across different team members and use cases.')
    }
    
    return discussion
  }

  private generateModelDiscussionFromMetrics(_config: SimulationConfig, summary: Record<string, StatisticalSummary>, _results: CLISimulationResults): string[] {
    const discussion = []
    const metricCategories = this.categorizeMetrics(summary)
    
    discussion.push('**What this model shows:**')
    
    // Build description based on available metrics
    if (metricCategories.financial.length > 0) {
      const hasROI = metricCategories.roi.length > 0
      const hasCosts = metricCategories.cost.length > 0
      const hasBenefits = metricCategories.benefit.length > 0
      
      if (hasROI) {
        discussion.push('This Monte Carlo simulation evaluates the financial returns and risks of your business decision by running thousands of scenarios with varying assumptions.')
      } else if (hasCosts && hasBenefits) {
        discussion.push('This analysis compares the costs against benefits across multiple scenarios to provide a comprehensive cost-benefit assessment with uncertainty modeling.')
      } else if (hasCosts) {
        discussion.push('This simulation models cost implications across different scenarios to help understand the financial requirements and risks.')
      } else {
        discussion.push('This financial analysis models the monetary implications of your decision across multiple scenarios.')
      }
    } else if (metricCategories.time.length > 0) {
      discussion.push('This simulation models time-based outcomes to help understand project timelines and duration risks.')
    } else {
      discussion.push('This Monte Carlo simulation models the range of possible outcomes for your decision by running thousands of scenarios with different assumptions.')
    }
    
    // Add specific insights from top metrics
    const sortedMetrics = Object.entries(summary).sort((a, b) => {
      // Prioritize important business metrics
      const importance = (key: string) => {
        if (key.match(/roi|return/i)) return 10
        if (key.match(/benefit|saving/i)) return 8
        if (key.match(/cost|expense/i)) return 7
        if (key.match(/revenue|income/i)) return 6
        return 1
      }
      return importance(b[0]) - importance(a[0])
    }).slice(0, 2) // Top 2 metrics
    
    if (sortedMetrics.length > 0) {
      discussion.push('')
      const [topMetricKey, topMetricStats] = sortedMetrics[0]
      const metricLabel = this.formatKey(topMetricKey)
      const variance = (topMetricStats.standardDeviation / Math.abs(topMetricStats.mean)) * 100
      
      if (variance > 50) {
        discussion.push(`The analysis shows ${metricLabel} averaging ${this.formatValue(topMetricStats.mean)}, but with high variability (${variance.toFixed(0)}% coefficient of variation). This uncertainty highlights the importance of considering multiple scenarios rather than relying on single estimates.`)
      } else {
        discussion.push(`The analysis shows ${metricLabel} averaging ${this.formatValue(topMetricStats.mean)} with moderate uncertainty, ranging from ${this.formatValue(topMetricStats.percentile10)} to ${this.formatValue(topMetricStats.percentile90)} in 80% of scenarios.`)
      }
    }
    
    return discussion
  }

  private generateBusinessQuestion(config: SimulationConfig, parameters: Record<string, any>): string {
    // Try explicit config first if available
    if ((config as any).businessQuestion) {
      return `**"${(config as any).businessQuestion}"**\n\nThis analysis helps evaluate the decision with Monte Carlo risk modeling.`
    }
    
    // Generate plain-language business question based on simulation type and parameters
    const name = config.name.toLowerCase()
    const category = config.category?.toLowerCase() || ''
    
    // Try pattern-based detection (existing logic)
    const patternResult = this.generateBusinessQuestionByPattern(name, category, parameters)
    if (patternResult) return patternResult
    
    // Enhanced fallback using simulation context
    return this.generateBusinessQuestionFromContext(config, parameters)
  }

  private generateBusinessQuestionByPattern(name: string, category: string, parameters: Record<string, any>): string | null {
    // ROI and Investment simulations
    if (name.includes('roi') || name.includes('investment')) {
      const investment = parameters.initialInvestment || parameters.investment || parameters.toolCost || 'investment'
      const benefit = parameters.monthlyBenefit || parameters.annualBenefit || parameters.annualSavings || 'expected returns'
      
      if (typeof investment === 'number' && typeof benefit === 'number') {
        const monthlyBenefit = typeof parameters.monthlyBenefit === 'number' ? parameters.monthlyBenefit : benefit
        return `**"Should I invest $${this.formatValue(investment)} expecting $${this.formatValue(monthlyBenefit)} monthly returns, and what are the risks?"**\n\nThis analysis helps determine if the investment will be profitable, how long it will take to pay back, and what could go wrong.`
      } else {
        return `**"Is this investment financially worthwhile, and what are the risks?"**\n\nThis analysis evaluates the expected return on investment while accounting for uncertainty and potential downsides.`
      }
    }
    
    // QA and Testing simulations
    if (name.includes('qa') || name.includes('quality') || name.includes('testing')) {
      if (parameters.qaStrategy) {
        const strategy = parameters.qaStrategy
        const teamSize = parameters.teamSize || 'team'
        return `**"Should we use ${strategy} testing for our ${teamSize}-person development team, and what will it cost vs. the benefits?"**\n\nThis analysis compares testing strategies to find the optimal balance of quality, speed, and cost.`
      } else {
        return `**"Is manual quality assurance worth the cost for our development team?"**\n\nThis analysis weighs QA staffing costs against the value of preventing bugs and improving software quality.`
      }
    }
    
    // Technology and tools
    if (name.includes('technology') || name.includes('tool')) {
      const team = parameters.teamSize || 'team'
      return `**"Should we invest in this technology for our ${team}-person team, and will the productivity gains justify the cost?"**\n\nThis analysis evaluates whether technology investments will deliver sufficient productivity improvements to cover their costs.`
    }
    
    // Marketing simulations
    if (category.includes('marketing') || name.includes('marketing') || name.includes('campaign')) {
      return `**"Will this marketing campaign generate positive ROI, and what are the chances of success?"**\n\nThis analysis models marketing spend effectiveness while accounting for market uncertainty and campaign performance variability.`
    }
    
    // Team scaling
    if (name.includes('team') || name.includes('scaling') || name.includes('hiring')) {
      return `**"Should we hire more people for our team, and will increased productivity offset the additional costs?"**\n\nThis analysis weighs hiring costs against productivity gains while considering coordination overhead and onboarding time.`
    }
    
    return null // No pattern match
  }

  private generateBusinessQuestionFromContext(config: SimulationConfig, parameters: Record<string, any>): string {
    // Dynamic question generation from config and parameters
    const description = config.description || ''
    const name = config.name
    
    // Extract key parameter types to infer business context
    const paramTypes = this.analyzeParameterTypes(parameters)
    const hasFinancialParams = paramTypes.financial.length > 0
    const hasTimeParams = paramTypes.time.length > 0
    const hasTeamParams = paramTypes.team.length > 0
    
    let question = ''
    let context = ''
    
    // Build question from parameter analysis
    if (hasFinancialParams && hasTimeParams) {
      const costParam = paramTypes.financial[0]
      question = `Should we proceed with this ${costParam.key.toLowerCase().includes('invest') ? 'investment' : 'initiative'} and what are the financial and timing implications?`
      context = `This analysis evaluates the financial returns and timeline considerations for your business decision.`
    } else if (hasFinancialParams) {
      const financialParam = paramTypes.financial[0]
      const amount = this.formatValue(financialParam.value)
      question = `Is this $${amount} business decision financially worthwhile, and what are the risks?`
      context = `This analysis evaluates whether the financial investment will deliver sufficient returns to justify the cost and risk.`
    } else if (hasTeamParams) {
      const teamParam = paramTypes.team[0]
      question = `How will this decision impact our team of ${teamParam.value} people, and what are the expected outcomes?`
      context = `This analysis models the impact on team productivity and effectiveness.`
    } else if (description.length > 20) {
      // Extract intent from description
      const descLower = description.toLowerCase()
      if (descLower.includes('cost') || descLower.includes('benefit') || descLower.includes('value')) {
        question = `What are the cost-benefit implications of this decision?`
        context = `This analysis weighs the costs against benefits with uncertainty modeling.`
      } else if (descLower.includes('risk') || descLower.includes('uncertainty')) {
        question = `What are the risks and potential outcomes of this decision?`
        context = `This analysis models the range of possible outcomes and their likelihood.`
      } else {
        question = `What are the expected outcomes of ${description.toLowerCase()}?`
        context = `This Monte Carlo simulation explores different scenarios to understand possible results.`
      }
    } else {
      // Final fallback using simulation name
      question = `What are the expected outcomes of "${name}", and what factors affect the results?`
      context = `This analysis models uncertainty in key variables to show the range of possible outcomes rather than a single estimate.`
    }
    
    return `**"${question}"**\n\n${context}`
  }

  private analyzeParameterTypes(parameters: Record<string, any>): {
    financial: Array<{key: string, value: number}>
    time: Array<{key: string, value: number}>
    team: Array<{key: string, value: number}>
    other: Array<{key: string, value: any}>
  } {
    const result: {
      financial: Array<{key: string, value: number}>
      time: Array<{key: string, value: number}>
      team: Array<{key: string, value: number}>
      other: Array<{key: string, value: any}>
    } = { financial: [], time: [], team: [], other: [] }
    
    for (const [key, value] of Object.entries(parameters)) {
      const keyLower = key.toLowerCase()
      
      // Financial parameters
      if (keyLower.includes('cost') || keyLower.includes('investment') || keyLower.includes('price') || 
          keyLower.includes('budget') || keyLower.includes('salary') || keyLower.includes('revenue') ||
          keyLower.includes('benefit') || keyLower.includes('saving') || keyLower.includes('fee') ||
          keyLower.includes('amount') || keyLower.includes('value') && typeof value === 'number') {
        result.financial.push({key, value: value as number})
      }
      // Time parameters  
      else if (keyLower.includes('time') || keyLower.includes('period') || keyLower.includes('month') ||
               keyLower.includes('year') || keyLower.includes('duration') || keyLower.includes('frequency') ||
               keyLower.includes('deadline') && typeof value === 'number') {
        result.time.push({key, value: value as number})
      }
      // Team parameters
      else if (keyLower.includes('team') || keyLower.includes('person') || keyLower.includes('people') ||
               keyLower.includes('staff') || keyLower.includes('developer') || keyLower.includes('employee') ||
               keyLower.includes('size') && typeof value === 'number') {
        result.team.push({key, value: value as number})  
      }
      // Everything else
      else {
        result.other.push({key, value})
      }
    }
    
    return result
  }

  private generateHistogram(values: number[]): string {
    if (!values.length) return 'No data available'
    
    const sortedValues = [...values].sort((a, b) => a - b)
    const min = sortedValues[0]
    const max = sortedValues[sortedValues.length - 1]
    const range = max - min
    
    if (range === 0) return `All values: ${this.formatValue(min)}`
    
    // Create 20 buckets
    const buckets = new Array(20).fill(0)
    const bucketSize = range / 20
    
    for (const value of values) {
      const bucketIndex = Math.min(19, Math.floor((value - min) / bucketSize))
      buckets[bucketIndex]++
    }
    
    const maxCount = Math.max(...buckets)
    const chart = []
    
    // Create histogram bars
    for (let i = 0; i < buckets.length; i++) {
      const bucketMin = min + (i * bucketSize)
      // const bucketMax = min + ((i + 1) * bucketSize) // Unused for now
      const count = buckets[i]
      const barLength = Math.round((count / maxCount) * 40)
      const bar = '█'.repeat(barLength) + '░'.repeat(40 - barLength)
      
      chart.push(`${this.formatValue(bucketMin).padStart(10)} │${bar}│ ${count}`)
    }
    
    return chart.join('\n')
  }

  private generateConfidenceChart(stats: StatisticalSummary): string {
    const chart = []
    const width = 60
    
    // Normalize values to chart width
    const range = stats.max - stats.min
    if (range === 0) return `Single value: ${this.formatValue(stats.mean)}`
    
    const normalize = (value: number) => Math.round(((value - stats.min) / range) * width)
    
    const p10Pos = normalize(stats.percentile10)
    const p50Pos = normalize(stats.median)
    const p90Pos = normalize(stats.percentile90)
    const meanPos = normalize(stats.mean)
    
    // Build confidence interval chart
    const line = new Array(width + 1).fill('─')
    line[p10Pos] = '├'
    line[p50Pos] = '┼'
    line[p90Pos] = '┤'
    line[meanPos] = '●'
    
    chart.push(`${this.formatValue(stats.min).padStart(10)} ${line.join('')} ${this.formatValue(stats.max)}`)
    chart.push(`${''.padStart(11)}├────── 80% confidence ──────┤`)
    chart.push(`${''.padStart(11)}P10: ${this.formatValue(stats.percentile10)} | P50: ${this.formatValue(stats.median)} | P90: ${this.formatValue(stats.percentile90)}`)
    chart.push(`${''.padStart(11)}Mean: ${this.formatValue(stats.mean)} ●`)
    
    return chart.join('\n')
  }

  private generateKeyInsights(results: CLISimulationResults, config: SimulationConfig, parameters: Record<string, any>): string[] {
    const insights = []
    const summary = results.summary
    
    // Guard against empty or invalid summary
    if (!summary || Object.keys(summary).length === 0) {
      insights.push(`📊 Analysis complete with ${results.results.length} iterations - see detailed results below`)
      return insights
    }
    
    try {
      // ROI insights with flexible metric discovery
      const roiStats = this.findMetricByPattern(summary, /roi|return/i)
      if (roiStats && typeof roiStats.mean === 'number' && !isNaN(roiStats.mean)) {
        if (roiStats.mean > 50) {
          insights.push(`🚀 Strong ROI: ${this.formatValue(roiStats.mean)}% average return significantly exceeds market benchmarks`)
        } else if (roiStats.mean > 15) {
          insights.push(`📈 Positive ROI: ${this.formatValue(roiStats.mean)}% average return shows good value`)
        } else if (roiStats.mean > 0) {
          insights.push(`📊 Marginal ROI: ${this.formatValue(roiStats.mean)}% average return requires careful consideration`)
        } else {
          insights.push(`⚠️ Negative ROI: ${this.formatValue(roiStats.mean)}% average indicates investment may not be worthwhile`)
        }
        
        if (typeof roiStats.standardDeviation === 'number' && !isNaN(roiStats.standardDeviation) && roiStats.mean !== 0) {
          const riskLevel = roiStats.standardDeviation / Math.abs(roiStats.mean)
          if (riskLevel > 1) {
            insights.push(`🎲 High uncertainty: ROI variance is ${(riskLevel * 100).toFixed(0)}% of mean - consider risk mitigation`)
          }
        }
      }

      // Cost vs benefit insights with error handling
      const metricCategories = this.categorizeMetrics(summary)
      const costMetrics = metricCategories.cost
      const benefitMetrics = metricCategories.benefit
      
      if (costMetrics.length > 0 && benefitMetrics.length > 0) {
        const totalCost = costMetrics.reduce((sum, key) => {
          const stats = summary[key]
          return sum + (stats && typeof stats.mean === 'number' && !isNaN(stats.mean) ? stats.mean : 0)
        }, 0)
        const totalBenefit = benefitMetrics.reduce((sum, key) => {
          const stats = summary[key]
          return sum + (stats && typeof stats.mean === 'number' && !isNaN(stats.mean) ? stats.mean : 0)
        }, 0)
        
        if (totalCost > 0 && totalBenefit > 0) {
          const ratio = totalBenefit / totalCost
          if (ratio > 3) {
            insights.push(`💰 Excellent value: Benefits exceed costs by ${ratio.toFixed(1)}x`)
          } else if (ratio > 1.5) {
            insights.push(`✅ Good value: Benefits exceed costs by ${ratio.toFixed(1)}x`)
          } else if (ratio > 1) {
            insights.push(`⚖️ Marginal value: Benefits slightly exceed costs (${ratio.toFixed(1)}x)`)
          }
        }
      }

      // Automation insights (for QA simulations) with safer parameter access
      if (config.name.toLowerCase().includes('qa') || config.name.toLowerCase().includes('quality')) {
        const qaStrategy = parameters?.qaStrategy
        if (qaStrategy === 'automated') {
          insights.push(`🤖 Automation advantage: Significantly faster test execution and better scalability`)
        } else if (qaStrategy === 'hybrid') {
          insights.push(`🎯 Balanced approach: Combines automation efficiency with human insight`)
        } else if (qaStrategy === 'manual') {
          insights.push(`👥 Manual testing: Better edge case detection but limited scalability`)
        }
      }

      // Add general insights if no specific patterns matched
      if (insights.length === 0) {
        const sortedMetrics = Object.entries(summary)
          .filter(([_, stats]) => stats && typeof stats.mean === 'number' && !isNaN(stats.mean))
          .sort((a, b) => Math.abs(b[1].mean) - Math.abs(a[1].mean))
          .slice(0, 2)
        
        for (const [key, stats] of sortedMetrics) {
          const label = this.formatKey(key)
          const variance = stats.standardDeviation && !isNaN(stats.standardDeviation) && stats.mean !== 0 
            ? (Math.abs(stats.standardDeviation) / Math.abs(stats.mean)) * 100 
            : 0
            
          if (variance > 50) {
            insights.push(`📊 ${label}: High variability (${variance.toFixed(0)}% coefficient of variation) suggests significant uncertainty`)
          } else if (Math.abs(stats.mean) > 1000) {
            insights.push(`💼 ${label}: Significant impact with average of ${this.formatValue(stats.mean)}`)
          }
        }
      }
    } catch (error) {
      insights.push(handleFallback('KeyInsights', error, `📊 Analysis completed with ${results.results.length} iterations - detailed metrics available below`))
    }

    // Ensure we always return at least one insight
    if (insights.length === 0) {
      insights.push(`📊 Simulation completed successfully with ${results.results.length} iterations across ${Object.keys(summary).length} metrics`)
    }

    return insights
  }

  private generateRiskAnalysis(results: CLISimulationResults, _config: SimulationConfig): string[] {
    const risks = []
    const summary = results.summary
    
    // Guard against invalid summary
    if (!summary || Object.keys(summary).length === 0) {
      risks.push(`📊 Risk analysis requires metric data - see detailed results below`)
      return risks
    }
    
    try {
      // Flexible metric discovery for risk analysis
      const metricCategories = this.categorizeMetrics(summary)
      const keyMetrics = [
        ...metricCategories.roi,
        ...metricCategories.benefit,
        ...metricCategories.financial.slice(0, 3) // Top 3 financial metrics
      ]
      
      let analysisCount = 0
      for (const metric of keyMetrics) {
        const stats = summary[metric]
        if (!stats || typeof stats.mean !== 'number' || isNaN(stats.mean)) continue
        
        // Calculate downside risk with error handling
        if (typeof stats.percentile10 === 'number' && !isNaN(stats.percentile10) && stats.mean !== 0) {
          const downsideRisk = (stats.mean - stats.percentile10) / Math.abs(stats.mean)
          
          if (downsideRisk > 0.5) {
            risks.push(`⚠️ High downside risk in ${this.formatKey(metric)}: 10% chance of ${(downsideRisk * 100).toFixed(0)}% below average`)
            analysisCount++
          }
        }
        
        // Probability of negative outcomes with safe filtering
        try {
          const negativeCount = results.results.filter(r => {
            const value = r[metric]
            return typeof value === 'number' && !isNaN(value) && value < 0
          }).length
          
          if (results.results.length > 0) {
            const negativeProbability = (negativeCount / results.results.length) * 100
            
            if (negativeProbability > 10) {
              risks.push(`🚨 Loss probability: ${negativeProbability.toFixed(0)}% chance of negative ${this.formatKey(metric)}`)
              analysisCount++
            } else if (negativeProbability > 0) {
              risks.push(`📊 Low loss risk: ${negativeProbability.toFixed(1)}% chance of negative ${this.formatKey(metric)}`)
              analysisCount++
            }
          }
        } catch (error) {
          logWarning(`NegativeAnalysis-${metric}`, error)
          continue
        }
        
        // Limit to prevent overwhelming output
        if (analysisCount >= 3) break
      }
      
      // If no specific risks found, analyze variability
      if (risks.length === 0) {
        const highVariabilityMetrics = Object.entries(summary)
          .filter(([_, stats]) => {
            if (!stats || typeof stats.mean !== 'number' || typeof stats.standardDeviation !== 'number') return false
            if (isNaN(stats.mean) || isNaN(stats.standardDeviation) || stats.mean === 0) return false
            return (stats.standardDeviation / Math.abs(stats.mean)) > 0.7
          })
          .slice(0, 2)
        
        if (highVariabilityMetrics.length > 0) {
          for (const [key, stats] of highVariabilityMetrics) {
            const cv = ((stats.standardDeviation / Math.abs(stats.mean)) * 100).toFixed(0)
            risks.push(`📊 High variability in ${this.formatKey(key)}: ${cv}% coefficient of variation indicates significant uncertainty`)
          }
        } else {
          risks.push(`✅ Low risk profile: All key metrics show consistent positive outcomes`)
        }
      }
    } catch (error) {
      risks.push(handleFallback('RiskAnalysis', error, `📊 Risk analysis completed - see statistical details below for variability assessment`))
    }

    return risks
  }

  private generateRecommendations(results: CLISimulationResults, config: SimulationConfig, parameters: Record<string, any>): string[] {
    const recommendations = []
    const summary = results.summary
    
    // ROI-based recommendations
    if (summary.roi || summary.roiPercentage) {
      const roiStats = summary.roi || summary.roiPercentage
      
      if (roiStats.mean > 100) {
        recommendations.push(`🚀 STRONG RECOMMEND: Proceed with investment - exceptional ROI potential`)
      } else if (roiStats.mean > 30) {
        recommendations.push(`✅ RECOMMEND: Invest - solid ROI above market benchmarks`)
      } else if (roiStats.mean > 10) {
        recommendations.push(`📊 CONDITIONAL: Consider investment with risk mitigation`)
      } else if (roiStats.mean > 0) {
        recommendations.push(`⚠️ CAUTION: Marginal returns - explore alternatives`)
      } else {
        recommendations.push(`❌ NOT RECOMMENDED: Negative expected returns`)
      }
    }

    // Parameter optimization suggestions
    if (config.name.toLowerCase().includes('qa')) {
      if (parameters.releaseFrequency && parameters.releaseFrequency > 50) {
        recommendations.push(`🤖 High release frequency detected - prioritize automation for efficiency`)
      }
      
      if (parameters.qaStrategy === 'manual' && parameters.teamSize > 10) {
        recommendations.push(`🔄 Large team with manual QA - consider hybrid approach for scalability`)
      }
    }

    // Risk mitigation
    const highVarianceMetrics = Object.entries(summary)
      .filter(([_, stats]) => (stats.standardDeviation / Math.abs(stats.mean)) > 0.5)
      .map(([key, _]) => this.formatKey(key))
    
    if (highVarianceMetrics.length > 0) {
      recommendations.push(`🎯 RISK MITIGATION: High variance in ${highVarianceMetrics.join(', ')} - consider pilot program`)
    }

    // Scaling recommendations
    if (parameters.teamSize && parameters.teamSize < 5) {
      recommendations.push(`📈 SCALING: Small team detected - results may scale differently with growth`)
    }

    return recommendations
  }

  private formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  private formatValue(value: number): string {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A'
    
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    } else if (value % 1 === 0) {
      return value.toLocaleString()
    } else {
      return value.toFixed(2)
    }
  }

  private formatParameterValue(value: any, type?: string): string {
    if (type === 'boolean') {
      return value ? 'Yes' : 'No'
    } else if (typeof value === 'number') {
      return this.formatValue(value)
    } else {
      return String(value)
    }
  }

  private findMetricByPattern(summary: Record<string, StatisticalSummary>, pattern: RegExp): StatisticalSummary | null {
    for (const [key, stats] of Object.entries(summary)) {
      if (pattern.test(key)) {
        return stats
      }
    }
    return null
  }

  private categorizeMetrics(summary: Record<string, StatisticalSummary>): {
    roi: string[]
    cost: string[]
    benefit: string[]
    time: string[]
    financial: string[]
    risk: string[]
  } {
    const categories: {
      roi: string[]
      cost: string[]
      benefit: string[]
      time: string[]
      financial: string[]
      risk: string[]
    } = { roi: [], cost: [], benefit: [], time: [], financial: [], risk: [] }
    
    for (const key of Object.keys(summary)) {
      const keyLower = key.toLowerCase()
      
      if (keyLower.match(/roi|return/i)) {
        categories.roi.push(key)
        categories.financial.push(key)
      } else if (keyLower.match(/cost|expense|fee|price/i)) {
        categories.cost.push(key)
        categories.financial.push(key)
      } else if (keyLower.match(/benefit|saving|revenue|income|profit/i)) {
        categories.benefit.push(key)
        categories.financial.push(key)
      } else if (keyLower.match(/time|period|duration|month|year|day/i)) {
        categories.time.push(key)
      } else if (keyLower.match(/risk|variance|deviation|uncertainty/i)) {
        categories.risk.push(key)
      } else if (keyLower.match(/\$|dollar|amount|value/) && typeof summary[key].mean === 'number') {
        categories.financial.push(key)
      }
    }
    
    return categories
  }
}

export const documentGenerator = new DocumentGenerator()