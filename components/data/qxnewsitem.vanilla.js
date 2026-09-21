/* ============================================================
   QX-NewsItem — dependency-free renderer (window.QXNewsItem)

   A vanilla-JS mirror of QXNewsItem.jsx: same DOM structure, same
   class names, same data-* attributes, so components/data/qxnewsitem.css
   styles both identically. This is what the offline playground runs; the
   .jsx file is the canonical React component for the design system.

   Usage:
     const node = QXNewsItem.render({ preset: 'feed', title: '…', … });
     container.appendChild(node);
   ============================================================ */
(function (root) {
  'use strict';

  const PRESETS = {
    feed:      { metaPosition: 'top',    titleLines: 2, showDescription: true,  descriptionLines: 2, showImage: true,  imagePosition: 'leading',  showBadgeRow: true },
    editorial: { metaPosition: 'bottom', titleLines: 2, showDescription: true,  descriptionLines: 3, showImage: true,  imagePosition: 'trailing', showBadgeRow: true },
    compact:   { metaPosition: 'top',    titleLines: 1, showDescription: true,  descriptionLines: 2, showImage: false, imagePosition: 'leading',  showBadgeRow: true, showTopic: false },
    lead:      { metaPosition: 'top',    titleLines: 2, showDescription: true,  descriptionLines: 3, showImage: true,  imagePosition: 'above',    showBadgeRow: true },
    embed:     { metaPosition: 'top',    titleLines: 1, showDescription: false, descriptionLines: 1, showImage: false, imagePosition: 'leading',  showBadgeRow: false, minimalMeta: true },
  };

  const pick = (v, pv, fb) => (v !== undefined ? v : (pv !== undefined ? pv : fb));

  const SVGNS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const val = attrs[k];
      if (val === undefined || val === null || val === false) continue;
      if (k === 'text') node.textContent = val;
      else if (k === 'html') node.innerHTML = val;
      else node.setAttribute(k, val === true ? '' : val);
    }
    if (children) [].concat(children).forEach(c => { if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return node;
  }
  function svg(attrs, children) {
    const node = document.createElementNS(SVGNS, 'svg');
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    [].concat(children || []).forEach(c => node.appendChild(c));
    return node;
  }
  function path(d, extra) {
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', d);
    if (extra) for (const k in extra) p.setAttribute(k, extra[k]);
    return p;
  }
  function rect(a) { const r = document.createElementNS(SVGNS, 'rect'); for (const k in a) r.setAttribute(k, a[k]); return r; }

  function sentimentIcon(sentiment, iconOnly) {
    const map = {
      positive: { glyph: '▲', word: 'Positive', label: 'Positive sentiment', cls: 'qx-ni-pos' },
      negative: { glyph: '▼', word: 'Negative', label: 'Negative sentiment', cls: 'qx-ni-neg' },
      neutral:  { glyph: '–', word: 'Neutral',  label: 'Neutral sentiment',  cls: 'qx-ni-neu' },
    };
    const s = map[sentiment] || map.neutral;
    const kids = [el('span', { class: 'qx-ni-sentiment-glyph', 'aria-hidden': 'true', text: s.glyph })];
    if (!iconOnly) kids.push(el('span', { class: 'qx-ni-sentiment-label', text: s.word }));
    return el('span', { class: 'qx-ni-sentiment ' + s.cls + (iconOnly ? ' qx-ni-sentiment--icon' : ''), role: 'img', 'aria-label': s.label, title: s.label }, kids);
  }
  function aiSparkle() {
    return svg({ width: 12, height: 12, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': 'true' },
      [path('M12 2l1.9 5.3L19 9.2l-5.1 1.9L12 16l-1.9-4.9L5 9.2l5.1-1.9L12 2zM19 14l.9 2.5L22 17.4l-2.1.9L19 21l-.9-2.7L16 17.4l2.1-.9L19 14z')]);
  }
  function refreshIcon() {
    return svg({ width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' },
      [path('M21 12a9 9 0 1 1-2.64-6.36'), path('M21 3v6h-6')]);
  }

  /* ---- AI summary popover (portaled to body, re-wrapped in .qx-root) ------- */
  let _openPop = null;
  function _closePopover(returnFocus) {
    if (!_openPop) return;
    const trigger = _openPop.trigger;
    trigger.setAttribute('aria-expanded', 'false');
    _openPop.wrap.remove();
    document.removeEventListener('mousedown', _onDocDown, true);
    document.removeEventListener('keydown', _onKey, true);
    window.removeEventListener('resize', _reposition, true);
    window.removeEventListener('scroll', _reposition, true);
    _openPop = null;
    if (returnFocus && trigger.focus) trigger.focus();
  }
  function _onDocDown(e) { if (_openPop && !_openPop.wrap.contains(e.target) && !_openPop.trigger.contains(e.target)) _closePopover(false); }
  function _onKey(e) { if (e.key === 'Escape') { e.preventDefault(); _closePopover(true); } }
  function _reposition() { if (_openPop) _position(_openPop.pop, _openPop.trigger); }
  function _position(pop, trigger) {
    const rc = trigger.getBoundingClientRect();
    const w = pop.offsetWidth, hgt = pop.offsetHeight, gap = 8, m = 12;
    let left = Math.max(m, Math.min(rc.right - w, window.innerWidth - w - m));
    let top = rc.bottom + gap;
    if (top + hgt > window.innerHeight - m && rc.top - gap - hgt > m) top = rc.top - gap - hgt;
    top = Math.max(m, Math.min(top, window.innerHeight - hgt - m));
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }
  function _buildPopover(props) {
    const bullets = (props && props.aiSummary) || [
      'Key drivers behind the move are summarized here in two or three concise lines.',
      'A second point captures the guidance change, risk, or analyst reaction worth noting.',
      'A closing point flags what to watch next for this story.',
    ];
    const pop = el('div', { class: 'qx-ni-ai-popover', role: 'dialog', 'aria-label': 'AI article summary' }, [
      el('div', { class: 'qx-ni-ai-pop-head' }, [
        el('span', { class: 'qx-ni-ai-pop-mark', 'aria-hidden': 'true' }, [aiSparkle()]),
        document.createTextNode('AI Article Summary'),
      ]),
      el('div', { class: 'qx-ni-ai-pop-body' }, [
        el('h4', { text: 'Key points' }),
        el('ul', {}, bullets.map(b => el('li', { text: b }))),
      ]),
      el('div', { class: 'qx-ni-ai-pop-note', text: 'AI summary is generated automatically and is for informational use only. It does not constitute trade advice or a recommendation.' }),
      el('div', { class: 'qx-ni-ai-pop-foot' }, [refreshIcon(), document.createTextNode('Last updated ' + ((props && props.aiUpdated) || '9:47am'))]),
    ]);
    const wrap = el('div', { class: 'qx-root' }, [pop]);
    return { wrap, pop };
  }
  function _openPopover(trigger, props) {
    const wasOpen = _openPop && _openPop.trigger === trigger;
    _closePopover(false);
    if (wasOpen) return;   // second click on the same icon toggles it closed
    const built = _buildPopover(props);
    document.body.appendChild(built.wrap);
    _openPop = { wrap: built.wrap, pop: built.pop, trigger };
    trigger.setAttribute('aria-expanded', 'true');
    _position(built.pop, trigger);
    document.addEventListener('mousedown', _onDocDown, true);
    document.addEventListener('keydown', _onKey, true);
    window.addEventListener('resize', _reposition, true);
    window.addEventListener('scroll', _reposition, true);
  }

  function aiIcon(props) {
    const name = (props && props.aiLabel) || 'Summary generated by AI';
    const btn = el('span', { class: 'qx-ni-ai', role: 'button', tabindex: '0', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-label': name, title: name }, [aiSparkle()]);
    const activate = (e) => { e.preventDefault(); e.stopPropagation(); _openPopover(btn, props || {}); };
    btn.addEventListener('click', activate);
    btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') activate(e); });
    return btn;
  }
  function lockIcon() {
    return svg({ class: 'qx-ni-lockglyph', width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' },
      [rect({ x: 3, y: 11, width: 18, height: 10, rx: 2 }), path('M7 11V7a5 5 0 0 1 10 0v4')]);
  }

  // Fit symbol chips on a single line: show all that fit, fold the rest into
  // the "+N more" chip. Uses scrollWidth vs clientWidth on a nowrap container.
  function fitSymbols(container, symEls, moreEl) {
    if (!container || !container.clientWidth) return;   // not laid out yet
    symEls.forEach(e => { e.style.display = ''; });
    if (moreEl) moreEl.style.display = 'none';
    if (container.scrollWidth <= container.clientWidth + 0.5) return;   // all fit
    if (moreEl) moreEl.style.display = '';
    let hidden = 0;
    for (let i = symEls.length - 1; i >= 0; i--) {
      if (container.scrollWidth <= container.clientWidth + 0.5) break;
      symEls[i].style.display = 'none';
      hidden++;
    }
    if (moreEl) {
      if (hidden === 0) moreEl.style.display = 'none';
      else moreEl.textContent = '+' + hidden + ' more';
    }
  }

  function media(src, sourceInitials, alt) {
    if (src) return el('div', { class: 'qx-ni-media' }, [el('img', { class: 'qx-ni-thumb', src, alt: alt || '', loading: 'lazy' })]);
    return el('div', { class: 'qx-ni-media qx-ni-media-fallback', 'aria-hidden': 'true' },
      [el('span', { class: 'qx-ni-fallback-mark', text: (sourceInitials || 'QM').slice(0, 3) })]);
  }

  function skeleton(r) {
    const line = (w) => el('span', { class: 'qx-ni-sk-line', style: 'width:' + (w || '100%') });
    const titleN = r.titleLines === 'full' ? 2 : r.titleLines;
    const titleW = ['92%', '68%'];
    const descW = ['100%', '96%', '54%'];
    const bodyKids = [];
    if (r.metaPosition === 'top') bodyKids.push(el('span', { class: 'qx-ni-sk-meta' }));
    bodyKids.push(el('div', { class: 'qx-ni-sk-title' }, Array.from({ length: titleN }, (_, i) => line(titleW[i]))));
    if (r.showDescription) bodyKids.push(el('div', { class: 'qx-ni-sk-desc' }, Array.from({ length: Math.min(r.descriptionLines, 3) }, (_, i) => line(descW[i]))));
    if (r.showBadgeRow) bodyKids.push(el('div', { class: 'qx-ni-sk-badges' }, [el('span'), el('span')]));
    if (r.metaPosition === 'bottom') bodyKids.push(el('span', { class: 'qx-ni-sk-meta' }));
    const body = el('div', { class: 'qx-ni-sk-body' }, bodyKids);
    const mediaEl = r.showImage ? el('div', { class: 'qx-ni-sk-media' }) : null;
    const order = r.imagePosition === 'trailing' ? [body, mediaEl] : [mediaEl, body];
    return el('div', { class: 'qx-ni-inner' }, order.filter(Boolean));
  }

  function render(props) {
    props = props || {};
    const preset = props.preset || 'feed';
    const density = props.density || 'comfortable';
    const state = props.state || 'default';
    const p = PRESETS[preset] || PRESETS.feed;

    const r = {
      metaPosition:     pick(props.metaPosition,     p.metaPosition,     'top'),
      titleLines:       pick(props.titleLines,       p.titleLines,       2),
      showDescription:  pick(props.showDescription,  p.showDescription,  true),
      descriptionLines: pick(props.descriptionLines, p.descriptionLines, 2),
      showImage:        pick(props.showImage,        p.showImage,        true),
      imagePosition:    pick(props.imagePosition,    p.imagePosition,    'leading'),
      showBadgeRow:     pick(props.showBadgeRow,     p.showBadgeRow,     true),
      showSymbol:       pick(props.showSymbol,       undefined,          !!props.symbol),
      showSentiment:    pick(props.showSentiment,    undefined,          false),
      showAI:           pick(props.showAI,           undefined,          false),
      showTopic:        pick(props.showTopic,        p.showTopic,        !!props.topic),
      showSignalSpine:  pick(props.showSignalSpine,  undefined,          false),
      topicPosition:    pick(props.topicPosition,    p.topicPosition,    'badge'),   // 'badge' | 'top'
      sentimentPosition: pick(props.sentimentPosition, p.sentimentPosition, 'right'), // 'right' | 'badge'
      aiPosition:       pick(props.aiPosition,       p.aiPosition,       'right'),   // 'right' | 'badge'
      minimalMeta:      p.minimalMeta || false,
    };

    const title = props.title || 'Headline goes here';
    const signalLevel = props.signalLevel || 'high';

    const dataAttrs = {
      class: 'qx-newsitem',
      'data-preset': preset,
      'data-density': density,
      'data-state': state,
      'data-image-pos': r.showImage ? r.imagePosition : 'none',
      'data-meta-pos': r.metaPosition,
      'data-signal': r.showSignalSpine ? signalLevel : undefined,
      'data-title-lines': r.titleLines,
      'data-desc-lines': r.descriptionLines,
    };

    if (state === 'loading') {
      return el('div', Object.assign({}, dataAttrs, { 'aria-hidden': 'true', role: 'presentation' }), [skeleton(r)]);
    }

    const isLocked = state === 'locked';

    // Reusable badge/marks
    const topicChip = (r.showTopic && props.topic) ? () => el('span', { class: 'qx-ni-topic', text: props.topic }) : null;

    // Symbols — a story can reference several. Normalize to a list; the chips
    // never wrap — as many as fit on one line show, the rest fold into a
    // "+N more" count sized to the row (see fitSymbols / ResizeObserver below).
    let symbolList = [];
    if (Array.isArray(props.symbols) && props.symbols.length) {
      symbolList = props.symbols.map(s => (typeof s === 'string' ? { symbol: s } : s));
    } else if (props.symbol) {
      symbolList = [{ symbol: props.symbol, change: props.symbolChange }];
    }
    function symbolChipEl(item, showChange) {
      const chg = showChange ? item.change : undefined;
      const cls = 'qx-ni-symbol' + (chg != null ? (chg >= 0 ? ' qx-ni-up' : ' qx-ni-down') : '');
      const kids = [document.createTextNode(item.symbol)];
      if (chg != null) kids.push(el('span', { class: 'qx-ni-symbol-chg', text: (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%' }));
      return el('span', { class: cls }, kids);
    }
    let symbolChipEls = [];
    let symbolMoreEl = null;
    if (r.showSymbol && symbolList.length) {
      symbolChipEls = symbolList.map(item => symbolChipEl(item, true));  // always show change when present
      symbolMoreEl = el('span', { class: 'qx-ni-symbol-more', style: 'display:none' });
    }

    const sentimentChip = r.showSentiment ? sentimentIcon(props.sentiment || 'neutral', !!props.sentimentIconOnly) : null;
    const aiBtn = r.showAI ? aiIcon(props) : null;

    // Left badge row — topic always leads, then symbols, then any
    // sentiment/AI placed 'badge'.
    let badgeRow = null;
    if (r.showBadgeRow) {
      const badges = [];
      if (topicChip && r.topicPosition === 'badge') badges.push(topicChip());
      badges.push(...symbolChipEls);
      if (symbolMoreEl) badges.push(symbolMoreEl);
      if (sentimentChip && r.sentimentPosition === 'badge') badges.push(sentimentChip);
      if (aiBtn && r.aiPosition === 'badge') badges.push(aiBtn);
      if (badges.length) badgeRow = el('div', { class: 'qx-ni-badges' }, badges);
      // Symbols never wrap: fit as many as the row allows, fold the rest into
      // "+N more". Re-runs whenever the row's width changes.
      if (badgeRow && symbolChipEls.length) {
        const run = () => fitSymbols(badgeRow, symbolChipEls, symbolMoreEl);
        if (typeof ResizeObserver !== 'undefined') { new ResizeObserver(run).observe(badgeRow); }
        else { (window.requestAnimationFrame || window.setTimeout)(run); }
        // Chip widths change when the webfont swaps in — re-fit once it loads.
        if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) document.fonts.ready.then(run);
      }
    }

    // Topic kicker — own row above the headline (topicPosition='top').
    const kicker = (topicChip && r.topicPosition === 'top')
      ? el('div', { class: 'qx-ni-kicker' }, [topicChip()])
      : null;

    // Meta row
    const timeAttrs = { class: 'qx-ni-time', text: props.timestamp || '2h ago' };
    if (props.datetime) timeAttrs.datetime = props.datetime;
    const metaRow = el('div', { class: 'qx-ni-meta' }, [
      el('span', { class: 'qx-ni-source', text: props.source || 'Source name' }),
      el('span', { class: 'qx-ni-sep', 'aria-hidden': 'true', text: '·' }),
      el('time', timeAttrs),
    ]);
    const metaInMain = r.metaPosition !== 'right';

    const titleEl = el('h3', { class: 'qx-ni-title', text: title });
    const descEl = (r.showDescription && !r.minimalMeta)
      ? el('p', { class: 'qx-ni-desc', text: props.description || 'Story snippet goes here' })
      : null;

    // Main column DOM order: title → description → badges → meta → kicker
    // (headline first = the a11y name; CSS `order` sets the visual placement).
    const mainKids = [titleEl, descEl, badgeRow, metaInMain ? metaRow : null, kicker];
    if (isLocked) mainKids.push(el('span', { id: 'qx-ni-lock-desc', class: 'qx-sr-only', text: 'This story requires an upgrade to read.' }));
    const main = el('div', { class: 'qx-ni-main' }, mainKids.filter(Boolean));

    // Right aside — sentiment + AI (their default home) and optional meta.
    const cluster = [];
    if (sentimentChip && r.sentimentPosition === 'right') cluster.push(sentimentChip);
    if (aiBtn && r.aiPosition === 'right') cluster.push(aiBtn);
    const asideKids = [];
    if (cluster.length) asideKids.push(el('div', { class: 'qx-ni-signal-cluster' }, cluster));
    if (!metaInMain) asideKids.push(metaRow);
    const aside = asideKids.length ? el('div', { class: 'qx-ni-aside' }, asideKids) : null;

    let mediaWrap = null;
    if (r.showImage) {
      const kids = [media(props.image, props.sourceInitials, props.imageAlt)];
      if (isLocked) kids.push(el('span', { class: 'qx-ni-media-lock', 'aria-hidden': 'true' }, [lockIcon()]));
      mediaWrap = el('div', { class: 'qx-ni-media-wrap' }, kids);
    }

    // Arrange media / main / aside. On a trailing image the aside stacks
    // *under* the image in a shared right column; leading keeps the aside on
    // the far right; above stacks the image over a main+aside row.
    let inner;
    if (!mediaWrap) {
      inner = el('div', { class: 'qx-ni-inner' }, [main, aside].filter(Boolean));
    } else if (r.imagePosition === 'trailing') {
      const rightcol = el('div', { class: 'qx-ni-rightcol' }, [mediaWrap, aside].filter(Boolean));
      inner = el('div', { class: 'qx-ni-inner' }, [main, rightcol]);
    } else if (r.imagePosition === 'above') {
      const mainrow = el('div', { class: 'qx-ni-mainrow' }, [main, aside].filter(Boolean));
      inner = el('div', { class: 'qx-ni-inner' }, [mediaWrap, mainrow]);
    } else { // leading
      inner = el('div', { class: 'qx-ni-inner' }, [mediaWrap, main, aside].filter(Boolean));
    }

    const anchorAttrs = Object.assign({
      href: props.href || '#',
      'aria-label': title,
      'aria-describedby': isLocked ? 'qx-ni-lock-desc' : undefined,
    }, dataAttrs);

    const rowKids = [];
    if (isLocked) rowKids.push(el('span', { class: 'qx-ni-lock-badge' }, [lockIcon(), document.createTextNode('Upgrade to read')]));
    rowKids.push(inner);

    const a = el('a', anchorAttrs, rowKids);
    if (props.onActivate) a.addEventListener('click', (e) => { e.preventDefault(); props.onActivate(props); });
    return a;
  }

  root.QXNewsItem = { render, PRESETS };
})(typeof window !== 'undefined' ? window : this);
