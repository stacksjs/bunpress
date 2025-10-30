import { Glob } from 'bun'
import { copyFile, mkdir, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { CLI } from '@stacksjs/clapp'
import { version } from '../package.json'
import { config } from '../src/config'
import { serveCLI } from '../src/serve'
// import { markdown, stx } from '../src/plugin'

const cli: CLI = new CLI('bunpress')

interface CliOption {
  outdir?: string
  config?: string
  port?: number
  open?: boolean
  watch?: boolean
  verbose?: boolean
  dir?: string
  full?: boolean
  output?: string
}

const defaultOptions = {
  outdir: './dist',
  port: 3000,
  open: true,
  watch: true,
  verbose: config.verbose,
}

/**
 * Find all markdown files in the given directory
 */
export async function findMarkdownFiles(dir: string): Promise<string[]> {
  const mdGlob = new Glob('**/*.md')
  const markdownFiles: string[] = []

  for await (const file of mdGlob.scan(dir)) {
    markdownFiles.push(join(dir, file))
  }

  return markdownFiles
}

/**
 * Copy static assets from docs/public to the output directory
 */
async function copyStaticAssets(outdir: string, verbose: boolean = false): Promise<void> {
  const publicDir = './docs/public'

  try {
    // Check if public directory exists
    await readdir(publicDir)

    // Copy all files from public directory to output directory
    const publicGlob = new Glob('**/*')
    for await (const file of publicGlob.scan(publicDir)) {
      const sourcePath = join(publicDir, file)
      const targetPath = join(outdir, file)

      // Ensure target directory exists
      await mkdir(join(outdir, file.split('/').slice(0, -1).join('/')), { recursive: true })

      // Copy the file
      await copyFile(sourcePath, targetPath)
    }
  }
  catch {
    // Public directory doesn't exist, which is fine
    if (verbose) {
      console.log('No public directory found, skipping static assets copy')
    }
  }
}

/**
 * Build the documentation files
 */
export async function buildDocs(options: CliOption = {}): Promise<boolean> {
  const outdir = options.outdir || defaultOptions.outdir
  const verbose = options.verbose ?? defaultOptions.verbose

  // Ensure output directory exists
  await mkdir(outdir, { recursive: true })

  // Find all markdown files
  const docsDir = './docs'
  const markdownFiles = await findMarkdownFiles(docsDir)

  if (markdownFiles.length === 0) {
    console.log('No markdown files found in docs directory')
    return false
  }

  if (verbose) {
    console.log(`Found ${markdownFiles.length} markdown files:`)
    markdownFiles.forEach(file => console.log(`- ${file}`))
  }

  try {
    const result = await Bun.build({
      entrypoints: markdownFiles,
      outdir,
      // plugins: [markdown(), stx()],
    })

    if (!result.success) {
      console.error('Build failed:')
      for (const log of result.logs) {
        console.error(log)
      }
      return false
    }

    // Copy static assets from docs/public to output directory
    await copyStaticAssets(outdir, verbose)

    if (verbose) {
      console.log('Build successful!')
      console.log('Generated files:')
      for (const output of result.outputs) {
        console.log(`- ${output.path}`)
      }
    }

    // Create index.html for navigation
    await generateIndexHtml(outdir, markdownFiles)

    return true
  }
  catch (err) {
    console.error('Error during build:', err)
    return false
  }
}

/**
 * Generate an index.html file with links to all documentation pages
 */
async function generateIndexHtml(outdir: string, markdownFiles: string[]) {
  const linksList = markdownFiles.map((file) => {
    const relativePath = file.replace('./docs/', '')
    const htmlPath = relativePath.replace('.md', '.html')
    const name = relativePath.replace('.md', '').replace(/\.([^.]+)$/, '')
    // Capitalize first letter and replace dashes with spaces
    const displayName = name.charAt(0).toUpperCase()
      + name.slice(1).replace(/-/g, ' ')

    return `<li><a href="${htmlPath}">${displayName}</a></li>`
  }).join('\n      ')

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BunPress Documentation</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .markdown-body {
      padding: 1rem;
    }

    a {
      color: #1F1FE9;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    h1 {
      border-bottom: 1px solid #eaecef;
      padding-bottom: 0.3em;
    }

    ul {
      padding-left: 2rem;
    }

    li {
      margin-bottom: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="markdown-body">
    <h1>BunPress Documentation</h1>

    <p>Welcome to the BunPress documentation! BunPress is a modern documentation engine powered by Bun.</p>

    <h2>Documentation Pages</h2>

    <ul>
      ${linksList}
    </ul>

    <h2>About BunPress</h2>

    <p>BunPress is a documentation engine that converts Markdown files to HTML. It offers full customization of the generated HTML, including custom CSS, scripts, and templates.</p>

    <p>Visit the <a href="https://github.com/stacksjs/bunpress">GitHub repository</a> to learn more.</p>
  </div>
</body>
</html>`

  await Bun.write(join(outdir, 'index.html'), indexHtml)
}

/**
 * Generate LLM markdown file from all documentation
 */
async function generateLlmMarkdown(options: CliOption = {}): Promise<boolean> {
  const docsDir = options.dir || './docs'
  const outputFile = options.output || './docs.md'
  const full = options.full ?? false
  const verbose = options.verbose ?? defaultOptions.verbose

  if (verbose) {
    console.log(`Generating LLM markdown from ${docsDir}`)
    console.log(`Output file: ${outputFile}`)
    console.log(`Full content: ${full}`)
  }

  // Find all markdown files
  const markdownFiles = await findMarkdownFiles(docsDir)

  if (markdownFiles.length === 0) {
    console.log('No markdown files found in docs directory')
    return false
  }

  if (verbose) {
    console.log(`Found ${markdownFiles.length} markdown files`)
  }

  // Sort files for consistent output
  markdownFiles.sort()

  let output = '# Documentation\n\n'
  output += `Generated: ${new Date().toISOString()}\n\n`
  output += `Total files: ${markdownFiles.length}\n\n`
  output += '---\n\n'

  // Process each markdown file
  for (const filePath of markdownFiles) {
    const relativePath = filePath.replace(`${docsDir}/`, '')
    const fileContent = await Bun.file(filePath).text()

    if (verbose) {
      console.log(`Processing: ${relativePath}`)
    }

    output += `## File: ${relativePath}\n\n`

    if (full) {
      // Include full content
      output += fileContent
      output += '\n\n'
    }
    else {
      // Extract metadata and structure (titles and headings only)
      const lines = fileContent.split('\n')
      let inFrontmatter = false
      let frontmatterContent = ''

      for (const line of lines) {
        // Handle frontmatter
        if (line.trim() === '---') {
          if (!inFrontmatter) {
            inFrontmatter = true
            continue
          }
          else {
            inFrontmatter = false
            if (frontmatterContent) {
              output += '**Frontmatter:**\n```yaml\n'
              output += frontmatterContent
              output += '```\n\n'
              frontmatterContent = ''
            }
            continue
          }
        }

        if (inFrontmatter) {
          frontmatterContent += `${line}\n`
          continue
        }

        // Include headings for structure
        if (line.match(/^#{1,6}\s+/)) {
          output += `${line}\n`
        }
      }

      output += '\n'
    }

    output += '---\n\n'
  }

  // Write output file
  await Bun.write(outputFile, output)

  console.log(`\nLLM markdown generated successfully: ${outputFile}`)
  console.log(`Total size: ${(output.length / 1024).toFixed(2)} KB`)

  return true
}

cli
  .command('build', 'Build the documentation site')
  .option('--outdir <outdir>', 'Output directory', { default: defaultOptions.outdir })
  .option('--config <config>', 'Path to config file')
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    const success = await buildDocs(options)
    if (!success)
      process.exit(1)

    console.log('Documentation built successfully!')
  })

