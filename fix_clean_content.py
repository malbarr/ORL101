c = open("data.js").read()

# Find the opening_box field end, then find content field start
# Remove the two extra Private Practice divs from content fields

import re

# The content field for Pillar 2 starts after opening_box field
# Find all occurrences and remove those inside "content" fields (not opening_box)

# Strategy: find opening_box value boundaries, then remove PP divs outside those boundaries
ob_start = c.find('"opening_box"')
ob_end = c.find(',"content":', ob_start)

print(f"opening_box: {ob_start} to {ob_end}")
print(f"PP occurrences: {[m.start() for m in re.finditer('Private Practice', c)]}")

# The content field starts at ob_end
content_start = ob_end + len(',"content":"')
print(f"content starts at: {content_start}")
print(f"content preview: {repr(c[content_start:content_start+200])}")

# Find the div that contains Private Practice in the content
div_pattern = r'<div style=\\"background:var\(--card-bg\)[^"]*Private Practice[^"]*</div>'
matches = list(re.finditer(div_pattern, c[content_start:]))
print(f"Found {len(matches)} divs to remove in content")
for m in matches:
    print(repr(m.group()[:80]))
