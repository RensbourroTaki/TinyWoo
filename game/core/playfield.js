// Ball-/Schlaeger-/Stein-Logik von "Arkanoid - Revenge of Doh" als ganzzahliger Kern.
// Ein Aufruf von step() entspricht einem Durchlauf der Spielschleife ($5680) bei 60 Hz.
// Portierung von Assets/Scripts/Core/Playfield.cs (Unity-Projekt, Frame fuer Frame gegen MAME verifiziert).
// Nicht enthalten: Gegner, bewegliche Steine (Liste $E5FC), Umbau-Animation des Schlaegers, Demo-Modus.
//
// Abweichend vom Original sind nur Feldbreite (columns) und Feldhoehe (lift) einstellbar: 13 Spalten = Original
// (Wand-Konstanten $1A / $DF / $E4, lift 0), 11 Spalten = Daiganoid-Board (lift 8: Decke und Raster eine
// Zeile hoeher, Schlaeger-Band unveraendert). Alles andere bleibt byte-genau.
import { Ball } from './ball.js';
import { Paddle, PaddleType } from './paddle.js';
import { BrickGrid, GOLD, KIND_MASK, KIND_SPECIAL, blocksAsNeighbor } from './brickgrid.js';
import {
  deriveSignsAndComponents, gridCellAt, reflectCorner, reflectHorizontal, reflectVertical, stepComponent,
} from './ballmotion.js';
import { SPEED_UP_BOUNCES, ZONES_LARGE, ZONES_NORMAL, ZONES_SMALL, ZONES_TWIN } from './tables.js';

export const MAX_BALLS = 32;

export const StepResult = Object.freeze({
  NORMAL: 0,
  /** Beim Eintritt in die Ball-Schleife war kein Ball aktiv (Original: Leben verloren, $57FD). */
  ALL_BALLS_LOST: 1,
});

/** Einfache deterministische Zufallsquelle (xorshift32). Das Original nimmt Bit 0 des Z80-R-Registers. */
export class XorShiftRandomBit {
  constructor(seed) {
    this.state = (seed >>> 0) || 0x9E3779B9;
  }
  nextBit() {
    let s = this.state;
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    this.state = s;
    return (s & 0x100) !== 0;
  }
}

/**
 * Feld-Konfiguration. Original: 13 Spalten, linke Wand reflektiert bei X < $1A, Schlaeger-Klemmung R <= $E4.
 * Daiganoid: 11 Spalten, Wand buendig an Spalte 0 (X < $14), Schlaeger buendig an der rechten Wand,
 * Decke und Raster 8 px hoeher (lift).
 */
export function fieldConfig(columns) {
  if (columns === 13) return { columns: 13, leftReflect: 0x1A, paddleRightLimit: 0xE4, lift: 0 };
  const gridRight = 0x10 + 16 * columns;
  return { columns, leftReflect: 0x14, paddleRightLimit: gridRight - 1, lift: 8 };
}

/** Ball-Y mit Vorzeichen: unter 0 umgebrochene Werte ($F0..$FF, paddleDrop/Deflector) werden negativ. */
export const ballY = (y) => (y >= 0xF0 ? y - 0x100 : y);

