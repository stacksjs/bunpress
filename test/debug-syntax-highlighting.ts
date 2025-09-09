import { buildTestSite, readBuiltFile } from './utils/test-helpers'

async function debugSyntaxHighlighting() {
  const content = `# Test Page

\`\`\`ts
interface User {
  name: string
  age: number
}

const user: User = {
  name: 'John',
  age: 30
}
\`\`\`
`

  const result = await buildTestSite({
    files: [{ path: 'test.md', content }],
  })

  if (result.success) {
    const html = await readBuiltFile(result.outputs[0])
    console.log('Generated HTML:')
    console.log('================')
    console.log(html)
  }
  else {
    console.error('Build failed:', result.logs)
  }
}

debugSyntaxHighlighting().catch(console.error)
