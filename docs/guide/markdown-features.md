---
title: Markdown Features
description: Rich markdown features for beautiful documentation
---

```markdown
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

Put each include directive on its own line. Include paths are relative to the
documentation root. Links inside included content resolve from that included
file's directory, including recursive includes, while keeping the rendered
page's locale. Inline includes are refused because their source boundaries
cannot be preserved reliably through Markdown parsing.

Use inline links in documents that expand includes. Reference definitions can
bind uses across file boundaries, and the Markdown parser does not expose the
definition's source location. These documents refuse reference definitions;
literal examples in code spans, fenced blocks and HTML code remain supported.
Reference validation is bounded to 256 candidate labels per expanded document.
Split a document that exceeds this limit. Documents without includes continue
to support reference-style links.

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

## Documentation Links

Use source-relative Markdown links so authored files also work on GitHub:

```markdown
[Overview](../overview.md#configuration)
[This section](index.md)
[Reference](README.md)
[Named reference][guide]

[guide]: ../guide.md?example=1#setup
```

Native builds and dev serving map these destinations to the generated page
routes and apply the configured base path. For example, a page in `docs/guide/`
linking to `../overview.md` becomes `/overview`, or `/docs/overview` with
`basePath: '/docs'`. `index.md` uses its directory route; `README.md` keeps a
`README` route. Query strings and fragments stay attached to the destination.

Unqualified sources use the current rendered locale, including fallback
content. An explicit language suffix such as `guide.en.md` selects that language
even when the referring page uses another locale.

External URLs, image destinations, links outside the documentation source tree,
and literal code examples stay unchanged. Use explicit repository URLs for
source and evidence references that should open on GitHub.

A missing linked Markdown source or two sources sharing one output route
refuses the build. A failed rebuild keeps the previous complete output. Builds
in one process queue for the same output; another process holding that output's
lock causes a clear refusal. Before manually removing a stale `.bunpress.lock`
directory, inspect its `owner.json` and verify that the recorded builder has
stopped.

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
