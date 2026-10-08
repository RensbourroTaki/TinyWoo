(() => {
const { Button } = window.TinyWooDesignSystem_fe221f;
const I = window.TW_INHALT;
const D = I.daiganoid || {};
const API = String(D.apiUrl || '').replace(/\/+$/, '');
const MINE_KEY = 'tw-daiganoid-mine';          // Kennungen der eigenen Eintraege (fuer die Hervorhebung)
const WIDE_PX = 1180;                           // ab hier drei Spalten, darunter Wisch-Karussell
// Reihenfolge der Tafeln im Karussell (schmale Schirme). Start ist das Spiel in der Mitte:
// Wisch nach rechts zeigt die linke Tafel (Highscore), Wisch nach links die rechte (Story).
const PANES = ['scores', 'game', 'story'];
const PANE_LABEL = { scores: 'Highscore', game: 'Game', story: 'Story' };

const pixel = (fs, color) => ({ fontFamily: 'var(--font-pixel)', fontSize: fs, letterSpacing: 'var(--tracking-pixel)', textTransform: 'uppercase', color, lineHeight: 1 });
/** Pixel-Font fuer Fliesstext: wie pixel(), aber ohne Grossschreibung (lesbarer). */
const pixelText = { fontFamily: 'var(--font-pixel)', letterSpacing: 'var(--tracking-pixel)' };
const Kicker =({ children }) => <span className="tw-pixel" style={{ fontSize: 26, color: 'var(--sky-400)' }}>{children}</span>;
const CSS = '@keyframes tw-live-pulse{0%{box-shadow:0 0 0 0 rgba(123,232,74,.65)}100%{box-shadow:0 0 0 10px rgba(123,232,74,0)}}'
  + '.tw-snap::-webkit-scrollbar{display:none}'
  + '.tw-credit{transition:background .15s,border-color .15s}.tw-credit:hover{background:rgba(255,184,0,.08);border-color:rgba(255,184,0,.55)}';

const localScores = () => { const M = window.Daiganoid; try { return M && M.loadScores ? M.loadScores() : []; } catch (e) { return []; } };
const readMine = () => { try { const v = JSON.parse(localStorage.getItem(MINE_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
const writeMine = (ids) => { try { localStorage.setItem(MINE_KEY, JSON.stringify(ids.slice(-50))); } catch (e) { /* privat */ } };

/** Duenner runder Rahmen im Sonne-Orange-Verlauf, innen dunkle Flaeche. Beide Seitentafeln benutzen ihn.
 *  height: feste Aussenhoehe in px (0 = so hoch wie der Inhalt). */
function GlowFrame({ children, style, height }) {
  const fixed = height > 0;
  return (
    <div style={{ borderRadius: 'var(--radius-xl)', padding: 2, background: 'var(--grad-sun)', boxShadow: '0 0 28px -8px rgba(255,184,0,.45), var(--shadow-float)', ...(fixed ? { height, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' } : {}), ...style }}>
      <div style={{ borderRadius: 30, background: 'var(--blue-950)', display: 'flex', flexDirection: 'column', minHeight: fixed ? 0 : '100%', flex: fixed ? 1 : undefined, boxSizing: 'border-box' }}>{children}</div>
    </div>
  );
}

function PanelTitle({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '18px 22px 14px', borderBottom: '1px solid rgba(255,184,0,.28)' }}>
      <span style={{ ...pixel(18), background: 'var(--grad-sun-hot)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent' }}>{children}</span>
      {right}
    </div>
  );
}

/** Kopf der Arcade-Seite: Kicker, grosser Titel im Site-Stil, eine Zeile darunter. */
function ArcadeHeader({ compact }) {
  const H = D.header || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 10 : 14, alignItems: 'flex-start' }}>
      {H.kicker && <Kicker>{H.kicker}</Kicker>}
      <h1 className="tw-heading" style={{ fontSize: 'var(--fs-hero)', color: 'var(--orange-400)', transform: 'rotate(-3deg)', transformOrigin: 'left', margin: '0 0 8px' }}>{H.titel || D.titel || 'Daiganoid'}</h1>
      {(H.zeile || H.unterzeile) && <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {H.zeile && <p style={{ margin: 0, fontSize: compact ? 16 : 'var(--fs-lg)', lineHeight: 1.5, color: 'var(--text-strong)', maxWidth: 720 }}>{H.zeile}</p>}
        {H.unterzeile && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--text-muted)', maxWidth: 720 }}>{H.unterzeile}</p>}
      </div>}
    </div>
  );
}

/** Band unter dem Kopf: schraege orange Linie ueber die volle Breite, darunter ein Verlauf vom dunklen Header-Blau
 *  zur Seitenfarbe, darin zentriert "THE [Arkanoid-Logo] FAN PROJECT". Abstand Linie->Zeile = Zeile->Tafeln.
 *  sectionGap: Abstand, den die umgebende Section ohnehin zwischen ihren Kindern setzt. */
const LOGO = 'assets/logo/arkanoid_original_logo.png';
const LOGO_W = 130, LOGO_H = 29;                // Originalgroesse, angezeigt pixelgenau x2

function ArcadeBand({ compact, sectionGap }) {
  const space = compact ? 36 : 72;
  const fs = 'clamp(18px, 2.6vw, 40px)';
  return (
    <div style={{ position: 'relative', margin: `${compact ? 8 : -26}px calc(50% - 50vw) 0`, padding: `${space}px var(--gutter) ${Math.max(0, space - sectionGap)}px` }}>
      <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: compact ? 220 : 290, transform: 'skewY(-1.3deg)', borderTop: '6px solid var(--orange-400)', background: 'linear-gradient(to bottom, var(--blue-900), var(--bg-page))' }} />
      <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: compact ? 10 : 14 }}>
        <span style={pixel(fs, 'var(--orange-400)')}>The</span>
        <span style={{ position: 'relative', display: 'block', width: LOGO_W * 2, height: LOGO_H * 2 }}>
          <img src={LOGO} alt="Arkanoid" width={LOGO_W * 2} height={LOGO_H * 2} style={{ imageRendering: 'pixelated', display: 'block' }} />
          {/* Scanlines: jede Logo-Pixelzeile (2 px) halb hell, halb dunkel; per Maske nur auf dem Logo selbst. */}
          <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 1px, rgba(0,0,0,.45) 1px) 0 0 / 100% 2px', WebkitMaskImage: `url(${LOGO})`, maskImage: `url(${LOGO})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }} />
        </span>
        <span style={pixel(fs, 'var(--orange-400)')}>Fan project</span>
      </div>
    </div>
  );
}

