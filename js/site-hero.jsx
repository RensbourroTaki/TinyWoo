(() => {
const { Button, Icon } =window.TinyWooDesignSystem_fe221f;
const I = window.TW_INHALT;

// Ticker-Farben, per Zifferntaste 1–7 waehlbar; Taste 8 = Regenbogen-Cycle durch alle (Default). Nichts wird gespeichert.
const TICKER_FARBEN = ['#57D93A', '#2E86FF', '#1FD1C7', '#9B5CFF', '#FF6FB5', '#FFD21F', '#FF9A1A'];
const TICKER_REGENBOGEN_MS = 900;
// Glanz oben, Schatten unten — liegt ueber der Grundfarbe, damit der Farbwechsel weich ueberblenden kann.
const TICKER_GLANZ = 'linear-gradient(180deg, rgba(255,255,255,.38) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,.18) 100%)';

function Ticker({ items, angle = -3, tone = 'sun' }) {
  const [modus, setModus] = React.useState(7);   // 0..6 = feste Farbe, 7 = Regenbogen (Default)
  const [regenbogen, setRegenbogen] = React.useState(0);

  React.useEffect(() => {
    const onKey = e => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 8) setModus(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  React.useEffect(() => {
    if (modus !== 7) return;
    const id = setInterval(() => setRegenbogen(i => (i + 1) % TICKER_FARBEN.length), TICKER_REGENBOGEN_MS);
    return () => clearInterval(id);
  }, [modus]);

  const farbe = TICKER_FARBEN[modus === 7 ? regenbogen : modus];
  const dauer = modus === 7 ? TICKER_REGENBOGEN_MS + 'ms linear' : '.3s ease';
  const line = items.map(t => t + '  ★  ').join('');
  return (
    <div style={{ position: 'relative', zIndex: 2, transform: `rotate(${angle}deg)`, margin: '0 -40px', ...(tone === 'sun' ? { backgroundColor: farbe, backgroundImage: TICKER_GLANZ, transition: `background-color ${dauer}` } : { background: 'var(--ink)' }), borderTop: '4px solid var(--ink)', borderBottom: '4px solid var(--ink)', overflow: 'hidden', whiteSpace: 'nowrap', padding: '12px 0' }}>
      <div style={{ display: 'inline-block', animation: 'tw-marquee 22s linear infinite', fontFamily: 'var(--font-display)', fontSize: 28, color: tone === 'sun' ? 'var(--ink)' : 'var(--sun-400)', letterSpacing: '.03em' }}>{line}{line}{line}{line}</div>
    </div>
  );
}

// Der Hero liegt mit seinem Grund (--bg-hero) auch unter dem durchsichtigen Header, damit der Logo-Glow oben nicht abreisst.
const HEADER_H = 72;          // Header-Hoehe: --nav-h (Logo 54 px + 2 x 8 px Padding passt hinein)
// Unten endet der Grund schraeg (-3 deg wie der Ticker) genau unter der Ticker-Mitte, damit keine Kante sichtbar wird.
const TICKER_HALB = 34;       // halbe Ticker-Hoehe
const TIEF = `calc(${TICKER_HALB}px + 2.62vw)`;   // 2.62vw = tan(3 deg) * 50vw

function Hero({ onNav }) {
  return (
    <section style={{ position: 'relative', overflowX: 'clip', marginTop: -HEADER_H, marginBottom: `calc(-1 * ${TIEF})`, padding: `${40 + HEADER_H}px 0 calc(110px + ${TIEF})`, background: 'var(--bg-hero)', clipPath: 'polygon(0 0,100% 0,100% calc(100% - 5.24vw),0 100%)' }}>
      <div style={{ position: 'relative', maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)', display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', gap: 40, alignItems: 'center' }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 22, animation: 'tw-pop-in var(--dur-slow) var(--ease-pop)' }}>
          <h1 className="tw-heading" style={{ fontSize: 'var(--fs-hero)', transform: 'rotate(-4deg)', transformOrigin: 'left' }}>
            {I.texte.heroZeile1}<br /><span style={{ color: 'var(--orange-400)' }}>{I.texte.heroZeile2}</span>
          </h1>
          <p style={{ margin: 0, fontSize: 'var(--fs-lg)', lineHeight: 'var(--lh-body)', maxWidth: 480, textWrap: 'pretty', whiteSpace: 'pre-line' }}>{I.texte.heroText}</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Button size="lg" icon={<Icon name="gamepad-2" size={26} />} onClick={() => onNav('games')}>See games</Button>
          </div>
        </div>
        {/* Logo mit Glow 1:1 (912x744), mittig auf der rechten Spalte, darf ueber die Spalte hinausragen */}
        <div style={{ position: 'relative', alignSelf: 'stretch' }}>
          <img src={I.logoHero} alt="Tiny Woo" width={912} height={744} style={{ position: 'absolute', left: '50%', top: '50%', width: 912, height: 744, maxWidth: 'none', margin: '-372px 0 0 -456px', pointerEvents: 'none', animation: 'tw-bob 3.2s ease-in-out infinite' }} />
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Hero, Ticker });
})();
