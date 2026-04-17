c = open("webapp.js").read()

old = "apiFetch('/api/chat', {"
i = c.index(old)
# Find the block end: from "try {" to "this._addMessage(res.answer"
start = c.rindex("try {", 0, i)
end = c.index("this._addMessage(res.answer, 'ai');", i) + len("this._addMessage(res.answer, 'ai');")

new_code = """try {
      const q=question.toLowerCase();
      const hits=[];
      (ORL_DATA.chapters||[]).forEach(ch=>{
        if((ch.title||'').toLowerCase().includes(q)) hits.push('Ch.'+ch.number+': '+ch.title);
      });
      (ORL_DATA.high_yield||[]).forEach(hy=>{
        (hy.points||[]).forEach(pt=>{ if(pt.toLowerCase().includes(q)) hits.push('• '+pt); });
      });
      document.getElementById(typingId)?.remove();
      const ans=hits.length?hits.slice(0,6).join('\\n'):'No results for: '+question;
      this._addMessage(ans,'ai');"""

c = c[:start] + new_code + c[end:]
open("webapp.js","w").write(c)
print("Done")
