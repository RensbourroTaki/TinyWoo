// Spielfeld: Baelle, Schlaeger und Steinraster. Ein step() = ein Frame bei 60 Hz.
//
// Koordinaten in Logik-Pixeln, Y waechst nach oben. Waende: links X 16, rechts 16 + 16 * columns.
// Steinraster: Zeile 0 oben, Zelle 16 x 8, Zeile r belegt Y 224 - 8r .. 231 - 8r (GRID_TOP = 232).
// Decke bei Y 233. Ganze Pixel zaehlen wie Kaestchen: ein Ball bei x belegt die Pixelspalten floor(x - 4)..floor(x).
//
// Tempo: Stufe n = n / 2 Pixel je Frame auf der Hauptachse des Balls. Nach RAMP[n] Abprallern (Waende, Decke,
// Steine; nicht der Schlaeger) steigt die Stufe, sobald der Ball nach oben fliegt. Flache Baelle (mehr als
// ~63 Grad zur Senkrechten) laufen zwei Stufen schneller. An der Decke faellt er nie unter minLevel.
//
// Schlaeger: Der Abprallwinkel haengt davon ab, wie nah der Ball an der Kante trifft (EDGE_BANDS), die Seite davon,
// ob er links oder rechts der Mitte landet.
import { Ball } from './ball.js';
import { Paddle, PaddleType } from './paddle.js';
import { BrickGrid, ROWS, isGold } from './bricks.js';
import { XorShift32 } from './rng.js';

export const MAX_BALLS = 32;
export const FIELD_LEFT = 16;
export const GRID_TOP = 232;
export const CEILING = 233;
export const MAX_LEVEL = 15;

export const StepResult = Object.freeze({ NORMAL: 0, ALL_BALLS_LOST: 1 });

/** Abpraller bis zur naechsten Tempostufe, Index = gerade erreichte Stufe. */
const RAMP = [40, 40, 40, 40, 40, 40, 80, 90, 120, 150, 180, 220, 250, 275, 300];
/** Auf der hoechsten Stufe: alle so viele Abpraller ein kleiner Zufalls-Dreh (gegen Endlosschleifen). */
const TOP_NUDGE_BOUNCES = 60;
const FLAT_BOOST = 2;
const FLAT_BOOST_CAP = 14;
/** Flach = Nebenachse hoechstens so gross (Richtung ist auf Hauptachse 1 normiert). */
const FLAT_LIMIT = 0.5;
/** Winkelabstand der Baelle beim Multiball und beim Zufalls-Dreh (Grad). */
const FAN_STEP = 11.25;
/** So weit (Grad) bleibt ein Ball mindestens von der Senkrechten und der Waagerechten weg. */
const AXIS_GAP = 12;
/**
 * Schlaeger-Abprall: Abstand der Ballmitte zur Kante des Trefferfensters (Pixel) -> Richtung (quer, hoch).
 * Das Fenster ist 2 Pixel breiter als der Schlaeger. Der 37-Grad-Streifen gibt es nur bei breiten Schlaegern.
 */
const EDGE_BANDS = [
  { within: 4, dir: [1, 0.5] },                   // ganz aussen: flach
  { within: 10, dir: [1, 0.75] },
  { within: 19, dir: [0.75, 1], minHalf: 24 },
  { within: Infinity, dir: [0.5, 1] },            // Mitte: steil
];
const PADDLE_BAND = 8;      // so tief unter der Schlaeger-Oberkante wird noch gefangen
const CATCH_FRAMES = 120;   // Catch-Schlaeger: so lange klebt der Ball

export const speedOf = (level) => level * 0.5;

export class Field {
  constructor(columns) {
    this.columns = columns;
    this.rightWall = FIELD_LEFT + 16 * columns;    // erste X-Position rechts vom Raster
    this.ballMaxX = this.rightWall - 1;            // rechte Ballkante hoechstens hier
    this.paddleRightLimit = this.rightWall - 1;

    this.balls = [];
    for (let i = 0; i < MAX_BALLS; i++) this.balls.push(new Ball());
    this.active = new Array(MAX_BALLS).fill(false);
    this.ballCount = 0;
    this.paddle = new Paddle();
    this.bricks = new BrickGrid(columns);

    this.paddleTop = 16;        // Schlaeger-Oberkante (Y); darunter PADDLE_BAND Fangzone, dann ist der Ball weg
    this.pierceBall = 0;        // ungleich 0 = Mega-Ball schlaegt durch
    this.solidGold = false;     // Gold haelt auch dem Mega-Ball stand
    this.floorBounce = 0;       // ungleich 0 = Ball prallt unten ab statt verloren zu gehen (Deflector)
    this.floorBounceDrop = 9;   // Deflector-Abprall so viele Pixel unter der Verlust-Ebene
    this.minLevel = 0;          // Mindest-Tempo nach Deckenkontakt
    this.multiballPending = 0;  // > 0 = so viele Baelle im naechsten Frame

    this.random = new XorShift32(1);
    /** Ereignis-Empfaenger (alle Methoden optional): onLaunch, onPaddleHit, onCatch, onWallBounce, onCeilingBounce,
     *  onSpeedUp, onRandomTurn, onBallLost, onFloorBounce, onBrickHit, onBrickDestroyed. */
    this.listener = null;
  }

