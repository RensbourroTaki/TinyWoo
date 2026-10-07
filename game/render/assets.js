// Laedt alle Grafiken (PNG) und die Schrift-Metadaten. Alle Bilder liegen unter assets/daiganoid/.
// Animationen sind vertikale Streifen: ein Frame unter dem anderen (frameH = Hoehe eines Frames).

export const IMAGES = {
  frameTop: 'board/frame-top.png',           // 240x10
  frameLeft: 'board/frame-left.png',         // 10x291
  frameRight: 'board/frame-right.png',       // 10x291
  frameFoot: 'board/frame-foot.png',         // 14x18 = 2 Endkappen 14x9 (oben links, unten rechts)
  phaser: 'board/phaser.png',                // 9 Frames 240x22, Alpha
  doorTopLeft: 'board/door-top-left.png',    // 4 Frames 28x18
  doorTopRight: 'board/door-top-right.png',  // 4 Frames 28x18
  doorTopLight: 'board/door-top-light.png',  // 2 Frames 28x18
  doorLeft: 'board/door-left.png',           // 4 Frames 18x17
  doorRight: 'board/door-right.png',         // 4 Frames 16x17
  doorLeftLight: 'board/door-left-light.png',   // 4 Frames 8x17
  doorRightLight: 'board/door-right-light.png', // 4 Frames 6x17
  greenlight: 'board/greenlight.png',        // 2 Frames 3x3
  // Steine (der Schatten des Rahmens wird zur Laufzeit gezeichnet, siehe Board.drawShadow)
  brickWhite: 'blocks/white.png', brickOrange: 'blocks/orange.png', brickTuerk: 'blocks/tuerk.png',
  brickGreen: 'blocks/green.png', brickRed: 'blocks/red.png', brickBlue: 'blocks/blue.png',
  brickPink: 'blocks/pink.png', brickYellow: 'blocks/yellow.png',
  brickHard: 'blocks/grey.png',              // 2 Treffer, dann weg
  brickRegen: 'blocks/double-blue.png',      // 1 Treffer, waechst nach
  brickGold: 'blocks/gold.png',              // unzerstoerbar
  brickMover: 'blocks/double-gold.png',      // unzerstoerbar, wandert waagerecht
  brickDestroyed: 'blocks/destroyed.png',    // 3 Frames 20x10
  brickShine: 'blocks/shine.png',            // 6 Frames 20x10 (additiv)
  ball: 'player/ball.png',                   // 6x6
  paddle: 'player/paddle-thrust.png',        // 2 Frames 34x9
  paddleBeam: 'player/paddle-beam.png',      // 14 Frames 93x19
  explosion: 'player/explosion.png',         // 8 Frames 24x21
  enemy: 'enemy/cube.png',                   // 8 Frames 20x24
  fontSpin: 'fonts/spin.png',                // 16 Frames x 12 px
  fontBold: 'fonts/BoldPixels.png',          // Pixelschrift, Raster 9x17, schwarz auf weiss (render/font.js PixelFont)
  ballMega: 'player/ball-item1.png',         // 6x6, Mega-Ball (frisst alles)
  itemA: 'items/a.png', itemB: 'items/b.png', itemC: 'items/c.png', itemE: 'items/e.png', itemF: 'items/f.png',
  itemL: 'items/l.png', itemMinus: 'items/minus.png', itemN: 'items/n.png', itemO: 'items/o.png', itemX: 'items/x.png',
  itemWhat: 'items/what.png',
};

/** Optionale Bilder: fehlen sie (noch), wird ein Platzhalter gezeichnet. */
export const OPTIONAL_IMAGES = {
  logo: 'menu/logo.png',                     // 237x65
  logoAnim: 'menu/logo-anim.png',            // Frames 240x187 (Buchstaben fallen ein)
  logoShimmer: 'menu/logo-shimmer.png',      // 4 Frames 237x65
  paddleLaser: 'player/paddle-laser.png',    // Schlaeger mit Laser
  paddleCatch: 'player/paddle-catch.png',    // Magnet-Schlaeger
  laserShot: 'player/laser-shot.png',        // Laserschuss
  cursor: 'menu/cursor.png',                 // 16x16 Mauszeiger ueber dem Spiel, Spitze oben links
};

