# Daiganoid – Spiel-Code

Reines JavaScript (ES-Module), kein Build-Schritt. Eingebunden über `js/site-daiganoid.jsx` (Arcade-Seite und
Teaser auf der Startseite). Grafiken und Sounds liegen in `assets/daiganoid/`.

## Aufbau

| Ordner | Inhalt |
|---|---|
| `core/` | Ball-/Schläger-/Stein-Logik von „Arkanoid – Revenge of Doh“, byte-genau portiert (`playfield.js`, `ballmotion.js`, `brickgrid.js`, `ball.js`, `paddle.js`, `tables.js`). 11 Spalten im Spiel, 13 für die Verifikation. |
| `play/` | Eigenes Gameplay: `session.js` (Runden, Leben, Items, Laser, Gegner, Portale), `levels.js` (32 Runden × 2 Varianten, Textformat), `levelnames.js` (Namen je Runde links/rechts, Ansage `LEVEL NN` → Name), `items.js`. |
| `render/` | Darstellung: `board.js` (Hintergrund, Rahmen + Schatten, Türen, Lichter, Phaser), `bgfx.js` (Masken-Schimmer), `view.js` (Steine, Schläger, Bälle, Effekte), `font.js` + `spintext.js` (Drehschrift, Konsolenschrift), `assets.js` (Ladeliste). |
| `app.js` | Zustandsmaschine: Intro → Menü / Optionen / Highscore / Credits → Spiel → Game Over. |
| `daiganoid.js` | Einstieg `mountDaiganoid(container, opts)`: Canvas, Skalierung (ganzzahlig, max. 4×), Vollbild. |
| `input.js`, `audio.js` | Maus (absolut: Schläger = Mauszeiger-X; Option MOUSE LOCK = Pointer-Lock wie ein Spinner, Standard aus), Touch, Tastatur; WAV-Effekte, Musik. Über dem Spiel wird `menu/cursor.png` als Zeiger gezeichnet (1:1 Spielpixel), im laufenden Spiel ist der Schläger die Maus; verlässt die Maus das Spiel ¾ s lang, pausiert es (Klick spielt weiter). |
| `filter/` | Namensfilter der Highscore-Liste (`namefilter.js`, Wortlisten `wordlist.js`, Tests `test.mjs`). Läuft identisch im Browser und im Highscore-Server `api/`. Doku in `filter/README.md`. |
| `tools/verify.mjs` | Node: Kern gegen die MAME-Traces prüfen (`node game/tools/verify.mjs <trace.bin>...`). |
| `tools/checklevels.mjs` | Node: Level-Regeln statisch prüfen (18 Zeilen, Zeilen 0/1 frei, Motive mit Wandabstand, keine einzelnen Spezialsteine, Mover paarweise: `m` waagerecht je Zeile, `v` senkrecht gespiegelt mit Schacht ≥ 3, 4–8 Items, kein Gold-Einschluss). Regeln stehen oben in `levels.js`. |
| `tools/autopilot.mjs` | Node: Session ohne Browser durchspielen (Ausnahmen-Test). |
| `test.html` | Testseite ohne React: `game/test.html?state=game&ticks=600` spult vor (lokaler Server nötig), `&keys=ArrowLeft,ArrowUp` drückt Test-Tasten. |

## Koordinaten

Logik in Original-Pixeln (Zelle 16×8, Y wächst nach oben). Anzeige: 1 Logik-Pixel = 1,25 Art-Pixel
(Stein 20×10, Ball 5 px), Art-Pixel × S Gerätepixel (S = 2..4, ganzzahlig). Art-X = 10 + 1,25·(X−16),
Art-Y = 301 − 1,25·Y. Schirm 240×334 (= Vollbild-Hintergrund), Rahmen oben angehängt, Spielfläche 220×301 bei
(10,10), Phaser-Linie y 307 und Düsen y 311 (6 bzw. 10 px unter dem Rohrende 301; Phaser liegt über Rahmen und Düsen), Portale y 281,
Schläger y 285. Im Daiganoid-Feld liegen Decke und Steinraster um `lift` = 8 höher als im Original
(Decke Y 233), das Schläger-Band (Y 8..15) bleibt; der Original-Modus (13 Spalten) hat `lift` 0.

## Lokal testen

