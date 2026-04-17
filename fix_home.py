# Fix home: 5 big cards with submenus + CSS + JS

c = open("index.html").read()

# 1. Replace home grid content
old_grid = '''  <!-- ── LEARN ── -->
  <div class="home-section-label">📚 Learn</div>
  <div class="mode-grid">
    <div class="mode-card" data-mode="course">
      <div class="mode-icon">🎓</div>
      <div class="mode-title">Course Mode</div>
      <div class="mode-desc">20 chapters · Quick &amp; Detailed</div>
    </div>
    <div class="mode-card" data-mode="exam">
      <div class="mode-icon">📝</div>
      <div class="mode-title">Exam Mode</div>
      <div class="mode-desc">MCQ practice with instant feedback</div>
    </div>
    <div class="mode-card" data-mode="cards">
      <div class="mode-icon">🃏</div>
      <div class="mode-title">Cards Mode</div>
      <div class="mode-desc">Red flags &amp; clinical pearls</div>
    </div>
    <div class="mode-card" data-mode="cases">
      <div class="mode-icon">🏥</div>
      <div class="mode-title">Cases</div>
      <div class="mode-desc">15 branching clinical cases</div>
    </div>
  </div>

  <!-- ── CLINICAL ── -->
  <div class="home-section-label">🔬 Clinical</div>
  <div class="mode-grid">
    <div class="mode-card" data-mode="search">
      <div class="mode-icon">🔍</div>
      <div class="mode-title">Search</div>
      <div class="mode-desc">Search chapters and content</div>
    </div>
  </div>

  <!-- ── REFERENCE ── -->
  <div class="home-section-label">📋 Quick Reference</div>
  <div class="mode-grid">
    <div class="mode-card" data-mode="actioncards">
      <div class="mode-icon">🚨</div>
      <div class="mode-title">If You See This</div>
      <div class="mode-desc">See it → Do it. 30-sec cards</div>
    </div>
    <div class="mode-card" data-mode="highyield">
      <div class="mode-icon">⚡</div>
      <div class="mode-title">High Yield</div>
      <div class="mode-desc">Key bullets per chapter</div>
    </div>
    <div class="mode-card" data-mode="rotation">
      <div class="mode-icon">🩺</div>
      <div class="mode-title">In Rotation</div>
      <div class="mode-desc">Reports, referrals, consent</div>
    </div>
  </div>

  <!-- ── GAMES ── -->
  <div class="home-section-label">🎮 Games</div>
  <div class="mode-grid">
    <div class="mode-card" data-mode="trivia">
      <div class="mode-icon">🎮</div>
      <div class="mode-title">Trivia</div>
      <div class="mode-desc">Rapid-fire ENT quiz</div>
    </div>
    <div class="mode-card" data-mode="swipe">
      <div class="mode-icon">🔥</div>
      <div class="mode-title">Swipe Cards</div>
      <div class="mode-desc">True or False? Swipe it</div>
    </div>
    <div class="mode-card" data-mode="survive">
      <div class="mode-icon">💀</div>
      <div class="mode-title">Survive the Shift</div>
      <div class="mode-desc">5 patients. 3 lives.</div>
    </div>
    <div class="mode-card" data-mode="pickmistake">
      <div class="mode-icon">🔍</div>
      <div class="mode-title">Pick the Mistake</div>
      <div class="mode-desc">Find the clinical error</div>
    </div>
    <div class="mode-card" data-mode="matching">
      <div class="mode-icon">🧩</div>
      <div class="mode-title">Matching</div>
      <div class="mode-desc">Match pairs · Pass the river</div>
    </div>
  </div>'''

