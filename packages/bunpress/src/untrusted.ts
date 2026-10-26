/** Options for user-authored documentation, such as a forge wiki. */
export interface UntrustedMarkdownOptions {
  /** Resolve relative documentation links. The result is validated again. */
  resolveLink?: (href: string) => string
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}

function safeUrl(value: string, image = false): string | null {
  const url = value.trim()
  // Refuse controls rather than trying to normalize browser scheme parsing.
  if (!url || /[\u0000-\u0020\u007f-\u009f\\]/.test(url))
    return null
  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(url)?.[1]?.toLowerCase()
  if (/^[^/]*:/.test(url) && (!scheme || !['http', 'https', ...(image ? [] : ['mailto'])].includes(scheme)))
    return null
  return url
}

/**
 * Render user-authored Markdown without executing templates or reading files.
 *
 * This deliberately has no root directory, config, frontmatter evaluator,
 * component resolver, include processor, or plugin hook. Output elements are
 * constructed from a closed vocabulary. Raw HTML remains escaped text. It is
 * safe to embed the result in a host page without trusting the document author.
 */
export function renderUntrustedMarkdown(source: string, options: UntrustedMarkdownOptions = {}): string {
  const runs: string[] = []
  const input = source.replace(/[\u0000-\u0002]/g, '')
  const raw = (children: string): string => children.replace(/\u0001(\d+)\u0002/g, (_, index: string) => runs[Number(index)] ?? '')
  const plain = (children: string): string => escapeHtml(raw(children))
  const html = Bun.markdown.render(input, {
    text: value => `\u0001${runs.push(value) - 1}\u0002`,
    heading: (children, meta) => `<h${meta.level} id="wiki-${escapeHtml(meta.id ?? '')}">${children}</h${meta.level}>`,
    paragraph: children => `<p>${children}</p>`,
    blockquote: children => `<blockquote>${children}</blockquote>`,
    strong: children => `<strong>${children}</strong>`,
    emphasis: children => `<em>${children}</em>`,
    strikethrough: children => `<del>${children}</del>`,
    hr: () => '<hr>',
    codespan: children => `<code>${plain(children)}</code>`,
    code: (children, meta) => {
      const language = meta?.language && /^[\w+#.-]{1,30}$/.test(meta.language) ? ` class="language-${escapeHtml(meta.language)}"` : ''
      return `<pre><code${language}>${plain(children)}</code></pre>`
    },
    list: (children, meta) => meta.ordered ? `<ol start="${meta.start ?? 1}">${children}</ol>` : `<ul>${children}</ul>`,
    listItem: (children, meta) => `<li>${typeof meta.checked === 'boolean' ? `<input type="checkbox" disabled${meta.checked ? ' checked' : ''}>` : ''}${children}</li>`,
    table: children => `<table>${children}</table>`,
    thead: children => `<thead>${children}</thead>`,
    tbody: children => `<tbody>${children}</tbody>`,
    tr: children => `<tr>${children}</tr>`,
    th: children => `<th>${children}</th>`,
    td: children => `<td>${children}</td>`,
    link: (children, meta) => {
      const href = safeUrl(meta.href)
      if (!href)
        return children
      const resolved = safeUrl(options.resolveLink?.(href) ?? href)
      return resolved ? `<a href="${escapeHtml(resolved)}" rel="nofollow noopener noreferrer">${children}</a>` : children
    },
    image: (children, meta) => {
      const src = safeUrl(meta.src, true)
      return src ? `<img src="${escapeHtml(src)}" alt="${plain(children)}" loading="lazy">` : plain(children)
    },
    html: children => children,
  }, { tables: true, strikethrough: true, tasklists: true, autolinks: true, headings: { ids: true } })
  return html.replace(/\u0001(\d+)\u0002/g, (_, index: string) => escapeHtml(runs[Number(index)] ?? ''))
}
