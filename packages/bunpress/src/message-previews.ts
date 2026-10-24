/**
 * Message previews: ```email and ```sms fences rendered as the message itself.
 *
 * Product docs often need to show the exact copy a system sends — a welcome
 * email, a class reminder text — and a plain code block reads as code, not as
 * a message. These fences render an email as a mail-client card (headers,
 * subject, body, buttons) and an SMS thread as phone bubbles with a character
 * and segment count, so a reader sees what the recipient sees.
 *
 * ````md
 * ```email
 * from: Acme <hello@acme.com>
 * to: The new member
 * subject: Welcome to Acme, {firstName}
 * ---
 * Hi {firstName},
 *
 * [Set your password](https://acme.com/reset)
 * ```
 * ````
 *
 * Header lines (`key: value`) come before the first `---`; the body follows.
 * In an `sms` fence every later `---` starts another message in the thread,
 * and a message whose lines all start with `> ` is a reply from the recipient.
 * In an `email` fence a later `---` is a divider (above a footer, say).
 * `{name}` and `{{ name }}` placeholders are highlighted as variables.
 */

/** The fence languages rendered as message previews. */
export const MESSAGE_PREVIEW_LANGS: readonly string[] = ['email', 'sms']

export function isMessagePreviewLang(lang: string): boolean {
  return MESSAGE_PREVIEW_LANGS.includes(lang.toLowerCase())
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const PLACEHOLDER = /\{\{\s*([\w.-]+)\s*\}\}|\{([\w.-]+)\}/g

/** Escape text, then mark up placeholders, `code`, **bold** and *italic*. */
function formatText(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\s][^*]*)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(PLACEHOLDER, (match) => `<span class="bp-message-var">${match}</span>`)
}

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g

/**
 * Inline markdown for one line. Links are split out first so a placeholder in
 * a URL stays literal in the href instead of becoming markup inside it.
 */
function safeLink(href: string): boolean {
  // URL parsing discards tabs and newlines; reject them before inspecting
  // the protocol so an obfuscated executable scheme cannot pass.
  if (/[\u0000-\u0020\u007f]/.test(href))
    return false

  try {
    const url = new URL(href, 'https://preview.invalid/')
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol)
  }
  catch {
    return false
  }
}

