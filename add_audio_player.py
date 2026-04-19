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
  },

  parsePoint(pt) {
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
  },

  readPoint() {
    if (!this.playing || this.index >= this.points.length) {
      this.playing = false;
      const btn = document.getElementById('audio-play-btn');
      if (btn) btn.textContent = '▶ Play';
      const display = document.getElementById('audio-point-display');
      if (display && this.index >= this.points.length) display.textContent = '✅ Session complete!';
      return;
    }
    const pt = this.points[this.index];
    const { q, a } = this.parsePoint(pt);
    const display = document.getElementById('audio-point-display');
    const progress = document.getElementById('audio-progress');
    if (display) display.innerHTML = q
      ? `<div style="color:var(--teal);font-size:12px;margin-bottom:6px;">${this.getOpener()}</div><div style="font-weight:600;">${q}</div><div style="color:var(--text-hint);font-size:12px;margin-top:8px;">Answer coming...</div>`
      : `<div>${pt}</div>`;
    if (progress) progress.textContent = `${this.index + 1} / ${this.points.length}`;

    if (q) {
      const opener = this.getOpener();
      this.speak(opener + ' ' + q, () => {
        if (!this.playing) return;
        setTimeout(() => {
          if (!this.playing) return;
          if (display) display.innerHTML = `<div style="color:var(--teal);font-size:12px;margin-bottom:6px;">Answer:</div><div>${a}</div>`;
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
    }
  },
