// Spielablauf um den verifizierten Kern herum: Runden mit Portal-Auswahl, Leben, Punkte, Items, Laser,
// Gegner, nachwachsende Steine. Alles hier ist eigenes Gameplay; die Ball-/Schlaeger-/Steinmechanik
// kommt unveraendert aus core/playfield.js. Ein step() = ein Frame bei 60 Hz. Keine DOM-Abhaengigkeit.
//
// Koordinaten: Hardware-Pixel des Kerns (1 Einheit = 1 Original-Pixel, Y waechst nach oben,
// Feld X 16..192 bei 11 Spalten, Decke Y = 233 (Original 225 + lift 8), Schlaeger-Band Y 8..15).
import { MAX_BALLS, Playfield, StepResult, XorShiftRandomBit, fieldConfig } from '../core/playfield.js';
import { PaddleType, paddleGeometryFor } from '../core/paddle.js';
import { gridCellAt, horizontalReflectionOf, reflectHorizontal } from '../core/ballmotion.js';
import { GOLD, KIND_MASK, KIND_SPECIAL, ROWS, isMover } from '../core/brickgrid.js';
import { COLUMNS, ROUNDS, loadLevel } from './levels.js';
import { ITEMS, ITEM_H, ITEM_W, pickItem, resolveSurprise } from './items.js';

export const Phase = Object.freeze({
  INTRO: 'intro',        // Steine erscheinen, Schlaeger fliegt ein
  READY: 'ready',        // LEVEL NN / Name
  PLAYING: 'playing',
  BALL_LOST: 'ballLost', // letzter Ball im Phaser
  EXIT: 'exit',          // Portale offen, Spieler waehlt links/rechts
  EXITING: 'exiting',    // Schlaeger faehrt durchs Portal
  GAME_OVER: 'gameOver',
  COMPLETE: 'complete',  // alle 32 Runden geschafft
});

export const START_LIVES = 3;
export const INTRO_FRAMES = 110;
export const READY_FRAMES = 330;   // LEVEL NN / Name in der Drehschrift mit langsamem Ausdrehen
export const BALL_LOST_FRAMES = 78;   // 1,3 s nach dem Ballverlust, dann Schlaeger + Ball direkt (ohne Intro/Ansage)
export const EXITING_FRAMES = 80;
export const MEGA_FRAMES = 600;
export const MAX_ITEMS = 2;
export const MAX_SHOTS = 4;
export const SHOT_SPEED = 4;
export const ITEM_SPEED_16 = 11;       // 50 Art-Pixel/s = 40 Logik-Pixel/s = 0.667/Frame, in 1/16
export const EXTRA_LIFE_FIRST = 20000;
export const EXTRA_LIFE_EVERY = 60000;
export const ENEMY_W = 16, ENEMY_H = 19;   // Sprite 20x24 Art-Pixel / 1,25
export const REGEN_FRAMES = 540;           // Doppelblau waechst nach 9 s nach
export const MOVER_SLIDE = 24;             // Frames je Zelle des wandernden Goldsteins (50 Art-Pixel/s)

export const FIELD_LEFT = 0x10;
export const FIELD_RIGHT = 0x10 + 16 * COLUMNS;   // 192 = erste Position rechts vom Raster
export const FIELD_CENTER = (FIELD_LEFT + FIELD_RIGHT) >> 1;
export const LIFT = fieldConfig(COLUMNS).lift;
export const CEILING = 0xE1 + LIFT;

