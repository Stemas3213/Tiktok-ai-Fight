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
