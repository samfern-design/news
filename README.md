# QX-NewsItem — News articles playground

An interactive prototype of **QX-NewsItem**, the one-row news component from the
[Qmodii design system](./design-system) (QuoteMedia). It renders a single news
story — headline, source, timestamp, and optional media and signal metadata —
and is configured entirely by props, with presets as named prop bundles.

Built from [`qxnewsitemspec.md`](https://).

## Run it

Open **`index.html`** in a browser. No build step, no dependencies, no network —
everything (component, styles, design tokens) is vendored in this repo, so it
works offline.

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

> The design system normally loads Roboto from Google Fonts. This prototype runs
> in a network-restricted environment, so the import is omitted and the token
> stack falls back to `system-ui`. Vendor the Roboto woff2 files and restore the
> `@font-face` in `design-system/tokens/fonts.css` for the exact brand type.

## What's in the playground

- **Configure the row** — a live configurator for every prop: preset, density,
  state, title/description line clamps, media position, meta position, the four
  badge-row members, and the signal spine. A generated `<QXNewsItem …/>` snippet
  updates as you go.
- **Presets** — Feed, Editorial, Compact, Embed, and Lead side by side.
- **Interactive & render states** — default, hover, focus, read, locked, loading.
- **Real feed modules** — the same component across a Market-news feed (with a
  Lead), a curated Top Stories rail, a dense Most Read list, and a
  space-constrained third-party widget.
- **Anatomy & accessibility** reference.

## Structure

```
index.html                              the playground (dependency-free)
components/data/
  QXNewsItem.jsx                         canonical React component (design system)
  QXNewsItem.d.ts                        TypeScript types
  QXNewsItem.prompt.md                   component doc / usage rules
  qxnewsitem.css                         component styles (token-driven, namespaced)
  qxnewsitem.vanilla.js                  zero-dependency renderer the playground runs
design-system/                           Qmodii tokens + styles.css (subset used here)
```

`qxnewsitem.vanilla.js` is a faithful mirror of `QXNewsItem.jsx` — identical DOM
structure, class names and `data-*` attributes — so both are styled by the same
`qxnewsitem.css`. The `.jsx` file is the component you'd adopt in a React app;
the vanilla renderer exists so the prototype runs anywhere with no toolchain.

## Design-system fidelity

- Every colour, space, radius and shadow reads a Qmodii `--qx-*` token; no
  hardcoded hex. Retinting a theme retints the row.
- Namespaced under `.qx-newsitem` with resolved `var()` fallbacks, per the WMID
  CSS-scoping rules — safe to embed in a third-party page.
- Sentiment uses the semantic market up/down/hold tokens paired with a shape;
  the signal spine uses importance colours, not sentiment.
- Accessibility is built into the component: native `<a>` single tab stop,
  headline-only accessible name with metadata after it in DOM order, visible 2px
  focus ring, `<time datetime>`, labelled AI/sentiment icons, and a locked state
  that never blurs the headline.

## Open questions (from the spec, unresolved)

Filings as its own row vs. a configured QX-NewsItem; whether read/visited state
is persisted per user; signal-spine availability outside the Benzinga feed;
whether the topic chip navigates (one tab stop vs. two); and which sources
reliably supply thumbnails.
