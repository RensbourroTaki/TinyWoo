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
    email: 'tinywoogames@gmail.com',
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
    { title: 'Rocket Trump — Main Menu', artist: 'Tiny Woo', duration: 154 /*, src: 'assets/music/main-menu.ogg' */ },
    { title: 'Jungle Hangar',            artist: 'Tiny Woo', duration: 201 },
    { title: 'Tiger Gang Theme',         artist: 'Tiny Woo', duration: 132 },
    { title: 'Highscore Boogie',         artist: 'Tiny Woo', duration: 178 },
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
      ['Contact',   'tinywoogames@gmail.com'],
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
    aboutText1: 'Tiny Woo is one person: designer, coder, artist, composer, QA, marketing department and coffee machine operator.',
    aboutText2: "A samurai — not from Japan — building small, fast games that don't take themselves too seriously. Everything here is made solo.",
    footer: '© 2026 Tiny Woo · Made by one guy with a sword',
  },
};
