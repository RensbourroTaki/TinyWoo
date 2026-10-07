// Statische Pruefung der Level-Regeln aus game/play/levels.js (kein Spieltest):
// Zeilenlaenge, erlaubte Zeichen, Zeilen 0/1 leer, Motive mit Abstand zur Wand, keine einzelnen
// Spezialsteine, Mover paarweise, 4..8 Items, Gold schliesst keine zaehlenden Steine ein.
// Aufruf: node game/tools/checklevels.mjs
import { LEVELS, MOTIF_SIDE, COLUMNS } from '../play/levels.js';

const SPECIAL = 'sSrgm';
let errors = 0;
const err = (name, msg) => { errors++; console.log(`${name}: ${msg}`); };

LEVELS.forEach((pair, r) => pair.forEach((L, v) => {
  const name = `R${r + 1}${v ? 'R' : 'L'}${MOTIF_SIDE[r] === v ? ' (Motiv)' : ''}`;
  const at = (x, y) => (y >= 0 && y < L.length && x >= 0 && x < COLUMNS ? L[y][x] : '.');
  L.forEach((row, y) => {
    if (row.length !== COLUMNS) err(name, `Zeile ${y} hat ${row.length} Zeichen`);
    if (/[^.0-7A-HsSrgm]/.test(row)) err(name, `Zeile ${y} hat unbekannte Zeichen`);
  });
  if (L.length > 15) err(name, 'mehr als 15 Zeilen');
  if (/[^.]/.test(L[0] + L[1])) err(name, 'Zeile 0/1 nicht leer');
  if (MOTIF_SIDE[r] === v && L.some((row) => row[0] !== '.' || row[COLUMNS - 1] !== '.')) err(name, 'Motiv beruehrt die Wand');
  let items = 0;
  const movers = {};
  L.forEach((row, y) => [...row].forEach((c, x) => {
    if (c >= 'A' && c <= 'H') items++;
    if (c === 'm') movers[y] = (movers[y] || 0) + 1;
    if (!SPECIAL.includes(c) || c === 'm') return;
    let n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && SPECIAL.includes(at(x + dx, y + dy))) n++;
    if (!n) err(name, `einzelner Spezialstein ${c} bei ${x},${y}`);
  }));
  for (const y in movers) if (movers[y] < 2) err(name, `Mover in Zeile ${y} ohne Partner`);
  if ((items < 4 || items > 8) && !(r === 0 && v === 0)) err(name, `${items} Items`);   // R1L = Original, bleibt wie es ist
  // Gold-Einschluss: Flutung von unten (Zeile 17) durch alles ausser Gold
  const H = 18, seen = new Set(), stack = [];
  for (let x = 0; x < COLUMNS; x++) stack.push([x, H - 1]);
  while (stack.length) {
    const [x, y] = stack.pop();
    const k = y * COLUMNS + x;
    if (x < 0 || x >= COLUMNS || y < 0 || y >= H || seen.has(k) || at(x, y) === 'g') continue;
    seen.add(k);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  L.forEach((row, y) => [...row].forEach((c, x) => {
    if (/[0-7A-HsS]/.test(c) && !seen.has(y * COLUMNS + x)) err(name, `Stein ${c} bei ${x},${y} von Gold eingeschlossen`);
  }));
}));
console.log(errors ? `${errors} Fehler` : 'Alle Level ok');
process.exit(errors ? 1 : 0);
