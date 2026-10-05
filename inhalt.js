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
    discord: '#',            // z.B. 'https://discord.gg/abc123'
    email: ['tinywoogames', 'gmail.com'],   // absichtlich getrennt (Schutz vor Spam-Bots): ['name', 'domain']
    kontaktFormKey: '',      // Web3Forms Access Key (kostenlos auf web3forms.com mit deiner E-Mail holen)
  },

  /* Social-Buttons. Nicht gebraucht? Zeile löschen.
     brand-Namen: discord, youtube, x, tiktok, instagram, itchdotio, steam, twitch, github, reddit, bluesky */
  socials: [
    { brand: 'discord',   label: 'Discord',   href: '#' },
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
      tagline: 'Catch rockets, hire the Tiger Gang, top the board.',
      text: 'Catch rockets, stack coins, hire the Tiger Gang and climb the highscore. Chaotic jungle-base arcade action with a very short fuse.',
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

  /* ---------- FADENKREUZ-SPIEL ----------
     ziel: PNG mit transparentem Hintergrund, Frames NEBENEINANDER, nach rechts schauend.
           null = Standard-Zielscheibe.
     hintergrund: JPG 16:9. null = Standard-Himmel. */
  spiel: {
    titel: 'Woo Hunt',
    sekunden: 45,
    munition: 8,
    ziel: null,              // z.B. { src: 'assets/game/ziel.png', frames: 2, fps: 8 }
    hintergrund: null,       // z.B. 'assets/game/hintergrund.jpg'
  },

  /* ---------- TEXTE ---------- */
  texte: {
    heroZeile1: 'One samurai.',
    heroZeile2: 'Zero Japan.',
    heroText: 'Tiny Woo is a one-person game studio making fast, loud, slightly rude little games. Grab a controller, bring snacks.',
    laufband: ['Rocket Trump in development', 'Join the Discord', 'One samurai', 'Zero Japan', 'Highscores open'],
    communityTitel: 'Join the dojo',
    communityText: 'Devlogs, playtests, memes and the occasional existential crisis. The Discord is where it all happens.',
    aboutText1: "I've been making games for 35 years, from placing pixels one by one in the 80s to full 3D. I trained as a commercial artist, taught myself 3D, learned the industry standards along the way and ended up as a technical artist. I've been working in Unity since 2007.",
    aboutText2: "I'm indie. No publisher, no boardroom, no one telling me what a game should be. Arcade games have always been my thing, and Tiny Woo is where I finally make my own.",
    aboutText3: "I'm a composer too, but writing, arranging and producing music has always been too time-consuming and expensive for my games. So, to be upfront: the music is AI-generated, picked and put together by me. AI also helps me with code and parts of the UI. Everything else is handcrafted.",
    footer: '© 2026 Tiny Woo · Made by one guy with a sword',
  },
};
