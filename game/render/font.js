// Zwei Bitmap-Schriften:
//  - SpinFont: die Drehschrift (fonts/spin.png, 16 Frames = echte 360-Grad-Drehung um die Hochachse,
//    Frame 4 = weisse Vorderansicht). Layout und Zellen stehen in fonts.json ("spin").
//  - ConsoleFont: normale 10-px-Schrift (fonts/console.png). Im Spiel nicht mehr benutzt, bleibt verfuegbar.
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

export class ConsoleFont {
  constructor(image, meta) {
    this.image = image;
    this.lineH = meta.lineHeight;   // 10
    this.glyphs = meta.glyphs;      // ch -> [x, y, w, h]
    this.spacing = 1;
    this.spaceW = 3;
    this.tinted = new Map();
  }

  measure(text) {
    let w = 0;
    for (const ch of text) {
      const g = this.glyphs[ch] || this.glyphs[ch.toUpperCase()];
      w += (g ? g[2] : this.spaceW) + this.spacing;
    }
    return Math.max(0, w - this.spacing);
  }

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

  drawText(ctx, S, text, x, y, align = 'left', color = null, zoom = 1) {
    const w = this.measure(text) * zoom;
    let px = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    const src = this.tintedImage(color);
    for (const ch of text) {
      const g = this.glyphs[ch] || this.glyphs[ch.toUpperCase()];
      if (g) {
        ctx.drawImage(src, g[0], g[1], g[2], g[3], Math.round(px * S), Math.round(y * S), Math.round(g[2] * zoom * S), Math.round(g[3] * zoom * S));
        px += (g[2] + this.spacing) * zoom;
      } else {
        px += (this.spaceW + this.spacing) * zoom;
      }
    }
  }
}
