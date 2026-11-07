// Dialog-Cues aus episodes/<episode>/script.json (einzige Quelle fuer Untertitel und ElevenLabs-Sprachausgabe).
export async function loadScript(episode = 'test-fight') {
  const res = await fetch(`/episodes/${episode}/script.json`, { cache: 'no-store' });
  if (!res.ok) throw new Error('script.json nicht ladbar: ' + res.status);
  return res.json();
}

export function buildScript(json) {
  const cues = json.cues.map((c) => ({ ...c, est: c.dur ?? Math.max(1.0, c.text.length / 13.5), outStart: null }));
  const V = json.speakers;
  return {
    cues,
    speaking: (who, outT) => cues.some((c) => c.speaker === who && c.outStart !== null && outT >= c.outStart && outT < c.outStart + c.est),
    captionNow(outT) {
      const c = cues.find((c) => c.outStart !== null && outT >= c.outStart && outT < c.outStart + c.est);
      return c ? { speaker: V[c.speaker].name, color: V[c.speaker].color, text: c.text } : null;
    },
  };
}
