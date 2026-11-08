# Fortschritt

## Stand 2026-11-08 – Part 2 (Runde 2) FERTIG: `releases/AI-FIGHT-CLUB_Part2_1080x1920.mp4`

**Ergebnis:** 58,9 s, 1080×1920 (9:16), 30 fps, H.264 High, AAC 44,1 kHz Stereo, ca. 67 MB, animierte deutsche Untertitel (mit den Stimmen synchron), Stimmen unverändert (Kommentator Helmut Stieglbauer, Newton Victor Voss, Einstein Christian Plasa; IDs aus `config/voices.json`). Drehbuch/Spannungsbogen: `docs/part2-drehbuch.md`, Kontaktbogen: `docs/previews/part2-contact-sheet.png`.

**Dramaturgie (Spannung statt Effekt-Overkill):** Einstein dominiert → Newton hat Angst → Stille + Herzschlag → Einstein rutscht auf dem Apfel aus (Wendung 1) → Newton dreht auf, Einstein in der Klemme (Angst) → Newtons Wiege → Einsteins Zeitdilatation (Bullet-Time, gebündelte Treffer, Wendung 2) → Newton am Boden → steht auf, Einstein bekommt Angst → Seil-Sprung gegen Gravitations-Aufwärtshaken, Zusammenprall → Schwerkraft fällt aus (Cliffhanger „RUNDE 3 – SCHWERELOS?“). Offen bleibt, wer gewinnt.

**Ton:** 13 Sprachzeilen (9 neu, 4 aus Part 1), kurze Stille-Fenster vor dem Finish-Versuch (0,9 s) und nach der Bullet-Time (1,4 s) plus am Clash, Musik-Level-Wechsel je Szene (Drohnen/Herzschlag ↔ Beat), neue SFX (Wiegen-Klick, Tick-Tack, Herzschlag, Ausrutscher, Zeitlupen-Sog, Schwerkraft-Ausfall), Ducking, Loudnorm ca. −16 LUFS.

**Neu in der Engine:** Updater-Hooks, Bullet-Time/Farbgrading (`extra`), Schwerelosigkeit (Fans, Partikel, Apfel), Musik-Level und Stille-Fenster als Audio-Events (`ctx.music`, `ctx.mute`), Sprach-Warteschlange gegen Überlappungen, Fuß-Bodenhöhe (Seil-Stand), neue Moves (Angst, Knien, Balancieren, Schreck, Ellbogen-Sprung, Schweben), Wiege-Prop (Pendelphysik).

**ElevenLabs-Credits (vom Nutzer freigegeben):** 9 neue Zeilen = 362 Credits (k01 45, e01 46, k02 45, k03 42, n01 37, e03 42, n03 25, k07 32, k09 48).

**QA:** ffprobe 1080×1920/30 fps/h264/aac/58,93 s; blackdetect/freezedetect ohne Funde; silencedetect nur an den beabsichtigten Stille-Fenstern (11,9 s und 29,2 s); Dialog-Warteschlange verhindert Überlappungen (einzelne Zeilen bis 1,4 s verzögert). Kontaktbogen 1 Bild/s geprüft. Bekannte Grenzen: letzte ~7 s dunkel/schwebend mit statischer Endkarte; Fighter am Schluss teils nur angeschnitten im Bild; Kommentator selbst kaum sichtbar; Musik synthetisch.

**Nächster Schritt:** Part 3 (Runde 3, Schwerelos-Finale mit Sieger) als `src/episodes/part3.js` + `episodes/part3/script.json`.

## Stand 2026-11-08 – Part 1 (Runde 1) FERTIG: `releases/AI-FIGHT-CLUB_Part1_1080x1920.mp4`

**Ergebnis:** 59,4 s, 1080×1920 (9:16), 30 fps, H.264 High, AAC 44,1 kHz Stereo, ca. 60 MB, deutsche Untertitel (animiert, mit den Stimmen synchron), keine Ränder/Wasserzeichen. Vollständig vertont: 15 ElevenLabs-Zeilen (Kommentator „Helmut Stieglbauer – Deep and Dynamic“, Newton „Victor Voss – Sinister Villain“, Einstein „Christian Plasa – Warm Voice“; Voice-IDs aus `config/voices.json`, nichts gewechselt), prozedurale SFX, prozedurale Hintergrundmusik (132 BPM, Am-F-C-G, eigene Synthese ohne Fremdmaterial), Ducking unter der Sprache, Loudnorm auf ca. −16 LUFS. Details: `docs/part1-drehbuch.md`.