cli
  .command('dev', 'Build and serve documentation using BunPress server')
  .option('--port <port>', 'Port to listen on', { default: defaultOptions.port })
  .option('--dir <dir>', 'Documentation directory', { default: './docs' })
  .option('--watch', 'Watch for changes', { default: defaultOptions.watch })
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    const port = options.port || defaultOptions.port
    const root = options.dir || './docs'
    const watch = options.watch ?? defaultOptions.watch
    const verbose = options.verbose ?? defaultOptions.verbose

    if (verbose) {
      console.log('Starting BunPress dev server with options:', {
        port,
        root,
        watch,
        verbose,
      })
    }

    // Start the server using the serve.ts implementation
    await serveCLI({
      port,
      root,
      watch,
      config: config as any,
    })
  })

/**
 * Step 1: File discovery and reading from docs/
 * Reads all markdown files from the docs directory and extracts their content
 */
async function readDocsContent(docsDir: string, verbose: boolean = false): Promise<{
  files: Array<{ path: string, content: string, frontmatter: any }>
  totalSize: number
}> {
  const markdownFiles = await findMarkdownFiles(docsDir)

  if (verbose) {
    console.log(`Found ${markdownFiles.length} markdown files in ${docsDir}`)
  }

  const files = []
  let totalSize = 0

  for (const filePath of markdownFiles) {
    const content = await Bun.file(filePath).text()
    totalSize += content.length

    // Extract frontmatter if present
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?/
    const match = content.match(frontmatterRegex)
    let frontmatter = {}
    let mainContent = content

    if (match) {
      try {
        // Simple YAML parsing for frontmatter
        const yamlContent = match[1]
        frontmatter = yamlContent.split('\n').reduce((acc, line) => {
          const [key, ...valueParts] = line.split(':')
          if (key && valueParts.length > 0) {
            acc[key.trim()] = valueParts.join(':').trim()
          }
          return acc
        }, {} as any)
        mainContent = content.slice(match[0].length)
      } catch (error) {
        if (verbose) {
          console.warn(`Failed to parse frontmatter in ${filePath}`)
        }
      }
    }

    files.push({
      path: filePath.replace(`${docsDir}/`, ''),
      content: mainContent,
      frontmatter,
    })
  }

  return { files, totalSize }
}

