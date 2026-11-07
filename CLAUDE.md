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
- Natürliche Betonung und passende Emotionen.
- Hintergrundmusik und Soundeffekte sind erlaubt, müssen aber **deutlich leiser als die Sprecher** sein (Ducking unter Sprache).
- **Keine überlappenden Dialoge**, außer es ist ausdrücklich gewollt.

## Stimmen-Zuordnung

| Rolle | ElevenLabs-Stimme | Voice-ID | Status |
|---|---|---|---|
| Erzähler | „Helmut Stieglbauer – Deep and Dynamic“ (der in diesem Projekt als „German Narrator“ gemeinte Erzähler, vom Nutzer gewählt) | `JiW03c2Gt43XNUQAumRP` | **fest, nicht ändern** |
| Newton | – | – | offen |
| Einstein | – | – | offen |

> Die Voice-IDs dürfen nur aus der ElevenLabs-Stimmenliste (oder vom Nutzer) stammen, nie geraten oder aus dem Gedächtnis eingetragen werden. Charakterstimmen mit Status „offen“ werden erst nach Auswahl durch den Nutzer erzeugt.
