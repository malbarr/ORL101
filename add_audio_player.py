c = open("webapp.js").read()

audio_player = '''
const AudioPlayer = {
  points: [],
  index: 0,
  playing: false,
  utterance: null,

  init(pts, title) {
    this.stop();
    this.points = pts;
    this.index = 0;
    this.playing = false;
    const display = document.getElementById('audio-point-display');
    const progress = document.getElementById('audio-progress');
    if (display) display.textContent = 'Press Play to start listening...';
    if (progress) progress.textContent = `0 / ${pts.length} points`;
  },

  parsePoint(pt) {
    // If has colon -> Q: before, A: after
    const colonIdx = pt.indexOf(':');
    if (colonIdx > 0 && colonIdx < pt.length - 1) {
      const q = pt.substring(0, colonIdx).trim();
      const a = pt.substring(colonIdx + 1).trim();
      return { q, a };
    }
    return { q: null, a: pt };
  },

  speak(text, onEnd) {
    if (!('speechSynthesis' in window)) {
      onEnd && onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US';
    utt.rate = 0.9;
    utt.onend = onEnd;
    this.utterance = utt;
    window.speechSynthesis.speak(utt);
  },

  readPoint() {
    if (!this.playing || this.index >= this.points.length) {
      this.playing = false;
      const btn = document.getElementById('audio-play-btn');
      if (btn) btn.textContent = '▶ Play';
      const display = document.getElementById('audio-point-display');
      if (display && this.index >= this.points.length) display.textContent = '✅ Done!';
      return;
    }
    const pt = this.points[this.index];
    const { q, a } = this.parsePoint(pt);
    const display = document.getElementById('audio-point-display');
    const progress = document.getElementById('audio-progress');
    if (display) display.textContent = pt;
    if (progress) progress.textContent = `${this.index + 1} / ${this.points.length}`;

    if (q) {
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
    }
  },

  toggle() {
    const btn = document.getElementById('audio-play-btn');
    if (this.playing) {
      this.playing = false;
      window.speechSynthesis.pause();
      if (btn) btn.textContent = '▶ Resume';
    } else {
      this.playing = true;
      if (btn) btn.textContent = '⏸ Pause';
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        this.readPoint();
      }
    }
  },

  next() {
    window.speechSynthesis.cancel();
    this.index++;
    if (this.playing) this.readPoint();
    else {
      const pt = this.points[this.index] || '';
      const display = document.getElementById('audio-point-display');
      const progress = document.getElementById('audio-progress');
      if (display) display.textContent = pt;
      if (progress) progress.textContent = `${this.index + 1} / ${this.points.length}`;
    }
  },

  stop() {
    this.playing = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    const btn = document.getElementById('audio-play-btn');
    if (btn) btn.textContent = '▶ Play';
    this.index = 0;
  }
};
'''

# Add before const Course =
old = 'const Course = {'
new = audio_player + '\nconst Course = {'

if old in c:
    open("webapp.js","w").write(c.replace(old, new, 1))
    print("AudioPlayer added")
else:
    print("Not found")
