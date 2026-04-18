/**
 * ORL101 Mini App — Core JS
 */

const API = '';  // relative base URL

// ── Content cleaner (legacy — used by Action guides) ──────────────────
function cleanContent(text) {
  if (!text) return '';
  return text
    .replace(/^[\s]*[-]{3,}[\s]*$/gm, '')
    .replace(/^[\s]*[=]{3,}[\s]*$/gm, '')
    .replace(/^[\s]*[_]{3,}[\s]*$/gm, '')
    .replace(/^\+[-+]+\+$/gm, '')
    .replace(/^[=+\-|]{4,}$/gm, '')
    .replace(/^\|[-:| ]+\|$/gm, (m) => m.match(/\|[\s]*[-:]+[\s]*\|/) ? m : '')
    .replace(/[✍✎]\s*بالعربي[^\n]*/g, '')
    .replace(/\*\*✍\s*بالعربي[^*]*\*\*/g, '')
    .replace(/\s---\s/g, ' — ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ══════════════════════════════════════════════════════════════════════
//  Wiki-style Content Renderer
//  Converts Pandoc plain-text → clean Wikipedia-like HTML
// ══════════════════════════════════════════════════════════════════════

function renderWikiContent(raw) {
  if (!raw) return '<p class="wiki-empty">No content available.</p>';

  let text = raw.replace(/\\'/g, "'").replace(/\\"/g, '"');

  // ── 1. Extract "بالعربي" / voice boxes ──
  const boxes = [];
  // Pattern: lines starting with | that form a block
  text = text.replace(
    /(?:^|\n)((?:\|[^\n]*\n){2,})/g,
    (match) => {
      const lines = match.split('\n')
        .map(l => l.replace(/^\|\s*/, '').replace(/\s*\|?\s*$/, '').trim())
        .filter(l => l && l !== '|' && !l.match(/^[-=+]+$/) && !l.match(/^\*\*$/));
      // Remove the title line (** Voice box header **)
      const filtered = lines.filter(l => !l.match(/^\*\*[✍✎🔬💡🚩]/) && l !== '**');
      const content = filtered.join(' ')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .trim();
      if (content.length > 20) {
        // Try to detect the box title
        const titleLine = lines.find(l => l.match(/^\*\*[✍✎🔬💡🚩]/));
        let title = '';
        if (titleLine) {
          title = titleLine.replace(/\*\*/g, '').trim();
        }
        const idx = boxes.length;
        boxes.push({ title, content });
        return `\n%%BOX_${idx}%%\n`;
      }
      return match;
    }
  );

  // ── 2. Extract Pandoc-style tables ──
  const tables = [];
  // Find blocks: bold headers → separator(---) → data rows
  text = text.replace(
    /(\n?[ ]*\*\*[^\n]+\*\*[^\n]*\n[ ]*[-]{3,}[- ]*\n(?:[ ]*[^\n]+\n?)*)/g,
    (match) => {
      if (match.match(/%%/)) return match;
      const parsed = parsePandocTable(match);
      if (parsed) {
        const idx = tables.length;
        tables.push(parsed);
        return `\n%%TABLE_${idx}%%\n`;
      }
      return match;
    }
  );

  // ── 3. Clean decoration ──
  text = text
    .replace(/^\+[-+]+\+$/gm, '')
    .replace(/^[-]{4,}$/gm, '')
    .replace(/^[=]{4,}$/gm, '')
    .replace(/^[_]{4,}$/gm, '')
    .replace(/\s---\s/g, ' — ');

  // ── 4. Build HTML from paragraphs ──
  const blocks = text.split(/\n\n+/);
  let html = '';

  for (const block of blocks) {
    const t = block.trim();
    if (!t) continue;

    // Placeholder: voice box
    const boxM = t.match(/%BOX_(\d+)%/);
    if (boxM) {
      const b = boxes[parseInt(boxM[1])];
      const icon = b.title.match(/[✍✎]/) ? '✍' : b.title.match(/🔬/) ? '🔬' : b.title.match(/💡/) ? '💡' : b.title.match(/🚩/) ? '🚩' : '✍';
      const titleHtml = b.title ? `<div class="wiki-box-title">${icon} ${b.title.replace(/^[✍✎🔬💡🚩]\s*/, '')}</div>` : '';
      html += `<aside class="wiki-voice-box">${titleHtml}<div class="wiki-voice-text">${b.content}</div></aside>`;
      continue;
    }

    // Placeholder: table
    const tblM = t.match(/^%%TABLE_(\d+)%%$/);
    if (tblM) {
      html += tables[parseInt(tblM[1])];
      continue;
    }

    // Epigraph (opening italic quote)
    if (t.match(/^\*"/) || t.match(/^\*\\?"/)) {
      const q = t.replace(/^\*"?/, '').replace(/"?\*$/, '').trim();
      html += `<blockquote class="wiki-epigraph">${q}</blockquote>`;
      continue;
    }

    // Skip stray decorative lines
    if (t.match(/^[-=_|+]{3,}$/) || t === '|') continue;

    // Image caption lines (italic text between asterisks referencing figures)
    if (t.match(/^\*[^*]+\*$/) && t.length < 200 && (t.includes('—') || t.includes('anatomy') || t.includes('examination') || t.includes('view') || t.includes('Figure'))) {
      html += `<p class="wiki-caption">${t.replace(/^\*/, '').replace(/\*$/, '')}</p>`;
      continue;
    }

    // Process inline formatting
    let processed = t
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, ' ')
      .replace(/\s{2,}/g, ' ');

    // Arrows / special chars
    processed = processed.replace(/→/g, '→').replace(/←/g, '←');

    html += `<p>${processed}</p>`;
  }

  return `<div class="wiki-content">${html}</div>`;
}

// ── Pandoc table parser ───────────────────────────────────────────────
function parsePandocTable(block) {
  const allLines = block.split('\n').filter(l => l.trim());
  if (allLines.length < 3) return null;

  // Find separator line index
  let sepIdx = -1;
  for (let i = 0; i < allLines.length; i++) {
    if (allLines[i].match(/^\s*[-]{3,}[\s-]*$/) && i > 0) {
      sepIdx = i;
      break;
    }
  }
  if (sepIdx < 0) return null;

  // Headers from line(s) before separator
  const headerLine = allLines.slice(0, sepIdx).join(' ');
  const headers = [];
  const re = /\*\*([^*]+)\*\*/g;
  let m;
  while ((m = re.exec(headerLine)) !== null) {
    headers.push(m[1].trim());
  }
  if (headers.length < 2) return null;

  // Detect column boundaries from separator dashes
  const sepLine = allLines[sepIdx];
  const colRanges = [];
  const dashRe = /(-{2,})/g;
  while ((m = dashRe.exec(sepLine)) !== null) {
    colRanges.push({ start: m.index, end: m.index + m[0].length });
  }

  // If column ranges don't match headers, fall back to equal splits
  if (colRanges.length !== headers.length) {
    const w = Math.floor(sepLine.length / headers.length);
    colRanges.length = 0;
    for (let i = 0; i < headers.length; i++) {
      colRanges.push({ start: i * w, end: (i + 1) * w });
    }
  }

  // Parse data rows
  const dataLines = allLines.slice(sepIdx + 1)
    .filter(l => !l.match(/^\s*[-=]{3,}/)); // skip trailing separators

  const rows = [];
  let curRow = null;

  for (const line of dataLines) {
    // Extract text at each column position
    const cells = colRanges.map((r, ci) => {
      const end = ci < colRanges.length - 1 ? colRanges[ci + 1].start : line.length;
      return (line.substring(r.start, end) || '').trim();
    });

    // Is this a new row? Check if col-0 has content starting near the left edge
    const col0 = cells[0].replace(/\*\*/g, '').trim();
    const leftMost = line.search(/\S/);
    const isNew = col0.length > 0 && leftMost <= (colRanges[0].start + 3);

    if (isNew) {
      if (curRow) rows.push(curRow);
      curRow = cells.map(c => c);
    } else if (curRow) {
      cells.forEach((c, i) => {
        if (c) curRow[i] = (curRow[i] ? curRow[i] + ' ' : '') + c;
      });
    }
  }
  if (curRow) rows.push(curRow);
  if (rows.length === 0) return null;

  // Build HTML
  let html = '<div class="wiki-table-wrap"><table class="wiki-table"><thead><tr>';
  headers.forEach(h => { html += `<th>${h}</th>`; });
  html += '</tr></thead><tbody>';
  rows.forEach(row => {
    html += '<tr>';
    for (let c = 0; c < headers.length; c++) {
      let cell = (row[c] || '').trim()
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\\'/g, "'");
      html += `<td>${cell}</td>`;
    }
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

// ── Telegram WebApp SDK ──────────────────────────────────────────────────
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.enableClosingConfirmation();
}

// ── Auth state ─────────────────────────────────────────────────────────
let authToken = localStorage.getItem('orl101_token');
let currentUser = JSON.parse(localStorage.getItem('orl101_user') || 'null');

// ── API helper ─────────────────────────────────────────────────────────

// ── Auth ───────────────────────────────────────────────────────────────
async function authenticate() {
  let initData = tg?.initData || '';
  if (!initData) {
    // Dev mode fallback
    initData = 'dev_' + Date.now();
  }
  try {
    const data = await apiFetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ init_data: initData }),
    });
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('orl101_token', authToken);
    localStorage.setItem('orl101_user', JSON.stringify(currentUser));
    return data.user;
  } catch (e) {
    console.error('Auth failed:', e);
    return null;
  }
}

// ── Navigation ─────────────────────────────────────────────────────────
const sections = document.querySelectorAll('.section');
const navItems = document.querySelectorAll('.nav-item');

function toggleSub(id,card){var s=document.getElementById(id);var a=card.querySelector(".hm-arrow");if(!s)return;if(s.classList.contains("hidden")){s.classList.remove("hidden");if(a)a.classList.add("open");}else{s.classList.add("hidden");if(a)a.classList.remove("open");}}
function showSection(id) {
  sections.forEach(s => s.classList.toggle('active', s.id === id));
  navItems.forEach(n => n.classList.toggle('active', n.dataset.section === id));
  // Update browser state for back button
  history.pushState({ section: id }, '', '#' + id);
  const bb = document.getElementById('global-back-btn');
  if (bb) bb.style.display = id === 'home' ? 'none' : 'flex';
}

navItems.forEach(item => {
  item.addEventListener('click', function(){if(this.dataset.section) showSection(this.dataset.section);});
});

window.addEventListener('popstate', e => {
  const section = e.state?.section || 'home';
  showSection(section);
});

// ── Toast ──────────────────────────────────────────────────────────────
let toastTimeout;
function showToast(msg, type = '') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast${type ? ' ' + type : ''}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.remove(), 2800);
}

// ── Haptic feedback ────────────────────────────────────────────────────
function haptic(type = 'light') {
  tg?.HapticFeedback?.impactOccurred(type);
}

// ── Modal helpers ──────────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id)?.classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id)?.classList.add('hidden');
}

// ── Format date ────────────────────────────────────────────────────────
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Time format ────────────────────────────────────────────────────────
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Home section ──────────────────────────────────────────────────────
function initHome(user) {
  const greet = document.getElementById('user-greeting');
  if (greet && user) {
    const roleLabel = { admin: '⚙️ Admin', doctor: '👨‍⚕️ Doctor', student: '🎓 Student', intern: '🩺 Intern', guest: '👁️ Guest' };
    greet.textContent = `👋 Hello, ${user.first_name}!${rl}`;
  }
  // Mode cards
  document.querySelectorAll('.mode-card[data-mode]').forEach(card => {
    card.addEventListener('click', () => {
      haptic('light');
      card.dataset.mode==='search'?Chat.open():showSection(card.dataset.mode);
    });
  });
}

