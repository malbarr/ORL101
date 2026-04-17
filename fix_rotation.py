c = open("webapp.js").read()

c = c.replace(
    '${item.desc}',
    '${(item.items||[]).length} sections'
)

old = "var h='';(item.items||[]).forEach(function(s){h+='<div class=\"rot-section\"><div class=\"rot-section-title\">'+s.subtitle+'</div><pre class=\"rot-content\">'+s.content+'</pre></div>';});document.getElementById('rot-content-body').innerHTML=h;"

new = "var h='';(item.items||[]).forEach(function(s){var lines=s.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').split('\\n');var body=lines.map(function(l){return l?'<div class=\"rot-line\">'+l+'</div>':'<div class=\"rot-gap\"></div>';}).join('');h+='<div class=\"rot-section\"><div class=\"rot-section-title\">'+s.subtitle+'</div><div class=\"rot-body\">'+body+'</div></div>';});document.getElementById('rot-content-body').innerHTML=h;"

c = c.replace(old, new)

open("webapp.js", "w").write(c)
print("Done")
