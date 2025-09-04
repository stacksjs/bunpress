import { describe, expect, test } from 'bun:test'
import { createTestMarkdown, buildTestSite, readBuiltFile, assertHtmlContains } from './utils/test-helpers'

describe('Data Loading', () => {
  describe('Content Loaders', () => {
    test('should create content loader function', async () => {
      const content = `---
title: Posts Index
---

# Blog Posts

Here are all our blog posts.

<script setup>
import { data as posts } from './posts.data.js'
</script>

<ul>
  <li v-for="post in posts" :key="post.url">
    <a :href="post.url">{{ post.frontmatter.title }}</a>
    <span>{{ post.frontmatter.date }}</span>
  </li>
</ul>
      `

      const dataLoader = `---
title: Posts Data
---

export default {
  load() {
    return [
      {
        url: '/posts/first-post',
        frontmatter: {
          title: 'First Post',
          date: '2024-01-01'
        }
      },
      {
        url: '/posts/second-post',
        frontmatter: {
          title: 'Second Post',
          date: '2024-01-02'
        }
      }
    ]
  }
}
      `

      const result = await buildTestSite({
        files: [
          { path: 'posts.md', content },
          { path: 'posts.data.md', content: dataLoader }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'posts.html')
      expect(assertHtmlContains(html, 'First Post')).toBe(true)
      expect(assertHtmlContains(html, 'Second Post')).toBe(true)
      expect(assertHtmlContains(html, '2024-01-01')).toBe(true)
      expect(assertHtmlContains(html, 'content-loader')).toBe(true)
    })

    test('should load markdown files as data', async () => {
      const content = `
# Posts from Markdown

Posts loaded from markdown files.
      `

      const post1 = `---
title: Post One
date: 2024-01-01
author: John Doe
---

# Post One

This is the first post content.
      `

      const post2 = `---
title: Post Two
date: 2024-01-02
author: Jane Smith
---

# Post Two

This is the second post content.
      `

      const result = await buildTestSite({
        files: [
          { path: 'posts.md', content },
          { path: 'posts/post1.md', content: post1 },
          { path: 'posts/post2.md', content: post2 }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'posts.html')
      expect(assertHtmlContains(html, 'Post One')).toBe(true)
      expect(assertHtmlContains(html, 'Post Two')).toBe(true)
      expect(assertHtmlContains(html, 'John Doe')).toBe(true)
      expect(assertHtmlContains(html, 'Jane Smith')).toBe(true)
      expect(assertHtmlContains(html, 'markdown-data-loading')).toBe(true)
    })

    test('should transform loaded data', async () => {
      const content = `
# Transformed Data

Data with transformations applied.
      `

      const dataLoader = `---
title: Transformed Data
---

export default {
  load() {
    return [
      {
        title: 'Raw Title',
        date: '2024-01-01',
        content: 'Raw content'
      }
    ]
  },

  transform(data) {
    return data.map(item => ({
      ...item,
      title: item.title.toUpperCase(),
      formattedDate: new Date(item.date).toLocaleDateString(),
      excerpt: item.content.substring(0, 50) + '...'
    }))
  }
}
      `

      const result = await buildTestSite({
        files: [
          { path: 'transformed.md', content },
          { path: 'data.md', content: dataLoader }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'transformed.html')
      expect(assertHtmlContains(html, 'RAW TITLE')).toBe(true)
      expect(assertHtmlContains(html, '1/1/2024')).toBe(true)
      expect(assertHtmlContains(html, 'Raw content...')).toBe(true)
      expect(assertHtmlContains(html, 'data-transformation')).toBe(true)
    })

    test('should handle remote data loading', async () => {
      const content = `
# Remote Data

Data loaded from remote sources.
      `

      const dataLoader = `---
title: Remote Data
---

export default {
  async load() {
    // Simulate remote API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            title: 'Remote Post 1',
            source: 'API'
          },
          {
            id: 2,
            title: 'Remote Post 2',
            source: 'API'
          }
        ])
      }, 100)
    })
  }
}
      `

      const result = await buildTestSite({
        files: [
          { path: 'remote.md', content },
          { path: 'remote.data.md', content: dataLoader }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'remote.html')
      expect(assertHtmlContains(html, 'Remote Post 1')).toBe(true)
      expect(assertHtmlContains(html, 'Remote Post 2')).toBe(true)
      expect(assertHtmlContains(html, 'API')).toBe(true)
      expect(assertHtmlContains(html, 'remote-data-loading')).toBe(true)
    })

    test('should support data caching', async () => {
      const content = `
# Cached Data

Data with caching enabled.
      `

      const dataLoader = `---
title: Cached Data
---

export default {
  load() {
    return [
      {
        title: 'Cached Post',
        timestamp: Date.now()
      }
    ]
  },

  cache: {
    enabled: true,
    ttl: 3600000 // 1 hour
  }
}
      `

      const result = await buildTestSite({
        files: [
          { path: 'cached.md', content },
          { path: 'cached.data.md', content: dataLoader }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'cached.html')
      expect(assertHtmlContains(html, 'Cached Post')).toBe(true)
      expect(assertHtmlContains(html, 'data-cache')).toBe(true)
      expect(assertHtmlContains(html, 'cache-enabled')).toBe(true)
    })
  })

  describe('Dynamic Routes', () => {
    test('should handle dynamic route parameters', async () => {
      const template = `---
title: Post Template
---

# {{ $params.slug }}

This is post: {{ $params.slug }}

Content for the post.
      `

      const result = await buildTestSite({
        files: [
          { path: 'posts/[slug].md', content: template }
        ]
      })

      expect(result.success).toBe(true)

      // Test with different slugs
      const slugs = ['first-post', 'second-post', 'third-post']

      for (const slug of slugs) {
        const html = await readBuiltFile(result.outputs[0], `posts/${slug}.html`)
        expect(assertHtmlContains(html, slug)).toBe(true)
        expect(assertHtmlContains(html, `This is post: ${slug}`)).toBe(true)
        expect(assertHtmlContains(html, 'dynamic-route')).toBe(true)
      }
    })

    test('should generate routes from data', async () => {
      const template = `---
title: Product Page
---

# {{ $params.id }}

Product ID: {{ $params.id }}
Name: {{ $product.name }}
Price: {{ $product.price }}
      `

      const dataLoader = `---
title: Products Data
---

export default {
  load() {
    return [
      { id: '1', name: 'Product A', price: '$10' },
      { id: '2', name: 'Product B', price: '$20' },
      { id: '3', name: 'Product C', price: '$30' }
    ]
  },

  routes(data) {
    return data.map(product => ({
      params: { id: product.id },
      props: { product }
    }))
  }
}
      `

      const result = await buildTestSite({
        files: [
          { path: 'products/[id].md', content: template },
          { path: 'products.data.md', content: dataLoader }
        ]
      })

      expect(result.success).toBe(true)

      const products = [
        { id: '1', name: 'Product A', price: '$10' },
        { id: '2', name: 'Product B', price: '$20' },
        { id: '3', name: 'Product C', price: '$30' }
      ]

      for (const product of products) {
        const html = await readBuiltFile(result.outputs[0], `products/${product.id}.html`)
        expect(assertHtmlContains(html, product.id)).toBe(true)
        expect(assertHtmlContains(html, product.name)).toBe(true)
        expect(assertHtmlContains(html, product.price)).toBe(true)
        expect(assertHtmlContains(html, 'generated-route')).toBe(true)
      }
    })

    test('should handle nested dynamic routes', async () => {
      const template = `---
title: Category Product
---

# {{ $params.category }} - {{ $params.product }}

Category: {{ $params.category }}
Product: {{ $params.product }}
      `

      const result = await buildTestSite({
        files: [
          { path: 'shop/[category]/[product].md', content: template }
        ]
      })

      expect(result.success).toBe(true)

      const routes = [
        { category: 'electronics', product: 'laptop' },
        { category: 'books', product: 'novel' },
        { category: 'clothing', product: 'shirt' }
      ]

      for (const route of routes) {
        const path = `shop/${route.category}/${route.product}.html`
        const html = await readBuiltFile(result.outputs[0], path)
        expect(assertHtmlContains(html, route.category)).toBe(true)
        expect(assertHtmlContains(html, route.product)).toBe(true)
        expect(assertHtmlContains(html, 'nested-dynamic-route')).toBe(true)
      }
    })

    test('should support optional route parameters', async () => {
      const template = `---
title: Blog Post
---

# {{ $params.year }}/{{ $params.month }}/{{ $params.slug }}

Year: {{ $params.year }}
Month: {{ $params.month }}
Slug: {{ $params.slug }}
      `

      const result = await buildTestSite({
        files: [
          { path: 'blog/[[year]]/[[month]]/[slug].md', content: template }
        ]
      })

      expect(result.success).toBe(true)

      // Test with all parameters
      const fullPath = 'blog/2024/01/my-post.html'
      const fullHtml = await readBuiltFile(result.outputs[0], fullPath)
      expect(assertHtmlContains(fullHtml, '2024')).toBe(true)
      expect(assertHtmlContains(fullHtml, '01')).toBe(true)
      expect(assertHtmlContains(fullHtml, 'my-post')).toBe(true)

      // Test with optional parameters omitted
      const partialPath = 'blog/my-post.html'
      const partialHtml = await readBuiltFile(result.outputs[0], partialPath)
      expect(assertHtmlContains(partialHtml, 'my-post')).toBe(true)
      expect(assertHtmlContains(partialHtml, 'optional-params')).toBe(true)
    })

    test('should handle route-based content loading', async () => {
      const template = `---
title: User Profile
---

# {{ $user.name }}

Email: {{ $user.email }}
Bio: {{ $user.bio }}

Posts:
<ul>
  <li v-for="post in $user.posts" :key="post.id">
    {{ post.title }}
  </li>
</ul>
      `

      const dataLoader = `---
title: Users Data
---

export default {
  load() {
    return [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'Software developer',
        posts: [
          { id: '1', title: 'First Post' },
          { id: '2', title: 'Second Post' }
        ]
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        bio: 'Designer',
        posts: [
          { id: '3', title: 'Design Post' }
        ]
      }
    ]
  },

  routes(data) {
    return data.map(user => ({
      params: { id: user.id },
      props: { user }
    }))
  }
}
      `

      const result = await buildTestSite({
        files: [
          { path: 'users/[id].md', content: template },
          { path: 'users.data.md', content: dataLoader }
        ]
      })

      expect(result.success).toBe(true)

      // Test first user
      const user1Html = await readBuiltFile(result.outputs[0], 'users/1.html')
      expect(assertHtmlContains(user1Html, 'John Doe')).toBe(true)
      expect(assertHtmlContains(user1Html, 'john@example.com')).toBe(true)
      expect(assertHtmlContains(user1Html, 'First Post')).toBe(true)
      expect(assertHtmlContains(user1Html, 'Second Post')).toBe(true)

      // Test second user
      const user2Html = await readBuiltFile(result.outputs[0], 'users/2.html')
      expect(assertHtmlContains(user2Html, 'Jane Smith')).toBe(true)
      expect(assertHtmlContains(user2Html, 'jane@example.com')).toBe(true)
      expect(assertHtmlContains(user2Html, 'Design Post')).toBe(true)
    })

    test('should support route guards and redirects', async () => {
      const template = `---
title: Protected Page
---

# Protected Content

This content is protected.
      `

      const dataLoader = `---
title: Auth Data
---

export default {
  load() {
    return [
      { id: 'public', authenticated: false },
      { id: 'private', authenticated: true }
    ]
  },

  routes(data) {
    return data.map(item => ({
      params: { id: item.id },
      props: { item },
      guards: item.authenticated ? ['auth'] : []
    }))
  },

  guards: {
    auth({ item }) {
      if (!item.authenticated) {
        return { redirect: '/login' }
      }
      return true
    }
  }
}
      `

      const result = await buildTestSite({
        files: [
          { path: 'content/[id].md', content: template },
          { path: 'content.data.md', content: dataLoader }
        ]
      })

      expect(result.success).toBe(true)

      // Test protected content
      const protectedHtml = await readBuiltFile(result.outputs[0], 'content/private.html')
      expect(assertHtmlContains(protectedHtml, 'Protected Content')).toBe(true)

      // Test public content
      const publicHtml = await readBuiltFile(result.outputs[0], 'content/public.html')
      expect(assertHtmlContains(publicHtml, 'login')).toBe(true)
      expect(assertHtmlContains(publicHtml, 'route-guard')).toBe(true)
    })
  })

  describe('File-Based Data Loading', () => {
    test('should load data from JSON files', async () => {
      const content = `
# JSON Data Loading

Data loaded from JSON files.
      `

      const jsonData = `{
  "posts": [
    {
      "title": "JSON Post 1",
      "content": "Content from JSON"
    },
    {
      "title": "JSON Post 2",
      "content": "More JSON content"
    }
  ]
}
      `

      const result = await buildTestSite({
        files: [
          { path: 'json-data.md', content },
          { path: 'data/posts.json', content: jsonData }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'json-data.html')
      expect(assertHtmlContains(html, 'JSON Post 1')).toBe(true)
      expect(assertHtmlContains(html, 'JSON Post 2')).toBe(true)
      expect(assertHtmlContains(html, 'Content from JSON')).toBe(true)
      expect(assertHtmlContains(html, 'json-data-loading')).toBe(true)
    })

    test('should load data from YAML files', async () => {
      const content = `
# YAML Data Loading

Data loaded from YAML files.
      `

      const yamlData = `---
posts:
  - title: YAML Post 1
    content: Content from YAML
    tags:
      - yaml
      - data
  - title: YAML Post 2
    content: More YAML content
    tags:
      - test
      - example
---
      `

      const result = await buildTestSite({
        files: [
          { path: 'yaml-data.md', content },
          { path: 'data/posts.yml', content: yamlData }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'yaml-data.html')
      expect(assertHtmlContains(html, 'YAML Post 1')).toBe(true)
      expect(assertHtmlContains(html, 'YAML Post 2')).toBe(true)
      expect(assertHtmlContains(html, 'Content from YAML')).toBe(true)
      expect(assertHtmlContains(html, 'yaml-data-loading')).toBe(true)
    })

    test('should support CSV data loading', async () => {
      const content = `
# CSV Data Loading

Data loaded from CSV files.
      `

      const csvData = `title,content,category
CSV Post 1,Content from CSV,tech
CSV Post 2,More CSV content,design
CSV Post 3,Even more content,dev
      `

      const result = await buildTestSite({
        files: [
          { path: 'csv-data.md', content },
          { path: 'data/posts.csv', content: csvData }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'csv-data.html')
      expect(assertHtmlContains(html, 'CSV Post 1')).toBe(true)
      expect(assertHtmlContains(html, 'CSV Post 2')).toBe(true)
      expect(assertHtmlContains(html, 'Content from CSV')).toBe(true)
      expect(assertHtmlContains(html, 'csv-data-loading')).toBe(true)
    })
  })

  describe('Data Transformation and Processing', () => {
    test('should support data filtering', async () => {
      const content = `
# Filtered Data

Data with filtering applied.
      `

      const dataLoader = `---
title: Filtered Data
---

export default {
  load() {
    return [
      { title: 'Post 1', published: true, category: 'tech' },
      { title: 'Post 2', published: false, category: 'tech' },
      { title: 'Post 3', published: true, category: 'design' },
      { title: 'Post 4', published: false, category: 'design' }
    ]
  },

  transform(data) {
    return data.filter(item => item.published)
  }
}
      `

      const result = await buildTestSite({
        files: [
          { path: 'filtered.md', content },
          { path: 'filtered.data.md', content: dataLoader }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'filtered.html')
      expect(assertHtmlContains(html, 'Post 1')).toBe(true)
      expect(assertHtmlContains(html, 'Post 3')).toBe(true)
      expect(assertHtmlContains(html, 'Post 2')).toBe(false) // Unpublished
      expect(assertHtmlContains(html, 'Post 4')).toBe(false) // Unpublished
      expect(assertHtmlContains(html, 'data-filtering')).toBe(true)
    })

    test('should support data sorting', async () => {
      const content = `
# Sorted Data

Data with sorting applied.
      `

      const dataLoader = `---
title: Sorted Data
---

export default {
  load() {
    return [
      { title: 'Post C', date: '2024-01-03' },
      { title: 'Post A', date: '2024-01-01' },
      { title: 'Post B', date: '2024-01-02' }
    ]
  },

  transform(data) {
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }
}
      `

      const result = await buildTestSite({
        files: [
          { path: 'sorted.md', content },
          { path: 'sorted.data.md', content: dataLoader }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'sorted.html')
      expect(assertHtmlContains(html, 'Post A')).toBe(true)
      expect(assertHtmlContains(html, 'Post B')).toBe(true)
      expect(assertHtmlContains(html, 'Post C')).toBe(true)
      expect(assertHtmlContains(html, 'data-sorting')).toBe(true)
    })

    test('should support data pagination', async () => {
      const content = `
# Paginated Data

Data with pagination applied.
      `

      const dataLoader = `---
title: Paginated Data
---

export default {
  load() {
    return Array.from({ length: 25 }, (_, i) => ({
      title: \`Post \${i + 1}\`,
      content: \`Content for post \${i + 1}\`
    }))
  },

  transform(data, { page = 1, limit = 10 } = {}) {
    const start = (page - 1) * limit
    const end = start + limit

    return {
      items: data.slice(start, end),
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit)
      }
    }
  }
}
      `

      const result = await buildTestSite({
        files: [
          { path: 'paginated.md', content },
          { path: 'paginated.data.md', content: dataLoader }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'paginated.html')
      expect(assertHtmlContains(html, 'Post 1')).toBe(true)
      expect(assertHtmlContains(html, 'Post 10')).toBe(true)
      expect(assertHtmlContains(html, 'Post 11')).toBe(false) // Should be on page 2
      expect(assertHtmlContains(html, 'data-pagination')).toBe(true)
    })

    test('should support data aggregation', async () => {
      const content = `
# Aggregated Data

Data with aggregation applied.
      `

      const dataLoader = `---
title: Aggregated Data
---

export default {
  load() {
    return [
      { title: 'Post 1', category: 'tech', views: 100 },
      { title: 'Post 2', category: 'tech', views: 200 },
      { title: 'Post 3', category: 'design', views: 150 },
      { title: 'Post 4', category: 'design', views: 250 }
    ]
  },

  transform(data) {
    const categories = {}

    data.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = {
          count: 0,
          totalViews: 0,
          posts: []
        }
      }

      categories[item.category].count++
      categories[item.category].totalViews += item.views
      categories[item.category].posts.push(item)
    })

    return Object.entries(categories).map(([name, stats]) => ({
      name,
      ...stats
    }))
  }
}
      `

      const result = await buildTestSite({
        files: [
          { path: 'aggregated.md', content },
          { path: 'aggregated.data.md', content: dataLoader }
        ]
      })

      expect(result.success).toBe(true)

      const html = await readBuiltFile(result.outputs[0], 'aggregated.html')
      expect(assertHtmlContains(html, 'tech')).toBe(true)
      expect(assertHtmlContains(html, 'design')).toBe(true)
      expect(assertHtmlContains(html, 'count')).toBe(true)
      expect(assertHtmlContains(html, 'totalViews')).toBe(true)
      expect(assertHtmlContains(html, 'data-aggregation')).toBe(true)
    })
  })
})
