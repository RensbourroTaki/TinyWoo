(() => {
const { Button, Icon, Input } = window.TinyWooDesignSystem_fe221f;
const I = window.TW_INHALT;
const D = I.daiganoid || {};
const GAME_URL = './game/daiganoid.js';
// Das Spiel ist ein ES-Modul. index.html laedt es vorab nach window.Daiganoid; sonst dynamisch,
// ueber Function, damit Babel das import() nicht umschreibt.
const loadGame = () => window.Daiganoid ? Promise.resolve(window.Daiganoid) : new Function('u', 'return import(u)')(GAME_URL);

const pixel = (fs, color) => ({ fontFamily: 'var(--font-pixel)', fontSize: fs, letterSpacing: 'var(--tracking-pixel)', textTransform: 'uppercase', color, lineHeight: 1 });
const frame = { position: 'relative', display: 'inline-block', minWidth: 240, minHeight: 334, borderRadius: 'var(--radius-xl)', border: '4px solid var(--ink)', boxShadow: 'var(--shadow-pop-lg)', background: '#000', overflow: 'hidden', lineHeight: 0 };

// Namensfilter (game/filter/namefilter.js, ueber das Spielmodul). Ohne Modul: nur kuerzen.
const filterCheck = (raw) => { const M = window.Daiganoid; return M && M.checkName ? M.checkName(raw) : { ok: true, name: String(raw || '').toUpperCase().slice(0, 10) }; };
const REJECT = { spam: 'No links, no spam. Just a name.', reserved: 'Nice try. That name belongs to the house.', empty: 'Type a name first.' };
const rejectText = (reason) => REJECT[reason] || "That name won't fly here. Pick another one.";
const submitText = (r) => {
  if (r.error === 'name') return rejectText(r.reason);
  if (r.error === 'rate' || r.error === 'rate-daily') return 'Slow down. Try again in a moment.';
  if (r.error === 'too-fast' || r.error === 'token') return 'That score could not be verified.';
  return 'Saving failed. Try again.';
};

/** Das Spiel auf der Arcade-Seite: Canvas, HUD, Vollbild, Namenseingabe nach Game Over.
 *  scores: Liste fuer die Highscore-Anzeige im Spiel; onSubmit(entry) speichert; onPlaying(bool) meldet "spielt gerade". */
function DaiganoidArcade({ scores, onSubmit, onPlaying }) {
  const host = React.useRef(null), wrap = React.useRef(null), game = React.useRef(null);
  const scoresRef = React.useRef(scores || []);
  const [hud, setHud] = React.useState({ score: 0, round: 1, lives: 3, hi: 0, rounds: 32 });
  const [state, setState] = React.useState('loading');
  const [over, setOver] = React.useState(null);
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  React.useEffect(() => { scoresRef.current = scores || []; if (game.current) game.current.refreshScores(); }, [scores]);
  React.useEffect(() => { if (onPlaying) onPlaying(state === 'game'); }, [state]);

  React.useEffect(() => {
    let live = true;
    loadGame().then((m) => {
      if (!live) return;
      return m.mountDaiganoid(host.current, {
        assetBase: 'assets/daiganoid/',
        musicMenu: D.musikMenue || '',
        musicGame: D.musikSpiel || '',
        maxScale: 4,
        fullscreenElement: wrap.current,
        availWidth: () => (wrap.current ? wrap.current.clientWidth : 240) - 16,
        availHeight: () => Math.max(480, window.innerHeight - 100),
        scores: () => scoresRef.current,
        hooks: {
          onHud: setHud,
          onState: setState,
          onGameOver: (r) => { setOver(r); setName(''); setSubmitError(''); },
        },
      });
    }).then((g) => { if (live) game.current = g; else if (g) g.destroy(); })
      .catch((e) => setError(String(e && e.message || e)));
    return () => { live = false; if (game.current) { game.current.destroy(); game.current = null; } };
  }, []);

  const check = over ? filterCheck(name || 'AAA') : null;
  const nameError = check && name && !check.ok ? rejectText(check.reason) : '';

  const save = async () => {
    if (!game.current || !over || busy) return;
    const c = filterCheck(name || 'AAA');
    if (!c.ok) { setSubmitError(rejectText(c.reason)); return; }
    setBusy(true); setSubmitError('');
    const r = onSubmit ? await onSubmit({ name: c.name, score: over.score, round: over.round }) : { ok: true };
    setBusy(false);
    if (!r || !r.ok) { setSubmitError(submitText(r || {})); return; }
    setOver(null);
    game.current.showHighscores();
  };
  const skip = () => { setOver(null); if (game.current) game.current.showHighscores(); };
  const inGame = state === 'game' || state === 'gameover';

  return (
    <div ref={wrap} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, background: 'var(--bg-page)' }}>
      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={frame}>
          <div ref={host} />
          {error && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, color: 'var(--cherry-400)', fontFamily: 'var(--font-body)', lineHeight: 1.4, textAlign: 'center' }}>Game failed to load: {error}</div>}
          {over && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(6,18,51,.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', lineHeight: 1.4 }}>
            <div style={{ width: '100%', maxWidth: 340, background: 'var(--blue-800)', border: '4px solid var(--ink)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-pop-lg)', padding: 22, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'center', animation: 'tw-pop-in var(--dur-slow) var(--ease-pop)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, lineHeight: 1, color: over.complete ? 'var(--lime-400)' : 'var(--orange-400)', WebkitTextStroke: '3px var(--ink)', paintOrder: 'stroke fill', textShadow: '0 4px 0 var(--ink)', transform: 'rotate(-3deg)' }}>{over.complete ? 'All clear!' : 'Game over'}</div>
              <div style={pixel(36, 'var(--gray-50)')}>{over.score}</div>
              <div style={pixel(12, 'var(--gray-300)')}>Round {over.round}</div>
              <Input label="Enter your name" pixel maxLength={10} placeholder="AAA" value={name} autoFocus error={nameError || submitError} onChange={(e) => { setName(e.target.value); setSubmitError(''); }} onKeyDown={(e) => e.key === 'Enter' && save()} />
              <Button onClick={save} disabled={busy || !!nameError} icon={<Icon name="trophy" size={20} />}>{busy ? 'Saving…' : 'Save score'}</Button>
              <Button variant="ghost" size="sm" onClick={skip}>Skip</Button>
            </div>
          </div>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', padding: '0 8px' }}>
        <Hud label="Score" value={String(hud.score).padStart(7, '0')} color="var(--gray-50)" />
        <Hud label="Round" value={`${hud.round}/${hud.rounds}`} color="var(--sky-400)" />
        <Hud label="Lives" value={'▰'.repeat(Math.min(6, hud.lives)) || '-'} color="var(--lime-400)" />
        <Hud label="Hi" value={String(hud.hi).padStart(7, '0')} color="var(--sun-400)" />
        <Button variant="ghost" size="sm" icon={<Icon name="maximize" size={18} />} onClick={() => game.current && game.current.fullscreen()}>Fullscreen</Button>
      </div>
      <p style={{ margin: 0, maxWidth: 560, fontSize: 14, lineHeight: 1.5, color: 'var(--text-muted)', textAlign: 'center' }}>
        {inGame ? 'Mouse or arrow keys move the paddle, click or space launches the ball and fires the laser. P pauses, Esc frees the mouse.' : (D.text || '')}
      </p>
    </div>
  );
}

function Hud({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', minWidth: 70 }}>
      <span style={pixel(11, 'var(--gray-400)')}>{label}</span>
      <span style={{ ...pixel(20, color), textShadow: '0 2px 0 var(--ink)' }}>{value}</span>
    </div>
  );
}

/** Kleiner Teaser fuer die Startseite: Intro-Schleife des Spiels, Klick fuehrt zur Arcade-Seite. */
function DaiganoidTeaser({ onNav }) {
  const host = React.useRef(null), game = React.useRef(null);
  React.useEffect(() => {
    let live = true;
    loadGame().then((m) => {
      if (!live) return;
      return m.mountDaiganoid(host.current, { assetBase: 'assets/daiganoid/', teaser: true, maxScale: 2, availWidth: () => Math.min(480, window.innerWidth - 40), availHeight: () => 640, hooks: { onClick: () => onNav('arcade') } });
    }).then((g) => { if (live) game.current = g; else if (g) g.destroy(); }).catch(() => {});
    return () => { live = false; if (game.current) { game.current.destroy(); game.current = null; } };
  }, []);
  return (
    <div onClick={() => onNav('arcade')} style={{ ...frame, minWidth: 240, minHeight: 334, cursor: 'pointer', transform: 'rotate(1.5deg)' }}>
      <div ref={host} />
    </div>
  );
}

Object.assign(window, { DaiganoidArcade, DaiganoidTeaser });
})();
