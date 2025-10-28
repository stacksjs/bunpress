# HTML Syntax Highlighting Test

This file tests HTML syntax highlighting with ts-syntax-highlighter.

## Basic HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Test Page</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

## Forms

```html
<form action="/submit" method="POST">
  <label for="name">Name:</label>
  <input type="text" id="name" name="name" required>

  <label for="email">Email:</label>
  <input type="email" id="email" name="email">

  <button type="submit">Submit</button>
</form>
```

## Data Attributes

```html
<div class="container" data-theme="dark" data-id="123">
  <button data-action="delete" aria-label="Delete item">
    Delete
  </button>
</div>
```

## HTML5 Elements

```html
<article>
  <header>
    <h1>Article Title</h1>
    <time datetime="2024-01-01">January 1, 2024</time>
  </header>
  <section>
    <p>Article content goes here.</p>
  </section>
  <footer>
    <p>Author information</p>
  </footer>
</article>
```
