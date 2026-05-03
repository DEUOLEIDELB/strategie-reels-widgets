// Labels et types des 12 patterns visuels stockés en ChoiceList sur Reels_references.
// Source : table Techniques_montage Grist.

export type PatternKey =
  | 'jump_cut'
  | 'match_cut'
  | 'j_cut'
  | 'l_cut'
  | 'hidden_cut'
  | 'whip_pan'
  | 'speed_ramp'
  | 'hormozi_captions'
  | 'beat_sync'
  | 'hook_frame_0'
  | 'wait_for_it'
  | 'split_avant_apres';

export type PatternType = 'cut' | 'transition' | 'effet' | 'pacing' | 'structure';

export const PATTERN_LABELS: Record<PatternKey, { label: string; type: PatternType }> = {
  jump_cut: { label: 'Jump cut', type: 'cut' },
  match_cut: { label: 'Match cut', type: 'cut' },
  j_cut: { label: 'J-cut', type: 'cut' },
  l_cut: { label: 'L-cut', type: 'cut' },
  hidden_cut: { label: 'Hidden cut', type: 'cut' },
  whip_pan: { label: 'Whip pan', type: 'transition' },
  speed_ramp: { label: 'Speed ramp', type: 'pacing' },
  hormozi_captions: { label: 'Hormozi captions', type: 'effet' },
  beat_sync: { label: 'Beat sync', type: 'pacing' },
  hook_frame_0: { label: 'Hook frame 0', type: 'structure' },
  wait_for_it: { label: 'Wait for it', type: 'structure' },
  split_avant_apres: { label: 'Split avant/après', type: 'structure' },
};

export const PATTERN_KEYS: PatternKey[] = Object.keys(PATTERN_LABELS) as PatternKey[];

export const TYPE_TONES: Record<PatternType, 'default' | 'info' | 'current' | 'success' | 'warning'> = {
  cut: 'info',
  transition: 'current',
  effet: 'warning',
  pacing: 'success',
  structure: 'default',
};

export function decodePatterns(value: unknown): PatternKey[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    if (value[0] === 'L') {
      return value.slice(1).map((s) => String(s) as PatternKey);
    }
    return value.map((s) => String(s) as PatternKey);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((s) => String(s) as PatternKey);
      } catch {
        return [];
      }
    }
    return trimmed
      .split(',')
      .map((s) => s.trim() as PatternKey)
      .filter(Boolean);
  }
  return [];
}
