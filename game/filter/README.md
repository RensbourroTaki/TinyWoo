# Namensfilter der Highscore-Liste

Prüft Spielernamen (max. 10 Zeichen, Drehschrift-Zeichensatz A–Z 0–9 Leerzeichen `. , ! ?`) auf Schimpfwörter,
Beleidigungen, Sex, Hass, Politik, Pädo-Begriffe, Selbstmord-Hetze, Drogen, Spam und Impersonation. Läuft identisch
im Browser (Eingabefeld nach Game Over, über `game/daiganoid.js`) und im Highscore-Server (`api/`). Was im Browser
durchkommt, prüft der Server noch einmal – der Filter ist also nicht umgehbar.

## Dateien

| Datei | Inhalt |
|---|---|
| `wordlist.js` | **Die Listen. Hier erweitern.** Kommentiert, nach Gruppen sortiert. |
| `namefilter.js` | Prüf-Logik (`sanitizeName`, `checkName`). Nur anfassen, wenn sich die Regeln ändern sollen. |
| `test.mjs` | Tests: `node --test game/filter/test.mjs` (im Repo-Ordner). Nach jeder Listenänderung laufen lassen. |

## Wie geprüft wird

1. Unicode vereinfachen: Akzente weg (Ä→A, É→E), ß→SS, kyrillische/griechische Doppelgänger (С→C, А→A) ersetzt,
   Vollbreite-Zeichen normalisiert.
2. Leetspeak und Symbole zu Buchstaben: 0→O, 1→I **und** L, 2→Z, 3→E, 4→A, 5→S, 6→G, 7→T, 8→B, 9→G, @→A, $→S, !→I …
   Zusätzlich eine Form ganz ohne Ziffern (TRUMP2028 → TRUMP).
3. Trennzeichen raus (F.U.C.K, F U C K → FUCK). Buchstabenwiederholungen zählen nicht (FUUUCK = FUCK).
4. Harmlose Wörter aus `ALLOW` fallen vor der Prüfung weg (ASSASSIN, SCUNTHORPE, SEXTON …). Anhängen hilft nicht:
   CLASSICFUCK bleibt gesperrt.
5. Reihenfolge: leer → Spam/Links → reservierte Namen → Zahlencodes (1488, 420, 69 als Wort) → Begriffe überall im
   Namen (`SUBSTRING`) → ganze Wörter mit Vor-/Nachsilben (`WORD`, z. B. DUMBASS, ASSHOLE, ASSES) → Phrasen (`PATTERNS`,
   z. B. KILL YOURSELF, SUCK MY, YOUR MOM).

Ergebnis: `{ ok: true, name }` oder `{ ok: false, reason, match, name }` mit `reason` aus
`empty | spam | reserved | slur | hate | politics | selfharm | sexual | profanity | harassment | drugs`.

## Erweitern

- Ein Wort, das nirgends vorkommen darf (auch nicht in anderen Wörtern): in `SUBSTRING` zur passenden Gruppe.
  Enthält ein harmloses Wort den Begriff, dieses Wort in `ALLOW` eintragen.
- Ein Wort, das nur als ganzes Wort gesperrt sein soll (BASS soll erlaubt bleiben, ASS nicht): in `WORD`.
- Phrasen oder Varianten als Muster: `PATTERNS`, Buchstaben mit `+` schreiben (`K+Y+S+`).
- Nur Großbuchstaben, ohne Umlaute/ß (Ä→A, Ö→O, Ü→U, ß→SS), ohne Ziffern (außer in `CODES_*`).
- Danach: `node --test game/filter/test.mjs`, Website hochladen **und** in `api/` `npx wrangler deploy`
  (ANLEITUNG Punkt 8), damit der Server dieselbe Liste kennt.

## Bewusst streng

Gesperrt sind auch Grenzfälle: DICK, COCK, NIGER, SNIGGER, FAGOT, HASS, DEPP, OPFER, WTF, DAMN, 69 (als eigenes Wort),
Politiker- und Parteinamen jeder Richtung. Lieber einmal zu viel ablehnen als eine Beleidigung in der Liste.

## Bekannte Schwächen

- Buchstaben-Toleranz heißt: ein Begriff mit Einzelbuchstabe trifft auch die Doppelform (LUL sperrt LULL). Begriffe mit
  Doppelbuchstaben (BOOB) treffen die Einzelform (BOB) dagegen **nicht**.
- Neue Slang-Begriffe müssen von Hand nachgetragen werden; der Filter lernt nichts.
- Wörter in Sprachen ohne lateinische Schrift werden nur über die Umschrift erkannt (БЛЯТЬ → BLYAT).
- Rückwärts geschriebene Begriffe (KCUF) werden nicht erkannt.
