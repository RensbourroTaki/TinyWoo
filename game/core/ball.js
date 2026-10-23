// Ein Ball. Position in Logik-Pixeln, Y waechst nach oben. Der Ball ist ein 4x4-Kasten:
// x = rechte Kante, y = Oberkante, er reicht also von x-4..x und y-4..y.
//
// Richtung (dx, dy) ist so normiert, dass die groessere Achse 1 ist: Der Ball faehrt auf seiner
// Hauptachse immer genau mit dem Tempo seiner Stufe, schraeg ist er dadurch schneller als senkrecht.

export class Ball {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 1;
    this.level = 0;        // Tempostufe (field.js: speedOf)
    this.bouncesLeft = 0;  // Abpraller bis zur naechsten Tempostufe
    this.stuck = 0;        // > 0 = klebt noch so viele Frames am Schlaeger
  }

  get movingUp() { return this.dy > 0; }

  /** Winkel zur Senkrechten in Grad: 0 = gerade hoch, positiv = nach rechts, 180 = gerade runter. */
  get angle() { return Math.atan2(this.dx, this.dy) * 180 / Math.PI; }

  set angle(deg) {
    const r = deg * Math.PI / 180;
    const sx = Math.sin(r), sy = Math.cos(r);
    const m = Math.max(Math.abs(sx), Math.abs(sy));
    this.dx = sx / m;
    this.dy = sy / m;
  }

  /** Abprall an einer senkrechten Flaeche (Wand, Steinflanke). */
  flipX() { this.dx = -this.dx; this.countBounce(); }
  /** Abprall an einer waagerechten Flaeche (Decke, Stein oben/unten). */
  flipY() { this.dy = -this.dy; this.countBounce(); }
  /** Abprall in einer Ecke: zurueck, woher er kam. */
  reverse() { this.dx = -this.dx; this.dy = -this.dy; this.countBounce(); }

  countBounce() { if (this.bouncesLeft > 0) this.bouncesLeft--; }

  copyFrom(o) {
    this.x = o.x; this.y = o.y; this.dx = o.dx; this.dy = o.dy;
    this.level = o.level; this.bouncesLeft = o.bouncesLeft; this.stuck = o.stuck;
  }
}
