# Custom Containers

BunPress supports custom containers for callouts, warnings, tips, and other styled content blocks.

## Basic Containers

### Info

```markdown
:::info
This is an informational message.
:::
```

### Tip

```markdown
:::tip
Here's a helpful tip for you!
:::
```

### Warning

```markdown
:::warning
Be careful with this operation.
:::
```

### Danger

```markdown
:::danger
This action cannot be undone!
:::
```

### Details (Collapsible)

```markdown
:::details Click to expand
Hidden content that can be revealed.
:::
```

## Custom Titles

Override the default title:

```markdown
:::tip Pro Tip
This is an advanced technique.
:::

:::warning Breaking Change
This feature changed in v2.0.
:::

:::danger Security Alert
Never expose your API keys.
:::
```

## GitHub-Style Alerts

BunPress also supports GitHub-style alerts:

```markdown
> [!NOTE]
> Useful information that users should know.

> [!TIP]
> Helpful advice for doing things better.

> [!IMPORTANT]
> Key information users need to know.

> [!WARNING]
> Urgent info that needs immediate attention.

> [!CAUTION]
> Advises about risks or negative outcomes.
```

## Configuration

### Enable Containers

```typescript
// bunpress.config.ts
export default {
  markdown: {
    features: {
      containers: true,
      githubAlerts: true,
    },
  },
}
```

### Custom Container Types

```typescript
export default {
  markdown: {
    customContainers: [
      {
        type: 'success',
        defaultTitle: 'Success',
        icon: 'check-circle',
      },
      {
        type: 'quote',
        defaultTitle: 'Quote',
        render: (tokens, idx) => {
          // Custom render function
        },
      },
    ],
  },
}
```

## Styling

### Built-in Styles

BunPress includes default styles for all container types:

```css
/* Info container */
.custom-container.info {
  background-color: #e7f3ff;
  border-left: 4px solid #3b82f6;
}

/* Tip container */
.custom-container.tip {
  background-color: #e6ffed;
  border-left: 4px solid #22c55e;
}

/* Warning container */
.custom-container.warning {
  background-color: #fff8e6;
  border-left: 4px solid #f59e0b;
}

/* Danger container */
.custom-container.danger {
  background-color: #ffe6e6;
  border-left: 4px solid #ef4444;
}
```

### Custom CSS

```css
/* Custom success container */
.custom-container.success {
  background-color: #d4edda;
  border-left: 4px solid #28a745;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
}

.custom-container.success .custom-container-title {
  color: #155724;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
```

### Theme Variables

```typescript
export default {
  themeConfig: {
    containers: {
      info: {
        background: 'var(--vp-custom-block-info-bg)',
        border: 'var(--vp-custom-block-info-border)',
        text: 'var(--vp-custom-block-info-text)',
      },
      tip: {
        background: 'var(--vp-custom-block-tip-bg)',
        border: 'var(--vp-custom-block-tip-border)',
        text: 'var(--vp-custom-block-tip-text)',
      },
    },
  },
}
```

## Container Content

### Markdown Inside

Containers support full markdown:

```markdown
:::tip Using Code in Containers
You can include code blocks:

`​``typescript
const example = 'works'
`​``

And **bold**, *italic*, and [links](/).
:::
```

### Lists

```markdown
:::warning Prerequisites
Before continuing, ensure you have:
- Node.js 18+
- Bun installed
- Git configured
:::
```

### Nested Containers

```markdown
:::info Outer Container
This is the outer container.

:::tip Nested Tip
This is nested inside.
:::

Back to outer content.
:::
```

## Icons

### Default Icons

Each container type has a default icon:
- `info` - Information circle
- `tip` - Light bulb
- `warning` - Warning triangle
- `danger` - Error circle

### Custom Icons

```typescript
export default {
  markdown: {
    containerIcons: {
      info: 'mdi:information',
      tip: 'mdi:lightbulb',
      warning: 'mdi:alert',
      danger: 'mdi:alert-circle',
      success: 'mdi:check-circle',
    },
  },
}
```

### Disable Icons

```markdown
:::info{icon=false}
Container without icon.
:::
```

## Collapsible Details

### Default Open

```markdown
:::details{open} Expanded by Default
This content is visible initially.
:::
```

### Custom Summary

```markdown
:::details Show/Hide Code
`​``typescript
const hidden = 'code'
`​``
:::
```

## Accessibility

Containers are accessible by default:
- Proper ARIA roles
- Semantic HTML structure
- Keyboard navigation for collapsible

## Examples

### API Deprecation

```markdown
:::warning Deprecated
This API will be removed in v3.0. Use `newMethod()` instead.

`​``typescript
// Old (deprecated)
oldMethod()

// New (recommended)
newMethod()
`​``
:::
```

### Version Requirements

```markdown
:::info Version 2.0+
This feature requires BunPress 2.0 or higher.
:::
```

### Security Notice

```markdown
:::danger Security
Never commit sensitive data:
- API keys
- Passwords
- Private keys

Use environment variables instead.
:::
```

## Best Practices

1. **Use sparingly**: Don't overuse containers
2. **Appropriate type**: Match container type to content importance
3. **Clear titles**: Use descriptive custom titles
4. **Keep brief**: Containers work best with concise content
5. **Consistent style**: Use the same container types throughout

## Related

- [Code Groups](/features/code-groups) - Tabbed code blocks
- [Markdown Features](/guide/markdown-features) - All markdown features
- [Theming](/advanced/theming) - Customize container styles
