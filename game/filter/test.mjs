// Tests des Namensfilters: `node --test game/filter/test.mjs`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkName, sanitizeName } from './namefilter.js';

const BLOCK = [
  // Englisch, direkt und verschleiert
  'FUCK', 'fuck', 'F.U.C.K', 'F U C K', 'FUUUCK', 'FVCK', 'PHUCK', 'FUK', 'FUQ', 'FCK', 'F@CK', 'FUCKER', 'FUCKMAX', 'MAXFUCK',
  'MOTHERFUCK', 'SHIT', 'SH1T', '$HIT', 'SHYT', 'SHIIIT', 'SHT', 'BULLSHIT', 'DIPSHIT', 'SHITFUCK', 'BITCH', 'B1TCH', 'BIATCH',
  'BIOTCH', 'BTCH', 'ASS', 'A55', 'ASSES', 'ASSHOLE', 'DUMBASS', 'JACKASS', 'BADASS', 'ASSHAT', 'ASS MAN', 'ARSE', 'ARSEHOLE',
  'CUNT', 'C.U.N.T', 'KUNT', 'CNT', 'TWAT', 'DICK', 'D1CK', 'DICKHEAD', 'COCK', 'C0CK', 'COCKS', 'PUSSY', 'PU55Y', 'PSSY',
  'PUSSYCAT', 'TIT', 'TITS', 'T1TS', 'TITTIES', 'BOOBS', 'B00BS', 'PENIS', 'PEN1S', 'VAGINA', 'ANUS', 'ANAL', 'CUM', 'CUMSHOT',
  'JIZZ', 'WANKER', 'WANK', 'SLUT', 'SLUTTY', 'WHORE', 'WH0RE', 'HOE', 'HOES', 'HO', 'THOT', 'SKANK', 'PIMP', 'PIMPIN',
  'HOOKER', 'PORN', 'P0RN', 'PORNO', 'HENTAI', 'XXX', 'SEX', 'SEXY', 'S3X', 'SEGGS', 'SEXGOD', 'BLOWJOB', 'HANDJOB', 'DILDO',
  'ORGASM', 'HORNY', 'MILF', 'NUDES', 'SENDNUDES', 'SEND NUDES', 'NAKED', 'BOOTY', 'GYATT', 'GOON', 'GOONER', 'FAP', 'FAPPING',
  'BUSSY', 'FEMBOY', 'DTF', 'SUCKMY', 'SUCK MY', 'SUCK IT', 'EAT ME', 'LICK ME', 'BLOW ME', 'BIG DICK', 'BIGDICK', 'FATASS',
  'DOUCHE', 'DOUCHEBAG', 'BASTARD', 'WTF', 'STFU', 'GTFO', 'DAMN', 'CRAP', 'TURD', 'FART', 'POOP', 'BUGGER', 'BOLLOCKS',
  'PRICK', 'KNOBHEAD', 'TOSSER', 'SCUM', 'SCUMBAG', 'LOSER', 'L0SER', 'IDIOT', 'STUPID', 'MORON', 'UGLY', 'SIMP', 'INCEL',
  'CUCK', 'SOYBOY', 'VIRGIN', 'NOLIFE', 'UR MOM', 'URMOM', 'YOUR MOM', 'YOURMOM', 'YO MAMA', 'FUCK YOU', 'FUCKU', 'FUCK U',
  'FUCKOFF', 'SHUT UP', 'SHUTUP', 'GO TO HELL', 'YOU SUCK', 'U SUCK', 'EAT SHIT', 'DIE BITCH', 'DIE NOW', 'U R GAY', 'UR GAY',
  'YOU ARE FAT', 'FAT PIG', 'FATBOY', 'UGLYBITCH',
  // Selbstmord-Hetze
  'KYS', 'K Y S', 'KKYYSS', 'KMS', 'KYSELF', 'KILL YOURSELF', 'KILLURSELF', 'GO DIE', 'GODIE', 'UNALIVE', 'HANG YOURSELF',
  'DRINK BLEACH', 'NECK URSELF', 'SUICIDE', 'END URSELF',
  // Rassismus, Hass, Codes
  'NIGGER', 'N1GGER', 'NIGGA', 'N I G G A', 'NIGGUH', 'NIGG', 'NGGR', 'NIGER', 'SNIGGER', 'NEGER', 'NEGRO', 'KIKE', 'CHINK',
  'GOOK', 'SPIC', 'WETBACK', 'BEANER', 'COON', 'JAP', 'PAKI', 'RAGHEAD', 'TOWELHEAD', 'KANAKE', 'KANACKE', 'ZIGEUNER',
  'SCHLITZAUGE', 'FAGGOT', 'FAG', 'F4G', 'FAGS', 'FGT', 'FAGOT', 'DYKE', 'HOMO', 'TRANNY', 'SHEMALE', 'TROON', 'RETARD',
  'R3TARD', 'RETARDED', 'TARD', 'SPAZ', 'SPASTI', 'SPAST', 'MONGO', 'KRUEPPEL', 'BEHINDERT', 'HITLER', 'H1TLER', 'ADOLF',
  'ADOLF HITLER', 'NAZI', 'NA2I', 'NAZIS', 'NEONAZI', 'SIEG HEIL', 'SIEGHEIL', 'HEIL HITLER', 'HEILHITLER', '1488', '14/88',
  '1 4 8 8', '8814', 'HH88', '88HH', 'HH 88', 'WP14', 'KKK', 'SS', 'WAFFEN SS', 'WAFFENSS', 'SSMANN', 'WHITE POWER',
  'WHITEPOWER', 'WHITEPRIDE', 'SWASTIKA', 'HAKENKREUZ', 'HOLOCAUST', 'HOLOHOAX', 'NSDAP', 'FUHRER', 'HIMMLER', 'GOEBBELS',
  'KILL JEWS', 'KILLJEWS', 'GAS THE JEWS', 'GASTHEJEWS', 'KILL ALL BLACKS', 'DEATH TO GAYS', 'JEWS SCUM', 'MUSLIM PIGS',
  'TERRORIST', 'ISIS', 'JIHAD', 'TALIBAN', 'ALLAHUAKBAR', 'RACE WAR', 'RACEWAR', 'ARYAN', 'ARIER', 'MASTER RACE',
  'JUDENSAU', 'UNTERMENSCH', 'AUSLANDER RAUS', 'GENOCIDE', 'ZOG', 'KLAN',
  // Politik
  'TRUMP', 'MAGA', 'BIDEN', 'PUTIN', 'PUT1N', 'STALIN', 'MERKEL', 'ERDOGAN', 'AFD', 'NPD', 'FPOE', 'ANTIFA', 'QANON',
  'TRUMP2028', 'KICKL', 'OBAMA', 'FREEPALESTINE',
  // Paedo
  'PEDO', 'PAEDO', 'P3DO', 'PEDOPHILE', 'LOLI', 'LOLICON', 'CHILDPORN', 'KINDERSEX', 'JAILBAIT', 'RAPIST', 'RAPE', 'RAPED',
  'GROOMER', 'NONCE', 'MOLEST', 'INCEST',
  // Deutsch
  'ARSCH', 'ARSCHLOCH', 'A R S C H', 'ARSCHGEIGE', 'VOLLARSCH', 'HURE', 'HUREN', 'HURENSOHN', 'HURENS0HN', 'NUTTE', 'FOTZE',
  'F0TZE', 'FOTZEN', 'SCHLAMPE', 'WICHSER', 'WIXER', 'WIXXER', 'FICK', 'FICKEN', 'FICK DICH', 'FICKDICH', 'GEFICKT', 'SCHEISSE',
  'SCHEISS', 'SCHEIßE', 'SCHE1SSE', 'SCHEISSKERL', 'KACKE', 'KACKBRATZE', 'PISSER', 'PISSE', 'MISTSTÜCK', 'DRECKSAU', 'DRECK',
  'DRECKSKERL', 'SAU', 'SAUKERL', 'BLÖDMANN', 'IDIOTEN', 'VOLLIDIOT', 'TROTTEL', 'DEPP', 'DOOF', 'DUMMKOPF', 'PENNER',
  'ASOZIAL', 'ASSI', 'OPFER', 'SPASTI', 'MISSGEBURT', 'SCHWUCHTEL', 'SCHWUL', 'SCHWULI', 'TUNTE', 'LESBE', 'MUSCHI',
  'PIMMEL', 'SCHWANZ', 'SCHWANZLUTSCHER', 'TITTEN', 'MÖSE', 'FUT', 'BUMSEN', 'VÖGELN', 'POPPEN', 'BORDELL', 'PUFF',
  'HARTZER', 'LUTSCHER', 'DEINE MUTTER', 'DEINEMUTTER', 'DEINE MUDDA', 'BRING DICH UM', 'KÜMMELTÜRKE', 'TSCHUSCH',
  'PIEFKE', 'HASS', 'HALTS MAUL', 'FRESSE',
  // andere Sprachen
  'PUTA', 'PUTO', 'HIJO DE PUTA', 'PENDEJO', 'CABRON', 'CABRÓN', 'MIERDA', 'JODER', 'COÑO', 'VERGA', 'PINCHE', 'CHINGA',
  'MARICON', 'MARICÓN', 'GILIPOLLAS', 'MERDE', 'PUTAIN', 'SALOPE', 'CONNARD', 'ENCULÉ', 'ENCULE', 'NIQUE TA MERE', 'NTM',
  'FDP', 'CAZZO', 'MERDA', 'STRONZO', 'VAFFANCULO', 'FIGA', 'PUTTANA', 'MINCHIA', 'COGLIONE', 'CARALHO', 'FODA-SE', 'FODASE',
  'VIADO', 'BUCETA', 'AMK', 'SIKTIR', 'OROSPU', 'YARRAK', 'IBNE', 'PEZEVENK', 'KURWA', 'KURWA MAC', 'CHUJ', 'PIERDOL',
  'JEBAC', 'JEBAĆ', 'SPIERDALAJ', 'DUPA', 'CIPA', 'BLYAT', 'BLYAD', 'CYKA', 'CYKA BLYAT', 'SUKA', 'PIZDA', 'KHUY', 'HUY',
  'PIDOR', 'EBAT', 'MUDAK', 'ZALUPA', 'KANKER', 'KUT', 'KLOOTZAK', 'LUL', 'HOER', 'FITTA', 'KUK', 'SHARMUTA', 'KUSEMEK',
  'MADARCHOD', 'BHENCHOD', 'CHUTIYA', 'GANDU', 'SHIBAL', 'CAONIMA', 'БЛЯТЬ', 'СУКА', 'FUСK', 'ΑSS',
  // Drogen
  'COCAINE', 'COKE', 'CRACK', 'CRACKHEAD', 'METH', 'METHHEAD', 'HEROIN', 'JUNKIE', 'WEED', 'W33D', 'GANJA', 'KUSH', 'MDMA',
  'LSD', 'XANAX', 'FENTANYL', 'KIFFER', 'KOKS', 'DOPE', 'BONG', 'BLUNT', '420', 'STONER', 'POTHEAD',
  // Spam, Links, reserviert
  'WWW.X.COM', 'HTTP', 'MAX.DE', 'MAX.COM', 'X.XYZ', 'DISCORD.GG', 'BIT.LY', 'ONLYFANS', 'PORNHUB', 'TELEGRAM', 'TIKTOK',
  'FREE VBUCKS', 'FREEVBUCKS', 'FREE ROBUX', 'FREE MONEY', 'GIVEAWAY', 'CASINO', 'VIAGRA', 'AAAAAAA', 'XXXXXXX', '!!!!!!',
  'ADMIN', 'ADM1N', 'ADMIN1', 'XADMINX', 'MOD', 'MODERATOR', 'STAFF', 'SYSTEM', 'OWNER', 'TINYWOO', 'TINY WOO', 'DAIGANOID',
  'OFFICIAL', 'SUPPORT', 'TAITO', 'ARKANOID', 'NULL', 'UNDEFINED',
  // Leer
  '', '   ', '...', '?!', '###', 'ÄÖÜ'.replace(/[ÄÖÜ]/g, '*'),
];

