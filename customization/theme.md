---
title: Theme and CSS
description: Customize color, typography, and spacing with the official Starlight CSS seam.
sidebar:
  order: 3
---

Use `theme.customCss` to refine the Starlight surface without replacing its layout or accessibility behavior.

## Load a consumer stylesheet

```json
{
  "theme": {
    "customCss": [".upcontent/theme.css"]
  }
}
```

The path is relative to the consumer repository. CSS is bundled during the build, so keep the stylesheet in the content repository rather than depending on a remote stylesheet.

## Use Starlight tokens

```css
:root {
  --sl-color-accent: #0f766e;
  --sl-color-accent-high: #115e59;
  --sl-font: 'Poppins', sans-serif;
}

:root[data-theme='dark'] {
  --sl-color-accent: #5eead4;
  --sl-color-accent-high: #99f6e4;
}
```

Tokens keep custom colors aligned with callouts, links, code blocks, and theme switching.

## Keep the interface coherent

- Define both light and dark values for strong colors.
- Prefer tokens over hard-coded colors in component selectors.
- Keep body text readable before adjusting decorative styles.
- Use one display or body family consistently instead of styling every section differently.
- Check keyboard focus and reduced-motion behavior after adding transitions.

The site's stylesheet is a working example of this seam.
