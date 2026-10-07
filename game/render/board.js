// Das Board (240x334 Art-Pixel = Groesse der Vollbild-Hintergruende): der Hintergrund fuellt den ganzen Schirm,
// darueber haengt oben der Rahmen aus den Einzelteilen des Pocket-PC-Projekts (Rohre, Tueren mit Lichtern,
// Laempchen); Phaser und Rohr-Endkappen ("Duesen") haengen im festen Abstand unter dem Rahmen, der Phaser liegt obenauf.
// Der Rahmen wirft einen harten Schatten (wie das Logo) auf Hintergrund und Steine.
// Zeichenreihenfolge: drawBackground -> (Steine) -> drawShadow -> (Spielobjekte) -> drawFrame -> drawDynamic.
import { BgShimmer } from './bgfx.js';

export const ART_W = 240;
export const ART_H = 334;
export const FRAME_BOTTOM = 10 + 291;  // Unterkante der Rohre (frame-top 10 hoch, Rohre 291 hoch)
export const INNER = Object.freeze({ x: 10, y: 10, w: 220, h: 301 });   // Spielflaeche innerhalb der Rohre
export const PHASER_Y = FRAME_BOTTOM + 5;   // Phaser-Glow 240x22
export const FOOT_Y = FRAME_BOTTOM + 9;    // Rohr-Endkappen 14x9
export const DOOR_TOP = Object.freeze([{ x: 24, y: 1 }, { x: 187, y: 1 }]);           // 28x18
export const DOOR_LEFT = Object.freeze({ x: 0, y: 281, w: 18, h: 17, lightX: 10, lightW: 8 });
export const DOOR_RIGHT = Object.freeze({ x: 224, y: 281, w: 16, h: 17, lightX: 224, lightW: 6 });
export const LIGHTS = Object.freeze([[19, 4], [54, 4], [182, 4], [217, 4], [4, 275], [233, 275]]);   // 3x3
/** Schatten des Rahmens: Versatz in Art-Pixeln, Deckkraft (0,33 = Helligkeit 67 % wie die alten Edge-Steine). */
export const SHADOW = Object.freeze({ dx: 6, dy: 6, alpha: 0.33 });
/** Phaser: Schleifen-Frames 3..8, Helligkeit zittert in diesem Bereich. */
const PHASER_LOOP = [3, 8];
const PHASER_ALPHA = [0.72, 1];
export const PHASER_ALPHA_MENU = [0.35, 1];   // Menue: staerkeres Flackern

/** Schwarze Silhouette eines Bildes (gleiche Groesse). */
function silhouette(im, w = im.width, h = im.height) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(im, 0, 0, w, h);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = '#000000';
  g.fillRect(0, 0, w, h);
  return c;
}

/** Kachel oder Vollbild: kleiner als der halbe Schirm in beiden Richtungen = Kachel. */
export function isTile(im) {
  return im.width * 2 <= ART_W && im.height * 2 <= ART_H;
}

export class Board {
  constructor(assets) {
    this.img = assets.img;
    this.backgrounds = assets.backgrounds;
    this.S = 0;
    this.bgIndex = 0;
    this.bgCanvas = null;
    this.frameCanvas = null;
    this.frameShadow = null;
    this.shadowLayer = null;
    this.shimmer = null;
    this.shimmers = new Map();
    const I = this.img;
    this.black = {
      doorTopLeft: silhouette(I.doorTopLeft), doorTopRight: silhouette(I.doorTopRight),
      doorLeft: silhouette(I.doorLeft), doorRight: silhouette(I.doorRight), frameFoot: silhouette(I.frameFoot),
    };
  }

  get bgCount() {
    return this.backgrounds.length;
  }