export class Playfield {
  constructor(config = fieldConfig(13)) {
    this.columns = config.columns;
    this.cellCount = this.columns * 18;
    this.gridRight = 0x10 + 16 * this.columns;   // erste X-Position rechts vom Raster ($E0 im Original)
    this.ballXMax = this.gridRight - 1;           // $DF: Ball landet hier beim Wandkontakt
    this.leftReflect = config.leftReflect;        // $1A: senkrechte Reflexion, wenn X darunter faellt
    this.paddleRightLimit = config.paddleRightLimit;   // $E4: R wird hier geklemmt
    this.lift = config.lift;                      // Decke und Raster um lift hoeher (Original 0)
    this.ceiling = 0xE1 + this.lift;              // $E1: waagerechte Reflexion ab hier
    this.cornerNeighbors = [this.columns, 1, -this.columns, 1, -this.columns, -1, this.columns, -1];   // $39FB

    this.balls = [];
    for (let i = 0; i < MAX_BALLS; i++) this.balls.push(new Ball());
    /** $E5CB..$E5CE: Aktiv-Bits, 4 Gruppen zu je 8 Baellen. */
    this.activeMasks = new Uint8Array(4);
    this.paddle = new Paddle();
    this.bricks = new BrickGrid(this.columns);

    this.pierceBall = 0;        // $E731: Durchschlag-Ball
    this.solidGold = false;     // eigenes Gameplay (nicht im ROM): Gold haelt auch dem Durchschlag-Ball stand, Ball prallt ab
    this.floorBounce = 0;       // eigenes Gameplay (nicht im ROM): ungleich 0 = Ball prallt unten ab statt verloren zu gehen (Deflector)
    this.floorBounceDrop = 9;   // eigenes Gameplay: Deflector-Abprall so viele Logik-Pixel unter der Verlust-Ebene (9 = ca. 11 Art-Pixel)
    this.paddleDrop = 0;        // eigenes Gameplay (nicht im ROM): Schlaeger-Ebene (Start, Abprall, Verlust) um n Logik-Pixel tiefer
    this.minSpeed = 0;          // $E7E0: Mindest-Speed nach Deckenkontakt
    this.difficulty = 0;        // $E7E5: Abpraller-Tabelle 0..3
    this.specialMode = 0;       // $E5F7: Sondermodus (Baelle werden nachgefuellt, Tabelle 4)
    this.specialTarget = 0;     // $E5F6: Zielzahl der Baelle im Sondermodus
    this.multiballCount = 0;    // $E5F3: Anzahl Baelle beim naechsten Multiball
    this.multiballPending = 0;  // $E5F4: ungleich 0 = Multiball im naechsten Frame
    this.ballCount = 0;         // $E5F5: Ballzaehler
    this.flatReflect = 0;       // $E5E6: ungleich 0 = Schlaeger reflektiert nur waagerecht
    this.idleFrames = 0;        // $E7E1: Frames seit dem letzten Schlaegertreffer (16 Bit)
    this.shadowHits = 0;        // $EA37: Treffer-Serie an den Schatten (Typ 7)

    this.random = new XorShiftRandomBit(1);
    /** Ereignis-Empfaenger (alle Methoden optional): onLaunch, onPaddleHit, onCatch, onPaddleFlatBounce,
     *  onShadowHit, onWallBounce, onCeilingBounce, onSpeedUp, onRandomTurn, onBallLost, onFloorBounce, onIdleLimit,
     *  onBrickHit, onBrickDestroyed. */
    this.listener = null;
  }

  isActive(ball) {
    return (this.activeMasks[ball >> 3] & (1 << (ball & 7))) !== 0;
  }

  setActive(ball, active) {
    const bit = 1 << (ball & 7);
    if (active) this.activeMasks[ball >> 3] |= bit;
    else this.activeMasks[ball >> 3] &= ~bit;
  }

  /** Alle aktiven Ball-Indizes (Hilfsfunktion fuer die Spielschicht). */
  activeBalls() {
    const r = [];
    for (let i = 0; i < MAX_BALLS; i++) if (this.isActive(i)) r.push(i);
    return r;
  }

  /**
   * Rundenstart ($558D/$55DE): alle Baelle leeren, Ball 0 klebt 180 Frames mit Code $02 auf der Schlaegermitte.
   * Die Schlaeger-Geometrie muss vorher stehen (Original: Mitte $78, L $68, R $88).
   */
  startRound(startSpeed, minSpeed) {
    for (let i = 0; i < MAX_BALLS; i++) this.balls[i].clear();
    const b = this.balls[0];
    b.y = 0x10 - this.paddleDrop;
    b.x = this.paddle.center;
    b.direction = 0x02;
    b.stickTimer = 0xB4;
    b.speed = startSpeed & 0xFF;
    this.activeMasks[0] = 1;
    this.activeMasks[1] = 0;
    this.activeMasks[2] = 0;
    this.activeMasks[3] = 0;
    this.ballCount = 1;
    this.idleFrames = 0;
    this.multiballCount = 8;
    this.specialTarget = 3;
    this.multiballPending = 0;
    this.specialMode = 0;
    this.shadowHits = 0;
    this.paddle.shadowLag1 = 0;
    this.paddle.shadowLag2 = 0;
    this.paddle.type = 0;
    this.paddle.previousType = 0;
    this.paddle.pendingType = 0;
    this.minSpeed = minSpeed & 0xFF;
  }

  /** Multiball im naechsten Schritt ausloesen (Original: Kapsel setzt $E5F3/$E5F4). */
  requestMultiball(count) {
    this.multiballCount = count & 0xFF;
    this.multiballPending = 1;
  }

