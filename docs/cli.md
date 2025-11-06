# CLI Commands Reference

BunPress provides a comprehensive command-line interface for managing your documentation projects. This guide covers all 15+ commands available.

## Installation

After installing BunPress, the `bunpress` command is available globally:

```bash
bun add @stacksjs/bunpress
# or
npm install @stacksjs/bunpress
```

## Command Overview

```bash
bunpress --help        # Show all available commands
bunpress --version     # Show BunPress version
```

## Core Commands

### init

Initialize a new BunPress documentation project with default structure and configuration.

**Usage:**
```bash
bunpress init [options]
```

**Options:**
- `--name <name>` - Project name (default: current directory name)
- `--template <template>` - Template to use (default, minimal)
- `--force` - Overwrite existing files without prompting

**Examples:**
```bash
# Initialize with default settings
bunpress init

# Initialize with custom name
bunpress init --name "My Documentation"

# Force overwrite existing files
bunpress init --force
```

**What it creates:**
- `docs/` directory with sample files
- `bunpress.config.ts` configuration file
- `.gitignore` with appropriate ignores
- `README.md` with quick start guide
- Sample markdown files (index.md, guide/index.md)

---

### dev

Start the development server with hot reload for rapid documentation development.

**Usage:**
```bash
bunpress dev [options]
```

**Options:**
- `--port <port>` - Port to listen on (default: 3000)
- `--dir <dir>` - Documentation directory (default: ./docs)
- `--watch` - Enable file watching (default: true)
- `--verbose` - Enable verbose logging

**Examples:**
```bash
# Start dev server on default port
bunpress dev

# Use custom port
bunpress dev --port 4000

# Use custom docs directory
bunpress dev --dir ./documentation

# Enable verbose logging
bunpress dev --verbose
```

**Features:**
- Hot module replacement
- Instant markdown processing
- Error overlay
- Automatic page reload
- ~100ms startup time

---

### build

Build the documentation site for production deployment.

**Usage:**
```bash
bunpress build [options]
```

**Options:**
- `--outdir <outdir>` - Output directory (default: ./dist)
- `--dir <dir>` - Documentation directory (default: ./docs)
- `--config <config>` - Path to config file
- `--minify` - Minify output files
- `--sourcemap` - Generate source maps for debugging
- `--watch` - Watch for changes and rebuild
- `--verbose` - Enable verbose logging

**Examples:**
```bash
# Standard production build
bunpress build

# Build with minification
bunpress build --minify

# Build with source maps for debugging
bunpress build --sourcemap

# Build and watch for changes
bunpress build --watch

# Custom output directory
bunpress build --outdir ./public
```

**Output:**
- Optimized HTML files
- Minified CSS and JavaScript
- Static assets copied from `docs/public/`
- SEO files (sitemap.xml, robots.txt, feed.xml)
- Build time statistics

---

### preview

Preview the production build locally before deployment.

**Usage:**
```bash
bunpress preview [options]
```

**Options:**
- `--port <port>` - Port to listen on (default: 3000)
- `--outdir <outdir>` - Output directory to serve (default: ./dist)
- `--open` - Open browser automatically

**Examples:**
```bash
# Preview on default port
bunpress preview

# Preview on custom port
bunpress preview --port 8080

# Open browser automatically
bunpress preview --open
```

**Features:**
- Static file server
- Proper MIME types
- 404 handling
- Production-like environment

---

## Content Management

### new

Create a new markdown file with frontmatter and structure based on templates.

**Usage:**
```bash
bunpress new <path> [options]
```

**Options:**
- `--title <title>` - Page title (default: derived from path)
- `--template <template>` - Template to use (default, guide, api, blog)

**Templates:**
- `default` - Standard documentation page
- `guide` - Tutorial/guide format with step-by-step sections
- `api` - API reference format with parameters and examples
- `blog` - Blog post format with date and author

**Examples:**
```bash
# Create with default template
bunpress new getting-started

# Create with custom title
bunpress new api/authentication --title "Authentication Guide"

# Create nested path
bunpress new guides/advanced/deployment

# Use guide template
bunpress new tutorials/first-steps --template guide

# Use API template
bunpress new api/endpoints --template api

# Use blog template
bunpress new blog/announcing-v2 --template blog
```

**Generated structure:**
```markdown
---
title: Your Title
description: Auto-generated description
layout: doc
---

# Your Title

Content starts here...
```

---

## Maintenance Commands

### clean

Remove build artifacts and clean up the output directory.

**Usage:**
```bash
bunpress clean [options]
```

**Options:**
- `--outdir <outdir>` - Output directory to clean (default: ./dist)
- `--force` - Skip confirmation prompt
- `--verbose` - Show detailed cleanup information

**Examples:**
```bash
# Clean with confirmation
bunpress clean

# Force clean without confirmation
bunpress clean --force

# Clean custom output directory
bunpress clean --outdir ./public
```