function formatInline(text: string): string {
  let html = ''
  let last = 0
  for (const match of text.matchAll(LINK)) {
    html += formatText(text.slice(last, match.index))
    const href = match[2] ?? match[3]
    const label = match[1] ?? match[3]
    html += safeLink(href)
      ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${formatText(label)}</a>`
      : formatText(label)
    last = match.index! + match[0].length
  }
  return html + formatText(text.slice(last))
}

export interface ParsedMessage {
  headers: Array<{ key: string, value: string }>
  /** Body lines, split into messages on `---` (an email is one message). */
  parts: string[][]
}

const HEADER_LINE = /^([A-Za-z][\w-]*):\s*(.*)$/
const SEPARATOR = /^\s*-{3,}\s*$/

/**
 * Split a fence into headers and body. Headers exist only when a `---` line
 * follows lines that all read `key: value`, so a body that merely contains a
 * colon is never mistaken for one.
 */
export function parseMessage(source: string, splitParts: boolean): ParsedMessage {
  const lines = source.replace(/\r\n?/g, '\n').replace(/^\n+|\n+$/g, '').split('\n')
  const headers: ParsedMessage['headers'] = []
  let start = 0

  const firstSeparator = lines.findIndex(line => SEPARATOR.test(line))
  if (firstSeparator > 0) {
    const candidate = lines.slice(0, firstSeparator).filter(line => line.trim() !== '')
    if (candidate.length > 0 && candidate.every(line => HEADER_LINE.test(line))) {
      for (const line of candidate) {
        const [, key, value] = line.match(HEADER_LINE)!
        headers.push({ key: key.toLowerCase(), value: value.trim() })
      }
      start = firstSeparator + 1
    }
  }

  const parts: string[][] = [[]]
  for (const line of lines.slice(start)) {
    if (splitParts && SEPARATOR.test(line)) {
      parts.push([])
      continue
    }
    parts[parts.length - 1].push(line)
  }

  return {
    headers,
    parts: parts
      .map(part => trimBlankLines(part))
      .filter(part => part.length > 0),
  }
}

function trimBlankLines(lines: string[]): string[] {
  let from = 0
  let to = lines.length
  while (from < to && lines[from].trim() === '') from++
  while (to > from && lines[to - 1].trim() === '') to--
  return lines.slice(from, to)
}

/** Group body lines into blocks separated by blank lines. */
function blocksOf(lines: string[]): string[][] {
  const blocks: string[][] = [[]]
  for (const line of lines) {
    if (line.trim() === '') {
      if (blocks[blocks.length - 1].length > 0)
        blocks.push([])
      continue
    }
    blocks[blocks.length - 1].push(line)
  }
  return blocks.filter(block => block.length > 0)
}

const BUTTON = /^\s*\[([^\]]+)\]\(([^)\s]+)\)\s*$/
const LIST_ITEM = /^\s*[-*]\s+/

/** Render an email body: paragraphs, buttons, lists, quotes and dividers. */
function renderEmailBody(lines: string[]): string {
  return blocksOf(lines).map((block) => {
    if (block.length === 1 && SEPARATOR.test(block[0]))
      return '<hr>'

    if (block.every(line => BUTTON.test(line))) {
      const buttons = block.map((line) => {
        const [, label, href] = line.match(BUTTON)!
        if (!safeLink(href))
          return formatText(label)
        return `<a class="bp-email-button" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${formatText(label)}</a>`
      })
      return `<p class="bp-email-actions">${buttons.join('')}</p>`
    }

    if (block.every(line => LIST_ITEM.test(line)))
      return `<ul>${block.map(line => `<li>${formatInline(line.replace(LIST_ITEM, ''))}</li>`).join('')}</ul>`

    if (block.every(line => line.startsWith('>')))
      return `<blockquote>${block.map(line => formatInline(line.replace(/^>\s?/, ''))).join('<br>')}</blockquote>`

    // A separator inside a paragraph block still divides it.
    return block
      .join('\n')
      .split(/\n\s*-{3,}\s*\n?/)
      .map(text => `<p>${text.split('\n').map(formatInline).join('<br>')}</p>`)
      .join('<hr>')
  }).join('\n')
}

const HEADER_LABELS: Record<string, string> = {
  'from': 'From',
  'to': 'To',
  'cc': 'Cc',
  'bcc': 'Bcc',
  'reply-to': 'Reply-To',
}

function labelOf(key: string): string {
  return HEADER_LABELS[key] ?? key.replace(/[-_]/g, ' ').replace(/^\w/, c => c.toUpperCase())
}

export function renderEmailPreview(source: string): string {
  const { headers, parts } = parseMessage(source, false)
  const subject = headers.find(h => h.key === 'subject')?.value
  const preheader = headers.find(h => h.key === 'preheader')?.value
  const rows = headers
    .filter(h => h.key !== 'subject' && h.key !== 'preheader')
    .map(h => `<div><dt>${escapeHtml(labelOf(h.key))}</dt><dd>${formatInline(h.value)}</dd></div>`)
    .join('')

  return [
    `<figure class="bp-email bp-message" aria-label="Email preview">`,
    `<div class="bp-email-bar"><span class="bp-email-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="bp-message-kind">Email</span></div>`,
    subject ? `<div class="bp-email-subject">${formatInline(subject)}</div>` : '',
    rows ? `<dl class="bp-email-headers">${rows}</dl>` : '',
    preheader ? `<div class="bp-email-preheader"><span>Preview text</span> ${formatInline(preheader)}</div>` : '',
    `<div class="bp-email-body">${renderEmailBody(parts[0] ?? [])}</div>`,
    `</figure>`,
  ].join('')
}