  /**
   * Ein Frame. paddleDelta = Eingabe in Pixeln (-128..127, Original: Differenz des Spinner-Werts),
   * fire = Feuerknopf in diesem Frame gedrueckt.
   */
  step(paddleDelta, fire) {
    this.movePaddle(paddleDelta & 0xFF);

    // $5A9F
    if ((this.activeMasks[0] | this.activeMasks[1] | this.activeMasks[2] | this.activeMasks[3]) === 0) {
      return StepResult.ALL_BALLS_LOST;
    }
    if ((this.activeMasks[0] & 1) === 0) this.promoteFirstActiveBall();
    if (this.multiballPending !== 0) this.splitMultiball();
    if (this.specialMode !== 0 && this.specialTarget !== this.ballCount) this.replenish();

    for (let g = 0; g < 4; g++) {
      const mask = this.activeMasks[g];
      for (let bit = 0; bit < 8; bit++) {
        if ((mask & (1 << bit)) === 0) continue;
        const i = g * 8 + bit;
        this.updateBallPartA(i, this.balls[i], fire);
        this.updateBallPartB(i, this.balls[i]);
      }
    }

    // $56B3
    this.idleFrames = (this.idleFrames + 1) & 0xFFFF;
    if (this.idleFrames === 0x1500 && this.listener && this.listener.onIdleLimit) this.listener.onIdleLimit();
    return StepResult.NORMAL;
  }

  // ---------------------------------------------------------------- Schlaeger

  /** $5986 (ohne Demo-Modus und ohne Gegner-Kollision $5A36). */
  movePaddle(delta) {
    const p = this.paddle;
    p.delta = delta;
    if ((delta & 0x80) !== 0) {
      const b = (-delta) & 0xFF;
      const a = p.left - b;
      if (a < 0x10) p.delta = (0x10 - p.left) & 0xFF;   // a < 0 = Unterlauf
    } else {
      const a = delta + p.right;
      if (a > 0xFF || a >= this.paddleRightLimit) p.delta = (this.paddleRightLimit - p.right) & 0xFF;
    }

    if (p.type !== PaddleType.SHADOW) {
      if (p.delta === 0) return;
      for (let i = 0; i < 12; i++) if (p.bytes[i] !== 0) p.bytes[i] = (p.bytes[i] + p.delta) & 0xFF;
      return;
    }

    // Typ 7: nur die ersten 5 Bytes direkt, die Schatten laufen nach ($59ED)
    for (let i = 0; i < 5; i++) if (p.bytes[i] !== 0) p.bytes[i] = (p.bytes[i] + p.delta) & 0xFF;
    p.shadowLag1 = decayLag((p.shadowLag1 + p.delta) & 0xFF, 0x19, 0xE8, 0x18);
    p.shadowLag2 = decayLag((p.shadowLag2 + p.delta) & 0xFF, 0x31, 0xD0, 0x30);
    const s1 = (p.right - p.shadowLag1 - 8) & 0xFF;
    p.bytes[5] = s1;
    p.bytes[6] = (s1 - 0x10) & 0xFF;
    const s2 = (p.right - p.shadowLag2 - 8) & 0xFF;
    p.bytes[7] = s2;
    p.bytes[8] = (s2 - 0x10) & 0xFF;
  }

  // ---------------------------------------------------------------- Ball-Verwaltung

  /** $5ABF: Ist Ball 0 inaktiv, rueckt der erste aktive Ball auf Platz 0. */
  promoteFirstActiveBall() {
    for (let i = 1; i < MAX_BALLS; i++) {
      if (!this.isActive(i)) continue;
      this.setActive(i, false);
      this.balls[0].copyFrom(this.balls[i]);
      this.setActive(0, true);
      return;
    }
  }

