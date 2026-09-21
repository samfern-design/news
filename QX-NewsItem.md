# QX-NewsItem

**Qmodii design system · component brief**
Status: Draft · Owner: Sam Fernandes (Design)

One list row for a single news story — headline, source, timestamp, and optional
media and signal metadata. It is the single row behind every news feed across
QSweb, Quotestream Mobile, Research Hub, and the QX / QMOD embeddable widgets.

It is configured entirely by props. **Presets are named prop bundles, not
separate components**: pick a preset for the surface you're on, then override any
individual prop.

- **Interactive playground:** https://claude.ai/artifact/TGQj5VMwQVDCdVL44thUiZ
- **Source:** `samfern-design/news` · branch `claude/news-articles-playground-o8rqoh`
- **Component:** `components/data/QXNewsItem.jsx` (+ `.d.ts`), dependency-free renderer `qxnewsitem.vanilla.js`, styles `qxnewsitem.css`

---

## Where it's used

Any vertical feed of stories, plus a few adjacent contexts:

- Market news feed
- Symbol-scoped news (quote detail / overview)
- Watchlist & portfolio news
- Top stories & breaking modules
- Most read rails
- Related-article lists
- News search results
- WMID / third-party embeddable widgets

**Reach for a different component when:** the *symbol* is the subject, not the
headline → **QMSymbolList**; the identity is a form type + date → a filings row.

---

## Presets

Choosing a preset sets defaults; every prop stays overridable. One preset per
module — a single **Lead** row is the only permitted exception.

| Preset | Meta | Title | Description | Media | Signals |
|---|---|---|---|---|---|
| **Feed** (default) | Top | 2 lines | 2 lines | Leading | Sentiment + AI, right |
| **Editorial** | Bottom | 2 lines | 3 lines | Trailing | Sentiment + AI stack under the image |
| **Compact** | Top | 1 line | 2 lines | — | Symbols only (no topic) |
| **Lead** | Top | 2 lines | 3 lines | Above, full width | Sentiment + AI, right |
| **Embed** | Top | 1 line | — | — | None (no badge row) |

---

## Composition model

Beyond show / hide, each signal has a **placement**. That's what lets one row
read correctly in a wide feed and a narrow rail without a second component.

- **Topic** — `topicPosition`: `badge` (default) · `top`. Inline in the badge
  row, or promoted to its own kicker row above the headline. Topic always leads
  the badge row, before symbols.
- **Sentiment & AI** — `sentimentPosition` / `aiPosition`: `right` (default) ·
  `badge`. Default home is a right-hand cluster; on Editorial they stack beneath
  the trailing image.
- **Meta row** — `metaPosition`: `top` (default) · `bottom` · `right`. Exactly
  one renders — above the headline, below the badges, or in the right aside.
- **Media** — `imagePosition`: `leading` (default) · `trailing` · `above`. 16:9,
  crop to fill, never letterbox. A branded source monogram stands in when a
  thumbnail is missing.
- **Density** — `comfortable` (default) · `compact`: padding & line-height only.

---

## Anatomy (top to bottom)

1. **Row** — outer container and the single interactive target, a native `<a>`. *Required.*
2. **Signal spine** — 3px leading edge coloured by importance rank (high / medium / low). Off by default.
3. **Media** — thumbnail or branded fallback tile. Leading, trailing, or above.
4. **Topic kicker** — topic chip on its own row above the headline, when promoted.
5. **Meta row** — source · relative time. Top, bottom, or right — only one.
6. **Title** — the headline. Line-clamped. The accessible name. *Required.*
7. **Description** — story snippet. Line-clamped.
8. **Badge row** — topic → symbols, then any inline sentiment / AI. Collapses with no reserved space.
9. **Right aside** — sentiment chip + AI icon (their default home) and, optionally, the meta row.
10. **Divider** — hairline rule between rows, owned by the list, not the row.

---

## Render states

- **Default** — row at container background, divider only.
- **Hover** — row background shifts; headline takes the link-hover colour.
- **Focus** — visible 2px ring on the row bounds at 2px offset (WCAG 2.4.7).
- **Read / visited** — headline drops to secondary; image at 70% opacity.
- **Locked** — headline stays legible; description + image frosted with a lock affordance and an "Upgrade to read" badge. Headline is never blurred.
- **Loading** — skeleton mirrors the configured anatomy exactly, so nothing shifts when data lands.

---

## Signature behaviors

- **AI summary popover** — the AI mark is pink, deliberately off the blue brand.
  It's a real affordance (`role="button"`, `aria-haspopup="dialog"`): click or
  Enter opens a dialog with key points, a disclaimer, and a last-updated line.
  Portaled to `<body>` so a list's overflow can't clip it; Esc / outside-click closes it.
- **Symbols that never wrap** — a story can name several tickers, each with its %
  change. A `ResizeObserver` fits as many chips as the row allows on one line and
  folds the rest into `+N more`, recomputed on every resize (3 chips in a wide
  feed become 1 in a narrow rail).