/** Characters in the GSM 03.38 basic set, which carriers send 7 bits a piece. */
const GSM_BASIC = '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà'
/** The extension table: each costs two septets. */
const GSM_EXTENDED = '^{}\\[~]|€\f'

export interface SmsSegments {
  encoding: 'GSM-7' | 'UCS-2'
  /** Length in encoding units (septets for GSM-7, UTF-16 units for UCS-2). */
  length: number
  segments: number
}

/** How many SMS segments a message costs, the way carriers count them. */
export function countSmsSegments(text: string): SmsSegments {
  let septets = 0
  let gsm = true
  for (const char of text) {
    if (GSM_BASIC.includes(char)) {
      septets += 1
    }
    else if (GSM_EXTENDED.includes(char)) {
      septets += 2
    }
    else {
      gsm = false
      break
    }
  }

  if (gsm)
    return { encoding: 'GSM-7', length: septets, segments: septets <= 160 ? 1 : Math.ceil(septets / 153) }

  const units = text.length
  return { encoding: 'UCS-2', length: units, segments: units <= 70 ? 1 : Math.ceil(units / 67) }
}

/**
 * The line under a message: its length and segment count. Placeholders are
 * left out of the count, since their values are not known here, and a message
 * that is nothing but placeholders has no length worth showing.
 */
function smsMeta(text: string): string {
  const fixed = text.replace(PLACEHOLDER, '')
  const hasPlaceholders = fixed !== text
  if (hasPlaceholders && fixed.trim() === '')
    return `<div class="bp-sms-meta">Length depends on what is filled in</div>`

  const { encoding, length, segments } = countSmsSegments(fixed)
  const plus = hasPlaceholders ? ' + placeholders' : ''
  const count = `${hasPlaceholders ? 'at least ' : ''}${segments} ${segments === 1 ? 'segment' : 'segments'}`
  const title = `${length} ${encoding === 'GSM-7' ? 'characters' : 'UTF-16 units'} (${encoding})${hasPlaceholders ? ', not counting placeholders' : ''}`
  return `<div class="bp-sms-meta" title="${escapeHtml(title)}">${length} chars${plus} · ${count}${encoding === 'UCS-2' ? ' · Unicode' : ''}</div>`
}

export function renderSmsPreview(source: string): string {
  const { headers, parts } = parseMessage(source, true)
  const from = headers.find(h => h.key === 'from')?.value ?? ''
  const to = headers.find(h => h.key === 'to')?.value
  const extra = headers
    .filter(h => h.key !== 'from' && h.key !== 'to')
    .map(h => `<div><dt>${escapeHtml(labelOf(h.key))}</dt><dd>${formatInline(h.value)}</dd></div>`)
    .join('')
  const initial = (from.replace(/[^A-Za-z0-9]/g, '')[0] ?? '#').toUpperCase()

  const bubbles = parts.map((part) => {
    const isReply = part.every(line => line.trim() === '' || line.startsWith('>'))
    const lines = isReply ? part.map(line => line.replace(/^>\s?/, '')) : part
    const text = lines.join('\n')
    const html = lines.map(formatInline).join('<br>')
    if (isReply)
      return `<div class="bp-sms-reply bp-sms-row"><div class="bp-sms-bubble">${html}</div></div>`

    return `<div class="bp-sms-row"><div class="bp-sms-bubble">${html}</div>${smsMeta(text)}</div>`
  }).join('')

  return [
    `<figure class="bp-message bp-sms" aria-label="SMS preview">`,
    `<div class="bp-sms-phone">`,
    `<div class="bp-sms-header">`,
    `<span class="bp-sms-avatar" aria-hidden="true">${escapeHtml(initial)}</span>`,
    `<span class="bp-sms-who">`,
    `<span class="bp-sms-from">${formatInline(from || 'Text message')}</span>`,
    to ? `<span class="bp-sms-to">to ${formatInline(to)}</span>` : '',
    `</span>`,
    `<span class="bp-message-kind">SMS</span>`,
    `</div>`,
    extra ? `<dl class="bp-sms-details">${extra}</dl>` : '',
    `<div class="bp-sms-thread">${bubbles}</div>`,
    `</div>`,
    `</figure>`,
  ].join('')
}

