// Wortlisten des Namensfilters fuer die Highscore-Liste. Hier erweitern, nicht in namefilter.js.
//
// Regeln fuer Eintraege:
//  - Nur GROSSBUCHSTABEN A-Z. Umlaute/Akzente werden vorher vereinfacht (Ä→A, Ö→O, Ü→U, ß→SS, É→E ...),
//    Ziffern im Namen werden fuer die Pruefung zu Buchstaben (0→O, 1→I/L, 2→Z, 3→E, 4→A, 5→S, 6→G, 7→T, 8→B, 9→G).
//    Deshalb Woerter hier OHNE Ziffern schreiben (Ausnahme: CODES).
//  - Wiederholte Buchstaben werden automatisch toleriert (FUUUCK = FUCK), Trennzeichen auch (F.U.C.K = FUCK).
//  - SUBSTRING: ueberall im Namen verboten, auch mitten in anderen Woertern (fuer eindeutige Begriffe).
//    Harmlose Woerter, die so einen Begriff enthalten, gehoeren in ALLOW (z. B. ASSASSIN, SCUNTHORPE).
//  - WORD: nur als eigenes Wort verboten, auch mit Vor-/Nachsilben aus PREFIXES/SUFFIXES (ASS, ASSES, DUMBASS,
//    ASSHOLE), aber nicht mitten in anderen Woertern (BASS, CLASS, PASS bleiben erlaubt).
//  - PATTERNS: regulaere Ausdruecke auf den zusammengezogenen Namen (ohne Leerzeichen), Buchstaben mit + schreiben
//    (K+Y+S+ trifft KYS, KKYYSS, K Y S).
//  - Kategorien (reason): slur, hate, selfharm, sexual, profanity, harassment, drugs. Reihenfolge = Gewicht.
//
// Haltung des Betreibers: lieber zu streng als zu lasch. Bewusst gesperrt sind auch Grenzfaelle wie DICK, COCK,
// NIGER, SNIGGER, FAGOT, HASS, DEPP, OPFER, 69 (als eigenes Wort), WTF, DAMN.

