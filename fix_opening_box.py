c = open("webapp.js").read()

old = "        contentEl.innerHTML = quickBtn + renderWikiContent(data.content || '');"

new = """        const openingBox = data.opening_box ? data.opening_box : '';
        contentEl.innerHTML = quickBtn + openingBox + renderWikiContent(data.content || '');"""

if old in c:
    open("webapp.js","w").write(c.replace(old, new))
    print("Fixed")
else:
    print("Not found")
