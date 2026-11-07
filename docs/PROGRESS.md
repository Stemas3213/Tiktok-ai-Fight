# Fortschritt

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

**Noch nicht gemacht / offen**
- **Keine Sprache erzeugt** (es wurden keine ElevenLabs-Credits verbraucht). Die Einstein-Sprachprobe ist vorbereitet (`node tools/generate_voice.mjs --sample einstein --yes`), wartet aber auf Zustimmung.
- Echte Audiodauern → Timing der Dialoge prüfen (Tool meldet Überlappungen).
- Feinschliff: einige Kameraschnitte (Kommentator-Cutaway, Landung), Newton-Gesicht unter der Perücke, Lichtstimmung, Fan-Vielfalt.
- Final in 1080×1920 rendern (CPU-Rendering ≈ 20–30 min).

**Qualitätsnotizen**
- Gerendert mit SwiftShader (CPU); mit GPU deutlich schneller.
- Alles ist deterministisch (fester Zufalls-Seed, fester Zeitschritt) – gleiche Eingabe ergibt identisches Video.