  /**
   * $5B14: Multiball-Faecher. Die ersten n Baelle bekommen Position und Speed von Ball 0,
   * Richtung (code0 + n/2), dann jeweils -1. Alle uebrigen Felder behalten ihren alten Inhalt.
   */
  splitMultiball() {
    const n = this.multiballCount;
    let c = n;
    let m = 0;
    for (;;) {
      let a = 0;
      let done = false;
      for (let b = 8; b > 0; b--) {
        a |= 1;
        c = (c - 1) & 0xFF;
        if (c === 0) { done = true; break; }
        a = ((a << 1) | (a >> 7)) & 0xFF;
      }
      this.activeMasks[m] = a;
      if (done) break;
      m++;
      if (m >= 4) break;
    }
    this.ballCount = n & 0xFF;

    const b0 = this.balls[0];
    const speed = b0.speed, y = b0.y, x = b0.x;
    let code = ((n >> 1) + b0.direction) & 0x1F;
    for (let i = 0; i < n && i < MAX_BALLS; i++) {
      const b = this.balls[i];
      b.y = y;
      b.x = x;
      b.speed = speed;
      b.direction = code;
      code = (code - 1) & 0x1F;
    }
    this.multiballPending = 0;
  }

  /** $5B66: Sondermodus, inaktive Plaetze auffuellen bis specialTarget. */
  replenish() {
    const b0 = this.balls[0];
    for (let i = 0; i < MAX_BALLS; i++) {
      if (this.isActive(i)) continue;
      if (this.ballCount === this.specialTarget) continue;
      this.ballCount = (this.ballCount + 1) & 0xFF;
      this.setActive(i, true);
      const b = this.balls[i];
      b.y = b0.y;
      b.x = b0.x;
      b.speed = b0.speed;
      b.direction = (this.balls[i > 0 ? i - 1 : 0].direction + 1) & 0x1F;   // Ball 0 ist hier immer aktiv
      b.stickTimer = 0;
    }
  }

  // ---------------------------------------------------------------- Ball, Teil a ($34C4)

  updateBallPartA(index, b, fire) {
    const L = this.listener;
    const original = b.speed;
    if (original !== 0) {
      const angle = b.direction & 0x0F;
      if (angle >= 6 && angle < 0x0B) {
        let boosted = original + 2;
        if (boosted >= 0x0F) boosted = 0x0E;
        b.speed = boosted;   // Flachwinkel-Boost nur fuer diesen Frame
      }
    }

    if (b.stickTimer !== 0) {
      b.stickTimer = (b.stickTimer - 1) & 0xFF;
      if (b.stickTimer === 0) {
        if (L && L.onLaunch) L.onLaunch(index);
      } else if (fire) {
        b.stickTimer = 0;
        if (L && L.onLaunch) L.onLaunch(index);
      } else {
        b.speed = 0;
        if (b.y < 0x11 - this.paddleDrop) b.x = (b.x + this.paddle.delta) & 0xFF;
      }
    }

    this.move(index, b);
    b.speed = original;

    // $3538 Speed-Up
    if (b.bouncesLeft === 0 && b.movingUp) {
      if (b.speed !== 0x0F) {
        b.speed = (b.speed + 1) & 0xFF;
        const table = this.specialMode !== 0 ? 4 : this.difficulty;
        b.bouncesLeft = SPEED_UP_BOUNCES[table][b.speed];
        if (L && L.onSpeedUp) L.onSpeedUp(index, b.speed);
      } else {
        // $3573 Zufalls-Dreh
        let a = b.direction;
        if (this.random.nextBit()) {
          a = (a + 1) & 0xFF;
          if ((a & 0x18) === 0) a -= 2;
        } else {
          a = (a - 1) & 0xFF;
          if ((a & 0x18) === 0) a += 2;
        }
        b.direction = a & 0x1F;
        b.bouncesLeft = 0x3C;
        if (L && L.onRandomTurn) L.onRandomTurn(index, b.direction);
      }
    }
    // $3599 Gegner-Kollision: nicht im Kern (Spielschicht)
  }

