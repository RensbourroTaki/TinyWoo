#!/usr/bin/env node
// Verifikation des JS-Kerns gegen die MAME-Traces von "Arkanoid - Revenge of Doh" (arknoid2).
// Portierung der C#-Harness cs_verify (DAIGANOID_2027_DATA/Meme/analysis/cs_verify): Fuer jeden Snapshot
// wird der MAME-Zustand geladen, ein Schritt gerechnet und jedes Byte mit dem naechsten Snapshot verglichen.
//
//   node game/tools/verify.mjs <trace.bin> [...] [--details N]
//
// Exit 0 = keine Abweichung. Die Traces entstehen mit lua/07_trace.lua (siehe Docs/HANDOFF.md im Unity-Projekt).
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { Playfield, fieldConfig, StepResult } from '../core/playfield.js';
import { paddleGeometryFor, PaddleType } from '../core/paddle.js';
import { horizontalReflectionOf, verticalReflectionOf } from '../core/ballmotion.js';

const A = {
  E5EE: 0xE5EE, E5CF: 0xE5CF, E5D0: 0xE5D0, EA42: 0xEA42, E5E6: 0xE5E6, E7E0: 0xE7E0, E7E5: 0xE7E5,
  E5F7: 0xE5F7, E5F3: 0xE5F3, E5F4: 0xE5F4, E5F5: 0xE5F5, E5F6: 0xE5F6, E7E1: 0xE7E1, E7E2: 0xE7E2,
  EA33: 0xEA33, EA34: 0xEA34, EA37: 0xEA37, E006: 0xE006, E720: 0xE720, E727: 0xE727, E393: 0xE393, E731: 0xE731,
  E5EF: 0xE5EF,
};
const FIELD_NAMES = ['+0', '+1', 'spd', 'dir', '+4', 'c5', 'c6', 'Y', 'X', '+9', '+A', 'stick', 'bounce'];

// ---------------------------------------------------------------- Trace lesen (Trace.cs)

function readTrace(path) {
  const d = readFileSync(path);
  const list = [];
  let p = 0;
  let scalarAddrs = null;
  let cur = null;
  const add = (e) => { if (cur) cur.events.push(e); };
  while (p < d.length) {
    const k = String.fromCharCode(d[p++]);
    switch (k) {
      case 'H': {
        const n = d[p] | (d[p + 1] << 8); p += 2;
        scalarAddrs = new Array(n);
        for (let i = 0; i < n; i++) { scalarAddrs[i] = d[p] | (d[p + 1] << 8); p += 2; }
        break;
      }
      case 'S': {
        if (p + 11 + 416 + 4 + 12 + scalarAddrs.length > d.length) { p = d.length; break; }
        const s = { file: path, events: [], map: null, scalars: new Map() };
        s.seq = d.readUInt32LE(p); p += 4;
        s.frame = d.readUInt32LE(p); p += 4;
        s.poked = (d[p++] & 1) !== 0;
        s.spinNew = d[p++];
        s.spinOld = d[p++];
        s.balls = Uint8Array.from(d.subarray(p, p + 416)); p += 416;
        s.masks = Uint8Array.from(d.subarray(p, p + 4)); p += 4;
        s.paddleBytes = Uint8Array.from(d.subarray(p, p + 12)); p += 12;
        for (const a of scalarAddrs) s.scalars.set(a, d[p++]);
        list.push(s);
        cur = s;
        break;
      }
      case 'M':
        if (cur) cur.map = Uint8Array.from(d.subarray(p, p + 234));
        p += 234;
        break;
      case 'F': add({ kind: 'F', a: d[p] }); p += 1; break;
      case 'R': add({ kind: 'R', a: d[p], b: d[p + 1], c: d[p + 2] }); p += 3; break;
      case 'B': add({ kind: 'B', a: d[p], b: d[p + 1] | (d[p + 2] << 8) }); p += 3; break;
      case 'E': case 'L': case 'X': case 'N': add({ kind: k }); break;
      case 'W': add({ kind: 'W', a: d[p] | (d[p + 1] << 8), b: d[p + 2] | (d[p + 3] << 8), c: d[p + 4] }); p += 5; break;
      default: throw new Error(`${path}: unbekannter Record '${k}' bei Offset ${p - 1}`);
    }
  }
  return list;
}

