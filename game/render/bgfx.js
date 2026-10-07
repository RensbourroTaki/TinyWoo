// Masken-Schimmer: die weissen Pixel von bgNN_mask.png (Leiterbahnen) leuchten im Farbton des Hintergrunds auf.
// Beim Aufbau wird jede Bahn vermessen (zusammenhaengende Pixel = Strang, Weg ab einem Endpunkt = Position auf
// dem Strang). Pro Frame laufen darueber:
//   1. Strom-Fluss: Wellen wandern entlang jedes Strangs (eigenes Tempo, Richtung, Phase je Strang und Welle)
//   2. Kaustik-Rauschen: zwei gegeneinander treibende Rauschfelder, ihre "Adern" regeln, wo es gerade gluet
//   3. Funken: ein heller Kopf mit Schweif schiesst eine Bahn entlang (an Abzweigen in alle Aeste)
// Die Helligkeit wird in harte Stufen gerastert (Retro-Look) und additiv ueber den Hintergrund gelegt.

/** Regler. Zeiten in Frames (60/s), Laengen in Art-Pixeln. [a, b] = Zufallsbereich. */
export const BGFX = {
  flowWaves: 2,              // Wellenzuege je Strang
  flowSpeed: [0.125, 0.4],   // Tempo der Wellen (halbiert, User 2026-10-07)
  flowLength: [20, 56],      // Abstand der Wellenberge
  flowSharp: 6,              // Schaerfe der Wellenberge (hoeher = kuerzere Pulse)
  flowWarp: 2.5,             // wie stark das Rauschen die Wellen verbiegt
  flowGain: 0.9,             // Helligkeit des Flusses
  noiseScale: 44,            // Groesse der Kaustik-Flecken
  noiseSpeed: 0.004,         // Tempo des Rauschens
  noiseFloor: 0.2,           // Grundhelligkeit ausserhalb der Kaustik-Adern
  sparkRate: 0.03,           // Wahrscheinlichkeit je Frame fuer einen neuen Funken
  sparkSpeed: [0.75, 1.75],
  sparkLength: [10, 26],
  steps: 5,                  // Helligkeitsstufen
  white: 0.55,               // Weiss-Anteil im heissen Kern
};

const rnd = (r) => r[0] + Math.random() * (r[1] - r[0]);

// ------------------------------------------------------------------ Rauschen (Wert-Rauschen 3D)

function hash3(x, y, z) {
  let h = Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1) ^ Math.imul(z, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const l = (a, b, t) => a + (b - a) * t;
  const x0 = l(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u);
  const x1 = l(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u);
  const x2 = l(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u);
  const x3 = l(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u);
  return l(l(x0, x1, v), l(x2, x3, v), w);
}

// ------------------------------------------------------------------ Schimmer

export class BgShimmer {
  /**
   * @param bgImg Hintergrundbild, maskImg Maske gleicher Groesse, W/H Schirm in Art-Pixeln,
   * tiled = Kachel (Bild und Maske werden ab links oben wiederholt).
   */
  constructor(bgImg, maskImg, W, H, tiled) {
    this.W = W;
    this.H = H;
    this.t = Math.floor(Math.random() * 10000);
    const bg = readPixels(bgImg, W, H, tiled);
    const mk = readPixels(maskImg, W, H, tiled);
    const on = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) on[i] = mk[i * 4 + 3] > 127 && mk[i * 4] + mk[i * 4 + 1] + mk[i * 4 + 2] > 382 ? 1 : 0;
    this.analyse(on, bg);

