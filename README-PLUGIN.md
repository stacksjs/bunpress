# Bun Markdown Plugin

A Bun build plugin that transforms Markdown files into HTML files.

## Features

- Converts Markdown files to HTML during build time
- Supports customizable HTML templates
- Automatically extracts titles from content
- Custom CSS and JS integration
- Metadata support for SEO

## Installation

```bash
bun install marked
```

## Usage

```ts
import { markdown } from '@stacksjs/bunpress'

// Basic usage
await Bun.build({
  entrypoints: ['docs/index.md', 'docs/guide.md'],
  outdir: './dist',
  plugins: [markdown()],
})

// With options
await Bun.build({
  entrypoints: ['docs/index.md', 'docs/guide.md'],
  outdir: './dist',
  plugins: [
    markdown({
      title: 'My Documentation',
      meta: {
        description: 'Documentation for my project',
        author: 'BunPress Team',
      },
      css: `
        body {
          font-family: system-ui, sans-serif;
          max-width: 80ch;
          margin: 0 auto;
          padding: 2rem;
        }
      `,
      scripts: [
        '/js/highlight.js',
      ],
    }),
  ],
})
```

## Options

| Option | Type | Description |
|--------|------|-------------|
| `template` | `string` | Custom HTML template with `{{content}}` placeholder for the Markdown content |
| `css` | `string` | Custom CSS to be included in the head of the document |
| `scripts` | `string[]` | List of script URLs to be included at the end of the body |
| `title` | `string` | Title for HTML documents (uses first h1 from content if not provided) |
| `meta` | `Record<string, string>` | Metadata for HTML documents as key-value pairs |
| `markedOptions` | `object` | Custom options for the Marked Markdown parser |

## Custom Template

You can provide your own HTML template with a `{{content}}` placeholder:

```ts
markdown({
  template: `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My Custom Template</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <header>
          <nav><!-- Navigation here --></nav>
        </header>

        <main>
          {{content}}
        </main>

        <footer>
          &copy; 2023 My Project
        </footer>

        <script src="/main.js"></script>
      </body>
    </html>
  `,
})
```

## License

MIT
