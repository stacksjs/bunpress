import { describe, expect, it } from 'bun:test'
import { countSmsSegments, parseMessage, renderEmailPreview, renderMessagePreview, renderSmsPreview, unwrapMessageFences } from '../packages/bunpress/src/message-previews'
import { markdownToHtml } from '../packages/bunpress/src/serve'

const EMAIL = [
  'from: Acme <hello@acme.com>',
  'to: The new member',
  'subject: Welcome to Acme, {firstName}',
  'preheader: Your account is ready',
  '---',
  'Hi {firstName},',
  '',
  'Your coach **{coachName}** added you. See [the guide](https://acme.com/guide).',
  '',
  '[Set your password](https://acme.com/reset?token={token})',
  '',
  '- First thing',
  '- Second thing',
  '',
  '---',
  '',
  'You get this because you joined Acme.',
].join('\n')

describe('message previews', () => {
  it('splits headers from the body only when every header line is key: value', () => {
    const parsed = parseMessage(EMAIL, false)
    expect(parsed.headers.map(h => h.key)).toEqual(['from', 'to', 'subject', 'preheader'])
    expect(parsed.parts).toHaveLength(1)

    const noHeaders = parseMessage('Just a sentence: with a colon\nand more\n---\nafter', false)
    expect(noHeaders.headers).toEqual([])
  })

  it('renders an email as a card with subject, headers, buttons and a footer', () => {
    const html = renderEmailPreview(EMAIL)
    expect(html).toContain('class="bp-email bp-message"')
    expect(html).toContain('<div class="bp-email-subject">Welcome to Acme, <span class="bp-message-var">{firstName}</span></div>')
    expect(html).toContain('<dt>From</dt><dd>Acme &lt;hello@acme.com&gt;</dd>')
    expect(html).toContain('Your account is ready')
    expect(html).toContain('<strong><span class="bp-message-var">{coachName}</span></strong>')
    // The placeholder in the URL stays literal in the href.
    expect(html).toContain('<a class="bp-email-button" href="https://acme.com/reset?token={token}"')
    expect(html).toContain('<ul><li>First thing</li><li>Second thing</li></ul>')
    expect(html).toContain('<hr>')
  })

  it('escapes HTML in the copy', () => {
    expect(renderEmailPreview('<script>alert(1)</script>')).toContain('&lt;script&gt;')
    expect(renderSmsPreview('<b>hi</b>')).not.toContain('<b>hi</b>')
  })

  it('renders unsafe links as text in email buttons, bodies, headers and SMS', () => {
    for (const href of ['javascript:alert%281%29', 'JaVaScRiPt:alert%281%29', 'data:text/html,unsafe', 'vbscript:msgbox%281%29']) {
      const email = renderEmailPreview(`subject: [Header](${href})\n---\n[Button](${href})\n\nInline [body](${href}) text`)
      const sms = renderSmsPreview(`Inline [body](${href}) text`)
      expect(email).not.toContain('href=')
      expect(sms).not.toContain('href=')
      expect(email).toContain('Button')
      expect(email).toContain('Inline body text')
    }

    for (const href of ['https://example.com/{token}', '/reset?token={token}', '#account', 'mailto:help@example.com', 'tel:+15555550123'])
      expect(renderEmailPreview(`[Continue](${href})`)).toContain(`href="${href}"`)
  })

  it('renders an SMS thread with segment counts and replies', () => {
    const html = renderSmsPreview('from: Acme\nto: The member\n---\nYour class starts at {time}. Reply STOP to opt out.\n---\n> STOP\n---\nYou are unsubscribed.')
    expect(html).toContain('class="bp-message bp-sms"')
    expect(html.match(/class="bp-sms-row"/g)).toHaveLength(2)
    expect(html).toContain('class="bp-sms-reply bp-sms-row"')
    expect(html).toContain('1 segment')
    expect(html).toContain('chars + placeholders · at least 1 segment')
    expect(renderSmsPreview('{message}')).toContain('Length depends on what is filled in')
  })

  it('counts segments the way carriers do', () => {
    expect(countSmsSegments('a'.repeat(160))).toEqual({ encoding: 'GSM-7', length: 160, segments: 1 })
    expect(countSmsSegments('a'.repeat(161))).toEqual({ encoding: 'GSM-7', length: 161, segments: 2 })
    expect(countSmsSegments('€').length).toBe(2)
    expect(countSmsSegments('Hi 👋')).toMatchObject({ encoding: 'UCS-2', segments: 1 })
    expect(countSmsSegments('é'.repeat(10) + '✓'.repeat(61)).segments).toBe(2)
  })

  it('keeps message copy searchable but leaves demonstrated syntax alone', () => {
    const md = '```email\nsubject: Hello there\n---\nBody words\n```\n\n````md\n```sms\nhidden example\n```\n````'
    const text = unwrapMessageFences(md)
    expect(text).toContain('Hello there')
    expect(text).toContain('Body words')
    expect(text).not.toContain('```email')
    expect(text).toContain('```sms\nhidden example')
  })

  it('renders fences through the markdown pipeline', async () => {
    const { html } = await markdownToHtml('# Messages\n\n```email\nsubject: Hi\n---\nHello\n```\n\n```sms\nHey\n```\n\n```ts\nconst a = 1\n```\n')
    expect(html).toContain('bp-email-subject')
    expect(html).toContain('bp-sms-bubble')
    expect(html).toContain('language-ts')
  })
})


describe('rendered email previews', () => {
  it('embeds same-site HTML in an inert sandbox and retains accessible message copy', () => {
    const html = renderEmailPreview('subject: Today: intervals\npreview: /email-previews/today.html\n---\nYour session\n\n[View](https://example.com/workout/7)')
    expect(html).toContain('src="/email-previews/today.html"')
    expect(html).toContain('sandbox=""')
    expect(html).toContain('referrerpolicy="no-referrer"')
    expect(html).toContain('<summary>Message copy</summary>')
    expect(html).toContain('Your session')
    expect(html).not.toContain('<dt>Preview</dt>')
  })

  it('rejects external, executable, parent, encoded and backslash paths', () => {
    for (const path of ['https://example.com/email.html', '//example.com/email.html', 'javascript:alert(1)', '/../secret.html', '/previews/../secret.html', '/%2e%2e/secret.html', '/a\\b.html', '/a.html?redirect=1']) {
      expect(renderEmailPreview(`preview: ${path}\n---\nSafe copy`)).not.toContain('<iframe')
    }
  })
})


it('embeds actual email HTML as escaped srcdoc without adding active elements to the docs page', () => {
  const html = renderMessagePreview('email-html', 'subject: Today\n---\n<!DOCTYPE html><html><body><h1>Training</h1><script>alert(1)</script></body></html>')!
  expect(html).toContain('srcdoc="&lt;!DOCTYPE html&gt;')
  expect(html).toContain('sandbox=""')
  expect(html).not.toContain('<script>')
  expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
})