    this.canvas = document.createElement('canvas');
    this.canvas.width = W;
    this.canvas.height = H;
    this.g = this.canvas.getContext('2d');
    this.out = this.g.createImageData(W, H);
    for (const k of this.pix) this.out.data[k * 4 + 3] = 255;
    this.update();
  }

  /** Straenge finden, Position je Pixel bestimmen (Breitensuche ab einem Endpunkt), Leuchtfarbe je Pixel. */
  analyse(on, bg) {
    const W = this.W, H = this.H;
    const seen = new Uint8Array(W * H);
    const dist = new Int32Array(W * H).fill(-1);
    const neighbours = (k, fn) => {
      const x = k % W, y = (k - x) / W;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if ((dx || dy) && xx >= 0 && xx < W && on[yy * W + xx]) fn(yy * W + xx);
        }
      }
    };
    const pix = [], pd = [], pc = [];
    this.strands = [];
    for (let s = 0; s < W * H; s++) {
      if (!on[s] || seen[s]) continue;
      // Strang einsammeln
      const list = [s];
      seen[s] = 1;
      for (let i = 0; i < list.length; i++) neighbours(list[i], (n) => { if (!seen[n]) { seen[n] = 1; list.push(n); } });
      // Endpunkt (genau ein Nachbar) als Anfang, sonst irgendein Pixel
      let start = list[0];
      for (const k of list) { let c = 0; neighbours(k, () => c++); if (c === 1) { start = k; break; } }
      const queue = [start];
      dist[start] = 0;
      let maxD = 0;
      for (let i = 0; i < queue.length; i++) {
        const k = queue[i];
        maxD = Math.max(maxD, dist[k]);
        neighbours(k, (n) => { if (dist[n] < 0) { dist[n] = dist[k] + 1; queue.push(n); } });
      }
      const id = this.strands.length;
      const waves = [];
      for (let w = 0; w < BGFX.flowWaves; w++) {
        waves.push({ speed: rnd(BGFX.flowSpeed) * (Math.random() < 0.5 ? -1 : 1), len: rnd(BGFX.flowLength), phase: Math.random() * Math.PI * 2 });
      }
      this.strands.push({ size: list.length, maxD, waves, sparks: [] });
      for (const k of list) { pix.push(k); pd.push(dist[k]); pc.push(id); }
    }
    this.pix = Int32Array.from(pix);
    this.dist = Float32Array.from(pd);
    this.strandOf = Uint16Array.from(pc);
    this.total = pix.length;

    // Leuchtfarbe: Mittel der Nicht-Masken-Pixel im 5x5-Umfeld, auf volle Helligkeit normiert
    this.color = new Uint8Array(pix.length * 3);
    let ar = 0, ag = 0, ab = 0, an = 0;
    for (let i = 0; i < W * H; i++) if (!on[i]) { ar += bg[i * 4]; ag += bg[i * 4 + 1]; ab += bg[i * 4 + 2]; an++; }
    for (let p = 0; p < pix.length; p++) {
      const k = pix[p], x = k % W, y = (k - x) / W;
      let r = 0, g = 0, b = 0, n = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          const j = yy * W + xx;
          if (on[j]) continue;
          r += bg[j * 4]; g += bg[j * 4 + 1]; b += bg[j * 4 + 2]; n++;
        }
      }
      if (!n) { r = ar; g = ag; b = ab; n = Math.max(1, an); }
      const m = Math.max(r, g, b, 1);
      this.color[p * 3] = Math.round(r / m * 255);
      this.color[p * 3 + 1] = Math.round(g / m * 255);
      this.color[p * 3 + 2] = Math.round(b / m * 255);
    }
  }

  /** Funken erzeugen und weiterbewegen. */
  updateSparks() {
    if (Math.random() < BGFX.sparkRate && this.total) {
      // Strang gewichtet nach Groesse waehlen, Mini-Straenge auslassen
      let r = Math.random() * this.total;
      let s = 0;
      while (s < this.strands.length - 1 && r >= this.strands[s].size) { r -= this.strands[s].size; s++; }
      const st = this.strands[s];
      if (st.maxD > 12) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        st.sparks.push({ head: Math.random() * st.maxD, dir, speed: rnd(BGFX.sparkSpeed), len: rnd(BGFX.sparkLength) });
      }
    }
    for (const st of this.strands) {
      if (!st.sparks.length) continue;
      for (const sp of st.sparks) sp.head += sp.dir * sp.speed;
      st.sparks = st.sparks.filter((sp) => sp.head > -sp.len && sp.head < st.maxD + sp.len);
    }
  }

  /** Ein Frame weiterrechnen (einmal je Logik-Tick). */
  update() {
    this.t++;
    this.updateSparks();
    const W = this.W, t = this.t, out = this.out.data, col = this.color;
    const ns = 1 / BGFX.noiseScale, nz = t * BGFX.noiseSpeed, drift = t * BGFX.noiseSpeed * 0.7;
    const steps = BGFX.steps, white = BGFX.white * 255;
    const TAU = Math.PI * 2;
    for (let p = 0; p < this.total; p++) {
      const k = this.pix[p], x = k % W, y = (k - x) / W;
      const d = this.dist[p];
      const st = this.strands[this.strandOf[p]];
      // Kaustik: Differenz zweier gegenlaeufiger Rauschfelder ergibt wandernde Adern
      const n1 = noise3(x * ns + drift, y * ns, nz);
      const n2 = noise3(x * ns * 1.3 - drift, y * ns * 1.3 + 7.1, nz * 1.4 + 31.7);
      let ridge = 1 - Math.abs(n1 - n2) * 3;
      ridge = ridge > 0 ? ridge * ridge * ridge : 0;
      const amp = BGFX.noiseFloor + (1 - BGFX.noiseFloor) * ridge;
      // Fluss entlang des Strangs
      let wave = 0;
      for (const wv of st.waves) {
        let s = 0.5 + 0.5 * Math.sin((d - t * wv.speed) / wv.len * TAU + wv.phase + n1 * BGFX.flowWarp);
        s **= BGFX.flowSharp;
        if (s > wave) wave = s;
      }
      let I = BGFX.flowGain * amp * wave;
      // Funken
      for (const sp of st.sparks) {
        const behind = (sp.head - d) * sp.dir;
        if (behind >= 0 && behind < sp.len) I += 1 - behind / sp.len;
      }
      if (I > 1) I = 1;
      const q = Math.round(I * steps) / steps;
      const hot = white * q * q;
      const o = k * 4, c = p * 3;
      out[o] = Math.min(255, col[c] * q + hot);
      out[o + 1] = Math.min(255, col[c + 1] * q + hot);
      out[o + 2] = Math.min(255, col[c + 2] * q + hot);
    }
    this.g.putImageData(this.out, 0, 0);
  }

  /** Additiv ueber den Hintergrund zeichnen (respektiert globalAlpha). */
  draw(ctx, S) {
    const op = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(this.canvas, 0, 0, this.W, this.H, 0, 0, this.W * S, this.H * S);
    ctx.globalCompositeOperation = op;
  }
}

/** Bild in Schirmgroesse lesen (Kachel wiederholt), RGBA-Bytes. */
function readPixels(img, W, H, tiled) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  if (tiled) {
    for (let y = 0; y < H; y += img.height) for (let x = 0; x < W; x += img.width) g.drawImage(img, x, y);
  } else {
    g.drawImage(img, 0, 0);
  }
  return g.getImageData(0, 0, W, H).data;
}