// ── EXAM MODE ─────────────────────────────────────────────────────────
const Exam = {
  session: null,
  questions: [],
  current: 0,
  selected: null,
  answered: false,
  timer: null,
  timeLeft: 0,
  startTime: null,

  async init() {
    this.showSetup();
    this.loadChaptersForSelect();
  },

  async loadChaptersForSelect() {
    try {
      const chapters = await apiFetch('/api/chapters');
      const sel = document.getElementById('exam-chapter-select');
      if (!sel) return;
      chapters.forEach(ch => {
        const opt = document.createElement('option');
        opt.value = ch.id;
        opt.textContent = `Ch.${ch.number} — ${ch.title}`;
        sel.appendChild(opt);
      });
    } catch (e) { console.error(e); }
  },

  showSetup() {
    document.getElementById('exam-setup').classList.remove('hidden');
    document.getElementById('exam-quiz').classList.add('hidden');
    document.getElementById('exam-result').classList.add('hidden');
  },

  async start() {
    const chapterEl = document.getElementById('exam-chapter-select');
    const numEl = document.getElementById('exam-num-questions');
    const modeEl = document.getElementById('exam-mode-select');
    const timedEl = document.getElementById('exam-timed');

    const chapter_id = chapterEl?.value ? parseInt(chapterEl.value) : null;
    const num_questions = parseInt(numEl?.value || '10');
    const mode = modeEl?.value || 'practice';
    const timed = timedEl?.checked || false;
    const time_limit = timed ? num_questions * 60 : null; // 1 min per question

    haptic('medium');

    try {
      const data = await apiFetch('/api/quiz/session', {
        method: 'POST',
        body: JSON.stringify({ chapter_id, num_questions, mode, time_limit }),
      });
      this.session = data;
      this.questions = data.questions;
      this.current = 0;
      this.timeLeft = data.time_limit || 0;

      document.getElementById('exam-setup').classList.add('hidden');
      document.getElementById('exam-quiz').classList.remove('hidden');
      document.getElementById('exam-result').classList.add('hidden');

      if (timed && time_limit) {
        this.startTimer();
      }

      this.renderQuestion();
    } catch (e) {
      showToast('Failed to start quiz: ' + e.message, 'error');
    }
  },

  startTimer() {
    const timerEl = document.getElementById('exam-timer');
    if (!timerEl) return;
    timerEl.classList.remove('hidden');
    this.timer = setInterval(() => {
      this.timeLeft--;
      timerEl.textContent = '⏱ ' + formatTime(this.timeLeft);
      if (this.timeLeft <= 60) timerEl.classList.add('warning');
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.finish();
      }
    }, 1000);
  },

  renderQuestion() {
    if (this.current >= this.questions.length) {
      this.finish();
      return;
    }
    const q = this.questions[this.current];
    this.answered = false;
    this.selected = null;
    this.startTime = Date.now();

    // Progress
    const pct = (this.current / this.questions.length) * 100;
    document.getElementById('exam-progress-fill').style.width = pct + '%';
    document.getElementById('exam-progress-label').textContent =
      `${this.current + 1} / ${this.questions.length}`;

    // Question
    document.getElementById('exam-topic').textContent = q.topic || 'ENT';
    document.getElementById('exam-question-text').textContent = q.question_text;

    // Options
    const optionsEl = document.getElementById('exam-options');
    optionsEl.innerHTML = '';
    Object.entries(q.options).forEach(([letter, text]) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="option-letter">${letter}</span><span>${text}</span>`;
      btn.dataset.letter = letter;
      btn.addEventListener('click', () => this.selectAnswer(letter, btn));
      optionsEl.appendChild(btn);
    });

    // Hide explanation and next btn
    document.getElementById('exam-explanation').classList.add('hidden');
    document.getElementById('exam-next-btn').classList.add('hidden');
  },

  selectAnswer(letter, btn) {
    if (this.answered) return;
    this.answered = true;
    this.selected = letter;

    const timeTaken = (Date.now() - this.startTime) / 1000;
    const q = this.questions[this.current];

    // Submit to API
    apiFetch('/api/quiz/answer', {
      method: 'POST',
      body: JSON.stringify({
        session_id: this.session.session_id,
        question_id: q.id,
        answer: letter,
        time_taken: timeTaken,
      }),
    }).then(result => {
      // Visual feedback
      const allBtns = document.querySelectorAll('#exam-options .option-btn');
      allBtns.forEach(b => {
        b.classList.add('disabled');
        if (b.dataset.letter === result.correct_answer) b.classList.add('reveal-correct');
      });
      if (result.correct) {
        btn.classList.add('correct');
        haptic('medium');
      } else {
        btn.classList.add('incorrect');
        haptic('heavy');
      }

      // Show explanation
      const expEl = document.getElementById('exam-explanation');
      expEl.innerHTML = `<strong>${result.correct ? '✅ Correct!' : '❌ Incorrect'}</strong> ${result.explanation || ''}`;
      expEl.classList.remove('hidden');

      document.getElementById('exam-next-btn').classList.remove('hidden');
    }).catch(e => {
      showToast('Error: ' + e.message, 'error');
    });
  },

  next() {
    this.current++;
    if (this.current >= this.questions.length) {
      this.finish();
    } else {
      this.renderQuestion();
    }
    haptic('light');
  },

  async finish() {
    if (this.timer) clearInterval(this.timer);
    try {
      const result = await apiFetch(`/api/quiz/complete/${this.session.session_id}`, { method: 'POST' });
      document.getElementById('exam-quiz').classList.add('hidden');
      document.getElementById('exam-result').classList.remove('hidden');

      const score = Math.round(result.score);
      let emoji = score >= 80 ? '🏆' : score >= 60 ? '✅' : '📚';

      document.getElementById('result-emoji').textContent = emoji;
      document.getElementById('result-score').textContent = score + '%';
      document.getElementById('result-details').textContent =
        `${result.correct} correct out of ${result.total} questions`;
      document.getElementById('result-status').textContent =
        result.passed ? '✅ Passed!' : '📚 Keep studying!';
      document.getElementById('result-status').className =
        result.passed ? 'score-passed' : 'score-failed';

      haptic('heavy');
    } catch (e) {
      showToast('Error completing quiz', 'error');
    }
  },
};

// ── CARDS MODE ────────────────────────────────────────────────────────
const Cards = {
  cards: [],
  current: 0,
  flipped: false,
  activeFilter: 'all',

  async init() {
    await this.loadCards();
    this.setupFilters();
  },

  async loadCards(category = null) {
    const url = '/api/flashcards' + (category && category !== 'all' ? `?category=${category}` : '?count=50');
    try {
      document.getElementById('cards-loading').classList.remove('hidden');
      document.getElementById('cards-deck').classList.add('hidden');
      this.cards = await apiFetch(url);
      this.current = 0;
      this.renderCard();
      document.getElementById('cards-loading').classList.add('hidden');
      document.getElementById('cards-deck').classList.remove('hidden');
    } catch (e) {
      showToast('Failed to load cards', 'error');
    }
  },

  setupFilters() {
    document.querySelectorAll('.filter-chip[data-filter]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFilter = chip.dataset.filter;
        this.loadCards(this.activeFilter !== 'all' ? this.activeFilter : null);
        haptic('light');
      });
    });
  },

  renderCard() {
    if (!this.cards.length) {
      document.getElementById('cards-empty').classList.remove('hidden');
      document.getElementById('cards-deck').classList.add('hidden');
      return;
    }

    const card = this.cards[this.current];
    const cardEl = document.getElementById('flashcard');
    if (!cardEl) return;

    // Reset flip
    this.flipped = false;
    cardEl.classList.remove('flipped');

    // Front
    const catLabel = card.category === 'red_flag' ? '🚩 Red Flag' :
      card.category === 'emergency' ? '🚨 Emergency' :
      card.category === 'anatomy' ? '🔬 Anatomy' : '💡 Clinical Pearl';
    const catClass = card.category === 'red_flag' || card.category === 'emergency' ?
      'badge-red-flag' : card.category === 'anatomy' ? 'badge-anatomy' : 'badge-clinical-pearl';

    document.getElementById('fc-front-category').innerHTML =
      `<span class="fc-category-badge ${catClass}">${catLabel}</span>`;
    document.getElementById('fc-front-text').textContent = card.front;

    // Back
    document.getElementById('fc-back-text').textContent = card.back;

    // Counter
    document.getElementById('card-counter').textContent =
      `${this.current + 1} / ${this.cards.length}`;

    // Show/hide rating row
    const ratingRow = document.getElementById('cards-rating-row');
    ratingRow?.classList.add('hidden');
  },

  flip() {
    const cardEl = document.getElementById('flashcard');
    if (!cardEl) return;
    this.flipped = !this.flipped;
    cardEl.classList.toggle('flipped', this.flipped);
    haptic('light');

    if (this.flipped) {
      document.getElementById('cards-rating-row')?.classList.remove('hidden');
    }
  },

  async rate(rating) {
    if (!this.cards.length) return;
    const card = this.cards[this.current];
    haptic('light');

    try {
      await apiFetch('/api/flashcards/review', {
        method: 'POST',
        body: JSON.stringify({ flashcard_id: card.id, rating }),
      });
    } catch (e) {
      // Fail silently for ratings
    }

    this.next();
  },

  next() {
    if (this.current < this.cards.length - 1) {
      this.current++;
    } else {
      this.current = 0;
      showToast('🎉 All cards reviewed!', 'success');
    }
    this.renderCard();
    haptic('light');
  },

  prev() {
    if (this.current > 0) {
      this.current--;
      this.renderCard();
      haptic('light');
    }
  },
};

// ── COURSE MODE ───────────────────────────────────────────────────────
const Course = {
  chapters: [],
  progress: {},
  currentChapter: null,
  subtopics: [],
  currentSubTopicIndex: 0,
  mode: localStorage.getItem('orl101_course_mode') || 'quick', // 'quick' or 'detailed'

  async init() {
    await this.loadProgress();
    this.initModeToggle();
  },

  initModeToggle() {
    const toggleWrap = document.getElementById('course-mode-toggle');
    if (!toggleWrap) return;
    toggleWrap.innerHTML = `
      <button class="course-mode-btn ${this.mode === 'quick' ? 'active' : ''}" data-mode="quick">⚡ Quick Review</button>
      <button class="course-mode-btn ${this.mode === 'detailed' ? 'active' : ''}" data-mode="detailed">📖 Detailed</button>
    `;
    toggleWrap.querySelectorAll('.course-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.mode = btn.dataset.mode;
        localStorage.setItem('orl101_course_mode', this.mode);
        toggleWrap.querySelectorAll('.course-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === this.mode));
        // Re-render current subtopic if viewing one
        if (!document.getElementById('course-subtopic-view').classList.contains('hidden')) {
          this.openSubTopic(this.currentSubTopicIndex);
        }
        haptic('light');
      });
    });
  },

  async loadProgress() {
    try {
      document.getElementById('course-loading').classList.remove('hidden');
      document.getElementById('course-list').classList.add('hidden');

      const [chapters, prog] = await Promise.all([
        Promise.resolve(ORL_DATA.chapters||[]),
        Promise.resolve({chapters:[],overall_percent:0}),
      ]);
      this.chapters = chapters;

      // Build progress map
      prog.chapters?.forEach(p => {
        this.progress[p.chapter_id] = p;
      });

      // Update ring
      this.updateProgressRing(prog.overall_percent || 0, prog.completed || 0, prog.total || chapters.length);

      // Certificate button
      if (prog.certificate_eligible) {
        document.getElementById('cert-btn-wrap')?.classList.remove('hidden');
      }

      this.renderChapterList();
      document.getElementById('course-loading').classList.add('hidden');
      document.getElementById('course-list').classList.remove('hidden');
    } catch (e) {
      console.error(e);
    }
  },

  updateProgressRing(pct, completed, total) {
    const circle = document.getElementById('progress-ring-fill');
    if (circle) {
      const r = 30;
      const circ = 2 * Math.PI * r;
      circle.style.strokeDasharray = circ;
      circle.style.strokeDashoffset = circ - (pct / 100) * circ;
    }
    const textEl = document.getElementById('progress-pct-text');
    if (textEl) textEl.textContent = Math.round(pct) + '%';
    const statsEl = document.getElementById('progress-stats-text');
    if (statsEl) statsEl.innerHTML = `<strong>${completed}</strong> / ${total} chapters completed`;
  },

  renderChapterList() {
    const list = document.getElementById('course-chapter-list');
    if (!list) return;
    list.innerHTML = '';

    let currentPart = '';
    this.chapters.forEach(ch => {
      if (ch.part && ch.part !== currentPart) {
        currentPart = ch.part;
        const partDiv = document.createElement('div');
        partDiv.className = 'course-part-header';
        partDiv.style.cssText = 'padding: 12px 16px 4px; font-size: 11px; font-weight: 700; color: var(--teal); text-transform: uppercase; letter-spacing: 0.5px;';
        partDiv.textContent = ch.part.split('|')[0].trim();
        list.appendChild(partDiv);
      }

      const prog = this.progress[ch.id];
      const done = prog?.completed;
      const score = prog?.best_score ? Math.round(prog.best_score) + '%' : null;

      const locked = ch.locked;
      const card = document.createElement('div');
      card.className = 'chapter-card' + (locked ? ' chapter-locked' : '');
      card.innerHTML = `
        <div class="chapter-num">${locked ? '🔒' : ch.number}</div>
        <div class="chapter-info">
          <div class="chapter-title">${ch.title}</div>
          ${ch.title_ar ? `<div class="chapter-subtitle" style="font-family: 'Segoe UI', sans-serif;">${ch.title_ar}</div>` : ''}
          ${locked ? `<div style="font-size:11px; color:var(--text-hint); margin-top:2px;">Complete previous level to unlock</div>` : ''}
        </div>
        ${!locked && done ? `<span class="chapter-badge badge-done">✓ ${score || 'Done'}</span>` :
          !locked && score ? `<span class="chapter-badge badge-progress">${score}</span>` : ''}
      `;
      if (!locked) {
        card.addEventListener('click', () => this.openChapter(ch));
      } else {
        card.style.opacity = '0.55';
        card.style.cursor = 'not-allowed';
      }
      list.appendChild(card);
    });
  },

  async openChapter(ch) {
    haptic('medium');
    this.currentChapter = ch;
    this.subtopics = [];
    this.currentSubTopicIndex = 0;

    document.getElementById('course-list-view').classList.add('hidden');
    document.getElementById('course-chapter-view').classList.remove('hidden');
    document.getElementById('course-subtopic-view').classList.add('hidden');

    document.getElementById('course-chapter-title').textContent = `Ch.${ch.number}: ${ch.title}`;
    if (ch.title_ar) {
      document.getElementById('course-chapter-subtitle').textContent = ch.title_ar;
    }

    // Show loading, hide list
    document.getElementById('subtopics-loading').classList.remove('hidden');
    document.getElementById('subtopics-list').classList.add('hidden');
    document.getElementById('chapter-key-points').classList.add('hidden');

    try {
      const subtopics = (ORL_DATA.subtopics||[]).filter(s=>s.chapter_id==ch.id);
      this.subtopics = subtopics;
      this.renderSubTopicList(subtopics);
      this.renderKeyPoints(subtopics);
    } catch (e) {
      document.getElementById('subtopics-list').innerHTML = '<div style="padding:16px;color:var(--red);">Failed to load topics.</div>';
      document.getElementById('subtopics-list').classList.remove('hidden');
    }
    document.getElementById('subtopics-loading').classList.add('hidden');
  },

  renderKeyPoints(subtopics) {
    // Show key points box if there's a sub-topic titled "Key Points" or similar
    const kp = subtopics.find(st =>
      /key point|summary|pearl|take.home/i.test(st.title)
    );
    if (!kp) return;
    const box = document.getElementById('chapter-key-points');
    const content = document.getElementById('chapter-key-points-content');
    // Extract bullet lines from the key points sub-topic title
    content.innerHTML = `<strong>${kp.icon} ${kp.title}</strong> — tap to read`;
    box.classList.remove('hidden');
    box.style.cursor = 'pointer';
    box.onclick = () => this.openSubTopic(this.subtopics.indexOf(kp));
  },

  renderSubTopicList(subtopics) {
    const list = document.getElementById('subtopics-list');
    list.innerHTML = '';

    if (!subtopics.length) {
      list.innerHTML = '<div class="empty-state"><p>No topics found in this chapter.</p></div>';
      list.classList.remove('hidden');
      return;
    }

    subtopics.forEach((st, idx) => {
      const mins = Math.max(1, Math.round(st.word_count / 180));
      const card = document.createElement('div');
      card.className = 'subtopic-card';
      card.innerHTML = `
        <div class="subtopic-icon">${st.icon}</div>
        <div class="subtopic-info">
          <div class="subtopic-title">${st.title}</div>
          <div class="subtopic-meta">${mins} min read · ${st.word_count} words</div>
        </div>
        <div class="subtopic-arrow">›</div>
      `;
      card.addEventListener('click', () => { haptic('light'); this.openSubTopic(idx); });
      list.appendChild(card);
    });

    list.classList.remove('hidden');
  },

  async openSubTopic(idx) {
    if (!this.subtopics.length) return;
    this.currentSubTopicIndex = idx;
    const st = this.subtopics[idx];

    document.getElementById('course-chapter-view').classList.add('hidden');
    document.getElementById('course-subtopic-view').classList.remove('hidden');

    document.getElementById('subtopic-title').textContent = `${st.icon} ${st.title}`;
    document.getElementById('subtopic-chapter-label').textContent =
      `Ch.${this.currentChapter.number}: ${this.currentChapter.title}`;

    // Progress dots
    const dotsEl = document.getElementById('subtopic-progress-dots');
    dotsEl.innerHTML = '';
    this.subtopics.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.style.cssText = `width:8px; height:8px; border-radius:50%; background:${i === idx ? 'var(--teal)' : 'var(--border)'}; transition:background 0.3s;`;
      dotsEl.appendChild(dot);
    });

    // Prev / Next buttons
    document.getElementById('subtopic-prev-btn').disabled = idx === 0;
    document.getElementById('subtopic-next-btn').disabled = idx === this.subtopics.length - 1;

    // Load content
    const contentEl = document.getElementById('subtopic-content');
    contentEl.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

    try {
      const data = await apiFetch(`/api/subtopics/${st.id}`);

      if (this.mode === 'quick') {
        // Quick Mode: Q&A from high_yield points
        const chId = this.currentChapter?.id;
        const hy = (ORL_DATA.high_yield||[]).find(h=>h.chapter_id==chId);
        const pts = hy ? hy.points : [];
        if (pts.length) {
          const qaHtml = pts.map((pt,i) => {
            const parts = pt.split(/[;:](.+)/);
            const q = parts[0].trim();
            const a = parts.slice(1).join('').trim();
            return `<div class="qa-card" style="margin-bottom:14px;border:1px solid var(--border);border-radius:10px;overflow:hidden;">
              <div style="padding:12px 14px;font-weight:600;font-size:14px;color:var(--text);">Q: ${q}</div>
              ${a ? `<div class="qa-answer hidden" id="qa-ans-${i}" style="padding:10px 14px;background:var(--card-bg);font-size:13px;color:var(--teal);border-top:1px solid var(--border);">A: ${a}</div>
              <button onclick="const el=document.getElementById('qa-ans-${i}');el.classList.toggle('hidden');this.textContent=el.classList.contains('hidden')?'Show Answer':'Hide Answer';" style="width:100%;padding:8px;background:none;border:none;border-top:1px solid var(--border);color:var(--text-hint);font-size:12px;cursor:pointer;">Show Answer</button>` : ''}
            </div>`;
          }).join('');
          contentEl.innerHTML = `
            <div style="margin-bottom:12px;display:flex;justify-content:flex-end;">
              <button onclick="Course.mode='detailed';localStorage.setItem('orl101_course_mode','detailed');document.querySelectorAll('.course-mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode==='detailed'));Course.openSubTopic(Course.currentSubTopicIndex);" style="padding:6px 14px;background:var(--teal);color:white;border:none;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;">📖 Full Details →</button>
            </div>
            ${qaHtml}`;
        } else {
          contentEl.innerHTML = renderWikiContent(data.content || '');
        }
      } else {
        // Detailed Mode: full wiki content + quick button
        const quickBtn = '<div style="margin-bottom:12px;display:flex;justify-content:flex-end;"><button onclick="Course.mode=\'quick\';localStorage.setItem(\'orl101_course_mode\',\'quick\');document.querySelectorAll(\'.course-mode-btn\').forEach(b=>b.classList.toggle(\'active\',b.dataset.mode===\'quick\'));Course.openSubTopic(Course.currentSubTopicIndex);" style="padding:6px 14px;background:var(--card-bg);color:var(--teal);border:1px solid var(--teal);border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;">⚡ Quick Review ←</button></div>';
        const openingBox = data.opening_box ? data.opening_box : '';
        contentEl.innerHTML = quickBtn + openingBox + renderWikiContent(data.content || '');
      }
    } catch (e) {
      contentEl.innerHTML = '<p style="color:var(--red);">Failed to load content.</p>';
    }

    // Scroll to top
    document.getElementById('course-subtopic-view').scrollTop = 0;
    contentEl.scrollTop = 0;
  },

  prevSubTopic() {
    if (this.currentSubTopicIndex > 0) {
      this.openSubTopic(this.currentSubTopicIndex - 1);
      haptic('light');
    }
  },

  nextSubTopic() {
    if (this.currentSubTopicIndex < this.subtopics.length - 1) {
      this.openSubTopic(this.currentSubTopicIndex + 1);
      haptic('light');
    }
  },

  backToChapter() {
    document.getElementById('course-subtopic-view').classList.add('hidden');
    document.getElementById('course-chapter-view').classList.remove('hidden');
    haptic('light');
  },

  shareItem() {
    const item = Rotation._currentItem;
    if (!item) return;
    var text = item.icon+' '+item.title+'\n\n';
    (item.items||[]).forEach(function(s){ text += '--- '+s.subtitle+' ---\n'+s.content+'\n\n'; });
    if (navigator.share) { navigator.share({title: item.title, text: text}); }
    else { navigator.clipboard.writeText(text).then(function(){ alert('Copied to clipboard!'); }); }
  },
  shareItem() {
    const item = Rotation._currentItem;
    if (!item) return;
    var text = item.icon+' '+item.title+'\n\n';
    (item.items||[]).forEach(function(s){ text += '--- '+s.subtitle+' ---\n'+s.content+'\n\n'; });
    if (navigator.share) { navigator.share({title: item.title, text: text}); }
    else { navigator.clipboard.writeText(text).then(function(){ alert('Copied!'); }); }
  },
  backToList() {
    document.getElementById('course-list-view').classList.remove('hidden');
    document.getElementById('course-chapter-view').classList.add('hidden');
    document.getElementById('course-subtopic-view').classList.add('hidden');
    haptic('light');
  },

  startChapterQuiz() {
    if (!this.currentChapter) return;
    haptic('medium');
    // Pre-select chapter in exam and switch
    const chapterSel = document.getElementById('exam-chapter-select');
    if (chapterSel) chapterSel.value = this.currentChapter.id;
    showSection('exam');
    Exam.start();
  },

  async generateCertificate() {
    const name = prompt('Enter your full name for the certificate:');
    if (!name) return;
    try {
      const data = await apiFetch('/api/certificate', {
        method: 'POST',
        body: JSON.stringify({ student_name: name }),
      });
      showToast('🎓 Certificate generated!', 'success');
      window.open(data.url, '_blank');
    } catch (e) {
      showToast(e.message, 'error');
    }
  },
};

// ── TRIVIA GAME ───────────────────────────────────────────────────────
const Trivia = {
  questions: [],
  current: 0,
  lives: 3,
  score: 0,
  streak: 0,
  streakBest: 0,
  correct: 0,
  answered: false,
  feedbackTimer: null,
  nextTimer: null,

  async init() {
    await this.loadChaptersForSelect();
  },

  async loadChaptersForSelect() {
    try {
      const chapters = await apiFetch('/api/chapters');
      const sel = document.getElementById('trivia-chapter-select');
      if (!sel) return;
      chapters.forEach(ch => {
        const opt = document.createElement('option');
        opt.value = ch.id;
        opt.textContent = `Ch.${ch.number} — ${ch.title}`;
        sel.appendChild(opt);
      });
    } catch (e) { console.error(e); }
  },

  async start() {
    haptic('medium');
    this.lives = 3;
    this.score = 0;
    this.streak = 0;
    this.streakBest = 0;
    this.correct = 0;
    this.current = 0;
    this.answered = false;

    const chapterEl = document.getElementById('trivia-chapter-select');
    const chapter_id = chapterEl?.value ? parseInt(chapterEl.value) : null;

    try {
      const params = new URLSearchParams({ count: 30 });
      if (chapter_id) params.set('chapter_id', chapter_id);
      this.questions = await apiFetch(`/api/trivia/questions?${params}`);
      if (!this.questions.length) {
        showToast('No questions available. Add some first!', 'error');
        return;
      }

      document.getElementById('trivia-setup').classList.add('hidden');
      document.getElementById('trivia-gameover').classList.add('hidden');
      document.getElementById('trivia-leaderboard').classList.add('hidden');
      document.getElementById('trivia-game').classList.remove('hidden');
      this.updateHUD();
      this.renderQuestion();
    } catch (e) {
      showToast('Failed to start: ' + e.message, 'error');
    }
  },

  updateHUD() {
    const hearts = '❤️'.repeat(this.lives) + '🖤'.repeat(3 - this.lives);
    const livesEl = document.getElementById('trivia-lives-display');
    const scoreEl = document.getElementById('trivia-score');
    const streakEl = document.getElementById('trivia-streak-count');
    const streakIconEl = document.getElementById('trivia-streak-icon');
    if (livesEl) livesEl.textContent = hearts;
    if (scoreEl) scoreEl.textContent = this.score;
    if (streakEl) streakEl.textContent = this.streak;
    if (streakIconEl) streakIconEl.textContent = this.streak >= 5 ? '⚡' : this.streak >= 3 ? '🔥' : '💨';
  },

  renderQuestion() {
    if (this.current >= this.questions.length) {
      this.gameOver(true);
      return;
    }
    const q = this.questions[this.current];
    this.answered = false;

    const qNum = document.getElementById('trivia-q-num');
    const qText = document.getElementById('trivia-question');
    const optEl = document.getElementById('trivia-options');
    const feedbackEl = document.getElementById('trivia-feedback');
    if (feedbackEl) feedbackEl.classList.add('hidden');

    if (qNum) qNum.textContent = `Q${this.current + 1}`;
    if (qText) qText.textContent = q.question_text;

    if (optEl) {
      optEl.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D', 'E'];
      Object.entries(q.options).forEach(([key, val]) => {
        const btn = document.createElement('button');
        btn.className = 'trivia-opt-btn';
        btn.innerHTML = `<span class="trivia-opt-letter">${key}</span><span class="trivia-opt-text">${val}</span>`;
        btn.addEventListener('click', () => this.answer(key, btn, q));
        optEl.appendChild(btn);
      });
    }
  },

  answer(key, btn, q) {
    if (this.answered) return;
    this.answered = true;
    haptic('light');

    const correct_answer = q.correct_answer;
    const isCorrect = key === correct_answer;
    this._processAnswer(key, correct_answer, isCorrect, btn);
  },

  _processAnswer(key, correct_answer, isCorrect, btn) {
    // Color all buttons
    document.querySelectorAll('.trivia-opt-btn').forEach(b => {
      const letter = b.querySelector('.trivia-opt-letter')?.textContent;
      if (letter === correct_answer) b.classList.add('trivia-correct');
      else if (letter === key && !isCorrect) b.classList.add('trivia-wrong');
      b.disabled = true;
    });

    if (isCorrect) {
      this.streak++;
      this.streakBest = Math.max(this.streakBest, this.streak);
      this.correct++;
      let pts = 10;
      if (this.streak >= 5) pts += 15;
      else if (this.streak >= 3) pts += 5;
      this.score += pts;
      this._showFeedback(true, pts);
      haptic('medium');
    } else {
      this.lives--;
      this.streak = 0;
      this._showFeedback(false, 0);
      haptic('heavy');
    }

    this.updateHUD();

    if (this.lives <= 0) {
      clearTimeout(this.nextTimer);
      this.nextTimer = setTimeout(() => this.gameOver(false), 1200);
    } else {
      this.nextTimer = setTimeout(() => this.nextQuestion(), 1400);
    }
  },

  _showFeedback(correct, pts) {
    const el = document.getElementById('trivia-feedback');
    if (!el) return;
    el.textContent = correct ? `✓ +${pts}` : '✗';
    el.className = `trivia-feedback ${correct ? 'feedback-correct' : 'feedback-wrong'}`;
    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => el.classList.add('hidden'), 900);
  },

  nextQuestion() {
    this.current++;
    this.renderQuestion();
  },

  async gameOver(completed) {
    document.getElementById('trivia-game').classList.add('hidden');
    document.getElementById('trivia-gameover').classList.remove('hidden');
    haptic(completed ? 'success' : 'heavy');

    const emoji = completed ? '🏆' : this.score > 50 ? '💪' : '💀';
    document.getElementById('trivia-over-emoji').textContent = emoji;
    document.getElementById('trivia-final-score').textContent = this.score;
    document.getElementById('trivia-stat-q').textContent = this.current;
    document.getElementById('trivia-stat-correct').textContent = this.correct;
    document.getElementById('trivia-stat-streak').textContent = this.streakBest;

    // Submit score
    try {
      await apiFetch('/api/trivia/score', {
        method: 'POST',
        body: JSON.stringify({
          score: this.score,
          streak_best: this.streakBest,
          questions_answered: this.current,
        }),
      });
    } catch (e) { /* non-fatal */ }
  },

  shareScore() {
    const text = `🎮 I scored ${this.score} points in ENT Trivia! 🏥 Best streak: ${this.streakBest}x 🔥 — ORL101`;
    if (tg?.switchInlineQuery) {
      tg.switchInlineQuery(text);
    } else if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard?.writeText(text);
      showToast('Score copied!', 'success');
    }
  },

  async showLeaderboard() {
    document.getElementById('trivia-setup').classList.add('hidden');
    document.getElementById('trivia-game').classList.add('hidden');
    document.getElementById('trivia-gameover').classList.add('hidden');
    document.getElementById('trivia-leaderboard').classList.remove('hidden');

    try {
      const board = await apiFetch('/api/trivia/leaderboard');
      const listEl = document.getElementById('trivia-lb-list');
      if (!listEl) return;

      if (!board.length) {
        listEl.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-hint);">No scores yet. Be the first!</div>';
        return;
      }

      const medals = ['🥇', '🥈', '🥉'];
      listEl.innerHTML = board.map((entry, i) => `
        <div class="trivia-lb-entry">
          <div class="trivia-lb-rank">${medals[i] || (i + 1)}</div>
          <div class="trivia-lb-name">${entry.name}</div>
          <div class="trivia-lb-score">${entry.score}</div>
        </div>
      `).join('');
    } catch (e) {
      showToast('Failed to load leaderboard', 'error');
    }
  },

  backToSetup() {
    document.getElementById('trivia-leaderboard').classList.add('hidden');
    document.getElementById('trivia-gameover').classList.add('hidden');
    document.getElementById('trivia-game').classList.add('hidden');
    document.getElementById('trivia-setup').classList.remove('hidden');
  },
};


// ── AI CHAT (Search) ────────────────────────────────────────────
const Chat = {
  open() {
    document.getElementById('chat-modal')?.classList.remove('hidden');
    setTimeout(() => document.getElementById('chat-input')?.focus(), 300);
  },

  close() {
    document.getElementById('chat-modal')?.classList.add('hidden');
  },

  async send() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const question = input?.value.trim();
    if (!question) return;

    // Add user message
    this._addMessage(question, 'user');
    input.value = '';
    if (sendBtn) sendBtn.disabled = true;

    // Show typing indicator
    const typingId = 'chat-typing-' + Date.now();
    this._addMessage('⋯', 'ai', typingId);

    try {
      const q=question.toLowerCase();
      const hits=[];
      (ORL_DATA.chapters||[]).forEach(ch=>{
        if((ch.title||'').toLowerCase().includes(q)) hits.push({id:ch.id,label:'Ch.'+ch.number+': '+ch.title});
      });
      (ORL_DATA.high_yield||[]).forEach(hy=>{
        (hy.points||[]).forEach(pt=>{ if(pt.toLowerCase().includes(q)) hits.push({id:0,label:pt}); });
      });
      document.getElementById(typingId)?.remove();
      const ans=hits.length?hits.slice(0,8).map(h=>h.id?'<a href="#" onclick="Chat.close();Course.openChapter('+h.id+');return false;" style="display:block;padding:5px 2px;color:var(--primary)">📖 '+h.label+'</a>':'<div>• '+h.label+'</div>').join(''):'<em>No results for: '+question+'</em>';
      this._addMessage(ans,'ai');
    } catch (e) {
      document.getElementById(typingId)?.remove();
      this._addMessage('⚠️ ' + (e.message || 'Error. Please try again.'), 'ai');
    } finally {
      if (sendBtn) sendBtn.disabled = false;
      input?.focus();
    }
  },

  _addMessage(text, role, id) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const wrap = document.createElement('div');
    wrap.className = `chat-msg chat-msg-${role}`;
    if (id) wrap.id = id;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = text;
    wrap.appendChild(bubble);
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
  },
};

// ── ROLES ─────────────────────────────────────────────────────────────
const Roles = {
  async select(role) {
    // Highlight selection
    document.querySelectorAll('.role-option').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.role === role);
    });
    haptic('medium');
    try {
      await apiFetch('/api/user/role', {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      currentUser.role = role;
      showToast(`Role set: ${role}`, 'success');
      // Show pre-test if eligible
      if (role !== 'guest') {
        setTimeout(() => showPretestModal(), 400);
      }
      updateHomeUI();
    } catch (e) {
      showToast('Failed to set role: ' + e.message, 'error');
    }
  },
};

function showPretestModal() {
}

function updateHomeUI() {
  if (currentUser == null) return;
  const b=document.getElementById("pretest-banner");
  if(b)b.classList.add("hidden");
  const w=document.getElementById("level-progress-wrap");
  if(w)w.classList.add("hidden");
}

// ── TESTS (Pre / Post) ───────────────────────────────────────────────
const Tests = {
  mode: null,       // 'pre_test' | 'post_test'
  session: null,
  questions: [],
  current: 0,
  answered: false,

  async startPreTest() {
    try {
      const data = await apiFetch('/api/test/pre', { method: 'POST' });
      this.session = data;
      this.questions = data.questions;
      this.current = 0;
      this.answered = false;
      this.showTestModal();
    } catch (e) {
      showToast(e.message, 'error');
    }
  },

  async startPostTest() {
    try {
      const data = await apiFetch('/api/test/post', { method: 'POST' });
      this.mode = 'post_test';
      this.session = data;
      this.questions = data.questions;
      this.current = 0;
      this.answered = false;
      this.showTestModal();
    } catch (e) {
      showToast(e.message, 'error');
    }
  },

  showTestModal() {
    document.getElementById('test-quiz-wrap').classList.remove('hidden');
    document.getElementById('test-result-wrap').classList.add('hidden');
    openModal('test-modal');
    this.renderQuestion();
  },

  renderQuestion() {
    const q = this.questions[this.current];
    if (!q) return;
    this.answered = false;

    const total = this.questions.length;
    const pct = ((this.current + 1) / total * 100).toFixed(0);
    document.getElementById('test-progress-fill').style.width = pct + '%';
    document.getElementById('test-progress-label').textContent = `${this.current + 1} / ${total}`;
    document.getElementById('test-topic').textContent = q.topic || 'ENT';
    document.getElementById('test-question-text').textContent = q.question_text;
    document.getElementById('test-explanation').classList.add('hidden');
    document.getElementById('test-next-btn').classList.add('hidden');

    const optEl = document.getElementById('test-options');
    optEl.innerHTML = '';
    Object.entries(q.options).forEach(([key, val]) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="option-letter">${key}</span><span class="option-text">${val}</span>`;
      btn.addEventListener('click', () => this.selectAnswer(key, btn));
      optEl.appendChild(btn);
    });
  },

  async selectAnswer(key, btn) {
    if (this.answered) return;
    this.answered = true;
    haptic('light');

    const q = this.questions[this.current];
    try {
      const res = await apiFetch('/api/quiz/answer', {
        method: 'POST',
        body: JSON.stringify({
          session_id: this.session.session_id,
          question_id: q.id,
          answer: key,
        }),
      });

      // Mark correct/wrong
      document.querySelectorAll('#test-options .option-btn').forEach(b => {
        const letter = b.querySelector('.option-letter').textContent;
        if (letter === res.correct_answer) b.classList.add('correct');
        else if (letter === key && !res.correct) b.classList.add('wrong');
      });

      if (res.explanation) {
        const expEl = document.getElementById('test-explanation');
        expEl.textContent = res.explanation;
        expEl.classList.remove('hidden');
      }
      document.getElementById('test-next-btn').classList.remove('hidden');
      document.getElementById('test-next-btn').textContent =
        this.current + 1 < this.questions.length ? 'Next Question →' : 'Finish Test ✓';
    } catch (e) {
      showToast(e.message, 'error');
    }
  },

  async nextQuestion() {
    if (this.current + 1 < this.questions.length) {
      this.current++;
      this.renderQuestion();
    } else {
      await this.finishTest();
    }
  },

  async finishTest() {
    try {
      const res = await apiFetch(`/api/test/complete/${this.session.session_id}`, { method: 'POST' });

      // Update cached user
      if (this.mode === 'pre_test') {
        currentUser.pre_test_score = res.score;
      } else {
        currentUser.post_test_score = res.score;
      }
      localStorage.setItem('orl101_user', JSON.stringify(currentUser));
      updateHomeUI();

      // Show result
      document.getElementById('test-quiz-wrap').classList.add('hidden');
      document.getElementById('test-result-wrap').classList.remove('hidden');

      const emoji = res.score >= 70 ? '🏆' : res.score >= 50 ? '📚' : '💪';
      document.getElementById('test-result-emoji').textContent = emoji;
      document.getElementById('test-result-score').textContent = res.score + '%';
      document.getElementById('test-result-label').textContent =
        this.mode === 'pre_test' ? 'Pre-Test Score' : 'Post-Test Score';

      if (res.comparison) {
        const cmpWrap = document.getElementById('test-result-comparison');
        cmpWrap.classList.remove('hidden');
        document.getElementById('cmp-pre').textContent = res.comparison.pre_test + '%';
        document.getElementById('cmp-post').textContent = res.comparison.post_test + '%';
        const diff = res.comparison.improvement;
        document.getElementById('cmp-diff').textContent = (diff >= 0 ? '+' : '') + diff + '%';
        document.getElementById('cmp-message').textContent = res.comparison.improvement >= 15
          ? '🎉 Excellent improvement!' : '📈 Keep it up!';
      }

      haptic('success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  },
};

// ── Swipe navigation for flashcards ──────────────────────────────────
function initSwipe(el, onLeft, onRight, onTap) {
  let startX = 0, startY = 0;
  el.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  el.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) onLeft?.();
      else onRight?.();
    } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      onTap?.();
    }
  }, { passive: true });
}

