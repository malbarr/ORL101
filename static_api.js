// ── Static API Interceptor ─────────────────────────────────────────────
// Replaces apiFetch() to serve data from ORL_DATA instead of backend API
// Must be loaded AFTER data.js and BEFORE webapp.js

let _staticUser = JSON.parse(localStorage.getItem('orl101_static_user') || 'null');
if (!_staticUser) {
  _staticUser = { id: 1, name: 'Student', username: 'student', role: 'student', level: 'beginner', xp: 0 };
  localStorage.setItem('orl101_static_user', JSON.stringify(_staticUser));
}
let _staticProgress = JSON.parse(localStorage.getItem('orl101_progress') || '{}');
let _quizSession = null;

function _shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // Auth
  if (path.includes('/api/auth')) {
    return { user: _staticUser, token: 'static-token', is_new: false };
  }

  // Chapters
  if (path === '/api/chapters' || path === '/api/chapters/accessible') {
    return (ORL_DATA.chapters || []).filter(c => c.is_active !== 0);
  }

  // Course progress
  if (path === '/api/course/progress') {
    return { chapters: [], overall_percent: 0 };
  }

  // Subtopics
  const subtopicMatch = path.match(/\/api\/chapters\/(\d+)\/subtopics/);
  if (subtopicMatch) {
    const chId = parseInt(subtopicMatch[1]);
    return (ORL_DATA.subtopics || []).filter(s => s.chapter_id === chId);
  }

  const subtopicDetail = path.match(/\/api\/subtopics\/(\d+)$/);
  if (subtopicDetail) {
    const stId = parseInt(subtopicDetail[1]);
    return (ORL_DATA.subtopics || []).find(s => s.id === stId) || {};
  }

  // Flashcards
  if (path.includes('/api/flashcards')) {
    if (method === 'POST') return { success: true };
    const params = new URLSearchParams(path.split('?')[1] || '');
    const cat = params.get('category');
    let cards = ORL_DATA.flashcards || [];
    if (cat && cat !== 'all') cards = cards.filter(c => c.category === cat);
    return _shuffle(cards).slice(0, 50);
  }

  // Quiz session
  if (path === '/api/quiz/session' && method === 'POST') {
    let questions = ORL_DATA.questions || [];
    if (body.chapter_id) questions = questions.filter(q => q.chapter_id === body.chapter_id);
    questions = _shuffle(questions).slice(0, body.num_questions || 10);
    _quizSession = {
      session_id: Date.now(),
      questions: questions,
      current_index: 0,
      score: 0,
      answers: []
    };
    return {
      session_id: _quizSession.session_id,
      questions: questions,
      question: questions[0],
      total: questions.length,
      current: 1
    };
  }

  // Quiz answer
  if (path.includes('/api/quiz/answer') && method === 'POST') {
    if (!_quizSession) return { correct: false };
    const q = _quizSession.questions[_quizSession.current_index];
    const correct = body.answer === q.correct_answer;
    if (correct) _quizSession.score++;
    _quizSession.answers.push({ question_id: q.id, answer: body.answer, correct });
    _quizSession.current_index++;
    const next = _quizSession.questions[_quizSession.current_index];
    return {
      correct,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      next_question: next || null,
      current: _quizSession.current_index + 1,
      total: _quizSession.questions.length
    };
  }

  // Quiz complete
  if (path.includes('/api/quiz/complete') && method === 'POST') {
    const score = _quizSession ? _quizSession.score : 0;
    const total = _quizSession ? _quizSession.questions.length : 0;
    return { score, total, percentage: total ? Math.round(score / total * 100) : 0, xp_earned: score * 10 };
  }

  // Trivia questions
  if (path.includes('/api/trivia/questions')) {
    const params = new URLSearchParams(path.split('?')[1] || '');
    const count = parseInt(params.get('count') || '10');
    return _shuffle(ORL_DATA.questions || []).slice(0, count);
  }

  // Trivia score / leaderboard
  if (path.includes('/api/trivia/score')) return { success: true };
  if (path.includes('/api/trivia/leaderboard')) return [];

  // Cases history (stub)
  if (path.includes('/api/cases/history')) {
    return { stats: { cases_passed: 0, avg_percent: 0 }, attempts: [] };
  }

  // Cases attempt (stub)
  if (path.includes('/api/cases/attempt')) {
    return { success: true };
  }

  // Single case by ID
  if (path.match(//api/cases/\d+/)) {
    const id = parseInt(path.split('/').pop());
    return (ORL_DATA.clinical_cases || []).find(c => c.id === id) || null;
  }

  // Clinical cases list
  if (path.includes('/api/cases') || path.includes('/api/clinical')) {
    return ORL_DATA.clinical_cases || [];
  }

  // Certificate
  if (path.includes('/api/certificate')) {
    return { eligible: false, message: 'Complete all chapters to earn certificate' };
  }

  // Pre-test
  if (path.includes('/api/test/pre') || path.includes('/api/test/post')) {
    const questions = _shuffle(ORL_DATA.questions || []).slice(0, 20);
    return { questions, session_id: Date.now() };
  }

  // User role / profile
  if (path.includes('/api/user')) return _staticUser;

  // Chat (Ask the Book) — return placeholder
  if (path.includes('/api/chat')) {
    return { response: 'هذه الميزة غير متوفرة في النسخة المجانية. يرجى فتح التطبيق عبر Telegram.' };
  }

  // Default
  console.warn('Static API: unhandled path', path);
  return {};
}