export class GameSession {
  constructor(seed = 1) {
    this.seed = seed >>> 0;
    this.rng = new XorShiftRandomBit(this.seed ^ 0xA5A5A5A5);
    this.field = new Playfield(fieldConfig(COLUMNS));
    this.field.random = new XorShiftRandomBit(this.seed);
    this.field.listener = this;
    this.field.difficulty = 1;
    this.field.solidGold = true;   // Gold ist auch fuer den Mega-Ball unzerstoerbar

    this.events = [];
    this.items = [];     // { key, x (Mitte), y16 (Unterkante in 1/16), age }
    this.shots = [];     // { x, y, age }
    this.enemies = [];   // { x, y (Mitte), vx, vy, age, drift }
    this.regens = [];    // { cell, value, timer }
    this.movers = [];    // { row, col, dir, from, to, t } wandernde Goldsteine, t < 0 = steht
    this.phase = Phase.GAME_OVER;
    this.phaseTimer = 0;
    this.round = 0;
    this.variant = 0;
    this.score = 0;
    this.lives = 0;
    this.frame = 0;
    this.pierceFrames = 0;
    this.laser = 0;            // 0 aus, 1 zwei Strahlen, 2 drei Strahlen
    this.nextExtraLife = EXTRA_LIFE_FIRST;
    this.exitSide = 0;         // -1 links, +1 rechts (EXIT/EXITING)
    this.exitPush = 0;         // Frames, die der Spieler gegen die Wand drueckt
    this.exitsOpen = false;    // auch waehrend PLAYING (Break-Item)
    this.enemySpawnTimer = 0;
    this.brickOrder = 0;       // Reihenfolge des Erscheinens (0 Zeilen, 1 Spalten, 2 Zufall)
    this.brickAppearSeed = 0;
    this.paddleEntrySide = 1;  // Einflug von links (-1) oder rechts (+1)
    this.ballsHidden = true;   // Baelle noch nicht sichtbar (INTRO)
    this.god = false;          // God Mode (Test): verlorene Baelle kosten kein Leben
  }

  /** Zufall [0,1) aus 24 Bits der Kern-Zufallsquelle (deterministisch pro Seed). */
  random() {
    let v = 0;
    for (let i = 0; i < 24; i++) v = (v << 1) | (this.rng.nextBit() ? 1 : 0);
    return v / 16777216;
  }

  randomInt(n) { return Math.floor(this.random() * n); }

  // ---------------------------------------------------------------- Ablauf

  /** Neues Spiel ab Runde round (0-basiert), Variante variant (0 links, 1 rechts); Normalfall Runde 1 links. */
  startGame(round = 0, variant = 0) {
    this.round = round;
    this.variant = variant;
    this.score = 0;
    this.lives = START_LIVES;
    this.nextExtraLife = EXTRA_LIFE_FIRST;
    this.loadRound();
  }

  loadRound() {
    loadLevel(this.round, this.variant, this.field.bricks);
    this.regens.length = 0;
    this.movers.length = 0;
    const cells = this.field.bricks.cells;
    for (let i = 0; i < cells.length; i++) {
      if (!isMover(cells[i])) continue;
      const col = i % COLUMNS;
      this.movers.push({ row: Math.floor(i / COLUMNS), col, dir: col < COLUMNS >> 1 ? 1 : -1, from: col, to: col, t: -1 });
    }
    this.items.length = 0;
    this.shots.length = 0;
    this.enemies.length = 0;
    this.exitsOpen = false;
    this.exitSide = 0;
    this.brickOrder = this.randomInt(3);
    this.brickAppearSeed = this.randomInt(1 << 30);
    this.enemySpawnTimer = 360 + this.randomInt(240);
    this.resetRound(true);
  }

  /**
   * Schlaeger in die Mitte, normaler Typ, neuer klebender Ball (Original-Rundenstart).
   * newRound: Intro (Steine, Beam) und Ansage LEVEL NN / Name. Nach einem Leben-Verlust (false) geht es
   * sofort weiter: Ball klebt auf dem Schlaeger, Abschuss per Feuer oder automatisch wie beim Rundenstart.
   */
  resetRound(newRound) {
    const p = this.field.paddle;
    p.center = FIELD_CENTER;
    p.setTypeImmediate(PaddleType.NORMAL);
    p.delta = 0;
    this.field.pierceBall = 0;
    this.pierceFrames = 0;
    this.laser = 0;
    this.field.flatReflect = 0;
    this.field.specialMode = 0;
    this.field.difficulty = difficulty(this.round);
    this.field.startRound(startSpeed(this.round), minSpeed(this.round));
    this.paddleEntrySide = this.random() < 0.5 ? -1 : 1;
    this.ballsHidden = newRound;
    this.phase = newRound ? Phase.INTRO : Phase.PLAYING;
    this.phaseTimer = INTRO_FRAMES;
    this.emit('roundStart', { round: this.round, variant: this.variant, newRound });
  }

