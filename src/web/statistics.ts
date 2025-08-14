/**
 * Statistics table display - reuses existing StatisticalAnalyzer output format
 */

import type { StatisticalSummary } from '../framework/types'
import { formatNumber, getElementOrThrow } from './utils'

export class Statistics {
  private container: HTMLElement

  constructor(containerId: string) {
    this.container = getElementOrThrow(containerId)
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
      row.insertCell().textContent = formatNumber(stats.mean)
      row.insertCell().textContent = formatNumber(stats.standardDeviation)
      row.insertCell().textContent = formatNumber(stats.min || 0)
      row.insertCell().textContent = formatNumber(stats.max || 0)
      row.insertCell().textContent = formatNumber(stats.percentile10 || 0)
      row.insertCell().textContent = formatNumber(stats.percentile90 || 0)
    })

    this.container.appendChild(table)
  }


  clear() {
    this.container.innerHTML = ''
  }
}