const PASS = [
  'MAX', 'ALEX88', 'ALEX 88', 'SASCHA', 'SAM', 'TITUS', 'NICK', 'COOKIE', 'PIXELKING', 'RETROFAN', 'GHOST', 'KILLER',
  'DEATH', 'BOOM', 'NINJA', 'DRAGON', 'WOLF', 'BLITZ', 'PASCAL', 'ANNA', 'LISA', 'TOM', 'JULIA', 'MARKUS', 'STEFAN',
  'WOLFGANG', 'HANS', 'FRITZ.K', 'PLAYER ONE', 'PLAYER 1', 'P1', '1337', '2026', '1987', 'ARKA FAN', 'DOH', 'VAUS',
  'RETRO', 'PIXEL', 'AMIGA', 'C64', 'WIEN', 'WIENER', 'BERLIN', 'HAMBURG', 'MUENCHEN', 'TIROL', 'ASSASSIN', 'ASSASSINS',
  'CLASSIC', 'CLASS', 'BASS', 'GRASS', 'PASS', 'MASS', 'HASSAN', 'CASSIE', 'COCKPIT', 'PEACOCK', 'HANCOCK', 'HITCHCOCK',
  'SCUNTHORPE', 'PENISTONE', 'SEXTON', 'SEXTANT', 'ESSEX', 'SUSSEX', 'MIDDLESEX', 'ANALYST', 'ANALOG', 'ARSENAL', 'TITAN',
  'TITLE', 'BUTTON', 'BUTTER', 'SHIITAKE', 'CUMBERLAND', 'DICKENS', 'MATSUSHITA', 'THERAPIST', 'NIGHT', 'KNIGHT',
  'ANUSHKA', 'URANUS', 'ASSEL', 'KASSEL', 'ASSISI', 'SPASS', 'PICASSO', 'LASSE', 'TASSE', 'WASSER', 'STRASSE', 'GASSE',
  'KLASSE', 'HESSEN', 'ESSEN', 'SCHMUCK', 'FAHRT', 'KUSS', 'HELLO', 'NIGERIA', 'MONTENEGRO', 'MARSCH', 'SATURDAY',
  'BASEMENT', 'SIMPSON', 'PIMPLE', 'SCRAP', 'SNIPER', 'HOBBIT', 'HOBBY', 'MUFFIN', 'JAPAN', 'PAKISTAN', 'SPICY',
  'RACCOON', 'TYCOON', 'HOMER', 'METHOD', 'OXYGEN', 'ALBUM', 'SPEEDY', 'SPEEDRUN', 'CRYSTALS', 'MOSES', 'FUTURE', 'PUFFIN',
  'RUCKSACK', 'HUNDRED', 'DUMMY', 'HOLA', 'HOHOHO', 'TITO', 'LULU', 'TRUTH', 'KUKU', 'CASSANDRA', 'MR X', 'DR WHO', 'GO!',
  'YES', 'NO WAY', 'WIN', 'PRO GAMER', 'GG', 'EZ', 'NOOB', 'BOT', 'SUS', 'RIZZ', 'SKIBIDI', 'SIGMA', 'OHIO', 'BRUH', 'LOL',
  'XD', 'OMG', 'GOAT', 'KING', 'QUEEN', 'LEGEND', 'ACE', 'ZERO', 'ONE', 'NEO', 'LUNA', 'MAUS', 'KATZE', 'HUNDE', 'FROSCH',
  'BAER', 'TIGER', 'LION', 'HAWK', 'EAGLE', 'SHARK', 'ORCA', 'A.B.C', 'J.R.', 'MC HAMMER', 'DJ BOBO', 'ABBA', 'KISS ME',
  'HI MOM', 'MOM', 'DAD', 'OPA', 'OMA', 'FAMILY', 'LOVE', 'PEACE', 'HAPPY', 'LUCKY', 'TURBO', 'NITRO', 'LASER', 'MEGA',
  'ULTRA', 'HYPER', 'ARCADE', 'HIGHSCORE', 'ROUND 32', 'LEVEL 1', 'TOP TEN', 'NUMBER 1', 'NO 1', '007', '42', '99', '88',
  '18', '28', 'THE END', 'GAME OVER', 'INSERT COIN', 'MARCH', 'SUCKERPUNCH', 'GOONDOCKS', 'KYSER', 'TITI', 'HOLLA', 'BLODE',
];

