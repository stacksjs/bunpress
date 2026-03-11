# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BunPress is a lightning-fast static site generator designed specifically for documentation. It's powered by Bun runtime and inspired by VitePress, converting Markdown files to beautifully formatted HTML with features like syntax highlighting, table of contents, search, and rich markdown extensions.

**Key Technologies:**
- **Runtime:** Bun (not Node.js - use `bun` commands exclusively)
- **Language:** TypeScript with strict mode and isolated declarations
- **Build System:** Bun's native build system with `bun-plugin-dtsx` for type generation
- **CLI Framework:** `@stacksjs/clapp`
- **CSS Utilities:** `@stacksjs/headwind` - Will replace UnoCSS for utility-first CSS styling
- **Markdown Processing:** `Bun.markdown` (built-in Zig-based GFM parser) with `ts-syntax-highlighter` for code highlighting

## Common Development Commands

### CLI Commands

BunPress provides a comprehensive set of CLI commands for working with documentation:

```bash
# Project initialization
bunpress init                    # Initialize a new BunPress project
bunpress init --force            # Overwrite existing files

# Development & Building
bunpress dev                     # Start dev server with hot reload
bunpress dev --port 4000         # Custom port
bunpress build                   # Build documentation site
bunpress build --watch           # Build and watch for changes
bunpress build --minify          # Minify output
bunpress build --sourcemap       # Generate source maps

# Content creation
bunpress new <path>              # Create new markdown file
bunpress new guides/getting-started --title "Getting Started"
bunpress new api/reference --template api
# Templates: default, guide, api, blog

# Preview & Serve
bunpress preview                 # Preview production build
bunpress preview --port 8080     # Custom port

# Maintenance
bunpress clean                   # Remove build artifacts
bunpress clean --force           # Skip confirmation

# Configuration
bunpress config:show             # Show current configuration
bunpress config:validate         # Validate configuration file
bunpress config:init             # Create new configuration file

# Utilities
bunpress stats                   # Show documentation statistics
bunpress stats --verbose         # Detailed per-file stats
bunpress doctor                  # Run diagnostic checks
bunpress llm                     # Generate LLM-friendly markdown
bunpress llm --full              # Include full content

# Help & Version
bunpress --help                  # Show help
bunpress --version               # Show version
```

### Building & Development
```bash
# Build the library (transpiles and generates types)
bun run build

# Compile CLI to native binary
bun run compile

# Compile for all platforms
bun run compile:all

# Development - starts dev server with hot reload
bun run dev
# or explicitly
bun bin/cli.ts dev

# Type checking
bun run typecheck
```

### Testing
```bash
# Run all tests with verbose output
bun test

# Quick test run (10s timeout)
bun test:quick

# Full test run (60s timeout, no bail on errors)
bun test:full

# Run a single test file
bun test test/table-of-contents.test.ts
```

### Linting & Quality
```bash
# Lint all files
bun run lint

# Auto-fix linting issues
bun run lint:fix
```

### Building Documentation
```bash
# Build the documentation site (not the library)
bun build.ts

# Serve the built docs
bun serve --port 3000 dist
```

### Release & Publishing
```bash
# Generate changelog
bun run changelog:generate

# Create a release (generates changelog and prompts for version)
bun run release

# Refresh dependencies
bun run fresh
```

## Architecture Overview

### Core Source Files (src/)

1. **types.ts** - Complete TypeScript type definitions
   - `BunPressConfig` and `BunPressOptions` - Main configuration interfaces
   - `MarkdownPluginConfig` - Markdown processing configuration
   - `TocConfig`, `TocData`, `TocHeading` - Table of contents structures
   - `Frontmatter`, `Hero`, `Feature` - Content metadata types
   - `NavItem`, `SidebarItem` - Navigation structures
   - `SearchConfig`, `ThemeConfig` - Feature configurations
   - `SitemapConfig`, `RobotsConfig` - SEO configurations