new_grid = '''  <!-- 5 MAIN CARDS -->
  <div class="hm-grid">

    <div class="hm-card" onclick="toggleSub('sub-learn',this)">
      <div class="hm-left"><div class="hm-icon">📚</div><div><div class="hm-title">Learn</div><div class="hm-desc">Course · Exam · Cards · Cases · High Yield</div></div></div>
      <div class="hm-arrow">›</div>
    </div>
    <div class="hm-sub hidden" id="sub-learn">
      <div class="mode-card" data-mode="course"><div class="mode-icon">🎓</div><div class="mode-title">Course</div><div class="mode-desc">20 chapters</div></div>
      <div class="mode-card" data-mode="exam"><div class="mode-icon">📝</div><div class="mode-title">Exam</div><div class="mode-desc">MCQ practice</div></div>
      <div class="mode-card" data-mode="cards"><div class="mode-icon">🃏</div><div class="mode-title">Cards</div><div class="mode-desc">Clinical pearls</div></div>
      <div class="mode-card" data-mode="cases"><div class="mode-icon">🏥</div><div class="mode-title">Cases</div><div class="mode-desc">Clinical cases</div></div>
      <div class="mode-card" data-mode="highyield"><div class="mode-icon">⚡</div><div class="mode-title">High Yield</div><div class="mode-desc">Key bullets</div></div>
    </div>

    <div class="hm-card" data-mode="search">
      <div class="hm-left"><div class="hm-icon">🔍</div><div><div class="hm-title">Search</div><div class="hm-desc">Find anything in ORL 101</div></div></div>
    </div>

    <div class="hm-card" onclick="toggleSub('sub-action',this)">
      <div class="hm-left"><div class="hm-icon">⚡</div><div><div class="hm-title">In Action</div><div class="hm-desc">If You See This · In Rotation</div></div></div>
      <div class="hm-arrow">›</div>
    </div>
    <div class="hm-sub hidden" id="sub-action">
      <div class="mode-card" data-mode="actioncards"><div class="mode-icon">🚨</div><div class="mode-title">If You See This</div><div class="mode-desc">See it → Do it</div></div>
      <div class="mode-card" data-mode="rotation"><div class="mode-icon">🩺</div><div class="mode-title">In Rotation</div><div class="mode-desc">Reports · Referrals</div></div>
    </div>

    <div class="hm-card" onclick="toggleSub('sub-games',this)">
      <div class="hm-left"><div class="hm-icon">🎮</div><div><div class="hm-title">Games</div><div class="hm-desc">Trivia · Swipe · Survive · More</div></div></div>
      <div class="hm-arrow">›</div>
    </div>
    <div class="hm-sub hidden" id="sub-games">
      <div class="mode-card" data-mode="trivia"><div class="mode-icon">🎮</div><div class="mode-title">Trivia</div><div class="mode-desc">Rapid-fire quiz</div></div>
      <div class="mode-card" data-mode="swipe"><div class="mode-icon">🔥</div><div class="mode-title">Swipe</div><div class="mode-desc">True or False</div></div>
      <div class="mode-card" data-mode="survive"><div class="mode-icon">💀</div><div class="mode-title">Survive</div><div class="mode-desc">5 patients · 3 lives</div></div>
      <div class="mode-card" data-mode="pickmistake"><div class="mode-icon">🔍</div><div class="mode-title">Pick the Mistake</div><div class="mode-desc">Find the error</div></div>
      <div class="mode-card" data-mode="matching"><div class="mode-icon">🧩</div><div class="mode-title">Matching</div><div class="mode-desc">Match pairs</div></div>
    </div>

  </div>'''

if old_grid in c:
    c = c.replace(old_grid, new_grid)
    print("Grid replaced")
else:
    print("ERROR: grid pattern not found")
    exit()

# 2. Add CSS before </style>
css = """
.hm-grid{display:flex;flex-direction:column;gap:10px;padding:0 16px 8px;}
.hm-card{display:flex;align-items:center;justify-content:space-between;background:var(--card-bg);border-radius:14px;padding:16px;cursor:pointer;border:1px solid var(--border);transition:transform .15s;}
.hm-card:active{transform:scale(.98);}
.hm-left{display:flex;align-items:center;gap:14px;}
.hm-icon{font-size:28px;min-width:36px;text-align:center;}
.hm-title{font-size:16px;font-weight:700;color:var(--text);}
.hm-desc{font-size:12px;color:var(--text-hint);margin-top:2px;}
.hm-arrow{font-size:22px;color:var(--text-hint);transition:transform .25s;}
.hm-arrow.open{transform:rotate(90deg);}
.hm-sub{padding:8px 0 4px;display:flex;flex-direction:column;gap:8px;}
.hm-sub .mode-card{margin:0;}
"""

c = c.replace("</style>", css + "\n</style>", 1)
print("CSS added")

# 3. Add JS toggleSub function before </script> closing or before DOMContentLoaded
js = """
function toggleSub(id, card) {
  var sub = document.getElementById(id);
  var arrow = card.querySelector('.hm-arrow');
  if (sub.classList.contains('hidden')) {
    sub.classList.remove('hidden');
    if (arrow) arrow.classList.add('open');
  } else {
    sub.classList.add('hidden');
    if (arrow) arrow.classList.remove('open');
  }
}
"""

c = c.replace("function showSection(", js + "\nfunction showSection(", 1)
print("JS added")

open("index.html", "w").write(c)
print("Done")

