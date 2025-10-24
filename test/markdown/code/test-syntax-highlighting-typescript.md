# TypeScript Syntax Highlighting Test

This file tests TypeScript syntax highlighting with ts-syntax-highlighter.

## Basic Types

```typescript
const name: string = 'John'
const age: number = 30
const isActive: boolean = true
```

## Interfaces

```typescript
interface User {
  name: string
  age: number
  email?: string
}

function greetUser(user: User): string {
  return `Hello, ${user.name}!`
}
```

## Type Aliases

```typescript
type ID = string | number
type Status = 'pending' | 'active' | 'inactive'

interface Task {
  id: ID
  status: Status
  title: string
}
```

## Generics

```typescript
function identity<T>(arg: T): T {
  return arg
}

class DataService<T> {
  private items: T[] = []

  add(item: T): void {
    this.items.push(item)
  }

  getAll(): T[] {
    return this.items
  }
}
```

## Advanced Types

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

type AsyncFunction<T> = (...args: any[]) => Promise<T>
```

## Decorators

```typescript
function log(target: any, key: string) {
  console.log(`${key} was called`)
}

class Example {
  @log
  method() {
    return 'result'
  }
}
```