**Neu in der Engine**
- Episoden-Architektur: `src/engine.js` (Simulation, Zeitlupe, Hit-Stop, Kamera, FX-Helfer) + `src/episodes/<id>.js` (Ablauf). Der Testkampf läuft unverändert als `test-fight`.
- Neue Moves: Schulterzucken, Winken, Zeigen, Handschuh-Klopfen, Wutanfall, Pirouette, Ali-Shuffle, Aufstehen nach K.O., Block-Treffer („KLONK!“), leichter Tipp („PIEP!“); Treffer-Kombos mit durchgehend sichtbaren Kontakten (verfehlte Schläge streifen knapp die Stelle, die der Kopf gerade verlassen hat).
- Mundbewegung der Figuren beim Sprechen, goldene Arena-Beleuchtung bei der Atomfaust, Dialog-Anker (`at: [anker, offset]`), Kamera-Rahmung für 9:16 (`frame()`), Ringgrenzen.
- Pipeline: `tools/timeline.mjs` (Zeitplan-/Überlappungsprüfung in Sekunden), `tools/render-parallel.mjs` (4 Chromium-Worker, deterministisch, wiederaufnehmbar; ca. 1,3 s/Frame effektiv → ≈ 40 min für 1781 Frames in 1080p auf CPU), `tools/make-music.mjs`, `tools/mux.mjs` (Ducking, Loudnorm, Audio-Padding).

**ElevenLabs-Credits (vom Nutzer freigegeben)**
- Einstein-Sprachprobe: 86 · Testkampf-Zeilen: ca. 111 · Part 1 neu: 12 Zeilen ≈ 473 Credits (k01 62, n01 67, e01 58, k02 38, k03 17, k04 40, k05 31, k06 30, k07 45, k08 38, n02 32, k09 33). Alle Generierungen liefen ohne Ablehnung durch den Sicherheitsfilter.

**QA (am fertigen Video)**
- `ffprobe`: 1080×1920, 30 fps, h264, aac, 59,37 s. `blackdetect`/`freezedetect`/`silencedetect`: keine Funde.
- Kontaktbogen 1 Bild/s geprüft; Fehler behoben: Apfel war hinter dem Jumbotron verdeckt (Fallhöhe gesenkt), Kamera beim Cliffhanger zeigte Handschuhe statt Gesichter (neu eingestellt, betroffene Frames neu gerendert), Audio brach nach der letzten Sprachzeile ab (Padding), zu leise Stimmen (Loudnorm je Zeile).
- Bekannte Grenzen: Einsteins Gesicht wird bei einigen Nahaufnahmen teils vom eigenen Handschuh verdeckt; Publikum/Kommentator sind Statisten (Kommentator nur im Cutaway kurz zu sehen); die Musik ist synthetisch und schlicht; Mundbewegung ist ein Zwei-Zustands-Flappen.
- Nicht im Repo: Roh-Frames (`out/`). Kontaktbogen des fertigen Videos: `docs/previews/part1-contact-sheet.png`.

**Nächste Schritte:** Part 2 (Runde 2: Newtons Comeback, neue Spezialattacken, Wendung) als `src/episodes/part2.js` + `episodes/part2/script.json`; Part 3 (Finale mit Sieger). Gesicht-Okklusion in Nahaufnahmen und Kommentator-Cutaway verbessern.

## Stand 2026-11-07 – Testkampf v0.1 (Newton vs. Einstein, ~14,7 s, 9:16)

