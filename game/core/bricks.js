// Steinraster: columns Spalten x 18 Zeilen, Zellen 16 x 8 Logik-Pixel, ein Byte je Zelle (0 = leer).
// Zeile 0 liegt oben, Spalte 0 links.
//
// Byte eines Steins:
//   Bit 4..6  Sorte (BRICK.*)
//   Bit 0..2  Farbe 0..7 (COLOR) bzw. Rest-Treffer (HARD)
//   Bit 3     COLOR: traegt ein Item

export const ROWS = 18;

export const BRICK = Object.freeze({
  COLOR: 1,     // 1 Treffer
  HARD: 2,      // grau, mehrere Treffer
  REGROW: 3,    // doppelblau, 1 Treffer, waechst nach (zaehlt nicht)
  GOLD: 4,      // unzerstoerbar (zaehlt nicht)
  MOVER_H: 5,   // Gold, faehrt waagerecht (Bewegung in play/session.js)
  MOVER_V: 6,   // Gold, faehrt senkrecht
});

const ITEM_FLAG = 0x08;

export const brickType = (v) => (v >> 4) & 7;
export const brickColor = (v) => v & 7;
export const hasItem = (v) => brickType(v) === BRICK.COLOR && (v & ITEM_FLAG) !== 0;
/** Unzerstoerbar fuer normale Baelle (Gold und wandernde Goldsteine). */
export const isGold = (v) => { const t = brickType(v); return t === BRICK.GOLD || t === BRICK.MOVER_H || t === BRICK.MOVER_V; };
export const isMover = (v) => { const t = brickType(v); return t === BRICK.MOVER_H || t === BRICK.MOVER_V; };
export const isVerticalMover = (v) => brickType(v) === BRICK.MOVER_V;
/** Muss fuer den Levelabschluss weg (farbig und grau). */
export const countsForClear = (v) => { const t = brickType(v); return t === BRICK.COLOR || t === BRICK.HARD; };

export const colorBrick = (color, item) => (BRICK.COLOR << 4) | (item ? ITEM_FLAG : 0) | (color & 7);
export const hardBrick = (hits) => (BRICK.HARD << 4) | (hits & 7);
export const regrowBrick = () => BRICK.REGROW << 4;
export const goldBrick = () => BRICK.GOLD << 4;
export const MOVER = BRICK.MOVER_H << 4;
export const MOVER_V = BRICK.MOVER_V << 4;

export class BrickGrid {
  constructor(columns) {
    this.columns = columns;
    this.cellCount = columns * ROWS;
    this.cells = new Uint8Array(this.cellCount);
    /** Steine, die fuer den Levelabschluss noch weg muessen. */
    this.remaining = 0;
  }

  get(col, row) { return this.cells[row * this.columns + col]; }
  set(col, row, v) { this.cells[row * this.columns + col] = v; }

  clear() {
    this.cells.fill(0);
    this.remaining = 0;
  }

  recountRemaining() {
    let n = 0;
    for (let i = 0; i < this.cellCount; i++) if (countsForClear(this.cells[i])) n++;
    this.remaining = n;
  }

  /**
   * Treffer auf eine Zelle. pierce = Mega-Ball (zerstoert alles ausser Gold, wenn goldStops).
   * Liefert true, wenn dort ein Stein war. listener bekommt onBrickHit(ball, cell, before, after)
   * bzw. onBrickDestroyed(ball, cell, value, hadItem, regrows).
   */
  hit(cell, pierce, ball, listener, goldStops = true) {
    const v = this.cells[cell];
    if (v === 0) return false;
    const t = brickType(v);
    if (isGold(v) && (!pierce || goldStops)) {
      if (listener) listener.onBrickHit(ball, cell, v, v);
      return true;
    }
    if (t === BRICK.HARD && !pierce && (v & 7) > 1) {
      const after = v - 1;
      this.cells[cell] = after;
      if (listener) listener.onBrickHit(ball, cell, v, after);
      return true;
    }
    this.cells[cell] = 0;
    if (countsForClear(v)) this.remaining--;
    if (listener) listener.onBrickDestroyed(ball, cell, v, hasItem(v), t === BRICK.REGROW);
    return true;
  }
}
