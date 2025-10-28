import { join } from 'node:path'
import { colorize, formatBytes, getFileSize, logError, logInfo, table } from '../utils'

interface StatsOptions {
  dir?: string
  verbose?: boolean
}

interface FileStats {
  path: string
  size: number
  lines: number
  words: number
  headings: number
  codeBlocks: number
}

/**
 * Count lines, words, and other metrics in a markdown file
 */
async function analyzeMarkdownFile(filePath: string): Promise<FileStats> {
  const content = await Bun.file(filePath).text()
  const lines = content.split('\n')

  // Count words (excluding code blocks)
  let wordCount = 0
  let inCodeBlock = false
  const contentLines: string[] = []

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    if (!inCodeBlock) {
      contentLines.push(line)
    }
  }

  const contentText = contentLines.join(' ')
  wordCount = contentText.split(/\s+/).filter(word => word.length > 0).length

  // Count headings
  const headings = lines.filter(line => line.match(/^#{1,6}\s+/)).length

  // Count code blocks
  const codeBlocks = (content.match(/```/g) || []).length / 2

  return {
    path: filePath,
    size: await getFileSize(filePath),
    lines: lines.length,
    words: wordCount,
    headings,
    codeBlocks: Math.floor(codeBlocks),
  }
}

/**
 * Show statistics about documentation content
 */
export async function statsCommand(options: StatsOptions = {}): Promise<boolean> {
  const docsDir = options.dir || './docs'
  const verbose = options.verbose || false

  try {
    console.log(colorize('\nAnalyzing documentation...\n', 'bold'))

    // Find all markdown files
    const { Glob } = await import('bun')
    const glob = new Glob('**/*.md')
    const files: FileStats[] = []

    for await (const file of glob.scan(docsDir)) {
      const filePath = join(docsDir, file)
      const stats = await analyzeMarkdownFile(filePath)
      files.push(stats)
    }

    if (files.length === 0) {
      logError('No markdown files found')
      return false
    }

    // Calculate totals
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    const totalLines = files.reduce((sum, f) => sum + f.lines, 0)
    const totalWords = files.reduce((sum, f) => sum + f.words, 0)
    const totalHeadings = files.reduce((sum, f) => sum + f.headings, 0)
    const totalCodeBlocks = files.reduce((sum, f) => sum + f.codeBlocks, 0)

    // Display summary
    console.log(colorize('Summary', 'bold'))
    console.log('─'.repeat(50))
    console.log(`Files:        ${files.length}`)
    console.log(`Total size:   ${formatBytes(totalSize)}`)
    console.log(`Total lines:  ${totalLines.toLocaleString()}`)
    console.log(`Total words:  ${totalWords.toLocaleString()}`)
    console.log(`Headings:     ${totalHeadings}`)
    console.log(`Code blocks:  ${totalCodeBlocks}`)
    console.log()

    // Display per-file stats if verbose
    if (verbose) {
      console.log(colorize('Per-file Statistics', 'bold'))
      console.log('─'.repeat(50))

      const tableData = files.map(f => ({
        'File': f.path.replace(`${docsDir}/`, ''),
        'Size': formatBytes(f.size),
        'Lines': f.lines,
        'Words': f.words,
        'Headings': f.headings,
        'Code Blocks': f.codeBlocks,
      }))

      table(tableData as any)
      console.log()
    }

    // Calculate averages
    const avgSize = totalSize / files.length
    const avgLines = totalLines / files.length
    const avgWords = totalWords / files.length

    console.log(colorize('Averages per File', 'bold'))
    console.log('─'.repeat(50))
    console.log(`Size:    ${formatBytes(avgSize)}`)
    console.log(`Lines:   ${Math.round(avgLines)}`)
    console.log(`Words:   ${Math.round(avgWords)}`)
    console.log()

    // Top files by size
    const topFiles = [...files]
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)

    if (topFiles.length > 0) {
      console.log(colorize('Top 5 Largest Files', 'bold'))
      console.log('─'.repeat(50))

      for (const file of topFiles) {
        const relativePath = file.path.replace(`${docsDir}/`, '')
        console.log(`  ${relativePath.padEnd(40)} ${formatBytes(file.size)}`)
      }

      console.log()
    }

    // Estimated reading time (average 200 words per minute)
    const readingTimeMinutes = Math.ceil(totalWords / 200)
    logInfo(`Estimated reading time: ${readingTimeMinutes} minutes`)

    return true
  }
  catch (err) {
    logError(`Failed to generate statistics: ${err}`)
    return false
  }
}
