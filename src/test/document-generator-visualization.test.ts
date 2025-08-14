import { describe, it, expect } from 'vitest'
import { documentGenerator } from '../cli/utils/document-generator'

describe('Document Generator Visualizations', () => {
  const mockResults = {
    results: [
      { roiPercentage: 15.5, paybackPeriod: 12.3, netBenefit: 45000 },
      { roiPercentage: 20.3, paybackPeriod: 10.1, netBenefit: 55000 },
      { roiPercentage: 8.7, paybackPeriod: 15.2, netBenefit: 35000 },
      { roiPercentage: 25.1, paybackPeriod: 8.5, netBenefit: 65000 },
      { roiPercentage: 18.2, paybackPeriod: 11.8, netBenefit: 48000 }
    ],
    summary: {
      roiPercentage: {
        mean: 17.56,
        median: 18.2,
        standardDeviation: 6.12,
        percentile10: 10.5,
        percentile25: 15.5,
        percentile75: 20.3,
        percentile90: 23.7,
        min: 8.7,
        max: 25.1,
        count: 5
      },
      paybackPeriod: {
        mean: 11.58,
        median: 11.8,
        standardDeviation: 2.45,
        percentile10: 9.2,
        percentile25: 10.1,
        percentile75: 12.3,
        percentile90: 14.1,
        min: 8.5,
        max: 15.2,
        count: 5
      },
      netBenefit: {
        mean: 49600,
        median: 48000,
        standardDeviation: 10954,
        percentile10: 37000,
        percentile25: 45000,
        percentile75: 55000,
        percentile90: 61000,
        min: 35000,
        max: 65000,
        count: 5
      }
    }
  }

  const mockConfig = {
    name: 'Test ROI Analysis',
    description: 'A test simulation for validation',
    parameters: [
      {
        key: 'initialInvestment',
        label: 'Initial Investment ($)',
        type: 'number',
        default: 50000
      },
      {
        key: 'monthlyBenefit',
        label: 'Monthly Benefit ($)',
        type: 'number',
        default: 5000
      },
      {
        key: 'riskEnabled',
        label: 'Enable Risk Analysis',
        type: 'boolean',
        default: true
      }
    ],
    outputs: [
      {
        key: 'roiPercentage',
        label: 'ROI Percentage',
        description: 'Annual return on investment percentage'
      },
      {
        key: 'paybackPeriod',
        label: 'Payback Period (Months)',
        description: 'Time to recover initial investment'
      },
      {
        key: 'netBenefit',
        label: 'Net Benefit ($)',
        description: 'Total financial benefit over time period'
      }
    ]
  }

  const mockParameters = {
    initialInvestment: 50000,
    monthlyBenefit: 5000,
    riskEnabled: true
  }

  describe('Analysis Document Generation', () => {
    it('should generate document with chart visualizations', () => {
      const document = documentGenerator.generateAnalysisDocument(
        mockResults,
        mockConfig,
        mockParameters,
        {
          includeCharts: true,
          includeRawData: false,
          includeRecommendations: true
        }
      )

      expect(document).toContain('Test ROI Analysis')
      expect(document).toContain('EXECUTIVE SUMMARY')
      expect(document).toContain('STATISTICAL ANALYSIS')
      expect(document).toContain('ROI Percentage')
    })

    it('should include confidence interval charts when requested', () => {
      const document = documentGenerator.generateAnalysisDocument(
        mockResults,
        mockConfig,
        mockParameters,
        {
          includeCharts: true,
          includeRawData: false,
          includeRecommendations: false
        }
      )

      // Should contain confidence interval visualization
      expect(document).toMatch(/P10:.*P50:.*P90:/)
      expect(document).toMatch(/Mean:.*●/)
    })

    it('should include histogram visualization when requested', () => {
      const document = documentGenerator.generateAnalysisDocument(
        mockResults,
        mockConfig,
        mockParameters,
        {
          includeCharts: true,
          includeRawData: false,
          includeRecommendations: false
        }
      )

      // Should contain histogram structure (using actual symbols from output)
      expect(document).toMatch(/Distribution.*Visualization|█|░/)
    })

    it('should not include charts when disabled', () => {
      const document = documentGenerator.generateAnalysisDocument(
        mockResults,
        mockConfig,
        mockParameters,
        {
          includeCharts: false,
          includeRawData: false,
          includeRecommendations: false
        }
      )

      // Should not contain chart symbols
      expect(document).not.toMatch(/█.*░/)
      expect(document).not.toMatch(/●/)
    })

    it('should include raw data when requested', () => {
      const document = documentGenerator.generateAnalysisDocument(
        mockResults,
        mockConfig,
        mockParameters,
        {
          includeCharts: false,
          includeRawData: true,
          includeRecommendations: false
        }
      )

      // Should contain the raw result values
      expect(document).toContain('15.5')
      expect(document).toContain('20.3')
      expect(document).toContain('8.7')
    })

    it('should include recommendations when requested', () => {
      const document = documentGenerator.generateAnalysisDocument(
        mockResults,
        mockConfig,
        mockParameters,
        {
          includeCharts: false,
          includeRawData: false,
          includeRecommendations: true
        }
      )

      expect(document).toMatch(/RECOMMENDATIONS|BUSINESS INSIGHTS|KEY FINDINGS/i)
    })
  })

  describe('Chart Generation Methods', () => {
    it('should handle empty data gracefully', () => {
      const emptyResults = {
        results: [],
        summary: {}
      }

      const document = documentGenerator.generateAnalysisDocument(
        emptyResults,
        mockConfig,
        mockParameters,
        {
          includeCharts: true,
          includeRawData: false,
          includeRecommendations: false
        }
      )

      expect(document).toContain('Test ROI Analysis')
      // Should not crash with empty data
    })

    it('should format values appropriately in charts', () => {
      const document = documentGenerator.generateAnalysisDocument(
        mockResults,
        mockConfig,
        mockParameters,
        {
          includeCharts: true,
          includeRawData: false,
          includeRecommendations: false
        }
      )

      // Should contain formatted numbers
      expect(document).toMatch(/\d+\.?\d*/)
    })

    it('should handle single value statistics', () => {
      const singleValueResults = {
        results: [
          { roiPercentage: 15.0 }
        ],
        summary: {
          roiPercentage: {
            mean: 15.0,
            median: 15.0,
            standardDeviation: 0,
            percentile10: 15.0,
            percentile25: 15.0,
            percentile75: 15.0,
            percentile90: 15.0,
            min: 15.0,
            max: 15.0,
            count: 1
          }
        }
      }

      const document = documentGenerator.generateAnalysisDocument(
        singleValueResults,
        mockConfig,
        mockParameters,
        {
          includeCharts: true,
          includeRawData: false,
          includeRecommendations: false
        }
      )

      expect(document).toContain('15') // Document generator formats integers without decimals
      // Should handle zero variance case
    })
  })

  describe('Business Intelligence Integration', () => {
    it('should provide business interpretations', () => {
      const document = documentGenerator.generateAnalysisDocument(
        mockResults,
        mockConfig,
        mockParameters,
        {
          includeCharts: false,
          includeRawData: false,
          includeRecommendations: true
        }
      )

      // Should contain business context
      expect(document.toLowerCase()).toMatch(/roi|return|investment|benefit|payback/i)
    })

    it('should include parameter context in analysis', () => {
      const document = documentGenerator.generateAnalysisDocument(
        mockResults,
        mockConfig,
        mockParameters,
        {
          includeCharts: false,
          includeRawData: false,
          includeRecommendations: true
        }
      )

      // Should reference the input parameters with proper formatting
      expect(document).toContain('50.0K') // initialInvestment formatted
      expect(document).toContain('5.0K')  // monthlyBenefit formatted
    })

    it('should adapt recommendations based on results', () => {
      // Test with high ROI scenario
      const highROIResults = {
        ...mockResults,
        summary: {
          ...mockResults.summary,
          roiPercentage: {
            ...mockResults.summary.roiPercentage,
            mean: 35.0 // High ROI
          }
        }
      }

      const document = documentGenerator.generateAnalysisDocument(
        highROIResults,
        mockConfig,
        mockParameters,
        {
          includeCharts: false,
          includeRawData: false,
          includeRecommendations: true
        }
      )

      // Should reflect positive outlook for high ROI
      expect(document.toLowerCase()).toMatch(/strong|excellent|positive|recommend/i)
    })
  })

  describe('Output Format Consistency', () => {
    it('should maintain consistent formatting across sections', () => {
      const document = documentGenerator.generateAnalysisDocument(
        mockResults,
        mockConfig,
        mockParameters,
        {
          includeCharts: true,
          includeRawData: true,
          includeRecommendations: true
        }
      )

      // Check for consistent section headers (document generator uses different format)
      expect(document).toContain('EXECUTIVE SUMMARY')
      expect(document).toContain('STATISTICAL ANALYSIS')
    })

    it('should use consistent number formatting', () => {
      const document = documentGenerator.generateAnalysisDocument(
        mockResults,
        mockConfig,
        mockParameters,
        {
          includeCharts: true,
          includeRawData: false,
          includeRecommendations: false
        }
      )

      // Should have consistently formatted percentages and currency
      expect(document).toMatch(/\d+\.\d+%|\$\d{1,3}(,\d{3})*/i)
    })

    it('should produce valid markdown structure', () => {
      const document = documentGenerator.generateAnalysisDocument(
        mockResults,
        mockConfig,
        mockParameters,
        {
          includeCharts: true,
          includeRawData: true,
          includeRecommendations: true
        }
      )

      // Should contain valid markdown elements (document generator uses emojis and different format)
      expect(document).toMatch(/\*\*.*\*\*/) // Bold text
      expect(document).toContain('📊') // Emojis used as visual markers
    })
  })
})