  /**
   * Ein Frame. paddleDelta = gewuenschte Schlaegerbewegung in Logik-Pixeln (-127..127),
   * fire = Feuer in diesem Frame gedrueckt (Abschuss / Laser).
   */
  step(paddleDelta, fire) {
    this.events.length = 0;
    this.frame++;
    const f = this.field;
    switch (this.phase) {
      case Phase.INTRO:
        if (--this.phaseTimer <= 0) {
          this.phase = Phase.READY;
          this.phaseTimer = READY_FRAMES;
          this.ballsHidden = false;
          this.emit('ready');
        }
        break;

      case Phase.READY:
        f.movePaddle(paddleDelta & 0xFF);
        this.stickBallsToPaddle();
        if (--this.phaseTimer <= 0) {
          this.phase = Phase.PLAYING;
          this.emit('go');
        }
        break;

      case Phase.PLAYING: {
        if (fire && this.laser) this.fireLaser();
        const result = f.step(paddleDelta, fire);
        this.updateItems();
        this.updateShots();
        this.updateEnemies();
        this.updateRegens();
        this.updateMovers();
        if (this.pierceFrames > 0 && --this.pierceFrames === 0) {
          f.pierceBall = 0;
          this.emit('megaEnd');
        }
        if (this.phase !== Phase.PLAYING) break;   // Break-Item hat den Ablauf veraendert
        if (result === StepResult.ALL_BALLS_LOST) {
          this.phase = Phase.BALL_LOST;
          this.phaseTimer = BALL_LOST_FRAMES;
          this.items.length = 0;
          this.shots.length = 0;
          this.emit('lifeLost', { lives: this.lives });
        } else if (f.bricks.remaining === 0) {
          this.finishRound();
        } else if (this.exitsOpen) {
          this.checkExitChoice(paddleDelta);
        }
        break;
      }

      case Phase.BALL_LOST:
        if (--this.phaseTimer <= 0) {
          if (!this.god) this.lives--;   // God Mode: kein Leben verloren
          if (this.lives < 0) {
            this.phase = Phase.GAME_OVER;
            this.emit('gameOver', { score: this.score });
          } else {
            this.enemies.length = 0;
            this.resetRound(false);
          }
        }
        break;

      case Phase.EXIT:
        f.movePaddle(paddleDelta & 0xFF);
        this.updateEnemies();
        this.checkExitChoice(paddleDelta);
        break;

      case Phase.EXITING:
        if (--this.phaseTimer <= 0) this.nextRound();
        break;

      default:
        break;
    }
  }

  stickBallsToPaddle() {
    const f = this.field;
    for (let i = 0; i < MAX_BALLS; i++) {
      if (f.isActive(i) && f.balls[i].stickTimer !== 0) f.balls[i].x = f.paddle.center;
    }
  }

  finishRound() {
    this.score += 1000;
    this.removeBalls();
    this.items.length = 0;
    this.shots.length = 0;
    this.openExits();
    this.phase = Phase.EXIT;
    this.exitPush = 0;
    this.emit('roundClear', { round: this.round });
  }

  removeBalls() {
    const f = this.field;
    for (let i = 0; i < MAX_BALLS; i++) {
      if (!f.isActive(i)) continue;
      this.emit('ballVanish', { ball: i, x: f.balls[i].x, y: f.balls[i].y });
      f.setActive(i, false);
    }
    f.ballCount = 0;
  }

  openExits() {
    if (this.exitsOpen) return;
    this.exitsOpen = true;
    this.emit('exitsOpen');
  }

  /** Schlaeger gegen die Wand druecken = Portal waehlen (10 Frames Druck, damit es keine Fehlwahl gibt). */
  checkExitChoice(paddleDelta) {
    const p = this.field.paddle;
    const geo = paddleGeometryFor(p.type);
    const atLeft = p.left <= FIELD_LEFT && paddleDelta < 0;
    const atRight = p.right >= this.field.paddleRightLimit && paddleDelta > 0;
    if (atLeft || atRight) {
      if (++this.exitPush < 10) return;
      this.exitSide = atLeft ? -1 : 1;
      this.phase = Phase.EXITING;
      this.phaseTimer = EXITING_FRAMES;
      if (this.exitsOpen && this.field.bricks.remaining !== 0) this.score += 5000;   // Break-Bonus
      this.removeBalls();
      this.items.length = 0;
      this.shots.length = 0;
      this.enemies.length = 0;
      this.emit('exitChosen', { side: this.exitSide, width: geo[2] - geo[3] });
    } else {
      this.exitPush = 0;
    }
  }

