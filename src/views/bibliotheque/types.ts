// Types locaux à la vue Bibliothèque.

export type TabId = 'hooks' | 'scripts' | 'ressources' | 'formats' | 'taxonomie';
export type ViewMode = 'grid' | 'list';

export const INJECTABLE_TABS: TabId[] = ['hooks', 'scripts', 'ressources'];
export const REFERENCE_TABS: TabId[] = ['formats', 'taxonomie'];

export interface HookFilters {
  signal: string[];
  categorie: string | null;
  methode: string | null;
  serie: string | null;
  potentiel: string | null;
}

export interface ScriptFilters {
  categorie: string | null;
  angle: string | null;
  dureeRange: [number, number];
  painContains: string;
}

export interface RessourceFilters {
  categorie: string | null;
  scoreMin: number;
  prix: string | null;
}

export interface TaxonomieFilters {
  type: string | null;
}

export interface FiltersState {
  hooks: HookFilters;
  scripts: ScriptFilters;
  ressources: RessourceFilters;
  taxonomie: TaxonomieFilters;
  search: string;
  view: ViewMode;
  showAdvanced: boolean;
}

export const DEFAULT_FILTERS: FiltersState = {
  hooks: { signal: [], categorie: null, methode: null, serie: null, potentiel: null },
  scripts: { categorie: null, angle: null, dureeRange: [0, 90], painContains: '' },
  ressources: { categorie: null, scoreMin: 0, prix: null },
  taxonomie: { type: null },
  search: '',
  view: 'grid',
  showAdvanced: false,
};

export interface FormatStatic {
  id: string;
  nom: string;
  description: string;
  icone: string;
}
