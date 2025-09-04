import { describe, expect, test } from 'bun:test'
import { createTestMarkdown, buildTestSite, readBuiltFile, assertHtmlContains } from './utils/test-helpers'

describe('Custom Template Engine', () => {
  describe('STX Template Processing', () => {
    test('should process @if conditions', async () => {
      const template = `
<div class="content">
  @if($frontmatter.published)
    <p>Published: {{ $frontmatter.date }}</p>
  @endif
  @if($frontmatter.featured)
    <div class="featured">Featured Content</div>
  @endif
</div>
      `

      const content1 = createTestMarkdown(`
---
published: true
date: 2024-01-01
featured: true
---

# Published Featured Post

Content here.
      `, { published: true, date: '2024-01-01', featured: true })

      const content2 = createTestMarkdown(`
---
published: false
featured: false
---

# Draft Post

Content here.
      `, { published: false, featured: false })

      const result = await buildTestSite({
        files: [
          { path: 'Home.stx', content: template },
          { path: 'post1.md', content: content1 },
          { path: 'post2.md', content: content2 }
        ]
      })

      expect(result.success).toBe(true)

      const html1 = await readBuiltFile(result.outputs[0], 'post1.html')
      expect(assertHtmlContains(html1, 'Published: 2024-01-01')).toBe(true)
      expect(assertHtmlContains(html1, 'Featured Content')).toBe(true)

      const html2 = await readBuiltFile(result.outputs[1], 'post2.html')
      expect(assertHtmlContains(html2, 'Published:')).toBe(false)
      expect(assertHtmlContains(html2, 'Featured Content')).toBe(false)
    })

    test('should process @foreach loops', async () => {
      const template = `
<div class="tags">
  @foreach($frontmatter.tags as $tag)
    <span class="tag">{{ $tag }}</span>
  @endforeach
</div>

<div class="features">
  @foreach($frontmatter.features as $feature)
    <div class="feature">
      <h3>{{ $feature.title }}</h3>
      <p>{{ $feature.description }}</p>
    </div>
  @endforeach
</div>
      `

      const content = createTestMarkdown(`
---
tags:
  - javascript
  - typescript
  - vue
features:
  - title: Fast
    description: Very fast performance
  - title: Easy
    description: Easy to use
---

# Post with Loops

Content here.
      `, {
        tags: ['javascript', 'typescript', 'vue'],
        features: [
          { title: 'Fast', description: 'Very fast performance' },
          { title: 'Easy', description: 'Easy to use' }
        ]
      })

      const result = await buildTestSite({
        files: [
          { path: 'Post.stx', content: template },
          { path: 'test.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'javascript')).toBe(true)
      expect(assertHtmlContains(html, 'typescript')).toBe(true)
      expect(assertHtmlContains(html, 'vue')).toBe(true)
      expect(assertHtmlContains(html, 'Very fast performance')).toBe(true)
      expect(assertHtmlContains(html, 'Easy to use')).toBe(true)
    })

    test('should handle nested structures', async () => {
      const template = `
<div class="nested">
  @if($frontmatter.user)
    <div class="user-info">
      <h2>{{ $frontmatter.user.name }}</h2>
      <p>{{ $frontmatter.user.bio }}</p>

      @if($frontmatter.user.social)
        <div class="social-links">
          @foreach($frontmatter.user.social as $platform => $url)
            <a href="{{ $url }}" class="social-{{ $platform }}">{{ $platform }}</a>
          @endforeach
        </div>
      @endif

      @if($frontmatter.user.posts)
        <div class="user-posts">
          @foreach($frontmatter.user.posts as $post)
            <article class="post">
              <h3>{{ $post.title }}</h3>
              <p>{{ $post.excerpt }}</p>
              <time>{{ $post.date }}</time>
            </article>
          @endforeach
        </div>
      @endif
    </div>
  @endif
</div>
      `

      const content = createTestMarkdown(`
---
user:
  name: John Doe
  bio: Software Developer
  social:
    twitter: https://twitter.com/johndoe
    github: https://github.com/johndoe
  posts:
    - title: My First Post
      excerpt: This is my first blog post
      date: 2024-01-01
    - title: Second Post
      excerpt: Another great post
      date: 2024-01-02
---

# Nested Template Test

Content here.
      `, {
        user: {
          name: 'John Doe',
          bio: 'Software Developer',
          social: {
            twitter: 'https://twitter.com/johndoe',
            github: 'https://github.com/johndoe'
          },
          posts: [
            {
              title: 'My First Post',
              excerpt: 'This is my first blog post',
              date: '2024-01-01'
            },
            {
              title: 'Second Post',
              excerpt: 'Another great post',
              date: '2024-01-02'
            }
          ]
        }
      })

      const result = await buildTestSite({
        files: [
          { path: 'Profile.stx', content: template },
          { path: 'test.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'John Doe')).toBe(true)
      expect(assertHtmlContains(html, 'Software Developer')).toBe(true)
      expect(assertHtmlContains(html, 'https://twitter.com/johndoe')).toBe(true)
      expect(assertHtmlContains(html, 'My First Post')).toBe(true)
      expect(assertHtmlContains(html, 'Second Post')).toBe(true)
      expect(assertHtmlContains(html, 'nested-template')).toBe(true)
    })

    test('should handle complex nested @if and @foreach combinations', async () => {
      const template = `
<div class="complex-template">
  @if($frontmatter.showHeader)
    <header>
      <h1>{{ $frontmatter.title }}</h1>
      @if($frontmatter.subtitle)
        <p class="subtitle">{{ $frontmatter.subtitle }}</p>
      @endif
    </header>
  @endif

  @if($frontmatter.sections)
    @foreach($frontmatter.sections as $section)
      <section class="section {{ $section.type }}">
        <h2>{{ $section.title }}</h2>

        @if($section.type === 'list')
          <ul>
            @foreach($section.items as $item)
              <li>{{ $item }}</li>
            @endforeach
          </ul>
        @endif

        @if($section.type === 'grid')
          <div class="grid">
            @foreach($section.items as $item)
              <div class="grid-item">
                <h3>{{ $item.title }}</h3>
                <p>{{ $item.description }}</p>
              </div>
            @endforeach
          </div>
        @endif
      </section>
    @endforeach
  @endif
</div>
      `

      const content = createTestMarkdown(`
---
showHeader: true
title: Complex Template
subtitle: Testing nested conditions
sections:
  - type: list
    title: Features
    items:
      - Fast rendering
      - Easy to use
      - Highly customizable
  - type: grid
    title: Team Members
    items:
      - title: John Doe
        description: Lead Developer
      - title: Jane Smith
        description: Designer
---

# Complex Nested Template

Content here.
      `, {
        showHeader: true,
        title: 'Complex Template',
        subtitle: 'Testing nested conditions',
        sections: [
          {
            type: 'list',
            title: 'Features',
            items: ['Fast rendering', 'Easy to use', 'Highly customizable']
          },
          {
            type: 'grid',
            title: 'Team Members',
            items: [
              { title: 'John Doe', description: 'Lead Developer' },
              { title: 'Jane Smith', description: 'Designer' }
            ]
          }
        ]
      })

      const result = await buildTestSite({
        files: [
          { path: 'Complex.stx', content: template },
          { path: 'test.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'Complex Template')).toBe(true)
      expect(assertHtmlContains(html, 'Testing nested conditions')).toBe(true)
      expect(assertHtmlContains(html, 'Fast rendering')).toBe(true)
      expect(assertHtmlContains(html, 'John Doe')).toBe(true)
      expect(assertHtmlContains(html, 'Lead Developer')).toBe(true)
      expect(assertHtmlContains(html, 'complex-nested-template')).toBe(true)
    })
  })

  describe('Template Variables', () => {
    test('should inject frontmatter variables', async () => {
      const template = `
<div class="post">
  <h1>{{ $frontmatter.title }}</h1>
  <p class="date">{{ $frontmatter.date }}</p>
  <p class="author">By {{ $frontmatter.author }}</p>
  <div class="tags">
    @foreach($frontmatter.tags as $tag)
      <span class="tag">{{ $tag }}</span>
    @endforeach
  </div>
  <div class="content">
    {{ $content }}
  </div>
</div>
      `

      const content = createTestMarkdown(`
---
title: My Blog Post
date: 2024-01-01
author: John Doe
tags:
  - javascript
  - web development
---

# My Blog Post

This is the main content of the blog post.

## Subsection

More content here.
      `, {
        title: 'My Blog Post',
        date: '2024-01-01',
        author: 'John Doe',
        tags: ['javascript', 'web development']
      })

      const result = await buildTestSite({
        files: [
          { path: 'Post.stx', content: template },
          { path: 'test.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'My Blog Post')).toBe(true)
      expect(assertHtmlContains(html, '2024-01-01')).toBe(true)
      expect(assertHtmlContains(html, 'John Doe')).toBe(true)
      expect(assertHtmlContains(html, 'javascript')).toBe(true)
      expect(assertHtmlContains(html, 'web development')).toBe(true)
      expect(assertHtmlContains(html, 'This is the main content')).toBe(true)
    })

    test('should support global variables', async () => {
      const template = `
<div class="page">
  <header>
    <h1>{{ $site.title }}</h1>
    <p>{{ $site.description }}</p>
  </header>

  <nav>
    <ul>
      @foreach($site.nav as $item)
        <li><a href="{{ $item.link }}">{{ $item.text }}</a></li>
      @endforeach
    </ul>
  </nav>

  <main>
    <h1>{{ $page.title }}</h1>
    <p>Path: {{ $page.path }}</p>
    <p>Last updated: {{ $page.lastUpdated }}</p>
    {{ $content }}
  </main>

  <footer>
    <p>{{ $site.footer }}</p>
  </footer>
</div>
      `

      const content = createTestMarkdown(`
---
title: About Page
---

# About Us

This is the about page content.
      `, { title: 'About Page' })

      const result = await buildTestSite({
        files: [
          { path: 'Layout.stx', content: template },
          { path: 'about.md', content }
        ],
        config: {
          title: 'My Site',
          description: 'My awesome site',
          nav: [
            { text: 'Home', link: '/' },
            { text: 'About', link: '/about' }
          ],
          footer: '© 2024 My Site'
        }
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'about.html')
      expect(assertHtmlContains(html, 'My Site')).toBe(true)
      expect(assertHtmlContains(html, 'My awesome site')).toBe(true)
      expect(assertHtmlContains(html, 'About Page')).toBe(true)
      expect(assertHtmlContains(html, '/about')).toBe(true)
      expect(assertHtmlContains(html, '© 2024 My Site')).toBe(true)
      expect(assertHtmlContains(html, 'global-variables')).toBe(true)
    })

    test('should handle complex variable expressions', async () => {
      const template = `
<div class="product">
  <h1>{{ $frontmatter.product.name }}</h1>
  <p class="price">${{ $frontmatter.product.price }}</p>
  <p class="category">{{ $frontmatter.product.category }}</p>

  @if($frontmatter.product.inStock)
    <p class="stock">In Stock</p>
  @else
    <p class="stock">Out of Stock</p>
  @endif

  <div class="specs">
    @foreach($frontmatter.product.specs as $key => $value)
      <div class="spec">
        <strong>{{ $key }}:</strong> {{ $value }}
      </div>
    @endforeach
  </div>
</div>
      `

      const content = createTestMarkdown(`
---
product:
  name: Super Widget
  price: 99.99
  category: Electronics
  inStock: true
  specs:
    Weight: 1.5kg
    Dimensions: 10x20x5cm
    Material: Plastic
---

# Product Page

Product description here.
      `, {
        product: {
          name: 'Super Widget',
          price: 99.99,
          category: 'Electronics',
          inStock: true,
          specs: {
            Weight: '1.5kg',
            Dimensions: '10x20x5cm',
            Material: 'Plastic'
          }
        }
      })

      const result = await buildTestSite({
        files: [
          { path: 'Product.stx', content: template },
          { path: 'test.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'Super Widget')).toBe(true)
      expect(assertHtmlContains(html, '$99.99')).toBe(true)
      expect(assertHtmlContains(html, 'Electronics')).toBe(true)
      expect(assertHtmlContains(html, 'In Stock')).toBe(true)
      expect(assertHtmlContains(html, 'Weight: 1.5kg')).toBe(true)
      expect(assertHtmlContains(html, 'Dimensions: 10x20x5cm')).toBe(true)
      expect(assertHtmlContains(html, 'complex-variables')).toBe(true)
    })
  })

  describe('Template Inheritance', () => {
    test('should support template extends', async () => {
      const baseTemplate = `
<div class="base-layout">
  <header>
    <h1>{{ $site.title }}</h1>
    @yield('header')
  </header>

  <main>
    @yield('content')
  </main>

  <footer>
    @yield('footer')
    <p>© 2024 Base Footer</p>
  </footer>
</div>
      `

      const childTemplate = `
@extends('Base.stx')

@section('header')
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
@endsection

@section('content')
  <h1>{{ $frontmatter.title }}</h1>
  <div class="page-content">
    {{ $content }}
  </div>
@endsection

@section('footer')
  <p>Page-specific footer</p>
@endsection
      `

      const content = createTestMarkdown(`
---
title: Child Page
---

# Child Page Content

This is content in the child template.
      `, { title: 'Child Page' })

      const result = await buildTestSite({
        files: [
          { path: 'Base.stx', content: baseTemplate },
          { path: 'Child.stx', content: childTemplate },
          { path: 'test.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'Base Layout')).toBe(true)
      expect(assertHtmlContains(html, 'Child Page')).toBe(true)
      expect(assertHtmlContains(html, 'Page-specific footer')).toBe(true)
      expect(assertHtmlContains(html, '© 2024 Base Footer')).toBe(true)
      expect(assertHtmlContains(html, 'template-inheritance')).toBe(true)
    })

    test('should handle partial includes', async () => {
      const headerPartial = `
<header class="site-header">
  <div class="logo">
    <h1>{{ $site.title }}</h1>
  </div>
  <nav>
    @foreach($site.nav as $item)
      <a href="{{ $item.link }}">{{ $item.text }}</a>
    @endforeach
  </nav>
</header>
      `

      const footerPartial = `
<footer class="site-footer">
  <p>{{ $site.footer }}</p>
  <div class="social-links">
    @foreach($site.social as $platform => $url)
      <a href="{{ $url }}" class="social-{{ $platform }}">{{ $platform }}</a>
    @endforeach
  </div>
</footer>
      `

      const mainTemplate = `
<div class="layout">
  @include('Header.stx')

  <main class="content">
    <h1>{{ $frontmatter.title }}</h1>
    {{ $content }}
  </main>

  @include('Footer.stx')
</div>
      `

      const content = createTestMarkdown(`
---
title: Include Test
---

# Main Content

This page includes partial templates.
      `, { title: 'Include Test' })

      const result = await buildTestSite({
        files: [
          { path: 'Header.stx', content: headerPartial },
          { path: 'Footer.stx', content: footerPartial },
          { path: 'Main.stx', content: mainTemplate },
          { path: 'test.md', content }
        ],
        config: {
          title: 'Site with Partials',
          nav: [
            { text: 'Home', link: '/' },
            { text: 'About', link: '/about' }
          ],
          footer: '© 2024 Site',
          social: {
            twitter: 'https://twitter.com/site',
            github: 'https://github.com/site'
          }
        }
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'Site with Partials')).toBe(true)
      expect(assertHtmlContains(html, 'Include Test')).toBe(true)
      expect(assertHtmlContains(html, '© 2024 Site')).toBe(true)
      expect(assertHtmlContains(html, 'https://twitter.com/site')).toBe(true)
      expect(assertHtmlContains(html, 'partial-includes')).toBe(true)
    })

    test('should support nested includes and inheritance', async () => {
      const componentTemplate = `
<div class="component {{ $class }}">
  <h3>{{ $title }}</h3>
  <div class="component-content">
    @yield('component-content')
  </div>
</div>
      `

      const pageTemplate = `
@extends('Layout.stx')

@section('content')
  <div class="page-wrapper">
    @include('Component.stx', { class: 'hero', title: 'Hero Section' })
      @section('component-content')
        <h1>{{ $frontmatter.title }}</h1>
        <p>{{ $frontmatter.description }}</p>
      @endsection
    @endinclude

    @include('Component.stx', { class: 'content', title: 'Main Content' })
      @section('component-content')
        {{ $content }}
      @endsection
    @endinclude
  </div>
@endsection
      `

      const layoutTemplate = `
<div class="site-layout">
  <header>
    <h1>{{ $site.title }}</h1>
  </header>

  <main>
    @yield('content')
  </main>

  <footer>
    <p>{{ $site.footer }}</p>
  </footer>
</div>
      `

      const content = createTestMarkdown(`
---
title: Complex Inheritance
description: Testing complex template inheritance
---

# Main Content

This is the main content area.
      `, {
        title: 'Complex Inheritance',
        description: 'Testing complex template inheritance'
      })

      const result = await buildTestSite({
        files: [
          { path: 'Component.stx', content: componentTemplate },
          { path: 'Page.stx', content: pageTemplate },
          { path: 'Layout.stx', content: layoutTemplate },
          { path: 'test.md', content }
        ],
        config: {
          title: 'Complex Site',
          footer: '© 2024 Complex Site'
        }
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'Complex Site')).toBe(true)
      expect(assertHtmlContains(html, 'Complex Inheritance')).toBe(true)
      expect(assertHtmlContains(html, 'Testing complex template inheritance')).toBe(true)
      expect(assertHtmlContains(html, 'Hero Section')).toBe(true)
      expect(assertHtmlContains(html, 'Main Content')).toBe(true)
      expect(assertHtmlContains(html, 'nested-inheritance')).toBe(true)
    })
  })

  describe('Template Engine Edge Cases', () => {
    test('should handle empty frontmatter gracefully', async () => {
      const template = `
<div class="content">
  <h1>{{ $frontmatter.title || 'Untitled' }}</h1>
  @if($frontmatter.tags)
    @foreach($frontmatter.tags as $tag)
      <span class="tag">{{ $tag }}</span>
    @endforeach
  @endif
  {{ $content }}
</div>
      `

      const content = `
# Page without Frontmatter

Content here.
      `

      const result = await buildTestSite({
        files: [
          { path: 'Simple.stx', content: template },
          { path: 'test.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'Untitled')).toBe(true)
      expect(assertHtmlContains(html, 'Page without Frontmatter')).toBe(true)
      expect(assertHtmlContains(html, 'empty-frontmatter')).toBe(true)
    })

    test('should handle malformed templates gracefully', async () => {
      const malformedTemplate = `
<div class="content">
  @if($frontmatter.title
    <h1>{{ $frontmatter.title }}</h1>
  @endif
  {{ $content }}
</div>
      `

      const content = createTestMarkdown(`
---
title: Malformed Template Test
---

# Test Content

Testing malformed template handling.
      `, { title: 'Malformed Template Test' })

      const result = await buildTestSite({
        files: [
          { path: 'Malformed.stx', content: malformedTemplate },
          { path: 'test.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'Malformed Template Test')).toBe(true)
      expect(assertHtmlContains(html, 'Test Content')).toBe(true)
      expect(assertHtmlContains(html, 'malformed-template')).toBe(true)
    })

    test('should handle deep nesting without performance issues', async () => {
      const deepTemplate = `
<div class="level-1">
  @if($frontmatter.level1)
    <div class="level-2">
      @if($frontmatter.level1.level2)
        <div class="level-3">
          @if($frontmatter.level1.level2.level3)
            <div class="level-4">
              @if($frontmatter.level1.level2.level3.level4)
                <div class="level-5">
                  {{ $frontmatter.level1.level2.level3.level4.value }}
                </div>
              @endif
            </div>
          @endif
        </div>
      @endif
    </div>
  @endif
</div>
      `

      const content = createTestMarkdown(`
---
level1:
  level2:
    level3:
      level4:
        value: Deep Nested Value
---

# Deep Nesting Test

Testing deep nesting performance.
      `, {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'Deep Nested Value'
              }
            }
          }
        }
      })

      const result = await buildTestSite({
        files: [
          { path: 'Deep.stx', content: deepTemplate },
          { path: 'test.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'Deep Nested Value')).toBe(true)
      expect(assertHtmlContains(html, 'deep-nesting')).toBe(true)
      expect(assertHtmlContains(html, 'performance-ok')).toBe(true)
    })

    test('should handle template errors gracefully', async () => {
      const errorTemplate = `
<div class="content">
  {{ $frontmatter.nonexistent.property }}
  @foreach($frontmatter.undefinedArray as $item)
    <p>{{ $item }}</p>
  @endforeach
  {{ $content }}
</div>
      `

      const content = createTestMarkdown(`
---
title: Error Handling Test
---

# Test Content

Testing error handling in templates.
      `, { title: 'Error Handling Test' })

      const result = await buildTestSite({
        files: [
          { path: 'Error.stx', content: errorTemplate },
          { path: 'test.md', content }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'test.html')
      expect(assertHtmlContains(html, 'Error Handling Test')).toBe(true)
      expect(assertHtmlContains(html, 'Test Content')).toBe(true)
      expect(assertHtmlContains(html, 'template-errors-handled')).toBe(true)
    })
  })
})
