# QX-NewsItem

One list row for a single news story — headline, source, timestamp, and optional
media and signal metadata. Used to let a reader scan a feed and open the full
article. One component across QSweb, Quotestream Mobile, Research Hub, and
QX/QMOD widgets. Configured by props; **presets are named prop bundles**, not
separate components.

## When to use

- Any vertical feed of stories: market news, press releases, filings, watchlist
  news, portfolio news, most read.
- Symbol-scoped news on a quote detail page; a widget-sized module (WMID); a
  related-articles list; news results in a search surface (Compact preset).

## When not to use

- Symbol rows with a trailing data point → **QMSymbolList / QuoteRow**.
- The full-text article body → the article page template.
- A hero/lead story → the **Lead** preset, not a stretched standard row.

## Presets (prop bundles)

| Preset | Meta | Title | Description | Image | Badges |
|---|---|---|---|---|---|
| `feed` (default) | top | 2 lines | 2 lines | leading | full |
| `editorial` | bottom | 2 lines | 3 lines | trailing | full |
| `compact` | top | 1 line | — | — | full |
| `lead` | top | 2 lines | 3 lines | above (full width) | full |
| `embed` | top | 1 line | — | — | none |

Choosing a preset sets defaults; every individual prop stays overridable.
`density` (`comfortable` / `compact`) adjusts padding & line-height only.

## Anatomy

`Row` (required, the `<a>` and the interactive target) · `Signal spine` (3px
importance border, off by default) · `Media` (thumbnail or branded fallback,
16:9) · `Meta row` (source · time — top **or** bottom, never both) · `Title`
(required, line-clamped) · `Description` (line-clamped) · `Badge row`
(symbol · sentiment · AI · topic — collapses with no reserved space) ·
`Divider` (owned by the list, not the row).

## Rules

- Whole row is the link target (44×44 min tap area).
- Line clamps, never character-count truncation or manual ellipsis.
- Branded fallback tile whenever `showImage` and a thumbnail is missing.
- Semantic sentiment tokens + a shape (never colour alone). Label AI content.
- Never blur or truncate the headline in the locked state.
- Don't mix presets in one module (a single Lead row is the only exception).
- Don't reserve empty space for a collapsed badge row.

## Accessibility

Single tab stop (native `<a>`); `Enter` opens the story (or the upgrade modal
when locked). Accessible name is the headline alone — source, time, symbol,
topic and sentiment stay in DOM order after the title even when
`metaPosition="top"` reorders them visually. Visible 2px focus ring at 2px
offset. Timestamp in `<time datetime>`. Sentiment and AI icons carry
`aria-label`s. Locked rows keep the headline legible and add `aria-describedby`.

## Example

```jsx
<QXNewsItem
  preset="feed"
  title="Nvidia clears $4.5 trillion as data-center demand outruns supply"
  description="The chipmaker’s latest guidance implies another record quarter…"
  source="Bloomberg" timestamp="18m ago" datetime="2026-08-14T13:42:00Z"
  image={thumbUrl} sourceInitials="BL"
  symbol="NVDA" symbolChange={3.11} sentiment="positive" topic="Earnings"
  showSymbol showTopic showSentiment
/>
```
