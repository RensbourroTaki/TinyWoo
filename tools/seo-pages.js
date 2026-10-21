// SEO: Schreibt den Meta-Block (Title, Description, Open Graph ...) und den unsichtbaren Crawler-Text in index.html
// und erzeugt daraus die Unterseiten games/, arcade/, about/, press/ (je eine Kopie von index.html mit eigenen Meta-Daten)
// plus sitemap.xml. Laeuft automatisch ueber tools/version.sh beim Commit.
// index.html ist die Vorlage: alles ausserhalb der <!--seo-...--> Marken wird 1:1 in die Unterseiten kopiert.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://tinywoogames.com';

// Texte nur fuer Suchmaschinen und Link-Vorschauen (der sichtbare Seiteninhalt kommt aus inhalt.js)
const PAGES = [
  { id: 'home', title: 'Tiny Woo – Tiny indie games, big fun',
    desc: 'Tiny Woo is a one-person indie game studio. Play Daiganoid, a free fan-made Arkanoid, right in your browser, and follow Rocket Trump, a tropical arcade game for PC.',
    h1: 'Tiny Woo – tiny indie games, big fun', image: 'assets/og/og-home.jpg' },
  { id: 'games', title: 'Games – Rocket Trump | Tiny Woo',
    desc: 'Rocket Trump: a tropical rocket skill-shot arcade game for PC with a worldwide Steam highscore board, rocket and mercenary upgrades. In development by Tiny Woo.',
    h1: 'Games by Tiny Woo: Rocket Trump', image: 'assets/games/rocket-trump-menu.jpg' },
  { id: 'arcade', title: 'Daiganoid – Play a free Arkanoid-style game online | Tiny Woo',
    desc: 'Play Daiganoid free in your browser: a fan-made Arkanoid with 32 rounds, lasers, mega balls and an online highscore list. Ball physics rebuilt from the 1987 arcade original.',
    h1: 'Daiganoid – play a free Arkanoid-style arcade game in your browser', image: 'assets/og/og-arcade.jpg' },
  { id: 'about', title: 'About – Tiny Woo',
    desc: 'Tiny Woo is a one-person indie game studio: pixel art since the Amiga days, 3D from the Graphic Institute of Vienna, and now small, unusual games.',
    h1: 'About Tiny Woo', image: 'assets/og/og-home.jpg' },
  { id: 'press', title: 'Press kit – Tiny Woo',
    desc: 'Press kit for Tiny Woo and its games: facts, logo, key art and screenshots, free to use in coverage.',
    h1: 'Tiny Woo press kit', image: 'assets/og/og-home.jpg' },
];
const NAV_LABEL = { home: 'Home', games: 'Games', arcade: 'Arcade', about: 'About', press: 'Press' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const urlOf = (id) => SITE + (id === 'home' ? '/' : '/' + id + '/');

function head(p) {
  const url = urlOf(p.id), img = SITE + '/' + p.image;
  const titles = Object.fromEntries(PAGES.map((q) => [q.id, q.title]));
  return [
    `<title>${esc(p.title)}</title>`,
    `<meta name="description" content="${esc(p.desc)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website"><meta property="og:site_name" content="Tiny Woo">`,
    `<meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.desc)}">`,
    `<meta property="og:url" content="${url}"><meta property="og:image" content="${img}">`,
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.title)}">`,
    `<meta name="twitter:description" content="${esc(p.desc)}"><meta name="twitter:image" content="${img}">`,
    `<script>window.TW_TITLES = ${JSON.stringify(titles)};</script>`,
  ].join('\n');
}

// Unsichtbar (nur fuer Crawler ohne JavaScript); React ersetzt den Inhalt von #root beim Start
function body(p) {
  const links = PAGES.map((q) => `<a href="${q.id === 'home' ? '/' : '/' + q.id + '/'}">${NAV_LABEL[q.id]}</a>`).join(' ');
  return `<div style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"><h1>${esc(p.h1)}</h1><p>${esc(p.desc)}</p><nav>${links}</nav></div>`;
}

const swap = (html, tag, content) => {
  const re = new RegExp(`(<!--${tag}-->)[\\s\\S]*?(<!--/${tag}-->)`);
  if (!re.test(html)) throw new Error(`Marke <!--${tag}--> fehlt in index.html`);
  return html.replace(re, `$1\n${content}\n$2`);
};

const template = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
for (const p of PAGES) {
  const html = swap(swap(template, 'seo-head', head(p)), 'seo-body', body(p));
  const dir = p.id === 'home' ? ROOT : path.join(ROOT, p.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map((p) => `  <url><loc>${urlOf(p.id)}</loc></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
