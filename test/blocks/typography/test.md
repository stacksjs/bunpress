---
title: Typography Test
description: Comprehensive test of typography elements in markdown
author: BunPress Team
layout: doc
toc: sidebar
---

# Typography Test

This document tests all typography elements including headings, emphasis, links, and text formatting.

## Headings

# Heading Level 1 (H1)

## Heading Level 2 (H2)

### Heading Level 3 (H3)

#### Heading Level 4 (H4)

##### Heading Level 5 (H5)

###### Heading Level 6 (H6)

## Emphasis and Text Formatting

### Bold Text

This is **bold text** using double asterisks.

This is **bold text** using double underscores.

### Italic Text

This is *italic text* using single asterisks.

This is *italic text* using single underscores.

### Bold and Italic Combined

This is ***bold and italic*** using triple asterisks.

This is ***bold and italic*** using triple underscores.

This is **bold with *italic* inside**.

This is *italic with **bold** inside*.

### Strikethrough

This is ~~strikethrough text~~.

### Superscript and Subscript

This is E=mc² (superscript using HTML).

This is H₂O (subscript using HTML).

## Links

### Basic Links

[Link to Google](https://google.com)

[Link with title](https://google.com "Google Homepage")

### Reference Links

[Reference link][1]

[Another reference][ref]

### Autolinks

Automatic links: <https://github.com> and <http://example.com>

Email links: <user@example.com>

### Links with Emphasis

**[Bold link](https://google.com)**

*[Italic link](https://github.com)*

~~[Strikethrough link](https://example.com)~~

## Lists

### Unordered Lists

- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
    - Deeply nested item 2.2.1
- Item 3

### Ordered Lists

1. First item
2. Second item
   1. Nested ordered item 2.1
   2. Nested ordered item 2.2
3. Third item

### Mixed Lists

1. Ordered item 1
   - Unordered sub-item 1.1
   - Unordered sub-item 1.2
2. Ordered item 2
   - Unordered sub-item 2.1
     1. Deep ordered sub-item 2.1.1
     2. Deep ordered sub-item 2.1.2

### Task Lists

- [ ] Uncompleted task
- [x] Completed task
- [ ] Task with **bold** and *italic* text
- [x] Task with [link](https://example.com)

## Blockquotes

### Simple Blockquote

> This is a simple blockquote.
> It can span multiple lines.

### Nested Blockquotes

> This is the outer blockquote.
>
> > This is a nested blockquote inside the outer one.
> >
> > > This is deeply nested blockquote.
>
> Back to the outer blockquote.

### Blockquotes with Other Elements

> #### Heading in Blockquote
>
> This blockquote contains:
>
> - A list item
> - **Bold text**
> - *Italic text*
> - `inline code`
>
> And a [link](https://example.com)

## Horizontal Rules

Content before the rule.

---

Content after the first rule.

***

Content after the second rule.

___

Content after the third rule.

## Hard Line Breaks

This is the first line.
This is the second line with a hard break.

This is the first paragraph.

This is the second paragraph.

## Special Characters and Entities

### HTML Entities

&copy; Copyright 2024

&reg; Registered Trademark

&trade; Trademark

&hearts; Hearts Symbol

&frac12; One Half

&deg; Degrees

### Unicode Characters

™ Trademark

© Copyright

® Registered

♥ Heart

½ One Half

° Degrees

### Emojis

😀 😀 😃 😄 😁 😆 😅 😂 🤣

❤️ 💛 💚 💙 💜 🖤 🤍 🤎

🚀 ✨ 💡 🔥 ⭐ 🌟 ✨ 🌙 🌟

## Code and Preformatted Text

### Inline Code

Use `console.log()` for debugging.

You can also use `const variable = 'value'` in your code.

### Code Blocks

See the code-blocks test for comprehensive code block testing.

## Tables

### Basic Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

### Tables with Alignment

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Left         | Center         | Right         |
| Text         | Text           | Text          |

### Tables with Formatting

| Feature | Status | Description |
|---------|--------|-------------|
| **Bold** | ✅ | Working perfectly |
| *Italic* | ✅ | Also working |
| `Code` | ✅ | Syntax highlighting |
| [Link](https://example.com) | ✅ | Clickable links |

## Definition Lists

Term 1
: Definition 1 with some explanation.

Term 2
: Definition 2 that spans multiple lines
  and can contain formatting like **bold** and *italic*.

Complex Term
: A more complex definition that might include:

- List items
- **Formatting**
- `code snippets`
- [links](https://example.com)

## Abbreviations

HTML is a markup language.

*[HTML]: HyperText Markup Language

CSS helps style web pages.

*[CSS]: Cascading Style Sheets

## Footnotes

Here's a sentence with a footnote[^1].

And here's another footnote reference[^2].

[^1]: This is the first footnote.
[^2]: This is the second footnote with **formatting**.

## Mathematical Expressions

### Inline Math

The famous equation $E = mc^2$ shows energy-mass equivalence.

### Block Math

The quadratic formula is:

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

Maxwell's equations in differential form:

$$\nabla \times \vec{\mathbf{E}} = -\frac{\partial \vec{\mathbf{B}}}{\partial t}$$

## Keyboard Shortcuts

Use <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy.

Press <kbd>Ctrl</kbd> + <kbd>V</kbd> to paste.

Use <kbd>Alt</kbd> + <kbd>F4</kbd> to close.

## Highlighted Text

This is ==highlighted text== using mark syntax.

You can also use <mark>HTML mark tags</mark>.

## Underlined Text

This text has <u>underline formatting</u>.

## Small Text

This is <small>small text</small>.

## Big Text

This is <big>big text</big>.

## Inserted and Deleted Text

This text was <ins>inserted</ins> into the document.

This text was <del>deleted</del> from the document.

## Bidirectional Text

This is regular text. <bdo dir="rtl">هذا نص عربي</bdo> This is regular text again.

## Ruby Annotations

<ruby>
  漢 <rt>Hàn</rt>
  字 <rt>zì</rt>
</ruby>

## Details/Summary (HTML5)

<details>
<summary>Click to expand this section</summary>

This content is hidden by default and can be revealed by clicking the summary.

It can contain:

- Lists
- **Formatting**
- `Code`
- [Links](https://example.com)

</details>

## Time Element

The meeting is scheduled for <time datetime="2024-01-15T10:00">January 15, 2024 at 10:00 AM</time>.

## Progress Element

Task completion: <progress value="75" max="100">75%</progress>

## Meter Element

Storage usage: <meter value="0.8" min="0" max="1" low="0.2" high="0.8" optimum="0.5">80%</meter>

## Word Break Opportunities

This is a long word: supercalifragilisticexpialidocious<wbr>that<wbr>needs<wbr>to<wbr>break.

## Non-Breaking Spaces

This text has non-breaking spaces: 10&nbsp;kg, Mr.&nbsp;Smith, Chapter&nbsp;1.

[1]: https://google.com
[ref]: https://github.com