- **Sentiment chip** — a light pill: a coloured direction glyph (▲ / ▼ / –), a
  hairline divider, then the word. Shape *and* word, never colour alone; drawn
  from the semantic market up / down / hold tokens. `sentimentIconOnly` renders a
  compact glyph-only pill (accessible label kept).
- **Signal spine** — optional 3px importance edge for breaking / ranked feeds
  (amber, blue, or grey by rank). Reads as urgency without stealing the row's colour budget.
- **Branded fallback tile** — a source monogram stands in when a thumbnail is
  missing, so alignment holds across a feed with patchy image coverage.

---

## Accessibility

- The row is a native `<a>` and a **single tab stop**; `Enter` opens the story, or the upgrade modal when locked.
- The **accessible name is the headline alone**. Source, time, symbol, topic, and sentiment stay in DOM order after the title even when `metaPosition` reorders them visually.
- Focus is a visible **2px ring at 2px offset** — colour change is never the only signal (WCAG 2.4.7).
- Sentiment and the AI icon carry `aria-label`s; the timestamp is a `<time datetime>`. The AI popover is a labelled dialog with Esc / outside-click to close.
- Locked rows keep the headline fully legible and add `aria-describedby` explaining the upgrade — the headline is **never blurred**.

---

## Design-system fidelity

- Every colour, space, radius, and shadow is a `--qx-*` token — no hardcoded hex. Retint the theme and the row retints with it.
- Sentiment and importance come from **semantic** tokens, so CVD themes and white-label palettes come along automatically.
- Namespaced under `.qx-newsitem` with resolved `var()` fallbacks, per the WMID scoping rules — safe to embed in a third-party page whose CSS we don't control.
- Ships as a React component (`QXNewsItem.jsx` + types) and a dependency-free renderer — the same markup, so the brief and playground run with no build step.

---

## Props reference

| Prop | Type | Default | Notes |
|---|---|---|---|
| `preset` | `feed \| editorial \| compact \| lead \| embed` | `feed` | Named prop bundle. |
| `density` | `comfortable \| compact` | `comfortable` | Padding & line-height only. |
| `state` | `default \| hover \| focus \| read \| loading \| locked` | `default` | Render / interaction state. |
| `title` | `string` | — | Headline. The accessible name. Required. |
| `description` | `string` | — | Story snippet. |
| `source` | `string` | — | Source name. |
| `timestamp` | `string` | — | Relative time, e.g. "18m ago". |
| `datetime` | `string` | — | ISO value for the `<time datetime>` attribute. |
| `image` | `string` | — | Thumbnail URL; falls back to a branded tile. |
| `sourceInitials` | `string` | — | Monogram for the fallback tile. |
| `imageAlt` | `string` | `""` | `""` for a decorative thumbnail; real text only when it adds info. |
| `symbol` | `string` | — | Single ticker. |
| `symbolChange` | `number` | — | % change for a single symbol. |
| `symbols` | `Array<string \| {symbol, change}>` | — | Multiple tickers; overrides `symbol`. Fits to one line + `+N more`. |
| `sentiment` | `positive \| negative \| neutral` | `neutral` | Semantic tone. |
| `sentimentIconOnly` | `boolean` | `false` | Glyph-only sentiment pill (keeps the label for AT). |
| `topic` | `string` | — | Topic chip label. |
| `aiLabel` | `string` | `"Summary generated by AI"` | Accessible name for the AI icon. |
| `aiSummary` | `string[]` | placeholder | Bullets in the AI summary popover. |
| `aiUpdated` | `string` | `"9:47am"` | "Last updated" time in the popover. |
| `signalLevel` | `high \| medium \| low` | `high` | Signal-spine importance colour. |
| `titleLines` | `1 \| 2 \| 3 \| full` | preset | Headline line clamp. |
| `showDescription` | `boolean` | preset | |
| `descriptionLines` | `1 \| 2 \| 3` | preset | Hidden when description is off. |
| `showImage` | `boolean` | preset | |
| `imagePosition` | `leading \| trailing \| above` | preset | Hidden when image is off. |
| `showSymbol` / `showSentiment` / `showAI` / `showTopic` | `boolean` | — | Badge / signal members. |
| `topicPosition` | `badge \| top` | `badge` | |
| `sentimentPosition` / `aiPosition` | `right \| badge` | `right` | |
| `metaPosition` | `top \| bottom \| right` | preset | Only one meta row renders. |
| `showSignalSpine` | `boolean` | `false` | |
| `onActivate` | `(props) => void` | — | Called on activation instead of following `href`. |

---

## Open questions (from the spec)

1. Does Filings get its own row, or a configured QX-NewsItem with media + description off?
2. Is read / visited state persisted per user, and across which products?
3. Is the signal spine available outside the Benzinga feed, or does it need a graceful-absence rule?
4. Does the topic chip navigate to a filtered view, or is it a label only? (Determines one tab stop vs. two.)
5. Which sources reliably supply thumbnails — and does that change the `showImage: true` default?
