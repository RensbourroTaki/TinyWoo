// Zwei Bitmap-Schriften:
//  - SpinFont: die Drehschrift (fonts/spin.png, 16 Frames = echte 360-Grad-Drehung um die Hochachse,
//    Frame 4 = weisse Vorderansicht). Layout und Zellen stehen in fonts.json ("spin").
//  - PixelFont: BoldPixels (fonts/BoldPixels.png), ASCII 32..126 mit Gross- und Kleinbuchstaben, 1:1 Pixel.
// Alle Positionen in Art-Pixeln (240x334), gezeichnet mit Skalierung S auf das Ziel-Canvas.

export class SpinFont {
  constructor(image, meta) {
    this.image = image;
    this.frameH = meta.frameHeight;       // 23
    this.pitch = meta.framePitch ?? meta.frameHeight;
    this.top = meta.top ?? 0;
    this.frames = meta.frames;            // 16
    this.front = meta.front;              // Ruhe-Frame (Vorderansicht)
    this.glyphs = meta.glyphs;            // Zeichen -> [x, w]
    this.gap = meta.gap ?? 2;             // Abstand zwischen Zellen wie im Sheet
    this.spaceW = meta.spaceWidth ?? 7;
    this.staticKeys = new Set(meta.static || []);   // Zeichen, die nur in der Vorderansicht existieren
  }

  static key(ch) {
    const c = ch.toUpperCase();
    if (c === ' ') return null;
    if (c === '-') return '.';
    if (c === ':') return '.';
    return c;
  }

  glyph(ch) {
    const k = SpinFont.key(ch);
    return k && this.glyphs[k] ? k : null;
  }

  /** Breite eines Textes in Art-Pixeln (ohne Zoom). */
  measure(text) {
    let w = 0;
    for (const ch of text) {
      const k = this.glyph(ch);
      w += (k ? this.glyphs[k][1] : this.spaceW) + this.gap;
    }
    return Math.max(0, w - this.gap);
  }

  /** Positionen der Zeichen (x-Versatz je Zeichen) fuer Animationen. */
  layout(text) {
    const out = [];
    let x = 0;
    for (const ch of text) {
      const k = this.glyph(ch);
      const w = k ? this.glyphs[k][1] : this.spaceW;
      out.push({ ch, key: k, x, w, isStatic: k ? this.staticKeys.has(k) : false });
      x += w + this.gap;
    }
    return out;
  }

  /** Ein Zeichen mit Frame f (0..15) an Art-Position (x,y), Skalierung S, optional vergroessert (zoom). */
  drawGlyph(ctx, S, key, frame, x, y, zoom = 1) {
    const g = this.glyphs[key];
    if (!g) return;
    let f = ((frame % this.frames) + this.frames) % this.frames;
    if (this.staticKeys.has(key)) f = this.front;
    ctx.drawImage(this.image, g[0], this.top + f * this.pitch, g[1], this.frameH,
      Math.round(x * S), Math.round(y * S), g[1] * zoom * S, this.frameH * zoom * S);
  }

  /** Ganzer Text in Vorderansicht. align: 'left' | 'center' | 'right'. */
  drawText(ctx, S, text, x, y, align = 'left', zoom = 1, frame = this.front) {
    const w = this.measure(text) * zoom;
    const px = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    for (const item of this.layout(text)) {
      if (item.key) this.drawGlyph(ctx, S, item.key, frame, px + item.x * zoom, y, zoom);
    }
  }

  get lineH() { return this.frameH; }
}

/** Raster von BoldPixels.png, falls fonts.json (z. B. aus einem alten Cache) keinen Eintrag "bold" liefert. */
const BOLD_DEFAULT = { first: 32, count: 95, columns: 16, cellW: 9, cellH: 17, glyphX: 1, glyphY: 1, glyphW: 8, glyphH: 16, ink: [0, 0, 0], top: 4, gap: 1, spaceWidth: 4 };

