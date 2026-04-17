import re, json

c = open("data.js").read()
i = c.index('"high_yield":[')
k = i + len('"high_yield":[')

# Find matching closing bracket by counting depth
depth = 1
pos = k
while pos < len(c) and depth > 0:
    if c[pos] == '[':
        depth += 1
    elif c[pos] == ']':
        depth -= 1
    pos += 1
j = pos - 1

seg = c[k:j]
items = json.loads("[" + seg + "]")
items.sort(key=lambda x: int(x["chapter_id"]))
new_seg = json.dumps(items, ensure_ascii=False)[1:-1]
c = c[:k] + new_seg + c[j:]
open("data.js", "w").write(c)
print("Order:", [x["chapter_id"] for x in items])
