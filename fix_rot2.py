c = open("webapp.js").read()

# Find and replace the innerHTML line by line number approach
target = "document.getElementById('rot-content-body').innerHTML=h;"
new_render = """var h='<button onclick="Rotation.shareItem()" style="margin-bottom:16px;padding:12px;background:#2d6a4f;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;width:100%;cursor:pointer;">📤 Share / Copy All</button>';(item.items||[]).forEach(function(s){var lines=s.content.split('\\n');var body=lines.map(function(l){if(!l)return '<div style="height:1px;background:#e8f4f0;margin:10px 0"></div>';if(l.match(/^\\d+\\./))return '<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #eaf4ef"><span style="color:#2d6a4f;font-weight:800;min-width:22px">'+l.match(/^(\\d+)/)[1]+'.</span><span style="flex:1;font-size:14px;line-height:1.7">'+l.replace(/^\\d+\\.\\s*/,'')+'</span></div>';if(l.startsWith('Tip:'))return '<div style="margin-top:10px;padding:10px 12px;background:#f0faf5;border-left:4px solid #2d6a4f;border-radius:6px;font-size:13px;color:#2d6a4f">💡 '+l+'</div>';return '<div style="padding:5px 0;font-size:14px;line-height:1.7;color:var(--text)">'+l+'</div>';}).join('');h+='<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)"><div style="background:#2d6a4f;color:#fff;padding:12px 16px;font-weight:700;font-size:15px;letter-spacing:.3px">'+s.subtitle+'</div><div style="padding:14px 16px;background:#fff;border:1px solid #c8e6c9;border-top:none">'+body+'</div></div>';});document.getElementById('rot-content-body').innerHTML=h;Rotation._currentItem=item;"""

c = c.replace(target, new_render)

# Add shareItem if not present
if 'shareItem()' not in c:
    old2 = "  backToList() {"
    new2 = """  shareItem() {
    const item = Rotation._currentItem;
    if (!item) return;
    var text = item.icon+' '+item.title+'\\n\\n';
    (item.items||[]).forEach(function(s){ text += '--- '+s.subtitle+' ---\\n'+s.content+'\\n\\n'; });
    if (navigator.share) { navigator.share({title: item.title, text: text}); }
    else { navigator.clipboard.writeText(text).then(function(){ alert('Copied to clipboard!'); }); }
  },
  backToList() {"""
    c = c.replace(old2, new2)

open("webapp.js", "w").write(c)
print("Done. target found:", target in open("webapp.js").read())