// ── CASES MODULE (Clinical Simulation) ────────────────────────────────────
const Cases = {
  cases: [],
  currentCase: null,
  currentCaseIdx: 0,
  currentNodeKey: 'start',
  path: [],           // list of node keys visited
  score: 0,
  startTime: null,
  mode: 'practice',
  timerInterval: null,
  timeLeft: 600,
  ended: false,
  _bestScores: {},

  async init() {
    await this.loadCases();
  },

  async loadCases() {
    const loading = document.getElementById('cases-list-loading');
    const listEl = document.getElementById('cases-list');
    if (!loading || !listEl) return;
    loading.classList.remove('hidden');
    listEl.classList.add('hidden');

    try {
      this.cases = await apiFetch('/api/cases');
      await this.loadHistory();
      this.renderCaseList();
      listEl.classList.remove('hidden');
    } catch(e) {
      listEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-hint);">Could not load cases.</div>';
      listEl.classList.remove('hidden');
    } finally {
      loading.classList.add('hidden');
    }
  },

  async loadHistory() {
    try {
      const data = await apiFetch('/api/cases/history');
      const stats = data.stats;
      const row = document.getElementById('cases-stats-row');
      if (row) {
        document.getElementById('cases-stat-passed').textContent = stats.cases_passed;
        document.getElementById('cases-stat-avg').textContent = stats.avg_percent ? stats.avg_percent + '%' : '—';
        row.classList.remove('hidden');
      }
      this._bestScores = {};
      for (const a of data.attempts) {
        const cur = this._bestScores[a.case_id];
        if (!cur || a.percent > cur.percent) {
          this._bestScores[a.case_id] = { percent: a.percent, passed: a.passed };
        }
      }
    } catch(e) {
      this._bestScores = {};
    }
  },

  renderCaseList() {
    const listEl = document.getElementById('cases-list');
    if (!listEl) return;
    const diffLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
    listEl.innerHTML = this.cases.map((c, idx) => {
      const best = this._bestScores[c.id];
      const statusHtml = best
        ? best.passed
          ? `<span class="cases-badge cases-badge-pass">✓ Passed</span>`
          : `<span class="cases-badge cases-badge-tried">${best.percent}%</span>`
        : `<span class="cases-badge cases-badge-new">New</span>`;
      return `
        <div class="cases-card" onclick="Cases.openCase(${idx})">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div class="cases-card-title">${c.title}</div>
            ${statusHtml}
          </div>
          <div class="cases-card-complaint">${c.chief_complaint}</div>
          <div style="display:flex; align-items:center; gap:8px; margin-top:8px;">
            <span class="cases-diff-badge ${c.difficulty}">${diffLabel[c.difficulty] || c.difficulty}</span>
            <span style="font-size:11px; color:var(--text-hint);">Max: ${c.max_score} pts</span>
          </div>
        </div>`;
    }).join('');
  },

  setMode(mode) {
    this.mode = mode;
    const practiceBtn = document.getElementById('cases-mode-practice');
    const examBtn = document.getElementById('cases-mode-exam');
    if (practiceBtn && examBtn) {
      practiceBtn.classList.toggle('active-mode', mode === 'practice');
      examBtn.classList.toggle('active-mode', mode === 'exam');
    }
    haptic('light');
    showToast(mode === 'exam' ? '⏱️ Exam Mode — timer active' : '📚 Practice Mode', '');
  },

  async openCase(idx) {
    haptic('light');
    this.currentCaseIdx = idx;
    const c = this.cases[idx];
    if (!c) return;
    try {
      this.currentCase = await apiFetch(`/api/cases/${c.id}`);
    } catch(e) {
      showToast('Could not load case', 'error');
      return;
    }
    this.resetState();
    this.showPlayView();
    this.renderNode('start');
  },

  resetState() {
    this.currentNodeKey = 'start';
    this.path = [];
    this.score = 0;
    this.startTime = Date.now();
    this.ended = false;
    this.stopTimer();
    if (this.mode === 'exam') {
      this.timeLeft = 600;
      this.startTimer();
    }
    document.getElementById('cases-pass-screen').classList.add('hidden');
    document.getElementById('cases-fail-screen').classList.add('hidden');
    document.getElementById('cases-narrative-card').classList.remove('hidden');
    document.getElementById('cases-options').classList.remove('hidden');
    document.getElementById('cases-red-flag').classList.add('hidden');
    document.getElementById('cases-progress-dots').innerHTML = '';
  },

  renderNode(nodeKey) {
    const c = this.currentCase;
    if (!c) return;
    const tree = c.decision_tree;
    const node = tree[nodeKey];
    if (!node) return;

    this.currentNodeKey = nodeKey;
    this.path.push(nodeKey);
    this.updateProgressDots();

    // Patient info bar (always from start node)
    const startNode = tree['start'];
    const patientData = startNode?.patient;
    const infoEl = document.getElementById('cases-patient-info');
    if (infoEl && patientData) {
      if (typeof patientData === 'object') {
        infoEl.textContent = `${patientData.age}${patientData.gender} · ${patientData.vitals}`;
      } else {
        infoEl.textContent = String(patientData);
      }
    }

    // Red flag banner
    const rfEl = document.getElementById('cases-red-flag');
    const rfTextEl = document.getElementById('cases-red-flag-text');
    if (node.red_flag && node.red_flag_text) {
      rfTextEl.textContent = node.red_flag_text;
      rfEl.classList.remove('hidden');
      rfEl.classList.add('animate-redflag');
      setTimeout(() => rfEl.classList.remove('animate-redflag'), 800);
    } else {
      rfEl.classList.add('hidden');
    }

    // Narrative
    document.getElementById('cases-narrative-text').textContent = node.narrative || '';

    // Terminal: pass
    if (node.pass) {
      this.ended = true;
      this.stopTimer();
      this.showPassScreen(node);
      this.submitAttempt(true);
      return;
    }
    // Terminal: fail
    if (node.fail) {
      this.ended = true;
      this.stopTimer();
      this.showFailScreen(node);
      this.submitAttempt(false);
      return;
    }

    // Options
    const optionsEl = document.getElementById('cases-options');
    optionsEl.innerHTML = (node.options || []).map((opt, i) => `
      <button class="cases-option-btn" onclick="Cases.chooseOption(${i})">
        ${opt.text}
      </button>`).join('');

    document.getElementById('cases-scroll').scrollTop = 0;
  },

  chooseOption(optIdx) {
    if (this.ended) return;
    const node = this.currentCase.decision_tree[this.currentNodeKey];
    if (!node || !node.options) return;
    const opt = node.options[optIdx];
    if (!opt) return;
    haptic('light');
    this.score += (opt.points || 0);
    this.renderNode(opt.next);
  },

  updateProgressDots() {
    const dotsEl = document.getElementById('cases-progress-dots');
    if (!dotsEl) return;
    dotsEl.innerHTML = this.path.map((_, i) => {
      const isLast = i === this.path.length - 1;
      return `<div class="cases-progress-dot${isLast ? ' active' : ''}"></div>`;
    }).join('');
  },

  showPassScreen(node) {
    document.getElementById('cases-narrative-card').classList.add('hidden');
    document.getElementById('cases-options').classList.add('hidden');
    document.getElementById('cases-red-flag').classList.add('hidden');

    const c = this.currentCase;
    const pct = c.max_score ? Math.round(this.score / c.max_score * 100) : 100;
    document.getElementById('cases-pass-score').textContent = `${this.score} / ${c.max_score} pts · ${pct}%`;

    const summaryEl = document.getElementById('cases-pass-summary');
    summaryEl.textContent = node.summary || '';
    summaryEl.style.display = node.summary ? '' : 'none';

    const learningEl = document.getElementById('cases-pass-learning');
    learningEl.textContent = node.learning ? `💡 ${node.learning}` : '';
    learningEl.style.display = node.learning ? '' : 'none';

    document.getElementById('cases-pass-screen').classList.remove('hidden');
    document.getElementById('cases-scroll').scrollTop = 0;
    haptic('medium');
    this._confetti();
  },

  showFailScreen(node) {
    document.getElementById('cases-narrative-card').classList.add('hidden');
    document.getElementById('cases-options').classList.add('hidden');
    document.getElementById('cases-red-flag').classList.add('hidden');

    document.getElementById('cases-fail-narrative').textContent = node.narrative || '';

    const learningEl = document.getElementById('cases-fail-learning');
    learningEl.textContent = node.learning ? `💡 ${node.learning}` : '';
    learningEl.style.display = node.learning ? '' : 'none';

    const failEl = document.getElementById('cases-fail-screen');
    failEl.classList.remove('hidden');
    failEl.classList.add('shake');
    setTimeout(() => failEl.classList.remove('shake'), 700);
    document.getElementById('cases-scroll').scrollTop = 0;
    haptic('medium');
  },

  async submitAttempt(passed) {
    const c = this.currentCase;
    if (!c) return;
    const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
    try {
      await apiFetch('/api/cases/attempt', {
        method: 'POST',
        body: JSON.stringify({
          case_id: c.id,
          path_taken: this.path,
          passed,
          score: this.score,
          max_score: c.max_score,
          time_spent_seconds: timeSpent,
          mode: this.mode,
        }),
      });
    } catch(e) { /* silent */ }
  },

  startTimer() {
    clearInterval(this.timerInterval);
    const timerEl = document.getElementById('cases-play-timer');
    if (!timerEl) return;
    timerEl.classList.remove('hidden', 'warning', 'danger');
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        showToast('⏰ Time is up!', '');
        if (!this.ended) {
          this.ended = true;
          this.submitAttempt(false);
        }
      }
    }, 1000);
  },

  updateTimerDisplay() {
    const timerEl = document.getElementById('cases-play-timer');
    if (!timerEl) return;
    const m = Math.floor(this.timeLeft / 60);
    const s = this.timeLeft % 60;
    timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    timerEl.classList.remove('warning', 'danger');
    if (this.timeLeft <= 60) timerEl.classList.add('danger');
    else if (this.timeLeft <= 120) timerEl.classList.add('warning');
  },

  stopTimer() {
    clearInterval(this.timerInterval);
    const timerEl = document.getElementById('cases-play-timer');
    if (timerEl) timerEl.classList.add('hidden');
  },

  showPlayView() {
    const c = this.currentCase;
    document.getElementById('cases-play-label').textContent =
      `Case ${this.currentCaseIdx + 1} of ${this.cases.length}`;
    document.getElementById('cases-play-title').textContent = c.title;
    document.getElementById('cases-home').classList.add('hidden');
    document.getElementById('cases-play-view').classList.remove('hidden');
    document.getElementById('cases-scroll').scrollTop = 0;
  },

  shareItem() {
    const item = Rotation._currentItem;
    if (!item) return;
    var text = item.icon+' '+item.title+'\n\n';
    (item.items||[]).forEach(function(s){ text += '--- '+s.subtitle+' ---\n'+s.content+'\n\n'; });
    if (navigator.share) { navigator.share({title: item.title, text: text}); }
    else { navigator.clipboard.writeText(text).then(function(){ alert('Copied to clipboard!'); }); }
  },
  shareItem() {
    const item = Rotation._currentItem;
    if (!item) return;
    var text = item.icon+' '+item.title+'\n\n';
    (item.items||[]).forEach(function(s){ text += '--- '+s.subtitle+' ---\n'+s.content+'\n\n'; });
    if (navigator.share) { navigator.share({title: item.title, text: text}); }
    else { navigator.clipboard.writeText(text).then(function(){ alert('Copied!'); }); }
  },
  backToList() {
    this.stopTimer();
    this.ended = true;
    document.getElementById('cases-play-view').classList.add('hidden');
    document.getElementById('cases-home').classList.remove('hidden');
    this.loadCases();
  },

  retryCase() {
    this.resetState();
    this.renderNode('start');
  },

  _confetti() {
    const container = document.getElementById('cases-pass-screen');
    if (!container) return;
    const colors = ['#0D7377', '#43A047', '#FFD600', '#FF6B35', '#764ba2'];
    for (let i = 0; i < 40; i++) {
      const d = document.createElement('div');
      d.className = 'confetti-dot';
      d.style.cssText = [
        'position:absolute', 'width:8px', 'height:8px', 'border-radius:50%',
        `background:${colors[i % colors.length]}`,
        `left:${Math.random() * 100}%`, 'top:10px',
        `animation:confetti-fall ${1.5 + Math.random()}s ease-out forwards`,
        `animation-delay:${Math.random() * 0.4}s`,
        'pointer-events:none', 'z-index:5'
      ].join(';');
      container.appendChild(d);
      setTimeout(() => d.remove(), 3000);
    }
  },
};


