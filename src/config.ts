import type { BunPressOptions } from './types'
import { loadConfig } from 'bunfig'

export const defaultConfig: BunPressOptions = {
  // Default markdown plugin configuration
  markdown: {
    title: 'BunPress Documentation',
    meta: {
      description: 'Documentation built with BunPress',
      generator: 'BunPress',
      viewport: 'width=device-width, initial-scale=1.0',
    },
    css: `
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }

      .markdown-body {
        padding: 1rem;
      }

      pre {
        background: #f5f5f5;
        border-radius: 3px;
        padding: 12px;
        overflow: auto;
      }

      code {
        font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
        font-size: 0.9em;
      }

      a {
        color: #1F1FE9;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      img {
        max-width: 100%;
      }

      h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5em;
        margin-bottom: 0.75em;
      }

      h1 {
        border-bottom: 1px solid #eaecef;
        padding-bottom: 0.3em;
      }
    `,
    scripts: [],
    preserveDirectoryStructure: true,
  },

  verbose: true,
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: BunPressOptions = await loadConfig({
  name: 'bunpress',
  defaultConfig,
})
