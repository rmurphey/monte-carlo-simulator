/**
 * Statistics table display - reuses existing StatisticalAnalyzer output format
 */

import type { StatisticalSummary } from '../framework/types'

export class StatisticsTableManager {
  private container: HTMLElement

  constructor(containerId: string) {
    const element = document.getElementById(containerId)
    if (!element) {
      throw new Error(`Container element ${containerId} not found`)
    }
    this.container = element
  }

  displayTable(summary: Record<string, StatisticalSummary>) {
    this.container.innerHTML = ''

    if (!Object.keys(summary).length) return

    const table = document.createElement('table')
    table.className = 'statistics-table'

    // Header
    const header = table.createTHead()
    const headerRow = header.insertRow()
    const columns = ['Metric', 'Mean', 'Std Dev', 'Min', 'Max', 'P10', 'P90']
    columns.forEach(text => {
      const th = document.createElement('th')
      th.textContent = text
      headerRow.appendChild(th)
    })

    // Body
    const tbody = table.createTBody()
    Object.entries(summary).forEach(([key, stats]) => {
      const row = tbody.insertRow()
      row.insertCell().textContent = key
      row.insertCell().textContent = this.formatNumber(stats.mean)
      row.insertCell().textContent = this.formatNumber(stats.standardDeviation)
      row.insertCell().textContent = this.formatNumber(stats.min || 0)
      row.insertCell().textContent = this.formatNumber(stats.max || 0)
      row.insertCell().textContent = this.formatNumber(stats.percentile10 || 0)
      row.insertCell().textContent = this.formatNumber(stats.percentile90 || 0)
    })

    this.container.appendChild(table)
  }

  private formatNumber(value: number): string {
    if (Math.abs(value) >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M'
    } else if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1) + 'K'
    } else if (Math.abs(value) < 1) {
      return value.toFixed(3)
    } else {
      return value.toFixed(2)
    }
  }

  clear() {
    this.container.innerHTML = ''
  }
}