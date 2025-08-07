// CLI testing setup
import { vi } from 'vitest'

// Global type declarations for CLI testing
declare global {
  var _mockStdout: {
    write: ReturnType<typeof vi.fn>
    clearLine: ReturnType<typeof vi.fn>
    cursorTo: ReturnType<typeof vi.fn>
  }
  var _mockStdin: {
    setRawMode: ReturnType<typeof vi.fn>
    resume: ReturnType<typeof vi.fn>
    pause: ReturnType<typeof vi.fn>
    on: ReturnType<typeof vi.fn>
    removeListener: ReturnType<typeof vi.fn>
  }
}

// Mock process.stdout for CLI output testing
globalThis._mockStdout = {
  write: vi.fn(),
  clearLine: vi.fn(),
  cursorTo: vi.fn()
}

// Mock process.stdin for CLI input testing  
globalThis._mockStdin = {
  setRawMode: vi.fn(),
  resume: vi.fn(),
  pause: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn()
}

// Mock filesystem operations for consistent testing
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs')
  return {
    ...actual,
    promises: {
      writeFile: vi.fn(),
      readFile: vi.fn(),
      mkdir: vi.fn(),
      access: vi.fn(),
      readdir: vi.fn(),
      stat: vi.fn(),
      unlink: vi.fn(),
      copyFile: vi.fn()
    }
  }
})

// Mock inquirer for CLI input testing
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn()
  }
}))