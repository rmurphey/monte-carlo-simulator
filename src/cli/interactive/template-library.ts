import path from 'path'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import yaml from 'yaml'
import { SimulationConfig } from '../config/schema'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface TemplateInfo {
  id: string
  name: string
  category: string
  description: string
  tags: string[]
  businessContext: string
  useCase: string
  industryRelevance: string[]
}

export interface BusinessTemplate {
  config: SimulationConfig
  info: TemplateInfo
  guidance: {
    whenToUse: string
    parameterTips: Record<string, string>
    businessInsights: string[]
    industryBenchmarks?: Record<string, string>
  }
}

export class TemplateLibrary {
  private templatesPath: string
  private templates: Map<string, BusinessTemplate> = new Map()

  constructor() {
    // Point to working examples directory instead of broken templates directory
    this.templatesPath = path.join(__dirname, '..', '..', '..', 'examples', 'simulations')
  }

  async loadTemplates(): Promise<void> {
    try {
      const templateFiles = await fs.readdir(this.templatesPath)
      const yamlFiles = templateFiles.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))

      for (const file of yamlFiles) {
        try {
          const templatePath = path.join(this.templatesPath, file)
          const content = await fs.readFile(templatePath, 'utf-8')
          const config = yaml.parse(content) as SimulationConfig

          const template = this.createBusinessTemplate(config, file)
          this.templates.set(template.info.id, template)
        } catch (error) {
          // Silently skip malformed templates
          console.warn(`⚠️  Skipping template ${file}: YAML formatting issue`)
        }
      }
    } catch (error) {
      // Templates directory not found - this is ok, just means no templates available
    }
  }

  private createBusinessTemplate(config: SimulationConfig, filename: string): BusinessTemplate {
    const id = filename.replace(/\.(yaml|yml)$/, '')
    
    return {
      config,
      info: {
        id,
        name: config.name,
        category: config.category,
        description: config.description,
        tags: config.tags || [],
        businessContext: this.extractBusinessContext(config),
        useCase: this.extractUseCase(config),
        industryRelevance: this.extractIndustryRelevance(config)
      },
      guidance: {
        whenToUse: this.generateWhenToUse(config),
        parameterTips: this.generateParameterTips(config),
        businessInsights: this.generateBusinessInsights(config),
        industryBenchmarks: this.extractIndustryBenchmarks(config)
      }
    }
  }

  private extractBusinessContext(config: SimulationConfig): string {
    const category = config.category.toLowerCase()
    const hasARR = config.parameters.some(p => p.key.toLowerCase().includes('annualrecurringrevenue'))
    
    if (hasARR) {
      return `ARR-based ${category} simulation with business intelligence metrics`
    }
    
    const contextMap: Record<string, string> = {
      'business': 'Strategic business planning and operational optimization',
      'marketing': 'Marketing campaign performance and customer acquisition analysis',
      'software': 'Software development project planning and resource allocation',
      'e-commerce': 'E-commerce performance optimization and conversion analysis',
      'manufacturing': 'Manufacturing capacity planning and operational efficiency',
      'operations': 'Operational process improvement and resource optimization'
    }
    
    return contextMap[category] || `${category} analysis and planning simulation`
  }

  private extractUseCase(config: SimulationConfig): string {
    const name = config.name.toLowerCase()
    
    if (name.includes('restaurant')) {
      return 'Restaurant investment planning, profitability analysis, and operational optimization'
    } else if (name.includes('saas') || name.includes('growth')) {
      return 'SaaS business growth planning, unit economics optimization, and scaling strategy'
    } else if (name.includes('marketing') || name.includes('campaign')) {
      return 'Marketing campaign ROI analysis, customer acquisition optimization, and budget allocation'
    } else if (name.includes('software') || name.includes('project')) {
      return 'Software development project estimation, team scaling, and delivery planning'
    } else if (name.includes('ecommerce') || name.includes('conversion')) {
      return 'E-commerce conversion optimization, customer journey analysis, and revenue improvement'
    } else if (name.includes('manufacturing') || name.includes('capacity')) {
      return 'Manufacturing capacity planning, production optimization, and operational efficiency'
    }
    
    return `${config.category} scenario analysis and strategic planning`
  }

  private extractIndustryRelevance(config: SimulationConfig): string[] {
    const tags = config.tags || []
    const name = config.name.toLowerCase()
    
    const industries: string[] = []
    
    if (tags.includes('restaurant') || name.includes('restaurant')) {
      industries.push('Hospitality', 'Food Service', 'Retail')
    }
    if (tags.includes('saas') || name.includes('saas')) {
      industries.push('Software', 'Technology', 'B2B Services')
    }
    if (tags.includes('marketing') || name.includes('marketing')) {
      industries.push('Advertising', 'Digital Marketing', 'E-commerce')
    }
    if (tags.includes('manufacturing') || name.includes('manufacturing')) {
      industries.push('Manufacturing', 'Industrial', 'Supply Chain')
    }
    if (tags.includes('software') || name.includes('software')) {
      industries.push('Technology', 'Software Development', 'IT Services')
    }
    
    return industries.length > 0 ? industries : ['General Business']
  }

  private generateWhenToUse(config: SimulationConfig): string {
    const category = config.category.toLowerCase()
    const hasARR = config.parameters.some(p => p.key.toLowerCase().includes('annualrecurringrevenue'))
    
    if (hasARR) {
      return `Use when planning ${category} investments based on company ARR and need realistic business projections with industry KPIs`
    }
    
    const whenToUseMap: Record<string, string> = {
      'business': 'Use for strategic business planning, investment analysis, and operational decision-making',
      'marketing': 'Use for marketing campaign planning, budget optimization, and ROI forecasting',
      'software': 'Use for software project estimation, team planning, and delivery timeline analysis',
      'e-commerce': 'Use for e-commerce optimization, conversion analysis, and revenue improvement planning',
      'manufacturing': 'Use for capacity planning, production optimization, and operational efficiency analysis'
    }
    
    return whenToUseMap[category] || `Use for ${category} analysis and strategic planning scenarios`
  }

  private generateParameterTips(config: SimulationConfig): Record<string, string> {
    const tips: Record<string, string> = {}
    
    config.parameters.forEach(param => {
      const key = param.key.toLowerCase()
      
      if (key.includes('annualrecurringrevenue') || key.includes('arr')) {
        tips[param.key] = 'Use your actual company ARR. This drives realistic budget allocations across all business functions.'
      } else if (key.includes('budget') && key.includes('percent')) {
        tips[param.key] = 'Industry benchmarks: B2B SaaS 8-15%, B2C 15-25%, Enterprise 5-12%'
      } else if (key.includes('conversion') && key.includes('rate')) {
        tips[param.key] = 'Industry averages: E-commerce 2-4%, B2B SaaS 2-8%, Lead generation 1-3%'
      } else if (key.includes('churn')) {
        tips[param.key] = 'Typical ranges: SMB 3-7%/month, Mid-market 1-3%/month, Enterprise 0.5-1%/month'
      } else if (key.includes('team') && key.includes('size')) {
        tips[param.key] = 'Consider Brooks\' Law: teams >7 people have coordination overhead'
      } else if (key.includes('capacity') && key.includes('utilization')) {
        tips[param.key] = 'Optimal utilization: Manufacturing 75-85%, Services 70-80%, avoid >90%'
      } else if (key.includes('customer') && key.includes('acquisition')) {
        tips[param.key] = 'Target CAC:LTV ratio of 1:3 or better for sustainable growth'
      } else if (key.includes('average') && key.includes('order')) {
        tips[param.key] = 'Track trends: seasonal variations, customer segment differences, product mix impact'
      } else if (key.includes('traffic') || key.includes('visitors')) {
        tips[param.key] = 'Use actual analytics data. Consider seasonal patterns and growth trends'
      }
    })
    
    return tips
  }

  private generateBusinessInsights(config: SimulationConfig): string[] {
    const insights: string[] = []
    const name = config.name.toLowerCase()
    
    if (name.includes('restaurant')) {
      insights.push(
        'Food costs should typically stay below 32% of revenue',
        'Labor costs generally range 25-35% of revenue depending on service model',
        'Location quality has 2-3x impact on customer traffic and revenue',
        'Table turnover rate directly impacts revenue per seat capacity'
      )
    } else if (name.includes('saas') || name.includes('growth')) {
      insights.push(
        'Net Revenue Retention >100% indicates healthy expansion revenue',
        'CAC Payback Period should be <12 months for efficient growth',
        'Monthly churn compounds exponentially - small improvements have big impact',
        'Product-led growth typically has lower CAC but requires higher product investment'
      )
    } else if (name.includes('marketing')) {
      insights.push(
        'Multi-channel campaigns typically achieve 1.2-1.5x higher ROI than single-channel',
        'Customer lifetime value must exceed acquisition cost by 3:1 minimum',
        'Organic amplification from paid campaigns often provides 20-40% bonus reach',
        'Brand impact compounds over time - consider long-term value beyond immediate ROI'
      )
    } else if (name.includes('software') || name.includes('project')) {
      insights.push(
        'Team scaling follows Brooks\' Law - doubling team size rarely halves delivery time',
        'Technical complexity has exponential impact on delivery timeline',
        'Quality requirements significantly impact both timeline and cost',
        'Risk buffers should increase with architectural complexity and team experience gaps'
      )
    } else if (name.includes('ecommerce') || name.includes('conversion')) {
      insights.push(
        'Mobile conversion rates typically 30-50% lower than desktop',
        'Checkout funnel optimization often provides highest ROI improvements',
        'Customer lifetime value improvements compound through retention',
        'Personalization can improve conversion rates 10-30% but requires significant investment'
      )
    } else if (name.includes('manufacturing')) {
      insights.push(
        'Overall Equipment Effectiveness (OEE) >85% indicates world-class operations',
        'Capacity utilization >90% often creates bottlenecks and quality issues',
        'Automation ROI depends heavily on product complexity and volume',
        'Lead time reduction often has greater business impact than cost reduction'
      )
    }
    
    return insights
  }

  private extractIndustryBenchmarks(config: SimulationConfig): Record<string, string> | undefined {
    const benchmarks: Record<string, string> = {}
    const name = config.name.toLowerCase()
    
    if (name.includes('restaurant')) {
      benchmarks['Food Cost %'] = '28-35% of revenue'
      benchmarks['Labor Cost %'] = '25-35% of revenue'  
      benchmarks['Net Profit Margin'] = '3-6% for restaurants'
      benchmarks['Revenue per Seat'] = '$400-800/month depending on segment'
    } else if (name.includes('saas')) {
      benchmarks['Net Revenue Retention'] = '>110% for healthy growth'
      benchmarks['CAC Payback'] = '<12 months'
      benchmarks['Gross Margin'] = '75-85% for SaaS'
      benchmarks['Monthly Churn'] = 'SMB: 3-7%, Enterprise: 0.5-1%'
    } else if (name.includes('marketing')) {
      benchmarks['B2B CAC'] = '$200-1500 depending on ACV'
      benchmarks['B2C CAC'] = '$5-100 depending on LTV'
      benchmarks['Email Marketing ROI'] = '36:1 average return'
      benchmarks['Content Marketing ROI'] = '3:1 average return'
    }
    
    return Object.keys(benchmarks).length > 0 ? benchmarks : undefined
  }

  getTemplatesByCategory(category: string): BusinessTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.info.category.toLowerCase() === category.toLowerCase())
  }

  getTemplatesByTag(tag: string): BusinessTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.info.tags.includes(tag))
  }

  getTemplate(id: string): BusinessTemplate | undefined {
    return this.templates.get(id)
  }

  getAllTemplates(): BusinessTemplate[] {
    return Array.from(this.templates.values())
  }

  getTemplateCategories(): string[] {
    const categories = new Set<string>()
    this.templates.forEach(template => categories.add(template.info.category))
    return Array.from(categories).sort()
  }

  searchTemplates(query: string): BusinessTemplate[] {
    const searchTerm = query.toLowerCase()
    return Array.from(this.templates.values()).filter(template =>
      template.info.name.toLowerCase().includes(searchTerm) ||
      template.info.description.toLowerCase().includes(searchTerm) ||
      template.info.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      template.info.businessContext.toLowerCase().includes(searchTerm)
    )
  }

  generateBusinessGuidance(template: BusinessTemplate): string {
    const guidance = [
      `📋 ${template.info.name}`,
      '',
      `🎯 Use Case: ${template.info.useCase}`,
      `🏢 Industries: ${template.info.industryRelevance.join(', ')}`,
      '',
      `💡 When to Use:`,
      template.guidance.whenToUse,
      ''
    ]

    if (Object.keys(template.guidance.parameterTips).length > 0) {
      guidance.push('🔧 Parameter Tips:')
      Object.entries(template.guidance.parameterTips).forEach(([key, tip]) => {
        guidance.push(`   • ${key}: ${tip}`)
      })
      guidance.push('')
    }

    if (template.guidance.businessInsights.length > 0) {
      guidance.push('📊 Key Business Insights:')
      template.guidance.businessInsights.forEach(insight => {
        guidance.push(`   • ${insight}`)
      })
      guidance.push('')
    }

    if (template.guidance.industryBenchmarks) {
      guidance.push('📈 Industry Benchmarks:')
      Object.entries(template.guidance.industryBenchmarks).forEach(([metric, benchmark]) => {
        guidance.push(`   • ${metric}: ${benchmark}`)
      })
      guidance.push('')
    }

    return guidance.join('\n')
  }
}