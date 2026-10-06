// Darstellung des laufenden Spiels: Steine mit Schatten, Items, Gegner, Laser, Schlaeger (gesliced),
// Baelle, Effekte, Ankuendigungen. Rechnet Logik-Koordinaten (Hardware-Pixel des Kerns) in Art-Pixel um:
//   Art-X = 10 + 1,25 * (hwX - 16)      Art-Y = 301 - 1,25 * hwY   (Decke hwY 233 -> Art 9,75)
// Alle Positionen werden erst beim Zeichnen mit der Geraete-Skalierung S multipliziert und gerundet,
// so bleibt die 1,25-Schrittweite bei 4x exakt (5 Geraete-Pixel je Logik-Pixel).
import { INNER, PHASER_Y, boardState, flickerPhaser } from './board.js';
import { BRICK_COLORS } from './assets.js';
import { SpinText } from './spintext.js';
import { GOLD, HITS_MASK, KIND_MASK, KIND_SPECIAL, REGENERATES, ROWS } from '../core/brickgrid.js';
import { PaddleType } from '../core/paddle.js';
import { MAX_BALLS } from '../core/playfield.js';
import { Phase, INTRO_FRAMES, READY_FRAMES, EXITING_FRAMES, ENEMY_W, ENEMY_H } from '../play/session.js';
import { COLUMNS } from '../play/levels.js';

export const ax = (hw) => 10 + 1.25 * (hw - 16);
export const ay = (hw) => 301 - 1.25 * hw;
/** 9-Slice-Metadaten des Schlaegers (paddle-thrust.png, 34 px breit): linke und rechte Kappe je 9 px, Mitte dehnbar. */
export const PADDLE_SLICE = 9;
const ITEM_FRAMES = [0, 1, 2, 3, 4, 5, 5, 5, 5, 6, 7, 8, 9];   // 6. Frame viermal halten (Items_Frame_Zeitangabe.doc)

export class GameView {
  constructor(assets, fonts, board, audio) {
    this.img = assets.img;
    this.spin = fonts.spin;
    this.con = fonts.console;
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
    this.lostBall = null;         // { x, y, t } Ball faellt in den Phaser
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
  }

  rand() {
    this.rng = (this.rng * 1103515245 + 12345) & 0x7FFFFFFF;
    return this.rng / 0x7FFFFFFF;
  }

  // ---------------------------------------------------------------- Ereignisse der Session

