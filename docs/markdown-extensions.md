# Markdown Extensions

BunPress extends standard Markdown with powerful features to enhance your documentation experience.

## Custom Containers

BunPress supports custom containers for creating visually distinct content blocks.

### Info Container

```markdown
::: info
This is an informational note.
:::
```

::: info
This is an informational note.
:::

### Tip Container

```markdown
::: tip
This is a helpful tip.
:::
```

::: tip
This is a helpful tip.
:::

### Warning Container

```markdown
::: warning
This is a warning message.
:::
```

::: warning
This is a warning message.
:::

### Danger Container

```markdown
::: danger
This indicates dangerous or potentially harmful actions.
:::
```

::: danger
This indicates dangerous or potentially harmful actions.
:::

### Details Container

```markdown
::: details
This content is hidden by default and can be expanded.
:::
```

::: details
This content is hidden by default and can be expanded.
:::

## Emoji Support

BunPress supports emoji shortcodes for easy emoji insertion.

```markdown
I :heart: BunPress!

This feature is :fire:!
```

I :heart: BunPress!

This feature is :fire:!

### Supported Emojis

- `:heart:` → ❤️
- `:fire:` → 🔥
- `:thumbsup:` → 👍
- `:rocket:` → 🚀
- `:star:` → ⭐
- `:smile:` → 😊
- `:tada:` → 🎉
- `:warning:` → ⚠️
- `:check:` → ✅
- `:x:` → ❌

And many more! BunPress uses the comprehensive emoji shortcode database.

## Math Equations

BunPress supports both inline and block math equations using LaTeX syntax.

### Inline Math

```markdown
The Pythagorean theorem: $a^2 + b^2 = c^2$
```

The Pythagorean theorem: $a^2 + b^2 = c^2$

### Block Math

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

### Mixed Equations

```markdown
When $a \ne 0$, there are two solutions to $ax^2 + bx + c = 0$:

$$
x = {-b \pm \sqrt{b^2-4ac} \over 2a}
$$
```

When $a \ne 0$, there are two solutions to $ax^2 + bx + c = 0$:

$$
x = {-b \pm \sqrt{b^2-4ac} \over 2a}
$$

## Syntax Highlighting

BunPress provides advanced syntax highlighting powered by Shiki, supporting multiple languages with beautiful themes and interactive features.

### Basic Syntax Highlighting

BunPress supports syntax highlighting for over 40 programming languages:

```typescript
interface User {
  name: string
  age: number
  email?: string
}

const user: User = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com'
}

function greet(user: User): string {
  return `Hello, ${user.name}!`
}

console.log(greet(user))
```

### Copy-to-Clipboard

Hover over any code block to see the copy button in the top-right corner. Click to copy the code to your clipboard with visual feedback.

```javascript
const { readFile } = require('fs').promises

async function readConfig() {
  try {
    const config = await readFile('./config.json', 'utf8')
    return JSON.parse(config)
  } catch (error) {
    console.error('Failed to read config:', error)
    return {}
  }
}
```

### Line Numbers

Add `:line-numbers` to enable line numbers:

```typescript:line-numbers
function calculateTotal(items) {
  let total = 0
  for (const item of items) {
    total += item.price * item.quantity
  }
  return total
}

const items = [
  { name: 'Apple', price: 1.50, quantity: 3 },
  { name: 'Banana', price: 0.75, quantity: 2 }
]

console.log(calculateTotal(items))
```

### Line Highlighting

Highlight specific lines using curly braces:

```python {2,4-6}
def process_data(data):
    # This line is highlighted
    if not data:
        return None

    # These lines are highlighted
    processed = []
    for item in data:
        processed.append(item.upper())

    return processed
```

### Combined Features

You can combine line numbers with highlighting:

```javascript:line-numbers {3,7-9}
import { Component } from 'react'

interface Props {
  title: string
  items: string[]
}

export default function ListComponent({ title, items }: Props) {
  // This line is highlighted
  return (
    <div>
      <h2>{title}</h2>
      <ul>
        {/* These lines are highlighted */}
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
```

### Multiple Languages

BunPress supports a wide range of programming languages:

**Web Technologies:**

```html
<div class="container">
  <h1>Hello World</h1>
  <p>This is a sample HTML document.</p>
</div>
```

```css
.highlighted {
  background-color: yellow;
  padding: 0.5em;
  border-radius: 0.375rem;
}

.error {
  color: red;
  font-weight: bold;
}
```

**Backend Languages:**

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

**Databases:**

```sql
SELECT
    u.id,
    u.username,
    u.email,
    p.first_name,
    p.last_name
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.active = true
ORDER BY u.created_at DESC
```

**Configuration Files:**

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

### File Information

Add file names to code blocks:

```typescript [src/utils/helpers.ts]
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
```

### Diff Highlighting

Highlight changes in diff format:

```diff
+ const newFeature = 'This line was added'
+ const enhancedFunction = () => {
+   console.log('Enhanced functionality')
+ }

- const oldFeature = 'This line was removed'
- const basicFunction = () => {
-   console.log('Basic functionality')
- }

  const unchanged = 'This line stayed the same'
```

## Combined Extensions

All extensions work seamlessly together:

```markdown
::: tip
Here's a :fire: tip with math: $E = mc^2$

```javascript{2}
function energy(mass) {
  const c = 299792458 // speed of light
  return mass * c * c
}
```

Try it out! :rocket:
:::

```

::: tip
Here's a :fire: tip with math: $E = mc^2$

```javascript{2}
function energy(mass) {
  const c = 299792458 // speed of light
  return mass * c * c
}
```

Try it out! :rocket:
:::

## Configuration

The syntax highlighting features are enabled by default and require no additional configuration. However, you can customize the behavior through your `bunpress.config.ts`:

```typescript
export default {
  markdown: {
    // Custom marked options for advanced configuration
    markedOptions: {
      // Configure marked extensions
    }
  }
}
```

### Supported Languages

BunPress supports syntax highlighting for the following languages out of the box:

- **Web Technologies**: JavaScript, TypeScript, HTML, CSS, JSON, YAML
- **Backend Languages**: Python, Go, Rust, Ruby, PHP, Java, C/C++, C#
- **Databases**: SQL, GraphQL
- **DevOps**: Bash, Shell, Docker, Nginx
- **Data Science**: R, MATLAB
- **Mobile**: Swift, Kotlin, Dart
- **Other**: Markdown, XML, TOML, INI, Diff, Log files

### Theme Support

The syntax highlighting uses Shiki with the following built-in themes:

- `light-plus` (default)
- `dark-plus`
- Additional themes can be configured by modifying the plugin setup

### Performance Notes

- Shiki highlighter is initialized once at build start for optimal performance
- Code blocks are cached to avoid re-processing identical content
- Large code blocks are handled efficiently with proper HTML structure

### Browser Compatibility

- **Modern browsers**: Full Clipboard API support with visual feedback
- **Legacy browsers**: Fallback to `document.execCommand` for copying
- **Progressive enhancement**: Features gracefully degrade on older browsers

### Accessibility

All syntax highlighting features are designed with accessibility in mind:

- Copy buttons have proper ARIA labels and keyboard navigation
- Line numbers are properly associated with their content
- Color schemes follow WCAG guidelines for contrast
- Screen reader friendly markup structure
