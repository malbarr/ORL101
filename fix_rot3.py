lines = open("webapp.js").readlines()

new_line = "    var h='<button onclick=\"Rotation.shareItem()\" style=\"margin-bottom:16px;padding:12px;background:#2d6a4f;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;width:100%;cursor:pointer;\">Share / Copy All</button>';(item.items||[]).forEach(function(s){var lns=s.content.split('\\n');var body=lns.map(function(l){if(!l){return '<div style=\"height:8px\"></div>';}return '<div style=\"padding:5px 0;font-size:14px;line-height:1.7;color:var(--text)\">'+l+'</div>';}).join('');h+='<div style=\"margin-bottom:20px;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)\"><div style=\"background:#2d6a4f;color:#fff;padding:12px 16px;font-weight:700;font-size:15px\">'+s.subtitle+'</div><div style=\"padding:14px 16px;background:#fff;border:1px solid #c8e6c9;border-top:none\">'+body+'</div></div>';});document.getElementById('rot-content-body').innerHTML=h;Rotation._currentItem=item;\n"

lines[2076] = new_line
open("webapp.js", "w").writelines(lines)
print("Done")
