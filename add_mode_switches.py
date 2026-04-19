c = open("webapp.js").read()

# 1. Add "Quick →" button in Audio mode (after the Stop button)
old1 = '              <button onclick="AudioPlayer.stop()" style="padding:10px 20px;background:var(--card-bg);color:var(--red);border:1px solid var(--border);border-radius:20px;font-size:14px;cursor:pointer;">⏹ Stop</button>\n            </div>'

new1 = '              <button onclick="AudioPlayer.stop()" style="padding:10px 20px;background:var(--card-bg);color:var(--red);border:1px solid var(--border);border-radius:20px;font-size:14px;cursor:pointer;">⏹ Stop</button>\n            </div>\n            <div style="margin-top:16px;"><button onclick="AudioPlayer.stop();Course.mode=\'quick\';localStorage.setItem(\'orl101_course_mode\',\'quick\');document.querySelectorAll(\'.course-mode-btn\').forEach(b=>b.classList.toggle(\'active\',b.dataset.mode===\'quick\'));Course.openSubTopic(Course.currentSubTopicIndex);" style="padding:6px 16px;background:var(--card-bg);color:var(--teal);border:1px solid var(--teal);border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;">⚡ Quick Review →</button></div>'

# 2. Add "Audio →" button in Quick mode (find the Full Details button area)
old2 = '              <button onclick="Course.mode=\'detailed\';localStorage.setItem(\'orl101_course_mode\',\'detailed\');document.querySelectorAll(\'.course-mode-btn\').forEach(b=>b.classList.toggle(\'active\',b.dataset.mode===\'detailed\'));Course.openSubTopic(Course.currentSubTopicIndex);" style="padding:6px 14px;background:var(--teal);color:white;border:none;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;">📖 Full Details →</button>'

new2 = '              <button onclick="Course.mode=\'detailed\';localStorage.setItem(\'orl101_course_mode\',\'detailed\');document.querySelectorAll(\'.course-mode-btn\').forEach(b=>b.classList.toggle(\'active\',b.dataset.mode===\'detailed\'));Course.openSubTopic(Course.currentSubTopicIndex);" style="padding:6px 14px;background:var(--teal);color:white;border:none;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;">📖 Full Details →</button>\n              <button onclick="Course.mode=\'audio\';localStorage.setItem(\'orl101_course_mode\',\'audio\');document.querySelectorAll(\'.course-mode-btn\').forEach(b=>b.classList.toggle(\'active\',b.dataset.mode===\'audio\'));Course.openSubTopic(Course.currentSubTopicIndex);" style="padding:6px 14px;background:var(--card-bg);color:var(--teal);border:1px solid var(--teal);border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;">🔊 Audio →</button>'

if old1 in c and old2 in c:
    c = c.replace(old1, new1, 1).replace(old2, new2, 1)
    open("webapp.js","w").write(c)
    print("Done")
else:
    print(f"old1:{old1 in c} old2:{old2 in c}")
