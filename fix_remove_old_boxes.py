import re
c = open("data.js").read()

# Remove HTML injected into Introduction content by add_opening_boxes.py
# It starts with <div style= and ends before the actual content
c = re.sub(r'("chapter_id":1,"title":"Introduction","title_ar":"","content":")<div style=\\"background[^<]*(?:<[^>]*>[^<]*)*</div>\\\\n\\\\n', r'\1', c)

# Remove HTML injected into Pillar 2 content  
c = re.sub(r'("Pillar 2[^"]*","title_ar":"","opening_box":"[^"]*","content":")<div style=\\"background[^<]*(?:<[^>]*>[^<]*)*</div>\\\\n\\\\n', r'\1', c)

open("data.js","w").write(c)
print("Done - checking counts:")
print("Private Practice in content:", c.count('<div style=\\"background:var(--card-bg)'))
print("opening_box count:", c.count("opening_box"))
