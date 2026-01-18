---
title: CLI Commands
description: Complete reference for BunPress CLI commands
---

# CLI Commands

BunPress provides a comprehensive CLI for managing your documentation site.

## Installation

```bash
# Install globally
bun add -g @stacksjs/bunpress

# Or run with bunx
bunx @stacksjs/bunpress <command>
```

## Core Commands

### init

Initialize a new BunPress project:

```bash
bunpress init
bunpress init --name my-docs
bunpress init --template default
bunpress init --force
```

**Options:**

| Option | Description |
|--------|-------------|
| `--name <name>` | Project name |
| `--template <template>` | Template to use (default, minimal) |
| `--force` | Overwrite existing files |

### dev

Start the development server with hot reload:

```bash
bunpress dev
bunpress dev --port 4000
bunpress dev --open
bunpress dev --verbose
```

**Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `--port <port>` | `3000` | Server port |
| `--dir <dir>` | `./docs` | Documentation directory |
| `--open` | `false` | Open browser automatically |
| `--watch` | `true` | Watch for file changes |
| `--verbose` | `false` | Enable verbose logging |

### build

Build documentation for production:

```bash
bunpress build
bunpress build --outdir ./public
bunpress build --minify
bunpress build --sourcemap
bunpress build --watch
```

**Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `--outdir <dir>` | `./dist` | Output directory |
| `--config <path>` | `bunpress.config.ts` | Config file path |
| `--minify` | `false` | Minify output |
| `--sourcemap` | `false` | Generate source maps |
| `--watch` | `false` | Watch mode |
| `--verbose` | `false` | Verbose output |

### preview

Preview the production build locally:

```bash
bunpress preview
bunpress preview --port 8080
bunpress preview --open
```

**Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `--port <port>` | `4173` | Server port |
| `--outdir <dir>` | `./dist` | Directory to serve |
| `--open` | `false` | Open browser |

## Content Commands

### new

Create a new markdown file:

```bash
bunpress new guide/getting-started
bunpress new api/reference --title "API Reference"
bunpress new blog/announcement --template blog
```

**Options:**

| Option | Description |
|--------|-------------|
| `--title <title>` | Page title |
| `--template <name>` | Template: default, guide, api, blog |

**Templates:**

- `default` - Basic page with frontmatter
- `guide` - Tutorial-style with sections
- `api` - API documentation structure
- `blog` - Blog post with date and author

## Configuration Commands

### config:show

Display current configuration:

```bash
bunpress config:show
bunpress config:show --json
```

### config:validate

Validate configuration file:

```bash
bunpress config:validate
bunpress config:validate --fix
```

**Options:**

| Option | Description |
|--------|-------------|
| `--fix` | Attempt to fix issues |

### config:init

Create a new configuration file:

```bash
bunpress config:init
bunpress config:init --force
```

## SEO Commands

### seo:check

Check SEO across all pages:

```bash
bunpress seo:check
bunpress seo:check --fix
bunpress seo:check --verbose
```

**Options:**

| Option | Description |
|--------|-------------|
| `--fix` | Auto-fix common issues |
| `--verbose` | Show detailed results |

**Checks performed:**
- Title length (50-60 characters)
- Description length (150-160 characters)
- Heading hierarchy
- Image alt text
- Internal link validity
- Meta tag presence

## Utility Commands

### clean

Remove build artifacts:

```bash
bunpress clean
bunpress clean --force
bunpress clean --outdir ./public
```

**Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `--outdir <dir>` | `./dist` | Directory to clean |
| `--force` | `false` | Skip confirmation |
| `--verbose` | `false` | Verbose output |

### stats

Show documentation statistics:

```bash
bunpress stats
bunpress stats --verbose
bunpress stats --dir ./docs
```

**Options:**

| Option | Description |
|--------|-------------|
| `--dir <dir>` | Documentation directory |
| `--verbose` | Show per-file breakdown |

**Output includes:**
- Total file count
- Total size
- Word and line counts
- Heading and code block counts
- Reading time estimates
- Largest files

### doctor

Run diagnostic checks:

```bash
bunpress doctor
bunpress doctor --fix
```

**Checks performed:**
- Bun runtime version
- Configuration file validity
- docs/ directory existence
- Markdown files presence
- package.json scripts
- Dependencies installed
- Git repository status
- TypeScript configuration

### llm

Generate LLM-friendly markdown:

```bash
bunpress llm
bunpress llm --full
bunpress llm --output context.md
```

**Options:**

| Option | Description |
|--------|-------------|
| `--dir <dir>` | Documentation directory |
| `--output <file>` | Output file path |
| `--full` | Include full content (not just headings) |

## Global Options

These options work with all commands:

| Option | Description |
|--------|-------------|
| `--help, -h` | Show help information |
| `--version, -v` | Show version number |
| `--verbose` | Enable verbose output |
| `--config <path>` | Custom config file path |

## Examples

### Development Workflow

```bash
# Initialize new project
bunpress init --name my-docs

# Start development
bunpress dev --open

# Create new pages
bunpress new guide/installation
bunpress new api/methods --template api

# Check quality
bunpress doctor
bunpress seo:check

# Build for production
bunpress build --minify

# Preview build
bunpress preview
```

### CI/CD Pipeline

```bash
# Install dependencies
bun install

# Validate configuration
bunpress config:validate

# Run diagnostics
bunpress doctor

# Build
bunpress build --minify

# Check SEO
bunpress seo:check
```

### Content Management

```bash
# View statistics
bunpress stats --verbose

# Create content
bunpress new changelog/v2.0 --template blog
bunpress new api/authentication --template api

# Generate LLM context
bunpress llm --full --output docs-context.md
```
