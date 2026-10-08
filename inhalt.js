/* =====================================================================
   TINY WOO – INHALT DER WEBSITE
   Hier trägst du alles ein. Direkt auf GitHub bearbeitbar (Stift-Symbol).

   Regeln:
   - Texte immer in 'einfachen Anführungszeichen'.
   - Nach jedem Eintrag ein Komma.
   - Dateinamen: klein, ohne Leerzeichen/Umlaute.
   - Nach dem Speichern (Commit) 1–2 Minuten warten, dann Seite neu laden.
   ===================================================================== */

window.TW_INHALT = {

  logo: 'assets/logo/tinywoo-logo.png',

  /* ---------- LINKS ---------- */
  links: {
    email: ['tinywoogames', 'gmail.com'],   // absichtlich getrennt (Schutz vor Spam-Bots): ['name', 'domain']
    kontaktFormKey: 'a95235b3-d5b6-4cfc-9213-7161abaa0399',      // Web3Forms Access Key (kostenlos auf web3forms.com mit deiner E-Mail holen)
  },

  /* Social-Buttons. Nicht gebraucht? Zeile löschen.
     brand-Namen: discord, youtube, x, tiktok, instagram, itchdotio, steam, twitch, github, reddit, bluesky */
  socials: [
    { brand: 'youtube',   label: 'YouTube',   href: '#' },
    { brand: 'x',         label: 'X',         href: '#' },
    { brand: 'tiktok',    label: 'TikTok',    href: '#' },
    { brand: 'instagram', label: 'Instagram', href: '#' },
    { brand: 'itchdotio', label: 'itch.io',   href: '#' },
    { brand: 'steam',     label: 'Steam',     href: '#' },
  ],

  /* ---------- MUSIK ----------
     OGG nach assets/music/ hochladen, dann hier eintragen.
     duration = Länge in Sekunden (nur Anzeige, wird beim Abspielen korrigiert).
     Ohne src spielt der Player nur zum Schein (Demo).
     Browser ohne OGG-Unterstützung zeigen den Player gar nicht an. */
  musik: [
    { title: 'Island Storm Surge · Main Menu', artist: 'Tiny Woo', src: 'assets/music/island-storm-surge-main-menu.ogg', duration: 328 },
    { title: 'Neon Jungle Hunt · Main Menu', artist: 'Tiny Woo', src: 'assets/music/neon-jungle-hunt-main-menu.ogg', duration: 249 },
    { title: 'Mercenary Training', artist: 'Tiny Woo', src: 'assets/music/mercenary-training.ogg', duration: 153 },
    { title: 'Chase the Sun · 2nd Balloon Time', artist: 'Tiny Woo', src: 'assets/music/chase-the-sun-2nd-balloon-time.ogg', duration: 58 },
    { title: 'Coconut in the Air · Balloon Time', artist: 'Tiny Woo', src: 'assets/music/coconut-in-the-air-balloon-time.ogg', duration: 109 },
    { title: 'Coconut in the Air 2 · Balloon Time', artist: 'Tiny Woo', src: 'assets/music/coconut-in-the-air-2-balloon-time.ogg', duration: 61 },
    { title: 'Jungle Heist · Balloon Time', artist: 'Tiny Woo', src: 'assets/music/jungle-heist-balloon-time.ogg', duration: 218 },
    { title: 'Jungle Heist 3 · Balloon Time', artist: 'Tiny Woo', src: 'assets/music/jungle-heist-3-balloon-time.ogg', duration: 140 },
    { title: 'Jungle Heist · Showdown', artist: 'Tiny Woo', src: 'assets/music/jungle-heist-showdown.ogg', duration: 410 },
    { title: 'Jungle Heist 5 · Showdown', artist: 'Tiny Woo', src: 'assets/music/jungle-heist-5-showdown.ogg', duration: 381 },
    { title: 'Jungle Heist 8 · Showdown', artist: 'Tiny Woo', src: 'assets/music/jungle-heist-8-showdown.ogg', duration: 389 },
    { title: 'Jungle Rush · 2nd Balloon Time', artist: 'Tiny Woo', src: 'assets/music/jungle-rush-2nd-balloon-time.ogg', duration: 183 },
    { title: 'Jungle Rush 2 · Balloon Time', artist: 'Tiny Woo', src: 'assets/music/jungle-rush-2-balloon-time.ogg', duration: 129 },
    { title: 'Jungle Rush 3 · Showdown', artist: 'Tiny Woo', src: 'assets/music/jungle-rush-3-showdown.ogg', duration: 165 },
    { title: 'Neon Jungle Hunt · Balloon Time', artist: 'Tiny Woo', src: 'assets/music/neon-jungle-hunt-balloon-time.ogg', duration: 249 },
    { title: 'Neon Jungle Run · 2nd Balloon Time', artist: 'Tiny Woo', src: 'assets/music/neon-jungle-run-2nd-balloon-time.ogg', duration: 203 },
    { title: 'Neon Jungle Run 2 · 2nd Balloon Time', artist: 'Tiny Woo', src: 'assets/music/neon-jungle-run-2-2nd-balloon-time.ogg', duration: 174 },
    { title: 'Samba na Coco · 2nd Balloon Time', artist: 'Tiny Woo', src: 'assets/music/samba-na-coco-2nd-balloon-time.ogg', duration: 360 },
    { title: 'Samba na Coco 1 · 2nd Balloon Time', artist: 'Tiny Woo', src: 'assets/music/samba-na-coco-1-2nd-balloon-time.ogg', duration: 360 },
    { title: 'Shield Break', artist: 'Tiny Woo', src: 'assets/music/shield-break.ogg', duration: 215 },
    { title: 'Tropical Marimba', artist: 'Tiny Woo', src: 'assets/music/tropical-marimba.ogg', duration: 138 },
    { title: 'Tropical Marimba Dance', artist: 'Tiny Woo', src: 'assets/music/tropical-marimba-dance.ogg', duration: 150 },
    { title: 'Tropical Marimba (Slower)', artist: 'Tiny Woo', src: 'assets/music/tropical-marimba-slower.ogg', duration: 64 },
  ],

  /* ---------- GAMES ----------
     Bild (16:9, JPG) nach assets/games/ hochladen.
     featured: true  = groß auf der Startseite (nur bei EINEM Game).
     link = Steam / itch.io / eigene Seite. '#' = noch kein Link.
     trailer = YouTube-Link (z.B. 'https://www.youtube.com/watch?v=abc123'). '' = kein Trailer.
     presse = Fakten + Screenshots für die Press-Seite. Screenshots (JPG/PNG) nach assets/games/ hochladen. */
  games: [
    {
      title: 'Rocket Trump',
      image: 'assets/games/rocket-trump-menu.jpg',
      tagline: 'Yes, it\'s Trump. Yes, the chickens have guns.',
      text: 'Catch rockets, stack coins, hire the Tiger Claws and climb the highscore. Chaotic jungle-base arcade action with a very short fuse.',
      // Games-Seite: tagline = Unterzeile, beschreibung = Absaetze unter dem Titel (\n = neue Zeile),
      // featuresIntro = Satz ueber den Listen, featuresTitel + features = erste Liste (Aufgaben), zwischenzeile = fetter Satz danach,
      // features2Titel + features2 = zweite Liste (Features), featuresSchluss = gelbe Schlusszeile.
      // kicker = gelber Steam-Kasten rechts (Text, oder [Titel, Text]), nachsatz = Absatz darunter ('' / weglassen = aus). (text = kurz, fuer die Startseite)
      // Optional (derzeit aus): cast = Figurenkarten [Name, Text], ablauf = nummerierte Kaertchen, hinweis = kleine Zeile.
      beschreibung: [
        'Shoot Trump higher and higher with rockets, and shoot balloons to extend your play time. Earn the respect of the Tiger Claws, three mercenary birds who help you shoot down balloons, UFOs and snails. And invite Putin: he gives you perks, but you have to impress him, or he leaves.',
      ],
      featuresIntro: 'Rocket Trump is a small but nasty gameplay loop where everything comes down to your rocket skills, and you compete worldwide with other Steam players.',
      featuresTitel: 'Your job',
      features: [
        'Launch Trump as high as you can for extra bonuses',
        'Shoot balloons to extend your play time',
        'Shoot UFOs and grab mortars for triple shots',
        'Hit snails to fire up the balloon cannon',
        'Earn the respect of the Tiger Claws gang',
        'Invite Putin for perks, and impress him so he stays',
      ],
      zwischenzeile: 'Now try to manage all of that at once!',
      features2Titel: 'Features',
      features2: [
        'Unlimited rockets',
        'Worldwide highscore board with Steam names and avatars',
        'Ticker with the top 20 players in the main menu',
        'Rocket and mercenary upgrades',
        'Pet shop',
        'Audio player: unlock new in-game tracks and pick your own track for each in-game event',
        'Stats screen with your total progress chart, accuracy and best combos',
      ],
      featuresSchluss: 'Welcome to the crazy rocket campus!',
      kicker: 'Compete worldwide with every Steam player on the in-game highscore list, with Steam names and avatars. YOU CAN\'T HIDE!',
      tags: ['PC', 'Arcade', 'Singleplayer'],
      status: 'In dev',
      link: '#',
      linkText: 'Wishlist',
      featured: true,
      trailer: '',
      presse: {
        fakten: [
          ['Release',   'TBA'],
          ['Platforms', 'PC (Steam)'],
          ['Price',     'TBA'],
          ['Genre',     'Arcade'],
        ],
        screenshots: ['assets/games/rocket-trump-menu.jpg'],
      },
    },
  ],

  /* ---------- PRESSE ----------
     fakten = Zeilen der Studio-Faktenliste ['Name', 'Wert']. Zeile löschen = weg.
     downloads = Dateien zum Herunterladen (Logo, Key Art, Presskit-ZIP ...). */
  presse: {
    intro: 'Everything you need to cover Tiny Woo and its games. All assets are free to use in coverage.',
    fakten: [
      ['Developer', 'Tiny Woo'],
      ['Team',      'One person'],
    ],
    downloads: [
      { label: 'Tiny Woo logo (PNG)',     src: 'assets/logo/tinywoo-logo.png' },
      { label: 'Rocket Trump key art',    src: 'assets/games/rocket-trump-menu.jpg' },
    ],
  },

  /* ---------- DAIGANOID (Arcade-Seite) ----------
     Das Spiel selbst liegt in game/ und assets/daiganoid/ (siehe ANLEITUNG, Punkt 7).
     musikMenue / musikHighscore / musikSpiel: OGG nach assets/daiganoid/music/ hochladen und hier eintragen ('' = keine Musik).
     apiUrl: Adresse des Highscore-Servers (Cloudflare Worker, ANLEITUNG Punkt 8). '' = nur lokale Liste im Browser.
     header: Kopf der Arcade-Seite. story: linke Spalte, ein Block = Zwischenueberschrift + Absatz (titel weglassen = nur Absatz),
     optional links: [{ label, href }] = klickbare Links unter dem Absatz. */
  daiganoid: {
    titel: 'Daiganoid',
    text: 'A fan-made Arkanoid: 32 rounds, two exits per round, lasers, mega balls and a cube that wants your ball. Pixel-exact ball physics rebuilt from the 1987 arcade original.',
    musikMenue: 'assets/daiganoid/music/OutThere.ogg',        // "Out There" von yd (OpenGameArt, CC0)
    musikHighscore: 'assets/daiganoid/music/PartySector.ogg', // "Party Sector" von Joth (OpenGameArt, CC0)
    musikSpiel: '',          // z.B. 'assets/daiganoid/music/game.ogg'

    apiUrl: 'https://daiganoid-api.tinywoo.workers.dev',   // '' = aus (nur lokale Liste)

    header: {
      kicker: 'Arcade · A fan vision',
      titel: 'DAIGANOID',
      zeile: 'The Arkanoid fan project!',
      unterzeile: 'Made with the deepest respect for TAITO, creators of the timeless original.',
    },

    highscoreTitel: 'Highscore',
    storyTitel: 'The story',
    story: [
      { text: 'Arkanoid is TAITO\'s masterpiece, and DAIGANOID is my love letter to it. I pixelled every graphic and the font around 2000, for a Pocket PC version a friend and I never got to finish. Twenty-five years later, with AI helping me on the code side, I finally gave these pixels the game they were made for. I put everything I love about the original into it, and I hope you can feel that.' },
      { text: 'I hope you enjoy this version! Over time I plan to add bosses, a level editor and more, though I mustn\'t forget the other games I still want to make ;)' },
      { titel: 'Music', text: 'The menu theme "Out There" is by yd, and the highscore theme "Party Sector" is by Joth, both shared freely on OpenGameArt. They didn\'t ask for credit, but their tracks give DAIGANOID its mood, so: thank you!',
        links: [
          { label: 'Main Menu track "Out There" by yd', href: 'https://opengameart.org/content/space-music-out-there' },
          { label: 'Highscore track "Party Sector" by Joth', href: 'https://opengameart.org/content/party-sector' },
        ] },
      { text: 'Have fun!' },
    ],
  },

  /* ---------- TEXTE ---------- */
  texte: {
    heroZeile1: 'Tiny,',
    heroZeile2: 'but fun!',
    heroText: 'Tiny Woo is decades of game-dev experience, distilled into small games that are simply fun to play.',
    laufband: ['Rocket Trump in development', 'Play Daiganoid in the arcade', 'Tiny, but fun!','Highscores open'],
    communityTitel: 'Join the dojo',
    communityText: 'Devlogs, playtests, memes and the occasional existential crisis.',
    // About-Seite: Bausteine in Reihenfolge. { h } = Zwischenüberschrift, { p } = Absatz, { liste } = Aufzählung, { schluss } = Schlusssatz.
    about: [
      { h: "Here's my story" },
      { p: "I started pixelling game assets on the Amiga at 13. Later I worked for local studios, moved into 3D, and studied at the Graphic Institute of Vienna, where I learned layout, typography and every trick of commercial design. But agency life never felt like home. Games always did." },
      { p: "Over the years I learned the whole 3D pipeline to industry standards, from modelling and texturing to rigging and hand-painted weights, and dug deep into how game systems and mechanics really work. In 2013 I launched Dynabot The Robo Marble on Kickstarter, but carrying almost everything alone burned me out, and I had to put it on ice." },
      { p: "Since then I've focused on what makes games feel good: optimization, gameplay dynamics and the technical solutions behind them." },
      { h: 'Where AI comes in' },
      { p: "AI finally lets me build the games I've been chasing for decades. I bring the experience and the design decisions, and I direct the AI step by step through every module, the way I want it built. Here's what I use it for:" },
      { liste: [
        'Code support',
        'Tools for my games',
        'Shaders',
        'Background music. I compose in Studio One myself, but a good track takes forever. Have mercy!',
        'Some UI icons, so I can spend my pixel time where it matters',
      ] },
      { p: "Everything else I make myself, or it's a purchased asset I modify to fit the game visually and technically. Sometimes it's the work of an artist I simply love, because it fits better than anything I would have made." },
      { p: "I'm choosing not to spend my time running a Discord server or making videos about my workflow, because that would just pull me away from the actual work of making a beautiful, exciting game. And I don't want to end up relying on a bunch of AI agents because I can't manage the work of that many people. Besides, I don't want to grow. Tiny Woo is meant to stay tiny!" },
    ],
    footer: '© 2026 Tiny Woo · Made by one guy with a sword',
  },
};
