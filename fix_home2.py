import re

c = open("index.html").read()

# 1. Replace everything between home-hero and For Patients
old = re.search(
    r'(</div>\s*\n\s*\n\s*\n\s*)<!-- ── LEARN.*?<!-- For Patients link -->',
    c, re.S
)
if not old:
    print("ERROR: pattern not found"); exit()

new_grid = '''

  <!-- 5 MAIN CARDS -->
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

  </div>

  <!-- For Patients link -->'''

c = c[:old.start(1)] + '\n' + new_grid + c[old.end():]
print("Grid replaced")

# 2. Replace bottom nav
old_nav = '''<nav class="bottom-nav">
  <button class="nav-item active" data-section="home">
    <span class="nav-icon">🏠</span>
    <span class="nav-label">Home</span>
  </button>
  <button class="nav-item" data-section="exam">
    <span class="nav-icon">📝</span>
    <span class="nav-label">Exam</span>
  </button>
  <button class="nav-item" data-section="cards">
    <span class="nav-icon">🃏</span>
    <span class="nav-label">Cards</span>
  </button>
  <button class="nav-item" data-section="course">
    <span class="nav-icon">📚</span>
    <span class="nav-label">Course</span>
  </button>
  <button class="nav-item" data-section="cases">
    <span class="nav-icon">🏥</span>
    <span class="nav-label">Cases</span>
  </button>
  <button class="nav-item" data-section="trivia">
    <span class="nav-icon">🎮</span>
    <span class="nav-label">Trivia</span>
  </button>
</nav>'''

new_nav = '''<nav class="bottom-nav">
  <button class="nav-item active" data-section="home">
    <span class="nav-icon">🏠</span>
    <span class="nav-label">Home</span>
  </button>
  <button class="nav-item" data-section="search">
    <span class="nav-icon">🔍</span>
    <span class="nav-label">Search</span>
  </button>
  <button class="nav-item" data-section="actioncards">
    <span class="nav-icon">⚡</span>
    <span class="nav-label">In Action</span>
  </button>
  <button class="nav-item" data-section="trivia">
    <span class="nav-icon">🎮</span>
    <span class="nav-label">Games</span>
  </button>
  <button class="nav-item" onclick="window.open('https://malbarr.github.io/Albar-Health-V2/','_blank')">
    <span class="nav-icon">👥</span>
    <span class="nav-label">Patients</span>
  </button>
</nav>'''

if old_nav in c:
    c = c.replace(old_nav, new_nav)
    print("Nav replaced")
else:
    print("ERROR: nav pattern not found")

# 3. Add CSS + JS if not already present
if 'hm-grid' not in c:
    css = """
.hm-grid{display:flex;flex-direction:column;gap:10px;padding:0 16px 8px;}
.hm-card{display:flex;align-items:center;justify-content:space-between;background:var(--card-bg);border-radius:14px;padding:16px;cursor:pointer;border:1px solid var(--border);}
.hm-card:active{opacity:.85;}
.hm-left{display:flex;align-items:center;gap:14px;}
.hm-icon{font-size:26px;min-width:34px;text-align:center;}
.hm-title{font-size:16px;font-weight:700;color:var(--text);}
.hm-desc{font-size:12px;color:var(--text-hint);margin-top:2px;}
.hm-arrow{font-size:22px;color:var(--text-hint);transition:transform .25s;}
.hm-arrow.open{transform:rotate(90deg);}
.hm-sub{padding:4px 0 8px;display:flex;flex-direction:column;gap:8px;}
"""
    c = c.replace("</style>", css + "\n</style>", 1)
    print("CSS added")

if 'toggleSub' not in c:
    js = """
function toggleSub(id, card) {
  var sub = document.getElementById(id);
  var arrow = card.querySelector('.hm-arrow');
  if (!sub) return;
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

# 4. Add click handler for hm-card with data-mode
if 'hm-card' not in c or 'data-mode' not in c:
    pass
else:
    # Patch showSection or DOMContentLoaded to handle hm-card clicks
    patch = """
  document.querySelectorAll('.hm-card[data-mode]').forEach(function(card){
    card.addEventListener('click', function(){
      showSection(this.getAttribute('data-mode'));
    });
  });
"""
    if 'hm-card[data-mode]' not in c:
        c = c.replace(
            "document.querySelectorAll('.mode-card')",
            patch + "\n  document.querySelectorAll('.mode-card')",
            1
        )
        print("Click handler added")

open("index.html", "w").write(c)
print("Done")
