---
title: Markdown Features
description: Rich markdown features for beautiful documentation
---

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