  /** $3680: ein Bewegungsschritt mit dem aktuellen Speed, inklusive Steinkollision. */
  move(index, b) {
    deriveSignsAndComponents(b);
    const xUp = (b.signs & 2) !== 0, yUp = (b.signs & 1) !== 0;
    let dx = stepComponent(b.components & 0x0F, b.speed, b.frameCounter, b.phase);
    if (!xUp) dx = (-dx) & 0xFF;

    // Rechte Wand schon hier: Ball landet exakt auf $DF (auch bei dx = 0)
    if (((dx + b.x) & 0xFF) >= this.ballXMax) {
      dx = (this.ballXMax - b.x) & 0xFF;
      reflectVertical(b);
      if (this.listener && this.listener.onWallBounce) this.listener.onWallBounce(index);
    }

    let dy = stepComponent(b.components >> 4, b.speed, b.frameCounter, b.phase);
    if (!yUp) dy = (-dy) & 0xFF;

    // $36C8: Vorderkante vor und nach dem Schritt; Kollision nur, wenn eine Zellgrenze ueberquert wird
    const frontX = (b.x + (xUp ? 0 : 0xFC)) & 0xFF, probeX = (frontX + dx) & 0xFF;
    const frontY = (b.y + (yUp ? 0 : 0xFC)) & 0xFF, probeY = (frontY + dy) & 0xFF;
    let crossed = 0;
    if ((probeX & 0xF0) !== (frontX & 0xF0)) crossed |= 2;
    if ((probeY & 0xF8) !== (frontY & 0xF8)) crossed |= 1;

    let handled = false;
    const cell = gridCellAt(probeX, probeY, this.columns, this.lift);
    if (cell >= 0) {
      b.phase &= 0x7F;   // $371E: Sperre loeschen, sobald die Vorderkante im Raster liegt
      if (crossed !== 0) handled = this.collideBricks(index, b, cell, crossed, dx, dy, xUp, yUp);
    }

    if (!handled) {
      b.x = (b.x + dx) & 0xFF;
      b.y = (b.y + dy) & 0xFF;
    }

    // $3A38
    b.frameCounter = (b.frameCounter + 1) & 0xFF;
    if (!(b.speed === 1 && (b.frameCounter & 1) === 0)) b.phase = (b.phase & 0xF0) | ((b.phase + 1) & 0x0F);
  }

  /**
   * $38AB..$3A02: Steinkollision an der Vorderkante. cell = Zelle nach dem Schritt, crossed Bit1 = X-Grenze,
   * Bit0 = Y-Grenze ueberquert. true = Position wurde hier gesetzt (Treffer), false = kein Stein.
   */
  collideBricks(index, b, cell, crossed, dx, dy, xUp, yUp) {
    let pierce = this.pierceBall !== 0;
    const grid = this.bricks;
    const L = this.listener;
    if (crossed === 3) {
      // $392E: Diagonalschritt. Erst die beiden Nachbarn pruefen, die nur in einer Achse ueberquert wurden.
      const q = (b.direction >> 3) & 3;
      const nx = (cell + this.cornerNeighbors[q * 2]) & 0xFF;       // nur X ueberquert
      const ny = (cell + this.cornerNeighbors[q * 2 + 1]) & 0xFF;   // nur Y ueberquert
      const nxValid = nx < this.cellCount, nyValid = ny < this.cellCount;
      if (pierce && this.solidGold && (this.isGold(cell) || this.isGold(nx) || this.isGold(ny))) pierce = false;
      let e = 0;
      if (nxValid && blocksAsNeighbor(grid.cells[nx])) e |= 2;
      if (nyValid && blocksAsNeighbor(grid.cells[ny])) e |= 1;

      if (e === 0) {
        if (!grid.hit(cell, pierce, index, L)) return false;
        if (pierce) return true;
        snapX(b, dx, xUp);
        snapY(b, dy, yUp);
        reflectCorner(b);
        return true;
      }
      if (e === 3) {
        // $397B: beide Nachbarn treffen, Ergebnis egal, immer Ecke
        if (nyValid) grid.hit(ny, pierce, index, L);
        if (nxValid) grid.hit(nx, pierce, index, L);
        if (pierce) return true;
        snapX(b, dx, xUp);
        snapY(b, dy, yUp);
        reflectCorner(b);
        return true;
      }
      if ((e & 1) !== 0) {
        if (!nyValid || !grid.hit(ny, pierce, index, L)) return false;
        if (pierce) return true;
        hitFromBelowOrAbove(b, dx, dy, yUp);
        return true;
      }
      if (!nxValid || !grid.hit(nx, pierce, index, L)) return false;
      if (pierce) return true;
      hitFromSide(b, dx, dy, xUp);
      return true;
    }

    if (pierce && this.solidGold && this.isGold(cell)) pierce = false;
    if (!grid.hit(cell, pierce, index, L)) return false;
    if (pierce) return true;   // $39F5: Ball bleibt in diesem Frame stehen
    if ((crossed & 1) !== 0) hitFromBelowOrAbove(b, dx, dy, yUp);
    else hitFromSide(b, dx, dy, xUp);
    return true;
  }

