c = open("data.js").read()

box1 = '<div style=\\"background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:14px;padding:20px 18px;margin-bottom:20px;color:white;border-right:4px solid #C8A951;\\"><div style=\\"font-size:13px;font-weight:700;color:#C8A951;margin-bottom:10px;\\">📦 صندوق افتتاحي</div><div style=\\"font-size:13px;line-height:2;direction:rtl;text-align:right;\\"><p>بسم الله الرحمن الرحيم</p><p>قال تعالى: ﴿وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ﴾</p><p>والجواب: الرزق على الله، والتخصص وسيلة.</p><p>اختر ما تُحسنه وتُحبّه، أتقن عملك، وأخلص النية — وثق بالله.</p></div></div>'

box2 = '<div style=\\"background:var(--card-bg);border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:20px;border-left:4px solid var(--teal);\\"><div style=\\"font-size:13px;font-weight:700;color:var(--teal);margin-bottom:10px;\\">🏥 Private Practice Potential</div><div style=\\"font-size:13px;line-height:1.8;color:var(--text);\\"><p>Some specialties offer the flexibility of independent private practice — a solo clinic with minimal overhead. Others require a hospital setting. Neither path is better — but knowing which one you are signing up for matters.</p></div></div>'

old1 = '"chapter_id":1,"title":"Introduction","title_ar":"","content":"'
new1 = '"chapter_id":1,"title":"Introduction","title_ar":"","opening_box":"' + box1 + '","content":"'

old2 = '"chapter_id":1,"title":"Pillar 2 \u2014 Income (\u0627\u0644\u0639\u0627\u0626\u062f \u0627\u0644\u0645\u0627\u062f\u064a)","title_ar":"","content":"'
new2 = '"chapter_id":1,"title":"Pillar 2 \u2014 Income (\u0627\u0644\u0639\u0627\u0626\u062f \u0627\u0644\u0645\u0627\u062f\u064a)","title_ar":"","opening_box":"' + box2 + '","content":"'

if old1 in c:
    c = c.replace(old1, new1, 1)
    print("Box 1 added")
else:
    print("Introduction not found")

if old2 in c:
    c = c.replace(old2, new2, 1)
    print("Box 2 added")
else:
    print("Pillar 2 not found")

open("data.js","w").write(c)
print(f"Counts - opening_box:{c.count('opening_box')} PP:{c.count('Private Practice')}")
