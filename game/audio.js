// Soundeffekte (WAV ueber WebAudio) und Musik (<audio>, OGG/MP3). Alles optional und abschaltbar.
// Die WAVs stammen aus dem Pocket-PC-Projekt (data/sounds), Zuordnung wie dort in gamevars.txt.
// Musik laeuft ebenfalls durch WebAudio (MediaElementSource -> Track-Gain -> Musik-Bus -> Master), weil iOS
// audio.volume ignoriert: nur so funktionieren Blenden und Lautstaerkeregler ueberall.

/**
 * Musik: max = Pegel bei Regler 10 (Kurve quadratisch, 7 ~ 0.4), Blendzeiten in Sekunden:
 * fadeIn aus der Stille, cross = Wechsel zwischen zwei Tracks, fadeOut = Spielstart, off = Regler auf OFF.
 */
export const MUSIC = { max: 0.8, fadeIn: 2.0, cross: 1.0, fadeOut: 2.0, off: 0.4 };

export const SOUNDS = {
  brick: 'sounds/brick.wav',        // Steintreffer (Ding)
  paddle: 'sounds/paddle.wav',      // Schlaeger (Dong)
  wall: 'sounds/wall.wav',          // Bande (Dong3)
  doorOpen: 'sounds/door-open.wav',
  doorClose: 'sounds/door-close.wav',
  phaser: 'sounds/phaser.wav',      // Phaser-Start / Ball verloren
  beep: 'sounds/beep.wav',          // Text-Beep / naechste Runde
  explosion_ball: 'sounds/explosion_ball.wav',       // Pixel-Zerfall (view.js blast)
  explosion_paddle: 'sounds/explosion_paddle.wav',
  explosion_enemy: 'sounds/explosion_enemy.wav',
  paddleSpawn: 'sounds/PaddleSpawn.wav',             // Schlaeger erscheint (Beam bei Levelstart / Respawn)
};

export class GameAudio {
  constructor(base) {
    this.base = base;
    this.ctx = null;
    this.buffers = {};
    this.sfxOn = true;
    this.musicLevel = 7;        // Regler 0 (OFF) .. 10
    this.volume = 0.8;
    this.tracks = new Map();    // Pfad -> { el, gain, timer, rewind }
    this.musicBus = null;       // GainNode mit dem Reglerpegel
    this.current = '';          // Track, der gerade laeuft bzw. einblendet ('' = Stille)
    this.pendingMusic = '';     // gewuenschter Track (auch vor dem Entsperren / bei Regler OFF)
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
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.levelGain();
      this.musicBus.connect(this.master);
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
    for (const tr of this.tracks.values()) if (!tr.gain) tr.el.muted = this.muted;
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

  levelGain() {
    const k = Math.max(0, Math.min(10, this.musicLevel)) / 10;
    return MUSIC.max * k * k;
  }

  /** Track-Objekt zum Pfad (einmal angelegt, danach wiederverwendet; Position bleibt beim Pausieren erhalten). */
  track(src) {
    let tr = this.tracks.get(src);
    if (tr) return tr;
    const el = new Audio(src);
    el.loop = true;
    el.preload = 'auto';
    let gain = null;
    try {
      gain = this.ctx.createGain();
      gain.gain.value = 0;
      this.ctx.createMediaElementSource(el).connect(gain).connect(this.musicBus);
    } catch (e) {
      gain = null;   // ohne WebAudio: feste Lautstaerke, harte Wechsel
      el.volume = this.levelGain();
      el.muted = this.muted;
    }
    tr = { el, gain, timer: 0, rewind: false };
    this.tracks.set(src, tr);
    return tr;
  }

  /** Track auf Pegel 0..1 blenden; bei 0 danach pausieren (rewind: zurueck an den Anfang). */
  fadeTrack(tr, target, secs) {
    clearTimeout(tr.timer);
    if (tr.gain) {
      const p = tr.gain.gain, now = this.ctx.currentTime;
      p.cancelScheduledValues(now);
      p.setValueAtTime(p.value, now);
      p.linearRampToValueAtTime(target, now + secs);
    } else {
      secs = 0;
    }
    if (target > 0) return;
    tr.timer = setTimeout(() => { tr.el.pause(); if (tr.rewind) tr.el.currentTime = 0; }, secs * 1000 + 50);
  }

  /**
   * Musik abspielen (Pfad relativ zur Seite, leer = Stille). Laeuft in Schleife; ein anderer Track wird
   * ueberblendet und behaelt seine Position (Menue <-> Highscore laufen dort weiter, wo sie waren).
   */
  playMusic(src) {
    this.pendingMusic = src;
    if (!this.unlocked || !this.ctx) return;
    const secs = this.current ? MUSIC.cross : MUSIC.fadeIn;
    for (const [s, tr] of this.tracks) if (s !== src) { tr.rewind = false; this.fadeTrack(tr, 0, secs); }
    if (!src || this.musicLevel <= 0) { this.current = ''; return; }
    const tr = this.track(src);
    clearTimeout(tr.timer);
    if (tr.el.paused) tr.el.play().catch(() => {});
    this.fadeTrack(tr, 1, secs);
    this.current = src;
  }

  /** Alles ausblenden (Spielstart); die Tracks beginnen danach wieder von vorn. */
  fadeOutMusic(secs = MUSIC.fadeOut) {
    this.pendingMusic = '';
    this.current = '';
    for (const tr of this.tracks.values()) {
      tr.rewind = true;
      if (!tr.el.paused) this.fadeTrack(tr, 0, secs);
      else tr.el.currentTime = 0;
    }
  }

  stopMusic() {
    for (const tr of this.tracks.values()) { clearTimeout(tr.timer); tr.el.pause(); }
    this.current = '';
  }

  /** Lautstaerkeregler 0 (OFF) .. 10, wirkt sofort. */
  setMusicLevel(v) {
    this.musicLevel = v;
    if (this.musicBus) this.musicBus.gain.setTargetAtTime(this.levelGain(), this.ctx.currentTime, 0.05);
    for (const tr of this.tracks.values()) if (!tr.gain) tr.el.volume = this.levelGain();
    if (v <= 0) {
      for (const tr of this.tracks.values()) { tr.rewind = false; this.fadeTrack(tr, 0, MUSIC.off); }
      this.current = '';
    } else if (!this.current && this.pendingMusic) {
      this.playMusic(this.pendingMusic);
    }
  }

  /** Tab im Hintergrund: Musik anhalten, beim Zurueckkommen weiter. */
  setHidden(hidden) {
    for (const tr of this.tracks.values()) {
      if (hidden) { tr.wasPlaying = !tr.el.paused; if (tr.wasPlaying) tr.el.pause(); }
      else if (tr.wasPlaying) {
        tr.wasPlaying = false;
        if (this.tracks.get(this.current) === tr) tr.el.play().catch(() => {});   // ausgeblendete bleiben aus
      }
    }
  }

  /** Spielt gerade ein anderes <audio> der Seite (z. B. der Site-Player)? Dann keine eigene Musik aufdraengen. */
  static siteAudioPlaying() {
    for (const a of document.querySelectorAll('audio')) {
      if (!a.paused && !a.ended && a.currentTime > 0) return true;
    }
    return false;
  }
}