export const SUBSTRING = {
  slur: [
    'NIGG', 'NIGA', 'NIGLET', 'NEGER', 'NEGERLEIN', 'NEGRE', 'KIKE', 'CHINK', 'GOOK', 'WETBACK', 'RAGHEAD', 'TOWELHEAD',
    'KAFFIR', 'KAFFER', 'KANAK', 'KANACK', 'ZIGEUNER', 'TRANNY', 'TRANNIE', 'SHEMALE', 'FAGGOT', 'FAGOT', 'FAGIT',
    'RETARD', 'SCHWUCHTEL', 'LESBO', 'JUDENSAU', 'SAUJUDE', 'DRECKSJUDE', 'ITAKER', 'SCHLITZAUGE', 'KUMMELTURKE',
    'KAMELTREIBER', 'UNTERMENSCH', 'MISCHLING', 'SPASTI', 'KRUPPEL', 'KRUEPPEL', 'BEHINDERT', 'BEHINDI', 'MISSGEBURT',
    'MISGEBURT', 'MONGOL', 'MONGOID', 'WIGGER', 'WIGGA', 'TSCHUSCH', 'BOUGNOULE', 'BAMBOULA', 'MARICON', 'FROCIO',
    'RICCHIONE', 'SCHWULI', 'KAMPFLESBE', 'TRANSE', 'MUZZIE', 'DYKES', 'TROONS', 'HALFBREED', 'MULATTO', 'SAMBO',
    'JIGABOO', 'PORCHMONKEY', 'ZIPPERHEAD', 'SLANTEYE', 'CAMELJOCKEY', 'SANDNIG', 'CURRYMUNCH',
    'GYPPO', 'PIKEY', 'HEEB', 'HYMIE', 'CHRISTKILLER', 'POLACK', 'DAGO',
  ],
  hate: [
    'HITLER', 'NAZI', 'SIEGHEIL', 'SIGHEIL', 'HEILHITLER', 'HAILHITLER', 'WHITEPOWER', 'WHITEPRIDE', 'SWASTIKA',
    'HAKENKREUZ', 'HOLOCAUST', 'HOLOHOAX', 'GASCHAMBER', 'GASKAMMER', 'WAFFENSS', 'SSMANN', 'SSOFFIZ', 'SSTRUPP',
    'NSDAP', 'FUHRER', 'FUEHRER', 'THIRDREICH', 'DRITTESREICH', 'REICHSKANZLER', 'GOEBBELS', 'HIMMLER', 'MENGELE',
    'EICHMANN', 'AUSCHWITZ', 'TREBLINKA', 'ZYKLONB', 'JUDENFREI', 'JUDENHASS', 'JUDENVERNICHT', 'ENDLOSUNG', 'ENDLOESUNG',
    'LEBENSRAUM', 'BLUTUNDEHRE', 'BLOODANDHONOUR', 'RAHOWA', 'RACEWAR', 'GENOCID', 'GENOZID', 'ETHNICCLEANS',
    'WHITEGENOCIDE', 'KUKLUX', 'KLANSMAN', 'LYNCHING', 'ARYANBROTHER', 'ARISCHE', 'HERRENRASSE', 'MASTERRACE',
    'JEWSDID', 'KILLTHEJEWS', 'GASTHEJEWS', 'DEATHTOJEWS', 'HAMASFAN', 'ISISFAN', 'ALLAHUAKBAR', 'ALLAHUAKBAR',
    'JIHAD', 'DSCHIHAD', 'TERRORIST', 'TALIBAN', 'ALQAEDA', 'ALQAIDA', 'ALKAIDA', 'DAESH', 'BINLADEN', 'ISLAMIST',
    'KUFFAR', 'TRUMPISHITLER', 'KILLALL', 'DEATHTOALL', 'HANGALL', 'GASALL',
  ],
  selfharm: [
    'UNALIVE', 'KILLYOURSELF', 'KILLURSELF', 'KILLYASELF', 'KYSELF', 'KYSBITCH', 'SUICID', 'SELBSTMORD', 'SELFHARM',
    'DRINKBLEACH', 'EATBLEACH', 'NECKYOURSELF', 'NECKURSELF', 'HANGYOURSELF', 'HANGURSELF', 'ENDYOURSELF', 'ENDURSELF',
    'SLITYOURWRIST', 'SLITURWRIST', 'JUMPOFFABRIDGE', 'GODIEINAFIRE', 'BRINGDICHUM', 'HANGDICH', 'ERHANGDICH',
    'SCHOOLSHOOT', 'SHOOTUPASCHOOL', 'MASSSHOOT', 'AMOKLAUF',
  ],
  sexual: [
    'FUCK', 'FUCC', 'FVCK', 'PHUCK', 'FUKK', 'FOCK', 'FICK', 'FIKK', 'FIK', 'GEFICKT', 'PORN', 'PORNO', 'HENTAI', 'XXX',
    'ORGASM', 'CUMSHOT', 'BUKKAKE', 'BLOWJOB', 'HANDJOB', 'RIMJOB', 'FELLATIO', 'CUNNILING', 'GANGBANG', 'DEEPTHROAT',
    'ANALSEX', 'BUTTSEX', 'SEXTAPE', 'DILDO', 'FLESHLIGHT', 'ONLYFANS', 'PORNHUB', 'XVIDEOS', 'XHAMSTER', 'REDTUBE',
    'BRAZZERS', 'CAMGIRL', 'CAMWHORE', 'SEXCAM', 'HOOKER', 'WHORE', 'HURE', 'HUREN', 'NUTTE', 'FOTZ', 'MUSCHI', 'PIMMEL',
    'SCHWANZ', 'SCHWANZLUTSCH', 'WICHS', 'WIXER', 'WIXXER', 'WIXA', 'ARSCHLOCH', 'BLASEN', 'SCHLAMPE', 'HURENSOHN',
    'FLITTCHEN', 'BORDELL', 'BUMSEN', 'VOGELN', 'POPPEN', 'ONANIE', 'MASTURB', 'JERKOFF', 'JACKOFF', 'HORNY', 'PENIS',
    'VAGINA', 'VULVA', 'CLIT', 'PUSSY', 'PUSSIES', 'CUNT', 'TWAT', 'SLUT', 'SKANK', 'JIZZ', 'SMEGMA', 'SPERM', 'SCROTUM',
    'BALLSACK', 'NUTSACK', 'TESTICLE', 'TITS', 'TITTIES', 'TITTY', 'TITTE', 'BOOB', 'NIPPLE', 'ANUS', 'RECTUM',
    'BUTTHOLE', 'BUTTPLUG', 'DOUCHE', 'DICK', 'SCHLONG', 'CAMELTOE', 'QUEEF', 'BOLLOCK', 'BOLLOX', 'BELLEND', 'MUFFDIVE',
    'PERVERT', 'MOLEST', 'INCEST', 'BESTIALITY', 'BEASTIALITY', 'ZOOPHIL', 'SODOMIE', 'SODOMY', 'NECROPHIL', 'GOLDENSHOWER',
    'FISTING', 'MILF', 'DILF', 'GILF', 'SUGARDADDY', 'CUMDUMP', 'CUMSLUT', 'CUMMING', 'CUMMER', 'SEX', 'SEGGS', 'SECKS',
    'SEXI', 'NUDE', 'NAKED', 'BUSSY', 'FEMBOY', 'GOONING', 'FAPP', 'FAPING', 'PEDO', 'PAEDO', 'PEDOPHIL', 'PADOPHIL',
    'LOLI', 'LOLICON', 'SHOTACON', 'CHILDPORN', 'CHILDSEX', 'KIDSEX', 'KINDERSEX', 'KINDERFICK', 'KINDERPORNO',
    'JAILBAIT', 'UNDERAGE', 'PRETEEN', 'TEENSEX', 'RAPIST', 'VERGEWALTIG', 'GROOMING', 'PUTA', 'PUTAIN', 'PENDEJO',
    'MIERDA', 'JODETE', 'CHINGA', 'GILIPOLLAS', 'PELOTUDO', 'CHUPAME', 'MAMAHUEVO', 'MAMAGUEVO', 'MALPARIDO', 'MERDE',
    'SALOPE', 'CONNARD', 'CONNASSE', 'ENCULE', 'NIQUETAMERE', 'COUILLE', 'BRANLEUR', 'CAZZ', 'MERDA', 'STRONZ',
    'VAFFANCULO', 'FANCULO', 'PUTTAN', 'MINCHIA', 'COGLION', 'PORCODIO', 'DIOCANE', 'PORCAMADONNA', 'CARALH', 'FODASE',
    'BUCETA', 'BOCETA', 'PIROCA', 'ARROMBADO', 'VAGABUNDA', 'SAPATAO', 'AMINAKOY', 'AMINAKODUM', 'SIKTIR', 'SIKERIM',
    'SIKEY', 'SIKER', 'SIKTI', 'ORUSPU', 'OROSPU', 'PEZEVENK', 'GOTVEREN', 'YARRAK', 'YARAK', 'GERIZEKALI', 'ANANISIK',
    'KURW', 'CHUJ', 'PIERDOL', 'JEBAC', 'JEBAN', 'PIZDA', 'SPIERDALAJ', 'DZIWKA', 'BLYAT', 'BLYAD', 'BLIAT', 'KHUY',
    'HUYLO', 'YOBANY', 'EBANY', 'PIDOR', 'PIDAR', 'GANDON', 'MUDILA', 'ZALUPA', 'SHLYUKHA', 'SHLUHA', 'KANKER', 'KLOOTZAK',
    'GODVER', 'FLIKKER', 'NEUKEN', 'FITTA', 'KUKSUGER', 'SHARMUTA', 'SHARMOOTA', 'KUSEMEK', 'KUSUMMAK', 'MADARCHOD',
    'BEHENCHOD', 'BHENCHOD', 'CHUTIYA', 'CHUTIYE', 'GAANDU', 'HARAMZADA', 'BHOSDI', 'SSIBAL', 'GAESAEKKI', 'BYUNGSHIN',
    'BYEONGSIN', 'CAONIMA', 'TAMADE', 'CYKA', 'SUKABLYAT',
  ],
  profanity: [
    'SHIT', 'SHYT', 'SHIET', 'SCHEISS', 'SCHEIS', 'SCHEIZ', 'BITCH', 'BIATCH', 'BIOTCH', 'BYTCH', 'BASTARD', 'MOTHERFUCK',
    'BULLSHIT', 'DOGSHIT', 'HORSESHIT', 'APESHIT', 'ASSHOLE', 'AHOLE', 'ARSEHOLE', 'ARSCH', 'DRECKSAU', 'DRECK', 'PISSE',
    'PISSER', 'PISSNELKE', 'SACKGESICHT', 'SACKRATTE', 'MISTSTUCK', 'MISTKERL', 'SAUKERL', 'SAUHUND', 'FETTSACK',
    'BLODMANN', 'SCHWACHKOPF', 'HOHLKOPF', 'VOLLHORST', 'VOLLPFOSTEN', 'VOLLIDIOT', 'IDIOT', 'TROTTEL', 'PENNER',
    'ASOZIAL', 'LUTSCHER', 'HOSENSCHEISSER', 'SCHLUCHTENSCHEISSER', 'COCK', 'DOUCHEBAG', 'SCUMBAG', 'DIRTBAG', 'SLEAZEBAG',
    'HALTSMAUL', 'HALTDEINMAUL', 'HALTDIEFRESSE', 'HALTSFRESSE', 'FRESSEHALTEN', 'MAULHALTEN', 'VERPISSDICH', 'LECKMICH',
    'LECKMICHAMARSCH', 'KUSSMEINENARSCH', 'KISSMYASS', 'BITEME', 'SCREWYOU',
    'WANKER', 'TOSSER', 'KNOBHEAD', 'DICKHEAD', 'SHITHEAD', 'FUCKFACE', 'SHITFACE', 'BUTTFACE', 'FUCKWIT', 'DIPSHIT',
    'JACKASS', 'DUMBASS', 'FATASS', 'BADASS', 'KISSASS', 'SMARTASS', 'LAMEASS', 'HARDASS', 'ASSWIPE', 'ASSHAT', 'ASSCLOWN',
    'ASSMUNCH', 'ASSLICK', 'ARSCHGEIGE', 'ARSCHKRIECHER', 'ARSCHGESICHT', 'KACKBRATZE', 'KACKVOGEL', 'HURENKIND',
    'BASTARDO', 'STRONZO', 'CABRON', 'CABRONA', 'PUTO', 'PUTOS', 'CULERO', 'HIJODEPUTA', 'FILHODAPUTA', 'FDP', 'MOFO',
    'MOTHAFUCK', 'MUTHAFUCK', 'FUCKER', 'FUKKER', 'FUCKIN', 'FUCKING', 'FCUK', 'FUXK', 'FUQK', 'PHUQ',
  ],
  harassment: [
    'LOWLIFE', 'WHITETRASH', 'TRAILERTRASH', 'HOODRAT', 'DEADBEAT', 'FREELOADER', 'STREETWALKER', 'CALLGIRL', 'CRACKWHORE',
    'INCEL', 'CUCKOLD', 'CUCK', 'SOYBOY', 'DEGENERATE', 'LOOSER', 'NOLIFE', 'URMOM', 'YOURMOM', 'YOMAMA', 'YOURMUM',
    'URMUM', 'YOURMOTHER', 'DEINEMUTTER', 'DEINEMUDDA', 'DEINEMUDDER', 'DEINEMAMA', 'MUDDAFICK', 'GOTOHELL', 'GOHELL',
    'SHUTUP', 'FUCKOFF', 'PISSOFF', 'FUCKYOU', 'FUCKU', 'SCREWYOU', 'EATSHIT', 'EATDIRT', 'YOUSUCK', 'USUCK', 'UGLYBITCH',
    'FATPIG', 'FATCOW', 'FATFUCK', 'FATSO', 'LARDASS', 'WHITEBOY', 'WHITEGIRL', 'BLACKBOY', 'COLOREDS', 'NAZIPIG',
  ],
  drugs: [
    'COCAINE', 'KOKAIN', 'CRYSTALMETH', 'METHHEAD', 'CRACKHEAD', 'HEROIN', 'JUNKIE', 'KIFFER', 'KIFFEN', 'FENTANYL',
    'FENTA', 'DRUGDEALER', 'DRUGLORD', 'TRAPHOUSE', 'MARIJUANA', 'MARIHUANA', 'CANNABIS', 'XANAX', 'XANNY', 'SHROOMS',
    'NARCO', 'CARTEL', 'WEEDMAN', 'DOPEHEAD', 'STONER', 'POTHEAD', 'COKEHEAD', 'PILLHEAD', 'SMACKHEAD',
  ],
};