  isActive(i) { return this.active[i]; }

  setActive(i, on) {
    if (this.active[i] === on) return;
    this.active[i] = on;
    this.ballCount += on ? 1 : -1;
  }

  activeBalls() {
    const r = [];
    for (let i = 0; i < MAX_BALLS; i++) if (this.active[i]) r.push(i);
    return r;
  }

  /** Zelle (Index) unter dem Punkt oder -1 ausserhalb des Rasters. */
  cellAt(x, y) {
    const col = Math.floor((Math.floor(x) - FIELD_LEFT) / 16);
    const row = Math.floor((GRID_TOP - 1 - Math.floor(y)) / 8);
    return this.cellIndex(col, row);
  }

  cellIndex(col, row) {
    if (col < 0 || col >= this.columns || row < 0 || row >= ROWS) return -1;
    return row * this.columns + col;
  }

  /**
   * Rundenstart: ein Ball klebt 180 Frames auf der Schlaegermitte und startet steil nach links oben.
   * level = Start-Tempo, minLevel = Mindest-Tempo nach Deckenkontakt.
   */
  startRound(level, minLevel) {
    this.active.fill(false);
    this.ballCount = 0;
    const b = this.balls[0];
    b.x = this.paddle.center;
    b.y = this.paddleTop;
    b.dx = -0.5;
    b.dy = 1;
    b.level = level;
    b.bouncesLeft = RAMP[level] ?? TOP_NUDGE_BOUNCES;
    b.stuck = 180;
    this.setActive(0, true);
    this.multiballPending = 0;
    this.minLevel = minLevel;
  }

  /** Im naechsten Frame auf count Baelle auffaechern (vom ersten aktiven Ball aus). */
  requestMultiball(count) {
    this.multiballPending = Math.min(MAX_BALLS, count);
  }

  /** Ein Frame. paddleDelta = gewuenschte Schlaegerbewegung (Pixel), fire = Feuer in diesem Frame gedrueckt. */
  step(paddleDelta, fire) {
    this.movePaddle(paddleDelta);
    if (this.ballCount === 0) return StepResult.ALL_BALLS_LOST;
    if (this.multiballPending) this.splitMultiball(this.multiballPending);
    for (let i = 0; i < MAX_BALLS; i++) if (this.active[i]) this.updateBall(i, this.balls[i], fire);
    return StepResult.NORMAL;
  }

  // ---------------------------------------------------------------- Schlaeger

  movePaddle(delta) {
    const p = this.paddle;
    let d = delta;
    if (p.left + d < FIELD_LEFT) d = FIELD_LEFT - p.left;
    if (p.right + d > this.paddleRightLimit) d = this.paddleRightLimit - p.right;
    p.center += d;
    p.delta = d;
  }

  // ---------------------------------------------------------------- Ball

  updateBall(i, b, fire) {
    const L = this.listener;
    if (b.stuck > 0) {
      b.stuck--;
      if (b.stuck > 0 && !fire) {
        b.x += this.paddle.delta;
        return;
      }
      b.stuck = 0;
      if (L && L.onLaunch) L.onLaunch(i);
    }

    const flat = Math.abs(b.dy) <= FLAT_LIMIT + 1e-9;
    const level = flat ? Math.max(b.level, Math.min(b.level + FLAT_BOOST, FLAT_BOOST_CAP)) : b.level;
    const v = speedOf(level);
    this.move(i, b, b.dx * v, b.dy * v);

    if (b.bouncesLeft === 0 && b.movingUp) {
      if (b.level < MAX_LEVEL) {
        b.level++;
        b.bouncesLeft = RAMP[b.level] ?? TOP_NUDGE_BOUNCES;
        if (L && L.onSpeedUp) L.onSpeedUp(i, b.level);
      } else {
        b.angle = clearOfAxes(b.angle + (this.random.nextBit() ? FAN_STEP : -FAN_STEP));
        b.bouncesLeft = TOP_NUDGE_BOUNCES;
        if (L && L.onRandomTurn) L.onRandomTurn(i);
      }
    }

    if (!b.movingUp) this.checkPaddle(i, b);
  }

