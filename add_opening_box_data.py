c = open("data.js").read()

box1 = '<div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:14px;padding:20px 18px;margin-bottom:20px;color:white;border-right:4px solid #C8A951;"><div style="font-size:13px;font-weight:700;color:#C8A951;margin-bottom:10px;">\\u📦 \\u0635\\u0646\\u062f\\u0648\\u0642 \\u0627\\u0641\\u062a\\u062a\\u0627\\u062d\\u064a</div><div style="font-size:13px;line-height:2;direction:rtl;text-align:right;"><p>\\u0628\\u0633\\u0645 \\u0627\\u0644\\u0644\\u0647 \\u0627\\u0644\\u0631\\u062d\\u0645\\u0646 \\u0627\\u0644\\u0631\\u062d\\u064a\\u0645</p><p>\\u0642\\u0627\\u0644 \\u062a\\u0639\\u0627\\u0644\\u0649: \\u﴿\\u0648\\u064e\\u0645\\u064e\\u0646 \\u064a\\u064e\\u062a\\u064e\\u0648\\u064e\\u0643\\u064e\\u0651\\u0644\\u0652 \\u0639\\u064e\\u0644\\u064e\\u0649 \\u0627\\u0644\\u0644\\u064e\\u0651\\u0647\\u0650 \\u0641\\u064e\\u0647\\u064e\\u0648\\u064e \\u062d\\u064e\\u0633\\u0652\\u0628\\u064f\\u0647\\u064f\\u﴾</p><p>\\u0648\\u0642\\u0627\\u0644 \\u0627\\u0644\\u0646\\u0628\\u064a \\uﷺ: <em>\\u064a\\u0627 \\u063a\\u0644\\u0627\\u0645\\u060c \\u0625\\u0646\\u064a \\u0623\\u0639\\u0644\\u0651\\u0645\\u0643 \\u0643\\u0644\\u0645\\u0627\\u062a: \\u0627\\u062d\\u0641\\u0638 \\u0627\\u0644\\u0644\\u0647 \\u064a\\u062d\\u0641\\u0638\\u0643\\u060c \\u0627\\u062d\\u0641\\u0638 \\u0627\\u0644\\u0644\\u0647 \\u062a\\u062c\\u062f\\u0647 \\u062a\\u062c\\u0627\\u0647\\u0643\\u060c \\u0625\\u0630\\u0627 \\u0633\\u0623\\u0644\\u062a\\u064e \\u0641\\u0627\\u0633\\u0623\\u0644 \\u0627\\u0644\\u0644\\u0647\\u060c \\u0648\\u0625\\u0630\\u0627 \\u0627\\u0633\\u062a\\u0639\\u0646\\u062a\\u064e \\u0641\\u0627\\u0633\\u062a\\u0639\\u0646 \\u0628\\u0627\\u0644\\u0644\\u0647</em></p><p>\\u0627\\u062e\\u062a\\u0631 \\u0645\\u0627 \\u062a\\u064f\\u062d\\u0633\\u0646\\u0647 \\u0648\\u062a\\u064f\\u062d\\u0628\\u0651\\u0647\\u060c \\u0623\\u062a\\u0642\\u0646 \\u0639\\u0645\\u0644\\u0643\\u060c \\u0648\\u0623\\u062e\\u0644\\u0635 \\u0627\\u0644\\u0646\\u064a\\u0629 \\u2014 \\u0648\\u062b\\u0642 \\u0628\\u0627\\u0644\\u0644\\u0647.</p></div></div>'

box2 = '<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:20px;border-left:4px solid var(--teal);"><div style="font-size:13px;font-weight:700;color:var(--teal);margin-bottom:10px;">🏥 Private Practice Potential</div><div style="font-size:13px;line-height:1.8;color:var(--text);"><p>Some specialties offer the flexibility of independent private practice — a solo clinic with minimal overhead, where your income and schedule are largely your own. Others require a hospital setting to function, whether due to the need for operating rooms, imaging, or multidisciplinary teams.</p><p>When choosing your specialty, consider:</p><ul><li>Can I eventually run an independent clinic?</li><li>Or will I always depend on a hospital infrastructure?</li></ul><p>Neither path is better — but knowing which one you are signing up for matters.</p></div></div>'

old1 = '"chapter_id":1,"title":"Introduction","title_ar":"","content":'
new1 = '"chapter_id":1,"title":"Introduction","title_ar":"","opening_box":"' + box1.replace('\\', '\\\\').replace('"', '\\"') + '","content":'

old2 = '"chapter_id":1,"title":"Pillar 2 \\u2014 Income (\\u0627\\u0644\\u0639\\u0627\\u0626\\u062f \\u0627\\u0644\\u0645\\u0627\\u062f\\u064a)","title_ar":"","content":'
new2 = '"chapter_id":1,"title":"Pillar 2 \\u2014 Income (\\u0627\\u0644\\u0639\\u0627\\u0626\\u062f \\u0627\\u0644\\u0645\\u0627\\u062f\\u064a)","title_ar":"","opening_box":"' + box2.replace('\\', '\\\\').replace('"', '\\"') + '","content":'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print("Box 1 added")
else:
    print("Introduction not found")

if old2 in c:
    c = c.replace(old2, new2, 1)
    print("Box 2 added")
else:
    print("Pillar 2 not found - trying alternate")
    old2b = '"Pillar 2'
    hits = c.count(old2b)
    print(f"Found {hits} occurrences of Pillar 2")

open("data.js", "w").write(c)