2. **config.ts** - Configuration management
   - Exports `defaultConfig` with default navigation, sidebar, markdown settings
   - Uses `bunfig` to load user configuration from `bunpress.config.ts`
   - Exports async `config` object that merges defaults with user config
   - Contains extensive default CSS for layouts (home, doc, page), code groups, custom containers, and alerts

3. **plugin.ts** - Legacy Bun plugin (COMMENTED OUT, superseded by serve.ts)
   - Previously used marked.js and shiki for markdown-to-HTML
   - No longer active — all markdown processing now handled by `serve.ts`

4. **toc.ts** - Table of Contents generation
   - `generateSlug()` - Creates URL-safe slugs from headings
   - `generateUniqueSlug()` - Handles duplicate headings
   - `extractHeadings()` - Parses markdown for h1-h6, handles inline code
   - `buildTocHierarchy()` - Creates nested TOC structure
   - `filterHeadings()` - Applies minDepth, maxDepth, exclude patterns
   - `generateTocHtml()` - Renders TOC as HTML
   - Position-specific generators: sidebar, inline, floating
   - `enhanceHeadingsWithAnchors()` - Adds anchor links to headings
   - `generateTocStyles()` and `generateTocScripts()` - Client-side TOC interactivity

5. **index.ts** - Public API exports

6. **serve.ts** - Development server and markdown processing (MAIN PIPELINE)
   - Full-featured dev server with `Bun.serve()`
   - `markdownToHtml()` — the main markdown-to-HTML pipeline using `Bun.markdown.html()` with pre/post-processing
   - Pre-processors: frontmatter, includes, code imports, code groups, GitHub alerts, containers, emoji, badges, custom anchors, code block extraction
   - Post-processors: custom inline formatting, table enhancements, heading IDs, TOC injection, external links, image lazy loading
   - `wrapInLayout()` — wraps content in home/doc/page layout templates
   - `processCodeBlock()` — syntax highlighting with line numbers, highlighting, diffs, focus, errors/warnings
   - `startServer()` / `serveCLI()` — serve markdown files with hot reload
   - Feature toggles via `config.markdown.features` (MarkdownFeaturesConfig)

7. **highlighter.ts** - Syntax highlighting via `ts-syntax-highlighter`
   - Singleton highlighter instance with theme support
   - Language aliases (js→javascript, ts→typescript, etc.)
   - `highlightCode()` — async per-line highlighting with whitespace restoration

8. **template-loader.ts** - STX template rendering
   - Loads `.stx` template files from `src/templates/`
   - `render()` — substitutes `{{ key }}` placeholders with data
   - Template caching for performance

### CSS Utilities: Headwind

BunPress uses **@stacksjs/headwind** for utility-first CSS styling. Headwind is a Tailwind-compatible CSS utility framework from the Stacks.js ecosystem.

**Migration Status:** UnoCSS → Headwind
- UnoCSS is currently referenced in tests and commented code (see `src/plugin.ts`)
- The project is transitioning to use Headwind instead
- UnoCSS runtime references (e.g., `@unocss/runtime` CDN imports) should be replaced with Headwind equivalents
- When uncommenting or updating `src/plugin.ts`, replace UnoCSS imports with Headwind

**Headwind CLI:**
- Headwind provides a CLI binary accessible via `bunx headwind`
- Uses `@stacksjs/clapp` for command-line interface
- Configuration can be managed via `bunfig` (similar to other Stacks packages)

### CLI (bin/cli.ts)

The CLI provides comprehensive commands for documentation management:

#### Core Commands

- **init** - Initialize a new BunPress project
  - Creates `docs/` directory structure
  - Generates `bunpress.config.ts` with defaults
  - Creates sample documentation files (index.md, guide/index.md)
  - Sets up `.gitignore` and `README.md`
  - Options: `--name`, `--template`, `--force`

- **build** - Convert markdown files to HTML
  - Finds all `**/*.md` files in `./docs` directory
  - Uses `Bun.build()` with markdown/stx plugins (currently disabled)
  - Copies static assets from `docs/public/` to output directory
  - Generates `index.html` with navigation to all pages
  - Shows build time and spinner progress indicator
  - Options: `--outdir`, `--config`, `--verbose`, `--minify`, `--sourcemap`, `--watch`

