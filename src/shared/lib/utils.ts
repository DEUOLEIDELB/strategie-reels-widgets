import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.', ',') + 'K';
  return n.toLocaleString('fr-FR');
}

export function formatPct(v: number, digits = 1): string {
  return (v * 100).toFixed(digits).replace('.', ',') + '%';
}

export function formatDuration(sec: number | null | undefined): string {
  if (!sec || sec === 0) return '—';
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}min` : `${m}m${String(s).padStart(2, '0')}`;
}

export function hexToSoftBg(hex: string, alpha = 0.15): string {
  const m = hex.replace('#', '').match(/^([0-9a-f]{6})$/i);
  if (!m) return 'rgba(89,20,208,0.15)';
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function textOnHex(hex: string): '#191919' | '#FFFFFF' {
  const m = hex.replace('#', '').match(/^([0-9a-f]{6})$/i);
  if (!m) return '#FFFFFF';
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#191919' : '#FFFFFF';
}

// Hash deterministic d'un string vers une couleur hex pastel.
// Utilisé pour les dots colorés des avatars/angles/pains dans le navigateur Atelier.
const PALETTE = [
  '#5914D0', '#1DC1F9', '#1F8A4A', '#D40272',
  '#B36B00', '#7A2EE6', '#0E6F90', '#a02e94',
  '#5e3c00', '#3a8d6e', '#ad3a6e', '#3056b3',
];
export function colorFromName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[h % PALETTE.length];
}

// Décode le format ChoiceList Grist (["L", "v1", "v2"]) en simple liste.
export function decodeChoiceList(value: string[] | string | null | undefined): string[] {
  if (!value) return [];
  if (typeof value === 'string') return value.split(',').map((s) => s.trim()).filter(Boolean);
  if (Array.isArray(value) && value[0] === 'L') return value.slice(1) as string[];
  return Array.isArray(value) ? (value as string[]) : [];
}

// Décode une RefList Grist : ["L", id1, id2, ...] ou null vers number[].
// Note : l'API REST renvoie déjà un tableau, l'API plugin iframe peut renvoyer le format ["L", ...].
export function decodeRefList(value: number[] | string[] | string | null | undefined): number[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    if (value[0] === 'L') {
      return (value.slice(1) as (number | string)[]).map(Number).filter(Number.isFinite);
    }
    return (value as (number | string)[]).map(Number).filter(Number.isFinite);
  }
  return [];
}

// Encode une liste d'IDs vers le format attendu par Grist en write : ["L", id1, id2, ...].
export function encodeRefList(ids: number[]): (number | string)[] {
  return ['L', ...ids];
}

export function gristDateToJSDate(value: number | string | null | undefined): Date | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return new Date(value * 1000);
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return new Date(value);
  return null;
}

export function dateToISO(d: Date | null): string {
  if (!d) return '';
  return d.toISOString().slice(0, 10);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function uniqueBy<T, K>(arr: T[], key: (x: T) => K): T[] {
  const seen = new Set<K>();
  return arr.filter((x) => {
    const k = key(x);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