  handleEvents(session) {
    for (const e of session.events) {
      switch (e.kind) {
        case 'roundStart':
          this.startIntro(session, e.newRound);
          break;
        case 'ready':
          this.say(`ROUND ${String(session.round + 1).padStart(2, '0')}`, 30, 128);
          this.queue = [{ at: 120, text: 'READY', hold: 30 }, { at: 235, text: 'GO', hold: 40 }];
          this.audio.play('beep');
          break;
        case 'go':
          this.phaserOn(true);
          break;
        case 'launch': break;
        case 'paddleHit':
          this.audio.play('paddle', 1, e.edge ? 1.15 : 1);
          break;
        case 'catch': this.audio.play('paddle', 0.8, 0.8); break;
        case 'wall': this.audio.play('wall', 0.7, e.side > 0 ? 1.05 : 0.95); break;
        case 'ceiling': this.audio.play('wall', 0.7, 1.1); break;
        case 'brickHit':
          this.audio.play('brick', 0.9, e.gold ? 0.6 : 0.85);
          this.effects.push({ type: 'shake', cell: e.cell, t: 0, len: 6 });
          break;
        case 'brickDestroyed':
          this.audio.play('brick', 1, 1 + ((e.value >> 3) & 7) * 0.04);
          this.effects.push({ type: 'destroy', cell: e.cell, t: 0, len: 9 });
          break;
        case 'brickRegrown':
          this.effects.push({ type: 'shine', cell: e.cell, t: 0, len: 12 });
          break;
        case 'itemSpawned': break;
        case 'itemCaught':
          this.audio.play('beep', 0.8, 1.3);
          this.texts.push({ text: e.name, x: Math.min(200, Math.max(40, ax(e.x))), y: ay(e.y) - 30, t: 0, len: 70 });
          break;
        case 'paddleType': break;
        case 'shot': this.audio.play('brick', 0.5, 2.2); break;
        case 'enemySpawn':
          this.openTopDoor(e.side < 0 ? 0 : 1);
          this.audio.play('doorOpen', 0.6);
          break;
        case 'enemyKilled':
          this.explode(ax(e.x), ay(e.y), 1);
          this.audio.play('phaser', 0.6, 1.4);
          break;
        case 'ballLost':
          this.lostBall = { x: ax(e.x - 3) - 0.5, y: ay(e.y + 1) - 0.5, t: 0 };
          break;
        case 'lifeLost':
          this.paddleVisible = true;
          break;
        case 'ballVanish':
          this.explode(ax(e.x - 1), ay(e.y - 1), 0.6);
          break;
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

  startIntro(session, newRound) {
    this.effects.length = 0;
    this.texts.length = 0;
    this.announces.length = 0;
    this.queue = [];
    this.lostBall = null;
    this.exitAnim = null;
    this.doorAnim.left = 0; this.doorAnim.right = 0;
    this.bs.doorLeft = 0; this.bs.doorRight = 0;
    this.lightMode = 'idle';
    this.phaserOn(false);
    this.introTimer = 0;
    this.paddleVisible = false;
    this.beamFrame = 0;
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
  }

  // ---------------------------------------------------------------- pro Logik-Frame

  update(session) {
    this.tick++;
    const bs = this.bs;
    // Ankuendigungs-Warteschlange (READY -> GO)
    if (this.queue && this.queue.length && session.phase === Phase.READY) {
      const elapsed = READY_FRAMES - session.phaseTimer;
      if (elapsed >= this.queue[0].at) {
        const q = this.queue.shift();
        for (const a of this.announces) a.stop();
        this.say(q.text, q.hold, 128);
        this.audio.play('beep', 0.7, q.text === 'GO' ? 1.5 : 1.1);
      }
    }
    for (const a of this.announces) a.update();
    this.announces = this.announces.filter((a) => !a.done);
    for (const t of this.texts) t.t++;
    this.texts = this.texts.filter((t) => t.t < t.len);
    for (const e of this.effects) e.t++;
    this.effects = this.effects.filter((e) => e.t < e.len);

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
    // Ball verloren: faellt in den Phaser
    if (this.lostBall) {
      const lb = this.lostBall;
      lb.t++;
      lb.y += 2.5;
      if (lb.y >= PHASER_Y + 2) {
        this.explode(lb.x + 3, PHASER_Y + 6, 1);
        this.phaserFlash = 14;
        this.audio.play('phaser', 1, 0.7);
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
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    for (let i = 0; i < cells.length; i++) {
      if (!visible(i)) continue;
      const col = i % COLUMNS, row = Math.floor(i / COLUMNS);
      ctx.fillRect((10 + 20 * col + 3) * S, (11 + 10 * row + 3) * S, 20 * S, 10 * S);
    }
    for (let i = 0; i < cells.length; i++) {
      if (!visible(i)) continue;
      const col = i % COLUMNS, row = Math.floor(i / COLUMNS);
      let x = 10 + 20 * col, y = 11 + 10 * row;
      const shake = this.effects.find((e) => e.type === 'shake' && e.cell === i);
      if (shake) x += (shake.t & 1) ? 1 : -1;
      const im = I[brickImage(cells[i])];
      ctx.drawImage(im, 0, 0, 20, 10, Math.round(x * S), Math.round(y * S), 20 * S, 10 * S);
    }
    // Effekte auf Zellen
    for (const e of this.effects) {
      if (e.type !== 'destroy' && e.type !== 'shine') continue;
      const col = e.cell % COLUMNS, row = Math.floor(e.cell / COLUMNS);
      const x = 10 + 20 * col, y = 11 + 10 * row;
      if (e.type === 'destroy') {
        const fr = Math.min(2, Math.floor(e.t / 3));
        ctx.drawImage(I.brickDestroyed, 0, fr * 10, 20, 10, x * S, y * S, 20 * S, 10 * S);
      } else if (cells[e.cell] !== 0) {
        const fr = Math.min(5, Math.floor(e.t / 2));
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.7;
        ctx.drawImage(I.brickShine, 0, fr * 10, 20, 10, x * S, y * S, 20 * S, 10 * S);
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
    if (this.paddleVisible && session.phase !== Phase.GAME_OVER) this.drawPaddle(ctx, S, session);
    if (this.beamFrame >= 0) {
      const cx = ax(f.paddle.center) - 46, cy = 295 - 19;
      ctx.drawImage(I.paddleBeam, 0, this.beamFrame * 19, 93, 19, Math.round(cx * S), Math.round(cy * S), 93 * S, 19 * S);
    }
    // Baelle
    if (!session.ballsHidden) {
      for (let i = 0; i < MAX_BALLS; i++) {
        if (!f.isActive(i)) continue;
        const b = f.balls[i];
        const x = ax(b.x - 3) - 0.5, y = ay(b.y + 1) - 0.5;
        if (f.pierceBall) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = (this.tick & 4) ? 'rgba(255,120,40,0.55)' : 'rgba(255,200,80,0.45)';
          ctx.beginPath();
          ctx.arc((x + 3) * S, (y + 3) * S, 5 * S, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }
        ctx.drawImage(I.ball, Math.round(x * S), Math.round(y * S), 6 * S, 6 * S);
      }
    }
    if (this.lostBall) ctx.drawImage(I.ball, Math.round(this.lostBall.x * S), Math.round(this.lostBall.y * S), 6 * S, 6 * S);
    ctx.restore();
    this.board.drawFrame(ctx);

    // Explosionen (auch ueber den Rohren)
    for (const e of this.effects) {
      if (e.type !== 'explosion') continue;
      const fr = Math.min(7, Math.floor(e.t / 3));
      const w = 24 * e.scale, h = 21 * e.scale;
      ctx.drawImage(I.explosion, 0, fr * 21, 24, 21, Math.round((e.x - w / 2) * S), Math.round((e.y - h / 2) * S), Math.round(w * S), Math.round(h * S));
    }
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
    const y = 285;
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
  if (v & GOLD) return 'brickGoldHard';
  if (v & REGENERATES) return 'brickViolet';
  return (v & HITS_MASK) >= 16 ? 'brickGrey' : 'brickSilver';
}

export function itemImage(key) {
  return { a: 'itemA', b: 'itemB', c: 'itemC', e: 'itemE', f: 'itemF', l: 'itemL', minus: 'itemMinus', n: 'itemN', o: 'itemO', x: 'itemX', xl: 'itemXl', what: 'itemWhat' }[key];
}
