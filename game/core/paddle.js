// Schlaeger-Zustand wie im Original. Die Geometrie sind 12 Bytes X-Koordinaten ab $E700;
// die Bewegung verschiebt nur Bytes ungleich 0.

/** Schlaeger-Typen ($E5CF). 1, 4 und 5 benutzen die Normal-Tabelle; ihre Bedeutung ist nicht untersucht. */
export const PaddleType = Object.freeze({
  NORMAL: 0,
  LARGE: 2,
  TWIN: 3,
  CATCH: 6,
  SHADOW: 7,
  SMALL: 8,
});

export const PADDLE_BYTES = 12;

/** Gemessene Lage der 12 Bytes relativ zur Mitte im Ruhezustand je Typ (0 = Byte unbenutzt). */
export function paddleGeometryFor(type) {
  switch (type) {
    case PaddleType.LARGE: return [0, 0, 16, -32, 0, -16, 0, 0, 0, 0, 0, 0];
    case PaddleType.TWIN: return [0, 0, 16, -56, 0, -24, -16, -40, 0, 0, 0, 0];
    case 4: return [0, 0, 16, -16, 0, 8, -8, 0, 0, 0, 0, 0];
    case PaddleType.SHADOW: return [0, 0, 16, -16, 0, 8, -8, 8, -8, 0, 0, 0];
    case PaddleType.SMALL: return [0, 0, 12, -12, 0, 0, 0, 0, 0, 0, 0, 0];
    default: return [0, 0, 16, -16, 0, 0, 0, 0, 0, 0, 0, 0];   // 0, 1, 5, 6
  }
}

export class Paddle {
  constructor() {
    /** $E700..$E70B. [2] = rechte Kante R, [3] = linke Kante L, [4] = Mitte, [5..8] = Schatten (Typ 7). */
    this.bytes = new Uint8Array(PADDLE_BYTES);
    this.type = 0;          // $E5CF: aktueller Typ. Bit7 = Umbau laeuft (nicht nachgebaut)
    this.previousType = 0;  // $E5D0: Typ vor dem Umbau
    this.pendingType = 0;   // $EA42: Zieltyp waehrend des Umbaus (0 = keiner)
    this.delta = 0;         // $E5EE: tatsaechlich gefahrenes Delta dieses Frames (nach Klemmung), als Byte
    this.shadowLag1 = 0;    // $EA33: Nachlauf Schatten 1 (Typ 7)
    this.shadowLag2 = 0;    // $EA34: Nachlauf Schatten 2 (Typ 7)
  }

  get right() { return this.bytes[2]; }
  set right(v) { this.bytes[2] = v; }
  get left() { return this.bytes[3]; }
  set left(v) { this.bytes[3] = v; }
  get center() { return this.bytes[4]; }
  set center(v) { this.bytes[4] = v; }

  /** Delta als vorzeichenbehaftete Zahl. */
  get signedDelta() { return (this.delta << 24) >> 24; }

  /**
   * Setzt einen Typ ohne Uebergangsanimation. Die Mitte ($E704) bleibt; die uebrigen Bytes stehen danach so,
   * wie sie im Original nach Ende des Umbaus stehen (gemessen, siehe Spec 2.1).
   */
  setTypeImmediate(type) {
    const offsets = paddleGeometryFor(type);
    const c = this.center;
    for (let i = 0; i < PADDLE_BYTES; i++) {
      this.bytes[i] = i === 4 ? c : offsets[i] === 0 ? 0 : (c + offsets[i]) & 0xFF;
    }
    this.type = type;
    this.previousType = type;
    this.pendingType = 0;
    this.shadowLag1 = 0;
    this.shadowLag2 = 0;
  }
}
