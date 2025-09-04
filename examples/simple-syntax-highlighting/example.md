# Simple Syntax Highlighting Example

This is a basic example showing syntax highlighting with copy-to-clipboard functionality.

## TypeScript Example

```ts
interface Person {
  name: string
  age: number
}

const person: Person = {
  name: 'Alice',
  age: 30
}

console.log(`Hello, ${person.name}!`)
```

## JavaScript Example

```js
function greet(name) {
  return `Hello, ${name}!`
}

console.log(greet('World'))
```

## Python Example

```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
```

## With Line Numbers

```ts:line-numbers
function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

console.log(fibonacci(10))
```

## With Line Highlighting

```js {2,4}
function calculate(x, y) {
  // This line is highlighted
  const sum = x + y
  // This line is also highlighted
  return sum * 2
}
```
