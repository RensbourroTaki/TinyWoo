// Eingabe: Maus (Pointer-Lock = relativ wie der Spinner des Originals, sonst absolut), Touch, Tastatur.
// Liefert pro Logik-Frame das Schlaeger-Delta in Logik-Pixeln und den Feuer-Zustand.
import { ART_H, ART_W } from './render/board.js';

export class GameInput {
  constructor(canvas, getScale) {
    this.canvas = canvas;
    this.getScale = getScale;          // () => Geraete-Pixel je Art-Pixel
    this.sensitivity = 1.0;            // Multiplikator fuer die relative Mausbewegung
    this.accum = 0;                    // angesammelte relative Bewegung in Logik-Pixeln (Bruchteile)
    this.absoluteX = null;             // Zeigerziel in Logik-X (absolute Steuerung) oder null
    this.fireHeld = false;
    this.firePressed = false;          // seit dem letzten Frame neu gedrueckt
    this.keys = new Set();
    this.pressedKeys = [];             // Tastendruecke seit dem letzten Frame (fuer Menues)
    this.clicks = [];                  // Klicks/Taps in Art-Koordinaten seit dem letzten Frame
    this.pointerArt = null;            // Zeigerposition in Art-Koordinaten, nur solange die Maus ueber dem Spiel ist
    this.pointerInside = false;        // Maus (nicht Touch) steht ueber dem Canvas
    this.outsideFrames = 0;            // Frames, die die Maus schon ausserhalb des Canvas ist (Auto-Pause)
    this.keyVel = 0;
    this.arrowPaddle = true;           // Pfeil links/rechts steuern den Schlaeger (aus = nur A/D, z. B. Test-Tasten)
    this.locked = false;
    this.wantLock = false;             // Option MOUSE LOCK
    this.lockReady = false;            // von der App gesetzt: nur im laufenden Spiel darf gesperrt werden
    this.touchActive = false;
    this.toLogicX = (artX) => artX;    // wird vom Spiel gesetzt (Art -> Logik)
    this.onGesture = null;             // wird synchron in jeder Nutzergeste gerufen (Audio-Freischaltung, iOS/Android)
    this.bind();
  }