// ---------------------------------------------------------------- Zufall aus dem Trace

function turn(a, bit) {
  if (bit) { a = (a + 1) & 0xFF; if ((a & 0x18) === 0) a -= 2; } else { a = (a - 1) & 0xFF; if ((a & 0x18) === 0) a += 2; }
  return a & 0x1F;
}
function bitFor(oldCode, newCode) {
  if (turn(oldCode, true) === newCode) return true;
  if (turn(oldCode, false) === newCode) return false;
  return null;
}
class ScriptedRandom {
  constructor() { this.bits = []; this.underflows = 0; }
  nextBit() {
    if (this.bits.length === 0) { this.underflows++; return false; }
    return this.bits.shift();
  }
}

// ---------------------------------------------------------------- Abdeckung

class Coverage {
  constructor(field) {
    this.field = field; this.counts = new Map(); this.zoneHits = new Set(); this.brickContacts = [];
    this.lastStick = new Array(32).fill(0);
  }
  add(k) { this.counts.set(k, (this.counts.get(k) || 0) + 1); }
  effType() {
    let t = this.field.paddle.type;
    if ((t & 0x80) !== 0) { t = this.field.paddle.pendingType & 0x7F; if (t === 0) t = this.field.paddle.previousType & 0x7F; t |= 0x100; }
    return t;
  }
  onLaunch(ball) { this.add(this.field.balls[ball].stickTimer === 0 && this.lastStick[ball] === 1 ? 'launch.timer' : 'launch.fire'); }
  onPaddleHit(ball, code) {
    this.add(`paddle.type${this.effType()}.code${hex(code)}`);
    const d = (this.field.balls[ball].x - this.field.paddle.left) & 0xFF;
    this.zoneHits.add((this.effType() << 16) | (d << 8) | code);
  }
  onCatch() { this.add('paddle.catch'); }
  onPaddleFlatBounce(ball) {
    this.add('paddle.flat');
    if (this.field.flatReflect === 0) {
      const d = (this.field.balls[ball].x - this.field.paddle.left) & 0xFF;
      this.zoneHits.add((this.effType() << 16) | (d << 8) | 0xF1);
    }
  }
  onShadowHit() { this.add('paddle.shadowhit'); }
  onWallBounce(ball) { this.add(this.field.balls[ball].x >= 0x80 ? 'wall.right' : 'wall.left'); }
  onCeilingBounce() { this.add('ceiling'); }
  onSpeedUp(ball, speed) { this.add(`speedup.to${String(speed).padStart(2, '0')}`); }
  onRandomTurn() { this.add('randomturn'); }
  onBallLost() { this.add('ball.lost'); }
  onIdleLimit() { this.add('idlelimit'); }
  onBrickHit(ball, cell, before, after) { this.add(before === after ? 'brick.hit.gold' : 'brick.hit.silver'); this.brickContacts.push(ball); }
  onBrickDestroyed(ball, cell, value, capsule, regenerates) {
    const kind = value & 3;
    this.add(kind === 3 ? (regenerates ? 'brick.destroy.regen' : (value & 0x80) !== 0 ? 'brick.destroy.gold-pierce' : 'brick.destroy.silver')
      : capsule ? 'brick.destroy.capsule' : 'brick.destroy.normal');
    this.brickContacts.push(ball);
  }
}

// ---------------------------------------------------------------- Laden / Vergleichen (Program.cs)

const sv = (s, a) => s.scalars.get(a);

