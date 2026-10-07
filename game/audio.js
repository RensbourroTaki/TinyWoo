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
    this.muted = false;         // Hauptschalter (Lautsprecher-Button der Seite), unabhaengig von SFX/MUSIC
    this.master = null;         // GainNode vor dem Ausgang
    this.lastPlay = new Map();  // Name -> Zeit, verhindert Knattern bei vielen Treffern pro Frame
  }

  /**
   * Direkt im Event-Handler einer Nutzergeste aufrufen (pointerup/keydown/click), nicht spaeter im Frame:
   * iOS Safari und Android starten Audio nur synchron in der Geste. Darf beliebig oft aufgerufen werden.
   */
  unlock() {
    if (!this.ctx) {
      // iOS: Ton auch bei Lautlos-Schalter (Safari 16.4+), muss vor dem Anlegen des Contexts stehen
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* egal */ }
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { return; }
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
      this.loadSounds();
    }
    if (this.ctx.state !== 'running') { try { this.ctx.resume().catch(() => {}); } catch (e) { /* egal */ } }
    if (!this.unlocked) {
      this.unlocked = true;
      if (this.pendingMusic) this.playMusic(this.pendingMusic);
    }
  }

  loadSounds() {
    for (const [name, path] of Object.entries(SOUNDS)) {
      fetch(this.base + path)
        .then((r) => r.arrayBuffer())
        .then((data) => new Promise((ok, fail) => this.ctx.decodeAudioData(data, ok, fail)))   // Callback-Form: altes Safari
        .then((buf) => { this.buffers[name] = buf; })
        .catch(() => { /* Sound fehlt: still */ });
    }
  }

  setMuted(on) {
    this.muted = !!on;
    if (this.master) this.master.gain.value = this.muted ? 0 : 1;
    if (this.music) this.music.muted = this.muted;
  }

  play(name, gain = 1, rate = 1) {
    if (this.muted || !this.sfxOn || !this.ctx || !this.buffers[name]) return;
    const now = this.ctx.currentTime;
    const last = this.lastPlay.get(name) || -1;
    if (now - last < 0.03) return;
    this.lastPlay.set(name, now);
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffers[name];
    src.playbackRate.value = rate;
    const g = this.ctx.createGain();
    g.gain.value = gain * this.volume;
    src.connect(g).connect(this.master);
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
    a.muted = this.muted;
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
