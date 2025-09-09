---
title: Tip Blocks Test
description: Comprehensive test of tip container blocks in BunPress
author: BunPress Team
layout: doc
toc: sidebar
---

# Tip Blocks Test

This document tests various tip block formats in BunPress.

## Basic Tip Container

::: tip
This is a basic tip container with default styling.
:::

## Tip Container with Custom Title

::: tip Custom Tip Title
This tip container has a custom title specified.
:::

## Tip Container with Emoji

::: tip 💡 Pro Tip
This tip container has a custom title with emoji.
:::

## Tip Container with Multiple Paragraphs

::: tip Important Information
This is the first paragraph in a tip container.

This is the second paragraph with more detailed information.

And here's a third paragraph with additional context and recommendations.
:::

## Tip Container with Code Block

::: tip Code Example
Here's a code example inside a tip container:

```javascript
function greet(name) {
  return `Hello, ${name}!`
}
```

:::

## Tip Container with List

::: tip Best Practices
Here are some best practices:

- Always validate user input
- Use descriptive variable names
- Write tests for your code
- Keep functions small and focused
:::

## Tip Container with Links and Emphasis

::: tip Helpful Resources
**Important:** Check these useful resources.

Visit the [documentation page](/docs) for more information.

*Note:* These resources are maintained by the community.
:::

## Empty Tip Container

::: tip
:::

## Nested Tip Container

::: tip Outer Tip
This tip contains another tip inside:

::: tip Nested Tip
This is a nested tip container.
:::

Here's some more content in the outer tip.
:::

## Tip Container with Special Characters

::: tip Special Characters: @#$%^&*()
This container contains special characters: !@#$%^&*()_+-=[]{}|;:,.<>?
:::

## Tip Container with Table

::: tip Data Table
Here's a table inside a tip container:

| Feature | Status | Description |
|---------|--------|-------------|
| Basic Tip | ✅ | Working |
| Custom Title | ✅ | Working |
| Nested Tip | ✅ | Working |
| Code Block | ✅ | Working |
:::

## Tip Container with Blockquote

::: tip Quoted Content
Here's a blockquote inside a tip container:

> This is a blockquote inside a tip container.
> It can span multiple lines and maintains proper formatting.
:::

## Tip Container with Unicode Characters

::: tip 🌟 Unicode Support
This tip includes various Unicode characters:

- Emojis: 🚀✨💡🔥
- Symbols: ∑∆∞√∫
- Letters: αβγδεζηθικλμνξοπρστυφχψω
- Chinese: 你好世界
- Arabic: مرحبا بالعالم
:::