// ── ACTION CARDS (If You See This, Do This) ──────────────────────────
const ActionCards = {
  init() {
    const cards = ORL_DATA.action_cards || [];
    const list = document.getElementById('ac-list');
    if (!list || !cards.length) return;
    list.innerHTML = '';
    cards.forEach((card, idx) => {
      const el = document.createElement('div');
      el.className = 'ac-card-item';
      el.innerHTML = `
        <div class="ac-card-emoji">${card.icon}</div>
        <div class="ac-card-info">
          <div class="ac-card-title">${card.action}</div>
          <div class="ac-card-meta">${(card.steps||[]).length} steps</div>
        </div>
        <div style="color:var(--text-hint); font-size:18px;">›</div>
      `;
      el.addEventListener('click', () => { haptic('light'); this.openCard(idx); });
      list.appendChild(el);
    });
  },

  openCard(idx) {
    const card = (ORL_DATA.action_cards || [])[idx];
    if (!card) return;
    document.getElementById('ac-list').classList.add('hidden');
    document.getElementById('ac-detail').classList.remove('hidden');
    document.getElementById('ac-detail-title').textContent = `${card.icon} ${card.action}`;

    let html = '<div class="ac-snapshot">';
    html += '<div class="ac-snap-header"><div class="ac-snap-col-see">👁 IF YOU SEE...</div><div class="ac-snap-col-do">→ DO THIS</div></div>';
    const rows = card.rows || (card.steps||[]).map(s=>({see:'',do:typeof s==='string'?s:(s.do||s.see||''),urgent:false}));
    rows.forEach(r => {
      const urg = r.urgent ? 'ac-snap-row urgent' : 'ac-snap-row';
      const icon = r.urgent ? '🚨' : '👁';
      html += '<div class="'+urg+'"><div class="ac-snap-see">'+icon+' '+(r.see||'')+'</div><div class="ac-snap-do">'+(r.do||r.see||'')+'</div></div>';
    });
    html += '</div>';
    const traps = card.traps || (card.danger ? [card.danger] : []);
    if (traps.length) {
      html += '<div class="ac-traps-box"><div class="ac-traps-title">🧪 Exam Traps</div>';
      traps.forEach(t => { html += '<div class="ac-trap">⚡ '+t+'</div>'; });
      html += '</div>';
    }

    document.getElementById('ac-detail-content').innerHTML = html;
    document.getElementById('ac-detail-content').scrollTop = 0;
  },

  shareItem() {
    const item = Rotation._currentItem;
    if (!item) return;
    var text = item.icon+' '+item.title+'\n\n';
    (item.items||[]).forEach(function(s){ text += '--- '+s.subtitle+' ---\n'+s.content+'\n\n'; });
    if (navigator.share) { navigator.share({title: item.title, text: text}); }
    else { navigator.clipboard.writeText(text).then(function(){ alert('Copied to clipboard!'); }); }
  },
  shareItem() {
    const item = Rotation._currentItem;
    if (!item) return;
    var text = item.icon+' '+item.title+'\n\n';
    (item.items||[]).forEach(function(s){ text += '--- '+s.subtitle+' ---\n'+s.content+'\n\n'; });
    if (navigator.share) { navigator.share({title: item.title, text: text}); }
    else { navigator.clipboard.writeText(text).then(function(){ alert('Copied!'); }); }
  },
  backToList() {
    document.getElementById('ac-list').classList.remove('hidden');
    document.getElementById('ac-detail').classList.add('hidden');
    haptic('light');
  }
};

