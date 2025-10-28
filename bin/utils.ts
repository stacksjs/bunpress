/**
 * CLI utility functions for colors, formatting, and common operations
 */

// ANSI color codes
export const colors = {
  reset: '\x1B[0m',
  bold: '\x1B[1m',
  dim: '\x1B[2m',

  // Foreground colors
  black: '\x1B[30m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
  cyan: '\x1B[36m',
  white: '\x1B[37m',
  gray: '\x1B[90m',

  // Background colors
  bgRed: '\x1B[41m',
  bgGreen: '\x1B[42m',
  bgYellow: '\x1B[43m',
  bgBlue: '\x1B[44m',
} as const

/**
 * Format text with color
 */
export function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`
}

/**
 * Log success message
 */
export function logSuccess(message: string): void {
  console.log(`${colors.green}✓${colors.reset} ${message}`)
}

/**
 * Log error message
 */
export function logError(message: string): void {
  console.error(`${colors.red}✗${colors.reset} ${message}`)
}

/**
 * Log warning message
 */
export function logWarning(message: string): void {
  console.warn(`${colors.yellow}⚠${colors.reset} ${message}`)
}

/**
 * Log info message
 */
export function logInfo(message: string): void {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`)
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0)
    return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

/**
 * Format milliseconds to human-readable time
 */
export function formatTime(ms: number): string {
  if (ms < 1000)
    return `${ms}ms`
  if (ms < 60000)
    return `${(ms / 1000).toFixed(2)}s`
  return `${(ms / 60000).toFixed(2)}m`
}

/**
 * Simple spinner for long-running operations
 */
export class Spinner {
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  private index = 0
  private interval: Timer | null = null
  private text: string

  constructor(text: string) {
    this.text = text
  }

  start(): void {
    process.stdout.write('\x1B[?25l') // Hide cursor

    this.interval = setInterval(() => {
      const frame = this.frames[this.index]
      process.stdout.write(`\r${colors.cyan}${frame}${colors.reset} ${this.text}`)
      this.index = (this.index + 1) % this.frames.length
    }, 80)
  }

  succeed(message?: string): void {
    this.stop()
    logSuccess(message || this.text)
  }

  fail(message?: string): void {
    this.stop()
    logError(message || this.text)
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    process.stdout.write('\r\x1B[K') // Clear line
    process.stdout.write('\x1B[?25h') // Show cursor
  }

  update(text: string): void {
    this.text = text
  }
}

/**
 * Prompt user for input
 */
export async function prompt(question: string, defaultValue?: string): Promise<string> {
  const displayDefault = defaultValue ? ` ${colors.dim}(${defaultValue})${colors.reset}` : ''
  process.stdout.write(`${colors.cyan}?${colors.reset} ${question}${displayDefault}: `)

  const reader = Bun.file('/dev/stdin').stream().getReader()
  const decoder = new TextDecoder()
  const { value } = await reader.read()

  const input = decoder.decode(value).trim()
  return input || defaultValue || ''
}

/**
 * Confirm prompt (yes/no)
 */
export async function confirm(question: string, defaultValue = false): Promise<boolean> {
  const defaultHint = defaultValue ? 'Y/n' : 'y/N'
  process.stdout.write(`${colors.cyan}?${colors.reset} ${question} ${colors.dim}(${defaultHint})${colors.reset}: `)

  const reader = Bun.file('/dev/stdin').stream().getReader()
  const decoder = new TextDecoder()
  const { value } = await reader.read()

  const input = decoder.decode(value).trim().toLowerCase()

  if (!input)
    return defaultValue
  return input === 'y' || input === 'yes'
}

/**
 * Display a table
 */
export function table(rows: Array<Record<string, string | number>>): void {
  if (rows.length === 0)
    return

  const keys = Object.keys(rows[0])
  const widths: Record<string, number> = {}

  // Calculate column widths
  for (const key of keys) {
    widths[key] = Math.max(
      key.length,
      ...rows.map(row => String(row[key]).length),
    )
  }

  // Print header
  const header = keys.map(key => key.padEnd(widths[key])).join('  ')
  console.log(colorize(header, 'bold'))
  console.log('─'.repeat(header.length))

  // Print rows
  for (const row of rows) {
    const line = keys.map(key => String(row[key]).padEnd(widths[key])).join('  ')
    console.log(line)
  }
}

/**
 * Check if a directory exists
 */
export async function dirExists(path: string): Promise<boolean> {
  try {
    const file = Bun.file(path)
    await file.exists()
    return true
  }
  catch {
    return false
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    const file = Bun.file(path)
    return await file.exists()
  }
  catch {
    return false
  }
}

/**
 * Get file size in bytes
 */
export async function getFileSize(path: string): Promise<number> {
  try {
    const file = Bun.file(path)
    return file.size
  }
  catch {
    return 0
  }
}
