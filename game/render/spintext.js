// Texte in der Drehschrift. Jeder Buchstabe hat seinen eigenen Zeitversatz (stagger) und durchlaeuft:
//   Einflug (schnelle Drehung, Position mit Ease-out) -> Ausdrehen (mehrere immer langsamere Umdrehungen,
//   endet exakt auf der Vorderansicht) -> Ruhe (optional mit Welle: ein Buchstabe nach dem anderen dreht
//   sich einmal) -> Ausflug (Andrehen, dann schnelle Drehung, Position mit Ease-in).
// Die Frames sind eine echte 360-Grad-Drehung (16 Frames), Vorderansicht = font.front.

const easeOut = (t) => 1 - (1 - t) * (1 - t) * (1 - t);
const easeIn = (t) => t * t * t;

/** Ausdreh-Profil: Ticks je Frame fuer die aufeinanderfolgenden Umdrehungen (laenger = langsamer). */
export const SETTLE_PROFILE = [2, 3];          // Umdrehung 1 mit 2 Ticks/Frame, Umdrehung 2 mit 3 Ticks/Frame
export const SETTLE_TAIL = [4, 4, 5, 6];       // die letzten 4 Frames vor der Vorderansicht noch langsamer

function buildSettle(profile, tail, frames) {
  // Liste von Ticks-je-Frame fuer eine Folge von Frames, die auf der Vorderansicht endet
  const ticks = [];
  for (const t of profile) for (let i = 0; i < frames; i++) ticks.push(t);
  for (let i = 0; i < tail.length; i++) ticks[ticks.length - tail.length + i] = tail[i];
  return ticks;
}

export class SpinText {
  /**
   * @param font SpinFont
   * @param text Text (A-Z 0-9 . , ! ? >)
   * @param opts { x, y, zoom, hold (Frames, -1 = bis stop()), stagger, flyIn, flyOut, side (-1/1/0 abwechselnd),
   *               turns (Anzahl langsamer Umdrehungen beim Ausdrehen, 1 oder 2), ripple (Welle im Ruhezustand) }
   */
  constructor(font, text, opts = {}) {
    this.font = font;
    this.text = text;
    this.x = opts.x ?? 120;
    this.y = opts.y ?? 150;
    this.zoom = opts.zoom ?? 1;
    this.hold = opts.hold ?? 60;
    this.stagger = opts.stagger ?? 4;
    this.flyIn = opts.flyIn ?? 28;
    this.flyOut = opts.flyOut ?? 22;
    this.side = opts.side ?? 0;
    this.ripple = opts.ripple ?? false;
    const turns = opts.turns ?? 2;
    this.settle = buildSettle(SETTLE_PROFILE.slice(0, turns), SETTLE_TAIL, font.frames);
    this.settleLen = this.settle.reduce((a, b) => a + b, 0);
    this.letters = font.layout(text).filter((l) => l.key);
    const total = font.measure(text) * this.zoom;
    this.left = this.x - total / 2;
    this.t = 0;
    this.stopping = false;
    this.stopAt = -1;
    this.done = false;
    this.leaveUp = false;
    const n = this.letters.length;
    this.inEnd = (n - 1) * this.stagger + this.flyIn + this.settleLen;   // alle Buchstaben stehen
    this.onDone = opts.onDone || null;
    this.rippleT = -1;
    this.rippleNext = 120;
  }

  get settled() { return !this.stopping && this.t >= this.inEnd; }

  /** Ausfliegen anstossen (bei hold = -1 oder vorzeitig). up = nach oben weg statt zur Seite. */
  stop(up = false) {
    if (this.stopping || this.done) return;
    this.stopping = true;
    this.leaveUp = up;
    this.stopAt = this.t;
  }

  /** Sofort fertig stellen (alle Buchstaben stehen). */
  finish() { this.t = Math.max(this.t, this.inEnd); }

  update() {
    if (this.done) return;
    this.t++;
    if (!this.stopping && this.hold >= 0 && this.t >= this.inEnd + this.hold) this.stop();
    if (this.ripple && this.settled && !this.stopping) {
      if (this.rippleT >= 0) {
        this.rippleT++;
        if (this.rippleT > (this.letters.length - 1) * 3 + this.font.frames * 2) { this.rippleT = -1; this.rippleNext = 90 + Math.floor(Math.random() * 60); }
      } else if (--this.rippleNext <= 0) { this.rippleT = 0; }
    }
    if (this.stopping) {
      const n = this.letters.length;
      if (this.t >= this.stopAt + (n - 1) * this.stagger + this.flyOut) {
        this.done = true;
        if (this.onDone) this.onDone();
      }
    }
  }

  /** Frame waehrend des Ausdrehens: k = Ticks seit Beginn des Ausdrehens. */
  settleFrame(k) {
    const f = this.font.frames, front = this.font.front;
    let acc = 0;
    for (let i = 0; i < this.settle.length; i++) {
      acc += this.settle[i];
      if (k < acc) return (front + 1 + i) % f;   // startet nach der Vorderansicht, endet genau davor
    }
    return front;
  }

  draw(ctx, S) {
    if (this.done) return;
    const f = this.font;
    const front = f.front;
    const z = this.zoom;
    const n = this.letters.length;
    for (let i = 0; i < n; i++) {
      const L = this.letters[i];
      const slotX = this.left + L.x * z;
      const dir = this.side !== 0 ? this.side : (i % 2 === 0 ? -1 : 1);
      const offX = dir < 0 ? -60 : 300;
      let x = slotX, y = this.y, frame = front, visible = true;
      if (this.stopping && this.t >= this.stopAt) {
        const tt = this.t - this.stopAt - i * this.stagger;
        if (tt < 0) { /* steht noch */ } else if (tt >= this.flyOut) { visible = false; } else {
          const e = easeIn(tt / this.flyOut);
          if (this.leaveUp) y = this.y - e * 140; else x = slotX + ((dir < 0 ? 300 : -60) - slotX) * e;
          frame = front + Math.floor(tt / 2) + 1;    // andrehen, dann immer schneller
          if (tt > 8) frame = front + 4 + (tt - 8) * 2;
        }
      } else {
        const tt = this.t - i * this.stagger;
        if (tt < 0) visible = false;
        else if (tt < this.flyIn) {
          const e = easeOut(tt / this.flyIn);
          x = offX + (slotX - offX) * e;
          frame = front + tt * 2;                     // schnelle Drehung im Flug
        } else if (tt < this.flyIn + this.settleLen) {
          frame = this.settleFrame(tt - this.flyIn);  // langsam ausdrehen bis zur Vorderansicht
        } else if (this.rippleT >= 0) {
          const k = this.rippleT - i * 3;             // Welle: eine volle Umdrehung je Buchstabe, 2 Ticks je Frame
          if (k >= 0 && k < f.frames * 2) frame = front + (k >> 1);
        }
      }
      if (visible) f.drawGlyph(ctx, S, L.key, frame, x, y, z);
    }
  }
}
