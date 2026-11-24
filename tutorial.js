// ═══════════════════════════════════════════════════════════════════════════
// ORL101 — TUTORIAL module  (Learn ▸ Tutorial)
//
// Two tutorials: Throat and Nose. Each one is a deck walk-through (every
// teaching point and image from Dr Al-Bar's slides) followed by mixed-format
// activities built from those same slides.
//
// Data contract — window.ORL_TUTORIALS (see tutorials.js):
//   { id, slug, title, title_ar, icon, colour, blurb, source_deck,
//     slides:     [ { n, title, title_ar, bullets[], image, image_caption, note } ],
//     activities: [ { type, title, ...fields } ] }
//
// Registered activity types (TUT_GAMES) and their fields:
//   mcq          { stem, image, options{A..}, answer, explanation }
//   scenario     { stem, image, options{A..}, answer, explanation }   case-based
//   millionaire  { stem, options{A..}, answer, explanation, prize }
//   guesswho     { clues[], options{A..}, answer, explanation }
//   guesswhat    { image, options{A..}, answer, explanation }
//   truefalse    { statement, answer:true|false, explanation }
//   pickmistake  { scenario, lines[], answer:"<1-based index>", explanation }
//   matching     { left[], right[], correct_pairs[[li,ri]], explanation }
//   jeopardy     { categories[], rows[ {value, cells[ {clue, answer} ] } ] }
//   spot         { image, hotspots[{x,y,label}], prompt }    x/y = % of width
//   order        { prompt, items[], correct_order[], explanation }
//   duolingo     { prompt, words[], answer_sentence, explanation }
//
// Everything degrades gracefully: an unknown type is skipped with a visible
// note rather than breaking the run, and a tutorial with no slides shows an
// explicit "content not loaded" state instead of a blank screen.
// ═══════════════════════════════════════════════════════════════════════════

