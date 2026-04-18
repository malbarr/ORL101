import re

c = open("data.js").read()

# Box 1: Opening box for Introduction
box1 = """<div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:14px;padding:20px 18px;margin-bottom:20px;color:white;border-right:4px solid #C8A951;">
<div style="font-size:13px;font-weight:700;color:#C8A951;margin-bottom:10px;">📦 صندوق افتتاحي</div>
<div style="font-size:13px;line-height:2;direction:rtl;text-align:right;">
<p>بسم الله الرحمن الرحيم</p>
<p>قال تعالى: ﴿وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ﴾</p>
<p>وقال النبي ﷺ: <em>"يا غلام، إني أعلّمك كلمات: احفظ الله يحفظك، احفظ الله تجده تجاهك، إذا سألتَ فاسأل الله، وإذا استعنتَ فاستعن بالله، واعلم أن الأمة لو اجتمعت على أن ينفعوك بشيء لم ينفعوك إلا بشيء قد كتبه الله لك، وإن اجتمعوا على أن يضروك بشيء لم يضروك إلا بشيء قد كتبه الله عليك"</em></p>
<p>يتبادر إلى الكثيرين سؤال واحد: أيّها أضمن رزقاً؟</p>
<p>والجواب: الرزق على الله، والتخصص وسيلة.</p>
<p>اختر ما تُحسنه وتُحبّه، أتقن عملك، وأخلص النية — وثق بالله.</p>
</div>
</div>"""

# Box 2: Private Practice for Pillar 2
box2 = """<div style="background:var(--card-bg);border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:20px;border-left:4px solid var(--teal);">
<div style="font-size:13px;font-weight:700;color:var(--teal);margin-bottom:10px;">🏥 Private Practice Potential</div>
<div style="font-size:13px;line-height:1.8;color:var(--text);">
<p>Some specialties offer the flexibility of independent private practice — a solo clinic with minimal overhead, where your income and schedule are largely your own. Others require a hospital setting to function, whether due to the need for operating rooms, imaging, or multidisciplinary teams. And some specialties can only be practiced in a tertiary or specialized center.</p>
<p>When choosing your specialty, consider:</p>
<ul>
<li>Can I eventually run an independent clinic?</li>
<li>Or will I always depend on a hospital infrastructure?</li>
</ul>
<p>Neither path is better — but knowing which one you're signing up for matters.</p>
</div>
</div>"""

# Add box1 to Introduction content
old1 = '"chapter_id":1,"title":"Introduction","title_ar":"","content":"'
if old1 in c:
    c = c.replace(old1, old1 + box1.replace('"', '\\"').replace('\n', '\\n') + '\\n\\n', 1)
    print("Box 1 added to Introduction")
else:
    print("Introduction not found")

# Add box2 to Pillar 2
old2 = '"chapter_id":1,"title":"Pillar 2 — Income (العائد المادي)","title_ar":"","content":"'
if old2 in c:
    c = c.replace(old2, old2 + box2.replace('"', '\\"').replace('\n', '\\n') + '\\n\\n', 1)
    print("Box 2 added to Pillar 2")
else:
    print("Pillar 2 not found")

open("data.js", "w").write(c)
