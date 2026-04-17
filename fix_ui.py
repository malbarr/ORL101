c = open("webapp.js").read()

old = """    let html = '<div class="ac-actions">';
    (card.steps||[]).forEach(a => {
      const cls='ac-action'; const txt=typeof a==='string'?a:(a.do||a.see||'');
      html += `<div class="${cls}">
        <div class="ac-see">${txt}</div>
        <div class="ac-arrow">→</div>
        <div class="ac-do"></div>
      </div>`;
    });
    html += '</div>';

    if (card.danger) {
      html += '<div class="ac-traps-box"><div class="ac-traps-title">🧪 Exam Traps</div>';
      [card.danger].forEach(t => {
        html += `<div class="ac-trap">⚡ ${t}</div>`;
      });
      html += '</div>';
    }"""

new = """    let html = '<div class="ac-snapshot">';
    html += '<div class="ac-snap-header"><div class="ac-snap-col-see">👁 IF YOU SEE...</div><div class="ac-snap-col-do">→ DO THIS</div></div>';
    const rows = card.rows || (card.steps||[]).map(s=>({see:'',do:typeof s==='string'?s:(s.do||s.see||''),urgent:false}));
    rows.forEach(r => {
      const urg = r.urgent ? 'ac-snap-row urgent' : 'ac-snap-row';
      const icon = r.urgent ? '🚨' : '👁';
      html += '<div class="'+urg+'"><div class="ac-snap-see">'+icon+' '+(r.see||'')+'</div><div class="ac-snap-do">'+(r.do||r.see||'')+'</div></div>';
    });
    html += '</div>';
    const traps = card.traps || (card.danger ? [card.danger] : []);
    if (traps.length) {
      html += '<div class="ac-traps-box"><div class="ac-traps-title">🧪 Exam Traps</div>';
      traps.forEach(t => { html += '<div class="ac-trap">⚡ '+t+'</div>'; });
      html += '</div>';
    }"""

if old in c:
    c = c.replace(old, new)
    open("webapp.js", "w").write(c)
    print("Done - UI updated to snapshot style")
else:
    print("NOT FOUND")
    i = c.find("ac-actions")
    print(repr(c[i-50:i+200]))
