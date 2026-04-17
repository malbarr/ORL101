c = open("webapp.js").read()
old = "        // Detailed Mode: full wiki content\n        contentEl.innerHTML = renderWikiContent(data.content || '');"
new = """        // Detailed Mode: full wiki content + quick button
        const quickBtn = '<div style="margin-bottom:12px;display:flex;justify-content:flex-end;"><button onclick="Course.mode=\\'quick\\';localStorage.setItem(\\'orl101_course_mode\\',\\'quick\\');document.querySelectorAll(\\'.course-mode-btn\\').forEach(b=>b.classList.toggle(\\'active\\',b.dataset.mode===\\'quick\\'));Course.openSubTopic(Course.currentSubTopicIndex);" style="padding:6px 14px;background:var(--card-bg);color:var(--teal);border:1px solid var(--teal);border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;">⚡ Quick Review \u2190</button></div>';
        contentEl.innerHTML = quickBtn + renderWikiContent(data.content || '');"""
if old in c:
    open("webapp.js","w").write(c.replace(old,new))
    print("Fixed")
else:
    print("Not found")