export const WORD = {
  slur: [
    'SPIC', 'COON', 'JAP', 'PAKI', 'BEANER', 'FAG', 'FAGS', 'DYKE', 'HOMO', 'HOMOS', 'MONGO', 'SPAZ', 'SPAST', 'SCHWUL',
    'TUNTE', 'TUNTEN', 'LESBE', 'LESBEN', 'BIMBO', 'ARYAN', 'ARIER', 'NIGER', 'NEGRO', 'NEGROS', 'KLAN', 'ADOLF',
    'TROON', 'GROOMER', 'GIMP', 'CRIPPLE', 'MIDGET', 'TARD', 'TARDS', 'SPERG', 'AUTIST', 'DOWNIE', 'MONG', 'CHINAMAN',
    'INJUN', 'REDSKIN', 'SQUAW', 'GRINGO', 'HONKY', 'CRACKA', 'REDNECK', 'HILLBILLY', 'CHAV', 'PIEFKE', 'KANAKE',
    'PEDE', 'YOUPIN', 'FEUJ', 'BICOT', 'BOCHE', 'MARICA', 'MARIKON', 'ZHID', 'ZHYD', 'HOHOL', 'KATSAP', 'MOSKAL', 'CHURKA',
    'KHACH', 'DAUN', 'DEBIL', 'IBNE', 'GAVAT', 'KAFIR', 'CWEL', 'CIOTA', 'SHIBAL', 'SIBAL', 'VIADO', 'VEADO', 'BICHA',
  ],
  hate: ['KKK', 'SS', 'ZOG', 'ISIS', 'ISIL', 'HAMAS', 'ANTIFA', 'WP', 'HH', 'NSU', 'KZ', 'WAFFEN'],
  // Politik: Namen, Parteien, Parolen. Keine Politik auf der Liste, egal welche Richtung.
  politics: [
    'TRUMP', 'MAGA', 'BIDEN', 'OBAMA', 'CLINTON', 'HARRIS', 'VANCE', 'MUSK', 'PUTIN', 'STALIN', 'LENIN', 'MAO', 'XI',
    'KIMJONGUN', 'ERDOGAN', 'ORBAN', 'NETANYAHU', 'BIBI', 'ZELENSKY', 'SELENSKY', 'SELENSKYJ', 'MERKEL', 'SCHOLZ', 'MERZ',
    'HABECK', 'WEIDEL', 'HOCKE', 'HOECKE', 'KICKL', 'STRACHE', 'KURZ', 'LEPEN', 'MACRON', 'MELONI', 'MILEI', 'MODI',
    'BOLSONARO', 'LULA', 'MUSSOLINI', 'FRANCO', 'CASTRO', 'CHAVEZ', 'MADURO', 'ASSAD', 'KHAMENEI', 'GADDAFI', 'SADDAM',
    'AFD', 'NPD', 'FPO', 'FPOE', 'SPO', 'SPOE', 'OVP', 'OEVP', 'CDU', 'CSU', 'SPD', 'GRUNE', 'GRUENE', 'LINKE', 'BSW',
    'QANON', 'BLM', 'WOKE', 'ANTIWOKE', 'KOMMUNIST', 'COMMUNIST', 'COMMIE', 'FASCHIST', 'FASCIST', 'ZIONIST',
    'FREEPALESTINE', 'FROMTHERIVER', 'SHARIA', 'SCHARIA', 'JIHADI', 'REMIGRATION', 'PEGIDA', 'IDENTITARE', 'REICHSBURGER',
  ],
  selfharm: ['KYS', 'KMS', 'KYSS', 'GODIE', 'DIEBITCH', 'NOOSE', 'SUICIDE', 'SUIZID'],
  sexual: [
    'ANAL', 'RAPE', 'RAPED', 'RAPES', 'RAPER', 'ESCORT', 'VIBRATOR', 'STRIPPER', 'BDSM', 'KINKY', 'FETISH', 'SEMEN',
    'CUM', 'CUMS', 'WANK', 'BONER', 'DONG', 'CAWK', 'PUSS', 'TIT', 'TITZ', 'BUTT', 'BUTTS', 'ARSE', 'ASS', 'ASSES', 'KUNT',
    'HOE', 'HOES', 'HO', 'HOS', 'THOT', 'THOTS', 'PIMP', 'JIZ', 'SPUNK', 'BALLS', 'GOOCH', 'MINGE', 'KNOB', 'PRICK',
    'MUFF', 'NONCE', 'PERV', 'NECRO', 'SCAT', 'BOOTY', 'NSFW', 'SEKS', 'DTF', 'BBW', 'GYATT', 'GYAT', 'GOON', 'GOONER',
    'EDGING', 'FAP', 'FUK', 'FUQ', 'PHUK', 'FCK', 'FACK', 'FKK', 'MOPSE', 'FUT', 'PUFF', 'RAMMELN', 'TITTEN',
    'MOESE', 'SACK', 'EIER', 'SCHLAMPEN', 'LUDER', 'TUSSI', 'TUSSE', 'ZICKE', 'CONO', 'CULO', 'VERGA', 'PINCHE', 'POLLA',
    'TETAS', 'CONCHA', 'PIJA', 'BOLUDO', 'ZORRA', 'PERRA', 'CHUPA', 'HUEVON', 'WEBON', 'PUTE', 'NIQUE', 'NTM', 'CHATTE',
    'BAISE', 'BAISER', 'BRANLE', 'FIGA', 'FICA', 'TROIA', 'PORRA', 'FODA', 'FODER', 'CACETE', 'CORNO', 'VADIA', 'AMK',
    'SIKIM', 'SIK', 'TASAK', 'KAHPE', 'SURTUK', 'DUPA', 'DUPEK', 'CIPA', 'KUTAS', 'SUKA', 'SUKIN', 'SZMATA', 'BLYA',
    'HUY', 'HUESOS', 'EBAT', 'YEBAT', 'EBLAN', 'PIDR', 'PEDIK', 'MUDAK', 'CHMO', 'KUT', 'LUL', 'HOER', 'NEUK', 'TRUT',
    'SLET', 'MIETJE', 'KUK', 'PIKK', 'KHARA', 'CHOOT', 'GANDU', 'HARAMI', 'SHABI', 'WOCAO', 'SIXTYNINE', 'XXXX',
  ],
  profanity: [
    'SHT', 'BTCH', 'BICH', 'CNT', 'DCK', 'PSSY', 'FGT', 'NGGR', 'WTF', 'STFU', 'GTFO', 'FFS', 'LMFAO', 'DAMN',
    'GODDAMN', 'CRAP', 'CRAPPY', 'TURD', 'POOP', 'FART', 'BUGGER', 'BUM', 'SCUM', 'SLEAZE', 'KACKE', 'KACK', 'KOTZE',
    'FURZ', 'FURZEN', 'SAU', 'DEPP', 'DOOF', 'DUMM', 'BLOD', 'LAPPEN', 'OPFER', 'HARTZER', 'KOTER', 'ASSI',
    'ASSIS', 'WICHSER', 'STRONZA', 'JODER', 'SALAUD', 'VAFFA', 'GOWNO', 'TERING', 'TYFUS', 'JAVLA', 'KUSO', 'SHAIT',
    'FRESSE', 'MAUL', 'YID',
  ],
  harassment: [
    'LOSER', 'LOSERS', 'IDIOTS', 'STUPID', 'DUMB', 'MORON', 'IMBECILE', 'DUMBO', 'UGLY', 'FATTY', 'SIMP', 'SIMPS',
    'VIRGIN', 'COOMER', 'COOM', 'NORMIE', 'SNITCH', 'THUG', 'THUGS', 'GANGSTA', 'GANGSTER', 'GHETTO', 'HOBO', 'TRAMP',
    'WINO', 'GIGOLO', 'HUSTLER', 'SHANK', 'GLOCK', 'UZI', 'CRIPS', 'BLOODS', 'SALAK', 'SUCKER', 'SUCKA', 'SUCKS',
    'JERK', 'DOUCHEY', 'SCHMUCKLOS', 'HASS', 'HATER', 'HATERS', 'NOLIFER', 'LAME',
  ],
  drugs: [
    'WEED', 'GANJA', 'KUSH', 'COKE', 'CRACK', 'METH', 'JUNKY', 'MDMA', 'ECSTASY', 'LSD', 'PERCS', 'OXY', 'OPIUM',
    'HASH', 'HASCH', 'KOKS', 'DOPE', 'BONG', 'BLUNT', 'SPEED', 'CRYSTAL', 'TWEAKER', 'DEALER', 'PUSHER', 'KETAMIN',
    'KETAMINE', 'KET', 'TILIDIN', 'LEAN', 'CODEINE',
  ],
};