Module brauchen einen Server (kein `file://`): im Repo `python -m http.server 8765`, dann
`http://localhost:8765/#arcade` oder `http://localhost:8765/game/test.html`.

Test-Tasten (`DEV_KEYS` oben in `app.js`, `false` = abgedreht): im Spiel Pfeil links/rechts = Level wechseln
und neu starten, Linie `L32 … L02 L01 | R01 R02 … R32` (L = linkes, R = rechtes Portal, an den Enden Stopp);
Pfeil hoch = God Mode an/aus (verlorene Bälle kosten kein Leben). Solange an, lenken die Pfeiltasten nicht,
dann Maus oder A/D. F8/F9 = Mauszeiger um 1 Gerätepixel je Zeigerpixel kleiner/größer (Start 1:1 Spielpixel).

## Schrift

Alle Texte im Spiel benutzen die Drehschrift `assets/daiganoid/fonts/spin.png` (456×387, 16 Frames à 23 px,
Frame-Abstand 24, Start y=2; Frame 4 = weiße Vorderansicht = Ruhe-Frame, 8 = Kante, 12 = Rückseite). Zellen und
Frame-Layout stehen in `fonts/fonts.json` unter `spin` (9 px Zellen, W 15 px, `.`/`,`/`!`/`?`/`>` nur in Frame 4).
Menü = Originalgröße (23 px), Ansagen im Spiel = 2× (46 px). Das Ausdrehen steuert `SETTLE_PROFILE` /
`SETTLE_TAIL` in `render/spintext.js`.

Zweite Schrift: `fonts/BoldPixels.png` bleibt unverändert, `PixelFont` (`render/font.js`) sliced zur Laufzeit
ASCII 32–126 (Raster 9×17, Zeichen 8×16 ab (1,1), Breite aus der letzten Tintenspalte, Metadaten `fonts.json`
→ `bold`), 1 Font-Pixel = 1 Art-Pixel. Benutzt für die blinkende Hinweiszeile im Menü (`HINT` in `app.js`).

## Effekte

Regler oben in `render/view.js`: `BALL_GLOW` (Ball-Glow, roter Rand des Mega-Balls `player/ball-item1.png`),
`TRAIL` (Ball-Schweif), `SPARKS` (Funken bei Wand/Decke und Explosionen, additiv mit Schwerkraft).
Auswahl-Glow im Menü/Optionen: `GLOW` in `app.js`. Ball-Tempo: jede Runde wie Runde 1 (`startSpeed`/`minSpeed`/`difficulty` in `play/session.js`), schneller nur über Abpraller.

## Grafiken ersetzen

Alle Bilder sind PNG mit Transparenz, Animationen als vertikale Streifen (Frame unter Frame). Maße stehen in
`render/assets.js`. Optionale Bilder (werden benutzt, sobald sie da sind): `assets/daiganoid/menu/logo.png`
(237×65), `player/paddle-laser.png`, `player/paddle-catch.png` (je 2 Frames 34×9 wie `paddle-thrust.png`),
`player/laser-shot.png`. Musik: OGG nach `assets/daiganoid/music/`, Pfade in `inhalt.js` unter `daiganoid` (Menü: „Out There“ von yd,
Highscore: „Party Sector“ von Joth, beide CC0 von OpenGameArt, in den Credits genannt). Blenden und Pegel in
`audio.js` (`MUSIC`), Option MUSIC = Lautstärke OFF/1–10.

## Hintergründe

`board/bg01.png`, `bg02.png`, … werden der Reihe nach geladen, bis eine Nummer fehlt (`render/assets.js`).
Runde 1 = bg01, danach reihum bg02..bgNN (`roundBackground`). Ein Bild, das in beiden Richtungen kleiner als der
halbe Schirm ist, gilt als Kachel und wird ab links oben wiederholt; alles andere ist ein Vollbild ab (0,0).
Gibt es `bgNN_mask.png`, leuchten deren weiße Pixel (`render/bgfx.js`): Stränge werden beim Laden vermessen,
darüber laufen Fluss-Wellen, Kaustik-Rauschen und Funken, gerastert in `BGFX.steps` Stufen. Fehlende Masken
erzeugen je einen harmlosen 404 in der Konsole. Steine gibt es nur noch „klar“; den Schatten von Rahmen,
Türen und Düsen zeichnet `Board.drawShadow` (`SHADOW` in `board.js`). Testseite: `?bg=3` erzwingt bg03.
