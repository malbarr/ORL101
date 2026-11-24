// Headless regression test for the Tutorial section.
// Runs the real index.html + tutorial.js in jsdom and drives the UI the way a
// student would: tap the card buttons, open the activity menu, play every
// activity of every type, and assert scoring/guards. Exits non-zero on failure.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = __dirname;
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// runScripts:'dangerously' is required so the inline onclick= attributes in the
// rendered markup actually execute — that is exactly the path a student's tap
// takes. External <script src> files are NOT fetched (no resources:'usable'),
// so only the files we load explicitly below run.
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' });
const { window } = dom;
global.window = window; global.document = window.document;
window.scrollTo = () => {};
window.fetch = () => Promise.resolve({ ok: true, status: 200 });

// minimal app stubs the tutorial module touches
window.haptic = () => {};
window.showToast = () => {};
window.ORL_DATA = {};

function load(f) { window.eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
load('tutorials.js');
load('tutorial.js');

const T = window.Tutorial, G = window.TUT_GAMES;
let pass = 0, fail = 0;
const ok  = (c, m) => { c ? (pass++, console.log('  PASS ' + m)) : (fail++, console.log('  FAIL ' + m)); };
const q   = s => window.document.querySelectorAll(s);
const txt = id => (window.document.getElementById(id) || {}).textContent || '';

console.log('\n== list view ==');
T.init();
ok(q('#tut-list .tut-card').length === 2, 'two tutorial cards');
const goBtns = [...q('#tut-list .tut-go')];
ok(goBtns.length === 4, 'four action buttons (Slides + Activities per card), got ' + goBtns.length);
ok(goBtns.some(b => /Activities \(15\)/.test(b.textContent)), 'Throat shows Activities (15)');
ok(goBtns.some(b => /Slides \(84\)/.test(b.textContent)), 'Throat shows Slides (84)');

console.log('\n== activities reachable in ONE tap (the reported bug) ==');
goBtns[1].click();          // Activities on card 1
ok(q('.tut-menu-item').length === 15, 'menu lists 15 activities, got ' + q('.tut-menu-item').length);
ok(!window.document.getElementById('tut-act-view').classList.contains('hidden'), 'activity view visible');

console.log('\n== slide view: jump control + skip button ==');
T.open('throat');
ok(q('#tut-slide-nav input[type=range]').length === 1, 'jump slider present');
ok(/Skip to activities/.test(txt('tut-slide-nav')), 'skip-to-activities button present');
T.jumpSlide(60);
ok(T.slideIdx === 59, 'jumpSlide(60) lands on slide 60');
ok(/Slide 60 of 84/.test(txt('tut-progress-wrap')), 'progress label follows the jump');
ok(q('#tut-slide-body img').length === 1, 'slide shows its deck image');

console.log('\n== every activity of every tutorial renders ==');
for (const t of window.ORL_TUTORIALS) {
  T.openActivities(t.slug);
  let empties = 0, unknown = 0;
  for (let i = 0; i < t.activities.length; i++) {
    T.goActivity(i);
    const h = (window.document.getElementById('tut-act-body') || {}).innerHTML || '';
    if (h.length < 150) empties++;
    if (/Unsupported/.test(h)) unknown++;
  }
  ok(empties === 0, `${t.slug}: no empty activity bodies (${t.activities.length} checked)`);
  ok(unknown === 0, `${t.slug}: no unsupported activity types`);
}

console.log('\n== grading, guards and every interactive type ==');
T.openActivities('throat');
const acts = T.current.activities;
const find = ty => acts.findIndex(a => a.type === ty);

// option-based: correct then a blocked second answer
T.goActivity(find('scenario'));
const sc = acts[find('scenario')];
T.answerOption(sc.answer);
ok(T.score === 1 && T.attempted === 1, 'correct option scores 1/1');
T.answerOption('A');
ok(T.attempted === 1, 'second answer on the same item is blocked');
ok(q('.tut-fb.ok').length === 1, 'green feedback shown');

// wrong answer reveals the right one
T.goActivity(find('mcq'));
const mc = acts[find('mcq')];
const wrong = Object.keys(mc.options).find(k => k !== String(mc.answer));
T.answerOption(wrong);
ok(q('.tut-fb.no').length === 1, 'red feedback on a wrong answer');
ok(txt('tut-act-fb').includes(String(mc.answer)), 'wrong answer reveals the correct key');

// true/false
T.goActivity(find('truefalse'));
T.answerTF(acts[find('truefalse')].answer);
ok(q('.tut-fb.ok').length === 1, 'truefalse grades correctly');

// jeopardy
T.goActivity(find('jeopardy'));
ok(q('.tut-jep-cell').length === 12, 'jeopardy board has 12 cells');
ok(q('.tut-jep-cat').length === 4, 'jeopardy has 4 categories');
G.jeopardy.openCell.call(T, 0, 0);
ok(q('#tut-jep-q .tut-opt').length === 4, 'jeopardy cell opens 4 options');
const cell = acts[find('jeopardy')].rows[0].cells[0];
const before = T.score;
G.jeopardy.answer.call(T, 0, 0, cell.answer);
ok(T.score === before + 1, 'jeopardy correct answer scores');

// matching
T.goActivity(find('matching'));
const ma = acts[find('matching')];
ok(q('[data-side=L]').length === ma.left.length, 'matching renders all left items');
const b4 = T.score;
for (const [li, ri] of ma.correct_pairs) {
  G.matching.pick.call(T, 'L', li);
  G.matching.pick.call(T, 'R', ri);
}
ok(T.score === b4 + 1, 'completing all matching pairs scores once');

// order: incomplete guard then correct
T.goActivity(find('order'));
const or = acts[find('order')];
const b5 = T.attempted;
G.order.place.call(T, or.correct_order[0]);
G.order.check.call(T);
ok(T.attempted === b5, 'incomplete order is not graded');
for (const i of or.correct_order.slice(1)) G.order.place.call(T, i);
G.order.check.call(T);
ok(T.attempted === b5 + 1 && q('.tut-fb.ok').length === 1, 'correct order scores');

// spot
T.goActivity(find('spot'));
const sp = acts[find('spot')];
ok(q('.tut-spot-dot').length === sp.hotspots.length, 'spot renders every hotspot');
const b6 = T.score;
for (let i = 0; i < sp.hotspots.length; i++) G.spot.hit.call(T, i);
ok(T.score === b6 + 1, 'tapping all hotspots scores');

// duolingo
T.goActivity(find('duolingo'));
const du = acts[find('duolingo')];
const b7 = T.score;
for (const w of du.answer_sentence.split(/\s+/)) {
  const btn = [...q('#tut-duo-pool button')].find(b => !b.disabled && b.textContent.trim() === w);
  if (btn) btn.click();
}
G.duolingo.check.call(T);
ok(T.score === b7 + 1, 'duolingo sentence built in order scores');

// pickmistake
T.goActivity(find('pickmistake'));
const pm = acts[find('pickmistake')];
const b8 = T.score;
T.answerOption(pm.answer);
ok(T.score === b8 + 1, 'pickmistake correct line scores');

console.log('\n== finish screen + progress persistence ==');
T.openActivities('nose');
const n = T.current.activities.length;
for (let i = 0; i < n; i++) { T.goActivity(i); }
T.actIdx = n; T.nextActivity();
ok(/complete/i.test(txt('tut-act-body')), 'finish screen renders');
ok(!!window.localStorage.getItem('orl101_tut_nose'), 'progress saved to localStorage');

console.log('\n== data integrity ==');
for (const t of window.ORL_TUTORIALS) {
  ok(t.slides.every(s => s.title && s.image), `${t.slug}: every slide has a title and image`);
  ok(t.activities.every(a => a.title), `${t.slug}: every activity has a title`);
  ok(t.activities.every(a => G[a.type]), `${t.slug}: every activity type is registered`);
}

console.log(`\n${fail ? 'FAILED' : 'ALL GREEN'} — pass ${pass}, fail ${fail}`);
process.exit(fail ? 1 : 0);
