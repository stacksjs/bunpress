# Syntax Highlighting

BunPress provides beautiful code syntax highlighting powered by `ts-syntax-highlighter`, a blazing-fast, zero-dependency syntax highlighter built specifically for Bun.

[[toc]]

## Overview

Code blocks in your markdown are automatically highlighted with proper syntax coloring for better readability. The highlighter supports multiple languages and includes features like line highlighting, line numbers, and diff indicators.

## Supported Languages

BunPress supports syntax highlighting for the following languages:

- **JavaScript** (`js`, `javascript`, `jsx`)
- **TypeScript** (`ts`, `typescript`, `tsx`)
- **HTML** (`html`, `htm`)
- **CSS** (`css`)
- **JSON** (`json`)
- **STX** (`stx`) - Blade-like templating

> [!IMPORTANT]
> Shell/Bash commands (`bash`, `sh`, `shell`) are **not currently supported** for syntax highlighting. Code will be displayed in a monospace font with HTML entities properly escaped for security.

> [!TIP]
> For shell commands, you can omit the language identifier or use `text` for plain formatting.

## Basic Usage

Simply use standard markdown code fences with a language identifier:

````markdown
```javascript
const greeting = 'Hello World'
console.log(greeting)
```
````

**Result:**

```javascript
const greeting = 'Hello World'
console.log(greeting)
```

## Language Examples

### JavaScript

````markdown
```javascript
function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

const result = fibonacci(10)
console.log(result)
```
````

### TypeScript

````markdown
```typescript
interface User {
  name: string
  age: number
  email?: string
}

function greetUser(user: User): string {
  return `Hello, ${user.name}!`
}

const user: User = { name: 'Alice', age: 30 }
console.log(greetUser(user))
```
````

### HTML

````markdown
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
</head>
<body>
  <div class="container">
    <h1>Welcome</h1>
  </div>
</body>
</html>
```
````

### CSS

````markdown
```css
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background: linear-gradient(to right, #667eea, #764ba2);
}

@media (prefers-color-scheme: dark) {
  .container {
    background: #1a1a1a;
  }
}
```
````

### JSON

````markdown
```json
{
  "name": "bunpress",
  "version": "1.0.0",
  "description": "Modern documentation engine",
  "dependencies": {
    "ts-syntax-highlighter": "^0.1.0"
  }
}
```
````

## Advanced Features

### Line Highlighting

Highlight specific lines to draw attention to important code:

````markdown
```javascript{2,4-6}
function fibonacci(n) {
  if (n <= 1) return n  // This line is highlighted

  let a = 0             // These lines
  let b = 1             // are also
  let temp              // highlighted

  for (let i = 2; i <= n; i++) {
    temp = a + b
    a = b
    b = temp
  }

  return b
}
```
````

> [!NOTE]
> Use `{line-numbers}` syntax where line-numbers can be a single number, a range (`1-5`), or a comma-separated list (`1,3,5-7`).

### Line Numbers

Enable line numbers for easier reference:

````markdown
```typescript:line-numbers
function add(a: number, b: number): number {
  return a + b
}

function multiply(a: number, b: number): number {
  return a * b
}
```
````

### Inline Code Markers

Use special comments to add visual indicators to your code:

#### Focus Lines

````markdown
```javascript
function example() {
  const important = true  // [!code focus]
  const other = false
  return important
}
```
````

> [!TIP]
> Focused lines remain clear while unfocused lines are dimmed.

#### Diff Highlighting

````markdown
```javascript
function greet(name) {
  console.log('Hi')  // [!code --]
  console.log(`Hello, ${name}!`)  // [!code ++]
}
```
````

#### Error and Warning Indicators

````markdown
```javascript
function divide(a, b) {
  return a / b  // [!code error]
  // Should check for division by zero!
}

function calculate(x) {
  const result = x * 2  // [!code warning]
  // Consider using a more descriptive variable name
  return result
}
```
````

## Code in Multiple Languages

Use code groups to show examples in different languages:

::: code-group

````markdown [npm]
```bash
npm install bunpress
```
````

````markdown [yarn]
```bash
yarn add bunpress
```
````

````markdown [bun]
```bash
bun add bunpress
```
````

:::

See [Code Groups](/examples#code-groups-example) for more details.

## Themes

BunPress uses a light theme by default with automatic dark mode support:

- **Light theme**: Clean, GitHub-inspired colors
- **Dark theme**: Automatically applied based on system preferences

The theme switching uses CSS media queries:

```css
@media (prefers-color-scheme: dark) {
  /* Dark theme styles applied here */
}
```

> [!NOTE]
> Custom theme support is planned for future versions.

## Performance

The syntax highlighter is designed for speed:

- **Async tokenization**: Non-blocking, efficient parsing
- **Built-in caching**: Repeated highlights are faster
- **Zero dependencies**: No heavy grammar files to load
- **Bun-optimized**: Built specifically for the Bun runtime

### Typical Performance

| Code Size | Highlight Time |
|-----------|----------------|
| Small (10-20 lines) | < 50ms |
| Medium (50 lines) | < 100ms |
| Large (100+ lines) | < 500ms |

## Styling

The syntax highlighter provides comprehensive CSS classes for customization:

```css
/* Basic code block styling */
pre {
  overflow-x: auto;
  padding: 1rem;
  border-radius: 0.5rem;
}