// ── HIGH YIELD ───────────────────────────────────────────────────────
const HighYield = {
  init() {
    const cards = (ORL_DATA.high_yield || []).slice().sort((a,b)=>parseInt(a.chapter_id)-parseInt(b.chapter_id));
    const list = document.getElementById('hy-list');
    if (!list || !cards.length) return;
    list.innerHTML = '';
    cards.forEach((card, idx) => {
      const el = document.createElement('div');
      el.className = 'hy-card-item';
      el.innerHTML = `
        <div class="hy-card-num">Ch.${card.chapter_id}</div>
        <div class="hy-card-info">
          <div class="hy-card-title">${card.chapter_title}</div>
          <div class="hy-card-meta">${card.points.length} key points</div>
        </div>
        <div style="color:var(--text-hint); font-size:18px;">›</div>
      `;
      el.addEventListener('click', () => { haptic('light'); this.openCard(idx); });
      list.appendChild(el);
    });
  },

  openCard(idx) {
    const _hy=(ORL_DATA.high_yield||[]).slice().sort((a,b)=>parseInt(a.chapter_id)-parseInt(b.chapter_id));const card=_hy[idx];
    if (!card) return;
    document.getElementById('hy-list').classList.add('hidden');
    document.getElementById('hy-detail').classList.remove('hidden');
    document.getElementById('hy-detail-title').textContent = card.chapter_title;

    let html = '<div class="hy-bullets">';
    card.points.forEach(b => {
      html += `<div class="hy-bullet"><span class="hy-dot">•</span> ${b}</div>`;
    });
    html += '</div>';

    if (card.pearl) {
      html += `<div class="hy-pearl"><span class="hy-pearl-icon">💡</span> ${card.pearl}</div>`;
    }

    document.getElementById('hy-detail-content').innerHTML = html;
    document.getElementById('hy-detail-content').scrollTop = 0;
  },

  shareItem() {
    const item = Rotation._currentItem;
    if (!item) return;
    var text = item.icon+' '+item.title+'\n\n';
    (item.items||[]).forEach(function(s){ text += '--- '+s.subtitle+' ---\n'+s.content+'\n\n'; });
    if (navigator.share) { navigator.share({title: item.title, text: text}); }
    else { navigator.clipboard.writeText(text).then(function(){ alert('Copied to clipboard!'); }); }
  },
  shareItem() {
    const item = Rotation._currentItem;
    if (!item) return;
    var text = item.icon+' '+item.title+'\n\n';
    (item.items||[]).forEach(function(s){ text += '--- '+s.subtitle+' ---\n'+s.content+'\n\n'; });
    if (navigator.share) { navigator.share({title: item.title, text: text}); }
    else { navigator.clipboard.writeText(text).then(function(){ alert('Copied!'); }); }
  },
  backToList() {
    document.getElementById('hy-list').classList.remove('hidden');
    document.getElementById('hy-detail').classList.add('hidden');
    haptic('light');
  }
};

