/**
 * Chart rendering with Chart.js
 */

import { Chart, registerables } from 'chart.js'
import type { HistogramData } from './types'
import { formatNumber, getElementOrThrow } from './utils'

// Register Chart.js components
Chart.register(...registerables)

export class Charts {
  private container: HTMLElement
  private charts: Map<string, Chart> = new Map()

  constructor(containerId: string) {
    this.container = getElementOrThrow(containerId)
  }

  createHistograms(results: Array<Record<string, any>>) {
    this.clear()
    
    if (!results.length) return

    const outputKeys = Object.keys(results[0])
    outputKeys.forEach(key => {
      this.createHistogram(key, results)
    })
  }

  private createHistogram(outputKey: string, results: Array<Record<string, any>>) {
    // Create canvas container
    const canvasContainer = document.createElement('div')
    canvasContainer.className = 'chart-container'
    
    const canvas = document.createElement('canvas')
    canvas.id = `chart-${outputKey}`
    canvasContainer.appendChild(canvas)
    this.container.appendChild(canvasContainer)

    // Extract values and create histogram data
    const values = results
      .map(r => Number(r[outputKey]))
      .filter(v => !isNaN(v))
    
    const histogramData = this.createHistogramData(values)

    // Create Chart.js histogram
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: histogramData.labels,
        datasets: [{
          label: outputKey,
          data: histogramData.data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Distribution of ${outputKey}`
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: outputKey
            }
          },
          y: {
            title: {
              display: true,
              text: 'Frequency'
            }
          }
        }
      }
    })

    this.charts.set(outputKey, chart)
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

  updateHistograms(results: Array<Record<string, any>>) {
    if (!results.length) return

    const outputKeys = Object.keys(results[0])
    outputKeys.forEach(key => {
      const chart = this.charts.get(key)
      if (chart) {
        const values = results
          .map(r => Number(r[key]))
          .filter(v => !isNaN(v))
        
        const histogramData = this.createHistogramData(values)
        chart.data.labels = histogramData.labels
        chart.data.datasets[0].data = histogramData.data
        chart.update('none') // No animation for smooth updates
      }
    })
  }


  clear() {
    // Destroy existing charts
    this.charts.forEach(chart => chart.destroy())
    this.charts.clear()
    
    // Clear container
    this.container.innerHTML = ''
  }
}