function load(f, s) {
  for (let i = 0; i < 32; i++) f.balls[i].readBytes(s.balls, i * 13);
  f.activeMasks.set(s.masks);
  f.paddle.bytes.set(s.paddleBytes);
  f.paddle.delta = sv(s, A.E5EE);
  f.paddle.type = sv(s, A.E5CF);
  f.paddle.previousType = sv(s, A.E5D0);
  f.paddle.pendingType = sv(s, A.EA42);
  f.paddle.shadowLag1 = sv(s, A.EA33);
  f.paddle.shadowLag2 = sv(s, A.EA34);
  f.flatReflect = sv(s, A.E5E6);
  f.minSpeed = sv(s, A.E7E0);
  f.difficulty = sv(s, A.E7E5);
  f.specialMode = sv(s, A.E5F7);
  f.multiballCount = sv(s, A.E5F3);
  f.multiballPending = sv(s, A.E5F4);
  f.ballCount = sv(s, A.E5F5);
  f.specialTarget = sv(s, A.E5F6);
  f.idleFrames = sv(s, A.E7E1) | (sv(s, A.E7E2) << 8);
  f.shadowHits = sv(s, A.EA37);
  f.pierceBall = sv(s, A.E731);
  if (s.map) f.bricks.cells.set(s.map); else f.bricks.clear();
  f.bricks.remaining = sv(s, A.E393);
}

function compare(f, t) {
  const d = [];
  const tmp = new Uint8Array(13);
  for (let i = 0; i < 32; i++) {
    f.balls[i].writeBytes(tmp, 0);
    for (let j = 0; j < 13; j++) {
      if (tmp[j] !== t.balls[i * 13 + j]) d.push(`ball${i}.${FIELD_NAMES[j]}=kern ${hex(tmp[j])}/mame ${hex(t.balls[i * 13 + j])}`);
    }
  }
  for (let g = 0; g < 4; g++) if (f.activeMasks[g] !== t.masks[g]) d.push(`maske${g}=kern ${hex(f.activeMasks[g])}/mame ${hex(t.masks[g])}`);
  for (let j = 0; j < 12; j++) if (f.paddle.bytes[j] !== t.paddleBytes[j]) d.push(`E7${hex(j)}=kern ${hex(f.paddle.bytes[j])}/mame ${hex(t.paddleBytes[j])}`);
  const cmp = (name, kern, mame) => { if (kern !== mame) d.push(`${name}=kern ${hex(kern)}/mame ${hex(mame)}`); };
  cmp('E5EE', f.paddle.delta, sv(t, A.E5EE));
  cmp('E5CF', f.paddle.type, sv(t, A.E5CF));
  cmp('E5D0', f.paddle.previousType, sv(t, A.E5D0));
  cmp('EA42', f.paddle.pendingType, sv(t, A.EA42));
  cmp('EA33', f.paddle.shadowLag1, sv(t, A.EA33));
  cmp('EA34', f.paddle.shadowLag2, sv(t, A.EA34));
  cmp('E5E6', f.flatReflect, sv(t, A.E5E6));
  cmp('E7E0', f.minSpeed, sv(t, A.E7E0));
  cmp('E7E5', f.difficulty, sv(t, A.E7E5));
  cmp('E5F7', f.specialMode, sv(t, A.E5F7));
  cmp('E5F3', f.multiballCount, sv(t, A.E5F3));
  cmp('E5F4', f.multiballPending, sv(t, A.E5F4));
  cmp('E5F5', f.ballCount, sv(t, A.E5F5));
  cmp('E5F6', f.specialTarget, sv(t, A.E5F6));
  cmp('E7E1', f.idleFrames, sv(t, A.E7E1) | (sv(t, A.E7E2) << 8));
  cmp('EA37', f.shadowHits, sv(t, A.EA37));
  cmp('E731', f.pierceBall, sv(t, A.E731));
  if (t.map) {
    for (let i = 0; i < f.bricks.cellCount; i++) if (f.bricks.cells[i] !== t.map[i]) d.push(`map[${i}]=kern ${hex(f.bricks.cells[i])}/mame ${hex(t.map[i])}`);
    cmp('E393', f.bricks.remaining, sv(t, A.E393));
  }
  return d;
}

/** Rundenstart: Kern-startRound auf der Schlaegerlage des Snapshots gegen diesen Snapshot. */
function checkRoundStart(f, t) {
  load(f, t);
  for (let i = 0; i < 32; i++) f.balls[i].unused4 = 0x55;   // muss startRound ueberschreiben
  f.startRound(sv(t, A.E720), sv(t, A.E727));
  return compare(f, t).filter((x) => x.startsWith('ball') || x.startsWith('maske') || x.startsWith('E5F') || x.startsWith('E7E'));
}