  /** Zelle enthaelt einen Goldstein (nur fuer solidGold). */
  isGold(cell) {
    if (cell >= this.cellCount) return false;
    const v = this.bricks.cells[cell];
    return (v & KIND_MASK) === KIND_SPECIAL && (v & GOLD) !== 0;
  }

  // ---------------------------------------------------------------- Ball, Teil b ($5C1D)

  updateBallPartB(index, b) {
    const L = this.listener;
    if ((b.direction & 0x10) !== 0) {
      if (b.x >= this.ballXMax) {
        reflectVertical(b);
        b.x = this.ballXMax;
        b.wallX = this.ballXMax;
        b.stickTimer = 0;
        if (L && L.onWallBounce) L.onWallBounce(index);
      }
    } else if (b.x < this.leftReflect) {
      reflectVertical(b);   // links wird X nicht geklemmt
      b.wallX = b.x;
      b.stickTimer = 0;
      if (L && L.onWallBounce) L.onWallBounce(index);
    }

    if (b.movingUp) {
      if (b.y < this.ceiling) return;
      if (this.paddleDrop !== 0 && b.y >= 0xF0) return;   // unter 0 umgebrochen (Deflector-Ebene) = unten, nicht Decke
      reflectHorizontal(b);
      if (this.minSpeed >= b.speed) b.speed = this.minSpeed;
      if (L && L.onCeilingBounce) L.onCeilingBounce(index);
      return;
    }
    this.checkPaddle(index, b);
  }

  /** $5C6B: Schlaegerpruefung fuer einen abwaerts fliegenden Ball. */
  checkPaddle(index, b) {
    if (b.paddleLock) return;
    const d = this.paddleDrop;
    // mit paddleDrop kann Y unter 0 laufen und auf $Fx umbrechen: dann gilt der Ball als unten
    const y = d !== 0 && b.y >= 0xF0 ? b.y - 0x100 : b.y;
    if (y >= 0x10 - d) return;
    if (y < 0x08 - d) {
      if (this.floorBounce !== 0) {
        const floor = 0x08 - d - this.floorBounceDrop;
        if (y >= floor) return;   // Deflector-Ebene liegt tiefer: Ball fliegt bis dorthin weiter
        b.y = floor & 0xFF;
        reflectHorizontal(b);
        if (this.listener && this.listener.onFloorBounce) this.listener.onFloorBounce(index);
        return;
      }
      this.loseBall(index, b);
      return;
    }
    if (this.flatReflect !== 0) {
      this.flatBounce(index, b);
      return;
    }

    let type = this.paddle.type;
    if ((type & 0x80) !== 0) {
      type = this.paddle.pendingType & 0x7F;
      if (type === 0) type = this.paddle.previousType & 0x7F;
    }

    switch (type) {
      case PaddleType.LARGE: this.zoneHit(index, b, ZONES_LARGE, false); break;
      case PaddleType.TWIN: this.zoneHit(index, b, ZONES_TWIN, false); break;
      case PaddleType.SHADOW: this.shadowPaddleHit(index, b); break;
      case PaddleType.SMALL: this.zoneHit(index, b, ZONES_SMALL, false); break;
      default: this.zoneHit(index, b, ZONES_NORMAL, true); break;
    }
  }

  insidePaddleWindow(b) {
    if (((b.x - 4) & 0xFF) >= this.paddle.right) return false;
    return b.x >= this.paddle.left;
  }

  /** Zonensuche: erster Eintrag mit X <= L + kumulierte Breite. Liefert -1, wenn keine Zone passt. */
  findZoneCode(b, zones) {
    let a = this.paddle.left;
    for (let i = 0; i < zones.length; i += 2) {
      a = (a + zones[i]) & 0xFF;
      if (a >= b.x) return zones[i + 1];
    }
    return -1;
  }

  /** $5CB3 / $5D13 / $5D4C / $5D94. */
  zoneHit(index, b, zones, normalHandler) {
    if (!this.insidePaddleWindow(b)) return;
    const code = this.findZoneCode(b, zones);
    if (code < 0) {
      this.flatBounce(index, b);
      return;
    }
    if (code === 0xFF) return;   // Twin-Luecke: Ball faellt durch
    b.direction = code;
    const L = this.listener;
    if (L && L.onPaddleHit) L.onPaddleHit(index, b.direction);

    if (normalHandler && this.paddle.type === PaddleType.CATCH) {
      b.y = 0x10 - this.paddleDrop;
      b.stickTimer = 0x78;
      if (L && L.onCatch) L.onCatch(index);
      this.finishPaddleHit(b);
      return;
    }
    this.shadowHits = 0;
    this.finishPaddleHit(b);
  }

