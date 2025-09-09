---
title: Container Extensions Test
description: Comprehensive test of all container extension types in BunPress
author: BunPress Team
layout: doc
toc: sidebar
---

# Container Extensions Test

This document tests all available container extension types in BunPress.

## Basic Info Container

::: info
This is a basic info container with default styling.
:::

## Info Container with Custom Title

::: info Custom Information
This info container has a custom title specified.
:::

## Tip Container

::: tip
This is a tip container that provides helpful advice.
:::

## Tip Container with Custom Title

::: tip 💡 Pro Tip
This tip container has a custom title with emoji.
:::

## Warning Container

::: warning
This is a warning container that alerts users to potential issues.
:::

## Warning Container with Custom Title

::: warning ⚠️ Important Warning
This warning has a custom title with emoji.
:::

## Danger Container

::: danger
This is a danger container that warns about critical issues.
:::

## Danger Container with Custom Title

::: danger 🚨 Critical Danger
This danger container has a custom title indicating high risk.
:::

## Details Container

::: details
This is a details container that can be collapsed/expanded.
:::

## Details Container with Custom Title

::: details 🔍 More Details
This details container has a custom title and can show/hide content.
:::

## Nested Containers

::: tip Outer Tip
This tip contains another container inside:

::: warning Nested Warning
This warning is nested inside a tip container.
:::
:::

## Containers with Code Blocks

::: info Code Example
Here's a code example inside an info container:

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```

:::

## Containers with Lists

::: tip Best Practices
Here are some best practices:

- Always validate user input
- Use descriptive variable names
- Write tests for your code
- Keep functions small and focused
:::

## Containers with Multiple Paragraphs

::: warning Security Notice
This is the first paragraph in a warning container.

This is the second paragraph with more detailed information about the security concern.

And here's a third paragraph with additional context and recommendations.
:::

## Containers with Links and Emphasis

::: danger Critical Update Required
**Important:** You need to update your system immediately.

Visit the [security updates page](/security) for more information.

*Note:* This update is required for all users.
:::

## Custom Container Type

::: note
This is a custom container type that doesn't have specific styling but still gets the base custom-block styling.
:::

## Container with Empty Content

::: tip
:::

## Container with Only Whitespace

::: info

:::

## Container with Special Characters

::: warning Special Characters: @#$%^&*()
This container contains special characters in the title and content: !@#$%^&*()_+-=[]{}|;:,.<>?
:::

## Container with Markdown Links

::: info
This container contains markdown links:

- [Internal Link](#container-extensions-test)
- [External Link](https://github.com)
- [Reference Link][ref]

[ref]: https://example.com
:::

## Container with Table

::: tip Data Table
Here's a table inside a container:

| Feature | Status | Description |
|---------|--------|-------------|
| Info Container | ✅ | Working |
| Tip Container | ✅ | Working |
| Warning Container | ✅ | Working |
| Danger Container | ✅ | Working |
| Details Container | ✅ | Working |
:::

## Container with Blockquote

::: info Quoted Content
Here's a blockquote inside a container:

> This is a blockquote inside a container extension.
> It can span multiple lines and maintains proper formatting.
:::

## Container with Horizontal Rule

::: warning Section Break
Content before the rule.

---

Content after the rule.
:::

## Long Content Container

::: details Long Content Example
This container contains a lot of content to test how long containers are handled.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
:::

## Container with Multiple Code Blocks

::: info Multiple Code Examples
Here are multiple code examples:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}
```

```python
def greet_user(user):
    return f"Hello, {user['name']}!"
```

```bash
#!/bin/bash
echo "Processing complete"
exit 0
```

:::

## Container with Mixed Content

::: tip Mixed Content Container
This container has mixed content types:

### Heading

Some **bold text** and *italic text*.

- List item 1
- List item 2

```javascript
console.log("Code block");
```

> Blockquote in container

And regular paragraph text.
:::

## Edge Case: Container with Only Title

::: warning
:::

## Edge Case: Very Long Title

::: info This is a very long title that should test how the container handles extremely long titles that might wrap or cause layout issues
Content with a very long title above.
:::

## Container with Unicode Characters

::: tip 🌟 Unicode Support
This container includes various Unicode characters:

- Emojis: 🚀✨💡🔥
- Symbols: ∑∆∞√∫
- Letters: αβγδεζηθικλμνξοπρστυφχψω
- Chinese: 你好世界
- Arabic: مرحبا بالعالم
:::

## Container with HTML Entities

::: danger HTML Entities Test
This container tests HTML entities:

- &lt; less than
- &gt; greater than
- &amp; ampersand
- &quot; quotation mark
- &#39; apostrophe
:::

## Final Test Container

::: info Test Complete
This is the final container in our comprehensive test suite.

All container types have been tested with various content types, edge cases, and special characters.

✅ **Test Status:** Complete
:::