const modeledPc = (pc) => pc >= 0x3AF0 && pc <= 0x3B0C;
function solidRead(e) {
  if (e.b >= 0x4317 && e.b <= 0x431A) return (e.a & 4) === 0 && (e.a & 3) !== 0;
  return e.a !== 0 && (e.a & 4) === 0;
}
const hex = (v) => (v & 0xFF).toString(16).toUpperCase().padStart(2, '0');
const hex4 = (v) => (v & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
const hexRow = (a, off, n) => Array.from({ length: n }, (_, i) => hex(a[off + i])).join(' ');
const count = (m, k) => m.set(k, (m.get(k) || 0) + 1);
const describe = (e) => e.kind === 'F' ? `F${hex(e.a)}` : e.kind === 'R' ? `R${e.a}:${hex(e.b)}>${hex(e.c)}`
  : e.kind === 'B' ? `B${hex(e.a)}@${hex4(e.b)}` : e.kind === 'W' ? `W${hex4(e.a)}@${hex4(e.b)}=${hex(e.c)}` : e.kind;

// ---------------------------------------------------------------- Hauptprogramm

function main(argv) {
  if (argv.length === 0) {
    console.log('Aufruf: node verify.mjs <trace.bin> [...] [--details N]');
    return 2;
  }
  let details = 25;
  const files = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--details') details = parseInt(argv[++i], 10);
    else files.push(argv[i]);
  }

  const field = new Playfield(fieldConfig(13));
  const rnd = new ScriptedRandom();
  const cov = new Coverage(field);
  field.random = rnd;
  field.listener = cov;

  const skip = new Map(), foreignPcs = new Map(), fieldMismatch = new Map(), geoBadTypes = new Map();
  const freeFlight = new Set();
  let verified = 0, mismatchSteps = 0, shown = 0, snapshots = 0, roundChecks = 0, roundMismatch = 0;
  let spinChain = 0, spinChainBad = 0, geoChecks = 0, geoBad = 0;

  for (const file of files) {
    const snaps = readTrace(file);
    snapshots += snaps.length;
    for (let k = 0; k + 1 < snaps.length; k++) {
      const s = snaps[k], t = snaps[k + 1];
      const ev = s.events;

      if (!t.poked && t.seq === s.seq + 1 && !ev.some((e) => e.kind === 'N')) {
        spinChain++;
        if (t.spinOld !== s.spinNew) spinChainBad++;
      }

      if ((sv(s, A.E5CF) & 0x80) === 0 && sv(s, A.E5CF) === sv(s, A.E5D0) && sv(s, A.E5EF) === sv(s, A.E5CF)
        && sv(s, A.EA33) === 0 && sv(s, A.EA34) === 0 && s.paddleBytes[4] !== 0) {
        geoChecks++;
        const geo = paddleGeometryFor(sv(s, A.E5CF));
        for (let j = 0; j < 12; j++) {
          const want = j === 4 ? s.paddleBytes[4] : geo[j] === 0 ? 0 : (s.paddleBytes[4] + geo[j]) & 0xFF;
          if (want !== s.paddleBytes[j]) { geoBad++; count(geoBadTypes, `typ${sv(s, A.E5CF)}.byte${j}`); break; }
        }
      }

      if (ev.some((e) => e.kind === 'N')) {
        roundChecks++;
        if (!t.poked) {
          const rd = checkRoundStart(field, t);
          if (rd.length > 0) {
            roundMismatch++;
            if (shown++ < details) console.log(`RUNDENSTART-ABWEICHUNG ${basename(file)} seq=${t.seq} f=${t.frame}: ${rd.join(', ')}`);
          }
        }
        count(skip, 'rundenstart');
        continue;
      }

      let reason = null;
      if (t.poked) reason = 'poke';
      else if (t.seq !== s.seq + 1) reason = 'luecke';
      else if (sv(s, A.E006) !== 0) reason = 'demo';
      else if (ev.some((e) => e.kind === 'E')) reason = 'gegner';
      else if (s.map === null && ev.some((e) => e.kind === 'B' && solidRead(e))) reason = 'stein';
      else if (ev.some((e) => e.kind === 'L')) reason = 'stein-beweglich';
      else if (ev.some((e) => e.kind === 'X')) reason = 'stein-fremd';
      else if (ev.some((e) => e.kind === 'W' && !modeledPc(e.b))) {
        reason = 'fremdschreiber';
        for (const e of ev) if (e.kind === 'W' && !modeledPc(e.b)) count(foreignPcs, `pc=${hex4(e.b)} addr=${hex4(e.a)}`);
      } else if ((sv(s, A.E5CF) & 0x80) !== 0 || sv(s, A.E5CF) !== sv(s, A.E5D0) || sv(s, A.E5EF) !== sv(s, A.E5CF)) reason = 'schlaeger-umbau';
      else if (new Set(ev.filter((e) => e.kind === 'F').map((e) => e.a & 8)).size > 1) reason = 'feuer-mehrdeutig';
      if (reason !== null) { count(skip, reason); continue; }

      load(field, s);
      rnd.bits.length = 0;
      let rndBad = false;
      for (const e of ev) {
        if (e.kind !== 'R') continue;
        const b = bitFor(e.b, e.c);
        if (b === null) rndBad = true; else rnd.bits.push(b);
      }
      const fire = ev.some((e) => e.kind === 'F' && (e.a & 8) === 0);
      const delta = (s.spinNew - s.spinOld) & 0xFF;

      for (let i = 0; i < 32; i++) cov.lastStick[i] = field.balls[i].stickTimer;
      for (let i = 0; i < 32; i++) {
        const b = field.balls[i];
        if (field.isActive(i) && b.stickTimer === 0) freeFlight.add(b.direction * 16 + b.speed);
      }
      if (s.masks.some((x) => x !== 0)) {
        if ((field.activeMasks[0] & 1) === 0) cov.add('verwaltung.nachruecken');
        if (field.multiballPending !== 0) cov.add(`verwaltung.multiball.n${String(field.multiballCount).padStart(2, '0')}`);
        if (field.specialMode !== 0 && field.specialTarget !== field.ballCount) cov.add('verwaltung.sondermodus-nachfuellen');
        if (field.flatReflect !== 0) cov.add('flag.E5E6-aktiv');
        for (let i = 0; i < 32; i++) {
          const b = field.balls[i];
          if (!field.isActive(i)) continue;
          if (b.stickTimer !== 0 && b.x >= 0xDF) cov.add('klebend.rechte-wand');
          if (b.paddleLock && !b.movingUp && b.y < 0x10) cov.add('gesperrt.im-trefferband');
        }
      }
      rnd.underflows = 0;
      cov.brickContacts.length = 0;
      const dirBefore = field.balls.map((b) => b.direction);
      const res = field.step((delta << 24) >> 24, fire);
      for (const i of new Set(cov.brickContacts)) {
        const old = dirBefore[i], nw = field.balls[i].direction;
        if (field.pierceBall !== 0) cov.add('brick.pierce');
        else if (nw === ((old ^ 0x10) & 0xFF)) cov.add('brick.reflect.corner');
        else if (nw === verticalReflectionOf(old)) cov.add('brick.reflect.side');
        else if (nw === horizontalReflectionOf(old)) cov.add('brick.reflect.topbottom');
        else cov.add('brick.reflect.mixed');
      }
      if (res === StepResult.ALL_BALLS_LOST) { count(skip, 'alle-baelle-weg'); continue; }

      if (field.paddle.type === PaddleType.TWIN) {
        for (let i = 0; i < 32; i++) {
          const b = field.balls[i];
          const d = (b.x - field.paddle.left) & 0xFF;
          if (field.isActive(i) && !b.paddleLock && !b.movingUp && b.y >= 8 && b.y < 0x10 && d >= 37 && d <= 44) {
            cov.zoneHits.add((3 << 16) | (d << 8) | 0xF2);
          }
        }
      }

      const diffs = compare(field, t);
      if (rndBad) diffs.push('zufallsbit-nicht-ableitbar');
      if (rnd.underflows > 0 || rnd.bits.length > 0) diffs.push(`zufall: kern ${rnd.underflows > 0 ? 'zu viele' : 'zu wenige'} Drehs`);
      verified++;
      if (diffs.length === 0) continue;

      mismatchSteps++;
      for (const d of diffs) count(fieldMismatch, d.startsWith('map[') ? 'map' : d.split('=')[0]);
      if (shown++ < details) {
        console.log(`ABWEICHUNG ${basename(file)} seq=${s.seq} f=${s.frame} delta=${(delta << 24) >> 24} fire=${fire} ev=[${ev.map(describe).join(' ')}]`);
        console.log('  ' + diffs.join(', '));
        const involved = new Set();
        for (const d of diffs) if (d.startsWith('ball')) involved.add(parseInt(d.slice(4), 10));
        if (involved.size === 0) involved.add(0);
        for (const i of [...involved].slice(0, 4)) {
          console.log(`  vorher  ball${i}: ${hexRow(s.balls, i * 13, 13)}   L=${hex(s.paddleBytes[3])} R=${hex(s.paddleBytes[2])} C=${hex(s.paddleBytes[4])} typ=${hex(sv(s, A.E5CF))}`);
          console.log(`  MAME    ball${i}: ${hexRow(t.balls, i * 13, 13)}`);
          const tmp = new Uint8Array(13); field.balls[i].writeBytes(tmp, 0);
          console.log(`  Kern    ball${i}: ${hexRow(tmp, 0, 13)}`);
        }
      }
    }
  }

  const fmt = (m) => [...m.entries()].map(([k, v]) => `${k}=${v}`).join(', ');
  console.log();
  console.log(`Snapshots: ${snapshots}   verifizierte Schritte: ${verified}   davon abweichend: ${mismatchSteps}`);
  console.log(`Rundenstarts geprueft: ${roundChecks}, abweichend: ${roundMismatch}`);
  console.log(`Schlaeger-Geometrie im Ruhezustand: ${geoChecks - geoBad}/${geoChecks} passend${geoBad > 0 ? '  abweichend: ' + fmt(geoBadTypes) : ''}`);
  console.log(`Spinner-Kette (alt == neu des Vorgaengers): ${spinChain - spinChainBad}/${spinChain}`);
  console.log('Nicht verglichen: ' + fmt(skip));
  if (fieldMismatch.size > 0) console.log('Abweichende Felder: ' + fmt(fieldMismatch));
  if (foreignPcs.size > 0) {
    console.log('Fremdschreiber (PC nach dem Befehl):');
    for (const [k, v] of [...foreignPcs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)) console.log(`  ${k}  x${v}`);
  }
  console.log();
  console.log('Abdeckung (Ereignisse in verifizierten Schritten):');
  for (const k of [...cov.counts.keys()].sort()) console.log(`  ${k.padEnd(28)} ${cov.counts.get(k)}`);
  console.log('  Zonen je Schlaegertyp (d = X - L: Code, FL = flach reflektiert, LU = Twin-Luecke, ! = mehrdeutig):');
  const types = [...new Set([...cov.zoneHits].map((z) => z >> 16))].sort((a, b) => a - b);
  for (const type of types) {
    let line = `    typ ${String(type).padStart(3)}:`;
    for (let d = 0; d < 100; d++) {
      const codes = [...cov.zoneHits].filter((z) => (z >> 16) === type && ((z >> 8) & 0xFF) === d).map((z) => z & 0xFF);
      if (codes.length === 0) continue;
      const c = codes.length > 1 ? '!' + codes.map(hex).join('/') : codes[0] === 0xF1 ? 'FL' : codes[0] === 0xF2 ? 'LU' : hex(codes[0]);
      line += ` ${d}:${c}`;
    }
    console.log(line);
  }
  let pairs = 0;
  const missing = [];
  for (let c = 0; c < 32; c++) {
    for (let sp = 1; sp <= 15; sp++) {
      if (freeFlight.has(c * 16 + sp)) pairs++; else missing.push(`${hex(c)}/${sp}`);
    }
  }
  console.log(`  Freiflug Code x Speed (1..15): ${pairs}/480${missing.length > 0 && missing.length <= 40 ? '  fehlt: ' + missing.join(' ') : ''}`);
  return mismatchSteps === 0 && roundMismatch === 0 && geoBad === 0 ? 0 : 1;
}

process.exitCode = main(process.argv.slice(2));