**What it removes:**
- All files in output directory
- Generated HTML files
- Copied assets
- SEO files (sitemap, robots.txt)

---

### doctor

Run diagnostic checks to identify common project issues and configuration problems.

**Usage:**
```bash
bunpress doctor [options]
```

**Options:**
- `--verbose` - Show detailed diagnostic information

**Checks performed:**
- ✓ Bun runtime version compatibility
- ✓ Configuration file exists and is valid
- ✓ Documentation directory exists
- ✓ Markdown files present
- ✓ package.json scripts configured
- ✓ Dependencies installed correctly
- ✓ Git repository initialized
- ✓ TypeScript configuration valid

**Examples:**
```bash
# Run all diagnostics
bunpress doctor

# Verbose output with details
bunpress doctor --verbose
```

**Output example:**
```
✓ Bun runtime version: 1.3.1 (compatible)
✓ Configuration file found: bunpress.config.ts
✓ Documentation directory: ./docs (23 files)
✓ Dependencies installed correctly
✗ Git repository not initialized
  → Run: git init

Diagnostics complete: 5/6 checks passed
```

---

### stats

Show comprehensive statistics about your documentation project.

**Usage:**
```bash
bunpress stats [options]
```

**Options:**
- `--dir <dir>` - Documentation directory (default: ./docs)
- `--verbose` - Show per-file breakdown with detailed stats

**Displays:**
- Total number of markdown files
- Total size and lines of documentation
- Word count and reading time estimate
- Number of headings and code blocks
- Top largest files
- Average file metrics

**Examples:**
```bash
# Show summary statistics
bunpress stats

# Show detailed per-file stats
bunpress stats --verbose

# Stats for custom directory
bunpress stats --dir ./documentation
```

**Output example:**
```
Documentation Statistics

Files:        23 markdown files
Total Size:   145.2 KB
Total Lines:  3,456 lines
Word Count:   12,345 words
Reading Time: ~62 minutes

Headings:     234 (H1: 23, H2: 89, H3: 122)
Code Blocks:  156 code samples

Top 5 Largest Files:
1. advanced.md        (23.4 KB, 567 lines)
2. api-reference.md   (18.9 KB, 456 lines)
3. configuration.md   (15.2 KB, 389 lines)
...
```

---

### llm

Generate an LLM-friendly markdown file combining all documentation for AI context.

**Usage:**
```bash
bunpress llm [options]
```

**Options:**
- `--dir <dir>` - Documentation directory (default: ./docs)
- `--output <output>` - Output file path (default: ./docs.md)
- `--full` - Include full content (default: headings only)
- `--verbose` - Show processing details

**Examples:**
```bash
# Generate structure only (headings)
bunpress llm

# Generate with full content
bunpress llm --full

# Custom output file
bunpress llm --output ./docs-full.md

# Custom docs directory
bunpress llm --dir ./documentation --full
```

**Output format:**
```markdown
# Documentation

Generated: 2024-10-29T10:30:00Z
Total files: 23

---

## File: install.md

**Frontmatter:**
```yaml
title: Installation
layout: doc
```

# Installation
## Prerequisites
## Installation Methods
...
```

**Use cases:**
- Provide documentation context to LLMs
- Documentation analysis
- Search index generation
- Documentation backup

---

## Configuration Commands

### config:show

Display the current BunPress configuration with all settings.

**Usage:**
```bash
bunpress config:show [options]
```

**Options:**
- `--verbose` - Show detailed configuration with comments

**Examples:**
```bash
# Show configuration
bunpress config:show
```

**Output:**
```typescript
// Current BunPress Configuration
export default {
  docsDir: './docs',
  outDir: './dist',
  nav: [...],
  sidebar: {...},
  markdown: {...},
  sitemap: {...}
}
```

---

### config:validate

Validate the BunPress configuration file for syntax and structure errors.

**Usage:**
```bash
bunpress config:validate [options]
```

**Options:**
- `--verbose` - Show detailed validation results

**Checks:**
- ✓ Configuration file syntax (valid TypeScript/JavaScript)
- ✓ Required fields present
- ✓ Navigation structure valid
- ✓ Sidebar configuration valid
- ✓ Markdown options valid
- ✓ SEO configuration valid (baseUrl format)

**Examples:**
```bash
# Validate configuration
bunpress config:validate
```

**Output:**
```
Configuration Validation Results:

✓ File syntax valid
✓ Required fields present
✓ Navigation structure valid
✗ Sitemap baseUrl missing
  → Add sitemap.baseUrl to enable sitemap generation

Validation: 3/4 checks passed
```

---

### config:init

Create a new BunPress configuration file with default settings.

**Usage:**
```bash
bunpress config:init
```

