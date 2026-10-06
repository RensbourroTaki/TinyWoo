// Zustandsmaschine des Spiels: Laden -> Intro (Logo, Board, Lichter, Menue) -> Menue / Optionen /
// Highscore / Credits -> Spiel -> Game Over. Zeichnet auf ein Canvas mit Geraete-Skalierung S
// (240x334 Art-Pixel, 1 Art-Pixel = S Geraete-Pixel, Scanlines jede S-te Zeile).
// Alle Texte im Spiel benutzen die Drehschrift (SpinFont); die Konsolenschrift bleibt geladen, wird aber nicht benutzt.
import { loadAssets, roundBackground } from './render/assets.js';
import { ConsoleFont, SpinFont } from './render/font.js';
import { ART_H, ART_W, Board, boardState, flickerPhaser } from './render/board.js';
import { GameView } from './render/view.js';
import { SpinText } from './render/spintext.js';
import { LogoFx } from './render/logo.js';
import { GameSession, Phase } from './play/session.js';
import { ROUNDS } from './play/levels.js';
import { GameInput } from './input.js';
import { GameAudio } from './audio.js';

export const SCORES_KEY = 'tw-daiganoid-scores';
export const OPTIONS_KEY = 'tw-daiganoid-options';
const FRAME = 1 / 60;
const MENU = ['START GAME', 'HIGHSCORE', 'OPTIONS', 'CREDITS'];
const MENU_Y = [116, 142, 168, 194];   // Zeilen fuer die Menueschrift (3/4 Groesse bei 4x)
const CREDITS = ['DAIGANOID', 'A TINY WOO GAME', '', 'GRAPHICS SOUND', 'AND DESIGN', 'TINY WOO', '', 'BALL PHYSICS FROM', 'ARKANOID 2 1987', '', 'PRESS FIRE'];

export function loadScores() {
  try { const v = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; }
}

export function saveScore(entry) {
  const list = [...loadScores(), entry].sort((a, b) => b.score - a.score).slice(0, 10);
  try { localStorage.setItem(SCORES_KEY, JSON.stringify(list)); } catch (e) { /* privat */ }
  return list;
}

function loadOptions() {
  const d = { sfx: true, music: true, scanlines: true, sens: 5, lock: true };
  try { return Object.assign(d, JSON.parse(localStorage.getItem(OPTIONS_KEY) || '{}')); } catch (e) { return d; }
}

