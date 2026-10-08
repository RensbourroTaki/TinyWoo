// Darstellung des laufenden Spiels: Steine mit Schatten, Items, Gegner, Laser, Schlaeger (gesliced),
// Baelle, Effekte, Ankuendigungen. Rechnet Logik-Koordinaten (Hardware-Pixel des Kerns) in Art-Pixel um:
//   Art-X = 10 + 1,25 * (hwX - 16)      Art-Y = 301 - 1,25 * hwY   (Decke hwY 233 -> Art 9,75)
// Alle Positionen werden erst beim Zeichnen mit der Geraete-Skalierung S multipliziert und gerundet,
// so bleibt die 1,25-Schrittweite bei 4x exakt (5 Geraete-Pixel je Logik-Pixel).
import { ART_H, INNER, PHASER_Y, boardState, flickerPhaser } from './board.js';
import { BRICK_COLORS } from './assets.js';
import { ZAP, glowSprite } from './zap.js';
import { SpinText } from './spintext.js';
import { GOLD, KIND_MASK, KIND_SPECIAL, REGENERATES, ROWS } from '../core/brickgrid.js';
import { PaddleType } from '../core/paddle.js';
import { MAX_BALLS } from '../core/playfield.js';
import { Phase, INTRO_FRAMES, READY_FRAMES, EXITING_FRAMES, ENEMY_W, ENEMY_H, DEFLECTOR_WARN } from '../play/session.js';
import { COLUMNS } from '../play/levels.js';
import { levelName } from '../play/levelnames.js';

export const ax = (hw) => 10 + 1.25 * (hw - 16);
export const ay = (hw) => 301 - 1.25 * hw;
/** 9-Slice-Metadaten des Schlaegers (paddle-thrust.png, 34 px breit): linke und rechte Kappe je 9 px, Mitte dehnbar. */
export const PADDLE_SLICE = 9;
const ITEM_FRAMES = [0, 1, 2, 3, 4, 5, 5, 5, 5, 6, 7, 8, 9];   // 6. Frame viermal halten (Items_Frame_Zeitangabe.doc)

/** Ball-Glow (additiv, Radius in Art-Pixeln ab Ballmitte; Ball selbst = 3) und roter Rand des Mega-Balls. */
export const BALL_GLOW = { radius: 4.6, alpha: 0.42, color: [150, 235, 255], mega: [255, 40, 20], megaBlur: 2.2, megaAlpha: 0.9 };
/** Schlaeger nach Leben-Verlust: Ausblenden (Frames, 0 = sofort weg, er explodiert) und ruhiges Einblenden beim Respawn mit klebendem Ball. */
export const PADDLE_FADE = { out: 0, in: 24 };

/**
 * Abprall-Toene harmonisch: alles aus einem Sample (paddle.wav = Grundton C), Schlaeger = C, jeder Stein-Treffer
 * und -Abraeumer (auch der erste Treffer am grauen Stein) eine Oktave hoeher, Gold/unzerstoerbar bewusst verstimmt
 * ("war wohl nix"). Waende/Decke ohne Tonhoehen-Spielerei. rate = Abspieltempo (2 = Oktave).
 */
export const TONE = { sample: 'paddle', paddle: 1, brick: 2, gold: 2 * Math.pow(2, -0.7 / 12) };
/** Ball-Trail: Laenge in Frames, Staerke, Punktradius (Art-Pixel), Abstand der Zwischenpunkte. */
export const TRAIL = { len: 14, alpha: 0.3, radius: 2.4, step: 1.2 };
/**
 * Funken (Wand/Decke und Explosionen): 1 Art-Pixel, additiv, mit Schwerkraft, gluehen von Weiss ueber Gelb
 * und Orange nach Rot aus. Geschwindigkeiten in Art-Pixeln je Frame.
 */
export const SPARKS = {
  gravity: 0.07, drag: 0.985,
  wall: { count: [5, 9], speed: [0.5, 1.6], life: [18, 40] },
  explosion: { count: [60, 90], speed: [0.8, 3.6], life: [30, 72], lift: 1.0, big: 0.3 },
  colors: [[255, 255, 255], [255, 236, 140], [255, 160, 50], [230, 60, 20]],
  max: 1400,
};
/**
 * Derez (Tron/Matrix/Beam statt Explosion): Ball, Schlaeger und Gegner werden im Moment des Todes einmal in Art-Pixel
 * zerlegt (getImageData auf einem kleinen Puffer). Ablauf:
 *  1. glitch Frames: Objekt friert ein, blitzt weiss (flash), Zeilen springen seitlich, Farbversatz Magenta/Tuerkis.
 *  2. Eine Scan-Front laeuft drueber (sweep 'h' = von der Mitte nach links/rechts, 'v' = von oben nach unten,
 *     'r' = von der Mitte nach aussen), front = Frames bis zum Rand, jitter = Zufallsverzoegerung je Pixel.
 *     Erst was die Front erreicht, loest sich auf - Pixel fuer Pixel in einer Kette, kein Wegsprengen.
 *  3. Jedes Pixel hat zwei Kopien: A treibt waagerecht vom Zentrum weg (a: spd Art-Px/Frame, acc Beschleunigung) und
 *     zieht eine Lichtspur (trail), B loest sich bDelay Frames spaeter und steigt auf (b.dir -1, Beam) bzw. rieselt
 *     herab (+1, Matrix-Regen). Frisch geloest hot Frames heiss-weiss, dann Originalfarbe mit Tuerkis-Schimmer,
 *     funkelt (twinkle) und erlischt nach life Frames.
 *  4. Nachgluehen (afterglow Frames) als duenne Linie, wo das Objekt war ('h').
 */
export const DEREZ = {
  flash: [2, 9], hot: 3, twinkle: 0.1,
  hotColor: 'rgb(235,255,252)', cyan: 'rgb(90,240,215)', magenta: 'rgb(255,60,200)',
  tint: 0.7, chroma: 0.55, trail: { count: 3, step: 2, alpha: 0.6 }, afterglow: 22,
  paddle: { sweep: 'h', glitch: 7, front: 28, jitter: 4, life: [16, 28], bDelay: [2, 7],
    a: { spd: [0.25, 0.8], acc: 0.02 }, b: { spd: [0.1, 0.4], acc: 0.018, dir: -1 } },
  enemy: { sweep: 'v', glitch: 5, front: 20, jitter: 3, life: [14, 24], bDelay: [1, 5],
    a: { spd: [0.2, 0.6], acc: 0.015 }, b: { spd: [0.2, 0.5], acc: 0.04, dir: 1 } },
  ball: { sweep: 'r', glitch: 4, front: 8, jitter: 3, life: [12, 20], bDelay: [1, 4],
    a: { spd: [0.2, 0.6], acc: 0.015 }, b: { spd: [0.15, 0.45], acc: 0.02, dir: -1 } },
};
/**
 * Lichtblitz ueber jeder Explosion (additiv): heisser Kern, grosser oranger Schein und ein Druckring.
 * Radien in Art-Pixeln (mal Explosions-Skalierung), len in Frames.
 */
