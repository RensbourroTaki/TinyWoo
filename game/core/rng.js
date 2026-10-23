// Deterministische Zufallsquelle (xorshift32): gleicher Seed = gleiches Spiel.

export class XorShift32 {
  constructor(seed) {
    this.state = (seed >>> 0) || 0x9E3779B9;
  }

  /** Naechster 32-Bit-Wert (ohne Vorzeichen). */
  next() {
    let s = this.state;
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    this.state = s;
    return s;
  }

  nextBit() {
    return (this.next() & 0x100) !== 0;
  }
}
