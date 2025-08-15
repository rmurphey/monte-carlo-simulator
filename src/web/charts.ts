/**
 * Chart rendering with basic DOM/Canvas
 */

import type { HistogramData } from './types'
import { formatNumber, getElementOrThrow } from './utils'

export class Charts {
  private container: HTMLElement
  private charts: Map<string, HTMLElement> = new Map()

  constructor(containerId: string) {
    this.container = getElementOrThrow(containerId)
  }

  createHistograms(results: Array<Record<string, unknown>>) {
    this.clear()
    
    if (!results.length) return

    const outputKeys = Object.keys(results[0])
    outputKeys.forEach(key => {
      this.createHistogram(key, results)
    })
  }

  private createHistogram(outputKey: string, results: Array<Record<string, unknown>>) {
    // Create simple HTML histogram
    const histogramContainer = document.createElement('div')
    histogramContainer.className = 'chart-container'
    histogramContainer.innerHTML = `
      <h3>Distribution of ${outputKey}</h3>
      <div class="histogram" id="histogram-${outputKey}"></div>
    `
    
    this.container.appendChild(histogramContainer)

    // Extract values and create histogram data
    const values = results
      .map(r => Number(r[outputKey]))
      .filter(v => !isNaN(v))
    
    const histogramData = this.createHistogramData(values)
    const histogramDiv = histogramContainer.querySelector('.histogram') as HTMLElement
    
    if (histogramDiv && histogramData.data.length) {
      this.renderSimpleHistogram(histogramDiv, histogramData)
    }

    this.charts.set(outputKey, histogramContainer)
  }

  private createHistogramData(values: number[]): HistogramData {
    if (!values.length) return { labels: [], data: [] }

    const min = Math.min(...values)
    const max = Math.max(...values)
    const binCount = Math.min(20, Math.max(5, Math.ceil(Math.sqrt(values.length))))
    
    if (min === max) {
      return {
        labels: [formatNumber(min)],
        data: [values.length]
      }
    }

    const binWidth = (max - min) / binCount
    const bins = Array(binCount).fill(0)
    const labels = []

    // Create bin labels
    for (let i = 0; i < binCount; i++) {
      const binStart = min + i * binWidth
      const binEnd = min + (i + 1) * binWidth
      labels.push(`${formatNumber(binStart)}-${formatNumber(binEnd)}`)
    }

    // Count values in each bin
    values.forEach(value => {
      let binIndex = Math.floor((value - min) / binWidth)
      if (binIndex >= binCount) binIndex = binCount - 1
      if (binIndex < 0) binIndex = 0
      bins[binIndex]++
    })

    return { labels, data: bins }
  }

  private renderSimpleHistogram(container: HTMLElement, data: HistogramData) {
    const maxValue = Math.max(...data.data)
    
    container.innerHTML = data.labels.map((label, i) => {
      const count = data.data[i]
      const percentage = maxValue > 0 ? (count / maxValue) * 100 : 0
      
      return `
        <div class="histogram-bar" style="display: flex; align-items: center; margin-bottom: 4px;">
          <div class="histogram-label" style="width: 120px; font-size: 12px; text-align: right; margin-right: 8px;">
            ${label}
          </div>
          <div class="histogram-bar-container" style="flex: 1; height: 20px; background: #f0f0f0; position: relative;">
            <div class="histogram-bar-fill" style="height: 100%; width: ${percentage}%; background: #3b82f6; display: flex; align-items: center; justify-content: flex-end; padding-right: 4px;">
              <span style="color: white; font-size: 11px; font-weight: bold;">${count}</span>
            </div>
          </div>
        </div>
      `
    }).join('')
  }

  updateHistograms(results: Array<Record<string, unknown>>) {
    if (!results.length) return

    const outputKeys = Object.keys(results[0])
    outputKeys.forEach(key => {
      const chartContainer = this.charts.get(key)
      if (chartContainer) {
        const values = results
          .map(r => Number(r[key]))
          .filter(v => !isNaN(v))
        
        const histogramData = this.createHistogramData(values)
        const histogramDiv = chartContainer.querySelector('.histogram') as HTMLElement
        if (histogramDiv) {
          this.renderSimpleHistogram(histogramDiv, histogramData)
        }
      }
    })
  }

  clear() {
    // Clear all chart elements
    this.charts.clear()
    
    // Clear container
    this.container.innerHTML = ''
  }
}