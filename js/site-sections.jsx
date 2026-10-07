(() => {
const { Button, Icon, Badge, Input, SlantSection, SocialLinks } = window.TinyWooDesignSystem_fe221f;
const I = window.TW_INHALT;
const D = I.daiganoid || {};
const featured = I.games.find(g => g.featured) || I.games[0];

const H2 = ({ children, color, style }) => <h2 className="tw-heading" style={{ fontSize: 'var(--fs-h1)', transform: 'rotate(-3deg)', transformOrigin: 'left', color, ...style }}>{children}</h2>;
const Kicker = ({ children }) => <span className="tw-pixel" style={{ fontSize: 13, color: 'var(--sky-400)' }}>{children}</span>;
const card = { background: 'var(--surface-card)', border: '4px solid var(--ink)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-pop)', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 };
const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 28, alignItems: 'start' };

const mailAddr = (I.links.email || []).join('@');

function EmailButton() {
  const [shown, setShown] = React.useState(false);
  if (!mailAddr) return null;
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="sky" icon={<Icon name="mail" size={20} />} onClick={() => { setShown(true); location.href = `mailto:${mailAddr}`; }}>Email</Button>
      {shown && <span style={{ fontSize: 17, color: 'var(--text-strong)', userSelect: 'all', overflowWrap: 'anywhere' }}>{mailAddr}</span>}
    </div>
  );
}

function ContactForm() {
  const [f, setF] = React.useState({ name: '', email: '', message: '' });
  const [state, setState] = React.useState('idle');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const ok = f.name.trim() && /\S+@\S+\.\S+/.test(f.email) && f.message.trim().length > 5;
  const send = async e => {
    e.preventDefault();
    if (!ok || state === 'sending') return;
    setState('sending');
    try {
      const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ access_key: I.links.kontaktFormKey, subject: `Tiny Woo website: ${f.name}`, from_name: 'Tiny Woo website', name: f.name, email: f.email, message: f.message }) });
      const j = await r.json();
      setState(j.success ? 'sent' : 'error');
      if (j.success) setF({ name: '', email: '', message: '' });
    } catch (err) {
      setState('error');
    }
  };
  return (
    <form onSubmit={send} style={card}>
      <Kicker>Contact</Kicker>
      <Input label="Name" value={f.name} onChange={set('name')} maxLength={80} />
      <Input label="Your email" type="email" value={f.email} onChange={set('email')} maxLength={120} />
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="tw-pixel" style={{ fontSize: 12, color: 'var(--gray-300)' }}>Message</span>
        <textarea value={f.message} onChange={set('message')} rows={6} maxLength={4000} style={{ resize: 'vertical', padding: '14px 18px', borderRadius: 'var(--radius-lg)', border: '3px solid var(--ink)', background: 'var(--blue-950)', boxShadow: 'inset 0 3px 0 rgba(0,0,0,.35)', color: 'var(--gray-50)', fontFamily: 'var(--font-body)', fontSize: 16, outline: 'none' }} />
      </label>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button type="submit" icon={<Icon name="send" size={20} />} disabled={!ok || state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send'}</Button>
        {state === 'sent' && <span className="tw-pixel" style={{ fontSize: 13, color: 'var(--lime-400)' }}>Message sent. Thanks!</span>}
        {state === 'error' && <span className="tw-pixel" style={{ fontSize: 13, color: 'var(--cherry-400)' }}>Sending failed. Try again later.</span>}
      </div>
    </form>
  );
}

const ytId = url => { const m = (url || '').match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : null; };

function Trailer({ url, title, style }) {
  const [on, setOn] = React.useState(false);
  const id = ytId(url);
  if (!id) return null;
  return (
    <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: 'var(--radius-xl)', border: '5px solid var(--ink)', boxShadow: 'var(--shadow-pop-lg)', overflow: 'hidden', background: 'var(--ink)', ...style }}>
      {on
        ? <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={`${title} trailer`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} />
        : <button type="button" onClick={() => setOn(true)} aria-label={`Play ${title} trailer`} style={{ position: 'absolute', inset: 0, padding: 0, border: 0, cursor: 'pointer', background: `var(--ink) center / cover no-repeat url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)` }}>
            <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 84, height: 84, borderRadius: '50%', border: '4px solid var(--ink)', background: 'var(--grad-sun)', boxShadow: 'var(--shadow-pop)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}><Icon name="play" size={38} /></span>
          </button>}
    </div>
  );
}

