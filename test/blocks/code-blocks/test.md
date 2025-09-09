---
title: Code Blocks Test
description: Comprehensive test of code block syntax highlighting and features
author: BunPress Team
layout: doc
toc: sidebar
---

# Code Blocks Test

This document tests all code block features including syntax highlighting, line numbers, and line highlighting.

## Basic Code Block

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('World'));
```

## Code Block with Language

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

class UserService {
  private users: User[] = [];

  async createUser(userData: Partial<User>): Promise<User> {
    const user: User = {
      id: Date.now(),
      name: userData.name || 'Anonymous',
      email: userData.email || '',
      createdAt: new Date()
    };

    this.users.push(user);
    return user;
  }

  findUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
}
```

## Code Block with Line Numbers

```typescript:line-numbers
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

async function processFile(inputPath: string, outputPath: string): Promise<void> {
  try {
    // Read the input file
    const content = await readFile(inputPath, 'utf8');

    // Process the content (example: convert to uppercase)
    const processedContent = content.toUpperCase();

    // Write to output file
    await writeFile(outputPath, processedContent, 'utf8');

    console.log('File processed successfully!');
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
}

// Usage example
const inputFile = './input.txt';
const outputFile = './output.txt';
processFile(inputFile, outputFile);
```

## Code Block with Line Highlighting

```javascript {1,3-5,8}
const express = require('express');
const app = express();
const port = 3000;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.post('/users', (req, res) => {
  const user = req.body;
  // Process user data here
  res.status(201).json(user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

## Code Block with Range Highlighting

```python {1-3,7-10}
import asyncio
import aiohttp
from typing import List, Dict, Any

async def fetch_user_data(user_id: int) -> Dict[str, Any]:
    """Fetch user data from API"""
    async with aiohttp.ClientSession() as session:
        async with session.get(f'https://api.example.com/users/{user_id}') as response:
            return await response.json()

async def process_users(user_ids: List[int]) -> List[Dict[str, Any]]:
    """Process multiple users concurrently"""
    tasks = [fetch_user_data(user_id) for user_id in user_ids]
    return await asyncio.gather(*tasks)

# Usage
async def main():
    user_ids = [1, 2, 3, 4, 5]
    users_data = await process_users(user_ids)
    print(f"Processed {len(users_data)} users")

if __name__ == "__main__":
    asyncio.run(main())
```

## Multiple Code Blocks

### HTML Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sample Page</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Welcome to My Website</h1>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section>
      <h2>About This Site</h2>
      <p>This is a sample website built with HTML and CSS.</p>
    </section>
  </main>
</body>
</html>
```

### CSS Example

```css
/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f4f4f4;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  text-align: center;
}

nav ul {
  list-style: none;
  padding: 0;
}

nav ul li {
  display: inline;
  margin: 0 1rem;
}

nav a {
  color: white;
  text-decoration: none;
  transition: opacity 0.3s;
}

nav a:hover {
  opacity: 0.8;
}
```

### JSON Example

```json
{
  "name": "bunpress",
  "version": "1.0.0",
  "description": "Modern documentation engine",
  "main": "dist/index.js",
  "scripts": {
    "build": "bun run build.ts",
    "test": "bun test",
    "dev": "bun --watch src/index.ts"
  },
  "dependencies": {
    "@unocss/runtime": "^0.58.0",
    "marked": "^12.0.0",
    "shiki": "^1.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "bun-types": "^1.0.0"
  },
  "keywords": ["documentation", "markdown", "static-site"],
  "author": "BunPress Team",
  "license": "MIT"
}
```

## Code Blocks in Lists

1. First, install the dependencies:

   ```bash
   npm install bunpress
   ```

2. Create a configuration file:

   ```typescript
   export default {
     title: 'My Documentation',
     theme: 'default'
   }
   ```

3. Build your documentation:

   ```bash
   npx bunpress build
   ```

## Code Blocks with Special Characters

```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (username, email, password_hash) VALUES
('admin', 'admin@example.com', '$2b$10$...'),
('user1', 'user1@example.com', '$2b$10$...');

-- Query users
SELECT id, username, email, created_at
FROM users
WHERE created_at > '2024-01-01'
ORDER BY created_at DESC;
```

## Inline Code

This is `inline code` within a paragraph. You can also use `const variable = 'value'` or `functionName()` for inline code examples.

## Code Blocks with Unicode

```rust
use std::collections::HashMap;

fn main() {
    let mut users: HashMap<String, String> = HashMap::new();

    // 用户数据 (Chinese comments)
    users.insert("admin".to_string(), "管理员".to_string());
    users.insert("user1".to_string(), "用户1".to_string());

    // 遍历用户 (Iterate through users)
    for (key, value) in &users {
        println!("{}: {}", key, value);
    }

    // 特殊字符 (Special characters)
    let symbols = "∑∆∞√∫αβγδεζηθικλμνξοπρστυφχψω";
    println!("Mathematical symbols: {}", symbols);
}
```

## Empty Code Block

```

```

## Code Block with Only Whitespace

```javascript

```

## Very Long Code Block

```python
def fibonacci_generator(n: int):
    """
    Generate the first n Fibonacci numbers using a generator.

    This function demonstrates:
    - Generator functions in Python
    - Type hints
    - Docstrings
    - Fibonacci sequence calculation
    - Efficient memory usage

    Args:
        n (int): Number of Fibonacci numbers to generate

    Yields:
        int: Next Fibonacci number in sequence

    Example:
        >>> list(fibonacci_generator(10))
        [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
    """
    if n <= 0:
        return

    # First Fibonacci number
    yield 0
    if n == 1:
        return

    # Second Fibonacci number
    yield 1
    if n == 2:
        return

    # Generate remaining numbers
    a, b = 0, 1
    for _ in range(2, n):
        a, b = b, a + b
        yield b

# Usage examples
print("First 15 Fibonacci numbers:")
for i, fib in enumerate(fibonacci_generator(15), 1):
    print("2d")

print("\\nFibonacci numbers less than 100:")
fib_nums = []
for fib in fibonacci_generator(20):
    if fib >= 100:
        break
    fib_nums.append(fib)

print(fib_nums)
```

## Code Block with Mixed Languages in Same File

```bash
#!/bin/bash
# Build script for BunPress

echo "Building BunPress documentation..."

# Install dependencies
npm install

# Build the project
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Output files:"
    ls -la dist/
else
    echo "❌ Build failed!"
    exit 1
fi
```

```powershell
# PowerShell build script (alternative)

Write-Host "Building BunPress documentation..." -ForegroundColor Green

# Install dependencies
npm install

# Build the project
npm run build

# Check build result
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host "📁 Output files:" -ForegroundColor Cyan
    Get-ChildItem -Path "dist" -Recurse | Format-Table Name, Length
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
```