  /** Bewegt den Ball um (mx, my): Waende und Decke spiegeln, Steine werden getroffen. */
  move(i, b, mx, my) {
    const L = this.listener;
    const ox = b.x, oy = b.y;
    let nx = ox + mx, ny = oy + my;

    if (b.dx < 0 && nx - 4 < FIELD_LEFT) {
      nx += 2 * (FIELD_LEFT - (nx - 4));
      b.flipX();
      if (L && L.onWallBounce) L.onWallBounce(i);
    } else if (b.dx > 0 && nx >= this.ballMaxX) {
      nx -= 2 * (nx - this.ballMaxX);
      b.flipX();
      if (L && L.onWallBounce) L.onWallBounce(i);
    }
    if (b.dy > 0 && ny >= CEILING) {
      ny -= 2 * (ny - CEILING);
      b.flipY();
      if (b.level < this.minLevel) b.level = this.minLevel;
      if (L && L.onCeilingBounce) L.onCeilingBounce(i);
    }

    const hit = this.collideBricks(i, b, ox, oy, nx, ny);
    b.x = hit ? hit.x : nx;
    b.y = hit ? hit.y : ny;
  }

  /**
   * Steine an der Vorderseite des Balls. Geprueft wird nur die Spalte bzw. Zeile, in die der Ball in diesem Frame
   * neu hineinragt (ein Frame ist kuerzer als eine Zelle). Liefert die korrigierte Position oder null.
   */
  collideBricks(i, b, ox, oy, nx, ny) {
    const right = b.dx > 0, up = b.dy > 0;
    const colOf = (px) => Math.floor((px - FIELD_LEFT) / 16);
    const rowOf = (py) => Math.floor((GRID_TOP - 1 - py) / 8);
    // Vorderkante (Pixel) vorher/nachher
    const fx0 = Math.floor(right ? ox : ox - 4), fx1 = Math.floor(right ? nx : nx - 4);
    const fy0 = Math.floor(up ? oy : oy - 4), fy1 = Math.floor(up ? ny : ny - 4);
    const newCol = colOf(fx1) !== colOf(fx0) ? colOf(fx1) : null;
    const newRow = rowOf(fy1) !== rowOf(fy0) ? rowOf(fy1) : null;
    if (newCol === null && newRow === null) return null;

    const span = (a, b2) => (a === b2 ? [a] : [a, b2]);
    const colsAt = (x) => span(colOf(Math.floor(x - 4)), colOf(Math.floor(x)));
    const rowsAt = (y) => span(rowOf(Math.floor(y)), rowOf(Math.floor(y - 4)));
    const solid = (list) => list.filter((c) => c >= 0 && this.bricks.cells[c] !== 0);
    // Ausweichposition knapp vor der getroffenen Spalte/Zeile
    const snapX = (col) => (right ? FIELD_LEFT + 16 * col - 1 : FIELD_LEFT + 16 * col + 15 + 5);
    const snapY = (row) => (up ? GRID_TOP - 8 * (row + 1) - 1 : GRID_TOP - 1 - 8 * row + 5);
    // Von zwei Zellen trifft die unter der Ballmitte
    const midCol = colOf(Math.floor(nx - 2)), midRow = rowOf(Math.floor(ny - 2));

    if (newRow === null) {
      const cells = solid(rowsAt(ny).map((r) => this.cellIndex(newCol, r)));
      if (!cells.length) return null;
      if (!this.strike(i, cells, this.cellIndex(newCol, midRow))) return null;
      b.flipX();
      return { x: snapX(newCol), y: ny };
    }
    if (newCol === null) {
      const cells = solid(colsAt(nx).map((c) => this.cellIndex(c, newRow)));
      if (!cells.length) return null;
      if (!this.strike(i, cells, this.cellIndex(midCol, newRow))) return null;
      b.flipY();
      return { x: nx, y: snapY(newRow) };
    }

    // Schraeg in eine neue Spalte und Zeile zugleich
    const side = solid(rowsAt(oy).map((r) => this.cellIndex(newCol, r)));
    const top = solid(colsAt(ox).map((c) => this.cellIndex(c, newRow)));
    if (side.length && top.length) {
      const a = this.strike(i, side, this.cellIndex(newCol, midRow));
      const c = this.strike(i, top, this.cellIndex(midCol, newRow));
      if (!a && !c) return null;
      b.reverse();
      return { x: snapX(newCol), y: snapY(newRow) };
    }
    if (top.length) {
      if (!this.strike(i, top, this.cellIndex(midCol, newRow))) return null;
      b.flipY();
      return { x: nx, y: snapY(newRow) };
    }
    if (side.length) {
      if (!this.strike(i, side, this.cellIndex(newCol, midRow))) return null;
      b.flipX();
      return { x: snapX(newCol), y: ny };
    }
    const corner = solid([this.cellIndex(newCol, newRow)]);
    if (!corner.length) return null;
    if (!this.strike(i, corner, corner[0])) return null;
    b.reverse();
    return { x: snapX(newCol), y: snapY(newRow) };
  }

