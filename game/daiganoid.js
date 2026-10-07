// Einstiegspunkt: haengt das Spiel in ein Element ein und kuemmert sich um Groesse, Skalierung und Vollbild.
//
//   const game = await mountDaiganoid(container, { assetBase: 'assets/daiganoid/', hooks: { onHud, onGameOver } });
//   game.fullscreen(); game.showHighscores(); game.destroy();
//
// Das Spiel zeichnet 240x334 Art-Pixel mit ganzzahliger Geraete-Skalierung (bis maxScale, Standard 4).
import { DaiganoidApp, loadScores, saveScore } from './app.js';
import { ART_H, ART_W } from './render/board.js';
import { checkName, sanitizeName } from './filter/namefilter.js';

export { loadScores, saveScore, checkName, sanitizeName };

export async function mountDaiganoid(container, opts = {}) {
  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.imageRendering = 'pixelated';
  canvas.style.background = '#000';
  canvas.style.outline = 'none';
  canvas.setAttribute('aria-label', 'Daiganoid');
  container.appendChild(canvas);

  const app = new DaiganoidApp(canvas, opts);
  const maxScale = opts.maxScale || 4;
  const fullscreenMax = opts.fullscreenMax || 8;

  function fit() {
    const dpr = window.devicePixelRatio || 1;
    const fs = document.fullscreenElement && container.contains(document.fullscreenElement) || document.fullscreenElement === container;
    let availW, availH;
    if (fs) { availW = window.innerWidth; availH = window.innerHeight; } else {
      availW = opts.availWidth ? opts.availWidth() : (container.clientWidth || ART_W);
      availH = opts.availHeight ? opts.availHeight() : Math.max(ART_H, window.innerHeight - 140);
    }
    let S = Math.floor(Math.min(availW * dpr / ART_W, availH * dpr / ART_H));
    S = Math.max(1, Math.min(fs ? fullscreenMax : maxScale, S));
    app.setScale(S);
    canvas.style.width = `${(ART_W * S) / dpr}px`;
    canvas.style.height = `${(ART_H * S) / dpr}px`;
  }

  fit();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
  if (ro) ro.observe(container);
  window.addEventListener('resize', fit);
  document.addEventListener('fullscreenchange', fit);

  await app.init();
  app.start();

  return {
    app,
    canvas,
    fit,
    fullscreen() {
      const el = opts.fullscreenElement || container;
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    },
    showHighscores() { app.showHighscores(); },
    toMenu() { app.showHighscores(); },
    /** Vom Wirt aufrufen, wenn sich die Liste hinter opts.scores geaendert hat (HI-Anzeige nachziehen). */
    refreshScores() { app.syncHi(); },
    setOption(k, v) { app.options[k] = v; },
    destroy() {
      app.destroy();
      if (ro) ro.disconnect();
      window.removeEventListener('resize', fit);
      document.removeEventListener('fullscreenchange', fit);
      canvas.remove();
    },
  };
}