// Zahlen- und Buchstabencodes: CODES_TOKEN nur als eigenes Wort (ALEX88 bleibt erlaubt), CODES_SUB ueberall.
export const CODES_TOKEN = {
  hate: ['1488', '8814', 'HH88', '88HH', 'WP14', '14WORDS', '14W', 'SS88', '88SS'],
  drugs: ['420'],
  sexual: ['69', '6969'],
  harassment: ['187'],
};
export const CODES_SUB = {
  hate: ['1488', '8814', 'HH88', '88HH', 'SS88', '88SS', '14WORDS', 'WP14', '卐', '卍'],
  harassment: ['AK47', 'MS13'],
};

// Regulaere Ausdruecke auf den zusammengezogenen Namen (Buchstaben mit + fuer Wiederholungen).
export const PATTERNS = [
  { reason: 'selfharm', re: '^K+Y+S+$' },
  { reason: 'selfharm', re: '^K+M+S+$' },
  { reason: 'selfharm', re: 'K+I+L+(Y+O+U+R*|U+R*|Y+A+)S+E+L+F+' },
  { reason: 'selfharm', re: 'G+O+(D+I+E+|K+I+L+Y+O+U+R*S+E+L+F+|H+A+N+G+)' },
  { reason: 'selfharm', re: '(H+A+N+G+|N+E+C+K+|E+N+D+|O+F+)(Y+O+U+R*|U+R+|Y+A+)S+E+L+F+' },
  { reason: 'selfharm', re: '(D+R+I+N+K+|E+A+T+)B+L+E+A+C+H+' },
  { reason: 'hate', re: '(K+I+L+|G+A+S+|H+A+N+G+|S+H+O+T+|S+T+A+B+|B+U+R+N+|D+E+A+T+H+T+O+|D+E+A+T+H+2+|F+U+C+K+|H+A+T+E+|N+U+K+E+|D+E+P+O+R+T+)(A+L+)?(T+H+E+)?(J+E+W|J+U+D+E|B+L+A+C+K|W+H+I+T+E|G+A+Y|M+U+S+L+I+M|M+O+S+L+E+M|T+R+A+N+S|A+R+A+B|T+U+R+K|A+U+S+L+A+N+D+E+R|F+O+R+E+I+G+N+E+R|I+M+I+G+R+A+N+T|C+H+R+I+S+T|H+I+N+D+U|A+S+I+A+N|M+E+X+I+C+A+N|G+Y+P+S+Y|R+O+M+A|P+O+L+E+S|R+U+S+I+A+N|U+K+R+A+I+N|F+A+G|H+O+M+O|N+I+G|K+U+R+D|I+S+R+A+E+L|P+A+L+E+S+T+I+N|Z+I+O+N|C+O+P+S?|P+I+G+S?|W+O+M+E+N|F+E+M+I+N+I+S+T|L+E+S+B|Q+U+E+R|W+H+O+R+E|B+I+T+C+H)' },
  { reason: 'hate', re: '(J+E+W+S*|M+U+S+L+I+M+S*|B+L+A+C+K+S+|W+H+I+T+E+S+|G+A+Y+S+|T+R+A+N+S+|A+R+A+B+S*|T+U+R+K+S+|J+U+D+E+N*|M+O+S+L+E+M+S*|A+S+I+A+N+S*|M+E+X+I+C+A+N+S*|I+S+L+A+M+|C+H+R+I+S+T+I+A+N+S*|R+U+S+I+A+N+S*)(S+C+U+M+|T+R+A+S+H+|P+I+G+S*|D+O+G+S*|R+A+T+S*|V+E+R+M+I+N+|D+I+E+|S+U+C+K+|S+T+I+N+K+|R+A+U+S+|O+U+T+|M+U+S+T+D+I+E+|A+R+E+)' },
  { reason: 'hate', re: '^(S+I+E+G+|H+E+I+L+)$' },
  { reason: 'hate', re: 'A+U+S+L+A+N+D+E+R+R+A+U+S+' },
  { reason: 'hate', re: '(D+E+U+T+S+C+H+L+A+N+D+|G+E+R+M+A+N+Y+)(E+R+W+A+C+H+E+|U+B+E+R+A+L+E+S+|D+E+N+D+E+U+T+S+C+H+E+N+)' },
  { reason: 'sexual', re: '(S+U+C+K+|L+I+C+K+|E+A+T+|T+O+U+C+H+|F+I+N+G+E+R+|G+R+A+B+|S+P+A+N+K+|R+I+D+E+|S+I+T+O+N+)(M+Y+|M+A+|M+E+|I+T+|O+N+|U+R+|Y+O+U+R+|H+E+R+|H+I+S+|T+H+E+)' },
  { reason: 'sexual', re: '(B+L+O+W+|R+I+D+E+|D+O+|B+A+N+G+|S+C+R+E+W+|M+O+U+N+T+|B+O+N+E+|N+A+I+L+|P+O+U+N+D+|S+M+A+S+H+)(M+E+|H+E+R+|H+I+M+|U+R+M+O+M+|Y+O+U+R+M+O+M+)$' },
  { reason: 'sexual', re: 'S+E+N+D+(N+U+D+E+|P+I+C+S+|F+E+E+T+|B+O+B+S+)' },
  { reason: 'sexual', re: 'S+H+O+W+(M+E+|Y+O+U+R+|U+R+)(T+I+T|B+O+B|A+S+|D+I+C+K|P+U+S+|C+O+C+K|F+E+E+T)' },
  { reason: 'sexual', re: '^D+T+F+$' },
  { reason: 'sexual', re: '^MOSEN?$' },
  { reason: 'sexual', re: '(B+I+G+|F+A+T+|H+A+R+D+|W+E+T+|T+I+G+H+T+|J+U+I+C+Y+|S+W+E+A+T+Y+|S+L+O+P+Y+)(D+I+C+K|C+O+C+K|P+U+S+Y|A+S+|T+I+T|B+O+B|B+A+L+S|C+U+N+T|W+I+L+Y|M+E+A+T|L+O+A+D)' },
  { reason: 'harassment', re: '(Y+O+U+R*|U+R+)(A+R+E+|R+)?(A+|S+O+)?(G+A+Y+|U+G+L+Y+|F+A+T+|D+U+M+B+|S+T+U+P+I+D+|T+R+A+S+H+|R+E+T+A+R+D+|L+O+S+E+R+|W+H+O+R+E+|S+L+U+T+|B+I+T+C+H+|P+U+S+Y+|N+O+B+|D+E+A+D+|G+A+R+B+A+G+E+|W+O+R+T+H+L+E+S+|N+O+T+H+I+N+G+)' },
  { reason: 'harassment', re: '(I+|W+E+)?(H+A+T+E+|F+U+C+K+|S+C+R+E+W+|K+I+L+|H+U+R+T+|P+U+N+C+H+|S+T+A+B+)(Y+O+U+|U+)(A+L+)?$' },
  { reason: 'harassment', re: '(Y+O+U+R*|U+R+)(M+O+M+|M+U+M+|M+O+T+H+E+R+|D+A+D+|S+I+S+|B+R+O+|D+O+G+|F+A+M+I+L+Y+)' },
  { reason: 'harassment', re: '(D+I+E+|B+U+R+N+|R+O+T+)(I+N+H+E+L+|N+O+W+|S+L+O+W+|A+L+O+N+E+|P+L+E+A+S+E+|B+I+T+C+H+|S+C+U+M+|T+R+A+S+H+|N+O+O+B+|L+O+S+E+R+)' },
  { reason: 'harassment', re: '^(S+H+U+T+U+P+|S+T+F+U+|G+T+F+O+|G+E+T+L+O+S+T+|G+E+T+R+E+K+T+|G+E+T+F+U+C+K+E+D+|P+I+S+O+F+|B+U+Z+O+F+|E+A+T+D+I+R+T+|D+R+O+P+D+E+A+D+)$' },
  { reason: 'harassment', re: '(F+A+T+|U+G+L+Y+|D+U+M+B+|S+T+U+P+I+D+|D+I+R+T+Y+|S+M+E+L+Y+|L+A+Z+Y+|W+O+R+T+H+L+E+S+|R+E+T+A+R+D+E+D+|T+R+A+S+H+Y+)(B+O+Y+|G+I+R+L+|K+I+D+|B+I+T+C+H+|P+I+G+|C+O+W+|S+L+O+B+|L+O+S+E+R+|B+A+S+T+A+R+D+|F+U+C+K+|W+H+O+R+E+|C+U+N+T+|A+S+)' },
  { reason: 'spam', re: '^(F+R+E+E+|W+I+N+|B+U+Y+|G+E+T+|C+L+A+I+M+)(V+B+U+C+K+S*|R+O+B+U+X+|M+O+N+E+Y+|C+O+I+N+S*|S+K+I+N+S*|C+R+Y+P+T+O+|B+I+T+C+O+I+N+|N+I+T+R+O+|G+I+F+T+)' },
];

