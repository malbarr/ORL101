c = open("webapp.js").read()
old = "const subtopics = Promise.resolve((ORL_DATA.subtopics||[]).filter(s=>s.chapter_id==ch.id));"
new = "const subtopics = (ORL_DATA.subtopics||[]).filter(s=>s.chapter_id==ch.id);"
if old in c:
    open("webapp.js","w").write(c.replace(old,new))
    print("Fixed")
else:
    print("Not found")
