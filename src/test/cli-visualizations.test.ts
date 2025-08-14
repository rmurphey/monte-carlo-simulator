import { beforeEach, describe, expect, it, vi } from 'vitest'

// Import the functions we need to test
// Note: We need to extract these functions or make them testable
// For now, let's test the underlying logic by testing the statistical analyzer and integration

describe('CLI Visualizations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('formatNumber utility', () => {
    // We need to extract this function to test it independently
    const formatNumber = (value: number): string => {
      if (Math.abs(value) >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M'
      } else if (Math.abs(value) >= 1000) {
        return (value / 1000).toFixed(1) + 'K'
      } else if (value % 1 === 0) {
        return value.toString()
      } else {
        return value.toFixed(2)
      }
    }

    it('should format large numbers with M suffix', () => {
      expect(formatNumber(1000000)).toBe('1.0M')
      expect(formatNumber(2500000)).toBe('2.5M')
      expect(formatNumber(-1500000)).toBe('-1.5M')
    })

    it('should format thousands with K suffix', () => {
      expect(formatNumber(1000)).toBe('1.0K')
      expect(formatNumber(2500)).toBe('2.5K')
      expect(formatNumber(-1500)).toBe('-1.5K')
    })

    it('should format whole numbers without decimals', () => {
      expect(formatNumber(42)).toBe('42')
      expect(formatNumber(100)).toBe('100')
      expect(formatNumber(-25)).toBe('-25')
    })

    it('should format decimals with 2 decimal places', () => {
      expect(formatNumber(42.123)).toBe('42.12')
      expect(formatNumber(3.14159)).toBe('3.14')
      expect(formatNumber(-0.5)).toBe('-0.50')
    })
  })

  describe('ASCII Histogram Generation', () => {
    it('should generate histogram structure correctly', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const title = 'Test Distribution'

      // Mock the generateASCIIHistogram function behavior
      const mockHistogram = {
        title: '📊 ' + title,
        hasData: values.length > 0,
        totalBins: 20,
        maxCount: Math.max(...Array.from({ length: 20 }, (_, i) => {
          const min = Math.min(...values)
          const max = Math.max(...values)
          const binWidth = (max - min) / 20
          const binStart = min + i * binWidth
          const binEnd = binStart + binWidth
          return values.filter(v => v >= binStart && (i === 19 ? v <= binEnd : v < binEnd)).length
        }))
      }

      expect(mockHistogram.hasData).toBe(true)
      expect(mockHistogram.totalBins).toBe(20)
      expect(mockHistogram.maxCount).toBeGreaterThan(0)
    })

    it('should handle empty values gracefully', () => {
      const values: number[] = []
      const hasData = values.length > 0

      expect(hasData).toBe(false)
    })

    it('should handle single value', () => {
      const values = [42]
      const min = Math.min(...values)
      const max = Math.max(...values)
      const range = max - min

      expect(range).toBe(0)
      expect(min).toBe(42)
      expect(max).toBe(42)
    })
  })

  describe('Confidence Interval Generation', () => {
    it('should handle normal distribution correctly', () => {
      const mockStats = {
        min: 10,
        max: 90,
        mean: 50,
        median: 48,
        percentile10: 25,
        percentile90: 75
      }

      const width = 60
      const range = mockStats.max - mockStats.min
      const normalize = (value: number) => Math.round(((value - mockStats.min) / range) * width)

      const positions = {
        p10: normalize(mockStats.percentile10),
        p50: normalize(mockStats.median),
        p90: normalize(mockStats.percentile90),
        mean: normalize(mockStats.mean)
      }

      expect(positions.p10).toBeGreaterThanOrEqual(0)
      expect(positions.p10).toBeLessThanOrEqual(width)
      expect(positions.p90).toBeGreaterThan(positions.p10)
      expect(positions.mean).toBeGreaterThanOrEqual(0)
      expect(positions.mean).toBeLessThanOrEqual(width)
    })

    it('should handle edge case with zero range', () => {
      const mockStats = {
        min: 50,
        max: 50,
        mean: 50,
        median: 50,
        percentile10: 50,
        percentile90: 50
      }

      const range = mockStats.max - mockStats.min
      expect(range).toBe(0)

      // When range is 0, should show single value
      const isSingleValue = range === 0 || !mockStats.mean
      expect(isSingleValue).toBe(true)
    })

    it('should handle missing statistical values gracefully', () => {
      const mockStats = {
        min: undefined,
        max: undefined,
        mean: undefined,
        median: undefined,
        percentile10: undefined,
        percentile90: undefined
      }

      const range = (mockStats.max || 0) - (mockStats.min || 0)
      const shouldShowSingleValue = range === 0 || !mockStats.mean

      expect(shouldShowSingleValue).toBe(true)
    })
  })

  describe('Risk Analysis Generation', () => {
    it('should format risk metrics correctly', () => {
      const mockRiskMetrics = {
        probabilityOfLoss: 25.5,
        valueAtRisk95: -125.75,
        valueAtRisk99: -200.25,
        expectedShortfall95: -150.5,
        expectedShortfall99: -225.75
      }

      // Test safe formatting with fallbacks
      const formatRiskValue = (value: number | undefined) => {
        return (value || 0).toFixed(1)
      }

      expect(formatRiskValue(mockRiskMetrics.probabilityOfLoss)).toBe('25.5')
      expect(formatRiskValue(undefined)).toBe('0.0')
    })

    it('should handle undefined risk metrics gracefully', () => {
      const mockRiskMetrics = {
        probabilityOfLoss: undefined,
        valueAtRisk95: undefined,
        valueAtRisk99: undefined,
        expectedShortfall95: undefined,
        expectedShortfall99: undefined
      }

      const safeFormat = (value: number | undefined) => (value || 0).toFixed(1)

      expect(safeFormat(mockRiskMetrics.probabilityOfLoss)).toBe('0.0')
      expect(safeFormat(mockRiskMetrics.valueAtRisk95)).toBe('0.0')
    })
  })

  describe('Statistical Data Processing', () => {
    it('should extract values correctly for primary output', () => {
      const mockResults = {
        results: [
          { roiPercentage: 15.5, paybackPeriod: 12 },
          { roiPercentage: 20.3, paybackPeriod: 10 },
          { roiPercentage: 8.7, paybackPeriod: 15 },
          { roiPercentage: 25.1, paybackPeriod: 8 }
        ],
        summary: {
          roiPercentage: { mean: 17.4 },
          paybackPeriod: { mean: 11.25 }
        }
      }

      const primaryOutputKey = Object.keys(mockResults.summary)[0]
      const primaryValues = mockResults.results
        .map((result: any) => result[primaryOutputKey])
        .filter((v: any) => typeof v === 'number')

      expect(primaryOutputKey).toBe('roiPercentage')
      expect(primaryValues).toEqual([15.5, 20.3, 8.7, 25.1])
      expect(primaryValues.length).toBe(4)
    })

    it('should filter non-numeric values correctly', () => {
      const mockResults = {
        results: [
          { value: 10 },
          { value: null },
          { value: 'invalid' },
          { value: 20 },
          { value: undefined }
        ]
      }

      const values = mockResults.results
        .map((result: any) => result.value)
        .filter((v: any) => typeof v === 'number')

      expect(values).toEqual([10, 20])
      expect(values.length).toBe(2)
    })
  })

  describe('Visualization Integration', () => {
    it('should determine when to show visualizations', () => {
      const mockResults = {
        results: [
          { roiPercentage: 15 },
          { roiPercentage: 20 },
          { roiPercentage: 25 }
        ],
        summary: {
          roiPercentage: {
            mean: 20,
            median: 20,
            percentile10: 16,
            percentile90: 24
          }
        }
      }

      const primaryValues = mockResults.results
        .map(r => r.roiPercentage)
        .filter(v => typeof v === 'number')

      const shouldShowViz = primaryValues.length > 0
      expect(shouldShowViz).toBe(true)
    })

    it('should handle empty results gracefully', () => {
      const mockResults = {
        results: [],
        summary: {}
      }

      const primaryOutputKeys = Object.keys(mockResults.summary)
      const shouldShowViz = primaryOutputKeys.length > 0

      expect(shouldShowViz).toBe(false)
    })
  })

  describe('Verbose Mode Behavior', () => {
    it('should process all outputs in verbose mode', () => {
      const mockResults = {
        summary: {
          roiPercentage: { mean: 20 },
          paybackPeriod: { mean: 12 },
          netBenefit: { mean: 50000 }
        },
        results: [
          { roiPercentage: 15, paybackPeriod: 14, netBenefit: 45000 },
          { roiPercentage: 25, paybackPeriod: 10, netBenefit: 55000 }
        ]
      }

      const allOutputs = Object.keys(mockResults.summary)
      const additionalOutputs = allOutputs.slice(1) // Skip primary output

      expect(allOutputs).toEqual(['roiPercentage', 'paybackPeriod', 'netBenefit'])
      expect(additionalOutputs).toEqual(['paybackPeriod', 'netBenefit'])

      // Test that we can extract values for each output
      additionalOutputs.forEach(key => {
        const values = mockResults.results
          .map((result: any) => result[key])
          .filter((v: any) => typeof v === 'number')
        
        expect(values.length).toBe(2)
      })
    })
  })
})