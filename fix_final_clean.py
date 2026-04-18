c = open("data.js").read()

# Content for Introduction starts at 915454 and begins with <div (opening box HTML)
# We need to find where this div ends and the real content begins
content_start = 915454
# Find the end of the HTML div block - look for \n\n after closing div
import re
# The HTML was added as: box_html + \n\n + real_content
# Find \\n\\n after the first big div block
end_of_html = c.find('\\\\n\\\\n', content_start)
if end_of_html == -1:
    end_of_html = c.find('\\n\\n', content_start + 500)
print(f"HTML ends at: {end_of_html}")
print(f"Preview before: {repr(c[end_of_html-50:end_of_html+100])}")

# Also fix Pillar 2 - positions 938407 and 939417 are duplicates
# Find the content field for Pillar 2
p2_pos = c.find('"opening_box"', 913370)  # find second opening_box
print(f"Second opening_box at: {p2_pos}")
p2_content_start = c.find(',"content":"', p2_pos) + len(',"content":"')
print(f"Pillar 2 content starts at: {p2_content_start}")
print(f"Preview: {repr(c[p2_content_start:p2_content_start+100])}")