function FactList({ rows }) {
  return (
    <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '10px 20px', alignItems: 'baseline' }}>
      {rows.map(([k, v]) => <React.Fragment key={k}><dt className="tw-pixel" style={{ fontSize: 12, color: 'var(--sky-400)' }}>{k}</dt><dd style={{ margin: 0, fontSize: 17, color: 'var(--text-strong)', overflowWrap: 'anywhere' }}>{v}</dd></React.Fragment>)}
    </dl>
  );
}

function FeaturedGame({ onNav }) {
  if (!featured) return null;
  return (
    <SlantSection tone="deep" angle={-4} innerStyle={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 48, alignItems: 'center' }}>
      <div style={{ position: 'relative' }}>
        {ytId(featured.trailer)
          ? <Trailer url={featured.trailer} title={featured.title} style={{ transform: 'rotate(-2.5deg)' }} />
          : <img src={featured.image} alt={featured.title} style={{ width: '100%', display: 'block', borderRadius: 'var(--radius-xl)', border: '5px solid var(--ink)', boxShadow: 'var(--shadow-pop-lg)', transform: 'rotate(-2.5deg)' }} />}
        {featured.status && <div style={{ position: 'absolute', top: -14, right: 20, transform: 'rotate(8deg)' }}><Badge tone="cherry">{featured.status}</Badge></div>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Kicker>Featured</Kicker>
        <H2>{featured.title}</H2>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55 }}>{featured.text || featured.tagline}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{(featured.tags || []).map(t => <Badge key={t} tone="outline">{t}</Badge>)}</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {featured.link && <Button icon={<Icon name="steam" brand size={20} />} href={featured.link}>{featured.linkText || 'Play'}</Button>}
          <Button variant="ghost" onClick={() => onNav('games')}>All games</Button>
        </div>
      </div>
    </SlantSection>
  );
}

function ArcadeTeaser({ onNav }) {
  return (
    <section style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--space-9) var(--gutter)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 48, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Kicker>Arcade · Play right here</Kicker>
        <H2 color="var(--orange-400)">{D.titel || 'Daiganoid'}</H2>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55 }}>{D.text || ''}</p>
        <div><Button variant="lime" icon={<Icon name="gamepad-2" size={20} />} onClick={() => onNav('arcade')}>Open arcade</Button></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}><DaiganoidTeaser onNav={onNav} /></div>
    </section>
  );
}

function Community() {
  return (
    <SlantSection tone="raised" angle={3} edge="orange" innerStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, textAlign: 'center' }}>
      <H2 style={{ transform: 'rotate(-2deg)', transformOrigin: 'center' }}>{I.texte.communityTitel}</H2>
      <p style={{ margin: 0, fontSize: 17, maxWidth: 520, lineHeight: 1.55 }}>{I.texte.communityText}</p>
      <Button size="lg" variant="secondary" icon={<Icon name="discord" brand size={26} />} href={I.links.discord}>Join Discord</Button>
      <SocialLinks links={I.socials} style={{ justifyContent: 'center' }} />
    </SlantSection>
  );
}

