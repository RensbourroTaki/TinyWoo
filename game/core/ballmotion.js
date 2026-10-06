// Zustandslose Bausteine der Ballbewegung, jeweils 1:1 nach der ROM-Routine im Kommentar.
import { COMPONENT_CODES, PHASE_MASK, QUADRANT_SIGNS, STEP_TABLE_1, STEP_TABLE_5, STEP_TABLE_7, STEP_TABLE_F } from './tables.js';

/**
 * $3A60: Betrag des Schritts einer Achse in diesem Frame (0..8).
 * @param component Komponenten-Code (nur Low-Nibble zaehlt: 0, 1, 5, 7 oder F)
 * @param speed Speed-Stufe dieses Frames (inklusive Flachwinkel-Boost, 0 wenn der Ball klebt)
 * @param frameCounter Ball +5
 * @param phase Ball +6 (nur Bit 0..1 zaehlen)
 */
export function stepComponent(component, speed, frameCounter, phase) {
  const k = component & 0x0F;
  if (k === 0) return 0;
  const t = k === 1 ? STEP_TABLE_1 : k === 5 ? STEP_TABLE_5 : k === 7 ? STEP_TABLE_7 : STEP_TABLE_F;
  let s = (speed & 0xFF) >> 1;
  if ((speed & 1) !== 0 && (frameCounter & 1) !== 0) s++;
  if (s === 0) return 0;
  const idx = (s - 1) & 3;
  const packed = t[idx >> 1];
  const nibble = (idx & 1) !== 0 ? packed & 0x0F : packed >> 4;
  const c = (s + t[s + 1]) & 0xFF;
  return (nibble & PHASE_MASK[phase & 3]) !== 0 ? c : (c - 1) & 0xFF;
}

/** $3AF0: +0 und +1 aus dem Richtungscode ableiten. */
export function deriveSignsAndComponents(b) {
  b.signs = QUADRANT_SIGNS[(b.direction >> 3) & 3];
  b.components = COMPONENT_CODES[b.direction & 0x0F];
}

/** $3B52: Richtungscode nach Reflexion an einer senkrechten Flaeche. */
export function verticalReflectionOf(code) {
  let a = (-code) & 0x1F;
  if ((a & 7) === 0) a++;
  return a;
}

/** $3B41 + $3B60: Richtungscode nach Reflexion an einer waagerechten Flaeche. */
export function horizontalReflectionOf(code) {
  let fine = (-code) & 7;
  if (fine === 0) fine = 1;
  return ((code & 0x18) | fine) ^ 0x08;
}

/** $3B38: Abpraller-Zaehler +C herunterzaehlen, nicht unter 0. */
export function countBounce(b) {
  if (b.bouncesLeft !== 0) b.bouncesLeft--;
}

/** $3B1F: senkrechte Flaeche (Seitenwand, Steinflanke). Loescht die Schlaeger-Sperre, zaehlt +C herunter. */
export function reflectVertical(b) {
  b.phase &= 0x7F;
  b.direction = verticalReflectionOf(b.direction);
  countBounce(b);
}

/** $3B2B: waagerechte Flaeche (Decke, Stein oben/unten). Loescht die Schlaeger-Sperre, zaehlt +C herunter. */
export function reflectHorizontal(b) {
  b.phase &= 0x7F;
  b.direction = horizontalReflectionOf(b.direction);
  countBounce(b);
}

/** $379F: Ecke, 180-Grad-Umkehr, zaehlt +C herunter (die Sperre loescht der Steinpfad davor, $371E). */
export function reflectCorner(b) {
  b.direction = ((~b.direction & 0x10) | (b.direction & 0x0F)) & 0xFF;
  countBounce(b);
}

/**
 * $42C8: Zelle des Steinrasters (columns Spalten x 18 Zeilen, Zellen 16 x 8 px) unter dem Punkt.
 * Liefert auch fuer leere Zellen einen Treffer (>= 0), sonst -1. Zeile 0 liegt oben (Y $D8..$DF + lift);
 * Y ab $E0 + lift und untergelaufene Werte landen ebenfalls in Zeile 0. lift = Raster hoeher (Vielfaches von 8).
 */
export function gridCellAt(x, y, columns, lift = 0) {
  x &= 0xFF;
  if (x >= 0x10 + 16 * columns || x < 0x10) return -1;
  const col = (x - 0x10) >> 4;
  let a = ((~y) & 0xFF) - 0x20 + lift;
  if (a < 0) a = 0;
  const row = a >> 3;
  if (row >= 0x12) return -1;
  return (row * columns + col) & 0xFF;
}
