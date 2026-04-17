c = open("webapp.js").read()

old = "document.getElementById('rot-content-body').innerHTML = renderWikiContent(item.content || '');"
new = (
    "var h='<button onclick=\"Rotation.shareItem()\" style=\"margin-bottom:16px;padding:10px 20px;"
    "background:var(--primary);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;"
    "width:100%;cursor:pointer;\">📤 Share / Copy</button>';"
    "(item.items||[]).forEach(function(s){"
    "var lines=s.content.split('\\n');"
    "var body=lines.map(function(l){"
    "if(!l)return '<div style=\"height:1px;background:#e8f4f0;margin:8px 0\"></div>';"
    "if(l.match(/^\\d+\\./))return '<div style=\"display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #e8f4f0\">"
    "<span style=\"color:#2d6a4f;font-weight:800;min-width:22px;font-size:15px\">'+(l.match(/^(\\d+)/)||['',''])[1]+'.</span>"
    "<span style=\"flex:1;font-size:14px;line-height:1.7;color:var(--text)\">'+l.replace(/^\\d+\\.\\s*/,'')+'</span></div>';"
    "if(l.startsWith('Tip:'))return '<div style=\"margin-top:8px;padding:8px 12px;background:#f0faf5;"
    "border-left:3px solid #2d6a4f;border-radius:4px;font-size:13px;color:#2d6a4f;font-style:italic\">💡 '+l+'</div>';"
    "return '<div style=\"padding:5px 0;font-size:14px;line-height:1.7;color:var(--text)\">'+l+'</div>';"
    "}).join('');"
    "h+='<div style=\"margin-bottom:20px;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)\">"
    "<div style=\"background:#2d6a4f;color:#fff;padding:12px 16px;font-weight:700;font-size:15px;letter-spacing:.3px\">'+s.subtitle+'</div>"
    "<div style=\"padding:14px 16px;background:#fff;border:1px solid #d4edda;border-top:none\">'+body+'</div>"
    "</div>';"
    "});"
    "document.getElementById('rot-content-body').innerHTML=h;"
    "Rotation._currentItem=item;"
)

c = c.replace(old, new)

old2 = "  backToList() {"
new2 = (
    "  shareItem() {\n"
    "    const item = Rotation._currentItem;\n"
    "    if (!item) return;\n"
    "    var text = item.icon+' '+item.title+'\\n\\n';\n"
    "    (item.items||[]).forEach(function(s){ text += '--- '+s.subtitle+' ---\\n'+s.content+'\\n\\n'; });\n"
    "    if (navigator.share) { navigator.share({title: item.title, text: text}); }\n"
    "    else { navigator.clipboard.writeText(text).then(function(){ alert('Copied!'); }); }\n"
    "  },\n"
    "  backToList() {"
)
c = c.replace(old2, new2)

open("webapp.js", "w").write(c)
print("Done")
