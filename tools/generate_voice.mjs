// ElevenLabs-Sprachausgabe fuer AI FIGHT CLUB. AUSSCHLIESSLICH ElevenLabs - kein Fallback auf andere Anbieter!
//
//   node tools/generate_voice.mjs [episodes/test-fight/script.json]            Trockenlauf (Standard): zeigt Plan + Zeichenzahl, verbraucht KEINE Credits
//   node tools/generate_voice.mjs <script.json> --yes [--only k01,n01]         erzeugt die Audiodateien (VERBRAUCHT ElevenLabs-Credits)
//   node tools/generate_voice.mjs --sample einstein [--yes]                    kurze deutsche Sprachprobe (Einstein)
//
// Regeln (siehe CLAUDE.md): Voice-IDs nur aus config/voices.json; API-Schluessel nur aus ELEVENLABS_API_KEY;
// bei JEDEM Fehler (Netz, Auth, Quota, 4xx/5xx) wird abgebrochen und gemeldet - es wird nichts anderes erzeugt.
// --yes verbraucht Credits und darf nur nach ausdruecklicher Rueckfrage beim Projektinhaber verwendet werden.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const flag = (n) => args.includes('--' + n);
const opt = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
const fail = (msg) => { console.error(`\nSPRACHERZEUGUNG ABGEBROCHEN: ${msg}\nEs wurde keine Ersatzstimme erzeugt. Bitte den Projektinhaber informieren.`); process.exit(2); };

const cfg = JSON.parse(fs.readFileSync('config/voices.json', 'utf8'));
if (cfg.provider !== 'elevenlabs') fail('config/voices.json: provider muss "elevenlabs" sein.');
const voiceOf = (key) => { const v = cfg.voices[key]; if (!v || !/^[A-Za-z0-9]{20}$/.test(v.voice_id || '')) fail(`Keine gueltige Voice-ID fuer "${key}" in config/voices.json.`); return v; };

let jobs, outDir;
if (opt('sample')) {
  const key = opt('sample'); voiceOf(key);
  jobs = [{ id: `sample-${key}`, voice: key, text: key === 'einstein' ? 'Guten Tag, ich bin Albert Einstein. Alles ist relativ – nur meine rechte Gerade nicht!' : 'Das ist eine kurze Sprachprobe.', delivery: 'warm' }];
  outDir = 'out/voice-samples';
} else {
  const file = args.find((a) => a.endsWith('.json')) || 'episodes/test-fight/script.json';
  const script = JSON.parse(fs.readFileSync(file, 'utf8'));
  jobs = script.cues.map((c) => ({ id: c.id, voice: c.voice, text: c.text, delivery: c.delivery }));
  outDir = path.join(path.dirname(file), 'audio');
  const only = opt('only'); if (only) jobs = jobs.filter((j) => only.split(',').includes(j.id));
}
jobs.forEach((j) => voiceOf(j.voice));
const chars = jobs.reduce((s, j) => s + j.text.length, 0);

console.log(`Modell: ${cfg.model_id} | Ausgabe: ${outDir}`);
for (const j of jobs) console.log(`  ${j.id.padEnd(14)} ${j.voice.padEnd(9)} ${voiceOf(j.voice).voice_id}  "${j.text}"`);
console.log(`Gesamt: ${jobs.length} Zeilen, ${chars} Zeichen (~${chars} ElevenLabs-Credits)`);

if (!flag('yes')) { console.log('\nTROCKENLAUF - es wurden KEINE Credits verbraucht. Zum Erzeugen: --yes (vorher mit dem Projektinhaber abstimmen).'); process.exit(0); }

const key = process.env.ELEVENLABS_API_KEY;
if (!key) fail('Umgebungsvariable ELEVENLABS_API_KEY fehlt (Schluessel niemals im Repository speichern).');
fs.mkdirSync(outDir, { recursive: true });
const manifest = {};
for (const j of jobs) {
  const v = voiceOf(j.voice);
  const settings = { ...(cfg.default_voice_settings || {}), ...(v.voice_settings || {}), ...((cfg.delivery_presets || {})[j.delivery] || {}) };
  let res;
  try {
    res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.voice_id}?output_format=${cfg.output_format || 'mp3_44100_128'}`, {
      method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text: j.text, model_id: cfg.model_id, voice_settings: settings }),
    });
  } catch (e) { fail(`ElevenLabs nicht erreichbar (${e.message}).`); }
  if (!res.ok) fail(`ElevenLabs antwortete ${res.status} fuer "${j.id}": ${(await res.text()).slice(0, 300)}`);
  const file = path.join(outDir, `${j.id}.mp3`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  const d = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).stdout.toString());
  manifest[j.id] = { voice: j.voice, voice_id: v.voice_id, model_id: cfg.model_id, duration: d, text: j.text };
  console.log(`  OK ${j.id}: ${d.toFixed(2)} s`);
}
fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Fertig. Dauer pruefen, Timing in script.json anpassen, dann tools/mux.mjs ausfuehren.');