// ── IN ROTATION ──────────────────────────────────────────────────────
const Rotation = {
  init() {
    const items = ORL_DATA.rotation || [];
    const list = document.getElementById('rot-list');
    if (!list || !items.length) return;
    list.innerHTML = '';
    items.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'rot-card-item';
      el.innerHTML = `
        <div class="rot-card-icon">${item.icon}</div>
        <div class="rot-card-info">
          <div class="rot-card-title">${item.title}</div>
          <div class="rot-card-desc">${(item.items||[]).length} sections</div>
        </div>
        <div style="color:var(--text-hint); font-size:18px;">›</div>
      `;
      el.addEventListener('click', () => { haptic('light'); this.openItem(idx); });
      list.appendChild(el);
    });
  },

  openItem(idx) {
    const item = (ORL_DATA.rotation || [])[idx];
    if (!item) return;
    document.getElementById('rot-list').classList.add('hidden');
    document.getElementById('rot-detail').classList.remove('hidden');
    document.getElementById('rot-detail-title').textContent = `${item.icon} ${item.title}`;
    var h='';(item.items||[]).forEach(function(s){var lns=s.content.split('\n');var body=lns.map(function(l){if(!l){return '<div style="height:8px"></div>';}return '<div style="padding:5px 0;font-size:14px;line-height:1.7;color:var(--text)">'+l+'</div>';}).join('');h+='<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)"><div style="background:#2d6a4f;color:#fff;padding:12px 16px;font-weight:700;font-size:15px">'+s.subtitle+'</div><div style="padding:14px 16px;background:#fff;border:1px solid #c8e6c9;border-top:none">'+body+'</div></div>';});document.getElementById('rot-content-body').innerHTML=h;Rotation._currentItem=item;
    document.getElementById('rot-detail-content').scrollTop = 0;
  },

  shareItem() {
    const item = Rotation._currentItem;
    if (!item) return;
    var text = item.icon+' '+item.title+'\n\n';
    (item.items||[]).forEach(function(s){ text += '--- '+s.subtitle+' ---\n'+s.content+'\n\n'; });
    if (navigator.share) { navigator.share({title: item.title, text: text}); }
    else { navigator.clipboard.writeText(text).then(function(){ alert('Copied to clipboard!'); }); }
  },
  shareItem() {
    const item = Rotation._currentItem;
    if (!item) return;
    var text = item.icon+' '+item.title+'\n\n';
    (item.items||[]).forEach(function(s){ text += '--- '+s.subtitle+' ---\n'+s.content+'\n\n'; });
    if (navigator.share) { navigator.share({title: item.title, text: text}); }
    else { navigator.clipboard.writeText(text).then(function(){ alert('Copied!'); }); }
  },
  backToList() {
    document.getElementById('rot-list').classList.remove('hidden');
    document.getElementById('rot-detail').classList.add('hidden');
    haptic('light');
  }
};


