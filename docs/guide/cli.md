---
title: CLI Commands
description: Complete reference for BunPress CLI commands
---

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
