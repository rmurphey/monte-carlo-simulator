import { describe, expect, it } from 'vitest'
import { toCamelCase, toClassName, toId } from '../cli/utils/name-converter'

describe('name-converter', () => {
  describe('toClassName', () => {
    it('should convert simple names', () => {
      expect(toClassName('hello world')).toBe('HelloWorld')
      expect(toClassName('ai investment')).toBe('AiInvestment')
    })

    it('should handle various separators', () => {
      expect(toClassName('hello-world')).toBe('HelloWorld')
      expect(toClassName('hello_world')).toBe('HelloWorld')
      expect(toClassName('hello world test')).toBe('HelloWorldTest')
    })

    it('should remove special characters', () => {
      expect(toClassName('AI Investment ROI ($)')).toBe('AiInvestmentRoi')
      expect(toClassName('Product Launch @2024')).toBe('ProductLaunch2024')
    })

    it('should handle edge cases', () => {
      expect(toClassName('')).toBe('')
      expect(toClassName('   ')).toBe('')
      expect(toClassName('a')).toBe('A')
    })
  })

  describe('toId', () => {
    it('should convert to kebab-case', () => {
      expect(toId('Hello World')).toBe('hello-world')
      expect(toId('AI Investment ROI')).toBe('ai-investment-roi')
    })

    it('should remove special characters', () => {
      expect(toId('Product Launch ($)')).toBe('product-launch')
      expect(toId('Test@2024')).toBe('test2024')
    })

    it('should handle multiple spaces', () => {
      expect(toId('hello    world')).toBe('hello-world')
      expect(toId('a   b   c')).toBe('a-b-c')
    })

    it('should handle edge cases', () => {
      expect(toId('')).toBe('')
      expect(toId('   ')).toBe('')
      expect(toId('a')).toBe('a')
    })
  })

  describe('toCamelCase', () => {
    it('should convert to camelCase', () => {
      expect(toCamelCase('hello world')).toBe('helloWorld')
      expect(toCamelCase('AI Investment ROI')).toBe('aiInvestmentRoi')
    })

    it('should handle single words', () => {
      expect(toCamelCase('hello')).toBe('hello')
      expect(toCamelCase('TEST')).toBe('test')
    })

    it('should handle edge cases', () => {
      expect(toCamelCase('')).toBe('')
      expect(toCamelCase('a')).toBe('a')
    })
  })

  describe('integration examples', () => {
    it('should handle realistic simulation names', () => {
      const name = 'Portfolio Risk Assessment'
      expect(toClassName(name)).toBe('PortfolioRiskAssessment')
      expect(toId(name)).toBe('portfolio-risk-assessment')
      expect(toCamelCase(name)).toBe('portfolioRiskAssessment')
    })

    it('should handle names with symbols', () => {
      const name = 'Customer Churn Analysis (ML)'
      expect(toClassName(name)).toBe('CustomerChurnAnalysisml')
      expect(toId(name)).toBe('customer-churn-analysis-ml')
      expect(toCamelCase(name)).toBe('customerChurnAnalysisml')
    })
  })
})