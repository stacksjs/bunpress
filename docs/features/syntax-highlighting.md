# Syntax Highlighting

BunPress provides beautiful syntax highlighting for code blocks powered by Shiki. This guide covers configuration and customization options.

## Basic Usage

Use fenced code blocks with language identifiers:

````markdown
```typescript
const greeting = 'Hello, World!'
console.log(greeting)
```
````

## Supported Languages

BunPress supports 100+ programming languages including:

- JavaScript, TypeScript, JSX, TSX
- Python, Ruby, Go, Rust
- HTML, CSS, SCSS, Less
- JSON, YAML, TOML
- Bash, Shell, PowerShell
- SQL, GraphQL
- Markdown, MDX

## Themes

### Built-in Themes

```typescript
// bunpress.config.ts
export default {
  markdown: {
    syntaxHighlightTheme: 'github-dark', // default
  },
}
```

Available themes:
- `github-dark` (default)
- `github-light`
- `one-dark-pro`
- `dracula`
- `nord`
- `vitesse-dark`
- `vitesse-light`

### Dual Themes (Light/Dark)

```typescript
export default {
  markdown: {
    syntaxHighlightTheme: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
}
```

## Line Numbers

### Enable Globally

```typescript
export default {
  markdown: {
    features: {
      codeBlocks: {
        lineNumbers: true,
      },
    },
  },
}
```

### Per Block

````markdown
```typescript:line-numbers
const a = 1
const b = 2
const c = 3
```
````

### Starting Line Number

````markdown
```typescript:line-numbers=10
// This starts at line 10
const value = 'example'
```
````

## Line Highlighting

### Highlight Specific Lines

````markdown
```typescript {2,4-6}
const a = 1
const b = 2  // highlighted
const c = 3
const d = 4  // highlighted
const e = 5  // highlighted
const f = 6  // highlighted
```
````

### Focus Lines

````markdown
```typescript focus={2-3}
// dimmed
const important = true  // focused
const alsoImportant = true  // focused
// dimmed
```
````

## Diff Highlighting

Show code changes with diff markers:

````markdown
```typescript
const oldValue = 'old'  // [!code --]
const newValue = 'new'  // [!code ++]
```
````

Or use standard diff syntax:

````markdown
```diff
- const oldValue = 'old'
+ const newValue = 'new'
```
````

## Error/Warning Markers

Highlight errors and warnings:

````markdown
```typescript
const valid = true
const error = null  // [!code error]
const warning = undefined  // [!code warning]
```
````

## Word Highlighting

Highlight specific words:

````markdown
```typescript /greeting/
const greeting = 'Hello'
console.log(greeting)
```
````

## File Names

Display file names above code blocks:

````markdown
```typescript [src/utils.ts]
export function helper() {
  return true
}
```
````

## Custom Languages

### Register Languages

```typescript
export default {
  markdown: {
    customLanguages: [
      {
        id: 'myLang',
        scopeName: 'source.mylang',
        grammar: require('./mylang.tmLanguage.json'),
      },
    ],
  },
}
```

### Aliases

```typescript
export default {
  markdown: {
    languageAliases: {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
    },
  },
}
```

## Transformers

### Built-in Transformers

```typescript
export default {
  markdown: {
    features: {
      codeBlocks: {
        lineNumbers: true,
        lineHighlighting: true,
        focus: true,
        diffs: true,
        errorWarningMarkers: true,
      },
    },
  },
}
```

### Custom Transformers

```typescript
export default {
  markdown: {
    codeTransformers: [
      {
        name: 'custom-transform',
        pre(node) {
          // Transform the pre element
          this.addClassToHast(node, 'custom-class')
        },
        code(node) {
          // Transform the code element
        },
      },
    ],
  },
}
```

## Inline Code

### Inline Highlighting

Use inline code with language:

```markdown
The `const x = 1`{lang=ts} variable is typed.
```

### Styled Inline Code

```typescript
export default {
  markdown: {
    inlineCodeStyle: {
      backgroundColor: '#1e1e1e',
      padding: '0.2em 0.4em',
      borderRadius: '3px',
    },
  },
}
```

## Copy Button

### Enable Copy Button

```typescript
export default {
  markdown: {
    features: {
      codeBlocks: {
        copyButton: true,
      },
    },
  },
}
```

### Custom Copy Text

```typescript
export default {
  markdown: {
    copyButtonText: {
      copy: 'Copy code',
      copied: 'Copied!',
    },
  },
}
```

## Performance

### Lazy Loading

```typescript
export default {
  markdown: {
    syntaxHighlighting: {
      lazy: true, // Load highlighter on demand
    },
  },
}
```

### Preload Languages

```typescript
export default {
  markdown: {
    syntaxHighlighting: {
      preloadLanguages: ['typescript', 'javascript', 'css'],
    },
  },
}
```

## Styling

### Custom CSS

```css
/* Override highlight colors */
.shiki {
  background-color: #1a1a1a !important;
}

.shiki .line.highlighted {
  background-color: rgba(255, 255, 0, 0.1);
}

.shiki .line.diff.add {
  background-color: rgba(0, 255, 0, 0.1);
}

.shiki .line.diff.remove {
  background-color: rgba(255, 0, 0, 0.1);
}
```

## Related

- [Code Groups](/features/code-groups) - Tabbed code blocks
- [Markdown Features](/guide/markdown-features) - All markdown features
- [Theming](/advanced/theming) - Custom themes