// ── SWIPE CARDS GAME ─────────────────────────────────────────────────
const SwipeGame = {
  cards: [],
  current: 0,
  score: 0,
  total: 0,

  start() {
    const all = ORL_DATA.swipe_cards || [];
    // Shuffle
    this.cards = [...all].sort(() => Math.random() - 0.5).slice(0, 15);
    this.current = 0;
    this.score = 0;
    this.total = this.cards.length;

    document.getElementById('swipe-start').classList.add('hidden');
    document.getElementById('swipe-result').classList.add('hidden');
    document.getElementById('swipe-game').classList.remove('hidden');
    this.renderCard();
  },

  renderCard() {
    if (this.current >= this.cards.length) { this.finish(); return; }
    const card = this.cards[this.current];
    document.getElementById('swipe-statement').textContent = card.statement;
    document.getElementById('swipe-progress').textContent = `${this.current + 1} / ${this.total}`;
    document.getElementById('swipe-score').textContent = `${this.score} pts`;
    document.getElementById('swipe-feedback').classList.add('hidden');
    // Reset card animation
    const cardEl = document.getElementById('swipe-card');
    cardEl.className = 'swipe-card-container';
  },

  answer(userAnswer) {
    const card = this.cards[this.current];
    const correct = userAnswer === card.answer;
    if (correct) this.score++;

    const cardEl = document.getElementById('swipe-card');
    cardEl.classList.add(userAnswer ? 'swipe-right' : 'swipe-left');

    const fb = document.getElementById('swipe-feedback');
    fb.className = `swipe-feedback ${correct ? 'correct' : 'incorrect'}`;
    fb.innerHTML = `<strong>${correct ? '✅ Correct!' : '❌ Wrong!'}</strong> ${card.explanation || ''}`;
    fb.classList.remove('hidden');

    document.getElementById('swipe-score').textContent = `${this.score} pts`;

    setTimeout(() => {
      this.current++;
      this.renderCard();
    }, 1800);
  },

  finish() {
    document.getElementById('swipe-game').classList.add('hidden');
    document.getElementById('swipe-result').classList.remove('hidden');
    const pct = Math.round((this.score / this.total) * 100);
    document.getElementById('swipe-result-emoji').textContent = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚';
    document.getElementById('swipe-result-score').textContent = `${this.score} / ${this.total}`;
    document.getElementById('swipe-result-detail').textContent = `${pct}% correct`;
  }
};

// ── SURVIVE THE SHIFT GAME ──────────────────────────────────────────
const SurviveGame = {
  shifts: [],
  currentShift: null,
  patientIdx: 0,
  lives: 3,
  saved: 0,

  showStart() {
    const raw=ORL_DATA.survive_shifts||[];this.shifts=raw.length?[{icon:"hospital",name:"ENT Shift",patients:raw.map(q=>({vignette:q.scenario+q.question,options:q.options,correct:q.correct,alive:q.explanation||"Correct",dead:q.explanation||"Review"}))}]:[];
    document.getElementById('surv-start').classList.remove('hidden');
    document.getElementById('surv-game').classList.add('hidden');
    document.getElementById('surv-result').classList.add('hidden');

    const list = document.getElementById('surv-shift-list');
    list.innerHTML = '';
    this.shifts.forEach((shift, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary btn-full';
      btn.style.cssText = 'display:flex; align-items:center; gap:10px; justify-content:center;';
      btn.innerHTML = `<span style="font-size:20px;">${shift.icon}</span> ${shift.name}`;
      btn.addEventListener('click', () => this.startShift(idx));
      list.appendChild(btn);
    });
  },

  startShift(idx) {
    this.currentShift = this.shifts[idx];
    this.patientIdx = 0;
    this.lives = 3;
    this.saved = 0;

    document.getElementById('surv-start').classList.add('hidden');
    document.getElementById('surv-game').classList.remove('hidden');
    document.getElementById('surv-result').classList.add('hidden');
    this.renderPatient();
  },

  renderPatient() {
    if (this.patientIdx >= this.currentShift.patients.length || this.lives <= 0) {
      this.finish();
      return;
    }
    const p = this.currentShift.patients[this.patientIdx];
    document.getElementById('surv-lives').textContent = '❤️'.repeat(this.lives) + '🖤'.repeat(3 - this.lives);
    document.getElementById('surv-patient-num').textContent = `Patient ${this.patientIdx + 1} of ${this.currentShift.patients.length}`;
    document.getElementById('surv-vignette').textContent = p.vignette;
    document.getElementById('surv-feedback').classList.add('hidden');
    document.getElementById('surv-next-btn').classList.add('hidden');

    const optEl = document.getElementById('surv-options');
    optEl.innerHTML = '';
    p.options.forEach((opt, oi) => {
      const btn = document.createElement('button');
      btn.className = 'surv-option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => this.selectOption(oi));
      optEl.appendChild(btn);
    });
  },

  selectOption(idx) {
    const p = this.currentShift.patients[this.patientIdx];
    const correct = idx === p.correct;

    // Disable all options
    document.querySelectorAll('.surv-option-btn').forEach((btn, i) => {
      btn.disabled = true;
      if (i === p.correct) btn.classList.add('surv-correct');
      if (i === idx && !correct) btn.classList.add('surv-wrong');
    });

    if (correct) {
      this.saved++;
    } else {
      this.lives--;
      document.getElementById('surv-lives').textContent = '❤️'.repeat(this.lives) + '🖤'.repeat(3 - this.lives);
    }

    const fb = document.getElementById('surv-feedback');
    fb.className = correct ? 'surv-fb-correct' : 'surv-fb-wrong';
    fb.innerHTML = `<strong>${correct ? '✅ Patient saved!' : '☠️ Patient lost.'}</strong> ${correct ? p.alive : p.dead}`;
    fb.classList.remove('hidden');

    document.getElementById('surv-next-btn').classList.remove('hidden');
    if (this.lives <= 0) {
      document.getElementById('surv-next-btn').textContent = 'See Results';
    }
  },

  nextPatient() {
    this.patientIdx++;
    this.renderPatient();
  },

  finish() {
    document.getElementById('surv-game').classList.add('hidden');
    document.getElementById('surv-result').classList.remove('hidden');
    const total = this.currentShift.patients.length;
    const survived = this.lives > 0;

    document.getElementById('surv-result-emoji').textContent = survived ? (this.saved === total ? '🏆' : '🩺') : '💀';
    document.getElementById('surv-result-title').textContent = survived
      ? (this.saved === total ? 'Perfect Shift!' : 'Shift Complete')
      : 'Shift Failed';
    document.getElementById('surv-result-detail').textContent =
      `${this.saved} / ${total} patients saved · ${this.lives} lives remaining`;
  }
};

// ── PICK THE MISTAKE GAME ────────────────────────────────────────────
const PickMistake = {
  items: [], current: 0, score: 0,

  start() {
    this.items = [...(ORL_DATA.pick_mistakes || [])].sort(() => Math.random() - 0.5).slice(0, 10);
    this.current = 0; this.score = 0;
    document.getElementById('pm-start').classList.add('hidden');
    document.getElementById('pm-result').classList.add('hidden');
    document.getElementById('pm-game').classList.remove('hidden');
    this.render();
  },

  render() {
    if (this.current >= this.items.length) { this.finish(); return; }
    const item = this.items[this.current];
    document.getElementById('pm-progress').textContent = `${this.current + 1} / ${this.items.length}`;
    document.getElementById('pm-score').textContent = `${this.score} pts`;
    document.getElementById('pm-topic').textContent = item.topic;
    document.getElementById('pm-feedback').classList.add('hidden');
    document.getElementById('pm-next-btn').classList.add('hidden');

    // Build statement with clickable mistake segment
    const stmt = item.scenario || item.statement || "";
    const mistakeText = item.mistake;
    const idx = stmt.indexOf(mistakeText);

    const el = document.getElementById('pm-statement');
    el.innerHTML = '';

    if (idx >= 0) {
      // Split into segments: before, mistake, after
      const parts = [];
      if (idx > 0) parts.push({ text: stmt.substring(0, idx), isMistake: false });
      parts.push({ text: mistakeText, isMistake: true });
      const afterIdx = idx + mistakeText.length;
      if (afterIdx < stmt.length) parts.push({ text: stmt.substring(afterIdx), isMistake: false });

      // Also create some decoy clickable segments from the correct parts
      const allSegments = [];
      parts.forEach(p => {
        if (p.isMistake) {
          allSegments.push(p);
        } else {
          // Split non-mistake into phrases for clicking
          const words = p.text.split(/(?<=\s)/);
          let chunk = '';
          words.forEach(w => {
            chunk += w;
            if (chunk.length > 20 || w.endsWith('. ') || w.endsWith(', ')) {
              allSegments.push({ text: chunk, isMistake: false });
              chunk = '';
            }
          });
          if (chunk) allSegments.push({ text: chunk, isMistake: false });
        }
      });

      allSegments.forEach(seg => {
        const span = document.createElement('span');
        span.textContent = seg.text;
        span.className = 'pm-segment';
        span.addEventListener('click', () => this.select(seg.isMistake, span, item));
        el.appendChild(span);
      });
    } else {
      el.textContent = stmt;
    }
  },

  select(isMistake, span, item) {
    // Disable all segments
    document.querySelectorAll('.pm-segment').forEach(s => {
      s.style.pointerEvents = 'none';
    });

    if (isMistake) {
      this.score++;
      span.classList.add('pm-correct-pick');
    } else {
      span.classList.add('pm-wrong-pick');
      // Highlight the real mistake
      document.querySelectorAll('.pm-segment').forEach(s => {
        if (s.textContent === item.mistake) s.classList.add('pm-correct-pick');
      });
    }

    const fb = document.getElementById('pm-feedback');
    fb.className = isMistake ? 'surv-fb-correct' : 'surv-fb-wrong';
    fb.innerHTML = `<strong>${isMistake ? '✅ Correct!' : '❌ Missed it!'}</strong> ${item.correction}`;
    fb.classList.remove('hidden');
    document.getElementById('pm-next-btn').classList.remove('hidden');
    document.getElementById('pm-score').textContent = `${this.score} pts`;
  },

  next() {
    this.current++;
    this.render();
  },

  finish() {
    document.getElementById('pm-game').classList.add('hidden');
    document.getElementById('pm-result').classList.remove('hidden');
    const pct = Math.round((this.score / this.items.length) * 100);
    document.getElementById('pm-result-emoji').textContent = pct >= 80 ? '🏆' : pct >= 50 ? '🔍' : '📚';
    document.getElementById('pm-result-score').textContent = `${this.score} / ${this.items.length}`;
    document.getElementById('pm-result-detail').textContent = `${pct}% mistakes found`;
  }
};

