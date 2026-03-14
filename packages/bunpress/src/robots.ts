import type { BunPressConfig, RobotsRule } from './types'
import * as fs from 'node:fs'
import * as path from 'node:path'

/**
 * Generate robots.txt file
 */
export async function generateRobotsTxt(
  outputDir: string,
  config: BunPressConfig,
): Promise<void> {
  const robotsConfig = config.robots

  // Check if robots.txt generation is enabled
  if (robotsConfig?.enabled === false) {
    return
  }

  const filename = robotsConfig?.filename || 'robots.txt'
  const content = generateRobotsContent(config)

  const outputPath = path.join(outputDir, filename)
  await fs.promises.writeFile(outputPath, content, 'utf-8')

  if (config.verbose) {
    console.log(`✅ Robots.txt generated: ${outputPath}`)
  }
}

/**
 * Generate robots.txt content
 */
function generateRobotsContent(config: BunPressConfig): string {
  const robotsConfig = config.robots
  const lines: string[] = []

  // Add rules
  if (robotsConfig?.rules && robotsConfig.rules.length > 0) {
    for (const rule of robotsConfig.rules) {
      lines.push(...formatRule(rule))
      lines.push('') // Empty line between rules
    }
  }
  else {
    // Default rule: allow all
    lines.push('User-agent: *')
    lines.push('Allow: /')
    lines.push('')
  }

  // Add host directive
  if (robotsConfig?.host) {
    lines.push(`Host: ${robotsConfig.host}`)
    lines.push('')
  }

  // Add sitemap URLs
  if (robotsConfig?.sitemaps && robotsConfig.sitemaps.length > 0) {
    for (const sitemap of robotsConfig.sitemaps) {
      lines.push(`Sitemap: ${sitemap}`)
    }
    lines.push('')
  }
  else if (config.sitemap?.enabled !== false && config.sitemap?.baseUrl) {
    // Auto-add sitemap if sitemap generation is enabled
    const sitemapFilename = config.sitemap.filename || 'sitemap.xml'
    const sitemapUrl = `${config.sitemap.baseUrl.replace(/\/$/, '')}/${sitemapFilename}`
    lines.push(`Sitemap: ${sitemapUrl}`)
    lines.push('')
  }

  // Add custom content
  if (robotsConfig?.customContent) {
    lines.push(robotsConfig.customContent)
    lines.push('')
  }

  return `${lines.join('\n').trim()}\n`
}

/**
 * Format a single robots rule
 */
function formatRule(rule: RobotsRule): string[] {
  const lines: string[] = []

  // User-agent
  lines.push(`User-agent: ${rule.userAgent}`)

  // Allow directives
  if (rule.allow && rule.allow.length > 0) {
    for (const allowPath of rule.allow) {
      lines.push(`Allow: ${allowPath}`)
    }
  }

  // Disallow directives
  if (rule.disallow && rule.disallow.length > 0) {
    for (const disallowPath of rule.disallow) {
      lines.push(`Disallow: ${disallowPath}`)
    }
  }

  // Crawl-delay
  if (rule.crawlDelay !== undefined) {
    lines.push(`Crawl-delay: ${rule.crawlDelay}`)
  }

  return lines
}
