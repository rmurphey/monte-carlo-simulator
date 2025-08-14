/**
 * Vite Integration Tests
 * Simplified tests for Vite development server functionality
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ChildProcess, spawn } from 'child_process'
import fetch from 'node-fetch'

describe('Vite Integration', () => {
  let viteProcess: ChildProcess
  const DEV_SERVER_URL = 'http://localhost:3001'  // Use different port to avoid conflicts
  const STARTUP_TIMEOUT = 15000

  beforeAll(async () => {
    // Start Vite development server on a different port
    console.log('🚀 Starting Vite development server on port 3001...')
    viteProcess = spawn('npx', ['vite', '--port', '3001'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      detached: false,
      env: { ...process.env, VITE_PORT: '3001' }
    })

    // Wait for server to be ready
    await waitForServer(DEV_SERVER_URL, STARTUP_TIMEOUT)
  }, STARTUP_TIMEOUT + 5000)

  afterAll(async () => {
    if (viteProcess) {
      console.log('🛑 Stopping Vite development server...')
      viteProcess.kill('SIGTERM')
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (!viteProcess.killed) {
        viteProcess.kill('SIGKILL')
      }
    }
  })

  it('should start Vite development server successfully', () => {
    expect(viteProcess).toBeDefined()
    expect(viteProcess.killed).toBe(false)
  })

  it('should serve HTML content at the dev server URL', async () => {
    const response = await fetch(DEV_SERVER_URL)
    expect(response.status).toBe(200)
    
    const html = await response.text()
    expect(html).toContain('Monte Carlo Simulation Studio')
    expect(html).toContain('Interactive parameter editing')
  })

  it('should serve TypeScript files transformed to JavaScript', async () => {
    const response = await fetch(`${DEV_SERVER_URL}/main.ts`)
    expect(response.status).toBe(200)
    
    const js = await response.text()
    expect(js).toContain('import') // Should contain ES module imports
    expect(js).toContain('WebSimulationEngine')
  })

  it('should serve static assets and dependencies', async () => {
    // Test framework dependencies
    const engineResponse = await fetch(`${DEV_SERVER_URL}/simulation-engine.ts`)
    expect(engineResponse.status).toBe(200)
    
    const formResponse = await fetch(`${DEV_SERVER_URL}/parameter-forms.ts`)
    expect(formResponse.status).toBe(200)
    
    const chartsResponse = await fetch(`${DEV_SERVER_URL}/charts.ts`)
    expect(chartsResponse.status).toBe(200)
  })

  it('should provide proper Content-Type headers for TypeScript files', async () => {
    const response = await fetch(`${DEV_SERVER_URL}/main.ts`)
    const contentType = response.headers.get('content-type')
    
    expect(contentType).toContain('javascript')  // Vite transforms TS to JS
  })

  it('should handle non-existent files appropriately', async () => {
    const response = await fetch(`${DEV_SERVER_URL}/definitely-does-not-exist.xyz`)
    // Vite may return 200 with HTML fallback or 404, both are acceptable
    expect([200, 404]).toContain(response.status)
  })

  it('should provide hot reload infrastructure', async () => {
    const response = await fetch(`${DEV_SERVER_URL}/@vite/client`)
    expect(response.status).toBe(200)
    
    // Vite client should be available for hot reload
    const viteClient = await response.text()
    expect(viteClient).toContain('HMR') // Hot Module Replacement
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