// Vorsilben/Nachsilben fuer WORD-Begriffe (DUMB+ASS, ASS+HOLE, FUCK+ER+S ...). Ohne Ziffern.
export const PREFIXES = [
  'MOTHER', 'MOTHA', 'MUTHA', 'DUMB', 'FAT', 'BAD', 'SMART', 'LAME', 'HARD', 'KISS', 'JACK', 'DIP', 'BULL', 'HORSE',
  'DOG', 'APE', 'CHICKEN', 'SHIT', 'FUCK', 'ASS', 'BUTT', 'DICK', 'COCK', 'CUNT', 'SUPER', 'MEGA', 'ULTRA', 'BIG',
  'LIL', 'LITTLE', 'OLD', 'YOUNG', 'MR', 'MRS', 'MS', 'DR', 'SIR', 'LORD', 'KING', 'QUEEN', 'LADY', 'THE', 'DA', 'DER',
  'DIE', 'DAS', 'EIN', 'DEIN', 'DEINE', 'DU', 'YOU', 'UR', 'YOUR', 'MY', 'MEIN', 'MEINE', 'SCHEISS', 'DRECKS',
  'HUREN', 'KACK', 'VOLL', 'TOTAL', 'MEGA', 'OBER', 'SAU', 'VER', 'GE', 'ANTI', 'PRO', 'NO', 'NON', 'UN', 'RE', 'EX',
  'TEAM', 'CLAN', 'PRO', 'XX', 'X', 'XXX', 'I', 'IM', 'IAM', 'ME', 'WE', 'HE', 'SHE', 'SO', 'TOO', 'VERY', 'REAL',
  'TRUE', 'PURE', 'FULL', 'HALF', 'FREE', 'EL', 'LA', 'LE', 'LOS', 'LAS', 'LES', 'IL', 'LO', 'HALLO', 'HI', 'HEY',
  'ILOVE', 'LOVE', 'EAT', 'SUCK', 'LICK', 'KILL', 'HATE', 'GO', 'BE', 'GET', 'STAY', 'WANNA', 'WANT', 'NEED', 'LIKE',
  'SOME', 'ANY', 'ALL', 'EVERY', 'ONE', 'TWO', 'THREE',
];
export const SUFFIXES = [
  'S', 'ES', 'ER', 'ERS', 'ED', 'ING', 'IN', 'INS', 'Y', 'IE', 'IES', 'O', 'OS', 'A', 'AH', 'AZ', 'Z', 'ZZ', 'HEAD',
  'HEADS', 'FACE', 'HOLE', 'HOLES', 'WAD', 'BAG', 'BAGS', 'BOY', 'BOYS', 'GIRL', 'GIRLS', 'MAN', 'MEN', 'LORD', 'KING',
  'QUEEN', 'LESS', 'LY', 'ST', 'STER', 'HAT', 'WIPE', 'CLOWN', 'MUNCH', 'LICK', 'LICKER', 'SUCKER', 'EATER', 'FUCKER',
  'KILLER', 'HUNTER', 'LOVER', 'MASTER', 'SLAYER', 'DESTROYER', 'GOD', 'ZILLA', 'TRON', 'BOT', 'X', 'XX', 'XXX', 'I',
  'IS', 'IN', 'E', 'EN', 'CHEN', 'LEIN', 'GESICHT', 'KOPF', 'LOCH', 'SOHN', 'KIND', 'KINDER', 'FRESSE', 'BACKE',
  'MANN', 'FRAU', 'TUSSI', 'BRATZE', 'VOGEL', 'HUND', 'SAU', 'SCHWEIN', 'TIER', 'FICKER', 'LUTSCHER', 'WICHSER',
  'ME', 'U', 'YOU', 'YA', 'IT', 'EM', 'HER', 'HIM', 'ALL', 'ON', 'OFF', 'UP', 'OUT', 'LIFE', 'LORD', 'BRO', 'DUDE',
  'MAIN', 'GAMING', 'GAMER', 'PLAYER', 'TV', 'YT', 'TTV', 'GG', 'HD', 'PRO', 'LOL', 'XD', 'MAX', 'ONE', 'TWO', 'ZERO',
];

