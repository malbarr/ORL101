c = open("data.js").read()

hadith_box = '<div style=\\"background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:14px;padding:20px 18px;margin-top:24px;color:white;border-right:4px solid #C8A951;\\"><div style=\\"font-size:13px;font-weight:700;color:#C8A951;margin-bottom:12px;\\">قال النبي صلى الله عليه وآله وسلم</div><div style=\\"font-size:14px;line-height:2.2;direction:rtl;text-align:right;font-style:italic;\\">يا غلام، إني أعلّمك كلمات: احفظ الله يحفظك، احفظ الله تجده تجاهك، إذا سألتَ فاسأل الله، وإذا استعنتَ فاستعن بالله، واعلم أن الأمة لو اجتمعت على أن ينفعوك بشيء لم ينفعوك إلا بشيء قد كتبه الله لك، وإن اجتمعوا على أن يضروك بشيء لم يضروك إلا بشيء قد كتبه الله عليك</div><div style=\\"font-size:11px;color:#C8A951;margin-top:10px;direction:rtl;text-align:right;\\">رواه الترمذي عن ابن عباس رضي الله عنهما</div></div>'

import re
m = re.search(r'"title":"(IX\.[^"]*Epilogue[^"]*)"', c)
if m:
    title_val = m.group(1)
    print(f"Found: {title_val}")
    old = f'"title":"{title_val}","title_ar":"","content":"'
    new = f'"title":"{title_val}","title_ar":"","opening_box":"{hadith_box}","content":"'
    if old in c:
        open("data.js","w").write(c.replace(old, new, 1))
        print("Done")
    else:
        print("Pattern not found")
else:
    print("Epilogue not found")
