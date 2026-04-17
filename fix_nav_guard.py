c = open("webapp.js").read()
old = "  item.addEventListener('click', () => showSection(item.dataset.section));"
new = "  item.addEventListener('click', function(){if(this.dataset.section) showSection(this.dataset.section);});"
if old in c:
    open("webapp.js","w").write(c.replace(old,new))
    print("Fixed")
else:
    print("Not found - checking...")
    i = c.find("addEventListener('click'")
    print(repr(c[i-2:i+80]))
