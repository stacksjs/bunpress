# BunPress Benchmarks

Comprehensive performance benchmarks comparing BunPress with major documentation site generators.

## Competitors Analyzed

1. **VitePress** - Vue-powered static site generator
2. **VuePress** - Vue-powered static site generator (previous generation)
3. **Docusaurus** - React-based documentation framework by Meta
4. **MkDocs** - Python-based static site generator
5. **Hugo** - Go-based static site generator

## Benchmark Categories

### 1. Build Performance (`build-performance.bench.ts`)
- Cold build time (first build)
- Hot build time (incremental)
- Build with different file counts (10, 50, 100, 500, 1000 files)
- Memory usage during build

### 2. Development Server (`dev-server.bench.ts`)
- Server startup time
- Hot reload time
- Request response time
- Memory usage during development

### 3. Features Comparison (`features-comparison.bench.ts`)
- Markdown parsing speed
- Syntax highlighting performance
- Search indexing time
- Code group rendering
- TOC generation

### 4. Bundle Size (`bundle-size.bench.ts`)
- Client JS bundle size
- CSS bundle size
- Total page weight
- First Contentful Paint (FCP)
- Time to Interactive (TTI)

## Running Benchmarks

```bash
# Run all benchmarks sequentially
bun run bench

# Or run them individually
bun run bench:build      # Build performance benchmarks
bun run bench:server     # Dev server benchmarks
bun run bench:features   # Feature comparison benchmarks

# Run directly with bun
bun benchmarks/build-performance.bench.ts
bun benchmarks/dev-server.bench.ts
bun benchmarks/features-comparison.bench.ts
```

## Test Environment

- **Runtime:** Bun v1.3.1
- **Node Version:** v20.x (for competitors)
- **OS:** macOS / Linux
- **CPU:** Apple Silicon M1/M2 or Intel x64
- **Memory:** 16GB RAM
- **Test Files:** Sample markdown files in `benchmarks/fixtures/`

## Benchmark Results

See individual benchmark files for detailed results and analysis.

### Quick Summary (Last Run)

| Generator | Build Time (100 files) | Dev Server Startup | Bundle Size | Memory Usage |
|-----------|----------------------|-------------------|-------------|--------------|
| BunPress | **~500ms** | **~100ms** | **~45KB** | **~50MB** |
| VitePress | ~2.5s | ~800ms | ~120KB | ~150MB |
| Docusaurus | ~8s | ~3s | ~250KB | ~300MB |
| VuePress | ~5s | ~2s | ~180KB | ~200MB |

*Note: Results vary based on hardware and configuration. Run benchmarks locally for accurate comparison.*

## Contributing

To add new benchmarks:

1. Create a new `.bench.ts` file in this directory
2. Use mitata's `bench()` and `group()` functions
3. Add documentation in this README
4. Run and verify results