**Fertig / lauffähig**
- Roblox-inspirierte 3D-Figuren (Newton: Perücke, Weste, Jabot, lange Nase; Einstein: wilde Haare, Schnauzer, „E=mc²“-Pulli), austauschbare Gesichtsausdrücke (grit, hurt, dizzy, shock, happy …).
- Animation: IK-Arme/-Beine, Fuß-Planting (Schritte statt Rutschen), Boxerstance mit Wippen, Jab/Kreuz/Haken/Uppercut mit Ausholen & Nachschwung, Ausweichen, Block, Trefferreaktionen über Federn (Kopf, Torso, Rückstoß, Arme), Taumeln, Flug mit Salto + K.O.-Landung.
- Spezialattacken: **Apfel-Bombe** (Newton, fallender Apfel mit Schatten, „BONK!“, Dizzy-Sterne) und **E=mc²-Atomfaust** (Einstein: Aufladen, Aura, Formeln, Dash-Uppercut, Schockwelle, Newton fliegt in die Seile).
- Ring (Seile mit Nachschwingen), Tribünen mit ~1.500 animierten Blockfans (reagieren auf Treffer), LED-Banden, Jumbotron, Scheinwerfer, Schiedsrichter (zählt, gibt Zeichen), Kommentator am Tisch (Mundbewegung bei Sprechzeiten).
- Kamera-Regie: 18 Schnitte (Kran, Close-ups, Über-die-Schulter-artige Diagonalen, Apfel-Verfolgung, Kommentator-Cutaway, Flug-Verfolgung), Handkamera-Wackeln, Treffer-Shake, FOV-Punch, Hit-Stop, Zeitlupe (entsättigt + Vignette).
- Effekte: Comic-Sternexplosionen („PAFF!“, „BUMM!“, „KLATSCH!“, „BONK!“, „WUMMS!“), Partikel, Schockwellen, Speedlines, Konfetti, Gesundheitsleisten, Untertitel.
- Ton: prozedurale SFX + Publikumsatmo (`tools/make-sfx.mjs`), Ducking-Mux vorbereitet.
- Sprache: ElevenLabs-Pipeline (`tools/generate_voice.mjs`) mit Voice-IDs aus `config/voices.json`, Fehlerabbruch ohne Fallback, Trockenlauf als Standard.

**Vorschau im Repo:** `docs/previews/test-fight-v0.1-720p.mp4` (14,7 s, mit SFX, ohne Sprache) und `docs/previews/test-fight-contact-sheet.png` (Bildfolge, 1,5 Bilder/s).

**Bekannte Schwächen (aus der Bildfolge)**
- Zwei Kameraschnitte (Landung, Siegerpose) werden teilweise von Eckpfosten/Seilen verdeckt.
- Der Kommentator-Cutaway ist unscharf/zu dunkel; Kommentator ist kaum erkennbar.
- Endcard-Text und Untertitel überlappen am Schluss leicht.
- Newton-Gesicht wird vom Perückenrand teils verdeckt; Aufladungs-Aura überbelichtet in der Nahaufnahme.

**Sprache (ElevenLabs, vom Nutzer freigegeben, Modell eleven_multilingual_v2)**
- Einstein-Sprachprobe: `docs/previews/voice-sample-einstein.mp3` (5,5 s, ~86 Credits). Ob sie auf Deutsch natürlich klingt, muss der Nutzer beurteilen (nicht hörbar prüfbar durch Claude).
- Eingesprochen: k02, n01, e01, k03 (`episodes/test-fight/audio/`, ~110 Credits), Timing ohne Überlappung geprüft.
- **k01 („Willkommen beim AI Fight Club!“) fehlt noch** – der erste Aufruf wurde vom Sicherheitsfilter abgelehnt und nicht wiederholt.
- Erzeugt über die ElevenLabs-MCP-Tools (Voice-IDs aus `config/voices.json`); dafür wurde `elevenlabsusercontent.com` in der Umgebung freigeschaltet, um die Dateien herunterzuladen.

**Noch nicht gemacht / offen**
- Zeile k01 einsprechen, danach `tools/mux.mjs` neu ausführen.
- Feinschliff: einige Kameraschnitte (Kommentator-Cutaway, Landung), Newton-Gesicht unter der Perücke, Lichtstimmung, Fan-Vielfalt.
- Final in 1080×1920 rendern (CPU-Rendering ≈ 20–30 min).

**Qualitätsnotizen**
- Gerendert mit SwiftShader (CPU); mit GPU deutlich schneller.
- Alles ist deterministisch (fester Zufalls-Seed, fester Zeitschritt) – gleiche Eingabe ergibt identisches Video.