/**
 * Step 2: Text summarization and transformation logic
 * Extracts key information and creates summaries from documentation
 */
function extractProjectInfo(files: Array<{ path: string, content: string, frontmatter: any }>) {
  // Extract project name and description from README or index
  const readme = files.find(f => f.path.toLowerCase().includes('readme') || f.path === 'index.md')
  let projectName = 'BunPress'
  let projectDescription = 'A modern documentation engine powered by Bun'
  let features: string[] = []
  let quickStart = ''

  if (readme) {
    // Extract title (first h1)
    const titleMatch = readme.content.match(/^#\s+(.+)$/m)
    if (titleMatch) {
      projectName = titleMatch[1].trim()
    }

    // Extract description (first paragraph after title)
    const descMatch = readme.content.match(/^#\s+.+$\n\n(.+?)(?:\n\n|$)/m)
    if (descMatch) {
      projectDescription = descMatch[1].trim()
    }

    // Extract features (look for ## Features section)
    const featuresMatch = readme.content.match(/##\s+Features\s*\n([\s\S]*?)(?=\n##|$)/i)
    if (featuresMatch) {
      features = featuresMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean)
    }

    // Extract quick start section
    const quickStartMatch = readme.content.match(/##\s+(?:Quick Start|Getting Started)\s*\n([\s\S]*?)(?=\n##|$)/i)
    if (quickStartMatch) {
      quickStart = quickStartMatch[1].trim()
    }
  }

  // Extract all headings for structure
  const allHeadings = files.flatMap(file => {
    const headings: Array<{ level: number, text: string, file: string }> = []
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    let match

    while ((match = headingRegex.exec(file.content)) !== null) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        file: file.path,
      })
    }

    return headings
  })

  return {
    projectName,
    projectDescription,
    features,
    quickStart,
    allHeadings,
    fileCount: files.length,
  }
}

/**
 * Generate short summary for llm.txt (under 500 tokens)
 */
function generateShortSummary(projectInfo: ReturnType<typeof extractProjectInfo>): string {
  const { projectName, projectDescription, features } = projectInfo

  let summary = `# ${projectName}\n\n${projectDescription}\n\n`

  if (features.length > 0) {
    summary += `## Key Features\n`
    // Limit to top 5 features for brevity
    features.slice(0, 5).forEach(feature => {
      summary += `- ${feature}\n`
    })
  }

  summary += `\n## Documentation Structure\n`
  summary += `This project contains ${projectInfo.fileCount} documentation files.\n`

  return summary
}

/**
 * Generate detailed context for llm-full.txt
 */