  /**
   * Trifft Steine. Normaler Ball: nur einer (bevorzugt preferred), er prallt ab -> true.
   * Mega-Ball: alle, er fliegt weiter -> false; nur festes Gold haelt ihn auf -> true.
   */
  strike(i, cells, preferred) {
    const grid = this.bricks, L = this.listener;
    if (!this.pierceBall) {
      grid.hit(cells.includes(preferred) ? preferred : cells[0], false, i, L);
      return true;
    }
    let blocked = false;
    for (const c of cells) {
      if (this.solidGold && isGold(grid.cells[c])) blocked = true;
      grid.hit(c, true, i, L, this.solidGold);
    }
    return blocked;
  }

  checkPaddle(i, b) {
    if (b.y >= this.paddleTop) return;
    const bottom = this.paddleTop - PADDLE_BAND;
    if (b.y < bottom) {
      if (this.floorBounce) {
        const floor = bottom - this.floorBounceDrop;
        if (b.y >= floor) return;   // Deflector-Ebene liegt tiefer: Ball fliegt bis dorthin weiter
        b.y = floor;
        b.flipY();
        if (this.listener && this.listener.onFloorBounce) this.listener.onFloorBounce(i);
        return;
      }
      this.loseBall(i, b);
      return;
    }

    const p = this.paddle;
    if (b.x < p.left || b.x - 4 >= p.right) return;
    const d = (b.x - 2) - p.center;                // Ballmitte relativ zur Schlaegermitte
    const fromEdge = p.half + 2 - Math.abs(d);
    const band = EDGE_BANDS.find((e) => fromEdge < e.within && (!e.minHalf || p.half >= e.minHalf));
    b.dx = d <= 0 ? -band.dir[0] : band.dir[0];
    b.dy = band.dir[1];
    const L = this.listener;
    if (L && L.onPaddleHit) L.onPaddleHit(i, band === EDGE_BANDS[0]);
    if (p.type === PaddleType.CATCH) {
      b.y = this.paddleTop;
      b.stuck = CATCH_FRAMES;
      if (L && L.onCatch) L.onCatch(i);
    }
  }

  // ---------------------------------------------------------------- Baelle verwalten

  /** Alle Baelle weg, dann count Baelle vom ersten aktiven aus im Faecher (FAN_STEP Grad Abstand). */
  splitMultiball(count) {
    this.multiballPending = 0;
    const first = this.active.indexOf(true);
    if (first < 0) return;
    const src = new Ball();
    src.copyFrom(this.balls[first]);
    const base = src.angle;
    this.active.fill(false);
    this.ballCount = 0;
    for (let i = 0; i < count; i++) {
      const b = this.balls[i];
      b.copyFrom(src);
      b.angle = clearOfAxes(base + ((count >> 1) - i) * FAN_STEP);
      this.setActive(i, true);
    }
  }

  loseBall(i, b) {
    const x = b.x, y = b.y;
    this.setActive(i, false);
    if (this.listener && this.listener.onBallLost) this.listener.onBallLost(i, x, y);
  }
}

/** Winkel (Grad) so zurechtruecken, dass der Ball nie fast senkrecht oder fast waagerecht fliegt. */
function clearOfAxes(deg) {
  let a = ((deg % 360) + 540) % 360 - 180;   // -180..180
  const s = a < 0 ? -1 : 1;
  let m = Math.abs(a);
  if (m < AXIS_GAP) m = AXIS_GAP;
  else if (m > 180 - AXIS_GAP) m = 180 - AXIS_GAP;
  else if (Math.abs(m - 90) < AXIS_GAP) m = m < 90 ? 90 - AXIS_GAP : 90 + AXIS_GAP;
  return s * m;
}
