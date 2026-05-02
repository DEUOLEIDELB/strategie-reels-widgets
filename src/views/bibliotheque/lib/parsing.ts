// Parsing local pour la Bibliothèque.
// signal_algo_cible peut arriver dans 3 formats selon le mode (REST API / iframe / SQL):
// - string JSON brute : '["DM_send","save"]'
// - array Grist : ['L', 'DM_send', 'save']
// - array natif : ['DM_send', 'save']
// - string CSV : 'DM_send, save' (cas legacy)
export function parseChoiceList(value: unknown): string[] {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) {
    if (value[0] === 'L') {
      return (value.slice(1) as unknown[]).map((s) => String(s)).filter(Boolean);
    }
    return (value as unknown[]).map((s) => String(s)).filter(Boolean);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((s) => String(s)).filter(Boolean);
      } catch {
        // fallthrough
      }
    }
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

// Normalise un signal pour comparaison (lowercase, underscores). DM_send / DM send / dm_send → "dm_send".
export function normalizeSignal(s: string): string {
  return s.toLowerCase().replace(/[\s-]+/g, '_').trim();
}

// Récupère la première phrase utile d'un texte oral (avant un point ou un crochet [direction]).
export function firstSpokenSentence(texte: string | null | undefined): string {
  if (!texte) return '';
  const cut = texte.split(/[.[]/)[0];
  return cut?.trim() || texte.trim();
}