function generateFullContext(
  projectInfo: ReturnType<typeof extractProjectInfo>,
  files: Array<{ path: string, content: string, frontmatter: any }>
): string {
  const { projectName, projectDescription, features, quickStart, allHeadings } = projectInfo

  let context = `# ${projectName} - Complete Documentation Context\n\n`
  context += `${projectDescription}\n\n`

  if (features.length > 0) {
    context += `## Features\n`
    features.forEach(feature => {
      context += `- ${feature}\n`
    })
    context += '\n'
  }

  if (quickStart) {
    context += `## Quick Start\n${quickStart}\n\n`
  }

  context += `## Documentation Structure\n\n`
  context += `Total files: ${files.length}\n\n`

  // Group headings by file
  const fileStructure = files.map(file => {
    const fileHeadings = allHeadings.filter(h => h.file === file.path)
    if (fileHeadings.length === 0) return null

    let structure = `### ${file.path}\n`
    fileHeadings.forEach(heading => {
      const indent = '  '.repeat(heading.level - 1)
      structure += `${indent}- ${heading.text}\n`
    })
    return structure
  }).filter(Boolean)

  context += fileStructure.join('\n')

  context += `\n## Full Content\n\n`

  // Include full content of all files
  files.forEach(file => {
    context += `---\n\n### File: ${file.path}\n\n`
    if (Object.keys(file.frontmatter).length > 0) {
      context += `**Frontmatter:**\n\`\`\`yaml\n`
      Object.entries(file.frontmatter).forEach(([key, value]) => {
        context += `${key}: ${value}\n`
      })
      context += `\`\`\`\n\n`
    }
    context += file.content
    context += '\n\n'
  })

  return context
}

/**
 * Generate CLAUDE.md with instructions for Claude Sonnet 4.5
 */
function generateClaudeInstructions(projectInfo: ReturnType<typeof extractProjectInfo>): string {
  const { projectName, projectDescription } = projectInfo

  return `# Claude Instructions for ${projectName}

## Project Context
${projectDescription}

## Your Role
You are an expert AI assistant helping developers work on ${projectName}. You have deep knowledge of:
- Bun runtime and its ecosystem
- TypeScript and modern JavaScript
- Documentation engines and static site generators
- Markdown processing and syntax highlighting
- CLI development with Node.js/Bun

## Behavior Guidelines

### Tone & Style
- **Professional but friendly**: Clear technical communication without jargon overload
- **Solution-oriented**: Focus on actionable advice and working code
- **Educational**: Explain concepts when relevant, don't just provide answers
- **Efficient**: Respect the developer's time with concise responses

### Capabilities
✅ **You CAN:**
- Explain how BunPress works internally
- Help debug issues with markdown processing
- Suggest improvements to the codebase
- Write new features or fix bugs
- Optimize performance
- Improve documentation
- Add new CLI commands
- Extend markdown syntax support

❌ **You SHOULD NOT:**
- Suggest migrating away from Bun to Node.js
- Recommend complex frameworks when simple solutions exist
- Break backward compatibility without strong justification
- Add features that conflict with VitePress compatibility
- Over-engineer solutions

### Decision-Making Framework
When helping with ${projectName}:

1. **Understand the goal**: What is the developer trying to achieve?
2. **Check existing patterns**: How does the codebase handle similar cases?
3. **Consider alternatives**: What are the trade-offs?
4. **Prioritize simplicity**: Simple, maintainable code > clever code
5. **Think about users**: How does this affect documentation authors?

### Code Quality Standards
- Type safety: Use TypeScript types, avoid \`any\`
- Error handling: Always handle edge cases and errors gracefully
- Performance: Consider build time and runtime performance
- Readability: Code should be self-explanatory
- Testing: Suggest tests for complex logic

### Common Scenarios

#### Adding a New Markdown Feature
1. Check if VitePress supports it (maintain compatibility)
2. Implement in \`/src/serve.ts\` markdown processing
3. Add CSS styles to \`/src/config.ts\`
4. Update TypeScript types in \`/src/types.ts\`
5. Document the feature

#### Debugging Build Issues
1. Check the CLI command in \`/bin/cli.ts\`
2. Verify markdown file processing in \`/src/serve.ts\`
3. Inspect template rendering in \`/src/template-loader.ts\`
4. Review configuration in \`bunpress.config.ts\`

#### Performance Optimization
1. Profile the slow operation
2. Check if Bun has native APIs for the task
3. Consider caching strategies
4. Optimize regex patterns and string operations
5. Minimize file I/O operations

## Knowledge Boundaries

### What You Know Well
- Bun runtime features and APIs
- TypeScript best practices
- Markdown processing and extensions
- Static site generation patterns
- CLI development
- Template systems

### What You Should Research
- Specific VitePress features not yet implemented
- New Bun APIs in recent versions
- Third-party plugin compatibility
- Specific user's custom configuration needs

## Interaction Guidelines

### When Answering Questions
1. Acknowledge the question clearly
2. Provide context if needed
3. Give a direct answer with code examples
4. Explain trade-offs or alternatives
5. Suggest next steps or related improvements

### When Writing Code
1. Follow existing code style and patterns
2. Add comments for complex logic
3. Include error handling
4. Consider edge cases
5. Make it easy to test

### When Suggesting Changes
1. Explain the problem being solved
2. Show the proposed solution
3. Discuss potential impacts
4. Provide migration path if breaking
5. Consider documentation updates

## Success Metrics
You're doing well when:
- Developers can quickly understand and implement your suggestions
- Code changes integrate smoothly with existing patterns
- Solutions are performant and maintainable
- Documentation authors have a better experience
- The project moves forward without breaking changes
`
}

