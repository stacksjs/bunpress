---
title: Markdown Extensions Example
description: Showcasing enhanced markdown processing features
author: BunPress Team
layout: doc
toc: sidebar
---

# Markdown Extensions Showcase

This example demonstrates enhanced markdown processing features.

## Custom Containers

### Info Container

::: info
This is an informational message that provides helpful context.
:::

### Tip Container

::: tip
💡 **Pro tip:** Use keyboard shortcuts to speed up your workflow!
:::

### Warning Container

::: warning
⚠️ **Warning:** This action cannot be undone.
:::

### Danger Container

::: danger
🚨 **Danger:** This operation will permanently delete data.
:::

## Emoji Support

I :heart: working with markdown and :thumbsup: these features!

### Emoji in Headings

## Getting Started :rocket:

### Multiple Emojis

:smile: :heart: :thumbsup: :rocket: :sparkles:

## Math Equations

### Inline Math

The famous equation $E = mc^2$ shows the relationship between energy and mass.

### Block Math

The quadratic formula is:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

## Code Highlighting

### TypeScript Example

```ts
interface User {
  name: string
  age: number
}

const user: User = {
  name: 'Alice',
  age: 30
}

console.log(\`Hello, \${user.name}!\`)
```

### JavaScript Example

```js
function greet(name) {
  return \`Hello, \${name}!\`
}

console.log(greet('World'))
```

### With Line Highlighting

```js {2,4}
function calculate(x, y) {
  // This line is highlighted
  const sum = x + y
  // This line is also highlighted
  return sum * 2
}
```

This example showcases all the enhanced markdown features.