  /** Ebenen neu aufbauen (bei Skalierung oder Hintergrundwechsel). bgIndex 0-basiert (0 = bg01). */
  build(S, bgIndex = this.bgIndex) {
    if (bgIndex < 0 || bgIndex >= this.backgrounds.length) bgIndex = 0;
    const scaleChanged = this.S !== S || !this.frameCanvas;
    if (!scaleChanged && this.bgCanvas && this.bgIndex === bgIndex) return;
    this.S = S;
    this.bgIndex = bgIndex;
    const W = ART_W * S, H = ART_H * S;
    const I = this.img;
    const canvas = () => {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const g = c.getContext('2d');
      g.imageSmoothingEnabled = false;
      return [c, g];
    };

    // Hintergrund: Vollbild ab links oben (nicht wiederholt) oder Kachel ueber den ganzen Schirm
    const bg = this.backgrounds[bgIndex];
    const tiled = isTile(bg.img);
    const [bc, bgc] = canvas();
    bgc.fillStyle = '#000000';
    bgc.fillRect(0, 0, W, H);
    const bw = bg.img.width, bh = bg.img.height;
    if (tiled) {
      for (let y = 0; y < ART_H; y += bh) for (let x = 0; x < ART_W; x += bw) bgc.drawImage(bg.img, x * S, y * S, bw * S, bh * S);
    } else {
      bgc.drawImage(bg.img, 0, 0, bw * S, bh * S);
    }
    this.bgCanvas = bc;

    // Masken-Schimmer (einmal je Hintergrund analysiert)
    this.shimmer = null;
    if (bg.mask) {
      if (!this.shimmers.has(bgIndex)) {
        let sh = null;
        try { sh = new BgShimmer(bg.img, bg.mask, ART_W, ART_H, tiled); } catch (e) { sh = null; }   // z. B. file:// ohne Pixelzugriff
        this.shimmers.set(bgIndex, sh);
      }
      this.shimmer = this.shimmers.get(bgIndex);
    }

    if (scaleChanged) {
      const blit = (g, im, x, y) => g.drawImage(im, 0, 0, im.width, im.height, x * S, y * S, im.width * S, im.height * S);
      const [fc, fg] = canvas();
      blit(fg, I.frameTop, 0, 0);
      blit(fg, I.frameLeft, 0, 10);
      blit(fg, I.frameRight, 230, 10);
      this.frameCanvas = fc;
      this.frameShadow = silhouette(fc);
      this.shadowLayer = canvas();
    }
  }

  /** Einmal je Logik-Tick: Schimmer weiterrechnen. */
  update() {
    if (this.shimmer) this.shimmer.update();
  }

  drawBackground(ctx) {
    ctx.drawImage(this.bgCanvas, 0, 0);
    if (this.shimmer) this.shimmer.draw(ctx, this.S);
  }

  /** Harter Schatten von Rahmen, Tueren und Endkappen; erst opak gesammelt, dann einmal halbtransparent (keine Doppelschatten). */
  drawShadow(ctx, st) {
    const S = this.S;
    const [c, g] = this.shadowLayer;
    const B = this.black;
    g.clearRect(0, 0, c.width, c.height);
    g.drawImage(this.frameShadow, SHADOW.dx * S, SHADOW.dy * S);
    const at = (im, frameH, f, x, y) => this.frame(g, im, frameH, f, x + SHADOW.dx, y + SHADOW.dy);
    at(B.frameFoot, 9, 0, 0, FOOT_Y);
    at(B.frameFoot, 9, 1, ART_W - 14, FOOT_Y);
    at(B.doorTopLeft, 18, st.doorTop[0], DOOR_TOP[0].x, DOOR_TOP[0].y);
    at(B.doorTopRight, 18, st.doorTop[1], DOOR_TOP[1].x, DOOR_TOP[1].y);
    at(B.doorLeft, 17, st.doorLeft, DOOR_LEFT.x, DOOR_LEFT.y);
    at(B.doorRight, 17, st.doorRight, DOOR_RIGHT.x, DOOR_RIGHT.y);
    const a0 = ctx.globalAlpha;
    ctx.globalAlpha = a0 * SHADOW.alpha;
    ctx.drawImage(c, 0, 0);
    ctx.globalAlpha = a0;
  }

  drawFrame(ctx) {
    ctx.drawImage(this.frameCanvas, 0, 0);
  }

  /** Alles ohne Spielobjekte (Intro, Menue). */
  drawAll(ctx, st) {
    this.drawBackground(ctx);
    this.drawShadow(ctx, st);
    this.drawFrame(ctx);
    this.drawDynamic(ctx, st);
  }

