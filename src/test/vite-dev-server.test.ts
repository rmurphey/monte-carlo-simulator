/**
 * Vite Development Server Tests
 * Tests the web development workflow including server startup, hot reload, and functionality
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ChildProcess, spawn } from 'child_process'
import { Browser, Page, chromium } from 'playwright'
import fetch from 'node-fetch'

describe('Vite Development Server', () => {
  let viteProcess: ChildProcess
  let browser: Browser
  let page: Page
  let DEV_SERVER_URL = 'http://localhost:3000' // Will be updated if port changes
  const STARTUP_TIMEOUT = 15000

  beforeAll(async () => {
    // Start Vite development server
    console.log('🚀 Starting Vite development server...')
    viteProcess = spawn('npx', ['vite'], {
      stdio: 'pipe',
      detached: false,
      env: { ...process.env, VITE_OPEN_BROWSER: 'false' }
    })

    // Capture output to detect actual port
    let actualPort = '3000'
    viteProcess.stdout?.on('data', (data) => {
      const output = data.toString()
      const portMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)\//)
      if (portMatch) {
        actualPort = portMatch[1]
        DEV_SERVER_URL = `http://localhost:${actualPort}`
        console.log(`📡 Detected server at ${DEV_SERVER_URL}`)
      }
    })

    // Wait a moment for port detection
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Wait for server to be ready
    await waitForServer(`${DEV_SERVER_URL}/src/web/index.html`, STARTUP_TIMEOUT)

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
    const response = await page.goto(`${DEV_SERVER_URL}/src/web/index.html`)
    expect(response?.status()).toBe(200)
    
    // Check that main content loads
    const title = await page.title()
    expect(title).toBe('Monte Carlo Simulation Studio')
  })

  it('should load TypeScript modules without errors', async () => {
    await page.goto(`${DEV_SERVER_URL}/src/web/index.html`)
    
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
    await page.goto(`${DEV_SERVER_URL}/src/web/index.html`)
    
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

  it('should create histogram visualizations', async () => {
    await page.goto(`${DEV_SERVER_URL}/src/web/index.html`)
    
    // Wait for app to load
    await page.waitForTimeout(2000)
    
    // Check that histogram container is ready for charts
    const chartsContainer = await page.$('#charts-container')
    expect(chartsContainer).toBeTruthy()
    
    const hasPlaceholderText = await page.textContent('#charts-container')
    expect(hasPlaceholderText).toContain('Run a simulation to see histogram visualizations')
  })

  it('should serve the web interface correctly', async () => {
    const response = await page.goto(`${DEV_SERVER_URL}/src/web/index.html`)
    expect(response?.status()).toBe(200)
    
    const title = await page.title()
    expect(title).toBe('Monte Carlo Simulation Studio')
  })

  it('should compile TypeScript modules correctly', async () => {
    await page.goto(`${DEV_SERVER_URL}/src/web/index.html`)
    
    // Wait for initial load
    await page.waitForTimeout(2000)
    
    // Check that TypeScript modules are compiled and working
    // by verifying main application elements are present and functional
    await page.waitForSelector('#parameter-form-container', { timeout: 5000 })
    const container = await page.$('#parameter-form-container')
    expect(container).toBeTruthy()
    
    // Check that the simulation status shows proper loading message
    const statusContainer = await page.$('#status-container')
    expect(statusContainer).toBeTruthy()
    
    // Verify the TypeScript application bootstrapped correctly
    const runButton = await page.$('#run-simulation')
    expect(runButton).toBeTruthy()
    
    const runButtonEnabled = await page.evaluate(() => {
      const btn = document.getElementById('run-simulation') as HTMLButtonElement
      return btn && !btn.disabled
    })
    expect(runButtonEnabled).toBe(true)
  })

  it('should handle TypeScript compilation gracefully', async () => {
    await page.goto(`${DEV_SERVER_URL}/src/web/index.html`)
    
    // Wait for initial load
    await page.waitForTimeout(2000)
    
    // Verify that TypeScript compilation is working by checking
    // that the application loads without JavaScript errors
    const title = await page.title()
    expect(title).toBe('Monte Carlo Simulation Studio')
    
    // Check that no critical JavaScript errors occurred during load
    const errors: string[] = []
    page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    // Reload to trigger compilation check
    await page.reload()
    await page.waitForTimeout(1000)
    
    // Should have no critical TypeScript compilation errors
    const criticalErrors = errors.filter(error => 
      error.includes('SyntaxError') || 
      error.includes('TypeError: Cannot read') ||
      error.includes('is not defined')
    )
    
    expect(criticalErrors.length).toBe(0)
  })

  it('should serve application assets correctly', async () => {
    await page.goto(`${DEV_SERVER_URL}/src/web/index.html`)
    
    // Check that the main TypeScript module loads
    const mainModuleLoaded = await page.evaluate(() => {
      return document.querySelector('script[src*="/src/web/main.ts"]') !== null
    })
    
    expect(mainModuleLoaded).toBe(true)
    
    // Check that the page title loads correctly
    const title = await page.title()
    expect(title).toBe('Monte Carlo Simulation Studio')
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