// Harmlose Woerter/Namen, die sonst wegen eines enthaltenen Begriffs gesperrt wuerden (ganzes Wort, Grossschreibung).
export const ALLOW = [
  'ASSASSIN', 'ASSASSINS', 'CLASSIC', 'CLASSICS', 'CLASS', 'CLASSY', 'BASS', 'BASSIST', 'GRASS', 'PASS', 'PASSWORD',
  'PASSAT', 'MASS', 'MASSIVE', 'MASSA', 'MASSIMO', 'HASSAN', 'HASSE', 'HASSO', 'CASSIE', 'CASSIUS', 'CASSANDRA',
  'COCKPIT', 'PEACOCK', 'HANCOCK', 'HITCHCOCK', 'COCKATOO', 'COCKTAIL', 'COCKNEY', 'BABCOCK', 'WOODCOCK', 'COCKROACH',
  'COCKER', 'SCUNTHORPE', 'PENISTONE', 'SEXTON', 'SEXTANT', 'SEXTET', 'ESSEX', 'SUSSEX', 'WESSEX', 'MIDDLESEX',
  'ANALYST', 'ANALOG', 'ANALYSIS', 'ANALYZE', 'ANALYSE', 'ANALYTICS', 'ANALOGUE', 'ARSENAL', 'TITAN', 'TITANS',
  'TITANIC', 'TITLE', 'TITUS', 'BUTTON', 'BUTTONS', 'BUTTER', 'BUTTERFLY', 'SHIITAKE', 'SHITAKE', 'CUMBERLAND', 'CUMIN',
  'DICKENS', 'MATSUSHITA', 'THERAPIST', 'THERAPY', 'NIGHT', 'KNIGHT', 'KNIGHTS', 'NIGHTS', 'ANUSHKA', 'URANUS',
  'JANUS', 'ASSEL', 'KASSEL', 'ASSISI', 'ASSIST', 'ASSET', 'ASSETS', 'SPASS', 'SPASSKY', 'PICASSO', 'LASSE', 'LASSO',
  'TASSE', 'WASSER', 'STRASSE', 'GASSE', 'KLASSE', 'NASSER', 'HESSEN', 'MESSE', 'ESSEN', 'SCHMUCK', 'FAHRT', 'WIENER',
  'HEROINE', 'CUCKOO', 'THOTH', 'NIGERIA', 'NIGERIAN', 'ASHKENAZI', 'MONTENEGRO', 'MARSCH', 'MARSCHALL', 'HARSCH',
  'BARSCH', 'FICKLE', 'KUSS', 'HELLO', 'SCRAP', 'SCRAPPY', 'SIMPSON', 'PIMPLE', 'COMPUTER', 'SATURDAY', 'BASEMENT',
  'SHIH', 'PHUKET', 'FUKUOKA', 'FUKUDA', 'FUKUSHIMA', 'SPICY', 'SPICE', 'RACCOON', 'TYCOON', 'JAPAN', 'PAKISTAN',
  'HOMER', 'HOMEWORK', 'SIKH', 'DOCUMENT', 'CIRCUMFLEX', 'DICKSONIA', 'PENINSULA', 'SEXAGON', 'MUFFIN', 'MUFFINS',
  'KNOBI', 'PRICKLY', 'LULLABY', 'SCATTER', 'METHOD', 'OXYGEN', 'HASHTAG', 'ALBUM', 'SNIPER', 'BUMBLEBEE', 'FARTHING',
  'CRAPAUD', 'WEEDLE', 'TWEED', 'TWEEDY', 'SPEEDY', 'SPEEDSTER', 'SPEEDRUN', 'CRYSTALS', 'CRACKLE', 'CRACKERJACK',
  'DOPEY', 'LEANER', 'KETTLE', 'MOSES', 'FUTURE', 'FUTBOL', 'PUFFIN', 'PUFFY', 'SACKS', 'RUCKSACK', 'KNAPSACK',
  'HUNDRED', 'DEPPEN', 'VOGELEI', 'KUTE', 'LULU', 'TRUTH', 'SLETS', 'KUKU', 'HASST', 'DOOFI', 'DUMMY', 'BLODE',
  'WPM', 'SSD', 'KZ', 'HHV', 'GOONDOCKS', 'SUCKERPUNCH', 'TITO', 'TITI', 'KYSER', 'KYSA', 'HOHOHO', 'HOLA', 'HOLLA',
  'HOBBIT', 'HOBBY', 'BUMBLE', 'BUMP', 'SPEEDO', 'COKEY', 'COQUETTE', 'CUMMINS',
];