/** Render a message fence, or `null` when the language is not one of ours. */
export function renderMessagePreview(lang: string, source: string): string | null {
  switch (lang.toLowerCase()) {
    case 'email':
      return renderEmailPreview(source)
    case 'sms':
      return renderSmsPreview(source)
    default:
      return null
  }
}

/** Styles for both previews, built on the theme's own colour variables. */
export const messagePreviewCSS: string = `
.bp-message {
  margin: 20px 0;
  font-size: 15px;
  line-height: 1.6;
}
.bp-message .bp-message-var {
  display: inline-block;
  padding: 0 5px;
  border-radius: 4px;
  font-family: var(--bp-font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: 0.86em;
  line-height: 1.5;
  color: var(--bp-c-brand-1, #3451b2);
  background: var(--bp-c-brand-soft, rgba(100, 108, 255, 0.14));
  white-space: nowrap;
}
.bp-message .bp-message-kind {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bp-c-text-3, #929295);
}
/* A message's links are part of its copy, not links out of the docs. */
.bp-message .external-link-icon {
  display: none;
}
.bp-message dl {
  margin: 0;
}
.bp-message dl > div {
  display: flex;
  gap: 10px;
}
.bp-message dt {
  flex: none;
  min-width: 64px;
  color: var(--bp-c-text-3, #929295);
}
.bp-message dd {
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--bp-c-text-1, #3c3c43);
}

/* Email: a mail-client card. */
.bp-email {
  max-width: 640px;
  overflow: hidden;
  border: 1px solid var(--bp-c-divider, #e2e2e3);
  border-radius: 12px;
  background: var(--bp-c-bg-elv, #fff);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.05);
}
.bp-email-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--bp-c-divider, #e2e2e3);
  background: var(--bp-c-bg-soft, #f6f6f7);
}
.bp-email-dots {
  display: inline-flex;
  gap: 6px;
}
.bp-email-dots i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--bp-c-divider, #e2e2e3);
}
.bp-email-subject {
  padding: 16px 20px 4px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--bp-c-text-1, #3c3c43);
}
.bp-email-headers {
  padding: 4px 20px 12px;
  font-size: 13px;
  border-bottom: 1px solid var(--bp-c-divider, #e2e2e3);
}
.bp-email-preheader {
  padding: 8px 20px;
  font-size: 13px;
  color: var(--bp-c-text-2, #67676c);
  border-bottom: 1px solid var(--bp-c-divider, #e2e2e3);
}
.bp-email-preheader span {
  margin-right: 6px;
  color: var(--bp-c-text-3, #929295);
}
.bp-email-body {
  padding: 20px;
  color: var(--bp-c-text-1, #3c3c43);
}
.bp-email-body > :first-child {
  margin-top: 0;
}
.bp-email-body > :last-child {
  margin-bottom: 0;
}
.bp-email-body p,
.bp-email-body ul,
.bp-email-body blockquote {
  margin: 0 0 14px;
}
.bp-email-body ul {
  padding-left: 20px;
  list-style: disc;
}
.bp-email-body blockquote {
  padding: 4px 0 4px 14px;
  border-left: 3px solid var(--bp-c-divider, #e2e2e3);
  color: var(--bp-c-text-2, #67676c);
}
.bp-email-body hr {
  margin: 18px 0;
  border: 0;
  border-top: 1px solid var(--bp-c-divider, #e2e2e3);
}
.bp-email-body hr ~ p {
  font-size: 13px;
  color: var(--bp-c-text-2, #67676c);
}
.bp-email-body a {
  color: var(--bp-c-brand-1, #3451b2);
}
.bp-email-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.bp-email-body a.bp-email-button {
  display: inline-block;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  line-height: 1.3;
  text-decoration: none;
  color: var(--bp-button-brand-text, #fff);
  background: var(--bp-button-brand-bg, var(--bp-c-brand-3, #5672cd));
}
.bp-email-body a.bp-email-button:hover {
  background: var(--bp-button-brand-hover-bg, var(--bp-c-brand-2, #3a5ccc));
}

/* SMS: a phone thread. */
.bp-sms-phone {
  max-width: 380px;
  overflow: hidden;
  border: 1px solid var(--bp-c-divider, #e2e2e3);
  border-radius: 24px;
  background: var(--bp-c-bg-elv, #fff);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.05);
}
.bp-sms-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--bp-c-divider, #e2e2e3);
  background: var(--bp-c-bg-soft, #f6f6f7);
}
.bp-sms-avatar {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  color: var(--bp-c-white, #fff);
  background: var(--bp-c-text-3, #929295);
}
.bp-sms-who {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  line-height: 1.35;
}
.bp-sms-from {
  font-weight: 600;
  color: var(--bp-c-text-1, #3c3c43);
}
.bp-sms-to {
  font-size: 13px;
  color: var(--bp-c-text-2, #67676c);
}
.bp-sms-details {
  padding: 8px 16px;
  font-size: 13px;
  border-bottom: 1px solid var(--bp-c-divider, #e2e2e3);
}
.bp-sms-thread {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}
.bp-sms-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}
.bp-sms-bubble {
  max-width: 85%;
  padding: 8px 12px;
  border-radius: 18px 18px 18px 4px;
  overflow-wrap: anywhere;
  color: var(--bp-c-text-1, #3c3c43);
  background: var(--bp-c-gray-soft, rgba(142, 150, 170, 0.18));
}
.bp-sms-bubble a {
  color: inherit;
  text-decoration: underline;
}
.bp-sms-reply {
  align-items: flex-end;
}
.bp-sms-reply .bp-sms-bubble {
  border-radius: 18px 18px 4px 18px;
  color: #fff;
  background: #0b84ff;
}
.bp-sms-reply .bp-message-var {
  color: #fff;
  background: rgba(255, 255, 255, 0.22);
}
.bp-sms-meta {
  padding-left: 6px;
  font-size: 11px;
  color: var(--bp-c-text-3, #929295);
}
`

