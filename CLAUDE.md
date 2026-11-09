# AI FIGHT CLUB – Projektregeln

Diese Regeln gelten dauerhaft für **jede Folge** der Kampfserie.

## Sprachgenerierung: ausschließlich ElevenLabs

Sämtliche gesprochenen Stimmen (Erzähler und Charaktere) werden **ausschließlich mit ElevenLabs** erzeugt.

### 1. Erzählerstimme

- Der Hauptsprecher ist ausschließlich die ElevenLabs-Stimme **„German Narrator“**. Im ElevenLabs-Konto gibt es keine Stimme mit exakt diesem Namen; der Nutzer hat dafür **„Helmut Stieglbauer – Deep and Dynamic“** festgelegt (Voice-ID `JiW03c2Gt43XNUQAumRP`).
- Der Erzähler kommentiert jeden Kampf, stellt die Charaktere vor und begleitet spannende sowie lustige Situationen.
- Stil: energiegeladen, humorvoll, wie ein professioneller Boxkommentator.
- Dieselbe Erzählerstimme wird in **allen** zukünftigen Folgen verwendet.
- Die Stimme wird **eindeutig über ihre ElevenLabs-Voice-ID** zugeordnet, nie über den Namen allein. Die ID steht in der Tabelle „Stimmen-Zuordnung“ unten. Wird eine Stimme nur per Name gefunden, ist das nicht ausreichend – die ID muss geprüft sein.

### 2. Charakterstimmen

- Newton, Einstein und alle weiteren Figuren erhalten jeweils eine **eigene, unterschiedliche, passende** ElevenLabs-Stimme.
- Die Stimmen müssen deutschsprachig, gut verständlich und möglichst ausdrucksstark sein.
- Dialoge müssen **zeitlich mit den Animationen synchronisiert** werden (Audiodauer als Taktgeber für die Animation, nicht umgekehrt geraten).
- Jede neue Figur wird mit ihrer Voice-ID in der Tabelle unten eingetragen und bleibt in allen Folgen gleich.

### 3. Strikte Regeln

- ✅ Nur ElevenLabs für jede gesprochene Stimme.
- ❌ Keine Browser-Sprachausgabe (`speechSynthesis` / Web Speech API).
- ❌ Keine Google-TTS-Stimmen (gTTS, Google Cloud TTS).
- ❌ Keine lokalen TTS-Systeme (pyttsx3, espeak, Piper, Coqui, macOS `say` o. Ä.).
- ❌ Keine automatisch generierten Ersatzstimmen anderer Anbieter.
- **Fallback-Verbot:** Ist ElevenLabs nicht erreichbar (Netzwerk, Auth, Quota, Fehler), wird die Spracherzeugung **abgebrochen** und der Nutzer **informiert**. Es wird nichts anderes generiert und kein Platzhalter-Audio eingesetzt.
- Der Code muss die Voice-ID **explizit** übergeben und darf nie auf eine Standard-/Default-Stimme zurückfallen. Fehlt eine Voice-ID, ist das ein Fehler.
- **Niemals API-Schlüssel im GitHub-Repository speichern.** Der Schlüssel kommt ausschließlich aus der Umgebungsvariable `ELEVENLABS_API_KEY` (lokal z. B. `.env`, die per `.gitignore` ausgeschlossen ist). Keine Schlüssel in Code, Config, Commits, Logs oder Issues.

### 4. Audioqualität

- Klare Stimmen ohne Hintergrundrauschen.
- Natürliche Betonung und passende Emotionen (Newton kalt-spöttisch, Einstein warm und neugierig, Kommentator energisch und humorvoll).
- Natürliche deutsche Aussprache: Texte ausschließlich auf Deutsch schreiben; Namen und Fachbegriffe bei Bedarf phonetisch absichern und das Ergebnis vor dem Einbau anhören bzw. transkribieren und prüfen.
- Hintergrundmusik und Soundeffekte sind erlaubt, müssen aber **deutlich leiser als die Sprecher** sein (Ducking unter Sprache).
- **Keine überlappenden Dialoge**, außer es ist ausdrücklich gewollt.

## Stimmen-Zuordnung

| Rolle | ElevenLabs-Stimme | Voice-ID | Status |
|---|---|---|---|
| Erzähler | „Helmut Stieglbauer – Deep and Dynamic“ (der in diesem Projekt als „German Narrator“ gemeinte Erzähler, vom Nutzer gewählt) | `JiW03c2Gt43XNUQAumRP` | **fest, nicht ändern** |
| Isaac Newton | „Victor Voss – Sinister Villain“ | `BxoyaO1xuQUNkP2tJIrR` | **fest, nicht ändern** |
| Albert Einstein | „Christian Plasa – Warm Voice“ (Beschreibung „A warm and captivating narrator voice“; vom Nutzer bestätigt am 2026-11-07) | `NBqeXKdZHweef6y0B67V` | **fest, nicht ändern** |

Die maschinenlesbare Konfiguration liegt in [`config/voices.json`](config/voices.json) (ohne Geheimnisse, zuletzt geprüft am 2026-11-07). Code liest die Voice-IDs ausschließlich von dort.

**Stimmen sind gesperrt:** Die obige Zuordnung gilt für die gesamte Serie. Keine Stimme darf ohne **ausdrückliche Zustimmung des Nutzers** geändert, ersetzt oder „verbessert“ werden – auch nicht, wenn eine andere Stimme besser passen könnte. Vorschläge sind erlaubt, die Umsetzung erst nach Zustimmung.