  bind() {
    const c = this.canvas;
    // Bewegung wird am Fenster verfolgt: so folgt der Schlaeger auch, wenn die Maus kurz ueber den Rand
    // hinausschiesst, und der Zeiger steht beim Zurueckkommen genau dort, wo der Schlaeger ist.
    this.onMove = (e) => {
      if (document.pointerLockElement === c) {
        this.accum += (e.movementX / (this.getScale() * 1.25)) * this.sensitivity;
        this.absoluteX = null;
        return;
      }
      if (e.pointerType === 'touch' && e.target !== c) return;
      const a = this.artPos(e);
      const inside = a.x >= 0 && a.x < ART_W && a.y >= 0 && a.y < ART_H;
      if (e.pointerType !== 'touch') this.pointerInside = inside;
      this.pointerArt = inside ? a : null;
      this.absoluteX = this.toLogicX(Math.max(0, Math.min(ART_W, a.x)));
    };
    this.onLeave = () => { this.pointerInside = false; this.pointerArt = null; };
    this.onDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      if (this.onGesture) this.onGesture();
      const a = this.artPos(e);
      this.clicks.push(a);
      if (e.pointerType !== 'touch') { this.pointerInside = true; this.pointerArt = a; }
      this.fireHeld = true;
      this.firePressed = true;
      if (e.pointerType === 'touch') {
        this.touchActive = true;
        this.absoluteX = this.toLogicX(a.x);
      } else if (this.wantLock && this.lockReady && document.pointerLockElement !== c && c.requestPointerLock) {
        try { const p = c.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (err) { /* egal */ }
      }
    };
    // Touch zaehlt erst beim Loslassen als Geste, daher auch hier freischalten (nur wenn auf dem Canvas begonnen)
    this.onUp = () => { if (this.fireHeld && this.onGesture) this.onGesture(); this.fireHeld = false; };
    this.onLock = () => { this.locked = document.pointerLockElement === c; if (this.locked) this.absoluteX = null; };
    this.onKeyDown = (e) => {
      if (this.onGesture) this.onGesture();
      if (e.repeat) { if (['ArrowUp', 'ArrowDown'].includes(e.code)) this.pressedKeys.push(e.code); return; }
      this.keys.add(e.code);
      this.pressedKeys.push(e.code);
      if (e.code === 'Space' || e.code === 'ControlLeft' || e.code === 'Enter') { this.fireHeld = true; this.firePressed = true; }
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'F8', 'F9'].includes(e.code)) e.preventDefault();
    };
    this.onKeyUp = (e) => {
      this.keys.delete(e.code);
      if (e.code === 'Space' || e.code === 'ControlLeft' || e.code === 'Enter') this.fireHeld = false;
    };
    window.addEventListener('pointermove', this.onMove);
    c.addEventListener('pointerleave', this.onLeave);
    c.addEventListener('pointerdown', this.onDown);
    c.style.cursor = 'none';            // ueber dem Spiel zeichnet die App den eigenen Zeiger (menu/cursor.png)
    window.addEventListener('pointerup', this.onUp);
    document.addEventListener('pointerlockchange', this.onLock);
    c.addEventListener('contextmenu', (e) => e.preventDefault());
    c.tabIndex = 0;
    c.addEventListener('keydown', this.onKeyDown);
    c.addEventListener('keyup', this.onKeyUp);
    c.style.touchAction = 'none';
  }

  artPos(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * ART_W, y: (e.clientY - r.top) / r.height * ART_H };
  }

  releaseLock() {
    if (document.pointerLockElement === this.canvas && document.exitPointerLock) document.exitPointerLock();
  }

  /**
   * Schlaeger-Delta fuer diesen Frame (Logik-Pixel, -127..127). paddleCenter = aktuelle Mitte (Logik)
   * fuer die absolute Steuerung.
   */
  paddleDelta(paddleCenter) {
    let d = 0;
    // Tastatur: beschleunigt bis 7 px/Frame
    const left = (this.arrowPaddle && this.keys.has('ArrowLeft')) || this.keys.has('KeyA');
    const right = (this.arrowPaddle && this.keys.has('ArrowRight')) || this.keys.has('KeyD');
    if (left !== right) {
      this.keyVel = Math.min(7, this.keyVel + 0.6);
      d = Math.round(left ? -this.keyVel : this.keyVel);
      this.absoluteX = null;
    } else {
      this.keyVel = 0;
    }
    if (this.accum !== 0) {
      const whole = this.accum > 0 ? Math.floor(this.accum) : Math.ceil(this.accum);
      d += whole;
      this.accum -= whole;
    }
    if (this.absoluteX !== null && d === 0) {
      d = Math.max(-127, Math.min(127, Math.round(this.absoluteX - paddleCenter)));
    }
    return Math.max(-127, Math.min(127, d));
  }

  /** Feuer seit dem letzten Aufruf (einmalig) oder gehalten. */
  takeFire() {
    const p = this.firePressed;
    this.firePressed = false;
    return p;
  }

  takeKeys() { const k = this.pressedKeys; this.pressedKeys = []; return k; }
  takeClicks() { const c = this.clicks; this.clicks = []; return c; }

  destroy() {
    const c = this.canvas;
    window.removeEventListener('pointermove', this.onMove);
    c.removeEventListener('pointerleave', this.onLeave);
    c.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointerup', this.onUp);
    document.removeEventListener('pointerlockchange', this.onLock);
    c.removeEventListener('keydown', this.onKeyDown);
    c.removeEventListener('keyup', this.onKeyUp);
    this.releaseLock();
  }
}
