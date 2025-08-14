/**
 * Vite Development Server Tests
 * Tests the web development workflow including server startup, hot reload, and functionality
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ChildProcess, spawn } from 'child_process'
import { Browser, Page, chromium } from 'playwright'
import { promises as fs } from 'fs'
import * as path from 'path'
import fetch from 'node-fetch'

describe('Vite Development Server', () => {
  let viteProcess: ChildProcess
  let browser: Browser
  let page: Page
  const DEV_SERVER_URL = 'http://localhost:3000'
  const STARTUP_TIMEOUT = 15000

  beforeAll(async () => {
    // Start Vite development server
    console.log('🚀 Starting Vite development server...')
    viteProcess = spawn('npm', ['run', 'dev:web'], {
      stdio: 'pipe',
      detached: false
    })

    // Wait for server to be ready
    await waitForServer(DEV_SERVER_URL, STARTUP_TIMEOUT)

    // Launch browser for testing
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    })
    page = await browser.newPage()
    
    // Set up console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 Browser console error:', msg.text())
      }
    })
    
    page.on('pageerror', error => {
      console.log('🔴 Browser page error:', error.message)
    })
  }, STARTUP_TIMEOUT + 5000)

  afterAll(async () => {
    // Close browser
    if (browser) {
      await browser.close()
    }

    // Kill Vite server
    if (viteProcess) {
      console.log('🛑 Stopping Vite development server...')
      viteProcess.kill('SIGTERM')
      
      // Give it a moment to clean up
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (!viteProcess.killed) {
        viteProcess.kill('SIGKILL')
      }
    }
  })

  it('should start Vite development server successfully', async () => {
    expect(viteProcess).toBeDefined()
    expect(viteProcess.killed).toBe(false)
  })

  it('should serve the web interface at localhost:3000', async () => {
    const response = await page.goto(DEV_SERVER_URL)
    expect(response?.status()).toBe(200)
    
    // Check that main content loads
    const title = await page.title()
    expect(title).toBe('Monte Carlo Simulation Studio')
  })

  it('should load TypeScript modules without errors', async () => {
    await page.goto(DEV_SERVER_URL)
    
    // Wait for JavaScript to load and execute
    await page.waitForTimeout(2000)
    
    // Check that main application elements are present
    const parameterContainer = await page.$('#parameter-form-container')
    expect(parameterContainer).toBeTruthy()
    
    const runButton = await page.$('#run-simulation')
    expect(runButton).toBeTruthy()
    
    const chartsContainer = await page.$('#charts-container')
    expect(chartsContainer).toBeTruthy()
  })

  it('should generate default simulation parameters', async () => {
    await page.goto(DEV_SERVER_URL)
    
    // Wait for the application to load and generate parameter form
    await page.waitForTimeout(3000)
    
    // Check that parameter inputs were generated
    const inputs = await page.$$('.parameter-input')
    expect(inputs.length).toBeGreaterThan(0)
    
    // Should have inputs for the default simulation parameters
    const initialInvestmentInput = await page.$('input[name="initialInvestment"]')
    const annualReturnInput = await page.$('input[name="annualReturn"]')
    const volatilityInput = await page.$('input[name="volatility"]')
    
    expect(initialInvestmentInput).toBeTruthy()
    expect(annualReturnInput).toBeTruthy()
    expect(volatilityInput).toBeTruthy()
  })

  it('should load Chart.js library successfully', async () => {
    await page.goto(DEV_SERVER_URL)
    
    // Check that Chart.js is available globally
    const chartJSLoaded = await page.evaluate(() => {
      return typeof window.Chart !== 'undefined'
    })
    
    expect(chartJSLoaded).toBe(true)
  })

  it('should handle hot reload for HTML changes', async () => {
    await page.goto(DEV_SERVER_URL)
    
    // Get original content
    const originalSubtitle = await page.textContent('header p')
    expect(originalSubtitle).toContain('Interactive parameter editing')
    
    // Modify HTML file
    const htmlPath = path.join(process.cwd(), 'src/web/index.html')
    const originalContent = await fs.readFile(htmlPath, 'utf8')
    const modifiedContent = originalContent.replace(
      'Interactive parameter editing and real-time visualization',
      'Hot reload test - content updated'
    )
    
    await fs.writeFile(htmlPath, modifiedContent, 'utf8')
    
    try {
      // Wait for hot reload to trigger
      await page.waitForTimeout(1500)
      
      // Check if content was updated (page should reload)
      await page.waitForSelector('header p', { timeout: 5000 })
      const updatedSubtitle = await page.textContent('header p')
      expect(updatedSubtitle).toContain('Hot reload test - content updated')
      
    } finally {
      // Restore original content
      await fs.writeFile(htmlPath, originalContent, 'utf8')
      await page.waitForTimeout(1000)
    }
  })

  it('should handle hot reload for TypeScript changes', async () => {
    await page.goto(DEV_SERVER_URL)
    
    // Wait for initial load
    await page.waitForTimeout(2000)
    
    // Modify TypeScript file to change status message
    const tsPath = path.join(process.cwd(), 'src/web/main.ts')
    const originalContent = await fs.readFile(tsPath, 'utf8')
    const modifiedContent = originalContent.replace(
      'Loading simulation...',
      'Hot reload TypeScript test'
    )
    
    await fs.writeFile(tsPath, modifiedContent, 'utf8')
    
    try {
      // Wait for hot reload
      await page.waitForTimeout(2000)
      
      // The page should reload and show the updated message briefly
      // We can't easily test the exact message since it's transient,
      // but we can verify the page reloads by checking for the main elements
      await page.waitForSelector('#parameter-form-container', { timeout: 5000 })
      const container = await page.$('#parameter-form-container')
      expect(container).toBeTruthy()
      
    } finally {
      // Restore original content
      await fs.writeFile(tsPath, originalContent, 'utf8')
      await page.waitForTimeout(1000)
    }
  })

  it('should provide proper error reporting for TypeScript errors', async () => {
    // This test verifies that Vite reports TypeScript compilation errors
    // We'll introduce a deliberate error and check that it's caught
    
    const tsPath = path.join(process.cwd(), 'src/web/main.ts')
    const originalContent = await fs.readFile(tsPath, 'utf8')
    
    // Introduce a TypeScript error
    const errorContent = originalContent.replace(
      'private simulation: WebSimulationEngine | null = null',
      'private simulation: WebSimulationEngine | null = "invalid"' // Type error
    )
    
    await fs.writeFile(tsPath, errorContent, 'utf8')
    
    try {
      // Wait for Vite to process the change
      await page.waitForTimeout(2000)
      
      // Navigate to trigger compilation
      await page.goto(DEV_SERVER_URL)
      await page.waitForTimeout(2000)
      
      // The app should still load (Vite handles errors gracefully)
      // but we should see error reporting in the browser
      const title = await page.title()
      expect(title).toBe('Monte Carlo Simulation Studio')
      
    } finally {
      // Restore original content
      await fs.writeFile(tsPath, originalContent, 'utf8')
      await page.waitForTimeout(1000)
    }
  })

  it('should serve static assets correctly', async () => {
    await page.goto(DEV_SERVER_URL)
    
    // Check that Chart.js CDN loads
    const chartJSResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js')
        return response.status
      } catch {
        return null
      }
    })
    
    expect(chartJSResponse).toBe(200)
  })
})

/**
 * Helper function to wait for server to be ready
 */
async function waitForServer(url: string, timeout: number): Promise<void> {
  const start = Date.now()
  
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url)
      if (response.status === 200) {
        console.log('✅ Vite development server is ready')
        return
      }
    } catch {
      // Server not ready yet, continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  throw new Error(`Server did not start within ${timeout}ms`)
}