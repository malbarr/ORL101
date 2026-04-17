c = open("webapp.js").read()

# Fix desc
c = c.replace(
    '${item.desc}',
    '${(item.items||[]).length} sections'
)

# Replace the entire openItem body with clean renderer + share button
old = "document.getElementById('rot-content-body').innerHTML = renderWikiContent(item.content || '');"
new = (
    "var h='<button onclick=\"Rotation.shareItem()\" style=\"margin-bottom:16px;padding:10px 20px;"
    "background:var(--primary);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;"
    "width:100%;cursor:pointer;\">📤 Share / Copy</button>';"
    "(item.items||[]).forEach(function(s){"
    "var lines=s.content.split('\\n');"
    "var body=lines.map(function(l){"
    "if(!l)return '<div style=\"height:8px\"></div>';"
    "if(l.match(/^\\d+\\./))return '<div style=\"display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)\">"
    "<span style=\"color:var(--primary);font-weight:700;min-width:20px\">'+(l.match(/^(\\d+)/)||['',''])[1]+'.</span>"
    "<span style=\"flex:1;font-size:14px;line-height:1.6\">'+l.replace(/^\\d+\\.\\s*/,'')+'</span></div>';"
    "return '<div style=\"padding:5px 0;font-size:14px;line-height:1.6;color:var(--text)\">'+l+'</div>';"
    "}).join('');"
    "h+='<div style=\"margin-bottom:16px;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)\">"
    "<div style=\"background:#2d6a4f;color:#fff;padding:10px 14px;font-weight:700;font-size:14px\">'+s.subtitle+'</div>"
    "<div style=\"padding:12px 14px;background:var(--bg);border:1px solid var(--border);border-top:none\">'+body+'</div>"
    "</div>';"
    "});"
    "document.getElementById('rot-content-body').innerHTML=h;"
    "Rotation._currentItem=item;"
)

c = c.replace(old, new)

# Add shareItem method before backToList
old2 = "  backToList() {"
new2 = (
    "  shareItem() {\n"
    "    const item = Rotation._currentItem;\n"
    "    if (!item) return;\n"
    "    var text = item.icon+' '+item.title+'\\n\\n';\n"
    "    (item.items||[]).forEach(function(s){ text += '--- '+s.subtitle+' ---\\n'+s.content+'\\n\\n'; });\n"
    "    if (navigator.share) { navigator.share({title: item.title, text: text}); }\n"
    "    else { navigator.clipboard.writeText(text).then(function(){ alert('Copied to clipboard!'); }); }\n"
    "  },\n"
    "  backToList() {"
)

c = c.replace(old2, new2)

open("webapp.js", "w").write(c)
print("Done")