**Achtung Namensdopplung:** Es gibt in ElevenLabs auch „Victor Voss – Conversational Male Voice“ (`KSGYe0fMqoZR5BREvtf1`, Englisch) – das ist **nicht** Newtons Stimme. Newton ist ausschließlich `BxoyaO1xuQUNkP2tJIrR`.

> Die Voice-IDs dürfen nur aus der ElevenLabs-Stimmenliste (oder vom Nutzer) stammen, nie geraten oder aus dem Gedächtnis eingetragen werden. Neue Figuren erhalten erst nach Auswahl durch den Nutzer eine Stimme und werden dann hier und in `config/voices.json` ergänzt.

## Entwicklung & Arbeitsregeln

- **Repo-Scope:** Gearbeitet wird ausschließlich in `Stemas3213/Tiktok-ai-Fight`. Das Geschichtenprojekt darf nicht verändert werden.
- **Keine kostenpflichtigen Dienste ohne Zustimmung des Nutzers.** Das gilt ausdrücklich auch für ElevenLabs-Credits: Sprachproben und Folgen-Sprache (`tools/generate_voice.mjs --yes`, MCP-Tools wie `creative_generate_speech`) erst **nach Rückfrage**. Der Trockenlauf ohne `--yes` ist frei.
- **Einstein-Sprachprobe:** Sobald die Sprachausgabe läuft, kurze deutsche Probe erzeugen (vorher fragen, da Credits). Klingt die Stimme auf Deutsch nicht natürlich, den Nutzer informieren – **niemals selbst die Stimme wechseln**.
- Technik: Three.js, prozedurale Animation, Rendering über `tools/render.mjs`. Details in `README.md`, Fortschritt in `docs/PROGRESS.md` (bei jeder größeren Änderung aktualisieren).
- Dialogtexte stehen nur in `episodes/<folge>/script.json` und referenzieren Stimmen über Schlüssel aus `config/voices.json`; Voice-IDs nie im Code duplizieren.

## Serie & Produktion (Stand: Part 1, 2 und 3 fertig – Serie abgeschlossen)

- **Serienkonzept:** Newton vs. Einstein, 3 Runden in 3 TikTok-Videos à ca. 60 s: **Part 1 = Runde 1** (Hook, Provokationen, erster Schlagabtausch, Apfel-Attacke, E=mc²-Atomfaust, Cliffhanger – *kein* endgültiger Sieger), **Part 2 = Runde 2** (Newtons Comeback, neue Spezialattacken, Wendung), **Part 3 = Runde 3** (Finale, Sieger). Jeder Part ist ein eigenständiges Video.
- **Technik:** Eine Folge = ein Modul `src/episodes/<id>.js` (Choreografie, Kamera, Anker) + `episodes/<id>/script.json` (Dialog, Untertitel, Sprecher, Anker-Offsets) + `episodes/<id>/audio/*.mp3` (ElevenLabs). Die Engine (`src/engine.js`) bleibt gemeinsam; Charaktermodelle, Arena, Schiedsrichter, Publikum und Animationstechnik werden **unverändert wiederverwendet** (Stil nicht ändern).
- **Ablauf je Folge:** `node tools/timeline.mjs --ep <id>` (Zeitplan/Überlappungen prüfen, schnell) → Kontaktbögen mit `tools/render.mjs --contact` (Bildprüfung) → `node tools/render-parallel.mjs --ep <id> --out out/<id>` (1080×1920, 30 fps) → `tools/make-sfx.mjs`, `tools/make-music.mjs` → `tools/mux.mjs <id> <id>` (Sprache + Ducking + Loudnorm) → QA (siehe unten).
- **Sprache wiederverwenden:** Vorhandene ElevenLabs-Zeilen werden nur wiederverwendet, wenn Text und Emotion passen (Part 1 nutzt drei Zeilen aus dem Testkampf). Neue Zeilen nur nach Freigabe des Nutzers (Part 1: ausdrücklich freigegeben). Wird eine Generierung vom Sicherheitsfilter abgelehnt: **nicht umgehen**, zulässige Alternative nehmen oder den Nutzer informieren.
- **Dialog-Timing:** Sprache und Animation sind über Anker gekoppelt (`at: [anker, offset]` in `script.json`); `timeline.mjs` meldet Überlappungen. Keine überlappenden Dialoge, SFX/Musik deutlich leiser (Ducking).
- **QA vor Abgabe:** Kontaktbogen des fertigen Videos (Bildfehler, verdeckte Kamera), Untertitel-Überlappungen, Sprachzeiten (ffmpeg `silencedetect`/Lautheit), Dauer/Auflösung/Codec per `ffprobe` (1080×1920, 30 fps, H.264, AAC, ≈60 s), keine schwarzen Ränder, kein Wasserzeichen.
- **Credits:** Verbrauchte ElevenLabs-Credits in `docs/PROGRESS.md` protokollieren.
- **Netzwerk-Hinweis:** In der Cloud-Umgebung „Fight“ ist `elevenlabsusercontent.com` freigeschaltet, damit erzeugte ElevenLabs-Audiodateien geladen werden können.

- **Part 2 (fertig):** Spannungsregeln für die Serie: Wendungen statt reiner Effekte, Schwächen klar zeigen (Angst/Wut/Schadenfreude), kurze Stille vor großen Treffern, Dialog bremst den Kampf nicht, Cliffhanger zum nächsten Teil. Part 3 beginnt im Schwerelos-Zustand und muss einen Sieger bestimmen.
- **Part 3 (fertig):** Finale mit Sieger Einstein (Zählung, absolute Stille, „Zeit ist relativ“-Comeback, entscheidender Konter). Alle 13 Zeilen neu erzeugt (482 Credits), siehe `docs/part3-drehbuch.md`.
