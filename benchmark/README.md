# BunPress Benchmarks

Comprehensive performance benchmarks for BunPress.

## Benchmark Suites

### 1. Markdown Engine (`index.ts`)

Compares BunPress against popular markdown-to-HTML engines:

- markdown-it (powers VitePress)
- marked
- micromark
- showdown
- commonmark.js

### 2. Build Performance (`build-performance.bench.ts`)

- Cold build time (first build)
- Hot build time (incremental)
- Build with different file counts (10, 50, 100, 500 files)
- Memory usage during build

### 3. Development Server (`dev-server.bench.ts`)

- Server startup time
- Hot reload time
- Request response time
- Memory usage during development

### 4. Features Comparison (`features-comparison.bench.ts`)

- Markdown parsing speed
- Syntax highlighting performance
- TOC generation
- File generation

## Setup

This benchmark directory is self-contained. Install dependencies:

```bash
cd benchmark
bun install
```

## Running Benchmarks

```bash
# Markdown engine comparison (self-contained, no parent deps needed)
bun run bench

# Build performance (requires parent project)
bun run bench:build

# Dev server performance (requires parent project)
bun run bench:server

# Feature comparison (requires parent project)
bun run bench:features

# Run all benchmarks
bun run bench:all
```

## Test Environment

- **Runtime:** Bun 1.3.10
- **OS:** macOS (Darwin arm64)
- **CPU:** Apple M3 Pro (~3.88 GHz)
- **Memory:** 18GB RAM

## Results

See individual benchmark files for detailed results and analysis.
