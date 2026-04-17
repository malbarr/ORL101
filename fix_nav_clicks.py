c = open("index.html").read()

# 1. Fix bottom nav
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
    print("Nav fixed")
else:
    print("ERROR: nav not found")
    exit()

# 2. Add click handler for hm-card[data-mode]
click_patch = """
  document.querySelectorAll('.hm-card[data-mode]').forEach(function(el){
    el.addEventListener('click', function(){ showSection(this.getAttribute('data-mode')); });
  });"""

if 'hm-card[data-mode]' not in c:
    c = c.replace(
        "document.querySelectorAll('.mode-card')",
        click_patch + "\n  document.querySelectorAll('.mode-card')",
        1
    )
    print("Click handler added")

open("index.html","w").write(c)
print("Done")