/**
 * Generate AGENT.md with general AI agent instructions
 */
function generateAgentInstructions(projectInfo: ReturnType<typeof extractProjectInfo>): string {
  const { projectName, projectDescription } = projectInfo

  return `# AI Agent Instructions for ${projectName}

## Project Overview
${projectDescription}

This is a documentation engine built with Bun, inspired by VitePress. It transforms markdown files into beautiful, fast documentation websites.

## Domain Knowledge

### Core Technologies
- **Bun**: Modern JavaScript runtime (faster alternative to Node.js)
- **TypeScript**: Strongly-typed JavaScript for better DX
- **Markdown**: Content format with extended syntax support
- **Static Site Generation**: Build-time rendering for performance

### Architecture Components
1. **CLI** (\`/bin/cli.ts\`): Command-line interface with build, dev, and llm commands
2. **Config** (\`/src/config.ts\`): Default configuration and settings
3. **Serve** (\`/src/serve.ts\`): Development server with hot reload
4. **Templates** (\`/src/templates/\`): STX template files for layouts
5. **TOC** (\`/src/toc.ts\`): Table of contents generation
6. **Highlighter** (\`/src/highlighter.ts\`): Syntax highlighting for code blocks

## Agent Behavior

### Tone & Style
- **Professional but friendly**: Clear technical communication without jargon overload
- **Solution-oriented**: Focus on actionable advice and working code
- **Educational**: Explain concepts when relevant, don't just provide answers
- **Efficient**: Respect the developer's time with concise responses

### Capabilities
✅ **You CAN:**
- Explain how BunPress works internally
- Help debug issues with markdown processing
- Suggest improvements to the codebase
- Write new features or fix bugs
- Optimize performance
- Improve documentation
- Add new CLI commands
- Extend markdown syntax support

❌ **You SHOULD NOT:**
- Suggest migrating away from Bun to Node.js
- Recommend complex frameworks when simple solutions exist
- Break backward compatibility without strong justification
- Add features that conflict with VitePress compatibility
- Over-engineer solutions

### Decision-Making Framework
When helping with ${projectName}:

1. **Understand the goal**: What is the developer trying to achieve?
2. **Check existing patterns**: How does the codebase handle similar cases?
3. **Consider alternatives**: What are the trade-offs?
4. **Prioritize simplicity**: Simple, maintainable code > clever code
5. **Think about users**: How does this affect documentation authors?

### Code Quality Standards
- Type safety: Use TypeScript types, avoid \`any\`
- Error handling: Always handle edge cases and errors gracefully
- Performance: Consider build time and runtime performance
- Readability: Code should be self-explanatory
- Testing: Suggest tests for complex logic

### Common Scenarios

#### Adding a New Markdown Feature
1. Check if VitePress supports it (maintain compatibility)
2. Implement in \`/src/serve.ts\` markdown processing
3. Add CSS styles to \`/src/config.ts\`
4. Update TypeScript types in \`/src/types.ts\`
5. Document the feature

#### Debugging Build Issues
1. Check the CLI command in \`/bin/cli.ts\`
2. Verify markdown file processing in \`/src/serve.ts\`
3. Inspect template rendering in \`/src/template-loader.ts\`
4. Review configuration in \`bunpress.config.ts\`

#### Performance Optimization
1. Profile the slow operation
2. Check if Bun has native APIs for the task
3. Consider caching strategies
4. Optimize regex patterns and string operations
5. Minimize file I/O operations

## Knowledge Boundaries

### What You Know Well
- Bun runtime features and APIs
- TypeScript best practices
- Markdown processing and extensions
- Static site generation patterns
- CLI development
- Template systems

### What You Should Research
- Specific VitePress features not yet implemented
- New Bun APIs in recent versions
- Third-party plugin compatibility
- Specific user's custom configuration needs

## Interaction Guidelines

### When Answering Questions
1. Acknowledge the question clearly
2. Provide context if needed
3. Give a direct answer with code examples
4. Explain trade-offs or alternatives
5. Suggest next steps or related improvements

### When Writing Code
1. Follow existing code style and patterns
2. Add comments for complex logic
3. Include error handling
4. Consider edge cases
5. Make it easy to test

### When Suggesting Changes
1. Explain the problem being solved
2. Show the proposed solution
3. Discuss potential impacts
4. Provide migration path if breaking
5. Consider documentation updates

## Success Metrics
You're doing well when:
- Developers can quickly understand and implement your suggestions
- Code changes integrate smoothly with existing patterns
- Solutions are performant and maintainable
- Documentation authors have a better experience
- The project moves forward without breaking changes
`
}

