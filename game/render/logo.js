// Logo im Menue: hartes 1:1-Schattenbild (kein Smoothing, Versatz in ganzen Art-Pixeln) und ein
// gelegentlicher Schimmer, der als harter heller Streifen ueber die Logo-Pixel laeuft.

export class LogoFx {
  constructor(img) {
    this.img = img;
    this.S = 0;
    this.shadow = null;    // Offscreen: Logo-Silhouette in Schwarz
    this.shine = null;     // Offscreen: Logo-Silhouette in Weiss (Maske fuer den Streifen)
    this.t = 0;
    this.shimmer = -1;     // Frame des laufenden Schimmers, -1 = keiner
    this.next = 240;       // Frames bis zum naechsten Schimmer
    this.offsetX = 3;
    this.offsetY = 3;
  }

  build(S) {
    if (this.S === S) return;
    this.S = S;
    const w = this.img.width * S, h = this.img.height * S;
    const mk = (color) => {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const g = c.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.drawImage(this.img, 0, 0, w, h);
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = color;
      g.fillRect(0, 0, w, h);
      return c;
    };
    this.shadow = mk('#000000');
    this.shine = mk('#ffffff');
  }

  startShimmer() {
    if (this.shimmer < 0) this.shimmer = 0;
  }

  update() {
    this.t++;
    if (this.shimmer >= 0) {
      this.shimmer++;
      if (this.shimmer > this.img.width + 40) { this.shimmer = -1; this.next = 300 + Math.floor(Math.random() * 360); }
    } else if (--this.next <= 0) {
      this.startShimmer();
    }
  }

  /** Logo an Art-Position (x,y), optional Alpha. Schatten zuerst, dann Logo, dann Schimmer. */
  draw(ctx, S, x, y, alpha = 1) {
    this.build(S);
    const X = Math.round(x) * S, Y = Math.round(y) * S;
    const w = this.img.width * S, h = this.img.height * S;
    ctx.globalAlpha = 0.5 * alpha;
    ctx.drawImage(this.shadow, X + this.offsetX * S, Y + this.offsetY * S);
    ctx.globalAlpha = alpha;
    ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, X, Y, w, h);
    if (this.shimmer >= 0) {
      // harter diagonaler Streifen: Kern 6 px voll, je 6 px halb, laeuft 2 px je Frame von links nach rechts
      const p = this.shimmer * 2 - 20;
      ctx.save();
      ctx.beginPath();
      ctx.rect(X, Y, w, h);
      ctx.clip();
      ctx.globalCompositeOperation = 'lighter';
      const band = (dx, bw, a) => {
        ctx.globalAlpha = a * alpha;
        ctx.beginPath();
        ctx.moveTo(X + (p + dx) * S, Y);
        ctx.lineTo(X + (p + dx + bw) * S, Y);
        ctx.lineTo(X + (p + dx + bw - this.img.height / 2) * S, Y + h);
        ctx.lineTo(X + (p + dx - this.img.height / 2) * S, Y + h);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(this.shine, X, Y);
        ctx.restore(); ctx.save();
        ctx.beginPath(); ctx.rect(X, Y, w, h); ctx.clip();
        ctx.globalCompositeOperation = 'lighter';
      };
      band(-6, 6, 0.35);
      band(0, 6, 0.8);
      band(6, 6, 0.35);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}
