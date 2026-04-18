c = open("webapp.js").read()

# 1. Add audio button to toggle
old1 = '''      <button class="course-mode-btn ${this.mode === 'quick' ? 'active' : ''}" data-mode="quick">⚡ Quick Review</button>
      <button class="course-mode-btn ${this.mode === 'detailed' ? 'active' : ''}" data-mode="detailed">📖 Detailed</button>'''

new1 = '''      <button class="course-mode-btn ${this.mode === 'quick' ? 'active' : ''}" data-mode="quick">⚡ Quick Review</button>
      <button class="course-mode-btn ${this.mode === 'detailed' ? 'active' : ''}" data-mode="detailed">📖 Detailed</button>
      <button class="course-mode-btn ${this.mode === 'audio' ? 'active' : ''}" data-mode="audio">🔊 Audio</button>'''

# 2. Add audio rendering in openSubTopic
old2 = '''      } else {
        // Detailed Mode: full wiki content + quick button'''

new2 = '''      } else if (this.mode === 'audio') {
        // Audio Mode: auto-read high_yield points
        const chId = this.currentChapter?.id;
        const hy = (ORL_DATA.high_yield||[]).find(h=>h.chapter_id==chId);
        const pts = hy ? hy.points : [];
        const topicTitle = st.title || '';
        contentEl.innerHTML = `
          <div style="text-align:center;padding:20px;">
            <div style="font-size:16px;font-weight:700;color:var(--teal);margin-bottom:8px;">🔊 Audio Mode</div>
            <div style="font-size:13px;color:var(--text-hint);margin-bottom:20px;">${topicTitle}</div>
            <div id="audio-point-display" style="background:var(--card-bg);border-radius:12px;padding:16px;min-height:80px;font-size:15px;line-height:1.8;color:var(--text);margin-bottom:20px;"></div>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
              <button id="audio-play-btn" onclick="AudioPlayer.toggle()" style="padding:10px 20px;background:var(--teal);color:white;border:none;border-radius:20px;font-size:14px;font-weight:600;cursor:pointer;">▶ Play</button>
              <button onclick="AudioPlayer.next()" style="padding:10px 20px;background:var(--card-bg);color:var(--text);border:1px solid var(--border);border-radius:20px;font-size:14px;cursor:pointer;">⏭ Next</button>
              <button onclick="AudioPlayer.stop()" style="padding:10px 20px;background:var(--card-bg);color:var(--red);border:1px solid var(--border);border-radius:20px;font-size:14px;cursor:pointer;">⏹ Stop</button>
            </div>
            <div id="audio-progress" style="margin-top:16px;font-size:12px;color:var(--text-hint);"></div>
          </div>`;
        AudioPlayer.init(pts, topicTitle);
      } else {
        // Detailed Mode: full wiki content + quick button'''

if old1 in c and old2 in c:
    c = c.replace(old1, new1, 1)
    c = c.replace(old2, new2, 1)
    open("webapp.js","w").write(c)
    print("Fixed")
else:
    print(f"old1 found: {old1 in c}")
    print(f"old2 found: {old2 in c}")
