import type { BunPressConfig } from './types'

/**
 * The site's absolute base URL, or `''` when it has none.
 *
 * Five separate features need to turn a page's path into an absolute URL —
 * the sitemap, the RSS feed, robots.txt's `Sitemap:` line, `<link rel="canonical">`
 * and the Open Graph tags — and each of them used to read `config.sitemap.baseUrl`
 * directly. That made a sitemap-shaped key the only way to configure something
 * none of those four other features have to do with, so authors reached for the
 * obvious top-level `url` instead and silently got none of them: no sitemap, no
 * feed, no canonical link, and no link-preview card anywhere the docs were shared.
 *
 * `sitemap.baseUrl` still wins where it is set, so nothing that configured it
 * moves; `url` is the place to say it once.
 */
export function siteUrl(config: BunPressConfig): string {
  return (config.sitemap?.baseUrl || config.url || '').replace(/\/$/, '')
}