test('Sanitize', () => {
  assert.equal(sanitizeName(' max  mustermann '), 'MAX MUSTER');
  assert.equal(sanitizeName('Äöü ß é'), 'AOU SS E');
  assert.equal(sanitizeName('a@b#c$d'), 'ABCD');
  assert.equal(sanitizeName('hey!? ok.'), 'HEY!? OK.');
  assert.equal(sanitizeName('ＦＵＬＬ'), 'FULL');
  assert.equal(sanitizeName(''), '');
  assert.equal(sanitizeName(null), '');
});

test('Gesperrte Namen werden abgelehnt', () => {
  const missed = BLOCK.filter((n) => checkName(n).ok);
  assert.deepEqual(missed, [], `durchgerutscht: ${missed.join(', ')}`);
});

test('Harmlose Namen bleiben erlaubt', () => {
  const wrong = PASS.filter((n) => !checkName(n).ok).map((n) => `${n} (${checkName(n).reason}: ${checkName(n).match})`);
  assert.deepEqual(wrong, [], `faelschlich gesperrt: ${wrong.join(', ')}`);
});

test('Gruende stimmen', () => {
  assert.equal(checkName('').reason, 'empty');
  assert.equal(checkName('WWW.X.COM').reason, 'spam');
  assert.equal(checkName('ADMIN').reason, 'reserved');
  assert.equal(checkName('NIGGER').reason, 'slur');
  assert.equal(checkName('HITLER').reason, 'hate');
  assert.equal(checkName('TRUMP').reason, 'politics');
  assert.equal(checkName('KYS').reason, 'selfharm');
  assert.equal(checkName('PORN').reason, 'sexual');
  assert.equal(checkName('SHIT').reason, 'profanity');
  assert.equal(checkName('LOSER').reason, 'harassment');
  assert.equal(checkName('COCAINE').reason, 'drugs');
  assert.equal(checkName('max').name, 'MAX');
});

test('Allowlist ist nicht durch Anhaengen umgehbar', () => {
  for (const n of ['CLASSICFUCK', 'ASSASSINCUNT', 'ASSASSIN CUNT', 'BASS SHIT', 'TITAN DICK', 'ESSEX FUCK']) assert.equal(checkName(n).ok, false, n);
});

test('Schnell genug', () => {
  const names = [...BLOCK, ...PASS];
  const t0 = performance.now();
  for (let i = 0; i < 10000; i++) checkName(names[i % names.length]);
  const ms = performance.now() - t0;
  assert.ok(ms < 3000, `10000 Pruefungen in ${ms.toFixed(0)} ms`);
});
