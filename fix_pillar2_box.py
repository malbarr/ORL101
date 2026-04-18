c = open("data.js").read()

box2 = '<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:20px;border-left:4px solid var(--teal);"><div style="font-size:13px;font-weight:700;color:var(--teal);margin-bottom:10px;">🏥 Private Practice Potential</div><div style="font-size:13px;line-height:1.8;color:var(--text);"><p>Some specialties offer the flexibility of independent private practice — a solo clinic with minimal overhead, where your income and schedule are largely your own. Others require a hospital setting to function, whether due to the need for operating rooms, imaging, or multidisciplinary teams.</p><p>When choosing your specialty, consider:</p><ul><li>Can I eventually run an independent clinic?</li><li>Or will I always depend on a hospital infrastructure?</li></ul><p>Neither path is better — but knowing which one you are signing up for matters.</p></div></div>'

old2 = '"Pillar 2 \u2014 Income (\u0627\u0644\u0639\u0627\u0626\u062f \u0627\u0644\u0645\u0627\u062f\u064a)","title_ar":"","content":'
new2 = '"Pillar 2 \u2014 Income (\u0627\u0644\u0639\u0627\u0626\u062f \u0627\u0644\u0645\u0627\u062f\u064a)","title_ar":"","opening_box":"' + box2.replace('"', '\\"') + '","content":'

if old2 in c:
    open("data.js","w").write(c.replace(old2, new2, 1))
    print("Box 2 added to Pillar 2")
else:
    print("Not found — checking raw bytes")
    idx = c.find("Pillar 2")
    print(repr(c[idx:idx+80]))
