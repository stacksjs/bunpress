---
title: Markdown Features
description: Rich markdown features for beautiful documentation
---

# Markdown Features

BunPress supports VitePress-compatible markdown features for creating rich, interactive documentation.

## Custom Containers

Use custom containers to highlight important content:

### Info Container

```markdown
::: info
This is an informational message.
:::
```

::: info
This is an informational message.
:::

### Tip Container

```markdown
::: tip
Here's a helpful tip for you!
:::
```

::: tip
Here's a helpful tip for you!
:::

### Warning Container

```markdown
::: warning
Be careful with this operation.
:::
```

::: warning
Be careful with this operation.
:::

### Danger Container

```markdown
::: danger
This action cannot be undone!
:::
```

::: danger
This action cannot be undone!
:::

### Details Container

Create collapsible sections:

```markdown
::: details Click to expand
Hidden content that can be revealed.

- Item 1
- Item 2
- Item 3
:::
```

::: details Click to expand
Hidden content that can be revealed.

- Item 1
- Item 2
- Item 3
:::

### Custom Titles

Add custom titles to containers:

```markdown
::: info Custom Title
Content with a custom title.
:::

::: tip Pro Tip
Advanced technique for experts.
:::
```

## GitHub-Flavored Alerts

BunPress supports GitHub's alert syntax:

### Note

```markdown
> [!NOTE]
> Useful information that users should know.
```

> [!NOTE]
> Useful information that users should know.

### Tip

```markdown
> [!TIP]
> Helpful advice for doing things better.
```

> [!TIP]
> Helpful advice for doing things better.

### Important

```markdown
> [!IMPORTANT]
> Key information users need to know.
```

> [!IMPORTANT]
> Key information users need to know.

### Warning

```markdown
> [!WARNING]
> Urgent info that needs immediate attention.
```

> [!WARNING]
> Urgent info that needs immediate attention.

### Caution

```markdown
> [!CAUTION]
> Advises about risks or negative outcomes.
```

> [!CAUTION]
> Advises about risks or negative outcomes.

## Code Blocks

### Basic Syntax Highlighting

````markdown
```typescript
function greet(name: string): string {
  return `Hello, ${name}!`
}
```
````

```typescript
function greet(name: string): string {
  return `Hello, ${name}!`
}
```

### Line Highlighting

Highlight specific lines:

````markdown
```typescript{2,4-5}
function example() {
  const highlighted = true
  const normal = false
  return highlighted
    && normal
}
```
````

### Line Numbers

Show line numbers:

````markdown
```typescript:line-numbers
const first = 1
const second = 2
const third = 3
```
````

### Code Diffs

Show added and removed lines:

````markdown
```typescript
const oldValue = 'before'  // [!code --]
const newValue = 'after'   // [!code ++]
```
````

### Error and Warning Markers

Highlight errors and warnings:

````markdown
```typescript
const valid = true
const invalid = undefined  // [!code error]
const suspicious = null    // [!code warning]
```
````

## Code Groups

Display multiple code variants in tabs:

````markdown
::: code-group
```bash [npm]
npm install @stacksjs/bunpress
```

```bash [yarn]
yarn add @stacksjs/bunpress
```

```bash [pnpm]
pnpm add @stacksjs/bunpress
```

```bash [bun]
bun add @stacksjs/bunpress
```
:::
````

## Code Imports

Import code from external files:

```markdown
<<< @/snippets/example.ts

<<< @/snippets/example.ts{2-5}

<<< @/snippets/example.ts#region-name
```

## Tables

### Basic Tables

```markdown
| Feature | Status |
|---------|--------|
| Containers | Supported |
| Alerts | Supported |
| Code Groups | Supported |
```

| Feature | Status |
|---------|--------|
| Containers | Supported |
| Alerts | Supported |
| Code Groups | Supported |

### Aligned Tables

```markdown
| Left | Center | Right |
|:-----|:------:|------:|
| L1 | C1 | R1 |
| L2 | C2 | R2 |
```

## Inline Formatting

### Text Styles

```markdown
**Bold text**
*Italic text*
~~Strikethrough~~
`inline code`
```

**Bold text**, *Italic text*, ~~Strikethrough~~, `inline code`

### Subscript and Superscript

```markdown
H~2~O (subscript)
E=mc^2^ (superscript)
```

### Highlighting

```markdown
==highlighted text==
```

## Badges

Add inline badges:

```markdown
<Badge type="info" text="v2.0" />
<Badge type="tip" text="New" />
<Badge type="warning" text="Beta" />
<Badge type="danger" text="Deprecated" />
```

## Emoji

Use emoji shortcodes:

```markdown
:tada: :rocket: :sparkles: :fire: :heart:
```

## Custom Header Anchors

Customize heading anchor IDs:

```markdown
## My Custom Heading {#custom-id}
```

## Inline Table of Contents

Insert TOC anywhere in your content:

```markdown
[[toc]]
```

## File Includes

Include content from other markdown files:

```markdown
<!--@include: ./shared/header.md-->

Content here...

<!--@include: ./shared/footer.md-->
```

## Images

### Basic Images

```markdown
![Alt text](/images/screenshot.png)
```

### Images with Captions

```markdown
![Screenshot of BunPress](/images/screenshot.png "BunPress Dashboard")
```

Images are automatically lazy-loaded for better performance.

## External Links

External links automatically:
- Open in a new tab (`target="_blank"`)
- Include security attributes (`rel="noreferrer noopener"`)
- Show an external link icon

## Configuring Features

Enable or disable features in your config:

```typescript
const config: BunPressOptions = {
  markdown: {
    features: {
      containers: true,
      githubAlerts: true,
      codeBlocks: {
        lineHighlighting: true,
        lineNumbers: true,
        focus: true,
        diffs: true,
      },
      codeGroups: true,
      emoji: true,
    },
  },
}
```

See the [Configuration Guide](/guide/configuration) for all available options.
