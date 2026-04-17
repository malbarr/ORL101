c = open("webapp.js").read()

c = c.replace(
    '${item.desc}',
    '${(item.items||[]).length} sections'
)

old = "document.getElementById('rot-content-body').innerHTML = renderWikiContent(item.content || '');"
new = "var h='';(item.items||[]).forEach(function(s){h+='<div class=\"rot-section\"><div class=\"rot-section-title\">'+s.subtitle+'</div><pre class=\"rot-content\">'+s.content+'</pre></div>';});document.getElementById('rot-content-body').innerHTML=h;"
c = c.replace(old, new)

open("webapp.js", "w").write(c)
print("Done")
