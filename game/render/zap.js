// Elektro-Zone unter dem Schlaeger: laeuft immer (Intro, Menue, Spiel). Die App haelt eine Instanz und reicht
// sie an die GameView weiter, die verlorene Baelle darin explodieren laesst.
import { ART_H, INNER, PHASER_Y } from './board.js';

/**
 * Additiv: Verlauf von toxischem Tuerkis (top, knapp unter dem Schlaeger) nach Weiss (Bildunterkante),
 * aufsteigende Funkel-Pixel und kurze Blitze. Verlorene Baelle fliegen in ihrem Winkel weiter und explodieren
 * bei boomY (Mitte zwischen Phaser-Mitte 318 und Bildende 334).
 * Der Verlauf wird einmal pro Zeile in eine 1-Pixel-Textur gebacken.
 */
export const ZAP = {
  top: 290, boomY: (PHASER_Y + 11 + ART_H) / 2,   // Phaser-Glow 22 hoch -> Mitte PHASER_Y + 11
  color: [20, 255, 215], white: [255, 255, 255], alpha: 0.45, pulse: 0.12,
  particles: { max: 60, rate: 1.2, speed: [0.25, 0.8], life: [40, 110], blink: 0.25, flash: 0.15 },
  bolts: { chance: 0.05, segs: [3, 6], life: [3, 6], glow: 9, glowAlpha: 0.45, burst: 4 },
};

/** Weicher, runder Lichtpunkt (radiale Verlaufs-Textur) fuer additives Zeichnen. */
export function glowSprite([r, g, b]) {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, `rgba(${r},${g},${b},1)`);
  gr.addColorStop(0.45, `rgba(${r},${g},${b},0.45)`);
  gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr;
  x.fillRect(0, 0, 32, 32);
  return c;
}

/** Verlauf der Elektro-Zone: 1 Pixel breit, eine Zeile je Art-Pixel (Tuerkis oben -> Weiss unten). */
function zapGradient() {
  const h = ART_H - ZAP.top;
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = h;
  const x = c.getContext('2d');
  const d = x.createImageData(1, h);
  for (let i = 0; i < h; i++) {
    const u = i / (h - 1);
    const w = Math.max(0, Math.min(1, (u - 0.5) / 0.5));
    const m = w * w * (3 - 2 * w);   // Weiss erst in der unteren Haelfte
    for (let k = 0; k < 3; k++) d.data[i * 4 + k] = Math.round(ZAP.color[k] + (ZAP.white[k] - ZAP.color[k]) * m);
    d.data[i * 4 + 3] = Math.round(255 * ZAP.alpha * Math.pow(u, 1.6));
  }
  x.putImageData(d, 0, 0);
  return c;
}

export class ElectroZone {
  constructor() {
    this.tick = 0;
    this.glow = glowSprite(ZAP.color);
    this.grad = zapGradient();
    this.parts = [];              // { x, y, vy, t, len } Funkel-Pixel
    this.bolts = [];              // { px: [x, y, ...], cx, cy, t, len } kurze Blitze (Pixel-Liste)
  }

  /** Blitz ab (x, y): Zickzack aus kurzen Segmenten, als Pixel-Liste gerastert. */
  spawnBolt(x, y) {
    const B = ZAP.bolts, r = (a) => a[0] + Math.floor(Math.random() * (a[1] - a[0] + 1));
    const px = [];
    const dir = Math.random() < 0.5 ? -1 : 1;
    let x0 = Math.round(x), y0 = Math.round(y);
    for (let s = r(B.segs); s > 0; s--) {
      const x1 = x0 + dir * (2 + Math.floor(Math.random() * 4));
      const y1 = Math.max(ZAP.top + 1, Math.min(ART_H - 1, y0 + Math.floor(Math.random() * 7) - 3));
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let k = 0; k < n; k++) px.push(Math.round(x0 + (x1 - x0) * k / n), Math.round(y0 + (y1 - y0) * k / n));
      x0 = x1; y0 = y1;
    }
    this.bolts.push({ px, cx: (x + x0) / 2, cy: (y + y0) / 2, t: 0, len: r(B.life) });
  }

  /** Blitz-Buendel um einen explodierenden Ball. */
  burst(x, y) {
    for (let k = 0; k < ZAP.bolts.burst; k++) this.spawnBolt(x + (Math.random() - 0.5) * 16, y + (Math.random() - 0.5) * 10);
  }

  /** Pro Logik-Frame: Funkel-Pixel steigen auf und zittern seitlich, gelegentlich ein Blitz. */
  update() {
    this.tick++;
    const P = ZAP.particles, rr = (a) => a[0] + Math.random() * (a[1] - a[0]);
    for (let n = Math.floor(P.rate + Math.random()); n > 0 && this.parts.length < P.max; n--) {
      this.parts.push({ x: INNER.x + Math.random() * INNER.w, y: ART_H - Math.random() * 6, vy: -rr(P.speed), t: 0, len: Math.round(rr(P.life)) });
    }
    for (const p of this.parts) {
      p.x += (Math.random() - 0.5) * 0.8;
      p.y += p.vy;
      p.t++;
    }
    this.parts = this.parts.filter((p) => p.t < p.len && p.y > ZAP.top);
    if (Math.random() < ZAP.bolts.chance) this.spawnBolt(INNER.x + 4 + Math.random() * (INNER.w - 8), ZAP.top + 6 + Math.random() * (ART_H - ZAP.top - 10));
    for (const b of this.bolts) b.t++;
    this.bolts = this.bolts.filter((b) => b.t < b.len);
  }

  /** Verlauf (pulsiert leicht), blinkende Funkel-Pixel und Blitze, alles additiv; alpha fuer Ein-/Ausblenden. */
  draw(ctx, S, alpha = 1) {
    if (alpha <= 0) return;
    const h = ART_H - ZAP.top;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = alpha * (1 - ZAP.pulse * (0.5 + 0.5 * Math.sin(this.tick * 0.08)) - 0.04 * Math.random());
    ctx.drawImage(this.grad, 0, 0, 1, h, 0, ZAP.top * S, 240 * S, h * S);
    const P = ZAP.particles, [r, g, b] = ZAP.color;
    for (const p of this.parts) {
      if (Math.random() < P.blink) continue;
      const u = p.t / p.len, k = (p.y - ZAP.top) / h;   // blendet zum Ende und nach oben hin aus
      ctx.globalAlpha = alpha * (1 - u) * Math.min(1, k * 2.5);
      ctx.fillStyle = Math.random() < P.flash ? '#fff' : `rgb(${r},${g},${b})`;
      ctx.fillRect(Math.round(p.x) * S, Math.round(p.y) * S, S, S);
    }
    const B = ZAP.bolts;
    for (const bo of this.bolts) {
      const a = alpha * (1 - bo.t / bo.len);
      ctx.globalAlpha = B.glowAlpha * a;
      ctx.drawImage(this.glow, (bo.cx - B.glow) * S, (bo.cy - B.glow) * S, 2 * B.glow * S, 2 * B.glow * S);
      ctx.globalAlpha = a;
      ctx.fillStyle = bo.t < 2 ? '#fff' : `rgb(${r},${g},${b})`;
      for (let i = 0; i < bo.px.length; i += 2) ctx.fillRect(bo.px[i] * S, bo.px[i + 1] * S, S, S);
    }
    ctx.restore();
  }
}