- **dev** - Development server with watch mode
  - Builds documentation initially
  - Serves at http://localhost:3000 (configurable with `--port`)
  - Custom fetch handler that serves static files and HTML
  - File watching with debounced rebuild
  - Options: `--port`, `--dir`, `--open`, `--watch`, `--verbose`

- **preview** - Preview production build
  - Serves built files from `dist/` directory
  - Static file server with proper MIME types
  - Options: `--port`, `--outdir`, `--open`

#### Content Management

- **new <path>** - Create new markdown files
  - Supports nested paths (e.g., `guides/advanced/testing`)
  - Multiple templates: default, guide, api, blog
  - Auto-generates frontmatter and structure
  - Options: `--title`, `--template`

#### Configuration Management

- **config:show** - Display current configuration file
- **config:validate** - Validate configuration against schema
  - Checks required fields
  - Validates nav/sidebar structure
  - Verifies markdown config options
- **config:init** - Create new configuration file

#### Utilities

- **clean** - Remove build artifacts
  - Deletes `dist/` directory by default
  - Shows size before deletion
  - Options: `--outdir`, `--force`, `--verbose`

- **stats** - Documentation statistics
  - File count, total size, line/word counts
  - Heading and code block analysis
  - Per-file breakdown (with --verbose)
  - Reading time estimation
  - Top largest files
  - Options: `--dir`, `--verbose`

- **doctor** - Project diagnostics
  - Checks Bun runtime version
  - Validates configuration file
  - Verifies docs/ directory and markdown files
  - Checks package.json scripts
  - Verifies dependencies installed
  - Git repository status
  - TypeScript configuration
  - Provides recommended actions for failures

- **llm** - Generate LLM-friendly markdown
  - Combines all documentation into single file
  - Extracts structure (headings only) or full content
  - Useful for AI/LLM context
  - Options: `--dir`, `--output`, `--full`

#### CLI Utilities (bin/utils.ts)

Helper functions for CLI development:
- Color formatting with ANSI codes
- Success/error/warning/info loggers
- Spinner for long-running operations
- File size and time formatting
- User prompts (input and confirmation)
- Table rendering
- File existence checking

### Build System (build.ts)

Simple build script that:
1. Compiles `src/index.ts` and `bin/cli.ts` with Bun
2. Uses `bun-plugin-dtsx` to generate `.d.ts` files
3. Outputs to `./dist` with minification and code splitting
4. Target: Bun runtime

### Configuration Files

- **bunpress.config.ts** - User configuration file that extends `defaultConfig`
- **tsconfig.json** - Strict TypeScript with Bun types, isolated declarations
- **package.json** - Defines bin entry point, exports, build scripts

### Test Structure (test/)

- 325 tests across 23 files:
  - `bunpress.test.ts` - Core integration tests
  - `syntax-highlighting.test.ts` - Code highlighting
  - `cli-commands.test.ts` - CLI command tests
  - `llm-command.test.ts` - LLM markdown generation
  - `fathom-analytics.test.ts` - Analytics integration
  - `benchmark.test.ts` - Performance benchmarks
  - `templates/alerts/github-alerts.test.ts` - GitHub-flavored alerts
  - `templates/code/` - Code block features (line-highlighting, line-numbers, code-groups, code-imports, diff-markers, focus-markers, error-warning-markers)
  - `templates/containers/containers.test.ts` - Custom containers
  - `templates/content/` - Content features (badges, emoji, custom-header-anchors, inline-toc)
  - `templates/include/markdown-include.test.ts` - File inclusion
  - `templates/inline/inline-formatting.test.ts` - Inline formatting (mark, sup, sub)
  - `templates/links/external-links.test.ts` - External link enhancements
  - `templates/table/table-enhancements.test.ts` - Table styling and alignment

## Important Implementation Details