/**
 * Pixelschrift aus dem unveraenderten Sheet fonts/BoldPixels.png (Raster aus fonts.json "bold"): Zellen
 * cellW x cellH, Zeichen glyphW x glyphH ab (glyphX, glyphY) in der Zelle, ASCII ab "first" zeilenweise.
 * Das Sheet ist schwarz auf weiss; beim Laden wird die Tinte einmal zu weissen Pixeln auf Transparenz,
 * die Breite jedes Zeichens ergibt sich aus seiner letzten Tintenspalte (proportional). 1 Font-Pixel = 1 Art-Pixel.
 */
export class PixelFont {
  constructor(image, meta) {
    meta = Object.assign({}, BOLD_DEFAULT, meta);
    this.meta = meta;
    this.top = meta.top ?? 0;           // Oberkante der Grossbuchstaben in der Zeichenzelle
    this.gap = meta.gap ?? 1;
    this.spaceW = meta.spaceWidth ?? 4;
    this.glyphH = meta.glyphH;
    this.glyphs = {};                   // Zeichen -> [x, y, w] im Bild
    this.tinted = new Map();
    const c = document.createElement('canvas');
    c.width = image.width; c.height = image.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(image, 0, 0);
    const data = g.getImageData(0, 0, c.width, c.height);
    const d = data.data, [ir, ig, ib] = meta.ink || [0, 0, 0];
    for (let i = 0; i < d.length; i += 4) {
      const ink = d[i] === ir && d[i + 1] === ig && d[i + 2] === ib && d[i + 3] > 0;
      d[i] = d[i + 1] = d[i + 2] = 255;
      d[i + 3] = ink ? 255 : 0;
    }
    g.putImageData(data, 0, 0);
    this.image = c;
    for (let n = 0; n < meta.count; n++) {
      const x = (n % meta.columns) * meta.cellW + meta.glyphX;
      const y = Math.floor(n / meta.columns) * meta.cellH + meta.glyphY;
      let w = 0;
      for (let gx = 0; gx < meta.glyphW; gx++) {
        for (let gy = 0; gy < meta.glyphH; gy++) if (d[((y + gy) * c.width + x + gx) * 4 + 3]) { w = gx + 1; break; }
      }
      if (w) this.glyphs[String.fromCharCode(meta.first + n)] = [x, y, w];
    }
  }

  measure(text) {
    let w = 0;
    for (const ch of text) w += (this.glyphs[ch] ? this.glyphs[ch][2] : this.spaceW) + this.gap;
    return Math.max(0, w - this.gap);
  }

  /** Eingefaerbte Kopie des Sheets (einmal je Farbe). */
  tintedImage(color) {
    if (!color) return this.image;
    let c = this.tinted.get(color);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = this.image.width; c.height = this.image.height;
    const g = c.getContext('2d');
    g.drawImage(this.image, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    this.tinted.set(color, c);
    return c;
  }

  /**
   * Text mit Oberkante der Grossbuchstaben bei Art-y. align: 'left' | 'center' | 'right'.
   * shrink: Font-Pixel um so viele Geraetepixel kleiner als ein Art-Pixel (S - shrink, mindestens 1),
   * gerechnet direkt in Geraetepixeln, damit jedes Font-Pixel gleich gross und scharf bleibt.
   */
  drawText(ctx, S, text, x, y, align = 'left', color = null, shrink = 0) {
    const P = Math.max(1, S - shrink);
    const w = this.measure(text) * P;
    let px = Math.round(x * S - (align === 'center' ? w / 2 : align === 'right' ? w : 0));
    const src = this.tintedImage(color);
    const top = Math.round(y * S) - this.top * P;
    for (const ch of text) {
      const g = this.glyphs[ch];
      if (g) {
        ctx.drawImage(src, g[0], g[1], g[2], this.glyphH, px, top, g[2] * P, this.glyphH * P);
        px += (g[2] + this.gap) * P;
      } else {
        px += (this.spaceW + this.gap) * P;
      }
    }
  }
}
