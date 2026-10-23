// Schlaeger: Mitte und halbe Breite in Logik-Pixeln, symmetrisch um die Mitte.

export const PaddleType = Object.freeze({
  NORMAL: 'normal',
  LARGE: 'large',
  SMALL: 'small',
  CATCH: 'catch',   // normale Groesse, Ball bleibt kleben
});

const HALF_WIDTH = { normal: 16, large: 24, small: 12, catch: 16 };

export const paddleHalfWidth = (type) => HALF_WIDTH[type] || HALF_WIDTH.normal;

export class Paddle {
  constructor() {
    this.center = 0;
    this.type = PaddleType.NORMAL;
    this.half = HALF_WIDTH.normal;
    /** Tatsaechlich gefahrene Strecke im letzten Frame (nach dem Begrenzen an den Waenden). */
    this.delta = 0;
  }

  get left() { return this.center - this.half; }
  get right() { return this.center + this.half; }

  setType(type) {
    this.type = type;
    this.half = paddleHalfWidth(type);
  }
}
