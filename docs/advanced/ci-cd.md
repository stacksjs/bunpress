# CI/CD Integration

Deploy your BunPress documentation site with various CI/CD platforms and hosting providers.

## GitHub Actions

### Basic Deployment

```yaml
name: Deploy Documentation
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install

      - name: Build documentation
        run: bunpress build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### With Caching

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2

      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: ~/.bun/install/cache
          key: bun-${{ hashFiles('bun.lockb') }}

      - name: Cache BunPress
        uses: actions/cache@v4
        with:
          path: .bunpress/cache
          key: bunpress-${{ hashFiles('docs/**') }}

      - run: bun install
      - run: bunpress build
```

## Vercel

### Configuration

```json
// vercel.json
{
  "buildCommand": "bunpress build",
  "outputDirectory": "dist",
  "framework": null,
  "installCommand": "bun install"
}
```

### GitHub Integration

1. Connect repository to Vercel
2. Configure build settings:
   - Build Command: `bunpress build`
   - Output Directory: `dist`
   - Install Command: `bun install`

## Netlify

### Configuration

```toml
# netlify.toml
[build]
  command = "bunpress build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-functions-install-core"
```

### Deploy Configuration

```yaml
# .github/workflows/netlify.yml
name: Deploy to Netlify
on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bunpress build

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: ./dist
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Cloudflare Pages

### Configuration

```yaml
name: Deploy to Cloudflare Pages
on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bunpress build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: my-docs
          directory: dist
```

## AWS S3 + CloudFront

```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bunpress build

      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: aws s3 sync ./dist s3://my-docs-bucket --delete

      - name: Invalidate CloudFront
        run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} --paths "/*"
```

## GitLab CI

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: oven/bun:latest
  script:
    - bun install
    - bunpress build
  artifacts:
    paths:
      - dist/

pages:
  stage: deploy
  dependencies:
    - build
  script:
    - mv dist public
  artifacts:
    paths:
      - public
  only:
    - main
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM oven/bun:latest AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bunpress build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Preview Deployments

### Vercel Preview

```yaml
name: Preview
on: [pull_request]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bunpress build

      - name: Deploy Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Comment Preview URL

```yaml
- name: Comment Preview URL
  uses: marocchino/sticky-pull-request-comment@v2
  with:
    message: |
      Preview deployed to: ${{ steps.preview.outputs.preview-url }}
```

## Environment Configuration

### Production vs Preview

```typescript
// bunpress.config.ts
const isProd = process.env.NODE_ENV === 'production'
const isPreview = process.env.VERCEL_ENV === 'preview'

export default {
  sitemap: {
    baseUrl: isProd
      ? 'https://docs.example.com'
      : 'https://preview.docs.example.com',
  },
  robots: {
    enabled: isProd && !isPreview,
  },
}
```

## Build Optimization

### Parallel Builds

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - run: bunpress build --shard=${{ matrix.shard }}/4
```

### Incremental Builds

```yaml
- name: Cache build
  uses: actions/cache@v4
  with:
    path: .bunpress/cache
    key: bunpress-${{ hashFiles('docs/**') }}

- run: bunpress build --incremental
```

## Monitoring

### Build Notifications

```yaml
- name: Notify Slack
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Docs build ${{ job.status }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Best Practices

1. **Cache dependencies**: Speed up builds
2. **Incremental builds**: Only rebuild changed content
3. **Preview deployments**: Test before merging
4. **Environment separation**: Different configs per environment
5. **Monitoring**: Track build status and performance

## Related

- [Configuration](/advanced/configuration) - Build options
- [Performance](/advanced/performance) - Build optimization
- [Theming](/advanced/theming) - Production theming