export const BOOM = { len: 24, core: 13, glow: 34, coreAlpha: 1, glowAlpha: 0.85, ring: [4, 30], ringAlpha: 0.7 };
export class GameView {
  constructor(assets, fonts, board, audio, zap) {
    this.img = assets.img;
    this.snap = null;             // kleiner Puffer zum Zerlegen der Sprites (Pixel-Zerfall)
    this.spin = fonts.spin;
    this.board = board;
    this.audio = audio;
    this.bs = boardState();
    this.effects = [];
    this.texts = [];
    this.tick = 0;
    this.introBricks = null;      // Erscheinungszeit je Zelle
    this.introTimer = 0;
    this.beamFrame = -1;
    this.paddleVisible = true;
    this.paddleFade = null;       // { dir: -1 aus / 1 ein, t } nach Leben-Verlust
    this.lostBall = null;         // { x, y, vx, vy, t } Ball fliegt in seinem Winkel in die Elektro-Zone
    this.phaserFlash = 0;
    this.lightMode = 'idle';      // idle | flicker | clear
    this.lightTimer = 0;
    this.doorAnim = { left: 0, right: 0, top: [0, 0], topTimer: [0, 0] };
    this.shineTimer = 90;
    this.rng = 1;
    this.exitAnim = null;         // { side, t }
    this.itemFlash = null;
    this.announces = [];          // laufende Ankuendigungen in der Drehschrift
    this.queue = [];
    this.zoom = 0.75;             // Textgroesse wie im Hauptmenue, wird von der App gesetzt
    this.sparks = [];             // { x, y, vx, vy, t, len } in Art-Pixeln
    this.trails = [];             // je Ball: letzte Mittelpunkte [{ x, y }] in Art-Pixeln, neueste zuletzt
    this.glowBall = glowSprite(BALL_GLOW.color);
    this.glowMega = glowSprite(BALL_GLOW.mega);
    this.glowHot = glowSprite([255, 245, 215]);
    this.glowFire = glowSprite([255, 140, 40]);
    this.zap = zap;               // Elektro-Zone (gehoert der App, laeuft auch im Menue)
  }

