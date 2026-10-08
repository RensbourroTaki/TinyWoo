(() => {
const { Button, Icon, Badge } = window.TinyWooDesignSystem_fe221f;
const I = window.TW_INHALT;

function Ticker({ items, angle = -3, tone = 'sun' }) {
  const line = items.map(t => t + '  ★  ').join('');
  return (
    <div style={{ position: 'relative', zIndex: 2, transform: `rotate(${angle}deg)`, margin: '0 -40px', background: tone === 'sun' ? 'var(--grad-sun)' : 'var(--ink)', borderTop: '4px solid var(--ink)', borderBottom: '4px solid var(--ink)', overflow: 'hidden', whiteSpace: 'nowrap', padding: '12px 0' }}>
      <div style={{ display: 'inline-block', animation: 'tw-marquee 22s linear infinite', fontFamily: 'var(--font-display)', fontSize: 28, color: tone === 'sun' ? 'var(--ink)' : 'var(--sun-400)', letterSpacing: '.03em' }}>{line}{line}{line}{line}</div>
    </div>
  );
}

function Hero({ onNav }) {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: '40px 0 110px' }}>
      <div aria-hidden className="tw-stripes" style={{ position: 'absolute', inset: '-20% -10% 18% -10%', background: 'var(--blue-800)', transform: 'skewY(-7deg)', borderBottom: '6px solid var(--sun-400)' }} />
      <div aria-hidden style={{ position: 'absolute', right: '-6%', top: '8%', width: '46%', height: '78%', background: 'var(--electric-500)', transform: 'skewX(-12deg)', border: '4px solid var(--ink)', boxShadow: '14px 14px 0 var(--ink)' }} />
      <div style={{ position: 'relative', maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)', display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', gap: 40, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, animation: 'tw-pop-in var(--dur-slow) var(--ease-pop)' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Badge tone="lime" tilt>Solo indie dev</Badge><Badge tone="outline">Est. one guy</Badge></div>
          <h1 className="tw-heading" style={{ fontSize: 'var(--fs-hero)', transform: 'rotate(-4deg)', transformOrigin: 'left' }}>
            {I.texte.heroZeile1}<br /><span style={{ color: 'var(--orange-400)' }}>{I.texte.heroZeile2}</span>
          </h1>
          <p style={{ margin: 0, fontSize: 'var(--fs-lg)', lineHeight: 'var(--lh-body)', maxWidth: 480, textWrap: 'pretty' }}>{I.texte.heroText}</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Button size="lg" icon={<Icon name="rocket" size={26} />} onClick={() => onNav('games')}>See games</Button>
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <img src={I.logo} alt="Tiny Woo" style={{ width: '100%', maxWidth: 440, borderRadius: 'var(--radius-xl)', border: '5px solid var(--ink)', boxShadow: 'var(--shadow-pop-lg), var(--shadow-float)', transform: 'rotate(5deg)', animation: 'tw-bob 3.2s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', left: -6, bottom: 10, transform: 'rotate(-10deg)' }}><Badge tone="sun">Now loading…</Badge></div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Hero, Ticker });
})();
