import { describe, expect, it } from 'vitest'
import { StatisticalAnalyzer } from '../framework/StatisticalAnalyzer'

describe('StatisticalAnalyzer', () => {
  const analyzer = new StatisticalAnalyzer()

  describe('calculateSummary', () => {
    it('should calculate basic statistics correctly', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const summary = analyzer.calculateSummary(values)

      expect(summary.mean).toBe(5.5)
      expect(summary.median).toBe(5.5)
      expect(summary.count).toBe(10)
      expect(summary.min).toBe(1)
      expect(summary.max).toBe(10)
    })

    it('should calculate percentiles correctly', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const summary = analyzer.calculateSummary(values)

      expect(summary.percentile10).toBeCloseTo(1.9, 1)
      expect(summary.percentile25).toBeCloseTo(3.25, 2)
      expect(summary.percentile75).toBeCloseTo(7.75, 2)
      expect(summary.percentile90).toBeCloseTo(9.1, 1)
    })

    it('should handle single value', () => {
      const values = [42]
      const summary = analyzer.calculateSummary(values)

      expect(summary.mean).toBe(42)
      expect(summary.median).toBe(42)
      expect(summary.standardDeviation).toBe(0)
      expect(summary.percentile10).toBe(42)
      expect(summary.percentile90).toBe(42)
    })

    it('should throw error for empty array', () => {
      expect(() => analyzer.calculateSummary([])).toThrow('Cannot calculate statistics for empty array')
    })
  })

  describe('calculateHistogram', () => {
    it('should generate histogram with correct bins', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const histogram = analyzer.calculateHistogram(values, 5)

      expect(histogram).toHaveLength(5)
      expect(histogram[0].binStart).toBeCloseTo(1, 5)
      expect(histogram[4].binEnd).toBeCloseTo(10, 5)
    })

    it('should calculate bin counts correctly', () => {
      const values = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]
      const histogram = analyzer.calculateHistogram(values, 5)

      // Each bin should contain roughly equal counts
      const totalCount = histogram.reduce((sum, bin) => sum + bin.count, 0)
      expect(totalCount).toBe(10)
    })

    it('should calculate percentages correctly', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const histogram = analyzer.calculateHistogram(values, 10)

      histogram.forEach(bin => {
        if (bin.count > 0) {
          expect(bin.percentage).toBeGreaterThan(0)
        }
      })

      const totalPercentage = histogram.reduce((sum, bin) => sum + bin.percentage, 0)
      expect(totalPercentage).toBeCloseTo(100, 5)
    })

    it('should handle edge case with identical values', () => {
      const values = [5, 5, 5, 5, 5]
      const histogram = analyzer.calculateHistogram(values, 5)

      expect(histogram).toHaveLength(5)
      // All values should be in the last bin due to inclusive upper bound
      expect(histogram[4].count).toBe(5)
      expect(histogram[4].percentage).toBe(100)
    })

    it('should return empty array for empty input', () => {
      const histogram = analyzer.calculateHistogram([], 5)
      expect(histogram).toEqual([])
    })
  })

  describe('calculateRiskMetrics', () => {
    it('should calculate probability of loss correctly', () => {
      const values = [-10, -5, 0, 5, 10, 15, 20]
      const riskMetrics = analyzer.calculateRiskMetrics(values, 0)

      // 2 out of 7 values are below 0 (0 is not a loss)
      expect(riskMetrics.probabilityOfLoss).toBeCloseTo(28.57, 1)
    })

    it('should calculate Value at Risk correctly', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const riskMetrics = analyzer.calculateRiskMetrics(values, 0)

      // VaR 95% should be around the 5th percentile
      expect(riskMetrics.valueAtRisk95).toBe(1)
      expect(riskMetrics.valueAtRisk99).toBe(1)
    })

    it('should calculate Expected Shortfall correctly', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const riskMetrics = analyzer.calculateRiskMetrics(values, 0)

      // Expected Shortfall should be the mean of the tail
      expect(riskMetrics.expectedShortfall95).toBeCloseTo(1, 5)
      expect(riskMetrics.expectedShortfall99).toBeCloseTo(1, 5)
    })

    it('should handle no losses case', () => {
      const values = [10, 20, 30, 40, 50]
      const riskMetrics = analyzer.calculateRiskMetrics(values, 0)

      expect(riskMetrics.probabilityOfLoss).toBe(0)
      expect(riskMetrics.valueAtRisk95).toBe(10) // Lowest value
    })

    it('should handle all losses case', () => {
      const values = [-50, -40, -30, -20, -10]
      const riskMetrics = analyzer.calculateRiskMetrics(values, 0)

      expect(riskMetrics.probabilityOfLoss).toBe(100)
    })
  })

  describe('calculatePercentile', () => {
    it('should calculate percentiles correctly', () => {
      const sortedValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      
      expect(analyzer.calculatePercentile(sortedValues, 0)).toBe(1)
      expect(analyzer.calculatePercentile(sortedValues, 100)).toBe(10)
      expect(analyzer.calculatePercentile(sortedValues, 50)).toBe(5.5)
    })

    it('should throw error for invalid percentile', () => {
      const values = [1, 2, 3, 4, 5]
      
      expect(() => analyzer.calculatePercentile(values, -1)).toThrow('Percentile must be between 0 and 100')
      expect(() => analyzer.calculatePercentile(values, 101)).toThrow('Percentile must be between 0 and 100')
    })

    it('should handle interpolation correctly', () => {
      const values = [1, 2, 3, 4]
      
      // 25th percentile should be between 1st and 2nd value
      const p25 = analyzer.calculatePercentile(values, 25)
      expect(p25).toBeGreaterThan(1)
      expect(p25).toBeLessThan(2)
    })
  })

  describe('calculateMean', () => {
    it('should calculate mean correctly', () => {
      expect(analyzer.calculateMean([1, 2, 3, 4, 5])).toBe(3)
      expect(analyzer.calculateMean([10, 20, 30])).toBe(20)
    })
  })

  describe('calculateStandardDeviation', () => {
    it('should calculate standard deviation correctly', () => {
      const values = [1, 2, 3, 4, 5]
      const stdDev = analyzer.calculateStandardDeviation(values)
      
      // Standard deviation of [1,2,3,4,5] should be approximately 1.41
      expect(stdDev).toBeCloseTo(1.41, 1)
    })

    it('should return 0 for identical values', () => {
      const values = [5, 5, 5, 5, 5]
      const stdDev = analyzer.calculateStandardDeviation(values)
      
      expect(stdDev).toBe(0)
    })
  })
})