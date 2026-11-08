# AI FIGHT CLUB

Animierte 3D-Kampfserie im Roblox-inspirierten Blockfiguren-Look (Hochformat 9:16, TikTok). Erste Folge: **Isaac Newton vs. Albert Einstein** (10–15 s Testkampf).

Alles ist Code: Three.js-Szene → deterministisches Frame-Rendering (Playwright/Chromium) → ffmpeg. Keine kostenpflichtigen Dienste außer **ElevenLabs für Sprache** (nur nach Rücksprache).

## Part 1 (Runde 1) – fertige Folge
- Video: `releases/AI-FIGHT-CLUB_Part1_1080x1920.mp4` (≈59 s, 1080×1920, 30 fps, H.264/AAC, deutsche ElevenLabs-Stimmen)
- Drehbuch: `docs/part1-drehbuch.md`, Skript-Quelle: `episodes/part1/script.json`, Choreografie: `src/episodes/part1.js`
- Neu bauen: `node tools/render-parallel.mjs --ep part1 --out out/part1 && node tools/make-sfx.mjs out/part1.audio.json && node tools/make-music.mjs out/part1.audio.json && node tools/mux.mjs part1 part1`

## Schnellstart

```bash
npm install
node tools/serve.mjs 8080          # Live-Vorschau: http://127.0.0.1:8080/  (Leertaste = Pause, R = Neustart)

# Testkampf rendern (Playwright + ffmpeg müssen installiert sein)
node tools/render.mjs --out out/test-fight.mp4 --w 1080 --h 1920 --fps 30   # Final (langsam, CPU-Rendering)
node tools/render.mjs --out out/test-fight.mp4 --w 720 --h 1280              # schneller Entwurf
node tools/make-sfx.mjs out/test-fight.audio.json                            # prozedurale Soundeffekte + Publikum
node tools/mux.mjs test-fight                                                # Bild + Ton (+ Sprache, falls vorhanden)

# Einzelbilder zum Prüfen bestimmter Zeitpunkte
node tools/render.mjs --contact 2.6,3.0,9.5 --out out/contact --w 540 --h 960
```

Sprache (ElevenLabs): siehe `CLAUDE.md` und `docs/PROGRESS.md`. `node tools/generate_voice.mjs` ist standardmäßig ein **Trockenlauf ohne Credits**.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `CLAUDE.md` | Verbindliche Projektregeln (ElevenLabs-only, feste Stimmen, Repo-Scope) |
| `config/voices.json` | Voice-IDs, Modell, Sprechstile (keine Geheimnisse) |
| `episodes/test-fight/script.json` | Dialogzeilen = Quelle für Untertitel **und** Sprachausgabe |
| `src/humanoid.js`, `faces.js` | Blockfiguren-Rig (R15-artig: Ellbogen, Knie), Looks, Gesichter |
| `src/ik.js`, `fighter.js` | 2-Knochen-IK, Fuß-Planting, Federn für Trefferreaktionen |
| `src/moves.js` | Aktionen: Jab, Kreuz, Haken, Uppercut, Ausweichen, Block, Spezialattacken, Flug/K.O. |
| `src/choreo.js` | Zeitplan, Kamera-Regie, Zeitlupe/Hit-Stop, Effekte, SFX-Events |
| `src/arena.js`, `fx.js`, `extras.js` | Ring, Publikum, Licht; Partikel/Comic-Effekte; Schiedsrichter & Kommentator |
| `tools/` | Render, SFX-Synthese, Mux, ElevenLabs-Generator, Dev-Server |

## Warum diese Technik
Prozedurale Animation (IK + Federn + Fuß-Planting) statt Handanimation oder Asset-Kauf: voll deterministisch, ohne Lizenzen, beliebig viele Folgen aus Code, und Trefferreaktionen entstehen physikalisch plausibel statt aus starren Clips.