### Markdown Processing Pipeline

The markdown pipeline is implemented in `src/serve.ts` using `Bun.markdown.html()` (Zig-based GFM parser):
- **Pre-processing**: Custom features (containers, alerts, code blocks, emoji, badges) are processed before passing to Bun.markdown
- **Code blocks**: Extracted and replaced with placeholders before Bun.markdown, restored after
- **Post-processing**: Tables, headings, external links, images are enhanced after HTML conversion
- **Feature toggles**: All features can be disabled via `config.markdown.features` (MarkdownFeaturesConfig)
- Template system uses `{{content}}`, `{{title}}`, etc. placeholders in `.stx` files
- Supports three layouts: home (landing page), doc (documentation with sidebar/TOC), page (plain with nav)
- Legacy `src/plugin.ts` (marked.js + shiki) is commented out and no longer used

### Configuration Loading

- User config in `bunpress.config.ts` is loaded via `bunfig` package
- Config is loaded at top-level await in `src/config.ts`
- Plugins can extend config via `extendConfig` hook

### Table of Contents

- Headings h1-h6 are extracted via regex
- Inline code in headings is preserved as `<code>` tags
- Supports `<!-- toc-ignore -->` to exclude headings
- Slugs handle duplicates by appending `-1`, `-2`, etc.
- TOC can be positioned: sidebar, inline (via `[[toc]]`), floating
- Client-side JS provides smooth scrolling, active highlighting, collapse/expand

### Testing Conventions

- Tests use Bun's built-in test runner
- Default timeout: 2 minutes (120000ms)
- `test:quick` uses 10s timeout for rapid feedback
- `test:full` uses 60s timeout and doesn't bail on first failure

### Performance Benchmark

The `test/benchmark.test.ts` file contains a comprehensive performance benchmark comparing BunPress against other static site generators using the same methodology as [11ty's official benchmarks](https://www.11ty.dev/docs/performance/):

```bash
# Run the benchmark
bun test test/benchmark.test.ts --timeout 600000
```

**Results (4,000 markdown files):**

| Mode | BunPress | Eleventy | Astro | Gatsby | Next.js |
|------|----------|----------|-------|--------|---------|
| Fast | **0.18s** | 1.93s | 22.90s | 29.05s | 70.65s |
| Full | **4.12s** | - | 22.90s | 29.05s | 70.65s |

- **Fast Mode**: Simple markdown to HTML (comparable to Eleventy) - 22,000+ files/second
- **Full Mode**: With syntax highlighting, templates, TOC (comparable to Astro)

The benchmark includes:
- `fastMarkdownToHtml()` - Optimized parser for pure speed benchmarks
- `runFastBuildBenchmark()` - Tests fast mode performance
- `runFullBuildBenchmark()` - Tests full-featured mode performance

### Git Hooks

Pre-commit hook runs staged linting:
- Lints `*.{js,ts,json,yaml,yml,md}` files
- Uses `bunx --bun eslint --fix` for auto-fixing

Commit-msg hook validates commit messages with `@stacksjs/gitlint`

## Development Workflow

1. Make changes to source files in `src/`
2. Run `bun run typecheck` to verify types
3. Run `bun test` to verify functionality
4. Test the CLI with `bun bin/cli.ts <command>`
5. Build with `bun run build` before publishing

## Key Dependencies

- **@stacksjs/clapp** - CLI framework
- **@stacksjs/headwind** - Utility-first CSS framework
- **@stacksjs/eslint-config** - ESLint configuration
- **bunfig** - Configuration loading
- **bun-plugin-dtsx** - TypeScript declaration generation
- **ts-syntax-highlighter** - Code syntax highlighting
- **Bun.markdown** - Built-in markdown parser (no npm dependency)

## Known Issues / Work in Progress

- `src/plugin.ts` is entirely commented out — superseded by `src/serve.ts` pipeline
- The main build system in `bin/cli.ts` has plugins disabled (line 103) — `bun bin/cli.ts dev` uses serve.ts directly