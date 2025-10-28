import type { ESLintConfig } from '@stacksjs/eslint-config'
import stacks from '@stacksjs/eslint-config'

const config: ESLintConfig = stacks({
  stylistic: {
    indent: 2,
    quotes: 'single',
  },

  typescript: true,
  jsonc: true,
  yaml: true,
  ignores: [
    'fixtures/**',
    'examples/**',
    'docs/**',
    '**/*.md',
    'dist/**',
    'build/**',
    '.bunpress/**',
    'temp/**',
    'test/fixtures/**',
    'test/**/temp/**',
    'test/**/*.html',
    'test/blocks/**/test.md',
    'test/use-cases/**/test.md',
    'bin/**',
  ],
})

export default config
