// Mischt Bild + SFX (+ ElevenLabs-Sprachspuren, falls vorhanden) zum fertigen MP4.
//   node tools/mux.mjs [name=test-fight] [episode=test-fight]
// Sprache: episodes/<episode>/audio/<cue-id>.mp3 (erzeugt von tools/generate_voice.mjs). Fehlen sie, entsteht ein Video ohne Sprache.
// Ducking: SFX/Atmo werden unter der Sprache abgesenkt; Sprecher bleiben deutlich lauter. Ueberlappende Dialoge werden gemeldet.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const name = process.argv[2] || 'test-fight', episode = process.argv[3] || name;
const silent = `out/${name}.silent.mp4`, sfx = `out/${name}.sfx.wav`, meta = JSON.parse(fs.readFileSync(`out/${name}.audio.json`, 'utf8'));
const final = `out/${name}.mp4`;
const dur = (f) => Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString());

const voices = meta.cues.filter((c) => fs.existsSync(`episodes/${episode}/audio/${c.id}.mp3`)).map((c) => ({ ...c, file: `episodes/${episode}/audio/${c.id}.mp3`, len: 0 }));
voices.forEach((v) => { v.len = dur(v.file); });
voices.sort((a, b) => a.outStart - b.outStart);
for (let i = 1; i < voices.length; i++) if (voices[i].outStart < voices[i - 1].outStart + voices[i - 1].len) console.warn(`WARNUNG: Dialog ${voices[i].id} ueberlappt ${voices[i - 1].id} (${(voices[i - 1].outStart + voices[i - 1].len - voices[i].outStart).toFixed(2)} s) - Timing in script.json anpassen.`);
const missing = meta.cues.filter((c) => !voices.find((v) => v.id === c.id)).map((c) => c.id);

const inputs = ['-i', silent, '-i', sfx, ...voices.flatMap((v) => ['-i', v.file])];
let fc;
if (voices.length) {
  const vl = voices.map((v, i) => `[${i + 2}:a]adelay=${Math.round(v.outStart * 1000)}|${Math.round(v.outStart * 1000)},volume=1.0[v${i}]`).join(';');
  const vmix = voices.length > 1 ? `${voices.map((_, i) => `[v${i}]`).join('')}amix=inputs=${voices.length}:normalize=0[voice]` : '[v0]anull[voice]';
  fc = `${vl};${vmix};[voice]asplit=2[vo1][vo2];[1:a]volume=0.55[bg];[bg][vo1]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=350[bgd];[bgd][vo2]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]`;
} else fc = '[1:a]volume=0.8,alimiter=limit=0.95[a]';
const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', final], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status);
console.log(`fertig: ${final} | Sprachspuren: ${voices.length}/${meta.cues.length}${missing.length ? ' (fehlend: ' + missing.join(', ') + ' -> noch nicht von ElevenLabs erzeugt)' : ''}`);
