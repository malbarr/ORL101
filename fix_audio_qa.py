c = open("webapp.js").read()

old = '''const AudioPlayer = {
  points: [],
  index: 0,
  playing: false,
  utterance: null,'''

new = '''const AudioPlayer = {
  points: [],
  index: 0,
  playing: false,
  utterance: null,

  openers: [
    "Do you know...",
    "Can you remember...",
    "Test yourself:",
    "Quick question:",
    "What do we say about...",
    "Don't forget:",
    "Here is one for you:",
    "Can you answer this?"
  ],

  getOpener() {
    return this.openers[Math.floor(Math.random() * this.openers.length)];
  },'''

old2 = '''  parsePoint(pt) {
    // If has colon -> Q: before, A: after
    const colonIdx = pt.indexOf(':');
    if (colonIdx > 0 && colonIdx < pt.length - 1) {
      const q = pt.substring(0, colonIdx).trim();
      const a = pt.substring(colonIdx + 1).trim();
      return { q, a };
    }
    return { q: null, a: pt };
  },'''

new2 = '''  parsePoint(pt) {
    const colonIdx = pt.indexOf(':');
    if (colonIdx > 0 && colonIdx < pt.length - 1) {
      const q = pt.substring(0, colonIdx).trim();
      const a = pt.substring(colonIdx + 1).trim();
      return { q, a };
    }
    const eqIdx = pt.indexOf('=');
    if (eqIdx > 0) {
      const q = pt.substring(0, eqIdx).trim();
      const a = pt.substring(eqIdx + 1).trim();
      return { q, a };
    }
    return { q: null, a: pt };
  },'''

old3 = '''    if (q) {
      this.speak(q, () => {
        if (!this.playing) return;
        setTimeout(() => {
          if (!this.playing) return;
          this.speak(a, () => {
            if (!this.playing) return;
            setTimeout(() => { this.index++; this.readPoint(); }, 1500);
          });
        }, 2000);
      });
    } else {
      this.speak(a, () => {
        if (!this.playing) return;
        setTimeout(() => { this.index++; this.readPoint(); }, 1500);
      });
    }'''

new3 = '''    if (q) {
      const opener = this.getOpener();
      if (display) display.innerHTML = `<div style="color:var(--teal);font-size:12px;margin-bottom:6px;">${opener}</div><div style="font-weight:600;">${q}</div><div style="color:var(--text-hint);font-size:12px;margin-top:8px;font-style:italic;">Think about it...</div>`;
      this.speak(opener + ' ' + q, () => {
        if (!this.playing) return;
        setTimeout(() => {
          if (!this.playing) return;
          if (display) display.innerHTML = `<div style="color:#C8A951;font-size:12px;margin-bottom:6px;">Answer:</div><div>${a}</div>`;
          this.speak('The answer is. ' + a, () => {
            if (!this.playing) return;
            setTimeout(() => { this.index++; this.readPoint(); }, 1800);
          });
        }, 2500);
      });
    } else {
      this.speak(pt, () => {
        if (!this.playing) return;
        setTimeout(() => { this.index++; this.readPoint(); }, 1500);
      });
    }'''

if old in c and old2 in c and old3 in c:
    c = c.replace(old, new, 1).replace(old2, new2, 1).replace(old3, new3, 1)
    open("webapp.js","w").write(c)
    print("Fixed")
else:
    print(f"old1:{old in c} old2:{old2 in c} old3:{old3 in c}")
