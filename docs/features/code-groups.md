# Code Groups

BunPress supports code groups for displaying multiple code blocks in a tabbed interface. This is useful for showing the same code in different languages or different implementation approaches.

## Basic Usage

Create a code group using the `:::code-group` container:

````markdown
:::code-group

```typescript [TypeScript]
const greeting: string = 'Hello'
console.log(greeting)
```

```javascript [JavaScript]
const greeting = 'Hello'
console.log(greeting)
```

```python [Python]
greeting = "Hello"
print(greeting)
```

:::
````

## Tab Labels

### From Language

If no label is specified, the language name is used:

````markdown
:::code-group

```typescript
// Tab shows "TypeScript"
```

```javascript
// Tab shows "JavaScript"
```

:::
````

### Custom Labels

Specify custom labels in brackets:

````markdown
:::code-group

```bash [npm]
npm install bunpress
```

```bash [yarn]
yarn add bunpress
```

```bash [pnpm]
pnpm add bunpress
```

```bash [bun]
bun add bunpress
```

:::
````

### File Names as Labels

```markdown
:::code-group

```typescript [src/index.ts]
export const main = () => {}
```

```typescript [src/utils.ts]
export const helper = () => {}
```

:::
```

## Configuration

### Enable Code Groups

```typescript
// bunpress.config.ts
export default {
  markdown: {
    features: {
      codeGroups: true,
    },
  },
}
```

### Default Tab

Set which tab is selected by default:

````markdown
:::code-group{default=2}

```bash [npm]
npm install
```

```bash [bun]
bun install
```

:::
````

## Styling

### Custom CSS

```css
/* Code group container */
.code-group {
  margin: 1rem 0;
  border-radius: 8px;
  overflow: hidden;
}

/* Tab buttons */
.code-group-tabs {
  display: flex;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}

.code-group-tab {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
}

.code-group-tab.active {
  color: #fff;
  border-bottom: 2px solid #3b82f6;
}

/* Code panels */
.code-group-panel {
  display: none;
}

.code-group-panel.active {
  display: block;
}
```

### Theme Integration

```typescript
export default {
  markdown: {
    codeGroupStyle: {
      tabBackground: 'var(--vp-code-tab-bg)',
      tabActiveColor: 'var(--vp-c-brand)',
      tabHoverBackground: 'var(--vp-code-tab-hover-bg)',
    },
  },
}
```

## Common Patterns

### Package Manager Commands

````markdown
:::code-group

```bash [npm]
npm install package-name
npm run build
```

```bash [yarn]
yarn add package-name
yarn build
```

```bash [pnpm]
pnpm add package-name
pnpm build
```

```bash [bun]
bun add package-name
bun run build
```

:::
````

### Framework Examples

````markdown
:::code-group

```tsx [React]
function Component() {
  return <div>Hello</div>
}
```

```vue [Vue]
<template>
  <div>Hello</div>
</template>
```

```svelte [Svelte]
<div>Hello</div>
```

:::
````

### Configuration Formats

````markdown
:::code-group

```typescript [TypeScript]
export default {
  port: 3000,
  debug: true,
}
```

```javascript [JavaScript]
module.exports = {
  port: 3000,
  debug: true,
}
```

```json [JSON]
{
  "port": 3000,
  "debug": true
}
```

```yaml [YAML]
port: 3000
debug: true
```

:::
````

## With Line Features

Code groups support all line features:

````markdown
:::code-group

```typescript {2} [TypeScript]
const config = {
  important: true,  // highlighted
  other: false,
}
```

```javascript {2} [JavaScript]
const config = {
  important: true,  // highlighted
  other: false,
}
```

:::
````

## Nested Content

Include text between code blocks:

````markdown
:::code-group

```typescript [Setup]
const app = createApp()
```

The configuration step:

```typescript [Config]
app.configure({ debug: true })
```

:::
````

## Synchronized Groups

Sync tab selection across multiple code groups:

````markdown
:::code-group{sync="lang"}

```typescript [TypeScript]
const x: number = 1
```

```javascript [JavaScript]
const x = 1
```

:::

Later in the document:

:::code-group{sync="lang"}

```typescript [TypeScript]
const y: string = 'hello'
```

```javascript [JavaScript]
const y = 'hello'
```

:::
````

When you select TypeScript in the first group, the second group also switches to TypeScript.

## Accessibility

Code groups are keyboard accessible:

- `Tab` - Navigate between tabs
- `Enter/Space` - Select tab
- `Arrow Left/Right` - Navigate tabs

## Best Practices

1. **Consistent ordering**: Keep tab order consistent across groups
2. **Clear labels**: Use descriptive tab labels
3. **Relevant content**: Only group related code
4. **Limit tabs**: Avoid too many tabs (max 4-5)
5. **Test sync**: Verify synchronized groups work correctly

## Related

- [Syntax Highlighting](/features/syntax-highlighting) - Code highlighting options
- [Custom Containers](/features/containers) - Container syntax
- [Markdown Features](/guide/markdown-features) - All markdown features