  /** $5DC9: Typ 7, Hauptschlaeger mit Normal-Tabelle, sonst die nachlaufenden Schatten. */
  shadowPaddleHit(index, b) {
    const L = this.listener;
    if (this.insidePaddleWindow(b)) {
      const code = this.findZoneCode(b, ZONES_NORMAL);
      if (code < 0) {
        this.flatBounce(index, b);
        return;
      }
      b.direction = code;
      if (L && L.onPaddleHit) L.onPaddleHit(index, b.direction);
      this.shadowHits = 0;
      this.finishPaddleHit(b);
      return;
    }

    // $5DF4
    const x = b.x;
    const p = this.paddle;
    if ((p.shadowLag2 & 0x80) !== 0) {
      if (((p.bytes[7] + 8) & 0xFF) < x) return;
      if (p.center >= x) return;
    } else {
      if (((p.bytes[8] - 3) & 0xFF) >= x) return;
      if (p.center < x) return;
    }

    // $5E1A
    reflectHorizontal(b);
    if (this.shadowHits < 0x10) this.shadowHits++;
    if (L && L.onShadowHit) L.onShadowHit(index, this.shadowHits);
    this.finishPaddleHit(b);
  }

  /** $5E44: waagerechte Reflexion statt Zone. */
  flatBounce(index, b) {
    reflectHorizontal(b);
    if (this.listener && this.listener.onPaddleFlatBounce) this.listener.onPaddleFlatBounce(index);
    this.shadowHits = 0;
    this.finishPaddleHit(b);
  }

  /** $5E50: Sperre setzen, Leerlauf-Zaehler zuruecksetzen. */
  finishPaddleHit(b) {
    b.phase |= 0x80;
    this.idleFrames = 0;
  }

  /** $5E79: Ball verloren. Der Listener bekommt die letzte Position (fuer die Anzeige). */
  loseBall(index, b) {
    const lastX = b.x, lastY = b.y >= 0xF0 ? b.y - 0x100 : b.y;   // umgebrochenes Y (paddleDrop) als negativ melden
    b.x = 0;
    b.y = 0;
    b.speed = 0;
    this.ballCount = (this.ballCount - 1) & 0xFF;
    this.setActive(index, false);
    if (this.listener && this.listener.onBallLost) this.listener.onBallLost(index, lastX, lastY);
  }
}

/** $5A71 / $5A88: Nachlauf um 1 Richtung 0, Betrag auf limit begrenzt. */
function decayLag(a, below, atOrAbove, limit) {
  if (a === 0) return 0;
  if (a < below) return (a - 1) & 0xFF;
  if (a >= atOrAbove) return (a + 1) & 0xFF;
  return (a & 0x80) === 0 ? limit : (-limit) & 0xFF;
}

/** $38C8: Y normal weiter, X auf die Zellkante gesetzt, senkrechte Reflexion. */
function hitFromSide(b, dx, dy, xUp) {
  b.y = (b.y + dy) & 0xFF;
  snapX(b, dx, xUp);
  reflectVertical(b);
}

/** $38FF: X normal weiter, Y auf die Zellkante gesetzt, waagerechte Reflexion. */
function hitFromBelowOrAbove(b, dx, dy, yUp) {
  b.x = (b.x + dx) & 0xFF;
  snapY(b, dy, yUp);
  reflectHorizontal(b);
}

/** $38DA: X = (Vorderkante nach dem Schritt & $F0) - ($FF bzw. $EA), Tabelle $3A58. */
function snapX(b, dx, xUp) {
  const a = (dx + (xUp ? 0 : 0xFC) + b.x) & 0xF0;
  b.x = (a - (xUp ? 0xFF : 0xEA)) & 0xFF;
}

/** $3911: Y = (Vorderkante nach dem Schritt & $F8) - ($00 bzw. $F4), Tabelle $3A5C. */
function snapY(b, dy, yUp) {
  const a = (dy + (yUp ? 0 : 0xFC) + b.y) & 0xF8;
  b.y = (a - (yUp ? 0x00 : 0xF4)) & 0xFF;
}
