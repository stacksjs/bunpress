# JSON Syntax Highlighting Test

This file tests JSON syntax highlighting with ts-syntax-highlighter.

## Basic JSON

```json
{
  "name": "bunpress",
  "version": "1.0.0",
  "description": "A modern documentation engine"
}
```

## Nested Objects

```json
{
  "user": {
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com",
    "address": {
      "city": "New York",
      "country": "USA"
    }
  }
}
```

## Arrays

```json
{
  "tags": ["typescript", "bun", "documentation"],
  "versions": [1, 2, 3, 4, 5],
  "features": [
    {
      "name": "Syntax Highlighting",
      "enabled": true
    },
    {
      "name": "Dark Mode",
      "enabled": false
    }
  ]
}
```

## Package.json Example

```json
{
  "name": "@stacksjs/bunpress",
  "type": "module",
  "version": "0.0.5",
  "dependencies": {
    "ts-syntax-highlighter": "^0.1.0"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "bun-plugin-dtsx": "0.9.5"
  }
}
```