/** Eine Musik-Zeile: Titel fett, Kuenstler gedaempft, Einsatzort als Label, ganze Zeile klickbar. */
function CreditRow({ c }) {
  return (
    <a className="tw-credit" href={c.href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 12, border: '1px solid rgba(255,184,0,.22)', textDecoration: 'none', color: 'var(--text-body)' }}>
      <span style={{ flex: 1, minWidth: 0, ...pixelText, fontSize: 15, lineHeight: 1.4 }}>
        <strong style={{ color: 'var(--text-strong)' }}>{c.titel}</strong>
        <span style={{ color: 'var(--text-muted)' }}> · {c.von}</span>
      </span>
      {c.wo && <span style={{ ...pixel(9, 'var(--sky-400)'), whiteSpace: 'nowrap' }}>{c.wo}</span>}
      <span aria-hidden="true" style={{ color: 'var(--orange-400)', fontSize: 15 }}>↗</span>
    </a>
  );
}

/** Linke Tafel: die Geschichte, Bloecke aus inhalt.js (daiganoid.story). */
function StoryPanel() {
  const parts = D.story || [];
  return (
    <GlowFrame>
      <PanelTitle>{D.storyTitel || 'The story'}</PanelTitle>
      <div style={{ padding: '22px 22px 26px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {parts.map((p, k) => {
          if (p.schluss) return <p key={k} style={{ margin: '4px 0 0', ...pixel(16), background: 'var(--grad-sun-hot)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent', lineHeight: 1.3 }}>{p.schluss}</p>;
          return (
            <section key={k} style={{ display: 'flex', flexDirection: 'column', gap: 10, ...(p.titel && k > 0 ? { paddingTop: 20, borderTop: '1px solid rgba(255,184,0,.2)' } : {}) }}>
              {p.titel && <h3 style={{ margin: 0, ...pixel(18, 'var(--sky-400)'), lineHeight: 1.4 }}>{p.titel}</h3>}
              {p.lead && <p style={{ margin: 0, ...pixelText, fontSize: 19, lineHeight: 1.45, color: 'var(--text-strong)' }}>{p.lead}</p>}
              {p.text && <p style={{ margin: 0, ...pixelText, fontSize: 16, lineHeight: 1.65, color: 'var(--text-body)' }}>{p.text}</p>}
              {p.credits && p.credits.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 2 }}>
                {p.credits.map((c, j) => <CreditRow key={j} c={c} />)}
              </div>}
            </section>
          );
        })}
      </div>
    </GlowFrame>
  );
}

