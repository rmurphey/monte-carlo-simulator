/**
 * Centralized error handling utilities
 * Ensures all error arguments are always used and handled consistently
 */

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, formatError(error))
}

export function logWarning(context: string, error: unknown): void {
  console.warn(`[${context}]`, formatError(error))
}

export function createError(message: string, originalError: unknown): Error {
  const formattedError = formatError(originalError)
  return new Error(`${message}: ${formattedError}`)
}

export function handleFallback(context: string, error: unknown, fallbackMessage: string): string {
  logWarning(context, error)
  return fallbackMessage
}