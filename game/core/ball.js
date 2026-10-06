// Ein Ball, Byte fuer Byte wie die 13-Byte-Struktur des Originals (Main-CPU, Basis $E3AD).
// Koordinaten in Original-Pixeln, Y waechst nach oben. Alle Felder sind Bytes (0..255), weil das
// Original mit 8-Bit-Ueberlauf rechnet und einige Eigenheiten genau daran haengen.

export const BALL_BYTES = 13;

export class Ball {
  constructor() {
    this.signs = 0;        // +0: Vorzeichen, jeden Frame aus direction abgeleitet. Bit0 = Y steigt, Bit1 = X steigt
    this.components = 0;   // +1: Komponenten-Codes, jeden Frame abgeleitet. High-Nibble Y, Low-Nibble X
    this.speed = 0;        // +2: Speed-Stufe 0..15 (0 = steht)
    this.direction = 0;    // +3: Richtungscode 0..31 ($00 hoch, $08 X-, $10 runter, $18 X+)
    this.unused4 = 0;      // +4: von der Ball-Logik nicht benutzt
    this.frameCounter = 0; // +5: Frame-Zaehler des Balls (+1 pro Frame, auch wenn er klebt)
    this.phase = 0;        // +6: Low-Nibble = Dither-Phase, Bit7 = Schlaeger-Sperre
    this.y = 0;            // +7: Y (Oberkante des 4x4-Balls)
    this.x = 0;            // +8: X (rechte Kante; der Ball belegt X-4..X)
    this.unused9 = 0;      // +9: von der Ball-Logik nicht benutzt
    this.wallX = 0;        // +A: X beim letzten Seitenwandkontakt
    this.stickTimer = 0;   // +B: Haft-Countdown (Rundenstart 180, Catch 120). > 0 = Ball klebt am Schlaeger
    this.bouncesLeft = 0;  // +C: verbleibende Abpraller bis zum naechsten Speed-Up
  }

  get paddleLock() { return (this.phase & 0x80) !== 0; }

  /** Quadrant 0 oder 3. Achtung: Code $08 (waagerecht X-) gilt im Original als abwaerts. */
  get movingUp() {
    const q = this.direction & 0x18;
    return q === 0 || q === 0x18;
  }

  copyFrom(o) {
    this.signs = o.signs; this.components = o.components; this.speed = o.speed; this.direction = o.direction;
    this.unused4 = o.unused4; this.frameCounter = o.frameCounter; this.phase = o.phase; this.y = o.y; this.x = o.x;
    this.unused9 = o.unused9; this.wallX = o.wallX; this.stickTimer = o.stickTimer; this.bouncesLeft = o.bouncesLeft;
  }

  clear() {
    this.signs = 0; this.components = 0; this.speed = 0; this.direction = 0; this.unused4 = 0; this.frameCounter = 0;
    this.phase = 0; this.y = 0; this.x = 0; this.unused9 = 0; this.wallX = 0; this.stickTimer = 0; this.bouncesLeft = 0;
  }

  /** Liest die 13 Bytes in Original-Reihenfolge. */
  readBytes(src, off) {
    this.signs = src[off]; this.components = src[off + 1]; this.speed = src[off + 2]; this.direction = src[off + 3];
    this.unused4 = src[off + 4]; this.frameCounter = src[off + 5]; this.phase = src[off + 6]; this.y = src[off + 7];
    this.x = src[off + 8]; this.unused9 = src[off + 9]; this.wallX = src[off + 10]; this.stickTimer = src[off + 11];
    this.bouncesLeft = src[off + 12];
  }

  /** Schreibt die 13 Bytes in Original-Reihenfolge. */
  writeBytes(dst, off) {
    dst[off] = this.signs; dst[off + 1] = this.components; dst[off + 2] = this.speed; dst[off + 3] = this.direction;
    dst[off + 4] = this.unused4; dst[off + 5] = this.frameCounter; dst[off + 6] = this.phase; dst[off + 7] = this.y;
    dst[off + 8] = this.x; dst[off + 9] = this.unused9; dst[off + 10] = this.wallX; dst[off + 11] = this.stickTimer;
    dst[off + 12] = this.bouncesLeft;
  }
}