  nextRound() {
    this.variant = this.exitSide > 0 ? 1 : 0;
    this.round++;
    if (this.round >= ROUNDS) {
      this.phase = Phase.COMPLETE;
      this.score += 50000;
      this.emit('gameComplete', { score: this.score });
      return;
    }
    this.loadRound();
  }

  addScore(n) {
    this.score += n;
    if (this.score >= this.nextExtraLife) {
      this.nextExtraLife += EXTRA_LIFE_EVERY;
      this.lives++;
      this.emit('extraLife', { lives: this.lives });
    }
  }

  // ---------------------------------------------------------------- Items

  updateItems() {
    const p = this.field.paddle;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.y16 -= ITEM_SPEED_16;
      it.age++;
      const y = it.y16 >> 4;
      const overPaddle = it.x + (ITEM_W >> 1) >= p.left && it.x - (ITEM_W >> 1) <= p.right + 3;
      if (y < 16 && y >= 2 && overPaddle) {
        this.items.splice(i, 1);
        this.addScore(1000);
        let key = it.key;
        if (key === 'what') key = resolveSurprise(() => this.random());
        this.emit('itemCaught', { key, name: ITEMS[key].name, x: it.x, y });
        this.applyItem(key);
      } else if (y < -ITEM_H) {
        this.items.splice(i, 1);
        this.emit('itemLost', { key: it.key });
      }
    }
  }

  spawnItem(cell) {
    if (this.items.length >= MAX_ITEMS) return;
    const col = cell % COLUMNS, row = Math.floor(cell / COLUMNS);
    const key = pickItem(() => this.random(), true);
    const it = { key, x: FIELD_LEFT + 8 + 16 * col, y16: (216 + LIFT - 8 * row) << 4, age: 0 };
    this.items.push(it);
    this.emit('itemSpawned', { key, cell });
  }

  applyItem(key) {
    const f = this.field;
    switch (key) {
      case 'e': this.laser = 0; this.setPaddleType(PaddleType.LARGE); break;
      case 'minus': this.laser = 0; this.setPaddleType(PaddleType.SMALL); break;
      case 'c': this.laser = 0; this.setPaddleType(PaddleType.CATCH); break;
      case 'n': this.laser = 0; this.setPaddleType(PaddleType.SHADOW); break;
      case 'l': this.setPaddleType(PaddleType.NORMAL); this.laser = 1; break;
      case 'xl': this.setPaddleType(PaddleType.NORMAL); this.laser = 2; break;
      case 'b': f.requestMultiball(3); break;
      case 'a':
        f.pierceBall = 1;
        this.pierceFrames = MEGA_FRAMES;
        break;
      case 'f':
        for (let i = 0; i < MAX_BALLS; i++) {
          if (!f.isActive(i)) continue;
          const b = f.balls[i];
          b.speed = Math.max(1, b.speed - 3);
          b.bouncesLeft = 40;
        }
        break;
      case 'o': this.lives++; this.emit('extraLife', { lives: this.lives }); break;
      case 'x': this.openExits(); break;
      default: break;
    }
  }

  /**
   * Typwechsel ohne Umbau-Animation. Vorher die Mitte so verschieben, dass die neue Geometrie in
   * L >= $10 und R <= Klemmgrenze passt (sonst wickeln die Bytes ueber); klebende Baelle wandern mit.
   */
  setPaddleType(type) {
    const f = this.field;
    const p = f.paddle;
    const geo = paddleGeometryFor(type);
    const cMin = FIELD_LEFT - geo[3], cMax = f.paddleRightLimit - geo[2];
    const c = Math.max(cMin, Math.min(cMax, p.center));
    const shift = c - p.center;
    p.center = c & 0xFF;
    p.setTypeImmediate(type);
    this.emit('paddleType', { type });
    if (shift === 0) return;
    for (let i = 0; i < MAX_BALLS; i++) {
      const b = f.balls[i];
      if (f.isActive(i) && b.stickTimer !== 0) b.x = (b.x + shift) & 0xFF;
    }
  }

  // ---------------------------------------------------------------- Laser

  fireLaser() {
    if (this.shots.length + 2 > MAX_SHOTS + 1) return;
    const p = this.field.paddle;
    const xs = this.laser === 2 ? [p.left + 3, p.center, p.right - 3] : [p.left + 3, p.right - 3];
    for (const x of xs) this.shots.push({ x: x & 0xFF, y: 16, age: 0 });
    this.emit('shot', { count: xs.length });
  }

  updateShots() {
    const grid = this.field.bricks;
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i];
      s.age++;
      let hit = false;
      for (let k = 0; k < SHOT_SPEED && !hit; k++) {
        s.y++;
        if (s.y >= CEILING) { hit = true; break; }
        const cell = gridCellAt(s.x, s.y, COLUMNS, LIFT);
        if (cell >= 0 && grid.hit(cell, false, -1, this)) hit = true;
      }
      if (!hit) {
        for (let e = this.enemies.length - 1; e >= 0; e--) {
          const en = this.enemies[e];
          if (Math.abs(en.x - s.x) <= ENEMY_W >> 1 && Math.abs(en.y - s.y) <= ENEMY_H >> 1) {
            this.killEnemy(e);
            hit = true;
            break;
          }
        }
      }
      if (hit) this.shots.splice(i, 1);
    }
  }

  // ---------------------------------------------------------------- Gegner (eigenes Gameplay, nicht aus dem ROM)

  maxEnemies() { return this.round < 3 ? 0 : this.round < 12 ? 1 : this.round < 24 ? 2 : 3; }

  updateEnemies() {
    const f = this.field;
    if (this.phase === Phase.PLAYING && this.enemies.length < this.maxEnemies()) {
      if (--this.enemySpawnTimer <= 0) {
        this.enemySpawnTimer = 480 + this.randomInt(360);
        const side = this.random() < 0.5 ? -1 : 1;
        const x = side < 0 ? FIELD_LEFT + 28 : FIELD_RIGHT - 28;   // unter den oberen Tueren
        this.enemies.push({ x, y: CEILING + 10, vx: 0, vy: -0.35, age: 0, drift: this.random() * 6.28 });
        this.emit('enemySpawn', { side });
      }
    }
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const en = this.enemies[i];
      en.age++;
      en.drift += 0.02;
      en.vx = Math.sin(en.drift) * 0.6;
      let nx = en.x + en.vx, ny = en.y + en.vy;
      // nicht durch Steine: unter dem Gegner eine Zelle pruefen
      const below = gridCellAt(Math.round(nx) & 0xFF, Math.round(ny - (ENEMY_H >> 1)) & 0xFF, COLUMNS, LIFT);
      if (below >= 0 && f.bricks.cells[below] !== 0) {
        ny = en.y;
        nx = en.x + (Math.sin(en.drift) >= 0 ? 0.8 : -0.8);
      }
      if (nx < FIELD_LEFT + (ENEMY_W >> 1)) { nx = FIELD_LEFT + (ENEMY_W >> 1); en.drift += 3.14; }
      if (nx > FIELD_RIGHT - (ENEMY_W >> 1)) { nx = FIELD_RIGHT - (ENEMY_W >> 1); en.drift += 3.14; }
      en.x = nx;
      en.y = ny;
      if (en.y < -ENEMY_H) { this.enemies.splice(i, 1); continue; }
      // haengt er noch in der Tuer fest (unsichtbar ueber der Decke), verschwindet er, damit ein neuer kommen kann
      en.hidden = en.y - (ENEMY_H >> 1) > CEILING - 6 ? (en.hidden || 0) + 1 : 0;
      if (en.hidden > 180) { this.enemies.splice(i, 1); continue; }

      // Schlaeger-Kontakt: Gegner zerplatzt
      const p = f.paddle;
      if (en.y - (ENEMY_H >> 1) < 16 && en.x + (ENEMY_W >> 1) >= p.left && en.x - (ENEMY_W >> 1) <= p.right) {
        this.killEnemy(i);
        continue;
      }
      // Ball-Kontakt
      for (let b = 0; b < MAX_BALLS; b++) {
        if (!f.isActive(b)) continue;
        const ball = f.balls[b];
        if (ball.stickTimer !== 0) continue;
        const bx0 = ball.x - 3, bx1 = ball.x + 1, by0 = ball.y - 3, by1 = ball.y + 1;
        const ex0 = en.x - (ENEMY_W >> 1), ex1 = en.x + (ENEMY_W >> 1), ey0 = en.y - (ENEMY_H >> 1), ey1 = en.y + (ENEMY_H >> 1);
        const ox = Math.min(bx1, ex1) - Math.max(bx0, ex0);
        const oy = Math.min(by1, ey1) - Math.max(by0, ey0);
        if (ox <= 0 || oy <= 0) continue;
        this.enemyBounce(ball, ox < oy);
        this.killEnemy(i);
        break;
      }
    }
  }

  /**
   * Gegnertreffer ($35F6, nach Spec 5.1): von der Seite tauscht das Original die Winkel
   * (53.1 <-> 36.9, 63.4 <-> 26.6) und schickt den Ball nach unten; von oben/unten waagerechte Reflexion.
   */
  enemyBounce(ball, fromSide) {
    ball.phase &= 0x7F;
    if (!fromSide) {
      reflectHorizontal(ball);
      return;
    }
    const xPlus = (ball.direction & 0x10) !== 0;
    const idx = (8 - (ball.direction & 0x0F)) & 0x0F;
    let code;
    if (!xPlus) code = idx < 8 ? (16 - idx) & 0x1F : idx;        // Quadrant 1 (runter, X-)
    else code = idx >= 8 ? 16 + ((16 - idx) & 0x0F) : 16 + idx;   // Quadrant 2 (runter, X+)
    if ((code & 7) === 0) code |= 1;
    ball.direction = code & 0x1F;
    if (ball.bouncesLeft !== 0) ball.bouncesLeft--;
  }

  killEnemy(i) {
    const en = this.enemies[i];
    this.enemies.splice(i, 1);
    this.addScore(500);
    this.emit('enemyKilled', { x: en.x, y: en.y });
  }

  // ---------------------------------------------------------------- Nachwachsende Steine

  updateRegens() {
    for (let i = this.regens.length - 1; i >= 0; i--) {
      const e = this.regens[i];
      if (--e.timer > 0) continue;
      if (this.field.bricks.cells[e.cell] === 0 && !this.ballInCell(e.cell)) {
        this.field.bricks.cells[e.cell] = e.value;
        this.regens.splice(i, 1);
        this.emit('brickRegrown', { cell: e.cell, value: e.value });
      } else {
        e.timer = 30;
      }
    }
  }

  /** Beruehrt ein Ball (mit 1 px Rand) die Zelle? Dann darf dort kein Stein entstehen. */
  ballInCell(cell) {
    const f = this.field;
    for (let i = 0; i < MAX_BALLS; i++) {
      if (!f.isActive(i)) continue;
      const b = f.balls[i];
      // Ballkasten x-3..x+1, y-3..y+1 ist kleiner als eine Zelle: jede Ueberlappung trifft eine Ecke
      for (const [px, py] of [[b.x - 4, b.y - 4], [b.x + 2, b.y - 4], [b.x - 4, b.y + 2], [b.x + 2, b.y + 2]]) {
        if (gridCellAt(px & 0xFF, py & 0xFF, COLUMNS, LIFT) === cell) return true;
      }
    }
    return false;
  }

  // ---------------------------------------------------------------- Wandernde Goldsteine

  moverCanEnter(m, col) {
    if (col < 0 || col >= COLUMNS) return false;
    const cell = m.row * COLUMNS + col;
    return this.field.bricks.cells[cell] === 0 && !this.ballInCell(cell);
  }

  /**
   * Gleitet Zelle fuer Zelle waagerecht. Steine, Rand oder ein Ball im Weg = Richtungswechsel.
   * Im Raster springt der Stein zur Haelfte des Gleitens; ist das Ziel dann belegt, gleitet er zurueck.
   */
  updateMovers() {
    const cells = this.field.bricks.cells;
    const half = MOVER_SLIDE >> 1;
    for (const m of this.movers) {
      if (m.t < 0) {
        if (!this.moverCanEnter(m, m.col + m.dir)) {
          m.dir = -m.dir;
          if (!this.moverCanEnter(m, m.col + m.dir)) continue;
        }
        m.from = m.col;
        m.to = m.col + m.dir;
        m.t = 0;
      }
      m.t++;
      if (m.t === half && m.to !== m.col) {
        if (this.moverCanEnter(m, m.to)) {
          const src = m.row * COLUMNS + m.col, dst = m.row * COLUMNS + m.to;
          cells[dst] = cells[src];
          cells[src] = 0;
          m.col = m.to;
          this.emit('brickMoved', { from: src, to: dst });
        } else {
          // zurueckgleiten: Ziel und Herkunft tauschen, Fortschritt spiegeln
          m.dir = -m.dir;
          m.to = m.from;
          m.from = m.col + -m.dir;
          m.t = MOVER_SLIDE - m.t;
        }
      }
      if (m.t >= MOVER_SLIDE) m.t = -1;
    }
  }

  /** Sichtbarer Versatz (in Zellen) des Goldsteins in Zelle cell waehrend des Gleitens, sonst 0. */
  moverOffset(cell) {
    for (const m of this.movers) {
      if (m.t < 0 || m.row * COLUMNS + m.col !== cell) continue;
      return m.from + (m.to - m.from) * (m.t / MOVER_SLIDE) - m.col;
    }
    return 0;
  }

  // ---------------------------------------------------------------- Kern-Ereignisse

  emit(kind, data) {
    this.events.push(data ? Object.assign({ kind }, data) : { kind });
  }

  onLaunch(ball) { this.emit('launch', { ball }); }
  onPaddleHit(ball, code) {
    const b = this.field.balls[ball];
    const d = (b.x - this.field.paddle.left) & 0xFF;
    this.emit('paddleHit', { ball, code, edge: d < 6 || d > 29 });
  }
  onCatch(ball) { this.emit('catch', { ball }); }
  onPaddleFlatBounce(ball) { this.emit('paddleHit', { ball, code: -1, edge: false }); }
  onShadowHit(ball, hitCount) {
    this.addScore(100 * hitCount);
    this.emit('shadowHit', { ball, hitCount });
  }
  onWallBounce(ball) { this.emit('wall', { ball, side: this.field.balls[ball].x >= FIELD_CENTER ? 1 : -1 }); }
  onCeilingBounce(ball) { this.emit('ceiling', { ball }); }
  onSpeedUp(ball, speed) { this.emit('speedUp', { ball, speed }); }
  onRandomTurn(ball, code) { this.emit('randomTurn', { ball, code }); }
  onBallLost(ball, x, y) {
    this.emit('ballLost', { ball, x, y, remaining: this.field.ballCount });
  }
  onIdleLimit() {}

  onBrickHit(ball, cell, before, after) {
    this.emit('brickHit', { ball, cell, before, after, gold: before === after });
  }

  onBrickDestroyed(ball, cell, value, capsule, regenerates) {
    const kind = value & KIND_MASK;
    if (kind === KIND_SPECIAL) {
      if ((value & GOLD) !== 0) this.addScore(200);
      else if (regenerates) this.addScore(100);
      else this.addScore(50 * (this.round + 1));
    } else {
      this.addScore((((value >> 3) & 7) + 5) * 10);
    }
    if (regenerates) this.regens.push({ cell, value, timer: REGEN_FRAMES });
    this.emit('brickDestroyed', { ball, cell, value, regenerates });
    if (capsule && this.phase === Phase.PLAYING) this.spawnItem(cell);
  }
}

// Tempo-Kurve ueber alle 32 Runden gestreckt (User 2026-10-07): Runde 32 = fruehere Runde 15
// (Start 8, Minimum 11, Tabelle 2); die schnelle Speed-Up-Tabelle 3 wird nicht mehr benutzt.
/** Startgeschwindigkeit: Runde 1 wie das Original (5, im ersten Frame 6); alle 8 Runden +1, Runde 25-32 = 8. */
export function startSpeed(round) { return Math.min(8, 5 + Math.floor(round / 8)); }
/** Mindest-Speed nach Deckenkontakt, Runde 1 wie das Original (7); alle 7 Runden +1, hoechstens 11. */
export function minSpeed(round) { return Math.min(11, 7 + Math.floor(round / 7)); }
/** Speed-Up-Tabelle (SPEED_UP_BOUNCES): Runde 1-16 = 1, ab Runde 17 = 2. */
export function difficulty(round) { return round < 16 ? 1 : 2; }
