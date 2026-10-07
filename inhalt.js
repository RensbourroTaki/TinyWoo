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
    kontaktFormKey: 'a95235b3-d5b6-4cfc-9213-7161abaa0399',      // Web3Forms Access Key (kostenlos auf web3forms.com mit deiner E-Mail holen)
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

  /* ---------- DAIGANOID (Arcade-Seite) ----------
     Das Spiel selbst liegt in game/ und assets/daiganoid/ (siehe ANLEITUNG, Punkt 7).
     musikMenue / musikHighscore / musikSpiel: OGG nach assets/daiganoid/music/ hochladen und hier eintragen ('' = keine Musik).
     apiUrl: Adresse des Highscore-Servers (Cloudflare Worker, ANLEITUNG Punkt 8). '' = nur lokale Liste im Browser.
     header: Kopf der Arcade-Seite. story: linke Spalte, ein Block = Zwischenueberschrift + Absatz (titel weglassen = nur Absatz). */
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
      { text: 'I\'ve brought my old Arkanoid fan project, DAIGANOID, back to life using the original assets I created around 2000. Back then, together with an old friend and programmer, I built a polished beta of the game for the iPAQ, one of the Pocket PCs of that era. But life took us both in different directions, and the game was never finished.' },
      { text: 'I\'m especially proud of the 360-degree spinning letters of my bitmap font. I pixelled and polished them over quite a few late nights.' },
      { text: 'I hope you enjoy this version! Over time I plan to add bosses, a level editor and more, though I mustn\'t forget the other games I still want to make ;)' },
      { text: 'Have fun!' },
      { text: 'And thank you, TAITO, for one of the best gameplay loops ever created!' },
    ],
  },

  /* ---------- TEXTE ---------- */
  texte: {
    heroZeile1: 'One samurai.',
    heroZeile2: 'Zero Japan.',
    heroText: 'Tiny Woo is a one-person game studio making fast, loud, slightly rude little games. Grab a controller, bring snacks.',
    laufband: ['Rocket Trump in development', 'Play Daiganoid in the arcade', 'Join the Discord', 'One samurai', 'Zero Japan', 'Highscores open'],
    communityTitel: 'Join the dojo',
    communityText: 'Devlogs, playtests, memes and the occasional existential crisis. The Discord is where it all happens.',
    // About-Seite: Bausteine in Reihenfolge. { h } = Zwischenüberschrift, { p } = Absatz, { liste } = Aufzählung, { schluss } = Schlusssatz.
    about: [
      { h: "Here's my story:" },
      { p: "As a kid, I started pixeling game assets on the Amiga at the age of 13. Later I worked for some local developers of the time, which was a big joke in my country, and moved pretty quickly over to 3D. During that time I attended the Graphic Institute of Vienna and learned all the commercial art and design tricks, from layout to typography etc., but I never felt cosy in such working environments. Game development has always been my thing, and it still is today. Over time I learned the technical aspects and how game systems and mechanics work. I also learned the industry standards in modelling, texturing, rigging, hand weight painting etc. – the whole 3D pipeline palette, so I could create my own assets too. Dynabot The Robo Marble was one of our first attempts back in 2013, but I had to put the Kickstarter for the project on ice because I burned out after doing most of the work on the project myself." },
      { p: "However, alongside my artistic skills, I increasingly specialized in game optimization, gameplay dynamics, technical solutions and other aspects of game development." },
      { p: "And now we have AI, which makes it possible for me to develop faster, more precisely and bug-free, and to realize all the visions I've always chased. What I do is take my knowledge and direct the AI through the exact steps and the technical approach I want for each part/module of the game. That means every game takes a minimum of six months to design and build from scratch, even if we're only talking about a small gameplay loop with all the necessary things around it." },
      { h: 'What do I use AI for when creating my games?' },
      { liste: [
        'Code support',
        'Tools for the game',
        'Shaders',
        "Background music (IF it sounds acceptable – hard choices!), because I won't go down the composer route anymore, since it takes more time than anything else! (I compose & arrange with Studio One and VSTs, but it takes tooooooo long to write a good track/song. Have mercy!)",
        "Certain UI icons (I'm much more effective when I don't have to pixel them anymore, because that takes a lot of time too.)",
      ] },
      { p: "Everything else is either made by me or is a purchased asset, which I mostly modify and/or adapt to fit the game visually and performance-wise. Or it's an asset from an artist whose work I simply love, because it fits the game better than what I would've made." },
      { p: "I hope you can see the quality in my games and the effort I put into each one, and that you don't call it slop right away, because that is exactly what I don't want to deliver – and never will!" },
      { p: "One more thing I want to add: I'd rather take my time fighting with the gameplay mechanics until they work the way I want them to than record and edit workflow videos for YouTube or Reddit, which was never my thing. Now this place is here to offer everyone a docking bay for fun and well-developed games." },
      { schluss: 'I hope you have fun with my games.' },
    ],
    footer: '© 2026 Tiny Woo · Made by one guy with a sword',
  },
};