/* Line highlighting */
.line.highlighted {
  background-color: rgba(255, 255, 0, 0.1);
  border-left: 3px solid #fbbf24;
}

/* Focus mode */
.line.focused {
  filter: none;
}

.line.dimmed {
  opacity: 0.5;
}

/* Diff highlighting */
.line.diff-add {
  background-color: rgba(16, 185, 129, 0.1);
  border-left: 3px solid #10b981;
}

.line.diff-remove {
  background-color: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
}
```

## Comparison with Shiki

BunPress previously used Shiki but switched to `ts-syntax-highlighter` for several reasons:

| Feature | ts-syntax-highlighter | Shiki |
|---------|---------------------|-------|
| Bundle Size | ~50KB | ~6MB |
| Dependencies | Zero | Many |
| Performance | Async, cached | Slower initialization |
| Bun Native | ✅ Yes | ❌ No |
| Grammar Files | Built-in | External |
| Language Support | 6 core languages | 200+ languages |

> [!TIP]
> If you need support for languages beyond the core 6, `ts-syntax-highlighter` supports custom language definitions.

## Troubleshooting

### Code not highlighting

If your code isn't being highlighted:

1. **Check the language identifier** - Make sure you're using a [supported language](#supported-languages)
2. **Verify the syntax** - Ensure the code fence uses triple backticks
3. **Check for typos** - Language identifiers are case-insensitive but must be spelled correctly

```markdown
✅ Correct:
```javascript
const x = 42
```

❌ Incorrect:
```javascirpt
const x = 42
```
\`\`\`

> [!NOTE]
> Common unsupported languages include: `bash`, `sh`, `shell`, `python`, `ruby`, `go`, `rust`, `java`, `php`, and others. These will display as plain monospace text.

### Styling issues

If the highlighting doesn't look right:

> [!IMPORTANT]
> Make sure your custom CSS isn't overriding the syntax highlighting styles.

Check for CSS conflicts in your browser's developer tools.

### Performance issues

For very large code blocks:

> [!TIP]
> Consider splitting large code examples into smaller, focused examples.

Smaller code blocks are easier to read and highlight faster.

## Best Practices

### Choose the Right Language

Always specify the language for better highlighting:

```markdown
✅ Good:
```typescript
const greeting: string = 'Hello'
```

❌ Avoid:
```
const greeting = 'Hello'
```
\`\`\`

### Keep Code Examples Focused

> [!TIP]
> Show only relevant code. Use comments or line highlighting to guide attention.

```typescript
// ✅ Good: Focused example
interface User {
  name: string  // [!code focus]
  age: number   // [!code focus]
}

// ❌ Avoid: Too much code
// (showing entire file with hundreds of lines)
```

### Use Inline Code for Single Values

For short snippets, use inline code instead of code blocks:

```markdown
Use the `console.log()` function to debug.
Set `DEBUG=true` in your environment.
```

### Combine with Other Features

Syntax highlighting works great with other BunPress features:

- Code groups for multi-language examples
- GitHub alerts for important notes
- Code imports to sync with actual source files
- Containers for expandable code examples

## API Reference

For programmatic use, BunPress exports the following functions:

```typescript
import {
  highlightCode,
  normalizeLanguage,
  isLanguageSupported,
  getSyntaxHighlightingStyles
} from '@stacksjs/bunpress'

// Highlight code (async)
const html = await highlightCode('const x = 42', 'javascript')

// Check if language is supported
if (isLanguageSupported('python')) {
  // Language is supported
}

// Normalize language alias
const lang = normalizeLanguage('js') // Returns 'javascript'

// Get CSS styles
const styles = getSyntaxHighlightingStyles()
```

> [!NOTE]
> These functions are primarily for advanced usage and plugin development. Most users won't need to use them directly.

## Working with Shell Commands

Since `bash`/`sh` is not currently supported, here are some alternatives for displaying shell commands:

### Option 1: Use Plain Text

Omit the language identifier or use `text`:

````markdown
```
npm install bunpress
bun add bunpress
```
````

### Option 2: Use Code Groups

For package manager commands, use code groups without highlighting:

````markdown
::: code-group

```text [npm]
npm install bunpress
```

```text [yarn]
yarn add bunpress
```

```text [bun]
bun add bunpress
```

:::
````

### Option 3: Inline Code

For short commands, use inline code:

```markdown
Run `npm install bunpress` to install.
Use `bun dev` to start the development server.
```

> [!NOTE]
> Shell/Bash highlighting support is planned for a future release through custom language definitions.

## Future Enhancements

Planned improvements for syntax highlighting:

- [ ] Shell/Bash language support
- [ ] Additional language support (Python, Ruby, Go, Rust, etc.)
- [ ] Custom theme creation
- [ ] Copy-to-clipboard buttons
- [ ] Code playground integration
- [ ] Syntax highlighting in search results

## See Also

- [Code Groups](/examples#code-groups-example) - Tabbed code examples
- [Code Imports](/examples#code-imports-example) - Import code from files
- [Markdown Extensions](/markdown-extensions) - All markdown features
- [Examples](/examples) - More real-world examples
