# JavaScript Syntax Highlighting Test

This file tests JavaScript syntax highlighting with ts-syntax-highlighter.

## Basic JavaScript

```javascript
const greeting = 'Hello World'
console.log(greeting)
```

## Functions

```javascript
function add(a, b) {
  return a + b
}

const result = add(5, 3)
console.log(result)
```

## Arrow Functions

```javascript
const multiply = (a, b) => a * b
const square = x => x * x
```

## Classes

```javascript
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  greet() {
    return `Hello, I'm ${this.name}`
  }
}
```

## Async/Await

```javascript
async function fetchData(url) {
  try {
    const response = await fetch(url)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error:', error)
  }
}
```

## Template Literals

```javascript
const name = 'World'
const message = `Hello, ${name}!`
const multiline = `
  This is a
  multiline string
`
```

## Comments

```javascript
// Single line comment
const x = 42

/*
 * Multi-line comment
 * with multiple lines
 */
const y = 100
```