  /** Ein Frame eines vertikalen Streifens an Art-Position (x,y); alpha wirkt zusaetzlich zum globalAlpha. */
  frame(ctx, im, frameH, f, x, y, alpha = 1) {
    if (!im) return;
    const S = this.S;
    const a0 = ctx.globalAlpha;
    if (alpha !== 1) ctx.globalAlpha = a0 * alpha;
    ctx.drawImage(im, 0, f * frameH, im.width, frameH, Math.round(x * S), Math.round(y * S), im.width * S, frameH * S);
    if (alpha !== 1) ctx.globalAlpha = a0;
  }

  /**
   * Dynamische Teile. state: { doorTop: [f,f], doorLeft, doorRight (0..3), topLight: [0/1,0/1],
   * lights: [6 x 0/1], phaserFrame (0..8, -1 aus), phaserAlpha }
   */
  drawDynamic(ctx, st) {
    const I = this.img;
    // Endkappen: oberer Frame = links, unterer Frame = rechts (statisch, der Phaser liegt darueber)
    this.frame(ctx, I.frameFoot, 9, 0, 0, FOOT_Y);
    this.frame(ctx, I.frameFoot, 9, 1, ART_W - 14, FOOT_Y);
    // Tueren oben
    this.frame(ctx, I.doorTopLeft, 18, st.doorTop[0], DOOR_TOP[0].x, DOOR_TOP[0].y);
    this.frame(ctx, I.doorTopRight, 18, st.doorTop[1], DOOR_TOP[1].x, DOOR_TOP[1].y);
    if (st.topLight[0]) this.frame(ctx, I.doorTopLight, 18, 1, DOOR_TOP[0].x, DOOR_TOP[0].y);
    if (st.topLight[1]) this.frame(ctx, I.doorTopLight, 18, 1, DOOR_TOP[1].x, DOOR_TOP[1].y);
    // Portale unten
    this.frame(ctx, I.doorLeft, 17, st.doorLeft, DOOR_LEFT.x, DOOR_LEFT.y);
    this.frame(ctx, I.doorRight, 17, st.doorRight, DOOR_RIGHT.x, DOOR_RIGHT.y);
    if (st.doorLeft > 0) this.frame(ctx, I.doorLeftLight, 17, st.doorLeft, DOOR_LEFT.lightX, DOOR_LEFT.y);
    if (st.doorRight > 0) this.frame(ctx, I.doorRightLight, 17, st.doorRight, DOOR_RIGHT.lightX, DOOR_RIGHT.y);
    // Laempchen
    for (let i = 0; i < LIGHTS.length; i++) this.frame(ctx, I.greenlight, 3, st.lights[i] ? 1 : 0, LIGHTS[i][0], LIGHTS[i][1]);
    // Phaser zuletzt (ueber Rahmen und Endkappen), additiv = leuchtender Strahl
    if (st.phaserFrame >= 0) {
      ctx.globalCompositeOperation = 'lighter';
      this.frame(ctx, I.phaser, 22, st.phaserFrame, 0, PHASER_Y, st.phaserAlpha ?? 1);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
}

/** Anfangszustand der dynamischen Teile. */
export function boardState() {
  return { doorTop: [0, 0], doorLeft: 0, doorRight: 0, topLight: [0, 0], lights: [0, 0, 0, 0, 0, 0], phaserFrame: -1, phaserAlpha: 1 };
}

/**
 * Phaser-Flackern: jeden Tick ein zufaelliger Schleifen-Frame (nie zweimal derselbe) und zitternde Helligkeit.
 * Nur Darstellung, benutzt Math.random (beruehrt keine Spiel-Zufallszahlen). flash = volle Helligkeit.
 */
export function flickerPhaser(st, flash = false, range = PHASER_ALPHA) {
  const n = PHASER_LOOP[1] - PHASER_LOOP[0] + 1;
  const inLoop = st.phaserFrame >= PHASER_LOOP[0] && st.phaserFrame <= PHASER_LOOP[1];
  let f = PHASER_LOOP[0] + Math.floor(Math.random() * (inLoop ? n - 1 : n));
  if (inLoop && f >= st.phaserFrame) f++;
  st.phaserFrame = f;
  st.phaserAlpha = flash ? 1 : range[0] + Math.random() * (range[1] - range[0]);
}