  /** Funken an (x, y) ausstossen: Richtung (dx, dy) mit Streuung spread (Bogenmass), cfg aus SPARKS. */
  spawnSparks(x, y, cfg, dx, dy, spread) {
    const r = (a) => a[0] + Math.random() * (a[1] - a[0]);
    const n = Math.round(r(cfg.count));
    const base = Math.atan2(dy, dx);
    for (let i = 0; i < n && this.sparks.length < SPARKS.max; i++) {
      const a = base + (Math.random() - 0.5) * spread, v = r(cfg.speed);
      this.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (cfg.lift || 0) * Math.random(), t: 0, len: Math.round(r(cfg.life)), size: Math.random() < (cfg.big || 0) ? 2 : 1 });
    }
  }

  /** Art-Mittelpunkt eines Balls. */
  ballCenter(b) { return { x: ax(b.x - 3) + 2.5, y: ay(b.y + 1) + 2.5 }; }

  rand() {
    this.rng = (this.rng * 1103515245 + 12345) & 0x7FFFFFFF;
    return this.rng / 0x7FFFFFFF;
  }

  // ---------------------------------------------------------------- Ereignisse der Session

  handleEvents(session) {
    for (const e of session.events) {
      switch (e.kind) {
        case 'roundStart':
          if (e.newRound) this.startIntro(session, true); else this.respawn();
          break;
        case 'ready':
          this.say(`LEVEL ${String(session.round + 1).padStart(2, '0')}`, 70, 114);
          this.queue = [{ at: 18, text: levelName(session.round, session.variant), hold: 70, y: 142 }];
          this.audio.play('beep');
          break;
        case 'go': break;   // Phaser bleibt im Spiel aus, nur das Deflector-Item schaltet ihn ein
        case 'deflectorOn': this.phaserOn(true); break;
        case 'deflectorOff': this.phaserOn(false); break;
        case 'floorBounce': {
          this.audio.play('wall', 0.7);
          this.phaserFlash = 6;
          const c = this.ballCenter(session.field.balls[e.ball]);
          this.spawnSparks(c.x, c.y + 3, SPARKS.wall, 0, -1, 2.2);
          break;
        }
        case 'launch': break;
        case 'paddleHit':
          this.audio.play(TONE.sample, 1, TONE.paddle);
          break;
        case 'catch': this.audio.play(TONE.sample, 0.8, TONE.paddle); break;
        case 'wall': {
          this.audio.play('wall', 0.7);
          const c = this.ballCenter(session.field.balls[e.ball]);
          this.spawnSparks(c.x + 3 * e.side, c.y, SPARKS.wall, -e.side, -0.35, 1.8);
          break;
        }
        case 'ceiling': {
          this.audio.play('wall', 0.7);
          const c = this.ballCenter(session.field.balls[e.ball]);
          this.spawnSparks(c.x, c.y - 3, SPARKS.wall, 0, 1, 2.2);
          break;
        }
        case 'brickHit':
          this.audio.play(TONE.sample, 0.9, e.gold ? TONE.gold : TONE.brick);
          // Gold blinkt mit dem Zerstoer-Effekt auf und bleibt stehen, alles andere wackelt
          this.effects.push(e.gold ? { type: 'flash', cell: e.cell, t: 0, len: 9 } : { type: 'shake', cell: e.cell, t: 0, len: 6 });
          break;
        case 'brickMoved':
          for (const fx of this.effects) if (fx.cell === e.from) fx.cell = e.to;
          break;
        case 'brickDestroyed':
          this.audio.play(TONE.sample, 1, TONE.brick);
          this.effects.push({ type: 'destroy', cell: e.cell, t: 0, len: 9 });
          break;
        case 'brickRegrown':
          this.effects.push({ type: 'shine', cell: e.cell, t: 0, len: 12 });
          break;
        case 'itemSpawned': break;
        case 'itemCaught':
          this.audio.play('beep', 0.8, 1.3);
          break;
        case 'paddleType': break;
        case 'shot': this.audio.play('brick', 0.5, 2.2); break;
        case 'enemySpawn':
          this.openTopDoor(e.side < 0 ? 0 : 1);
          this.audio.play('doorOpen', 0.6);
          break;
        case 'enemyKilled':
          this.blast('enemy', ax(e.x), ay(e.y), { age: e.age });
          break;
        case 'ballLost': {
          // Bewegung je Frame aus der Ball-Spur: der Ball fliegt im Eingangswinkel weiter
          const c = this.ballCenter(e);
          const tr = this.trails[e.ball] || [];
          const last = tr[tr.length - 1];
          const vx = last ? c.x - last.x : 0;
          const vy = last && c.y - last.y > 0.5 ? c.y - last.y : 2.5;
          this.lostBall = { x: ax(e.x - 3) - 0.5, y: ay(e.y + 1) - 0.5, vx, vy, t: 0 };
          break;
        }
        case 'lifeLost': {
          this.paddleFade = { dir: -1, t: 0 };   // Schlaeger explodiert, Respawn nach BALL_LOST_FRAMES
          const p = session.field.paddle;
          this.blast('paddle', (ax(p.left) + ax(p.right + 1)) / 2, 294.5, { session });
          break;
        }
        case 'ballVanish': {
          const c = this.ballCenter(e);
          this.blast('ball', c.x, c.y, { mega: !!session.field.pierceBall });
          break;
        }
        case 'roundClear':
          this.lightMode = 'clear';
          this.say('SELECT', -1, 126);
          this.say('NEXT LEVEL', -1, 154);
          break;
        case 'exitsOpen':
          this.doorAnim.left = 1; this.doorAnim.right = 1;
          this.audio.play('doorOpen');
          break;
        case 'exitChosen':
          this.exitAnim = { side: e.side, t: 0, width: e.width };
          for (const a of this.announces) a.stop();
          this.audio.play('beep', 1, 0.9);
          break;
        case 'extraLife':
          this.texts.push({ text: 'EXTRA LIFE', x: 120, y: 200, t: 0, len: 90 });
          this.audio.play('beep', 1, 1.6);
          break;
        case 'megaEnd': break;
        case 'gameOver':
          this.say('GAME OVER', -1, 140);
          this.phaserOn(false);
          break;
        case 'gameComplete':
          this.say('ALL CLEAR', -1, 126);
          this.say('CONGRATULATIONS', -1, 154);
          break;
        default: break;
      }
    }
  }

  /** Nach einem Leben-Verlust: keine Ansage, kein Beam; Schlaeger und klebender Ball blenden ruhig ein. */
  respawn() {
    for (const a of this.announces) a.stop();
    this.queue = [];
    this.lostBall = null;
    this.trails = [];
    this.beamFrame = -1;
    this.paddleVisible = true;
    this.paddleFade = { dir: 1, t: 0 };
    this.audio.play('paddleSpawn', 0.7);   // 30 % leiser
  }

  /** Deckkraft von Schlaeger (und Ball beim Einblenden) aus paddleFade. */
  paddleAlpha() {
    const pf = this.paddleFade;
    if (!pf) return 1;
    if (pf.dir < 0) return PADDLE_FADE.out > 0 ? Math.max(0, 1 - pf.t / PADDLE_FADE.out) : 0;
    return Math.min(1, pf.t / PADDLE_FADE.in);
  }

  startIntro(session, newRound) {
    this.paddleFade = null;
    this.effects.length = 0;
    this.texts.length = 0;
    this.announces.length = 0;
    this.queue = [];
    this.lostBall = null;
    this.exitAnim = null;
    this.trails = [];
    this.doorAnim.left = 0; this.doorAnim.right = 0;
    this.bs.doorLeft = 0; this.bs.doorRight = 0;
    this.lightMode = 'idle';
    this.phaserOn(false);
    this.introTimer = 0;
    this.paddleVisible = false;
    this.beamFrame = 0;
    this.audio.play('paddleSpawn', 0.7);   // 30 % leiser
    if (newRound) {
      // Reihenfolge des Erscheinens: Zeilen, Spalten oder Zufall (Projektplan: drei Reihenfolgen)
      const cells = session.field.bricks.cells;
      const order = session.brickOrder;
      this.introBricks = new Int16Array(cells.length);
      const list = [];
      for (let i = 0; i < cells.length; i++) if (cells[i] !== 0) list.push(i);
      this.rng = session.brickAppearSeed || 1;
      for (let k = 0; k < list.length; k++) {
        const i = list[k];
        const col = i % COLUMNS, row = Math.floor(i / COLUMNS);
        let t;
        if (order === 0) t = row * 5 + col;
        else if (order === 1) t = col * 6 + row;
        else t = Math.floor(this.rand() * 70);
        this.introBricks[i] = t;
      }
    } else {
      this.introBricks = null;
    }
  }

  /** Ankuendigung in der Drehschrift in Originalgroesse (23 px), eine langsame Umdrehung zum Ausdrehen. */
  say(text, hold, y) {
    this.announces.push(new SpinText(this.spin, text, { x: 120, y, zoom: this.zoom, hold, turns: 1, stagger: 3, flyIn: 20, flyOut: 18 }));
  }

  phaserOn(on) {
    if (on && this.bs.phaserFrame < 0) { this.bs.phaserFrame = 0; this.phaserStart = 0; this.audio.play('phaser', 0.8); }
    if (!on) this.bs.phaserFrame = -1;
  }

  openTopDoor(i) {
    this.doorAnim.topTimer[i] = 70;
  }

  explode(x, y, scale) {
    this.effects.push({ type: 'explosion', x, y, scale, t: 0, len: 24 });
    this.effects.push({ type: 'boom', x, y, scale, t: 0, len: BOOM.len });
    const cfg = SPARKS.explosion;
    this.spawnSparks(x, y, { ...cfg, count: cfg.count.map((n) => n * scale) }, 0, -1, Math.PI * 2);
  }

  /**
   * Tod von kind ('ball' | 'paddle' | 'enemy', siehe DEREZ) mit Mitte (x, y): Sound plus Derez.
   * opt: session (Schlaeger wie gezeichnet), age (Gegner-Frame), mega (Mega-Ball).
   */
  blast(kind, x, y, opt = {}) {
    const I = this.img;
    this.audio.play('explosion_' + kind, kind === 'enemy' ? 0.6 : 1);   // Gegner-WAV ist zu laut: 40 % leiser
    if (kind === 'ball') {
      const im = opt.mega && I.ballMega ? I.ballMega : I.ball, X = Math.round(x - 3), Y = Math.round(y - 3);
      this.shatter(kind, x, y, X, Y, 6, 6, (g) => g.drawImage(im, X, Y, 6, 6));
    } else if (kind === 'enemy') {
      const fr = Math.floor((opt.age || 0) / 4) % 8, X = Math.round(x - 10), Y = Math.round(y - 12);
      this.shatter(kind, x, y, X, Y, 20, 24, (g) => g.drawImage(I.enemy, 0, fr * 24, 20, 24, X, Y, 20, 24));
    } else if (opt.session) {
      this.shatter(kind, x, y, 0, 286, 240, 14, (g) => this.drawPaddle(g, 1, opt.session));
    } else {
      this.shatter(kind, x, y, 0, 286, 240, 14, (g) => this.drawPaddleBody(g, 1, x - 17, x + 17, 290, 0, 'normal'));
    }
  }

  /**
   * Derez anlegen: paint(g) zeichnet das Sprite in Art-Koordinaten, der Ausschnitt (x0, y0, w, h) wird einmal
   * ausgelesen. Jedes deckende Pixel wird zweimal Partikel: Index k = Kopie A, m + k = Kopie B (siehe DEREZ).
   */
  shatter(kind, cx, cy, x0, y0, w, h, paint) {
    const cfg = DEREZ[kind];
    if (!this.snap) this.snap = document.createElement('canvas');
    const cv = this.snap;
    if (cv.width < w || cv.height < h) { cv.width = Math.max(cv.width, w); cv.height = Math.max(cv.height, h); }
    const g = cv.getContext('2d', { willReadFrequently: true });
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, w, h);
    g.imageSmoothingEnabled = false;
    g.setTransform(1, 0, 0, 1, -x0, -y0);
    paint(g);
    g.setTransform(1, 0, 0, 1, 0, 0);
    const data = g.getImageData(0, 0, w, h).data;
    const pix = [];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const o = (j * w + i) * 4;
        if (data[o + 3] < 24) continue;
        pix.push(i, j, o);
        minX = Math.min(minX, i); maxX = Math.max(maxX, i); minY = Math.min(minY, j); maxY = Math.max(maxY, j);
      }
    }
    const m = pix.length / 3;
    if (!m) return;
    const n = 2 * m;
    const px = new Int16Array(n), py = new Int16Array(n), rel = new Float32Array(n), life = new Float32Array(n);
    const spd = new Float32Array(n), dir = new Int8Array(n), col = new Array(n);
    const left = x0 + minX, top = y0 + minY, bw = maxX - minX + 1, bh = maxY - minY + 1;
    const hw = Math.max(1, cx - left, left + bw - cx), hh = Math.max(1, cy - top, top + bh - cy);
    const r = (a) => a[0] + Math.random() * (a[1] - a[0]);
    let end = 0;
    for (let k = 0; k < m; k++) {
      const i = pix[3 * k], j = pix[3 * k + 1], o = pix[3 * k + 2];
      const x = x0 + i, y = y0 + j, dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const d = cfg.sweep === 'h' ? Math.abs(dx) / hw : cfg.sweep === 'v' ? (y - top + 0.5) / bh
        : Math.min(1, Math.hypot(dx / hw, dy / hh) / Math.SQRT2);
      const c = `rgba(${data[o]},${data[o + 1]},${data[o + 2]},${(data[o + 3] / 255).toFixed(2)})`;
      px[k] = px[m + k] = x; py[k] = py[m + k] = y; col[k] = col[m + k] = c;
      rel[k] = cfg.glitch + cfg.front * Math.min(1, d) + cfg.jitter * Math.random();
      rel[m + k] = rel[k] + r(cfg.bDelay);
      life[k] = r(cfg.life); life[m + k] = r(cfg.life);
      dir[k] = Math.abs(dx) < 0.25 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(dx);   // A: weg vom Zentrum
      dir[m + k] = cfg.b.dir;                                                            // B: Beam hoch / Regen runter
      spd[k] = r(cfg.a.spd); spd[m + k] = r(cfg.b.spd);
      end = Math.max(end, rel[m + k] + life[m + k], rel[k] + life[k] + DEREZ.trail.count * DEREZ.trail.step);
    }
    const len = Math.ceil(Math.max(end, cfg.sweep === 'h' ? cfg.glitch + cfg.front + DEREZ.afterglow : 0)) + 1;
    this.effects.push({
      type: 'derez', kind, t: 0, len, n, m, px, py, rel, life, spd, dir, col,
      accA: cfg.a.acc, accB: cfg.b.acc, cx, cy, left, top, w: bw, h: bh, hw, hh,
    });
  }

  // ---------------------------------------------------------------- pro Logik-Frame

  update(session) {
    this.tick++;
    const bs = this.bs;
    // Ankuendigungs-Warteschlange (LEVEL NN -> Name)
    if (this.queue && this.queue.length && session.phase === Phase.READY) {
      const elapsed = READY_FRAMES - session.phaseTimer;
      if (elapsed >= this.queue[0].at) {
        const q = this.queue.shift();
        this.say(q.text, q.hold, q.y);
        this.audio.play('beep', 0.7, 1.1);
      }
    }
    for (const a of this.announces) a.update();
    this.announces = this.announces.filter((a) => !a.done);
    for (const t of this.texts) t.t++;
    this.texts = this.texts.filter((t) => t.t < t.len);
    for (const e of this.effects) e.t++;
    this.effects = this.effects.filter((e) => e.t < e.len);
    // Funken: Schwerkraft, Luftwiderstand, verschwinden ausgeglueht oder unter dem Bild
    for (const p of this.sparks) {
      const d = p.drag || SPARKS.drag;
      p.vx *= d; p.vy = p.vy * d + (p.g ?? SPARKS.gravity);
      p.x += p.vx; p.y += p.vy; p.t++;
    }
    this.sparks = this.sparks.filter((p) => p.t < p.len && p.y < 340);
    if (this.paddleFade) {
      this.paddleFade.t++;
      if (this.paddleFade.dir > 0 && this.paddleFade.t >= PADDLE_FADE.in) this.paddleFade = null;
    }
    // Ball-Trails: Mittelpunkte der letzten Frames (Spruenge > 24 Art-Pixel = neuer Ball, Trail neu)
    const f = session.field;
    for (let i = 0; i < MAX_BALLS; i++) {
      if (session.ballsHidden || !f.isActive(i)) { this.trails[i] = []; continue; }
      const tr = this.trails[i] || (this.trails[i] = []);
      const c = this.ballCenter(f.balls[i]);
      const last = tr[tr.length - 1];
      if (last && Math.abs(last.x - c.x) + Math.abs(last.y - c.y) > 24) tr.length = 0;
      tr.push(c);
      if (tr.length > TRAIL.len) tr.shift();
    }

    // Intro: Steine erscheinen, Schlaeger fliegt ein
    if (session.phase === Phase.INTRO) {
      this.introTimer++;
      if (this.beamFrame >= 0) {
        // Timing aus der Pocket-PC-EXE (.data 0045C470): Frame 0 vier Ticks, danach jeder Frame zwei Ticks
        const t = this.introTimer;
        this.beamFrame = t < 4 ? 0 : 1 + ((t - 4) >> 1);
        if (this.beamFrame >= 14) { this.beamFrame = -1; this.paddleVisible = true; }
      }
    }
    // Gluehender Glanz ueber einem zufaelligen Stein
    if (session.phase === Phase.PLAYING && --this.shineTimer <= 0) {
      this.shineTimer = 100 + Math.floor(this.rand() * 140);
      const cells = session.field.bricks.cells;
      const filled = [];
      for (let i = 0; i < cells.length; i++) if (cells[i] !== 0) filled.push(i);
      if (filled.length) this.effects.push({ type: 'shine', cell: filled[Math.floor(this.rand() * filled.length)], t: 0, len: 12 });
    }
    // Ball verloren: fliegt im Eingangswinkel weiter und explodiert mitten in der Elektro-Zone
    if (this.lostBall) {
      const lb = this.lostBall;
      lb.t++;
      lb.x += lb.vx;
      lb.y += lb.vy;
      if (lb.x < INNER.x || lb.x > INNER.x + INNER.w - 6) {   // an den Rohren abprallen
        lb.x = Math.max(INNER.x, Math.min(INNER.x + INNER.w - 6, lb.x));
        lb.vx = -lb.vx;
      }
      if (lb.y + 3 >= ZAP.boomY) {
        const x = lb.x + 3;
        this.blast('ball', x, ZAP.boomY);
        if (this.zap) this.zap.burst(x, ZAP.boomY);
        this.lostBall = null;
      }
    }
    if (this.phaserFlash > 0) this.phaserFlash--;
    // Phaser-Animation: Hochfahren (Frames 0..3), danach Flackern jeden Tick
    if (bs.phaserFrame >= 0) {
      this.phaserStart++;
      if (this.phaserStart < 16) {
        bs.phaserFrame = Math.min(3, this.phaserStart >> 2);
        bs.phaserAlpha = 1;
      } else {
        flickerPhaser(bs, this.phaserFlash > 0);
        // Deflector laeuft ab: Phaser setzt immer wieder aus
        const left = session.deflectorFrames;
        if (left > 0 && left < DEFLECTOR_WARN && ((left >> 3) & 1)) bs.phaserAlpha = 0.12;
      }
    }
    // Tueren
    const da = this.doorAnim;
    if (da.left && bs.doorLeft < 3 && this.tick % 4 === 0) bs.doorLeft++;
    if (!da.left && bs.doorLeft > 0 && this.tick % 4 === 0) bs.doorLeft--;
    if (da.right && bs.doorRight < 3 && this.tick % 4 === 0) bs.doorRight++;
    if (!da.right && bs.doorRight > 0 && this.tick % 4 === 0) bs.doorRight--;
    for (let i = 0; i < 2; i++) {
      if (da.topTimer[i] > 0) {
        da.topTimer[i]--;
        const open = da.topTimer[i] > 20;
        if (open && bs.doorTop[i] < 3 && this.tick % 3 === 0) bs.doorTop[i]++;
        if (!open && bs.doorTop[i] > 0 && this.tick % 3 === 0) bs.doorTop[i]--;
        bs.topLight[i] = bs.doorTop[i] >= 2 ? 1 : 0;
      } else { bs.topLight[i] = 0; if (bs.doorTop[i] > 0 && this.tick % 3 === 0) bs.doorTop[i]--; }
    }
    // Laempchen
    this.lightTimer++;
    for (let i = 0; i < 6; i++) {
      if (this.lightMode === 'clear') bs.lights[i] = ((this.lightTimer >> 2) + i) % 3 === 0 ? 1 : 0;
      else if (this.lightMode === 'flicker') bs.lights[i] = this.rand() < 0.5 ? 1 : 0;
      else bs.lights[i] = ((this.lightTimer >> 5) % 6) === i ? 1 : 0;   // Lauflicht
    }
    if (this.exitAnim) this.exitAnim.t++;
  }

  // ---------------------------------------------------------------- Zeichnen

  draw(ctx, S, session) {
    const I = this.img;
    const f = session.field;
    const bs = this.bs;
    const clipInner = () => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(INNER.x * S, INNER.y * S, INNER.w * S, INNER.h * S);
      ctx.clip();
    };
    this.board.drawBackground(ctx);
    clipInner();

    // Steine: erst alle Schatten, dann die Steine
    const cells = f.bricks.cells;
    const intro = session.phase === Phase.INTRO && this.introBricks;
    const visible = (i) => cells[i] !== 0 && (!intro || this.introTimer >= this.introBricks[i]);
    // wandernde Goldsteine gleiten zwischen den Zellen: Versatz in Art-Pixeln
    const offset = (i) => (session.movers.length ? session.moverOffset(i) : null);
    const slide = (i) => { const o = offset(i); return o ? 20 * o.dx : 0; };
    const lift = (i) => { const o = offset(i); return o ? 10 * o.dy : 0; };
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    for (let i = 0; i < cells.length; i++) {
      if (!visible(i)) continue;
      const col = i % COLUMNS, row = Math.floor(i / COLUMNS);
      ctx.fillRect(Math.round((10 + 20 * col + 3 + slide(i)) * S), Math.round((11 + 10 * row + 3 + lift(i)) * S), 20 * S, 10 * S);
    }
    for (let i = 0; i < cells.length; i++) {
      if (!visible(i)) continue;
      const col = i % COLUMNS, row = Math.floor(i / COLUMNS);
      let x = 10 + 20 * col + slide(i), y = 11 + 10 * row + lift(i);
      const shake = this.effects.find((e) => e.type === 'shake' && e.cell === i);
      if (shake) x += (shake.t & 1) ? 1 : -1;
      const im = I[brickImage(cells[i])];
      ctx.drawImage(im, 0, 0, 20, 10, Math.round(x * S), Math.round(y * S), 20 * S, 10 * S);
    }
    // Effekte auf Zellen
    for (const e of this.effects) {
      if (e.type !== 'destroy' && e.type !== 'flash' && e.type !== 'shine') continue;
      const col = e.cell % COLUMNS, row = Math.floor(e.cell / COLUMNS);
      const x = Math.round((10 + 20 * col + slide(e.cell)) * S), y = Math.round((11 + 10 * row + lift(e.cell)) * S);
      if (e.type === 'destroy' || (e.type === 'flash' && cells[e.cell] !== 0)) {
        const fr = Math.min(2, Math.floor(e.t / 3));
        ctx.drawImage(I.brickDestroyed, 0, fr * 10, 20, 10, x, y, 20 * S, 10 * S);
      } else if (e.type === 'shine' && cells[e.cell] !== 0) {
        const fr = Math.min(5, Math.floor(e.t / 2));
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.7;
        ctx.drawImage(I.brickShine, 0, fr * 10, 20, 10, x, y, 20 * S, 10 * S);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    ctx.restore();

    // Schatten des Rahmens faellt auf Hintergrund und Steine, Spielobjekte liegen darueber
    this.board.drawShadow(ctx, bs);
    clipInner();

    // Items
    for (const it of session.items) {
      const im = I[itemImage(it.key)];
      const fr = ITEM_FRAMES[Math.floor(it.age / 5) % ITEM_FRAMES.length];
      const x = ax(it.x) - 9, y = ay(it.y16 / 16) - 9;
      ctx.drawImage(im, 0, fr * 9, 18, 9, Math.round(x * S), Math.round(y * S), 18 * S, 9 * S);
    }
    // Gegner
    for (const en of session.enemies) {
      const fr = Math.floor(en.age / 4) % 8;
      const x = ax(en.x) - 10, y = ay(en.y) - 12;
      ctx.drawImage(I.enemy, 0, fr * 24, 20, 24, Math.round(x * S), Math.round(y * S), 20 * S, 24 * S);
    }
    // Laserschuesse
    for (const s of session.shots) {
      const x = ax(s.x) - 1, y = ay(s.y);
      if (I.laserShot) {
        ctx.drawImage(I.laserShot, Math.round((x - I.laserShot.width / 2 + 1) * S), Math.round((y - I.laserShot.height) * S), I.laserShot.width * S, I.laserShot.height * S);
      } else {
        ctx.fillStyle = (s.age & 2) ? '#FFF0A0' : '#FF9A1A';
        ctx.fillRect(Math.round(x * S), Math.round((y - 6) * S), 2 * S, 6 * S);
      }
    }
    // Schlaeger
    const pa = this.paddleAlpha();
    if (this.paddleVisible && session.phase !== Phase.GAME_OVER && pa > 0) {
      ctx.globalAlpha = pa;
      this.drawPaddle(ctx, S, session);
      ctx.globalAlpha = 1;
    }
    if (this.beamFrame >= 0) {
      const cx = ax(f.paddle.center) - 46, cy = 300 - 19;
      ctx.drawImage(I.paddleBeam, 0, this.beamFrame * 19, 93, 19, Math.round(cx * S), Math.round(cy * S), 93 * S, 19 * S);
    }
    // Baelle: Trail und Glow additiv darunter, Mega-Ball mit eigenem Sprite und rotem Rand-Glow
    if (!session.ballsHidden) {
      const mega = !!f.pierceBall;
      for (let i = 0; i < MAX_BALLS; i++) {
        if (!f.isActive(i)) continue;
        const b = f.balls[i];
        const x = ax(b.x - 3) - 0.5, y = ay(b.y + 1) - 0.5;
        this.drawTrail(ctx, S, this.trails[i], mega);
        ctx.globalAlpha = pa;   // beim Respawn blendet der Ball mit dem Schlaeger ein
        this.drawBall(ctx, S, x, y, mega);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
    // Elektro-Zone und verlorener Ball liegen unter dem Rahmen, reichen aber bis zur Bildunterkante
    if (this.zap) this.zap.draw(ctx, S);
    if (this.lostBall) this.drawBall(ctx, S, this.lostBall.x, this.lostBall.y, false);
    this.board.drawFrame(ctx);

    // Explosionen (auch ueber den Rohren)
    for (const e of this.effects) {
      if (e.type !== 'explosion') continue;
      const fr = Math.min(7, Math.floor(e.t / 3));
      const w = 24 * e.scale, h = 21 * e.scale;
      ctx.drawImage(I.explosion, 0, fr * 21, 24, 21, Math.round((e.x - w / 2) * S), Math.round((e.y - h / 2) * S), Math.round(w * S), Math.round(h * S));
    }
    this.drawDerez(ctx, S);
    this.drawBooms(ctx, S);
    this.drawSparks(ctx, S);
    this.board.drawDynamic(ctx, bs);
    if (this.phaserFlash > 0) {
      ctx.fillStyle = `rgba(160,220,255,${0.05 * this.phaserFlash})`;
      ctx.fillRect(0, (PHASER_Y - 20) * S, 240 * S, 42 * S);
    }
    // Texte (Item-Namen, Extraleben) in der Drehschrift, schweben nach oben
    for (const t of this.texts) {
      const a = t.t < t.len - 20 ? 1 : (t.len - t.t) / 20;
      ctx.globalAlpha = a;
      this.spin.drawText(ctx, S, t.text, t.x, Math.round(t.y - t.t * 0.3), 'center', this.zoom);
      ctx.globalAlpha = 1;
    }
    for (const an of this.announces) an.draw(ctx, S);
  }

  /** Ball-Sprite (Art-Position der linken oberen Ecke) mit Glow; mega = fressender Ball (ball-item1.png). */
  drawBall(ctx, S, x, y, mega) {
    const I = this.img;
    const cx = (x + 3) * S, cy = (y + 3) * S;
    const pulse = 0.85 + 0.15 * Math.sin(this.tick * 0.25);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const r = BALL_GLOW.radius * (mega ? 1.25 : 1) * S;
    ctx.globalAlpha *= BALL_GLOW.alpha * (mega ? pulse : 1);
    ctx.drawImage(mega ? this.glowMega : this.glowBall, cx - r, cy - r, 2 * r, 2 * r);
    ctx.restore();
    const X = Math.round(x * S), Y = Math.round(y * S);
    if (mega && I.ballMega) {
      // roter Outline-Glow: Schatten des Sprites, weich und ohne Versatz
      ctx.save();
      ctx.shadowColor = `rgba(${BALL_GLOW.mega.join(',')},${BALL_GLOW.megaAlpha * pulse})`;
      ctx.shadowBlur = BALL_GLOW.megaBlur * S;
      ctx.drawImage(I.ballMega, X, Y, 6 * S, 6 * S);
      ctx.drawImage(I.ballMega, X, Y, 6 * S, 6 * S);
      ctx.restore();
      return;
    }
    ctx.drawImage(I.ball, X, Y, 6 * S, 6 * S);
  }

  /** Leichter Schweif: weiche Lichtpunkte entlang der letzten Ballpositionen, aelter = kleiner und blasser. */
  drawTrail(ctx, S, tr, mega) {
    if (!tr || tr.length < 2) return;
    const img = mega ? this.glowMega : this.glowBall;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const n = tr.length - 1, pa = this.paddleAlpha();
    for (let k = 0; k < n; k++) {
      const a = tr[k], b = tr[k + 1];
      const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / TRAIL.step));
      for (let s = 0; s < steps; s++) {
        const u = (k + s / steps) / n;          // 0 = aeltester Punkt, 1 = Ball
        const px = a.x + (b.x - a.x) * s / steps, py = a.y + (b.y - a.y) * s / steps;
        const r = TRAIL.radius * (0.35 + 0.65 * u) * S;
        ctx.globalAlpha = pa * TRAIL.alpha * u * u / Math.sqrt(steps);
        ctx.drawImage(img, px * S - r, py * S - r, 2 * r, 2 * r);
      }
    }
    ctx.restore();
  }

  /** Funken: 1 Art-Pixel, additiv, Farbe Weiss -> Gelb -> Orange -> Rot, blenden zum Ende aus. */
  drawSparks(ctx, S) {
    if (!this.sparks.length) return;
    const C = SPARKS.colors, last = C.length - 1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.sparks) {
      const u = p.t / p.len, P = p.pal || C;
      const q = u * last, i = Math.min(last - 1, Math.floor(q)), w = q - i;
      const c0 = P[i], c1 = P[i + 1];
      const rgb = `rgb(${Math.round(c0[0] + (c1[0] - c0[0]) * w)},${Math.round(c0[1] + (c1[1] - c0[1]) * w)},${Math.round(c0[2] + (c1[2] - c0[2]) * w)})`;
      ctx.globalAlpha = 1 - u * u;
      ctx.fillStyle = rgb;
      const z = p.size === 2 && u < 0.6 ? 2 : 1;   // grosse Funken schrumpfen beim Ausgluehen
      ctx.fillRect(Math.round(p.x * S), Math.round(p.y * S), z * S, z * S);
    }
    ctx.restore();
  }

  /**
   * Derez (siehe DEREZ): intakte Pixel in Originalfarbe (Glitch-Zeilen, Weiss-Blitz, Farbversatz), geloeste Pixel
   * treiben (A) bzw. steigen/rieseln (B), heisse und funkelnde Pixel weiss, Tuerkis-Schimmer und Spuren additiv in
   * vier Helligkeitsstufen gebuendelt (je Stufe ein fill), dazu Scan-Front und Nachgluehen. Alles aufs Art-Raster.
   */
  drawDerez(ctx, S) {
    let any = false;
    const Z = DEREZ, TR = Z.trail, NB = 4;
    const hash = (i, k) => ((Math.imul(i ^ (k << 12), 0x9E3779B1) >>> 16) & 1023) / 1024;
    const L = this.derezLists || (this.derezLists = { glow: [[], [], [], []], hot: [], intact: [] });
    const fill = (list, style, a, dx = 0) => {
      if (!list.length || a <= 0) return;
      ctx.globalAlpha = Math.min(1, a);
      ctx.fillStyle = style;
      ctx.beginPath();
      for (let i = 0; i < list.length; i += 2) ctx.rect((list[i] + dx) * S, list[i + 1] * S, S, S);
      ctx.fill();
    };
    const bar = (x, y, w, h) => {   // Scan-Front: heisser Kern, Tuerkis-Schein drumherum
      ctx.globalAlpha = 0.35; ctx.fillStyle = Z.cyan;
      ctx.fillRect(Math.round(x - (w === 1 ? 1 : 0)) * S, Math.round(y - (h === 1 ? 1 : 0)) * S, (w === 1 ? 3 : w) * S, (h === 1 ? 3 : h) * S);
      ctx.globalAlpha = 1; ctx.fillStyle = Z.hotColor;
      ctx.fillRect(Math.round(x) * S, Math.round(y) * S, w * S, h * S);
    };
    for (const e of this.effects) {
      if (e.type !== 'derez') continue;
      if (!any) { ctx.save(); any = true; }
      const cfg = Z[e.kind], t = e.t, glitching = t < cfg.glitch;
      const white = t < Z.flash[0] ? 1 : Math.max(0, 1 - (t - Z.flash[0]) / (Z.flash[1] - Z.flash[0]));
      for (const b of L.glow) b.length = 0;
      L.hot.length = 0; L.intact.length = 0;
      const glow = (v, x, y) => { if (v > 0.03) L.glow[Math.min(NB - 1, Math.floor(v * NB))].push(x, y); };
      const { n, m, px, py, rel, life, spd, dir, col } = e;
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < n; i++) {
        const isB = i >= m, a = t - rel[i];
        if (a < 0) {
          // noch intakt: Kopie A zeichnet das Pixel, B bleibt als Geist stehen, wenn A schon weg ist
          if (isB && t < rel[i - m]) continue;
          let x = px[i];
          const y = py[i];
          if (glitching && hash(y, t >> 1) < 0.3) x += (hash(y, t + 77) < 0.5 ? -1 : 1) * (hash(y, t + 13) < 0.3 ? 2 : 1);
          ctx.globalAlpha = 1;
          ctx.fillStyle = col[i];
          ctx.fillRect(x * S, y * S, S, S);
          L.intact.push(x, y);
          if (a > -3 && !glitching) glow(0.9 * (1 + a / 3), x, y);   // die Front heizt vor
          continue;
        }
        const acc = isB ? e.accB : e.accA, sp = spd[i], d = dir[i], lf = life[i];
        if (!isB) {
          // Lichtspur hinter Kopie A: zurueckliegende Positionen, blasser
          for (let k = 1; k <= TR.count; k++) {
            const s = a - k * TR.step;
            if (s < 0) break;
            if (s >= lf) continue;
            glow(TR.alpha * (1 - k / (TR.count + 1)) * (1 - s / lf), Math.round(px[i] + d * (sp * s + acc * s * s)), py[i]);
          }
        }
        const q = a / lf;
        if (q >= 1) continue;
        const o = Math.round(d * (sp * a + acc * a * a));
        const x = isB ? px[i] : px[i] + o, y = isB ? py[i] + o : py[i];
        if (a < Z.hot || hash(i, t) < Z.twinkle) { L.hot.push(x, y); continue; }
        ctx.globalAlpha = (1 - q) * (1 - q);
        ctx.fillStyle = col[i];
        ctx.fillRect(x * S, y * S, S, S);
        glow(Z.tint * (1 - q), x, y);
      }
      fill(L.intact, '#fff', white);
      ctx.globalCompositeOperation = 'lighter';
      if (glitching) {
        const k = Z.chroma * (1 - t / cfg.glitch);
        fill(L.intact, Z.magenta, k, -1);
        fill(L.intact, Z.cyan, k, 1);
      }
      fill(L.hot, Z.hotColor, 1);
      for (let b = 0; b < NB; b++) fill(L.glow[b], Z.cyan, (b + 0.5) / NB);
      const f = (t - cfg.glitch) / cfg.front;
      if (cfg.sweep === 'h') {
        const span = Math.min(1, Math.max(0, f)) * e.hw;
        const ta = t - cfg.glitch - cfg.front;
        // Nachgluehen: duenne Linie im schon geloesten Bereich, verlischt nach dem Durchlauf
        const k = ta < 0 ? 0.45 : 0.45 * Math.pow(Math.max(0, 1 - ta / Z.afterglow), 2);
        if (f > 0 && k > 0) {
          ctx.globalAlpha = k; ctx.fillStyle = Z.cyan;
          ctx.fillRect(Math.round(e.cx - span) * S, Math.round(e.cy) * S, Math.round(2 * span) * S, S);
        }
        if (f >= 0 && f <= 1) { bar(e.cx - span, e.top - 2, 1, e.h + 4); bar(e.cx + span, e.top - 2, 1, e.h + 4); }
      } else if (cfg.sweep === 'v' && f >= 0 && f <= 1) {
        bar(e.left - 2, e.top + f * e.h, e.w + 4, 1);
      }
    }
    if (any) ctx.restore();
  }

  /** Lichtblitz ueber den Explosionen: heisser Kern, oranger Schein, Druckring (alles additiv). */
  drawBooms(ctx, S) {
    let any = false;
    for (const e of this.effects) {
      if (e.type !== 'boom') continue;
      if (!any) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; any = true; }
      const u = e.t / e.len, k = 1 - u;
      const cx = e.x * S, cy = e.y * S;
      const rg = BOOM.glow * e.scale * (0.75 + 0.45 * Math.sqrt(u)) * S;
      ctx.globalAlpha = BOOM.glowAlpha * k * k;
      ctx.drawImage(this.glowFire, cx - rg, cy - rg, 2 * rg, 2 * rg);
      const rc = BOOM.core * e.scale * (1 - 0.5 * u) * S;
      ctx.globalAlpha = BOOM.coreAlpha * k * k * k;
      ctx.drawImage(this.glowHot, cx - rc, cy - rc, 2 * rc, 2 * rc);
      const rr = (BOOM.ring[0] + (BOOM.ring[1] - BOOM.ring[0]) * Math.sqrt(u)) * e.scale * S;
      ctx.globalAlpha = BOOM.ringAlpha * k * k;
      ctx.strokeStyle = 'rgb(255,190,110)';
      ctx.lineWidth = Math.max(1, S * (1.5 - u));
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (any) ctx.restore();
  }

  drawPaddle(ctx, S, session) {
    const f = session.field;
    const p = f.paddle;
    const I = this.img;
    const frame = (this.tick % 6) < 3 ? 0 : 1;   // Duesen-Anim 0,05 s
    let shiftX = 0;
    if (this.exitAnim) {
      // durchs Portal hinausfahren
      const e = Math.min(1, this.exitAnim.t / EXITING_FRAMES);
      shiftX = this.exitAnim.side * e * e * 90;
    }
    const y = 290;
    const variant = session.laser ? 'laser' : p.type === PaddleType.CATCH ? 'catch' : 'normal';
    if (p.type === PaddleType.TWIN) {
      this.drawPaddleBody(ctx, S, ax(p.left) + shiftX, ax(p.left + 33), y, frame, variant);
      this.drawPaddleBody(ctx, S, ax(p.right - 32) + shiftX, ax(p.right + 1), y, frame, variant);
      return;
    }
    if (p.type === PaddleType.SHADOW) {
      ctx.globalAlpha = 0.45;
      this.drawPaddleBody(ctx, S, ax(p.bytes[8]), ax(p.bytes[7] + 1), y, frame, variant);
      ctx.globalAlpha = 0.65;
      this.drawPaddleBody(ctx, S, ax(p.bytes[6]), ax(p.bytes[5] + 1), y, frame, variant);
      ctx.globalAlpha = 1;
    }
    this.drawPaddleBody(ctx, S, ax(p.left) + shiftX, ax(p.right + 1) + shiftX, y, frame, variant);
  }

  /**
   * Schlaeger-Sprite (2 Frames 34x9) als 9-Slice wie in Unity: ein Bild, linke Kappe und rechte Kappe
   * (PADDLE_SLICE Pixel) bleiben unveraendert, nur das Mittelstueck wird auf die Zielbreite gedehnt
   * oder gestaucht (Nearest-Neighbour, keine Glaettung).
   */
  drawPaddleBody(ctx, S, x0, x1, y, frame, variant) {
    const I = this.img;
    let im = I.paddle;
    if (variant === 'laser' && I.paddleLaser) im = I.paddleLaser;
    if (variant === 'catch' && I.paddleCatch) im = I.paddleCatch;
    const w = Math.max(2 * PADDLE_SLICE + 1, Math.round(x1 - x0));
    const X = Math.round(x0 * S), Y = Math.round(y * S), W = w * S, H = 9 * S;
    const sy = frame * 9, cap = PADDLE_SLICE, mid = im.width - 2 * cap;
    ctx.drawImage(im, 0, sy, cap, 9, X, Y, cap * S, H);
    ctx.drawImage(im, cap, sy, mid, 9, X + cap * S, Y, W - 2 * cap * S, H);
    ctx.drawImage(im, im.width - cap, sy, cap, 9, X + W - cap * S, Y, cap * S, H);
    // Platzhalter-Kennzeichnung, solange die Varianten-Sprites fehlen
    if (variant === 'laser' && !I.paddleLaser) {
      ctx.fillStyle = '#FF5468';
      ctx.fillRect(X + 2 * S, Y - 2 * S, 3 * S, 3 * S);
      ctx.fillRect(X + W - 5 * S, Y - 2 * S, 3 * S, 3 * S);
    } else if (variant === 'catch' && !I.paddleCatch) {
      ctx.fillStyle = 'rgba(123,232,74,0.45)';
      ctx.fillRect(X, Y, W, 2 * S);
    }
  }
}

/** Stein-Byte -> Bildname. */
export function brickImage(v) {
  if ((v & KIND_MASK) !== KIND_SPECIAL) return BRICK_COLORS[(v >> 3) & 7];
  if (v & GOLD) return (v & REGENERATES) ? 'brickMover' : 'brickGold';
  if (v & REGENERATES) return 'brickRegen';
  return 'brickHard';
}

export function itemImage(key) {
  return { a: 'itemA', b: 'itemB', c: 'itemC', e: 'itemE', f: 'itemF', l: 'itemL', minus: 'itemMinus', n: 'itemN', o: 'itemO', x: 'itemX', xl: 'itemXl', what: 'itemWhat' }[key];
}