**Creates:**
```typescript
// bunpress.config.ts
export default {
  title: 'BunPress Documentation',
  description: 'Documentation built with BunPress',

  nav: [
    { text: 'Guide', link: '/guide' },
    { text: 'API', link: '/api' },
  ],

  markdown: {
    toc: { enabled: true },
    features: {
      containers: true,
      githubAlerts: true,
      codeBlocks: true,
      // ... all features enabled by default
    }
  },

  sitemap: {
    enabled: true,
    baseUrl: 'https://example.com'
  }
}
```

---

## SEO Commands

### seo:check

Validate all documentation pages for SEO best practices and common issues.

**Usage:**
```bash
bunpress seo:check [options]
```

**Options:**
- `--dir <dir>` - Documentation directory (default: ./docs)
- `--fix` - Automatically fix issues when possible

**Checks performed:**
- ✓ All pages have titles (optimal length: 10-60 characters)
- ✓ All pages have meta descriptions (optimal length: 50-160 characters)
- ✓ No duplicate titles across pages
- ✓ No broken internal links
- ✓ All images have alt text

**Examples:**
```bash
# Check for SEO issues
bunpress seo:check

# Check and auto-fix issues
bunpress seo:check --fix

# Check custom directory
bunpress seo:check --dir ./documentation
```

**Output:**
```
SEO Validation Results

Checked: 23 pages

Errors (2):
  ✗ advanced.md: Missing meta description
  ✗ api/auth.md: Title too long (67 characters, max 60)

Warnings (3):
  ⚠ guide.md: Description too short (35 characters, min 50)
  ⚠ tutorial.md: Image missing alt text (line 45)
  ⚠ config.md: Broken internal link: /missing-page

Summary:
  Titles:        23/23 ✓
  Descriptions:  21/23 ✗
  Links:         22/23 ⚠
  Images:        45/46 ⚠

Run with --fix to automatically resolve some issues.
```

**Auto-fix capabilities:**
- Generates meta descriptions from content
- Adds basic titles from headings
- Reports but doesn't fix broken links (manual review required)
- Reports images without alt text

---

## Global Options

These options work with all commands:

- `--help` - Show help for a specific command
- `--version` - Show BunPress version

**Examples:**
```bash
# Show help for build command
bunpress build --help

# Show version
bunpress --version
```

---

## Exit Codes

BunPress commands return standard exit codes for CI/CD integration:

- `0` - Success
- `1` - Error or validation failure

**Example in CI:**
```yaml
# .github/workflows/docs.yml
- name: Build documentation
  run: bunpress build

- name: Validate SEO
  run: bunpress seo:check
```

---

## Configuration File

Most commands respect settings in `bunpress.config.ts`:

```typescript
export default {
  // Directories
  docsDir: './docs',
  outDir: './dist',

  // Features
  markdown: {
    features: {
      containers: true,
      githubAlerts: true,
      codeBlocks: true,
    }
  },

  // SEO
  sitemap: {
    enabled: true,
    baseUrl: 'https://example.com'
  }
}
```

See [Configuration Guide](/config) for complete documentation.

---

## Best Practices

### Development Workflow

```bash
# 1. Initialize project
bunpress init

# 2. Start dev server
bunpress dev

# 3. Create content
bunpress new guides/getting-started

# 4. Check health
bunpress doctor

# 5. Validate SEO
bunpress seo:check

# 6. Build for production
bunpress build --minify

# 7. Preview before deploy
bunpress preview
```

### CI/CD Integration

```bash
# Install dependencies
bun install

# Run diagnostics
bunpress doctor

# Validate configuration
bunpress config:validate

# Check SEO
bunpress seo:check

# Build documentation
bunpress build --minify

# Generate stats
bunpress stats > build-stats.txt
```

### Maintenance

```bash
# Weekly: Check documentation health
bunpress doctor && bunpress stats

# Monthly: Validate SEO
bunpress seo:check --fix

# Before release: Clean build
bunpress clean --force && bunpress build --minify
```

---

## Troubleshooting

### Common Issues

**Command not found:**
```bash
# Ensure BunPress is installed
bun add @stacksjs/bunpress

# Or use bunx
bunx bunpress --version
```

**Permission errors:**
```bash
# Use bunx instead of global install
bunx @stacksjs/bunpress dev
```

**Build fails:**
```bash
# Run diagnostics
bunpress doctor

# Check for errors in markdown files
bunpress build --verbose
```

**Dev server won't start:**
```bash
# Try different port
bunpress dev --port 4000

# Check if port is in use
lsof -i :3000
```

See [Troubleshooting Guide](/troubleshooting) for more solutions.

---

## Related Documentation

- [Configuration Guide](/config) - Complete configuration reference
- [Quick Start](/quick-start) - Getting started guide
- [API Reference](/api) - TypeScript API documentation
- [Deployment Guide](/deployment) - Deploy your documentation

---

## Need Help?

- 📚 [Documentation](/)
- 💬 [Discord Community](https://discord.gg/stacksjs)
- 🐛 [Report Issues](https://github.com/stacksjs/bunpress/issues)
- 📧 [Contact Support](mailto:support@stacksjs.org)