/** Farbklasse 0..7 der normalen Steine -> Bild (Punkte 50..120 wie im Original). */
export const BRICK_COLORS = ['brickWhite', 'brickOrange', 'brickTuerk', 'brickGreen', 'brickRed', 'brickBlue', 'brickPink', 'brickYellow'];

/**
 * Hintergruende: board/bg01.png, bg02.png, ... werden der Reihe nach geladen (neues Bild ablegen genuegt).
 * Fehlende Nummern werden uebersprungen; erst wenn ein ganzer Block von BG_BATCH Nummern fehlt, ist Schluss.
 * Gibt es dazu bgNN_mask.png, schimmern dessen weisse Stellen (render/bgfx.js).
 * Ob Vollbild oder Kachel, entscheidet das Board an der Bildgroesse.
 */
export const BG_DIR = 'board/';
const BG_MAX = 99;
const BG_BATCH = 8;           // so viele Nummern werden gleichzeitig angefragt

/** Hintergrund-Index (0-basiert) je Runde: Runde 1 = bg01, danach reihum bg02..bgNN. */
export function roundBackground(round, count) {
  if (round <= 0 || count <= 1) return 0;
  return 1 + ((round - 1) % (count - 1));
}

async function loadBackgrounds(base) {
  const list = [];
  for (let first = 1; first <= BG_MAX; first += BG_BATCH) {
    const nums = [];
    for (let n = first; n < first + BG_BATCH && n <= BG_MAX; n++) nums.push(n);
    const got = await Promise.all(nums.map((n) => {
      const name = `bg${String(n).padStart(2, '0')}`;
      return loadImage(`${base}${BG_DIR}${name}.png`, true)
        .then((img) => (img ? loadImage(`${base}${BG_DIR}${name}_mask.png`, true).then((mask) => ({ name, img, mask })) : null));
    }));
    const found = got.filter(Boolean);
    if (!found.length) return list;
    list.push(...found);
  }
  return list;
}

function loadImage(url, optional) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => (optional ? resolve(null) : reject(new Error(`Bild fehlt: ${url}`)));
    img.src = url;
  });
}

/**
 * Laedt alles. base = Pfad zu assets/daiganoid/ (mit Schraegstrich am Ende).
 * Liefert { img: {name: Image|null}, fonts: {spin, console}, backgrounds: [{ name, img, mask|null }] }.
 */
export async function loadAssets(base, onProgress) {
  const img = {};
  const names = Object.keys(IMAGES);
  const optNames = Object.keys(OPTIONAL_IMAGES);
  const total = names.length + optNames.length + 2;
  let done = 0;
  const tick = () => { done++; if (onProgress) onProgress(done / total); };
  const jobs = [];
  for (const n of names) jobs.push(loadImage(base + IMAGES[n], false).then((i) => { img[n] = i; tick(); }));
  for (const n of optNames) jobs.push(loadImage(base + OPTIONAL_IMAGES[n], true).then((i) => { img[n] = i; tick(); }));
  // no-cache: nach einem Update darf keine alte fonts.json aus dem Browser-Cache zu neuem Code passen muessen
  const fontsJob = fetch(base + 'fonts/fonts.json', { cache: 'no-cache' }).then((r) => r.json()).then((j) => { tick(); return j; });
  const bgJob = loadBackgrounds(base).then((l) => { tick(); return l; });
  await Promise.all(jobs);
  const fonts = await fontsJob;
  const backgrounds = await bgJob;
  if (!backgrounds.length) throw new Error(`Bild fehlt: ${base}${BG_DIR}bg01.png`);
  return { img, fonts, backgrounds };
}
