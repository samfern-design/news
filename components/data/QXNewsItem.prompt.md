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
| `editorial` | bottom | 2 lines | 3 lines | trailing | full (sentiment + AI stack under the trailing image) |
| `compact` | top | 1 line | 2 lines | — | symbols only (no topic) |
| `lead` | top | 2 lines | 3 lines | above (full width) | full |
| `embed` | top | 1 line | — | — | none |

Choosing a preset sets defaults; every individual prop stays overridable.
`density` (`comfortable` / `compact`) adjusts padding & line-height only.

## Anatomy

`Row` (required, the `<a>` and the interactive target) · `Signal spine` (3px
importance border, off by default) · `Media` (thumbnail or branded fallback,
16:9) · `Topic kicker` (topic chip on its own row above the headline, when
`topicPosition="top"`) · `Meta row` (source · time — top, bottom, **or** right,
only one) · `Title` (required, line-clamped) · `Description` (line-clamped) ·
`Badge row` (symbol chip + topic — left side, collapses with no reserved space)
· `Right aside` (sentiment chip + AI icon, their default home, plus the meta row
when `metaPosition="right"`) · `Divider` (owned by the list, not the row).

### Placement props

- `topicPosition`: `'badge'` (default, inline in the badge row) | `'top'` (own row above the headline).
- `sentimentPosition`: `'right'` (default, in the aside) | `'badge'`.
- `aiPosition`: `'right'` (default, in the aside) | `'badge'`.
- `metaPosition`: `'top'` | `'bottom'` | `'right'`.

Sentiment renders as a labelled chip (▲/▼/■ glyph + word + semantic tone token).

Pass **multiple tickers** via `symbols` (`string[]` or `{symbol, change}[]`).
The chips never wrap: as many as fit on one line show (each with its % change),
and the rest fold into a `+N more` count sized to the row via a ResizeObserver.

The **AI icon** is pink (distinct from the blue brand) and interactive: it's a
`role="button"` with `aria-haspopup="dialog"` that opens an **AI summary
popover** on click/Enter (Esc or outside-click closes it). The popover is
portaled to `document.body` (re-wrapped in `.qx-root`) so a list's `overflow`
can't clip it. Feed real content via `aiSummary` (string[]) and `aiUpdated`;
both fall back to placeholder copy.

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
