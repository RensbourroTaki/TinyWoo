// Steinraster wie im Original (Karte an ($E016)): 13 Spalten x 18 Zeilen, Zellen 16 x 8 px, 1 Byte pro Zelle.
// Zeile 0 liegt oben (Y $D8..$DF), Spalte 0 links (X $10..$1F). Die Spaltenzahl ist einstellbar (11 im Spiel).
//
// Kodierung eines Bytes:
//   Bit 0..1  Art: 0 leer, 1 normal, 2 normal mit Kapsel, 3 Sonder
//   Bit 2     keine Kollision (Zelle wird uebersprungen)
//   Bit 3..5  normal: Farbe/Punkteklasse; Sonder: verbleibende Zusatztreffer (Silber)
//   Bit 6     Sonder: waechst nach dem Zerstoeren nach
//   Bit 7     Sonder: Gold (unzerstoerbar, ausser Durchschlag-Ball; mit Playfield.solidGold auch fuer den)
//   Bit 6 + 7 Sonder: wandernder Goldstein (eigenes Gameplay, die Bewegung macht play/session.js)

export const ROWS = 18;
export const KIND_MASK = 0x03;
export const KIND_NORMAL = 0x01;
export const KIND_CAPSULE = 0x02;
export const KIND_SPECIAL = 0x03;
export const NO_COLLISION = 0x04;
export const COLOR_MASK = 0x38;
export const HITS_MASK = 0x38;
export const REGENERATES = 0x40;
export const GOLD = 0x80;

/** Normaler Stein (1 Treffer) mit Farbe 0..7, optional mit Kapsel. */
export function normalBrick(color, capsule) {
  return ((color & 7) << 3) | (capsule ? KIND_CAPSULE : KIND_NORMAL);
}

/** Silberstein: extraHits = zusaetzliche Treffer vor dem Zerstoeren (0..7), also extraHits + 1 Treffer insgesamt. */
export function silverBrick(extraHits, regenerates) {
  return ((extraHits & 7) << 3) | KIND_SPECIAL | (regenerates ? REGENERATES : 0);
}

export function goldBrick() {
  return GOLD | KIND_SPECIAL;
}

/** Wandernder Goldstein: verhaelt sich im Raster wie Gold, zaehlt nicht fuer den Levelabschluss. */
export const MOVER = GOLD | REGENERATES | KIND_SPECIAL;
/** Wie MOVER, faehrt aber senkrecht (Bit 3 als Markierung, Gold ignoriert die Trefferbits). */
export const MOVER_V = MOVER | 0x08;
export function isMover(v) { return (v & 0xC7) === MOVER; }
export function isVerticalMover(v) { return isMover(v) && (v & 0x08) !== 0; }

export function countsForLevel(v) {
  if ((v & NO_COLLISION) !== 0 || (v & KIND_MASK) === 0) return false;
  if ((v & KIND_MASK) === KIND_SPECIAL && (v & (GOLD | REGENERATES)) !== 0) return false;
  return true;
}

/** Test der Ecken-Nachbarn ($394F/$3969): Zelle blockiert, wenn ungleich 0 und Bit 2 frei. */
export function blocksAsNeighbor(v) {
  return v !== 0 && (v & NO_COLLISION) === 0;
}

export class BrickGrid {
  constructor(columns = 13) {
    this.columns = columns;
    this.cellCount = columns * ROWS;
    this.cells = new Uint8Array(this.cellCount);
    /** $E393: Steine, die fuer den Levelabschluss noch zaehlen (Byte). */
    this.remaining = 0;
  }

  get(col, row) { return this.cells[row * this.columns + col]; }
  set(col, row, v) { this.cells[row * this.columns + col] = v; }

  clear() {
    this.cells.fill(0);
    this.remaining = 0;
  }

  /** Zaehlt die Steine, die fuer den Levelabschluss zaehlen (alles mit Kollision ausser Gold und Nachwachser). */
  recountRemaining() {
    let n = 0;
    for (let i = 0; i < this.cellCount; i++) if (countsForLevel(this.cells[i])) n++;
    this.remaining = n & 0xFF;
  }

  /**
   * $430F: Treffer auf eine Zelle. Liefert true, wenn dort ein Stein war (der Ball reflektiert dann).
   * Aendert die Zelle und remaining wie das Original. listener bekommt onBrickHit / onBrickDestroyed.
   */
  hit(cell, pierce, ball, listener) {
    const v = this.cells[cell];
    if ((v & NO_COLLISION) !== 0) return false;
    const kind = v & KIND_MASK;
    if (kind === 0) return false;

    if (kind !== KIND_SPECIAL) {
      this.cells[cell] = 0;
      this.remaining = (this.remaining - 1) & 0xFF;
      if (listener) listener.onBrickDestroyed(ball, cell, v, kind === KIND_CAPSULE, false);
      return true;
    }

    // $4385 Sonderstein
    if ((v & GOLD) !== 0) {
      if (!pierce) {
        if (listener) listener.onBrickHit(ball, cell, v, v);
        return true;
      }
      this.remaining = (this.remaining + 1) & 0xFF;   // $43BA, wird in $4465 wieder abgezogen
    } else if ((v & HITS_MASK) !== 0 && !pierce) {
      const after = ((v & REGENERATES) | ((v & HITS_MASK) - 8) | KIND_SPECIAL) & 0xFF;
      this.cells[cell] = after;
      if (listener) listener.onBrickHit(ball, cell, v, after);
      return true;
    }

    // $43F1 Sonderstein zerstoeren
    this.cells[cell] = 0;
    const regen = (v & REGENERATES) !== 0;
    if (!regen) this.remaining = (this.remaining - 1) & 0xFF;   // nachwachsende Steine bleiben mitgezaehlt
    if (listener) listener.onBrickDestroyed(ball, cell, v, false, regen);
    return true;
  }
}