/**
 * Step 3: File generation and output
 * Writes the generated content to files in the project root
 */
async function generateLlmFiles(options: CliOption = {}): Promise<boolean> {
  const docsDir = options.dir || './docs'
  const verbose = options.verbose ?? defaultOptions.verbose

  if (verbose) {
    console.log('Starting LLM files generation...')
    console.log(`Reading documentation from: ${docsDir}`)
  }

  try {
    // Step 1: Read all documentation files
    const { files, totalSize } = await readDocsContent(docsDir, verbose)

    if (files.length === 0) {
      console.log('No markdown files found in docs directory')
      return false
    }

    if (verbose) {
      console.log(`Processed ${files.length} files (${(totalSize / 1024).toFixed(2)} KB total)`)
    }

    // Step 2: Extract and transform content
    const projectInfo = extractProjectInfo(files)

    if (verbose) {
      console.log(`Project: ${projectInfo.projectName}`)
      console.log(`Features found: ${projectInfo.features.length}`)
    }

    // Step 3: Generate each file
    const outputs = [
      {
        filename: 'llm.txt',
        content: generateShortSummary(projectInfo),
        description: 'Short summary for LLM initialization',
      },
      {
        filename: 'llm-full.txt',
        content: generateFullContext(projectInfo, files),
        description: 'Complete context for fine-tuned reasoning',
      },
      {
        filename: 'CLAUDE.md',
        content: generateClaudeInstructions(projectInfo),
        description: 'Claude Sonnet 4.5 behavior instructions',
      },
      {
        filename: 'AGENT.md',
        content: generateAgentInstructions(projectInfo),
        description: 'General AI agent behavior instructions',
      },
    ]

    // Write all files
    for (const output of outputs) {
      await Bun.write(output.filename, output.content)

      if (verbose) {
        const size = (output.content.length / 1024).toFixed(2)
        console.log(`✓ Generated ${output.filename} (${size} KB) - ${output.description}`)
      }
    }

    console.log('\n✨ Successfully generated all LLM context files!')
    console.log('\nGenerated files:')
    outputs.forEach(output => {
      console.log(`  - ${output.filename}`)
    })

    return true
  }
  catch (error) {
    console.error('Error generating LLM files:', error)
    return false
  }
}

cli
  .command('llm', 'Generate LLM-friendly markdown file from documentation')
  .option('--dir <dir>', 'Documentation directory', { default: './docs' })
  .option('--output <output>', 'Output file path', { default: './docs.md' })
  .option('--full', 'Include full content (not just titles and headings)', { default: false })
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    const success = await generateLlmMarkdown(options)
    if (!success)
      process.exit(1)
  })

cli
  .command('generate:llm-files', 'Generate LLM context files (llm.txt, llm-full.txt, CLAUDE.md, AGENT.md)')
  .option('--dir <dir>', 'Documentation directory', { default: './docs' })
  .option('--verbose', 'Enable verbose logging', { default: defaultOptions.verbose })
  .action(async (options: CliOption) => {
    const success = await generateLlmFiles(options)
    if (!success)
      process.exit(1)
  })

cli.help()
cli.version(version)
cli.parse()