// Namen, die wie Betreiber oder Spielpersonal aussehen (Impersonation). exact = ganzes Wort, sub = ueberall.
export const RESERVED = {
  exact: ['MOD', 'MODS', 'STAFF', 'SYSTEM', 'OWNER', 'ROOT', 'SERVER', 'HOST', 'OFFICIAL', 'SUPPORT', 'TAITO', 'ARKANOID',
    'NULL', 'UNDEFINED', 'NAN', 'TINY', 'WOO', 'SYSOP', 'GAMEMASTER', 'GM', 'CLAUDE', 'ANTHROPIC'],
  sub: ['ADMIN', 'MODERATOR', 'TINYWOO', 'DAIGANOID', 'OFFIZIELL', 'DEVTEAM', 'GAMEDEV'],
};

// Spam: Links, Werbung, Handles.
export const SPAM = {
  sub: ['WWW', 'HTTP', 'HTTPS', 'DISCORDGG', 'DISCORD.GG', 'BITLY', 'BIT.LY', 'T.ME', 'LINKTR', 'ONLYFANS', 'PORNHUB',
    'VIAGRA', 'CIALIS', 'FREEVBUCKS', 'FREEROBUX', 'FREEMONEY', 'FOLLOWME', 'FOLLOW4', 'JOINMY', 'MYDISCORD', 'SUBSCRIBE',
    'BET365', 'BETWAY', '1XBET', 'CASINO', 'GIVEAWAY', 'AIRDROP', 'BUYNOW', 'TELEGRAM', 'WHATSAPP', 'SNAPCHAT', 'TIKTOK',
    'INSTAGRAM', 'YOUTUBE', 'TWITCH', 'KICK.COM', 'VBUCKS', 'ROBUX', 'BITCOIN', 'CRYPTO', 'ETHEREUM', 'DOGECOIN',
    'PROMO', 'COUPON', 'DISCOUNT', 'CHEAPSKIN', 'SELLING', 'BUYING', 'TRADEME', 'ADDME', 'DMME', 'PMME'],
  exact: ['COM', 'ORG', 'LINK', 'URL', 'WEBSITE', 'SHOP', 'STORE', 'SALE', 'ADS', 'SPAM'],
  tld: ['COM', 'NET', 'ORG', 'GG', 'TV', 'XYZ', 'IO', 'DE', 'AT', 'CH', 'ME', 'LY', 'CO', 'UK', 'US', 'EU', 'INFO',
    'BIZ', 'TO', 'CC', 'RU', 'FR', 'IT', 'ES', 'PL', 'NL', 'TK', 'ML', 'GA', 'CF', 'SITE', 'ONLINE', 'APP', 'DEV'],
};
