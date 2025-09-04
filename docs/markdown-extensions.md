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

BunPress provides enhanced syntax highlighting with support for line highlighting.

### Basic Syntax Highlighting

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`)
}

greet('World')
```

### Line Highlighting

```javascript{2-4}
function greet(name) {
  console.log(`Hello, ${name}!`)
  return `Greeting sent to ${name}`
}

greet('World')
```

### Multiple Line Ranges

```python{1,3-5,7}
def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# Example usage
print(fibonacci(10))
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

These extensions are enabled by default. You can configure them in your `bunpress.config.ts`:

```typescript
export default {
  markdown: {
    // Custom marked options
    markedOptions: {
      // Configure marked extensions
    }
  }
}
```