// ── MATCHING GAME (Pass the River) ──────────────────────────────────
const MatchGame = {
  sets: [],
  currentSet: null,
  selectedLeft: null,
  matched: 0,
  pairs: [],

  init() {
    const raw=ORL_DATA.matching_sets||[];this.sets=raw.map(s=>({icon:"🧩",title:s.title,pairs:s.correct_pairs.map(p=>({left:s.left[p[0]],right:s.right[p[1]]}))  }));
    this.renderSetList();
  },

  renderSetList() {
    const list = document.getElementById('match-set-list');
    if (!list) return;
    list.innerHTML = '';
    this.sets.forEach((set, idx) => {
      const btn = document.createElement('div');
      btn.className = 'rot-card-item';
      btn.innerHTML = `
        <div class="rot-card-icon">${set.icon}</div>
        <div class="rot-card-info">
          <div class="rot-card-title">${set.title}</div>
          <div class="rot-card-desc">${set.pairs.length} pairs to match</div>
        </div>
        <div style="color:var(--text-hint); font-size:18px;">›</div>
      `;
      btn.addEventListener('click', () => this.startSet(idx));
      list.appendChild(btn);
    });
  },

  startSet(idx) {
    this.currentSet = this.sets[idx];
    this.matched = 0;
    this.selectedLeft = null;
    this.pairs = [...this.currentSet.pairs];

    document.getElementById('match-start').classList.add('hidden');
    document.getElementById('match-game').classList.remove('hidden');
    document.getElementById('match-result-msg').classList.add('hidden');
    document.getElementById('match-title').textContent = this.currentSet.title;
    this.renderBoard();
  },

  renderBoard() {
    document.getElementById('match-score').textContent = `${this.matched} / ${this.pairs.length}`;

    // Shuffle both columns independently
    const leftOrder = [...this.pairs].sort(() => Math.random() - 0.5);
    const rightOrder = [...this.pairs].sort(() => Math.random() - 0.5);

    const leftEl = document.getElementById('match-left');
    const rightEl = document.getElementById('match-right');
    leftEl.innerHTML = '<div style="font-size:11px; font-weight:700; color:var(--teal); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Tap to select ↓</div>';
    rightEl.innerHTML = '<div style="font-size:11px; font-weight:700; color:var(--text-hint); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Then tap the match ↓</div>';

    leftOrder.forEach((pair, i) => {
      const btn = document.createElement('button');
      btn.className = 'match-btn match-left-btn';
      btn.textContent = pair.left;
      btn.dataset.idx = this.pairs.indexOf(pair);
      btn.addEventListener('click', () => this.selectLeft(btn));
      leftEl.appendChild(btn);
    });

    rightOrder.forEach((pair, i) => {
      const btn = document.createElement('button');
      btn.className = 'match-btn match-right-btn';
      btn.textContent = pair.right;
      btn.dataset.idx = this.pairs.indexOf(pair);
      btn.addEventListener('click', () => this.selectRight(btn));
      rightEl.appendChild(btn);
    });
  },

  selectLeft(btn) {
    document.querySelectorAll('.match-left-btn').forEach(b => b.classList.remove('match-selected'));
    btn.classList.add('match-selected');
    this.selectedLeft = parseInt(btn.dataset.idx);
  },

  selectRight(btn) {
    if (this.selectedLeft === null) return;
    const rightIdx = parseInt(btn.dataset.idx);

    if (this.selectedLeft === rightIdx) {
      // Correct match!
      this.matched++;
      // Mark both as matched
      const leftBtn = document.querySelector(`.match-left-btn[data-idx="${this.selectedLeft}"]`);
      if (leftBtn) { leftBtn.classList.add('match-done'); leftBtn.disabled = true; }
      btn.classList.add('match-done'); btn.disabled = true;
      haptic('medium');
    } else {
      // Wrong
      btn.classList.add('match-wrong');
      setTimeout(() => btn.classList.remove('match-wrong'), 600);
      haptic('heavy');
    }

    this.selectedLeft = null;
    document.querySelectorAll('.match-left-btn').forEach(b => b.classList.remove('match-selected'));
    document.getElementById('match-score').textContent = `${this.matched} / ${this.pairs.length}`;

    if (this.matched === this.pairs.length) {
      setTimeout(() => {
        document.getElementById('match-result-msg').classList.remove('hidden');
      }, 500);
    }
  },

  shareItem() {
    const item = Rotation._currentItem;
    if (!item) return;
    var text = item.icon+' '+item.title+'\n\n';
    (item.items||[]).forEach(function(s){ text += '--- '+s.subtitle+' ---\n'+s.content+'\n\n'; });
    if (navigator.share) { navigator.share({title: item.title, text: text}); }
    else { navigator.clipboard.writeText(text).then(function(){ alert('Copied to clipboard!'); }); }
  },
  shareItem() {
    const item = Rotation._currentItem;
    if (!item) return;
    var text = item.icon+' '+item.title+'\n\n';
    (item.items||[]).forEach(function(s){ text += '--- '+s.subtitle+' ---\n'+s.content+'\n\n'; });
    if (navigator.share) { navigator.share({title: item.title, text: text}); }
    else { navigator.clipboard.writeText(text).then(function(){ alert('Copied!'); }); }
  },
  backToList() {
    document.getElementById('match-start').classList.remove('hidden');
    document.getElementById('match-game').classList.add('hidden');
    this.renderSetList();
  }
};

// ── Init ──────────────────────────────────────────────────────────────
async function init() {
  const user = await authenticate();
  initHome(user);
  updateHomeUI();

  // Handle hash routing
  const hash = location.hash.replace('#', '') || 'home';
  if (['home', 'exam', 'cards', 'course', 'cases', 'trivia', 'action', 'actioncards', 'highyield', 'rotation', 'swipe', 'survive', 'pickmistake', 'matching'].includes(hash)) {
    showSection(hash);
  } else {
    showSection('home');
  }


  // Init all sections
  await Exam.init();
  await Cards.init();
  await Course.init();
  await Trivia.init();
  await Cases.init();
  ActionCards.init();
  HighYield.init();
  Rotation.init();
  SurviveGame.showStart();
  MatchGame.init();

  // Flashcard swipe
  const flashcardEl = document.getElementById('flashcard');
  if (flashcardEl) {
    initSwipe(flashcardEl,
      () => Cards.next(),
      () => Cards.prev(),
      () => Cards.flip(),
    );
    flashcardEl.addEventListener('click', () => Cards.flip());
  }
}

// ── In Action (Hospital Survival Guide) ──────────────────────────────
const Action = {
  categories: [],
  currentCategory: null,
  guides: [],
  currentGuide: null,

  open() {
    showSection('action');
    this.loadCategories();
  },

  async loadCategories() {
    try {
      this.categories = await apiFetch('/api/action/categories');
      this.renderCategories();
    } catch (e) {
      console.error('Failed to load action categories:', e);
    }
  },

  renderCategories() {
    const grid = document.getElementById('action-categories-grid');
    grid.innerHTML = '';
    this.categories.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'action-cat-card';
      card.innerHTML = `
        <div class="action-cat-icon">${cat.icon}</div>
        <div class="action-cat-title">${cat.title}</div>
        <div class="action-cat-count">${cat.count} guides</div>
      `;
      card.addEventListener('click', () => { haptic('light'); this.openCategory(cat); });
      grid.appendChild(card);
    });
  },

  async openCategory(cat) {
    this.currentCategory = cat;
    document.getElementById('action-categories-view').classList.add('hidden');
    document.getElementById('action-guides-view').classList.remove('hidden');
    document.getElementById('action-guide-view').classList.add('hidden');
    document.getElementById('action-category-title').textContent = `${cat.icon} ${cat.title}`;

    try {
      this.guides = await apiFetch(`/api/action/guides?category=${cat.category}`);
      this.renderGuides();
    } catch (e) {
      console.error('Failed to load guides:', e);
    }
  },

  renderGuides() {
    const list = document.getElementById('action-guides-list');
    list.innerHTML = '';
    this.guides.forEach(g => {
      const card = document.createElement('div');
      card.className = 'action-guide-card';
      card.innerHTML = `
        <div class="action-guide-icon">${g.icon}</div>
        <div class="action-guide-title">${g.title}</div>
        ${g.has_template ? '<div class="action-guide-badge">📋 Template</div>' : ''}
        <div style="color:var(--text-hint);">›</div>
      `;
      card.addEventListener('click', () => { haptic('light'); this.openGuide(g.id); });
      list.appendChild(card);
    });
  },

  async openGuide(id) {
    document.getElementById('action-guides-view').classList.add('hidden');
    document.getElementById('action-guide-view').classList.remove('hidden');

    const contentEl = document.getElementById('action-guide-content');
    contentEl.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

    try {
      this.currentGuide = await apiFetch(`/api/action/guides/${id}`);
      document.getElementById('action-guide-title').textContent = `${this.currentGuide.icon} ${this.currentGuide.title}`;

      if (window.marked) {
        contentEl.innerHTML = marked.parse(cleanContent(this.currentGuide.content || ''));
      } else {
        contentEl.innerHTML = (this.currentGuide.content || '').replace(/\n/g, '<br>');
      }

      const templateWrap = document.getElementById('action-template-wrap');
      if (this.currentGuide.template) {
        document.getElementById('action-template-text').textContent = this.currentGuide.template;
        templateWrap.classList.remove('hidden');
      } else {
        templateWrap.classList.add('hidden');
      }
    } catch (e) {
      contentEl.innerHTML = '<p style="color:var(--red);">Failed to load guide.</p>';
    }
  },

  copyTemplate() {
    if (!this.currentGuide?.template) return;
    navigator.clipboard.writeText(this.currentGuide.template).then(() => {
      showToast('📋 Copied to clipboard!', 'success');
      haptic('medium');
    }).catch(() => {
      showToast('Copy failed', 'error');
    });
  },

  backToCategories() {
    document.getElementById('action-categories-view').classList.remove('hidden');
    document.getElementById('action-guides-view').classList.add('hidden');
    document.getElementById('action-guide-view').classList.add('hidden');
    haptic('light');
  },

  backToGuides() {
    document.getElementById('action-guides-view').classList.remove('hidden');
    document.getElementById('action-guide-view').classList.add('hidden');
    haptic('light');
  },
};

// ═══════════════════ FEEDBACK ═══════════════════
function sendFeedback() {
  const userName = currentUser?.first_name ? ` (${currentUser.first_name})` : '';
  const text = encodeURIComponent('\u0645\u0644\u0627\u062d\u0638\u0629 ORL101' + userName + ':\n');
  const waUrl = `https://wa.me/966582701349?text=${text}`;
  if (window.Telegram?.WebApp?.openLink) {
    Telegram.WebApp.openLink(waUrl);
  } else {
    window.open(waUrl, '_blank');
  }
  haptic('medium');
}

document.addEventListener('DOMContentLoaded', init);
