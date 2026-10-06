#!/usr/bin/env node
// Spielt die Session ohne Browser durch (Schlaeger folgt dem tiefsten Ball, waehlt Portale abwechselnd).
// Prueft, dass der Ablauf ohne Ausnahme laeuft und Runden erreicht werden.
//   node game/tools/autopilot.mjs [seeds] [minuten]
import { GameSession, Phase } from '../play/session.js';
import { MAX_BALLS } from '../core/playfield.js';

const seeds = parseInt(process.argv[2] || '6', 10);
const minutes = parseFloat(process.argv[3] || '10');
let worst = 0;
for (let seed = 1; seed <= seeds; seed++) {
  const s = new GameSession(seed * 7919);
  s.startGame();
  const counts = new Map();
  let maxRound = 0, caught = 0, lost = 0, kills = 0, side = -1;
  const frames = Math.round(minutes * 3600);
  for (let f = 0; f < frames; f++) {
    const p = s.field.paddle;
    let delta = 0, fire = (f % 90) === 0;
    if (s.phase === Phase.EXIT) {
      delta = side * 8;
    } else {
      // tiefster aktiver Ball
      let target = -1, lowest = 999;
      for (let i = 0; i < MAX_BALLS; i++) {
        if (!s.field.isActive(i)) continue;
        const b = s.field.balls[i];
        if (b.y < lowest) { lowest = b.y; target = b.x; }
      }
      if (target >= 0) delta = Math.max(-6, Math.min(6, target - 2 - p.center + ((f >> 4) & 3) - 1));
    }
    s.step(delta, fire);
    for (const e of s.events) {
      counts.set(e.kind, (counts.get(e.kind) || 0) + 1);
      if (e.kind === 'itemCaught') caught++;
      if (e.kind === 'lifeLost') lost++;
      if (e.kind === 'enemyKilled') kills++;
      if (e.kind === 'exitChosen') side = -side;
    }
    maxRound = Math.max(maxRound, s.round);
    if (s.phase === Phase.GAME_OVER || s.phase === Phase.COMPLETE) { s.startGame(); }
  }
  worst = Math.max(worst, 0);
  console.log(`seed ${seed}: max Runde ${maxRound + 1}, Items ${caught}, Leben verloren ${lost}, Gegner ${kills}, Score ${s.score}`);
  console.log('   ' + [...counts.entries()].sort().map(([k, v]) => `${k}=${v}`).join(' '));
}