/**
 * Replace each top-level ```email / ```sms fence with its text, so the copy of
 * a message stays searchable while every other code block is stripped from
 * the search index. A message fence shown inside a longer example fence is
 * left alone: that is syntax being demonstrated, not a message.
 */
export function unwrapMessageFences(markdown: string): string {
  const out: string[] = []
  let outer: string | null = null
  let message: { marker: string, lines: string[] } | null = null

  for (const line of markdown.split('\n')) {
    const fence = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/)

    if (message) {
      if (fence && fence[1][0] === message.marker[0] && fence[1].length >= message.marker.length && fence[2].trim() === '') {
        const { headers, parts } = parseMessage(message.lines.join('\n'), true)
        out.push('', ...headers.map(h => h.value), ...parts.flat(), '')
        message = null
      }
      else {
        message.lines.push(line)
      }
      continue
    }

    if (outer) {
      if (fence && fence[1][0] === outer[0] && fence[1].length >= outer.length && fence[2].trim() === '')
        outer = null
      out.push(line)
      continue
    }

    if (fence) {
      if (isMessagePreviewLang(fence[2].trim().split(/[\s{]/)[0] ?? ''))
        message = { marker: fence[1], lines: [] }
      else
        outer = fence[1]
      if (!message)
        out.push(line)
      continue
    }

    out.push(line)
  }

  return out.join('\n')
}
