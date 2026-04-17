c = open("webapp.js").read()

old = """      if (this.mode === 'quick' && data.quick_summary) {
        // Quick Mode: concise summary + link to detailed
        const summaryHtml = renderWikiContent(data.quick_summary);
        contentEl.innerHTML = `
          <div class="wiki-quick-badge">⚡ Quick Review</div>
          ${summaryHtml}
          <div class="wiki-read-more" id="read-more-link">
            <span class="wiki-read-more-icon">📖</span>
            <span>Read full topic in Detailed Mode →</span>
          </div>
        `;
        document.getElementById('read-more-link')?.addEventListener('click', () => {
          this.mode = 'detailed';
          localStorage.setItem('orl101_course_mode', 'detailed');
          // Update toggle buttons
          document.querySelectorAll('.course-mode-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.mode === 'detailed'));
          this.openSubTopic(this.currentSubTopicIndex);
          haptic('light');
        });
      } else {"""

new = """      if (this.mode === 'quick') {
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
      } else {"""

if old in c:
    open("webapp.js","w").write(c.replace(old,new))
    print("Fixed")
else:
    print("Not found")
