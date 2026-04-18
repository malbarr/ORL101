c = open("data.js").read()

# Fix 1: Introduction content starts at 915454 with HTML box
# The opening_box already has the Arabic box, so remove it from content
# Content: position 915454, remove from there to end of second div block
# Real content starts after \n\n following the closing div
intro_content_start = 915454
# Find end of HTML block - two consecutive \n after closing div
import re
segment = c[intro_content_start:intro_content_start+2000]
# Find pattern: end of last div then \n\n
m = re.search(r'</div>\\n</div>\\n\\n', segment)
if m:
    cut_at = intro_content_start + m.end()
    print(f"Cutting Introduction HTML at offset {m.end()}, preview after: {repr(c[cut_at:cut_at+80])}")
    c = c[:intro_content_start] + c[cut_at:]
    print("Introduction fixed")
else:
    print("Pattern not found in Introduction")
    print(repr(segment[:300]))

# Fix 2: Pillar 2 content - after the fix above, recalculate positions
p2_ob = c.find('"opening_box"', 910000)
p2_content_pos = c.find(',"content":"', p2_ob) + len(',"content":"')
print(f"Pillar 2 content now at: {p2_content_pos}")
print(f"Preview: {repr(c[p2_content_pos:p2_content_pos+100])}")
# Remove the HTML box from Pillar 2 content
segment2 = c[p2_content_pos:p2_content_pos+2000]
m2 = re.search(r'</div>\\n</div>\\n\\n', segment2)
if m2:
    cut_at2 = p2_content_pos + m2.end()
    print(f"Cutting Pillar 2 HTML, preview after: {repr(c[cut_at2:cut_at2+80])}")
    c = c[:p2_content_pos] + c[cut_at2:]
    print("Pillar 2 fixed")
else:
    print("Pattern not found in Pillar 2")
    print(repr(segment2[:300]))

open("data.js","w").write(c)
print(f"Done. PP count: {c.count('Private Practice')}, ob count: {c.count('opening_box')}")
