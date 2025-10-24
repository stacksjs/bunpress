# CSS Syntax Highlighting Test

This file tests CSS syntax highlighting with ts-syntax-highlighter.

## Basic CSS

```css
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

## Colors and Gradients

```css
.box {
  background: linear-gradient(to right, #667eea, #764ba2);
  color: #333;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
```

## Media Queries

```css
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}

@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: #fff;
  }
}
```

## Grid Layout

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 2rem;
}
```

## Animations

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.element {
  animation: fadeIn 0.3s ease-in-out;
}
```
