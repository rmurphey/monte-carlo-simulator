/**
 * Shared utilities for web components
 */

export function formatNumber(value: number): string {
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

export function getElementOrThrow(containerId: string): HTMLElement {
  const element = document.getElementById(containerId)
  if (!element) {
    throw new Error(`Container element ${containerId} not found`)
  }
  return element
}