export class DaiganoidApp {
  /**
   * @param canvas HTMLCanvasElement
   * @param opts { assetBase, musicMenu, musicGame, teaser, hooks: { onHud, onGameOver, onState, onClick } }
   */
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.opts = opts;
    this.hooks = opts.hooks || {};
    this.teaser = !!opts.teaser;
    this.S = 2;
    this.state = 'loading';
    this.progress = 0;
    this.t = 0;                 // Frames im aktuellen Zustand
    this.acc = 0;
    this.last = 0;
    this.raf = 0;
    this.running = false;
    this.options = loadOptions();
    this.menuIndex = 0;
    this.optIndex = 0;
    this.session = null;
    this.view = null;
    this.menuTexts = [];        // Drehschrift-Eintraege des aktuellen Bildschirms
    this.header = null;         // Ueberschrift (Drehschrift)
    this.pendingState = null;   // Zielzustand nach dem Ausfliegen der Eintraege
    this.pendingTimer = 0;
    this.menuAlpha = 0;
    this.boardAlpha = 0;
    this.bs = boardState();
    this.lightTimer = 0;
    this.paused = false;
    this.hi = Math.max(0, ...loadScores().map((s) => s.score));
    this.scanPattern = null;
    this.logoY = -80;
    this.menuZoom = 0.75;       // Menueschrift: (S - 1) Geraetepixel je Font-Pixel, mindestens 1
    this.onVisibility = () => { if (document.hidden && this.state === 'game') this.pause(true); };
  }

  async init() {
    const base = this.opts.assetBase || 'assets/daiganoid/';
    this.audio = new GameAudio(base);
    this.audio.sfxOn = this.options.sfx;
    this.audio.musicOn = this.options.music;
    this.assets = await loadAssets(base, (p) => { this.progress = p; });
    this.fonts = {
      spin: new SpinFont(this.assets.img.fontSpin, this.assets.fonts.spin),
      console: new ConsoleFont(this.assets.img.fontConsole, this.assets.fonts.console),
    };
    this.board = new Board(this.assets);
    this.board.build(this.S, 0);
    this.logo = this.assets.img.logo ? new LogoFx(this.assets.img.logo) : null;
    if (!this.teaser) {
      this.input = new GameInput(this.canvas, () => this.S);
      this.input.toLogicX = (artX) => 16 + (artX - 10) / 1.25;
      this.input.sensitivity = 0.4 + this.options.sens * 0.16;
      this.input.wantLock = this.options.lock;
    }
    document.addEventListener('visibilitychange', this.onVisibility);
    this.setState('intro');
  }

  setScale(S) {
    S = Math.max(1, Math.floor(S));
    if (S === this.S && this.canvas.width === ART_W * S) return;
    this.S = S;
    this.canvas.width = ART_W * S;
    this.canvas.height = ART_H * S;
    this.ctx.imageSmoothingEnabled = false;
    this.scanPattern = null;
    this.menuZoom = Math.max(1, S - 1) / S;
    if (this.view) this.view.zoom = this.menuZoom;
    if (this.board) this.board.build(S);
    // laufende Menue-Texte in der neuen Groesse neu aufbauen
    if (this.fonts && ['menu', 'options', 'highscores', 'credits'].includes(this.state) && !this.pendingState) {
      if (this.state === 'menu') this.enterMenu(); else if (this.state === 'options') this.enterOptions(); else this.enterList(this.state === 'highscores' ? 'HIGHSCORE' : 'CREDITS');
      this.menuTexts.forEach((st) => st.finish()); if (this.header) this.header.finish();
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now) => {
      if (!this.running) return;
      let dt = (now - this.last) / 1000;
      this.last = now;
      if (dt > 0.1) dt = 0.1;
      this.acc += dt;
      let steps = 0;
      while (this.acc >= FRAME && steps < 4) { this.tick(); this.acc -= FRAME; steps++; }
      if (steps === 4) this.acc = 0;
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    document.removeEventListener('visibilitychange', this.onVisibility);
    if (this.input) this.input.destroy();
    if (this.audio) this.audio.stopMusic();
  }

  // ---------------------------------------------------------------- Zustaende und Menue-Texte

  setState(s) {
    this.state = s;
    this.t = 0;
    this.pendingState = null;
    if (this.hooks.onState) this.hooks.onState(s);
    if (s === 'intro') {
      this.boardAlpha = 0;
      this.menuAlpha = 0;
      this.menuTexts = [];
      this.header = null;
      this.bs = boardState();
      this.board.build(this.S, 0);
      this.logoY = -80;
    }
    if (s === 'menu') { this.logoY = 24; this.enterMenu(); }
    if (s === 'options') { this.logoY = 24; this.enterOptions(); }
    if (s === 'highscores') this.enterList('HIGHSCORE');
    if (s === 'credits') this.enterList('CREDITS');
    if (s === 'menu' || s === 'intro') this.audio.playMusic(this.opts.musicMenu || '');
    if (s === 'game') this.audio.playMusic(this.opts.musicGame || '');
    if (s === 'gameover') this.audio.playMusic(this.opts.musicMenu || '');
  }

  /** Drehschrift-Eintrag, der mit Verzoegerung einfliegt und bis zum stop() stehen bleibt. */
  spinText(text, y, delay = 0, extra = {}) {
    const st = new SpinText(this.fonts.spin, text, Object.assign({ x: 120, y, zoom: this.menuZoom, hold: -1, turns: 2, stagger: 4 }, extra));
    st.t = -delay;
    return st;
  }

  enterMenu() {
    this.menuTexts = MENU.map((m, i) => this.spinText(m, MENU_Y[i], i * 8, { ripple: true }));
    this.header = null;
  }

  enterOptions() {
    this.header = this.spinText('OPTIONS', 106, 0);
    this.menuTexts = [];
  }

  enterList(title) {
    this.header = this.spinText(title, 24, 0);
    this.menuTexts = [];
  }

  /** Eintraege ausfliegen lassen (gewaehlter nach oben, der Rest zur Seite), danach in den Zielzustand. */
  leaveTo(state, chosen = -1) {
    if (this.pendingState) return;
    this.pendingState = state;
    this.pendingTimer = 0;
    this.menuTexts.forEach((st, i) => st.stop(i === chosen));
    if (this.header) this.header.stop(true);
  }

  updateTexts() {
    for (const st of this.menuTexts) st.update();
    if (this.header) this.header.update();
    if (this.pendingState) {
      this.pendingTimer++;
      const allDone = this.menuTexts.every((st) => st.done) && (!this.header || this.header.done);
      if (allDone || this.pendingTimer > 90) {
        const s = this.pendingState;
        this.pendingState = null;
        this.menuTexts = [];
        this.header = null;
        if (s === 'starting') { this.state = 'starting'; this.t = 0; } else this.setState(s);
      }
    }
  }

  // ---------------------------------------------------------------- Logik pro Frame

  tick() {
    this.t++;
    this.lightTimer++;
    if (this.state === 'loading') return;
    this.board.update();
    const keys = this.input ? this.input.takeKeys() : [];
    const clicks = this.input ? this.input.takeClicks() : [];
    const fire = this.input ? this.input.takeFire() : false;
    if (clicks.length || keys.length) this.audio.unlock();
    switch (this.state) {
      case 'intro': this.tickIntro(keys, clicks); break;
      case 'menu': this.tickMenu(keys, clicks); break;
      case 'options': this.tickOptions(keys, clicks); break;
      case 'highscores': case 'credits':
        this.idleLights();
        this.updateTexts();
        if ((keys.length || clicks.length) && !this.pendingState && this.t > 20) { this.audio.play('beep', 0.6, 1.2); this.leaveTo('menu'); }
        break;
      case 'starting': this.tickStarting(); break;
      case 'game': this.tickGame(keys, fire); break;
      case 'gameover': this.tickGameOver(); break;
      default: break;
    }
  }

  idleLights() {
    for (let i = 0; i < 6; i++) this.bs.lights[i] = ((this.lightTimer >> 5) % 6) === i ? 1 : 0;
    if (this.bs.phaserFrame >= 0) flickerPhaser(this.bs);
    if (this.logo) this.logo.update();
  }

  /** Projektplan "The Beginning": Schwarz, Logo faellt ein, Board blendet ein, Lichter/Tueren, Menue fliegt ein. */
  tickIntro(keys, clicks) {
    const t = this.t;
    if (this.logo) {
      const k = Math.max(0, Math.min(1, (t - 30) / 45));
      this.logoY = Math.round(-80 + 104 * (1 - (1 - k) * (1 - k)));
      if (t === 80 || t === 300) this.logo.startShimmer();
      this.logo.update();
    }
    if (t >= 110) this.boardAlpha = Math.min(1, (t - 110) / 40);
    const bs = this.bs;
    if (t >= 150 && t < 260) {
      const k = t - 150;
      bs.doorTop[0] = Math.min(3, Math.max(0, k < 30 ? k >> 2 : (60 - k) >> 2));
      bs.doorTop[1] = Math.min(3, Math.max(0, k < 45 ? (k - 15) >> 2 : (75 - k) >> 2));
      bs.topLight[0] = bs.doorTop[0] >= 2 ? 1 : 0; bs.topLight[1] = bs.doorTop[1] >= 2 ? 1 : 0;
      bs.doorLeft = Math.min(3, Math.max(0, k < 70 ? (k - 40) >> 2 : (100 - k) >> 2));
      bs.doorRight = Math.min(3, Math.max(0, k < 80 ? (k - 50) >> 2 : (110 - k) >> 2));
      for (let i = 0; i < 6; i++) bs.lights[i] = Math.floor(k / 6) % 6 === i || (k > 80 && ((k >> 2) + i) % 2 === 0) ? 1 : 0;
      if (k === 40) this.audio.play('doorOpen', 0.5);
      if (k === 70) { bs.phaserFrame = 0; this.audio.play('phaser', 0.5); }
    } else if (t >= 260) {
      this.idleLights();
      bs.doorTop = [0, 0]; bs.topLight = [0, 0]; bs.doorLeft = 0; bs.doorRight = 0;
    }
    if (t === 200 && !this.teaser) this.enterMenu();   // Menue fliegt noch waehrend des Intros ein
    if (t >= 200) { this.menuAlpha = 1; this.updateTexts(); }
    if (this.teaser) {
      if (t > 900) this.setState('intro');
      if (clicks.length && this.hooks.onClick) this.hooks.onClick();
      return;
    }
    if (keys.length || clicks.length || t > 330) {
      this.boardAlpha = 1; this.menuAlpha = 1;
      bs.phaserFrame = 3;
      const texts = this.menuTexts;
      this.setState('menu');
      if (texts.length) { this.menuTexts = texts; this.menuTexts.forEach((st) => st.finish()); }
    }
  }

  tickMenu(keys, clicks) {
    this.idleLights();
    this.updateTexts();
    if (this.pendingState) return;
    const hover = this.input.pointerArt;
    const rowAt = (y) => { for (let i = 0; i < MENU.length; i++) if (y >= MENU_Y[i] - 4 && y < MENU_Y[i] + 23) return i; return -1; };
    if (hover) { const i = rowAt(hover.y); if (i >= 0) this.menuIndex = i; }
    let activate = false;
    for (const k of keys) {
      if (k === 'ArrowUp' || k === 'KeyW') { this.menuIndex = (this.menuIndex + MENU.length - 1) % MENU.length; this.audio.play('beep', 0.4, 1.4); }
      if (k === 'ArrowDown' || k === 'KeyS') { this.menuIndex = (this.menuIndex + 1) % MENU.length; this.audio.play('beep', 0.4, 1.4); }
      if (k === 'Enter' || k === 'Space') activate = true;
    }
    for (const c of clicks) { const i = rowAt(c.y); if (i >= 0) { this.menuIndex = i; activate = true; } }
    if (!activate) return;
    this.audio.play('beep', 0.8, 1.2);
    const target = ['starting', 'highscores', 'options', 'credits'][this.menuIndex];
    if (target === 'options') this.optIndex = 0;
    this.leaveTo(target, this.menuIndex);
  }

  optionRows() {
    const o = this.options;
    return [
      ['SOUND FX', o.sfx ? 'ON' : 'OFF'],
      ['MUSIC', o.music ? 'ON' : 'OFF'],
      ['SCANLINES', o.scanlines ? 'ON' : 'OFF'],
      ['MOUSE SPEED', String(o.sens)],
      ['MOUSE LOCK', o.lock ? 'ON' : 'OFF'],
      ['BACK', ''],
    ];
  }

  tickOptions(keys, clicks) {
    this.idleLights();
    this.updateTexts();
    if (this.pendingState) return;
    const rows = this.optionRows();
    const rowY = (i) => 136 + i * 22;
    const rowAt = (y) => { for (let i = 0; i < rows.length; i++) if (y >= rowY(i) - 2 && y < rowY(i) + 20) return i; return -1; };
    const hover = this.input.pointerArt;
    if (hover) { const i = rowAt(hover.y); if (i >= 0) this.optIndex = i; }
    let change = 0, activate = false;
    for (const k of keys) {
      if (k === 'ArrowUp' || k === 'KeyW') this.optIndex = (this.optIndex + rows.length - 1) % rows.length;
      if (k === 'ArrowDown' || k === 'KeyS') this.optIndex = (this.optIndex + 1) % rows.length;
      if (k === 'ArrowLeft' || k === 'KeyA') change = -1;
      if (k === 'ArrowRight' || k === 'KeyD' || k === 'Enter' || k === 'Space') { change = 1; activate = true; }
      if (k === 'Escape') { this.leaveTo('menu'); return; }
    }
    for (const c of clicks) { const i = rowAt(c.y); if (i >= 0) { this.optIndex = i; change = 1; activate = true; } }
    if (change === 0) return;
    const o = this.options;
    switch (this.optIndex) {
      case 0: o.sfx = !o.sfx; this.audio.sfxOn = o.sfx; break;
      case 1: o.music = !o.music; this.audio.setMusicOn(o.music); break;
      case 2: o.scanlines = !o.scanlines; break;
      case 3: o.sens = Math.max(1, Math.min(10, o.sens + change)); this.input.sensitivity = 0.4 + o.sens * 0.16; break;
      case 4: o.lock = !o.lock; this.input.wantLock = o.lock; if (!o.lock) this.input.releaseLock(); break;
      case 5: if (activate) { this.audio.play('beep', 0.6, 1.2); this.leaveTo('menu'); return; } break;
      default: break;
    }
    this.valueSpin = { row: this.optIndex, t: 0 };   // geaenderter Wert dreht sich einmal
    this.audio.play('beep', 0.5, 1.3);
    try { localStorage.setItem(OPTIONS_KEY, JSON.stringify(o)); } catch (e) { /* privat */ }
  }

  /** Projektplan "The Game starts": Lichter/Tueren flackern, Logo schimmert und zieht weg, dann Spielstart. */
  tickStarting() {
    const t = this.t;
    const bs = this.bs;
    this.menuAlpha = Math.max(0, 1 - t / 20);
    if (this.logo) {
      if (t === 1) this.logo.startShimmer();
      this.logo.update();
      if (t > 40) this.logoY = Math.round(24 - (t - 40) * (t - 40) * 0.12);
    }
    if (t < 70) {
      for (let i = 0; i < 6; i++) bs.lights[i] = Math.random() < 0.5 ? 1 : 0;
      bs.doorTop[0] = (t >> 1) & 3; bs.doorTop[1] = ((t >> 1) + 2) & 3;
      bs.doorLeft = (t >> 2) & 3; bs.doorRight = ((t >> 2) + 1) & 3;
      if (t % 12 === 0) this.audio.play('doorClose', 0.3, 1.5);
    } else {
      bs.doorTop = [0, 0]; bs.topLight = [0, 0]; bs.doorLeft = 0; bs.doorRight = 0;
      this.idleLights();
    }
    if (t >= 90) this.startGame();
  }

  startGame() {
    this.session = new GameSession((Date.now() & 0xFFFFFF) | 1);
    this.view = new GameView(this.assets, this.fonts, this.board, this.audio);
    this.view.bs = this.bs;
    this.view.zoom = this.menuZoom;
    this.session.startGame();
    this.applyRoundBackground();
    this.view.handleEvents(this.session);
    this.paused = false;
    this.setState('game');
    this.pushHud();
  }

  applyRoundBackground() {
    this.board.build(this.S, roundBackground(this.session.round, this.board.bgCount));
  }

  tickGame(keys, fire) {
    const s = this.session;
    for (const k of keys) {
      if (k === 'Escape' || k === 'KeyP') { this.pause(!this.paused); return; }
    }
    if (this.paused) return;
    const delta = this.input.paddleDelta(s.field.paddle.center);
    const roundBefore = s.round;
    s.step(delta, fire);
    if (s.round !== roundBefore) this.applyRoundBackground();
    this.view.handleEvents(s);
    this.view.update(s);
    this.pushHud();
    if (s.phase === Phase.GAME_OVER || s.phase === Phase.COMPLETE) {
      this.input.releaseLock();
      this.setState('gameover');
    }
  }

  pause(on) {
    this.paused = on;
    if (on) this.input.releaseLock();
  }

  tickGameOver() {
    this.view.update(this.session);
    if (this.t === 200) {
      if (this.session.score > this.hi) this.hi = this.session.score;
      if (this.hooks.onGameOver) this.hooks.onGameOver({ score: this.session.score, round: this.session.round + 1, complete: this.session.phase === Phase.COMPLETE });
      else this.setState('highscores');
    }
  }

  /** Vom Wirt nach der Namenseingabe aufgerufen. */
  showHighscores() {
    this.hi = Math.max(this.hi, ...loadScores().map((s) => s.score));
    if (this.view) for (const a of this.view.announces) a.stop();
    this.boardAlpha = 1; this.menuAlpha = 1;
    this.bs.phaserFrame = 3;
    this.setState('highscores');
  }

  pushHud() {
    if (!this.hooks.onHud || !this.session) return;
    const s = this.session;
    const h = { score: s.score, round: s.round + 1, lives: Math.max(0, s.lives), hi: Math.max(this.hi, s.score), rounds: ROUNDS };
    const k = `${h.score}|${h.round}|${h.lives}|${h.hi}`;
    if (k === this.lastHud) return;
    this.lastHud = k;
    this.hooks.onHud(h);
  }

  // ---------------------------------------------------------------- Zeichnen

  draw() {
    const ctx = this.ctx, S = this.S;
    ctx.imageSmoothingEnabled = false;
    if (this.state === 'loading') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, ART_W * S, ART_H * S);
      ctx.fillStyle = '#1F3A70';
      ctx.fillRect(60 * S, 158 * S, 120 * S, 4 * S);
      ctx.fillStyle = '#FFD21F';
      ctx.fillRect(60 * S, 158 * S, Math.round(120 * this.progress) * S, 4 * S);
      return;
    }
    if (this.state === 'game' || this.state === 'gameover') {
      this.view.draw(ctx, S, this.session);
      if (this.paused) {
        ctx.fillStyle = 'rgba(0,0,20,0.6)';
        ctx.fillRect(0, 0, ART_W * S, ART_H * S);
        this.fonts.spin.drawText(ctx, S, 'PAUSED', 120, 120, 'center', this.menuZoom);
        this.fonts.spin.drawText(ctx, S, 'P TO CONTINUE', 120, 190, 'center', this.menuZoom);
      }
    } else {
      this.drawFront(ctx, S);
    }
    this.drawScanlines(ctx, S);
  }

  drawFront(ctx, S) {
    const spin = this.fonts.spin;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ART_W * S, ART_H * S);
    if (this.boardAlpha > 0) {
      ctx.globalAlpha = this.boardAlpha;
      this.board.drawAll(ctx, this.bs);
      ctx.globalAlpha = 1;
    }
    const showLogo = this.state === 'intro' || this.state === 'menu' || this.state === 'starting' || this.state === 'options';
    if (this.logo && showLogo && this.logoY > -this.logo.img.height) this.logo.draw(ctx, S, 120 - this.logo.img.width / 2, this.logoY, 1);
    if (this.teaser) {
      if (this.menuAlpha > 0 && (this.t >> 4) & 1) spin.drawText(ctx, S, 'CLICK TO PLAY', 120, 150, 'center', this.menuZoom);
      return;
    }
    const blink = (this.t >> 4) & 1;
    const z = this.menuZoom;
    if (this.header) this.header.draw(ctx, S);
    for (const st of this.menuTexts) st.draw(ctx, S);

    if (this.state === 'intro' || this.state === 'menu' || this.state === 'starting') {
      if (this.state === 'menu' && !this.pendingState) {
        // Cursor: das cyanfarbene Symbol der Drehschrift links und rechts vom gewaehlten Eintrag
        const st = this.menuTexts[this.menuIndex];
        if (st && st.settled) {
          const w = spin.measure(MENU[this.menuIndex]) * z;
          spin.drawGlyph(ctx, S, '>', spin.front, 120 - w / 2 - 14 * z, MENU_Y[this.menuIndex], z);
          ctx.save(); ctx.translate((120 + w / 2 + 14 * z) * S, 0); ctx.scale(-1, 1);
          spin.drawGlyph(ctx, S, '>', spin.front, 0, MENU_Y[this.menuIndex], z);
          ctx.restore();
        }
      }
      if (this.menuAlpha > 0 && this.state === 'menu') {
        ctx.globalAlpha = this.menuAlpha;
        spin.drawText(ctx, S, 'FIRE CLICK OR SPACE', 120, 236, 'center', z);
        spin.drawText(ctx, S, `HI ${String(this.hi).padStart(7, '0')}`, 120, 262, 'center', z);
        ctx.globalAlpha = 1;
      }
    } else if (this.state === 'options') {
      const rows = this.optionRows();
      rows.forEach((r, i) => {
        const y = 136 + i * 22;
        const sel = i === this.optIndex;
        let frame = spin.front;
        if (this.valueSpin && this.valueSpin.row === i) {
          this.valueSpin.t++;
          if (this.valueSpin.t >= spin.frames * 2) this.valueSpin = null; else frame = spin.front + (this.valueSpin.t >> 1);
        }
        if (r[1]) {
          spin.drawText(ctx, S, r[0], 24, y, 'left', z);
          spin.drawText(ctx, S, r[1], 216, y, 'right', z, frame);
        } else {
          spin.drawText(ctx, S, r[0], 120, y, 'center', z);
        }
        if (sel) spin.drawGlyph(ctx, S, '>', spin.front, 10, y, z);
      });
    } else if (this.state === 'highscores') {
      const list = loadScores();
      if (!list.length) spin.drawText(ctx, S, 'NO SCORES YET', 120, 140, 'center', z);
      list.slice(0, 10).forEach((e, i) => {
        const y = 52 + i * 20;
        spin.drawText(ctx, S, `${i + 1} ${(e.name || 'AAA').toUpperCase().slice(0, 10)}`, 30, y, 'left', z);
        spin.drawText(ctx, S, String(e.score).padStart(7, '0'), 210, y, 'right', z);
      });
      if (blink) spin.drawText(ctx, S, 'PRESS FIRE', 120, 258, 'center', z);
    } else if (this.state === 'credits') {
      CREDITS.forEach((line, i) => { if (line && (i < CREDITS.length - 1 || blink)) spin.drawText(ctx, S, line, 120, 46 + i * 20, 'center', z); });
    }
  }

  drawScanlines(ctx, S) {
    if (!this.options.scanlines || S < 2) return;
    if (!this.scanPattern) {
      const c = document.createElement('canvas');
      c.width = 1; c.height = S;
      const g = c.getContext('2d');
      g.fillStyle = 'rgba(0,0,0,0.28)';
      g.fillRect(0, S - 1, 1, 1);
      if (S >= 6) g.fillRect(0, S - 2, 1, 1);
      this.scanPattern = ctx.createPattern(c, 'repeat');
    }
    ctx.fillStyle = this.scanPattern;
    ctx.fillRect(0, 0, ART_W * S, ART_H * S);
  }
}
