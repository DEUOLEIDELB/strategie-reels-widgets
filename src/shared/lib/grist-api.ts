// Couche Grist unifiée. Iframe plugin API ou REST + clé localStorage.
// En dev (Vite), proxy local /grist-api pour contourner CORS.
// En build prod, tape direct Grist (whitelist CORS VPS = github.io).

const GRIST_API_PREFIX = import.meta.env.DEV
  ? '/grist-api'
  : 'https://grist.playwubo.com/api';
const GRIST_DOC_ID = 'o8yNauYWgjtjcnTJyKURyk';
const STORAGE_KEY = 'wubo_grist_api_key';

declare global {
  interface Window {
    grist?: {
      ready: (opts?: { requiredAccess?: string }) => void;
      docApi: {
        fetchTable: (tableId: string) => Promise<Record<string, unknown[]>>;
        applyUserActions: (actions: unknown[][]) => Promise<unknown>;
      };
      onRecord?: (cb: (record: unknown) => void) => void;
      onRecords?: (cb: (records: unknown[]) => void) => void;
    };
  }
}

export type GristRecord = Record<string, unknown> & { id: number };

export function inGristIframe(): boolean {
  try {
    return typeof window.grist !== 'undefined' && window.top !== window.self;
  } catch {
    return true;
  }
}

function looksLikeApiKey(s: string): boolean {
  return /^[A-Za-z0-9_\-]{24,}$/.test(s);
}

export function hasApiKey(): boolean {
  return Boolean(localStorage.getItem(STORAGE_KEY));
}

export function getApiKey(): string | null {
  let key = localStorage.getItem(STORAGE_KEY);
  if (!key) {
    const msg = [
      'Colle ta clé API Grist ici.',
      '',
      'Où la trouver :',
      '1. Va sur https://grist.playwubo.com',
      '2. Clique ton avatar (haut droite)',
      '3. Profile Settings > section API Key > Create',
      '4. COPIE la longue chaîne',
    ].join('\n');
    const input = window.prompt(msg);
    if (!input) return null;
    const trimmed = input.trim();
    if (!looksLikeApiKey(trimmed)) {
      window.alert('Format invalide. Réessaie.');
      return null;
    }
    localStorage.setItem(STORAGE_KEY, trimmed);
    key = trimmed;
  }
  return key;
}

export function resetApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

async function restFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const key = getApiKey();
  if (!key) throw new Error('Pas de clé API');
  const url = `${GRIST_API_PREFIX}/docs/${GRIST_DOC_ID}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    ...((options.headers as Record<string, string>) || {}),
  };
  const method = options.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(url, { ...options, method, headers });
  if (res.status === 401 || res.status === 403) {
    resetApiKey();
    throw new Error(`Clé API refusée (${res.status})`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Grist ${res.status} : ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchRows<T extends { id: number } = GristRecord>(
  tableId: string,
): Promise<T[]> {
  if (inGristIframe() && window.grist) {
    const cols = await window.grist.docApi.fetchTable(tableId);
    const ids = (cols.id || []) as number[];
    return ids.map((id, i) => {
      const row: Record<string, unknown> = { id };
      for (const k of Object.keys(cols)) {
        if (k === 'id') continue;
        row[k] = cols[k][i];
      }
      return row as T;
    });
  }
  const res = await restFetch<{
    records: { id: number; fields: Record<string, unknown> }[];
  }>(`/tables/${tableId}/records`);
  return res.records.map((r) => ({ id: r.id, ...r.fields }) as T);
}

export async function addRecords(
  tableId: string,
  records: Record<string, unknown>[],
): Promise<number[]> {
  if (inGristIframe() && window.grist) {
    const actions = records.map((r) => ['AddRecord', tableId, null, r]);
    const ids = (await window.grist.docApi.applyUserActions(actions)) as number[];
    return ids;
  }
  const body = JSON.stringify({ records: records.map((r) => ({ fields: r })) });
  const res = await restFetch<{ records: { id: number }[] }>(
    `/tables/${tableId}/records`,
    { method: 'POST', body },
  );
  return res.records.map((r) => r.id);
}

export async function updateRecord(
  tableId: string,
  id: number,
  fields: Record<string, unknown>,
): Promise<void> {
  if (inGristIframe() && window.grist) {
    await window.grist.docApi.applyUserActions([
      ['UpdateRecord', tableId, id, fields],
    ]);
    return;
  }
  await restFetch(`/tables/${tableId}/records`, {
    method: 'PATCH',
    body: JSON.stringify({ records: [{ id, fields }] }),
  });
}

export async function deleteRecord(tableId: string, id: number): Promise<void> {
  if (inGristIframe() && window.grist) {
    await window.grist.docApi.applyUserActions([['RemoveRecord', tableId, id]]);
    return;
  }
  await restFetch(`/tables/${tableId}/records/delete`, {
    method: 'POST',
    body: JSON.stringify({ records: [id] }),
  });
}

export function initGrist(): void {
  if (typeof window.grist !== 'undefined') {
    window.grist.ready({ requiredAccess: 'full' });
  }
}

export const GristApi = {
  fetchRows,
  addRecords,
  updateRecord,
  deleteRecord,
  resetApiKey,
  hasApiKey,
  inGristIframe,
  initGrist,
};