const Tutorial = {
  list: [],
  current: null,      // active tutorial object
  view: 'list',       // list | slides | activities
  slideIdx: 0,
  actIdx: 0,
  score: 0,
  attempted: 0,
  _state: {},         // per-activity scratch space

  // ── lifecycle ─────────────────────────────────────────────────────────
  init() {
    this.list = (typeof ORL_TUTORIALS !== 'undefined' && ORL_TUTORIALS)
      || (typeof ORL_DATA !== 'undefined' && ORL_DATA.tutorials)
      || [];
    this.renderList();
  },

  _progKey(slug) { return 'orl101_tut_' + slug; },

  _prog(slug) {
    try { return JSON.parse(localStorage.getItem(this._progKey(slug)) || '{}'); }
    catch (e) { return {}; }
  },

  _saveProg(slug, patch) {
    const p = Object.assign(this._prog(slug), patch);
    try { localStorage.setItem(this._progKey(slug), JSON.stringify(p)); } catch (e) {}
    return p;
  },

  // ── tutorial list ─────────────────────────────────────────────────────
  renderList() {
    this.view = 'list';
    this._show('tut-list-view');
    const host = document.getElementById('tut-list');
    if (!host) return;

    if (!this.list.length) {
      host.innerHTML = this._empty('No tutorials yet',
        'The Throat and Nose tutorials appear here once their slides are loaded.');
      return;
    }

    host.innerHTML = this.list.map(t => {
      const p = this._prog(t.slug);
      const ns = (t.slides || []).length;
      const na = (t.activities || []).length;
      const seen = Math.min(p.slidesSeen || 0, ns);
      const slidesChip = ns
        ? `<span class="tut-chip ${seen >= ns && ns ? 'done' : ''}">📑 ${seen}/${ns} slides</span>`
        : `<span class="tut-chip">📑 slides pending</span>`;
      const actChip = na
        ? `<span class="tut-chip ${p.actDone ? 'done' : ''}">🎯 ${na} activities</span>`
        : `<span class="tut-chip">🎯 activities pending</span>`;
      const best = (p.bestScore != null && p.bestOf)
        ? `<span class="tut-chip done">🏅 best ${p.bestScore}/${p.bestOf}</span>` : '';
      return `
        <div class="tut-card">
          <div class="tut-card-icon" style="background:${t.colour || 'var(--teal)'};">${t.icon || '📘'}</div>
          <div class="tut-card-body">
            <div class="tut-card-title">${this._esc(t.title)}</div>
            <div class="tut-card-ar">${this._esc(t.title_ar || '')}</div>
            <div class="tut-card-blurb">${this._esc(t.blurb || '')}</div>
            <div class="tut-card-meta">${slidesChip}${actChip}${best}</div>
            <div class="tut-card-btns">
              <button class="tut-go slides" onclick="Tutorial.open('${t.slug}')"
                      ${ns ? '' : 'disabled'}>📑 Slides${ns ? ` (${ns})` : ''}</button>
              <button class="tut-go acts" onclick="Tutorial.openActivities('${t.slug}')"
                      ${na ? '' : 'disabled'}>🎯 Activities${na ? ` (${na})` : ''}</button>
            </div>
          </div>
        </div>`;
    }).join('');
  },

  open(slug) {
    const t = this.list.find(x => x.slug === slug);
    if (!t) return;
    this.current = t;
    this.slideIdx = 0; this.actIdx = 0; this.score = 0; this.attempted = 0;
    if (typeof haptic === 'function') haptic('light');
    if ((t.slides || []).length) this.renderSlides();
    else if ((t.activities || []).length) this.startActivities();
    else this.renderPending();
  },

  // Jump straight to the activities without walking the whole deck.
  openActivities(slug) {
    const t = this.list.find(x => x.slug === slug);
    if (!t) return;
    this.current = t;
    this.slideIdx = 0;
    if (typeof haptic === 'function') haptic('light');
    if ((t.activities || []).length) this.startActivities();
    else this.renderPending();
  },

  renderPending() {
    this._show('tut-slides-view');
    const t = this.current;
    this._setTitle(t.title);
    const host = document.getElementById('tut-slide-body');
    if (host) {
      host.innerHTML = this._empty(
        `${t.title} tutorial — content not loaded`,
        'The slides for this tutorial have not been added yet. Nothing is shown here until the real deck content is in place.');
    }
    const nav = document.getElementById('tut-slide-nav');
    if (nav) nav.innerHTML = `<button class="btn btn-full" onclick="Tutorial.renderList()">← Back to tutorials</button>`;
    const pw = document.getElementById('tut-progress-wrap');
    if (pw) pw.innerHTML = '';
  },

  // ── slide walk-through ────────────────────────────────────────────────
  renderSlides() {
    this.view = 'slides';
    this._show('tut-slides-view');
    const t = this.current;
    const slides = t.slides || [];
    const s = slides[this.slideIdx];
    this._setTitle(`${t.title} — Tutorial`);

    const pw = document.getElementById('tut-progress-wrap');
    if (pw) {
      const pct = slides.length ? Math.round((this.slideIdx + 1) / slides.length * 100) : 0;
      pw.innerHTML = `
        <div class="tut-progress"><div class="tut-progress-fill" style="width:${pct}%"></div></div>
        <div class="tut-progress-label">Slide ${this.slideIdx + 1} of ${slides.length}</div>`;
    }

    const host = document.getElementById('tut-slide-body');
    if (host && s) {
      host.innerHTML = `
        <div class="tut-slide">
          <div class="tut-slide-n">Slide ${s.n != null ? s.n : this.slideIdx + 1}</div>
          <h2>${this._esc(s.title || '')}</h2>
          ${s.title_ar ? `<div class="tut-slide-ar">${this._esc(s.title_ar)}</div>` : ''}
          ${(s.bullets && s.bullets.length)
            ? `<ul>${s.bullets.map(b => `<li>${this._md(b)}</li>`).join('')}</ul>` : ''}
          ${s.image ? `<img class="tut-slide-img" src="${this._esc(s.image)}" alt="${this._esc(s.image_caption || s.title || '')}" loading="lazy">` : ''}
          ${s.image_caption ? `<div class="tut-slide-cap">${this._esc(s.image_caption)}</div>` : ''}
          ${s.note ? `<div class="tut-slide-note">${this._md(s.note)}</div>` : ''}
        </div>`;
    }

    const nav = document.getElementById('tut-slide-nav');
    if (nav) {
      const last = this.slideIdx >= slides.length - 1;
      const nextLabel = last
        ? ((t.activities || []).length ? '🎯 Start activities' : '✓ Finish')
        : 'Next →';
      nav.innerHTML = `
        <div class="tut-nav">
          <button class="btn btn-secondary" ${this.slideIdx === 0 ? 'disabled' : ''}
                  onclick="Tutorial.prevSlide()">← Prev</button>
          <div class="tut-nav-count">${this.slideIdx + 1}/${slides.length}</div>
          <button class="btn" onclick="Tutorial.nextSlide()">${nextLabel}</button>
        </div>
        <div class="tut-jump">
          <input type="range" min="1" max="${slides.length}" value="${this.slideIdx + 1}"
                 oninput="Tutorial.jumpSlide(this.value)" aria-label="Jump to slide">
          ${(t.activities || []).length ? `<button class="tut-go acts"
                 onclick="Tutorial.startActivities()">🎯 Skip to activities (${t.activities.length})</button>` : ''}
        </div>`;
    }

    const seen = Math.max(this._prog(t.slug).slidesSeen || 0, this.slideIdx + 1);
    this._saveProg(t.slug, { slidesSeen: seen });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  nextSlide() {
    const slides = this.current.slides || [];
    if (this.slideIdx < slides.length - 1) { this.slideIdx++; this.renderSlides(); return; }
    if ((this.current.activities || []).length) this.startActivities();
    else this.renderList();
  },

  prevSlide() {
    if (this.slideIdx > 0) { this.slideIdx--; this.renderSlides(); }
  },

  jumpSlide(v) {
    const n = Math.max(1, Math.min(parseInt(v, 10) || 1, (this.current.slides || []).length));
    this.slideIdx = n - 1;
    this.renderSlides();
  },

  // ── activities ────────────────────────────────────────────────────────
  startActivities() {
    this.view = 'activities';
    this.actIdx = 0; this.score = 0; this.attempted = 0;
    this._show('tut-act-view');
    this.renderMenu();
  },

  // Pick any activity directly — no forced sequence.
  renderMenu() {
    const t = this.current;
    const acts = t.activities || [];
    this._setTitle(`${t.title} — Activities`, 'tut-act-title');
    const strip = document.getElementById('tut-act-score');
    if (strip) strip.innerHTML = `<b>${acts.length}</b> activities &nbsp;·&nbsp; pick any one`;
    const host = document.getElementById('tut-act-body');
    if (host) {
      host.innerHTML = `<div class="tut-menu">` + acts.map((a, i) => {
        const g = TUT_GAMES[a.type] || { label: a.type };
        return `<button class="tut-menu-item" onclick="Tutorial.goActivity(${i})">
          <span class="tut-menu-n">${i + 1}</span>
          <span class="tut-menu-body">
            <span class="tut-menu-title">${this._esc(a.title || g.label)}</span>
            <span class="tut-menu-kind">${this._esc(g.label)}</span>
          </span>
          <span class="hm-arrow">›</span>
        </button>`;
      }).join('') + `</div>`;
    }
    const f = document.getElementById('tut-act-nav');
    if (f) f.innerHTML = `<div class="tut-nav">
      <button class="btn btn-secondary" onclick="Tutorial.renderList()">← Tutorials</button>
      <button class="btn" onclick="Tutorial.goActivity(0)">▶ Play all in order</button>
    </div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  goActivity(i) {
    this.actIdx = i;
    this.renderActivity();
  },

  renderActivity() {
    const t = this.current;
    const acts = t.activities || [];
    const a = acts[this.actIdx];
    this._setTitle(`${t.title} — Activities`, 'tut-act-title');
    this._state = {};

    const strip = document.getElementById('tut-act-score');
    if (strip) {
      strip.innerHTML = `Activity <b>${Math.min(this.actIdx + 1, acts.length)}</b> of <b>${acts.length}</b>
                         &nbsp;·&nbsp; Score <b>${this.score}</b>/${this.attempted}`;
    }

    const host = document.getElementById('tut-act-body');
    if (!host) return;

    if (!a) { this.finishActivities(); return; }

    const game = TUT_GAMES[a.type];
    if (!game) {
      host.innerHTML = `<div class="tut-act">
        <div class="tut-act-kind">Unsupported</div>
        <h3>${this._esc(a.title || a.type)}</h3>
        <div class="tut-act-stem">This activity type (<code>${this._esc(a.type)}</code>)
        is not registered, so it is skipped rather than shown wrongly.</div>
      </div>`;
      this._footer(true);
      return;
    }

    host.innerHTML = `<div class="tut-act">
      <div class="tut-act-kind" ${a.kindColour ? `style="background:${a.kindColour}"` : ''}>${this._esc(game.label)}</div>
      <h3>${this._esc(a.title || '')}</h3>
      ${game.render.call(this, a)}
      <div id="tut-act-fb"></div>
    </div>`;
    if (game.after) game.after.call(this, a);
    this._footer(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  _footer(skippable) {
    const f = document.getElementById('tut-act-nav');
    if (!f) return;
    f.innerHTML = `<div class="tut-nav">
      <button class="btn btn-secondary" onclick="Tutorial.renderMenu()">☰ All activities</button>
      <button class="btn" id="tut-next-btn" onclick="Tutorial.nextActivity()">
        ${skippable ? 'Skip →' : 'Next →'}</button>
    </div>`;
  },

  nextActivity() {
    this.actIdx++;
    if (this.actIdx >= (this.current.activities || []).length) this.finishActivities();
    else this.renderActivity();
  },

  finishActivities() {
    const t = this.current;
    const pct = this.attempted ? Math.round(this.score / this.attempted * 100) : 0;
    const prev = this._prog(t.slug);
    if (prev.bestScore == null || this.score > prev.bestScore) {
      this._saveProg(t.slug, { bestScore: this.score, bestOf: this.attempted, actDone: true });
    } else {
      this._saveProg(t.slug, { actDone: true });
    }
    const host = document.getElementById('tut-act-body');
    if (host) {
      host.innerHTML = `<div class="tut-act" style="text-align:center;">
        <div style="font-size:56px; margin-bottom:10px;">${pct >= 70 ? '🏅' : '📘'}</div>
        <h3>${this._esc(t.title)} tutorial complete</h3>
        <div class="tut-act-stem">You scored <b>${this.score}</b> out of <b>${this.attempted}</b>${this.attempted ? ` (${pct}%)` : ''}.</div>
      </div>`;
    }
    const f = document.getElementById('tut-act-nav');
    if (f) f.innerHTML = `<div class="tut-nav">
      <button class="btn btn-secondary" onclick="Tutorial.renderMenu()">☰ All activities</button>
      <button class="btn" onclick="Tutorial.renderList()">Done</button>
    </div>`;
    const strip = document.getElementById('tut-act-score');
    if (strip) strip.innerHTML = `Final score <b>${this.score}</b>/${this.attempted}`;
  },

  // ── shared answer handling ────────────────────────────────────────────
  _grade(ok, explanation, correctLabel) {
    this.attempted++;
    if (ok) this.score++;
    if (typeof haptic === 'function') haptic(ok ? 'light' : 'medium');
    const fb = document.getElementById('tut-act-fb');
    if (fb) {
      fb.innerHTML = `<div class="tut-fb ${ok ? 'ok' : 'no'}">
        <div class="tut-fb-title">${ok ? '✓ Correct' : '✗ Not quite'}</div>
        ${!ok && correctLabel ? `<div style="margin-bottom:6px;"><b>Answer:</b> ${this._esc(correctLabel)}</div>` : ''}
        ${explanation ? this._md(explanation) : ''}
      </div>`;
    }
    const strip = document.getElementById('tut-act-score');
    if (strip) {
      const acts = this.current.activities || [];
      strip.innerHTML = `Activity <b>${this.actIdx + 1}</b> of <b>${acts.length}</b>
                         &nbsp;·&nbsp; Score <b>${this.score}</b>/${this.attempted}`;
    }
  },

  // option-button click (mcq / scenario / guesswho / guesswhat / millionaire)
  answerOption(key) {
    const a = (this.current.activities || [])[this.actIdx];
    if (!a || this._state.answered) return;
    this._state.answered = true;
    const ok = String(key) === String(a.answer);
    document.querySelectorAll('#tut-act-body .tut-opt').forEach(btn => {
      btn.disabled = true;
      const k = btn.dataset.key;
      if (k === String(a.answer)) btn.classList.add('correct');
      else if (k === String(key)) btn.classList.add('wrong');
    });
    const label = a.options ? a.options[a.answer] : '';
    this._grade(ok, a.explanation, label ? `${a.answer}. ${label}` : a.answer);
  },

  answerTF(val) {
    const a = (this.current.activities || [])[this.actIdx];
    if (!a || this._state.answered) return;
    this._state.answered = true;
    document.querySelectorAll('#tut-act-body .tut-tf button').forEach(b => b.disabled = true);
    this._grade(!!val === !!a.answer, a.explanation, a.answer ? 'True' : 'False');
  },

  // ── helpers ───────────────────────────────────────────────────────────
  _show(id) {
    ['tut-list-view', 'tut-slides-view', 'tut-act-view'].forEach(v => {
      const el = document.getElementById(v);
      if (el) el.classList.toggle('hidden', v !== id);
    });
  },

  _setTitle(txt, id) {
    const el = document.getElementById(id || 'tut-slide-title');
    if (el) el.textContent = txt;
  },

  _empty(title, body) {
    return `<div class="tut-empty">
      <div class="tut-empty-icon">📭</div>
      <h3>${this._esc(title)}</h3>
      <p>${this._esc(body)}</p>
    </div>`;
  },

  _esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  // minimal markdown: **bold**, *italic*, `code`, line breaks
  _md(s) {
    return this._esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  },

  _optsHtml(options) {
    return Object.keys(options || {}).map(k => `
      <button class="tut-opt" data-key="${this._esc(k)}" onclick="Tutorial.answerOption('${this._esc(k)}')">
        <span class="tut-opt-key">${this._esc(k)}</span>
        <span>${this._md(options[k])}</span>
      </button>`).join('');
  },

  _shuffled(arr) {
    const a = [...(arr || [])];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// Activity renderers. Each entry: { label, render(a), after?(a) }
// `this` inside render/after is the Tutorial object.
// ═══════════════════════════════════════════════════════════════════════════
const TUT_GAMES = {

  mcq: {
    label: 'MCQ',
    render(a) {
      return `${a.stem ? `<div class="tut-act-stem">${this._md(a.stem)}</div>` : ''}
        ${a.image ? `<img class="tut-act-img" src="${this._esc(a.image)}" loading="lazy" alt="">` : ''}
        ${this._optsHtml(a.options)}`;
    }
  },

  scenario: {
    label: 'Case scenario',
    render(a) {
      return `<div class="tut-act-stem">${this._md(a.stem)}</div>
        ${a.image ? `<img class="tut-act-img" src="${this._esc(a.image)}" loading="lazy" alt="">` : ''}
        ${a.question ? `<div class="tut-act-stem"><b>${this._md(a.question)}</b></div>` : ''}
        ${this._optsHtml(a.options)}`;
    }
  },

  millionaire: {
    label: 'Who wants to be a millionaire',
    render(a) {
      return `${a.prize ? `<div class="tut-chip" style="background:var(--gold-light); color:#6b4e00;">💰 ${this._esc(a.prize)}</div>` : ''}
        <div class="tut-act-stem">${this._md(a.stem)}</div>
        ${this._optsHtml(a.options)}`;
    }
  },

  guesswho: {
    label: 'Guess who',
    render(a) {
      const clues = (a.clues || []).map((c, i) =>
        `<li><b>Clue ${i + 1}:</b> ${this._md(c)}</li>`).join('');
      return `<ul style="margin:12px 0 0 0; padding-left:20px;">${clues}</ul>
        ${this._optsHtml(a.options)}`;
    }
  },

  guesswhat: {
    label: 'Guess what',
    render(a) {
      return `${a.prompt ? `<div class="tut-act-stem">${this._md(a.prompt)}</div>` : ''}
        ${a.image ? `<img class="tut-act-img" src="${this._esc(a.image)}" loading="lazy" alt="">` : ''}
        ${this._optsHtml(a.options)}`;
    }
  },

  truefalse: {
    label: 'True or false',
    render(a) {
      return `<div class="tut-act-stem">${this._md(a.statement)}</div>
        <div class="tut-tf">
          <button class="yes" onclick="Tutorial.answerTF(true)">✅ True</button>
          <button class="no"  onclick="Tutorial.answerTF(false)">❌ False</button>
        </div>`;
    }
  },

  pickmistake: {
    label: 'Pick the mistake',
    render(a) {
      const opts = {};
      const items = a.lines || [];
      items.forEach((l, i) => { opts[String(i + 1)] = l; });
      this._state.pm = a;
      return `<div class="tut-act-stem">${this._md(a.scenario)}</div>
        <div class="tut-order-label">Which step is wrong?</div>
        ${this._optsHtml(opts)}`;
    }
  },

  matching: {
    label: 'Matching',
    render(a) {
      const left = (a.left || []).map((l, i) =>
        `<button class="tut-match-item" data-side="L" data-i="${i}"
          onclick="TUT_GAMES.matching.pick.call(Tutorial,'L',${i})">${this._md(l)}</button>`).join('');
      const order = this._shuffled((a.right || []).map((r, i) => i));
      this._state.rightOrder = order;
      const right = order.map(i =>
        `<button class="tut-match-item" data-side="R" data-i="${i}"
          onclick="TUT_GAMES.matching.pick.call(Tutorial,'R',${i})">${this._md(a.right[i])}</button>`).join('');
      this._state.pairsLeft = (a.correct_pairs || []).length;
      this._state.sel = null;
      return `<div class="tut-act-stem">Tap one item on the left, then its pair on the right.</div>
        <div class="tut-match-cols"><div class="tut-order-pool">${left}</div>
        <div class="tut-order-pool">${right}</div></div>`;
    },
    pick(side, i) {
      const a = (this.current.activities || [])[this.actIdx];
      const sel = this._state.sel;
      const el = document.querySelector(`#tut-act-body .tut-match-item[data-side="${side}"][data-i="${i}"]`);
      if (!el || el.classList.contains('done')) return;
      if (!sel) {
        document.querySelectorAll('#tut-act-body .tut-match-item.sel').forEach(x => x.classList.remove('sel'));
        el.classList.add('sel');
        this._state.sel = { side, i };
        return;
      }
      if (sel.side === side) {
        document.querySelectorAll('#tut-act-body .tut-match-item.sel').forEach(x => x.classList.remove('sel'));
        el.classList.add('sel');
        this._state.sel = { side, i };
        return;
      }
      const li = side === 'L' ? i : sel.i;
      const ri = side === 'R' ? i : sel.i;
      const ok = (a.correct_pairs || []).some(p => p[0] === li && p[1] === ri);
      const other = document.querySelector(`#tut-act-body .tut-match-item[data-side="${sel.side}"][data-i="${sel.i}"]`);
      document.querySelectorAll('#tut-act-body .tut-match-item.sel').forEach(x => x.classList.remove('sel'));
      this._state.sel = null;
      if (ok) {
        el.classList.add('done'); if (other) other.classList.add('done');
        this._state.pairsLeft--;
        if (this._state.pairsLeft <= 0) this._grade(true, a.explanation);
      } else {
        el.classList.add('wrong'); if (other) other.classList.add('wrong');
        setTimeout(() => {
          el.classList.remove('wrong'); if (other) other.classList.remove('wrong');
        }, 550);
      }
    }
  },

  jeopardy: {
    label: 'Jeopardy',
    render(a) {
      const cats = a.categories || [];
      const rows = a.rows || [];
      const cols = cats.length || 1;
      let html = `<div class="tut-jep-grid" style="grid-template-columns:repeat(${cols},1fr);">`;
      html += cats.map(c => `<div class="tut-jep-cat">${this._esc(c)}</div>`).join('');
      rows.forEach((row, ri) => {
        (row.cells || []).forEach((cell, ci) => {
          html += `<button class="tut-jep-cell" id="jep-${ri}-${ci}"
            onclick="TUT_GAMES.jeopardy.openCell.call(Tutorial,${ri},${ci})">${this._esc(row.value || '')}</button>`;
        });
      });
      html += `</div><div id="tut-jep-q" style="margin-top:14px;"></div>`;
      this._state.jepLeft = rows.reduce((n, r) => n + (r.cells || []).length, 0);
      return html;
    },
    openCell(ri, ci) {
      const a = (this.current.activities || [])[this.actIdx];
      const cell = ((a.rows || [])[ri] || {}).cells[ci];
      const btn = document.getElementById(`jep-${ri}-${ci}`);
      if (!cell || !btn || btn.disabled) return;
      btn.disabled = true;
      const host = document.getElementById('tut-jep-q');
      const opts = cell.options || {};
      host.innerHTML = `<div class="tut-act-stem"><b>${this._esc(a.categories[ci] || '')} — ${this._esc((a.rows[ri] || {}).value || '')}</b></div>
        <div class="tut-act-stem">${this._md(cell.clue)}</div>
        ${Object.keys(opts).map(k => `
          <button class="tut-opt" data-key="${k}" onclick="TUT_GAMES.jeopardy.answer.call(Tutorial,${ri},${ci},'${k}')">
            <span class="tut-opt-key">${k}</span><span>${this._md(opts[k])}</span></button>`).join('')}`;
    },
    answer(ri, ci, key) {
      const a = (this.current.activities || [])[this.actIdx];
      const cell = ((a.rows || [])[ri] || {}).cells[ci];
      const ok = String(key) === String(cell.answer);
      document.querySelectorAll('#tut-jep-q .tut-opt').forEach(b => {
        b.disabled = true;
        if (b.dataset.key === String(cell.answer)) b.classList.add('correct');
        else if (b.dataset.key === String(key)) b.classList.add('wrong');
      });
      this._grade(ok, cell.explanation, cell.options ? cell.options[cell.answer] : cell.answer);
      this._state.jepLeft--;
    }
  },

  spot: {
    label: 'Spot it',
    render(a) {
      const dots = (a.hotspots || []).map((h, i) =>
        `<div class="tut-spot-dot" id="spot-${i}" style="left:${h.x}%; top:${h.y}%;"
          onclick="TUT_GAMES.spot.hit.call(Tutorial,${i})" title=""></div>`).join('');
      this._state.spotLeft = (a.hotspots || []).length;
      this._state.spotFound = [];
      return `<div class="tut-act-stem">${this._md(a.prompt || 'Tap each marked structure.')}</div>
        <div class="tut-spot-wrap">
          <img src="${this._esc(a.image)}" loading="lazy" alt="">${dots}
        </div>
        <div id="tut-spot-log" class="tut-order-pool"></div>`;
    },
    hit(i) {
      const a = (this.current.activities || [])[this.actIdx];
      const h = (a.hotspots || [])[i];
      const dot = document.getElementById('spot-' + i);
      if (!h || !dot || dot.classList.contains('found')) return;
      dot.classList.add('found');
      this._state.spotFound.push(h.label);
      const log = document.getElementById('tut-spot-log');
      if (log) log.innerHTML = this._state.spotFound
        .map(l => `<div class="tut-order-item placed">✓ ${this._esc(l)}</div>`).join('');
      this._state.spotLeft--;
      if (this._state.spotLeft <= 0) this._grade(true, a.explanation);
    }
  },

  order: {
    label: 'Put it in order',
    render(a) {
      const pool = this._shuffled((a.items || []).map((v, i) => i));
      this._state.orderPlaced = [];
      return `<div class="tut-act-stem">${this._md(a.prompt || 'Tap the steps in the correct order.')}</div>
        <div class="tut-order-label">Your sequence</div>
        <div class="tut-order-slots" id="tut-order-slots"></div>
        <div class="tut-order-label">Steps</div>
        <div class="tut-order-pool" id="tut-order-pool">
          ${pool.map(i => `<button class="tut-order-item" id="ord-${i}"
            onclick="TUT_GAMES.order.place.call(Tutorial,${i})">${this._md(a.items[i])}</button>`).join('')}
        </div>
        <button class="btn btn-full" style="margin-top:14px;"
          onclick="TUT_GAMES.order.check.call(Tutorial)">Check order</button>`;
    },
    place(i) {
      const a = (this.current.activities || [])[this.actIdx];
      if (this._state.answered) return;
      const btn = document.getElementById('ord-' + i);
      if (!btn || btn.classList.contains('placed')) return;
      btn.classList.add('placed'); btn.disabled = true;
      this._state.orderPlaced.push(i);
      const slots = document.getElementById('tut-order-slots');
      if (slots) slots.innerHTML = this._state.orderPlaced.map((idx, n) =>
        `<div class="tut-order-item placed">${n + 1}. ${this._md(a.items[idx])}</div>`).join('');
    },
    check() {
      const a = (this.current.activities || [])[this.actIdx];
      if (this._state.answered) return;
      const want = a.correct_order || [];
      const got = this._state.orderPlaced;
      if (got.length < want.length) { if (typeof showToast === 'function') showToast('Place all the steps first'); return; }
      this._state.answered = true;
      const ok = want.every((v, i) => String(v) === String(got[i]));
      const right = want.map((v, i) => `${i + 1}. ${a.items[v]}`).join(' → ');
      this._grade(ok, a.explanation, right);
    }
  },

  duolingo: {
    label: 'Build the sentence',
    render(a) {
      const words = this._shuffled(a.words || []);
      this._state.built = [];
      return `<div class="tut-act-stem">${this._md(a.prompt || 'Tap the words to build the correct statement.')}</div>
        <div class="tut-order-label">Your answer</div>
        <div class="tut-order-item placed" id="tut-duo-line" style="min-height:44px;"></div>
        <div class="tut-order-label">Words</div>
        <div class="tut-order-pool" id="tut-duo-pool" style="flex-direction:row; flex-wrap:wrap;">
          ${words.map((w, i) => `<button class="tut-order-item" id="duo-${i}" style="flex:0 0 auto;"
            onclick="TUT_GAMES.duolingo.tap.call(Tutorial,${i},'${this._esc(w).replace(/'/g, "\\'")}')">${this._esc(w)}</button>`).join('')}
        </div>
        <button class="btn btn-full" style="margin-top:14px;"
          onclick="TUT_GAMES.duolingo.check.call(Tutorial)">Check</button>`;
    },
    tap(i, w) {
      if (this._state.answered) return;
      const b = document.getElementById('duo-' + i);
      if (!b || b.disabled) return;
      b.disabled = true; b.style.opacity = .35;
      this._state.built.push(w);
      const line = document.getElementById('tut-duo-line');
      if (line) line.textContent = this._state.built.join(' ');
    },
    check() {
      const a = (this.current.activities || [])[this.actIdx];
      if (this._state.answered) return;
      this._state.answered = true;
      const norm = s => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
      const ok = norm(this._state.built.join(' ')) === norm(a.answer_sentence);
      this._grade(ok, a.explanation, a.answer_sentence);
    }
  }
};

window.Tutorial = Tutorial;
window.TUT_GAMES = TUT_GAMES;
