// Soundeffekte (WAV ueber WebAudio) und Musik (<audio>, OGG/MP3). Alles optional und abschaltbar.
// Die WAVs stammen aus dem Pocket-PC-Projekt (data/sounds), Zuordnung wie dort in gamevars.txt.

export const SOUNDS = {
  brick: 'sounds/brick.wav',        // Steintreffer (Ding)
  paddle: 'sounds/paddle.wav',      // Schlaeger (Dong)
  wall: 'sounds/wall.wav',          // Bande (Dong3)
  doorOpen: 'sounds/door-open.wav',
  doorClose: 'sounds/door-close.wav',
  phaser: 'sounds/phaser.wav',      // Phaser-Start / Ball verloren
  beep: 'sounds/beep.wav',          // Text-Beep / naechste Runde
};

export class GameAudio {
  constructor(base) {
    this.base = base;
    this.ctx = null;
    this.buffers = {};
    this.sfxOn = true;
    this.musicOn = true;
    this.volume = 0.8;
    this.music = null;          // HTMLAudioElement
    this.musicSrc = '';
    this.pendingMusic = '';
    this.unlocked = false;
    this.lastPlay = new Map();  // Name -> Zeit, verhindert Knattern bei vielen Treffern pro Frame
  }

  /** Beim ersten Nutzer-Klick aufrufen (Autoplay-Regeln). */
  async unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      await this.ctx.resume();
      const jobs = Object.entries(SOUNDS).map(async ([name, path]) => {
        try {
          const r = await fetch(this.base + path);
          const data = await r.arrayBuffer();
          this.buffers[name] = await this.ctx.decodeAudioData(data);
        } catch (e) { /* Sound fehlt: still */ }
      });
      await Promise.all(jobs);
    } catch (e) {
      this.ctx = null;
    }
    if (this.pendingMusic) this.playMusic(this.pendingMusic);
  }

  play(name, gain = 1, rate = 1) {
    if (!this.sfxOn || !this.ctx || !this.buffers[name]) return;
    const now = this.ctx.currentTime;
    const last = this.lastPlay.get(name) || -1;
    if (now - last < 0.03) return;
    this.lastPlay.set(name, now);
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffers[name];
    src.playbackRate.value = rate;
    const g = this.ctx.createGain();
    g.gain.value = gain * this.volume;
    src.connect(g).connect(this.ctx.destination);
    src.start();
  }

  /** Musik abspielen (Pfad relativ zur Seite, leer = aus). Laeuft in Schleife. */
  playMusic(src) {
    this.pendingMusic = src;
    if (!this.unlocked) return;
    if (!this.musicOn || !src) { this.stopMusic(); return; }
    if (this.music && this.musicSrc === src) { if (this.music.paused) this.music.play().catch(() => {}); return; }
    this.stopMusic();
    const a = new Audio(src);
    a.loop = true;
    a.volume = 0.5 * this.volume;
    a.play().catch(() => {});
    this.music = a;
    this.musicSrc = src;
  }

  stopMusic() {
    if (this.music) { this.music.pause(); this.music.src = ''; this.music = null; this.musicSrc = ''; }
  }

  setMusicOn(on) {
    this.musicOn = on;
    if (!on) this.stopMusic(); else if (this.pendingMusic) this.playMusic(this.pendingMusic);
  }

  /** Spielt gerade ein anderes <audio> der Seite (z. B. der Site-Player)? Dann keine eigene Musik aufdraengen. */
  static siteAudioPlaying() {
    for (const a of document.querySelectorAll('audio')) {
      if (!a.paused && !a.ended && a.currentTime > 0) return true;
    }
    return false;
  }
}
