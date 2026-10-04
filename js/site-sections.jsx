(() => {
const { Button, Icon, Badge, GameCard, SlantSection, SocialLinks, CrosshairGame } = window.TinyWooDesignSystem_fe221f;
const I = window.TW_INHALT;
const S = I.spiel || {};
const gameProps = { duration: S.sekunden || 45, ammo: S.munition || 8, title: S.titel || 'Woo Hunt', sprite: S.ziel || undefined, background: S.hintergrund || undefined, storageKey: 'tw-site-scores' };
const featured = I.games.find(g => g.featured) || I.games[0];

const H2 = ({ children, color, style }) => <h2 className="tw-heading" style={{ fontSize: 'var(--fs-h1)', transform: 'rotate(-3deg)', transformOrigin: 'left', color, ...style }}>{children}</h2>;
const Kicker = ({ children }) => <span className="tw-pixel" style={{ fontSize: 13, color: 'var(--sky-400)' }}>{children}</span>;

function FeaturedGame({ onNav }) {
  if (!featured) return null;
  return (
    <SlantSection tone="deep" angle={-4} innerStyle={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 48, alignItems: 'center' }}>
      <div style={{ position: 'relative' }}>
        <img src={featured.image} alt={featured.title} style={{ width: '100%', display: 'block', borderRadius: 'var(--radius-xl)', border: '5px solid var(--ink)', boxShadow: 'var(--shadow-pop-lg)', transform: 'rotate(-2.5deg)' }} />
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
        <H2 color="var(--orange-400)">{gameProps.title}</H2>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55 }}>{gameProps.duration} seconds, {gameProps.ammo} shells, zero mercy. Small targets score more. Beat the board, write your name, brag on Discord.</p>
        <div><Button variant="lime" icon={<Icon name="crosshair" size={20} />} onClick={() => onNav('arcade')}>Open arcade</Button></div>
      </div>
      <div style={{ transform: 'rotate(1.5deg)' }}><CrosshairGame {...gameProps} height={380} /></div>
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

function Footer() {
  return (
    <footer style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '56px var(--gutter) 260px', display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
      <span className="tw-pixel" style={{ fontSize: 12, color: 'var(--gray-400)' }}>{I.texte.footer}</span>
    </footer>
  );
}

function GamesPage() {
  return (
    <section style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '48px var(--gutter) 0', display: 'flex', flexDirection: 'column', gap: 36 }}>
      <H2 style={{ fontSize: 'var(--fs-hero)' }}>Games</H2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap: 28 }}>
        {I.games.map(g => <GameCard key={g.title} title={g.title} image={g.image} tagline={g.tagline} tags={g.tags} status={g.status} href={g.link || '#'} cta={g.linkText || 'Play'} />)}
        <div style={{ border: '4px dashed var(--border-strong)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, transform: 'rotate(1deg)' }}>
          <span className="tw-pixel" style={{ fontSize: 14, color: 'var(--gray-400)' }}>Next game · loading…</span>
        </div>
      </div>
    </section>
  );
}

function ArcadePage() {
  return (
    <section style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '48px var(--gutter) 0', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <H2 color="var(--orange-400)" style={{ fontSize: 'var(--fs-hero)' }}>Arcade</H2>
      <CrosshairGame {...gameProps} height={560} />
    </section>
  );
}

function AboutPage() {
  return (
    <section style={{ maxWidth: 760, margin: '0 auto', padding: '48px var(--gutter) 0', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <H2 style={{ fontSize: 'var(--fs-hero)' }}>About</H2>
      <p style={{ margin: 0, fontSize: 19, lineHeight: 1.6, color: 'var(--text-strong)' }}>{I.texte.aboutText1}</p>
      <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6 }}>{I.texte.aboutText2}</p>
      <SocialLinks links={I.socials} />
    </section>
  );
}

Object.assign(window, { FeaturedGame, ArcadeTeaser, Community, Footer, GamesPage, ArcadePage, AboutPage });
})();
