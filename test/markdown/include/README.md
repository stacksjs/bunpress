# Markdown Include Test Fixtures

This directory contains test fixtures for the markdown file inclusion feature.

## Files

### intro.md
Basic markdown content with heading and list for testing full file inclusion.

### faq.md
Contains two named regions (`getting-started` and `advanced`) for testing region-based inclusion.

Region markers format:
```markdown
<!-- #region region-name -->
Content here
<!-- #endregion -->
```

### nested-a.md and nested-b.md
Files for testing recursive/nested includes. `nested-a.md` includes `nested-b.md`.

## Usage in Tests

These fixtures are used by `test/templates/include/markdown-include.test.ts` to verify:

- Full file inclusion
- Line range inclusion (`{1-4}`)
- Named region inclusion (`{#region-name}`)
- Recursive/nested includes
- Circular reference detection
- Error handling for missing files and invalid regions
