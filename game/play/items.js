// Items (fallende Kapseln). Die Sprites liegen in assets/daiganoid/items/<key>.png (10 Frames 18x9).
// Wirkung wird in session.js umgesetzt; hier nur Definition, Gewichtung und Auswahl.

export const ITEMS = Object.freeze({
  e:     { key: 'e',     name: 'ENLARGE',  weight: 14, bad: false },   // Schlaeger gross (Original-Zonen $5D3C)
  minus: { key: 'minus', name: 'SHRINK',   weight: 8,  bad: true },    // Schlaeger klein ($5DBD)
  c:     { key: 'c',     name: 'CATCH',    weight: 12, bad: false },   // Ball klebt (Typ 6)
  n:     { key: 'n',     name: 'ILLUSION', weight: 6,  bad: false },   // Schatten-Schlaeger (Typ 7)
  l:     { key: 'l',     name: 'LASER',    weight: 14, bad: false },   // zwei Strahlen
  xl:    { key: 'xl',    name: 'X-LASER',  weight: 4,  bad: false },   // drei Strahlen
  a:     { key: 'a',     name: 'MEGA',     weight: 5,  bad: false },   // Durchschlag-Ball (Aura)
  b:     { key: 'b',     name: 'DISRUPT',  weight: 12, bad: false },   // drei Baelle
  o:     { key: 'o',     name: 'PLAYER',   weight: 2,  bad: false },   // Extraleben
  f:     { key: 'f',     name: 'SLOW',     weight: 10, bad: false },   // Ball langsamer
  x:     { key: 'x',     name: 'BREAK',    weight: 2,  bad: false },   // Portale oeffnen
  what:  { key: 'what',  name: '?',        weight: 8,  bad: false },   // Ueberraschung: beim Fangen zufaellig
});

export const ITEM_KEYS = Object.keys(ITEMS);
const REAL_KEYS = ITEM_KEYS.filter((k) => k !== 'what');

/** Zufaelliges Item nach Gewicht. rnd() liefert [0,1). */
export function pickItem(rnd, allowSurprise = true) {
  const keys = allowSurprise ? ITEM_KEYS : REAL_KEYS;
  let total = 0;
  for (const k of keys) total += ITEMS[k].weight;
  let r = rnd() * total;
  for (const k of keys) {
    r -= ITEMS[k].weight;
    if (r < 0) return k;
  }
  return 'e';
}

/** Aufloesung des Ueberraschungs-Items: jedes echte Item gleich wahrscheinlich, auch die schlechten. */
export function resolveSurprise(rnd) {
  return REAL_KEYS[Math.floor(rnd() * REAL_KEYS.length)];
}

/** Masse in Hardware-Pixeln (Logik): Sprite 18x9 Art-Pixel / 1,25. */
export const ITEM_W = 14;
export const ITEM_H = 7;