function LiveBadge({ live }) {
  if (!live) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...pixel(11, 'var(--gray-300)') }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lime-400)', animation: 'tw-live-pulse 1.6s ease-out infinite' }} />
      {live.online} online · {live.playing} playing
    </span>
  );
}

const RANK_COLOR = ['var(--sun-400)', 'var(--gray-200)', 'var(--orange-400)'];

function ScoreRow({ e, i, mine }) {
  const top = i < 3;
  const rc = RANK_COLOR[i] || 'var(--gray-400)';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '34px minmax(0,1fr) 44px 92px', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 10, background: mine ? 'rgba(255,210,31,.10)' : top ? 'rgba(255,255,255,.03)' : 'transparent', outline: mine ? '1px solid rgba(255,210,31,.45)' : 'none' }}>
      <span style={{ ...pixel(14, rc), textAlign: 'right', textShadow: top ? `0 0 10px ${rc}` : 'none' }}>{i + 1}</span>
      <span style={{ ...pixel(15, top ? 'var(--gray-50)' : 'var(--gray-200)'), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
      <span style={{ ...pixel(11, 'var(--sky-400)'), textAlign: 'right' }}>R{e.round}</span>
      <span style={{ ...pixel(14, top ? 'var(--sun-400)' : 'var(--sun-300)'), textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{String(e.score).padStart(7, '0')}</span>
    </div>
  );
}

/** Rechte Tafel: dieselbe Liste wie im Spiel, Top 10, ausklappbar bis Top 100.
 *  height: Rahmenhoehe der Story-Tafel (breites Layout); die Liste scrollt dann im Rahmen. 0 = Inhaltshoehe. */
function HighscorePanel({ scores, total, live, source, mine, expanded, onToggle, height }) {
  const shown = expanded ? scores : scores.slice(0, 10);
  const empty = source === 'local' ? 'No scores on this device yet.' : source === 'loading' ? 'Loading…' : 'No scores yet. Be the first.';
  const fixed = height > 0;
  return (
    <GlowFrame height={height}>
      <PanelTitle right={<LiveBadge live={live} />}>{D.highscoreTitel || 'Highscore'}</PanelTitle>
      <div style={{ padding: '10px 12px 4px', display: 'flex', flexDirection: 'column', gap: 2, ...(fixed ? { flex: 1, minHeight: 0, overflowY: 'auto', scrollbarWidth: 'thin' } : {}) }}>
        {shown.length === 0 && <div style={{ ...pixel(12, 'var(--gray-400)'), padding: '28px 10px', textAlign: 'center', lineHeight: 1.6 }}>{empty}</div>}
        {shown.map((e, i) => <ScoreRow key={e.id || `l${i}`} e={e} i={i} mine={!!e.id && mine.has(e.id)} />)}
      </div>
      <div style={{ padding: '10px 22px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ ...pixel(10, 'var(--gray-500)'), lineHeight: 1.5 }}>{source === 'local' ? 'Offline · your local scores' : `${total} players · names are filtered`}</span>
        {scores.length > 10 && <Button variant="ghost" size="sm" onClick={onToggle}>{expanded ? 'Top 10' : `Top ${Math.min(100, scores.length)}`}</Button>}
      </div>
    </GlowFrame>
  );
}

/** Verbindung zum Highscore-Server: Liste laden, Eintrag senden, Online-Zaehler per WebSocket. Ohne apiUrl: nur lokal. */
function useHighscores() {
  const [data, setData] = React.useState(() => ({ scores: localScores(), total: 0, source: API ? 'loading' : 'local', live: null }));
  const [mine, setMine] = React.useState(() => new Set(readMine()));
  const token = React.useRef('');
  const ws = React.useRef(null);
  const playing = React.useRef(false);

  const useLocal = React.useCallback(() => { const l = localScores(); setData((d) => ({ ...d, scores: l, total: l.length, source: 'local' })); }, []);

  const refresh = React.useCallback(async () => {
    if (!API) return;
    try {
      const r = await fetch(`${API}/scores?limit=100`, { cache: 'no-store' });
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();
      token.current = j.token || '';
      // Online-Zahlen aus der Antwort nur als Startwert; sobald der WebSocket meldet, gilt der (zaehlt uns selbst mit).
      setData((d) => ({ ...d, scores: j.scores || [], total: j.total || 0, source: 'global', live: d.live || j.live }));
    } catch (e) { useLocal(); }
  }, [useLocal]);

  React.useEffect(() => { refresh(); }, [refresh]);

  React.useEffect(() => {
    if (!API || typeof WebSocket === 'undefined') return undefined;
    let sock = null, timer = 0, ping = 0, dead = false, delay = 1000;
    const connect = () => {
      if (dead) return;
      try { sock = new WebSocket(`${API.replace(/^http/, 'ws')}/live`); } catch (e) { return; }
      ws.current = sock;
      sock.onopen = () => {
        delay = 1000;
        if (playing.current) sock.send(JSON.stringify({ playing: true }));
        ping = setInterval(() => { try { sock.send('ping'); } catch (e) { /* zu */ } }, 45000);
      };
      sock.onmessage = (ev) => {
        if (ev.data === 'pong') return;
        try { const m = JSON.parse(ev.data); if (m && m.type === 'live') setData((d) => ({ ...d, live: { online: m.online, playing: m.playing } })); } catch (e) { /* ignorieren */ }
      };
      sock.onclose = () => {
        clearInterval(ping); ws.current = null;
        if (!dead) { timer = setTimeout(connect, delay); delay = Math.min(30000, delay * 2); }
      };
      sock.onerror = () => { try { sock.close(); } catch (e) { /* egal */ } };
    };
    connect();
    return () => { dead = true; clearTimeout(timer); clearInterval(ping); if (sock) { try { sock.close(); } catch (e) { /* egal */ } } };
  }, []);

  const setPlaying = React.useCallback((on) => {
    if (playing.current === on) return;
    playing.current = on;
    const s = ws.current;
    if (s && s.readyState === 1) s.send(JSON.stringify({ playing: on }));
  }, []);

  const submit = React.useCallback(async (entry) => {
    const M = window.Daiganoid;
    if (M && M.saveScore) M.saveScore({ ...entry, date: Date.now() });     // lokal immer, als Rueckfall
    if (!API) { useLocal(); return { ok: true, local: true }; }
    try {
      const r = await fetch(`${API}/scores`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...entry, token: token.current }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { refresh(); return { ok: false, error: j.error || String(r.status), reason: j.reason }; }
      if (j.id) setMine((m) => { const n = new Set(m); n.add(j.id); writeMine([...n]); return n; });
      setData((d) => ({ ...d, scores: j.scores || d.scores, total: j.total || d.total, source: 'global' }));
      refresh();                                                           // neues Token holen
      return { ok: true, rank: j.rank, id: j.id };
    } catch (e) { useLocal(); return { ok: true, local: true }; }
  }, [refresh, useLocal]);

  return { ...data, mine, submit, setPlaying, refresh };
}

function useWide(px) {
  const q = `(min-width: ${px}px)`;
  const [wide, setWide] = React.useState(() => window.matchMedia(q).matches);
  React.useEffect(() => { const m = window.matchMedia(q); const h = (e) => setWide(e.matches); m.addEventListener('change', h); return () => m.removeEventListener('change', h); }, [q]);
  return wide;
}

/** Arcade-Seite. Breit: Story | Spiel | Highscore nebeneinander, alle drei kleben beim Scrollen.
 *  Schmal: Wisch-Karussell mit dem Spiel in der Mitte, Highscore links, Story rechts; Reiter darunter.
 *  Die drei Tafeln stehen in beiden Faellen in derselben DOM-Reihenfolge, damit das Spiel beim Umschalten nicht neu startet. */
function ArcadePage() {
  const wide = useWide(WIDE_PX);
  const hs = useHighscores();
  const [expanded, setExpanded] = React.useState(false);
  const snap = React.useRef(null);
  const idxRef = React.useRef(PANES.indexOf('game'));
  const [idx, setIdx] = React.useState(idxRef.current);
  const storyBox = React.useRef(null);
  const [storyH, setStoryH] = React.useState(0);

  // Breit: Hoehe der Story-Tafel messen, der Highscore-Rahmen uebernimmt sie.
  React.useLayoutEffect(() => {
    const el = storyBox.current;
    if (!wide || !el) return undefined;
    const upd = () => setStoryH(el.offsetHeight);
    upd();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', upd); return () => window.removeEventListener('resize', upd); }
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, [wide]);

  // Breit: Abstand vom Spalten-Oberrand bis zum Spielrahmen messen (HUD darueber), die Seitentafeln beginnen auf dieser Hoehe.
  const gameBox = React.useRef(null);
  const [frameTop, setFrameTop] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = gameBox.current;
    if (!wide || !el) return undefined;
    const upd = () => { const f = el.querySelector('.tw-daig-frame'); if (f) setFrameTop(Math.round(f.getBoundingClientRect().top - el.getBoundingClientRect().top)); };
    upd();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', upd); return () => window.removeEventListener('resize', upd); }
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, [wide]);

  // Schmal: auf die aktive Tafel springen (Start = Spiel), auch nach Drehen des Geraets.
  React.useLayoutEffect(() => {
    const el = snap.current;
    if (wide || !el) return undefined;
    const go = () => { el.scrollLeft = idxRef.current * el.clientWidth; };
    go();
    window.addEventListener('resize', go);
    return () => window.removeEventListener('resize', go);
  }, [wide]);

  const onScroll = () => {
    const el = snap.current;
    if (!el || wide) return;
    const i = Math.max(0, Math.min(PANES.length - 1, Math.round(el.scrollLeft / Math.max(1, el.clientWidth))));
    if (i !== idxRef.current) { idxRef.current = i; setIdx(i); }
  };
  const goTo = (i) => { const el = snap.current; if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' }); };

  const stick = { position: 'sticky', top: 'calc(var(--nav-h) + 20px)' };
  const container = wide
    ? { display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(0, 2.2fr) minmax(280px, 1fr)', gridTemplateAreas: '"story game scores"', gap: 28, alignItems: 'start' }
    : { display: 'flex', overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', overscrollBehaviorX: 'contain', margin: '0 calc(-1 * var(--gutter))' };
  const pane = (key) => wide
    ? (key === 'game' ? { gridArea: key, minWidth: 0, ...stick }
      : { gridArea: key, minWidth: 0, ...stick, top: `calc(var(--nav-h) + 20px + ${frameTop}px)`, marginTop: frameTop, transform: `translateX(${key === 'story' ? 10 : -10}px)` })
    : { flex: '0 0 100%', minWidth: 0, scrollSnapAlign: 'center', scrollSnapStop: 'always', position: 'relative' };
  const side = wide ? {} : { position: 'absolute', inset: 0, overflowY: 'auto', scrollbarWidth: 'thin', padding: '2px var(--gutter) 8px', boxSizing: 'border-box' };
  const sideInner = wide ? {} : { maxWidth: 560, margin: '0 auto' };
  const gameInner = wide ? {} : { padding: '0 var(--gutter)' };

  const panels = {
    scores: <HighscorePanel scores={hs.scores} total={hs.total} live={hs.live} source={hs.source} mine={hs.mine} expanded={expanded} onToggle={() => setExpanded((e) => !e)} height={wide ? storyH : 0} />,
    game: <DaiganoidArcade scores={hs.scores} onSubmit={hs.submit} onPlaying={hs.setPlaying} />,
    story: <StoryPanel />,
  };

  return (
    <section style={{ maxWidth: 1480, margin: '0 auto', padding: wide ? '48px var(--gutter) 0' : '24px var(--gutter) 0', display: 'flex', flexDirection: 'column', gap: wide ? 40 : 20 }}>
      <style>{CSS}</style>
      <ArcadeHeader compact={!wide} />
      <ArcadeBand compact={!wide} sectionGap={wide ? 40 : 20} />
      <div ref={snap} className="tw-snap" style={container} onScroll={onScroll}>
        {PANES.map((key) => (
          <div key={key} style={pane(key)}>
            {key === 'game'
              ? <div ref={gameBox} style={gameInner}>{panels.game}</div>
              : <div style={side}><div ref={key === 'story' ? storyBox : undefined} style={sideInner}>{panels[key]}</div></div>}
          </div>
        ))}
      </div>
      {!wide && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          {PANES.map((key, i) => (
            <button key={key} type="button" onClick={() => goTo(i)} aria-current={i === idx} style={{ background: 'none', border: 0, padding: '8px 4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, ...pixel(12, i === idx ? 'var(--sun-400)' : 'var(--gray-500)') }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: i === idx ? 'var(--sun-400)' : 'var(--gray-500)', boxShadow: i === idx ? '0 0 8px var(--sun-400)' : 'none' }} />
              {PANE_LABEL[key]}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

Object.assign(window, { ArcadePage });
})();