function Footer({ onNav }) {
  return (
    <footer style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '56px var(--gutter) 260px', display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
      <span className="tw-pixel" style={{ fontSize: 12, color: 'var(--gray-400)' }}>{I.texte.footer}</span>
      <span className="tw-pixel" style={{ fontSize: 12, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <a href="#press" onClick={e => { e.preventDefault(); onNav('press'); }}>Press kit</a>
        <a href="#about" onClick={e => { e.preventDefault(); onNav('about'); }}>Contact</a>
      </span>
    </footer>
  );
}

function GameRow({ g, flip, onNav }) {
  const tilt = flip ? 2 : -2;
  return (
    <SlantSection tone={flip ? 'raised' : 'deep'} angle={flip ? 3 : -3} edge={flip ? 'orange' : 'sun'} innerStyle={{ display: 'flex', flexDirection: flip ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: 48, alignItems: 'center' }}>
      <div style={{ position: 'relative', flex: '3 1 480px', minWidth: 0 }}>
        {ytId(g.trailer)
          ? <Trailer url={g.trailer} title={g.title} style={{ transform: `rotate(${tilt}deg)` }} />
          : <img src={g.image} alt={g.title} style={{ width: '100%', display: 'block', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 'var(--radius-xl)', border: '5px solid var(--ink)', boxShadow: 'var(--shadow-pop-lg), var(--shadow-float)', transform: `rotate(${tilt}deg)` }} />}
        {g.status && <div style={{ position: 'absolute', top: -14, [flip ? 'left' : 'right']: 20, transform: `rotate(${-tilt * 4}deg)` }}><Badge tone="cherry">{g.status}</Badge></div>}
      </div>
      <div style={{ flex: '2 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <H2>{g.title}</H2>
        <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55 }}>{g.text || g.tagline}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{(g.tags || []).map(t => <Badge key={t} tone="outline">{t}</Badge>)}</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {g.link && <Button icon={<Icon name="steam" brand size={20} />} href={g.link}>{g.linkText || 'Play'}</Button>}
          <Button variant="ghost" icon={<Icon name="newspaper" size={20} />} onClick={() => onNav('press')}>Press kit</Button>
        </div>
      </div>
    </SlantSection>
  );
}

function GamesPage({ onNav }) {
  return (
    <>
      <section style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '48px var(--gutter) 24px' }}>
        <H2 style={{ fontSize: 'var(--fs-hero)' }}>Games</H2>
      </section>
      {I.games.map((g, k) => <GameRow key={g.title} g={g} flip={k % 2 === 1} onNav={onNav} />)}
      <section style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--space-9) var(--gutter) 0' }}>
        <div style={{ border: '4px dashed var(--border-strong)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220, transform: 'rotate(-1deg)' }}>
          <span className="tw-pixel" style={{ fontSize: 16, color: 'var(--gray-400)' }}>Next game · loading…</span>
        </div>
      </section>
    </>
  );
}

// Die Arcade-Seite (ArcadePage) liegt in js/site-arcade.jsx.

function AboutPage() {
  return (
    <section style={{ maxWidth: 760, margin: '0 auto', padding: '48px var(--gutter) 0', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <H2 style={{ fontSize: 'var(--fs-hero)' }}>About</H2>
      <p style={{ margin: 0, fontSize: 19, lineHeight: 1.6, color: 'var(--text-strong)' }}>{I.texte.aboutText1}</p>
      <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6 }}>{I.texte.aboutText2}</p>
      <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6 }}>{I.texte.aboutText3}</p>
      <SocialLinks links={I.socials} />
      <ContactForm />
    </section>
  );
}

function PressGame({ g }) {
  const P = g.presse || {};
  const shots = P.screenshots || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <H2>{g.title}</H2>
      <div style={grid2}>
        <div style={card}>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55 }}>{g.text || g.tagline}</p>
          {P.fakten && <FactList rows={P.fakten} />}
          {g.link && g.link !== '#' && <div><Button icon={<Icon name="steam" brand size={20} />} href={g.link}>{g.linkText || 'Store'}</Button></div>}
        </div>
        {ytId(g.trailer)
          ? <Trailer url={g.trailer} title={g.title} />
          : <img src={g.image} alt={g.title} style={{ width: '100%', display: 'block', borderRadius: 'var(--radius-xl)', border: '5px solid var(--ink)', boxShadow: 'var(--shadow-pop-lg)' }} />}
      </div>
      {shots.length > 0 && <>
        <Kicker>Screenshots · click to open full size</Kicker>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,240px),1fr))', gap: 16 }}>
          {shots.map(s => <a key={s} href={s} target="_blank" rel="noopener"><img src={s} alt={`${g.title} screenshot`} loading="lazy" style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block', borderRadius: 'var(--radius-lg)', border: '3px solid var(--ink)', boxShadow: 'var(--shadow-pop-sm)' }} /></a>)}
        </div>
      </>}
    </div>
  );
}

function PressPage() {
  const P = I.presse || {};
  return (
    <section style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '48px var(--gutter) 0', display: 'flex', flexDirection: 'column', gap: 48 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <H2 style={{ fontSize: 'var(--fs-hero)' }}>Press</H2>
        {P.intro && <p style={{ margin: 0, fontSize: 19, lineHeight: 1.6, maxWidth: 760, color: 'var(--text-strong)' }}>{P.intro}</p>}
      </div>
      <div style={grid2}>
        <div style={card}>
          <Kicker>Studio</Kicker>
          {P.fakten && <FactList rows={P.fakten} />}
          <EmailButton />
        </div>
        <div style={card}>
          <Kicker>Downloads</Kicker>
          {(P.downloads || []).map(d => <div key={d.src}><Button variant="ghost" size="sm" icon={<Icon name="download" size={18} />} href={d.src} download>{d.label}</Button></div>)}
        </div>
      </div>
      {I.games.map(g => <PressGame key={g.title} g={g} />)}
    </section>
  );
}

Object.assign(window, { FeaturedGame, ArcadeTeaser, Community, Footer, GamesPage, AboutPage, PressPage });
})();
