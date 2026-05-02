import { useEffect, useMemo, useState } from 'react';
import { Search, LayoutGrid, LayoutList, SlidersHorizontal, X } from 'lucide-react';
import {
  useHooks,
  useScripts,
  useRessources,
  useTaxonomie,
  useAvatars,
  useAngles,
  usePainPoints,
} from '@/shared/hooks/grist';
import { useDebounce } from '@/shared/hooks/ui';
import { useAppStore } from '@/shared/store';
import {
  Input,
  Select,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
  EmptyState,
} from '@/shared/components';
import { cn, uniqueBy } from '@/shared/lib/utils';
import type { Hook, Script, Ressource, TaxoEntry } from '@/shared/lib/types';
import { ComboBar } from './components/ComboBar';
import { HookCard } from './components/HookCard';
import { ScriptCard } from './components/ScriptCard';
import { RessourceCard } from './components/RessourceCard';
import { FormatCard } from './components/FormatCard';
import { TaxoCard } from './components/TaxoCard';
import { PertinentSection } from './components/PertinentSection';
import { BibliothequeDrawer, type DrawerItem } from './components/BibliothequeDrawer';
import { FORMATS } from './lib/formats';
import { topPertinent, scoreHookForPain, scoreScriptForPain } from './lib/pertinence';
import { parseChoiceList, normalizeSignal } from './lib/parsing';
import { DEFAULT_FILTERS, type TabId, type ViewMode, type FiltersState } from './types';

const VIEW_STORAGE_KEY = 'wubo_biblio_view_mode';

// Vue principale Bibliothèque. Coordinateur de l'état local et des données.
export function Bibliotheque() {
  const [tab, setTab] = useState<TabId>('hooks');
  const [filters, setFilters] = useState<FiltersState>(() => ({
    ...DEFAULT_FILTERS,
    view: (localStorage.getItem(VIEW_STORAGE_KEY) as ViewMode) || 'grid',
  }));
  const [drawerItem, setDrawerItem] = useState<DrawerItem | null>(null);

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, filters.view);
  }, [filters.view]);

  const debouncedSearch = useDebounce(filters.search, 200);

  const { data: hooks, isLoading: loadingHooks } = useHooks();
  const { data: scripts, isLoading: loadingScripts } = useScripts();
  const { data: ressources, isLoading: loadingRessources } = useRessources();
  const { data: taxonomie, isLoading: loadingTaxo } = useTaxonomie();

  const currentAvatarId = useAppStore((s) => s.currentAvatarId);
  const currentAngleId = useAppStore((s) => s.currentAngleId);
  const currentPainId = useAppStore((s) => s.currentPainId);
  const { data: avatars } = useAvatars();
  const { data: angles } = useAngles();
  const { data: pains } = usePainPoints();
  const avatar = avatars?.find((a) => a.id === currentAvatarId);
  const angle = angles?.find((a) => a.id === currentAngleId);
  const pain = pains?.find((p) => p.id === currentPainId);
  const comboComplete = Boolean(avatar && angle && pain);

  // Filtrage Hooks ───────────────────────────────────────────────
  const filteredHooks = useMemo(() => {
    if (!hooks) return [];
    const f = filters.hooks;
    const q = debouncedSearch.trim().toLowerCase();
    return hooks.filter((h) => {
      if (q && !`${h.texte ?? ''} ${h.thumbnail ?? ''} ${h.methode_ou_trigger ?? ''}`
        .toLowerCase().includes(q)) return false;
      if (f.categorie && h.categorie !== f.categorie) return false;
      if (f.methode && h.methode_ou_trigger !== f.methode) return false;
      if (f.serie && h.serie !== f.serie) return false;
      if (f.potentiel && h.potentiel !== f.potentiel) return false;
      if (f.signal.length > 0) {
        const hSig = parseChoiceList(h.signal_algo_cible).map(normalizeSignal);
        const target = f.signal.map(normalizeSignal);
        if (!target.some((s) => hSig.includes(s))) return false;
      }
      return true;
    });
  }, [hooks, filters.hooks, debouncedSearch]);

  // Filtrage Scripts ─────────────────────────────────────────────
  const filteredScripts = useMemo(() => {
    if (!scripts) return [];
    const f = filters.scripts;
    const q = debouncedSearch.trim().toLowerCase();
    return scripts.filter((s) => {
      if (q && !`${s.titre ?? ''} ${s.sujet ?? ''} ${s.texte_oral_complet ?? ''}`
        .toLowerCase().includes(q)) return false;
      if (f.categorie && s.categorie !== f.categorie) return false;
      if (f.angle && s.angle !== f.angle) return false;
      const dur = s.duree_sec ?? 0;
      if (dur < f.dureeRange[0] || dur > f.dureeRange[1]) return false;
      if (f.painContains && !s.pain_point_cible?.toLowerCase().includes(f.painContains.toLowerCase()))
        return false;
      return true;
    });
  }, [scripts, filters.scripts, debouncedSearch]);

  // Filtrage Ressources ──────────────────────────────────────────
  const filteredRessources = useMemo(() => {
    if (!ressources) return [];
    const f = filters.ressources;
    const q = debouncedSearch.trim().toLowerCase();
    return ressources.filter((r) => {
      if (q && !`${r.nom ?? ''} ${r.usage_recommande ?? ''}`.toLowerCase().includes(q)) return false;
      if (f.categorie && r.categorie !== f.categorie) return false;
      if ((r.score_priorite ?? 0) < f.scoreMin) return false;
      if (f.prix && r.prix !== f.prix) return false;
      return true;
    });
  }, [ressources, filters.ressources, debouncedSearch]);

  // Filtrage Taxonomie ───────────────────────────────────────────
  const filteredTaxonomie = useMemo(() => {
    if (!taxonomie) return [];
    const f = filters.taxonomie;
    const q = debouncedSearch.trim().toLowerCase();
    return taxonomie.filter((t) => {
      if (q && !`${t.nom ?? ''} ${t.definition ?? ''} ${t.exemple_wubo ?? ''}`
        .toLowerCase().includes(q)) return false;
      if (f.type && t.type !== f.type) return false;
      return true;
    });
  }, [taxonomie, filters.taxonomie, debouncedSearch]);

  // Filtrage Formats ─────────────────────────────────────────────
  const filteredFormats = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return FORMATS;
    return FORMATS.filter((f) =>
      `${f.nom} ${f.description}`.toLowerCase().includes(q),
    );
  }, [debouncedSearch]);

  // Pertinence pour la combo ─────────────────────────────────────
  const pertinentHooks = useMemo(
    () => (comboComplete ? topPertinent(filteredHooks, (h) => scoreHookForPain(h, pain)) : []),
    [filteredHooks, pain, comboComplete],
  );
  const pertinentScripts = useMemo(
    () => (comboComplete ? topPertinent(filteredScripts, (s) => scoreScriptForPain(s, pain)) : []),
    [filteredScripts, pain, comboComplete],
  );

  const restHooks = useMemo(
    () => filteredHooks.filter((h) => !pertinentHooks.includes(h)),
    [filteredHooks, pertinentHooks],
  );
  const restScripts = useMemo(
    () => filteredScripts.filter((s) => !pertinentScripts.includes(s)),
    [filteredScripts, pertinentScripts],
  );

  // Choices pour les Selects (déduits des données réelles) ──────
  const hookChoices = useMemo(
    () => ({
      categorie: uniqueBy(hooks ?? [], (h) => h.categorie).map((h) => h.categorie).filter(Boolean),
      methode: uniqueBy(hooks ?? [], (h) => h.methode_ou_trigger).map((h) => h.methode_ou_trigger).filter(Boolean),
      serie: uniqueBy(hooks ?? [], (h) => h.serie).map((h) => h.serie).filter(Boolean),
      potentiel: uniqueBy(hooks ?? [], (h) => h.potentiel).map((h) => h.potentiel).filter(Boolean),
      signal: ['DM_send', 'save', 'share', 'comment', 'follow', 'watch_time'],
    }),
    [hooks],
  );
  const scriptChoices = useMemo(
    () => ({
      categorie: uniqueBy(scripts ?? [], (s) => s.categorie).map((s) => s.categorie).filter(Boolean),
      angle: uniqueBy(scripts ?? [], (s) => s.angle).map((s) => s.angle).filter(Boolean),
    }),
    [scripts],
  );
  const ressourceChoices = useMemo(
    () => ({
      categorie: uniqueBy(ressources ?? [], (r) => r.categorie).map((r) => r.categorie).filter(Boolean),
      prix: uniqueBy(ressources ?? [], (r) => r.prix).map((r) => r.prix).filter(Boolean),
    }),
    [ressources],
  );
  const taxoChoices = useMemo(
    () => uniqueBy(taxonomie ?? [], (t) => t.type).map((t) => t.type).filter(Boolean),
    [taxonomie],
  );

  function setHookFilter<K extends keyof FiltersState['hooks']>(
    key: K,
    value: FiltersState['hooks'][K],
  ) {
    setFilters((f) => ({ ...f, hooks: { ...f.hooks, [key]: value } }));
  }
  function setScriptFilter<K extends keyof FiltersState['scripts']>(
    key: K,
    value: FiltersState['scripts'][K],
  ) {
    setFilters((f) => ({ ...f, scripts: { ...f.scripts, [key]: value } }));
  }
  function setRessourceFilter<K extends keyof FiltersState['ressources']>(
    key: K,
    value: FiltersState['ressources'][K],
  ) {
    setFilters((f) => ({ ...f, ressources: { ...f.ressources, [key]: value } }));
  }
  function setTaxoFilter<K extends keyof FiltersState['taxonomie']>(
    key: K,
    value: FiltersState['taxonomie'][K],
  ) {
    setFilters((f) => ({ ...f, taxonomie: { ...f.taxonomie, [key]: value } }));
  }

  function resetCurrentTab() {
    setFilters((f) => {
      const next = { ...f, search: '' };
      if (tab === 'hooks') next.hooks = DEFAULT_FILTERS.hooks;
      else if (tab === 'scripts') next.scripts = DEFAULT_FILTERS.scripts;
      else if (tab === 'ressources') next.ressources = DEFAULT_FILTERS.ressources;
      else if (tab === 'taxonomie') next.taxonomie = DEFAULT_FILTERS.taxonomie;
      return next;
    });
  }

  const counts: Record<TabId, [shown: number, total: number]> = {
    hooks: [filteredHooks.length, hooks?.length ?? 0],
    scripts: [filteredScripts.length, scripts?.length ?? 0],
    ressources: [filteredRessources.length, ressources?.length ?? 0],
    formats: [filteredFormats.length, FORMATS.length],
    taxonomie: [filteredTaxonomie.length, taxonomie?.length ?? 0],
  };

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden">
      <ComboBar />

      {/* Top bar : recherche + view toggle */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-surface shrink-0">
        <div className="relative flex-1 max-w-xl">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint" />
          <Input
            size="sm"
            placeholder="Recherche dans tout le tab courant..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="pl-7"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => setFilters((f) => ({ ...f, search: '' }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-faint hover:text-text"
              aria-label="Effacer la recherche"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <ViewToggleButton
            active={filters.view === 'list'}
            onClick={() => setFilters((f) => ({ ...f, view: 'list' }))}
            label="Liste"
            Icon={LayoutList}
          />
          <ViewToggleButton
            active={filters.view === 'grid'}
            onClick={() => setFilters((f) => ({ ...f, view: 'grid' }))}
            label="Grille"
            Icon={LayoutGrid}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)} className="shrink-0">
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-surface">
          <span className="text-[10px] uppercase tracking-wide text-text-faint">Injectables</span>
          <TabsList>
            <TabsTrigger value="hooks" count={counts.hooks[0]}>
              Hooks
            </TabsTrigger>
            <TabsTrigger value="scripts" count={counts.scripts[0]}>
              Scripts
            </TabsTrigger>
            <TabsTrigger value="ressources" count={counts.ressources[0]}>
              Ressources
            </TabsTrigger>
          </TabsList>
          <span className="text-[10px] uppercase tracking-wide text-text-faint ml-3">Référence</span>
          <TabsList>
            <TabsTrigger value="formats" count={counts.formats[0]}>
              Formats
            </TabsTrigger>
            <TabsTrigger value="taxonomie" count={counts.taxonomie[0]}>
              Taxonomie
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Filter bar par tab */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface-two flex-wrap">
          {tab === 'hooks' && (
            <>
              <FilterSelect
                label="Catégorie"
                value={filters.hooks.categorie}
                onChange={(v) => setHookFilter('categorie', v)}
                options={hookChoices.categorie as string[]}
              />
              <SignalMultiFilter
                value={filters.hooks.signal}
                onChange={(v) => setHookFilter('signal', v)}
                options={hookChoices.signal}
              />
              {filters.showAdvanced && (
                <>
                  <FilterSelect
                    label="Méthode"
                    value={filters.hooks.methode}
                    onChange={(v) => setHookFilter('methode', v)}
                    options={hookChoices.methode as string[]}
                  />
                  <FilterSelect
                    label="Série"
                    value={filters.hooks.serie}
                    onChange={(v) => setHookFilter('serie', v)}
                    options={hookChoices.serie as string[]}
                  />
                  <FilterSelect
                    label="Potentiel"
                    value={filters.hooks.potentiel}
                    onChange={(v) => setHookFilter('potentiel', v)}
                    options={hookChoices.potentiel as string[]}
                  />
                </>
              )}
            </>
          )}
          {tab === 'scripts' && (
            <>
              <FilterSelect
                label="Catégorie"
                value={filters.scripts.categorie}
                onChange={(v) => setScriptFilter('categorie', v)}
                options={scriptChoices.categorie as string[]}
              />
              <FilterSelect
                label="Angle"
                value={filters.scripts.angle}
                onChange={(v) => setScriptFilter('angle', v)}
                options={scriptChoices.angle as string[]}
              />
              {filters.showAdvanced && (
                <>
                  <DurationRangeFilter
                    range={filters.scripts.dureeRange}
                    onChange={(v) => setScriptFilter('dureeRange', v)}
                  />
                  <PainContainsFilter
                    value={filters.scripts.painContains}
                    onChange={(v) => setScriptFilter('painContains', v)}
                  />
                </>
              )}
            </>
          )}
          {tab === 'ressources' && (
            <>
              <FilterSelect
                label="Catégorie"
                value={filters.ressources.categorie}
                onChange={(v) => setRessourceFilter('categorie', v)}
                options={ressourceChoices.categorie as string[]}
              />
              <ScoreMinFilter
                value={filters.ressources.scoreMin}
                onChange={(v) => setRessourceFilter('scoreMin', v)}
              />
              {filters.showAdvanced && (
                <FilterSelect
                  label="Prix"
                  value={filters.ressources.prix}
                  onChange={(v) => setRessourceFilter('prix', v)}
                  options={ressourceChoices.prix as string[]}
                />
              )}
            </>
          )}
          {tab === 'taxonomie' && (
            <FilterSelect
              label="Type"
              value={filters.taxonomie.type}
              onChange={(v) => setTaxoFilter('type', v)}
              options={taxoChoices as string[]}
            />
          )}
          {tab === 'formats' && (
            <span className="text-xs text-text-faint">
              Formats : référence statique. Aucun filtre.
            </span>
          )}

          {tab !== 'formats' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters((f) => ({ ...f, showAdvanced: !f.showAdvanced }))}
            >
              <SlidersHorizontal size={12} className="mr-1" />
              {filters.showAdvanced ? 'Filtres simples' : 'Filtres avancés'}
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={resetCurrentTab} className="ml-auto">
            <X size={12} className="mr-1" />
            Reset
          </Button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 flex flex-col gap-4">
          <TabsContent value="hooks">
            {loadingHooks ? (
              <CardsSkeleton mode={filters.view} />
            ) : filteredHooks.length === 0 ? (
              <EmptyTab
                hasSearch={Boolean(debouncedSearch || hasActiveFilters(filters, 'hooks'))}
                onReset={resetCurrentTab}
              />
            ) : (
              <>
                <PertinentSection
                  show={comboComplete && pertinentHooks.length > 0}
                  count={pertinentHooks.length}
                >
                  <CardsList
                    mode={filters.view}
                    items={pertinentHooks}
                    render={(h: Hook) => (
                      <HookCard
                        key={h.id}
                        hook={h}
                        mode={filters.view}
                        onClick={() => setDrawerItem({ type: 'hook', data: h })}
                      />
                    )}
                  />
                </PertinentSection>
                <CardsList
                  mode={filters.view}
                  items={comboComplete ? restHooks : filteredHooks}
                  render={(h: Hook) => (
                    <HookCard
                      key={h.id}
                      hook={h}
                      mode={filters.view}
                      onClick={() => setDrawerItem({ type: 'hook', data: h })}
                    />
                  )}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="scripts">
            {loadingScripts ? (
              <CardsSkeleton mode={filters.view} />
            ) : filteredScripts.length === 0 ? (
              <EmptyTab
                hasSearch={Boolean(debouncedSearch || hasActiveFilters(filters, 'scripts'))}
                onReset={resetCurrentTab}
              />
            ) : (
              <>
                <PertinentSection
                  show={comboComplete && pertinentScripts.length > 0}
                  count={pertinentScripts.length}
                >
                  <CardsList
                    mode={filters.view}
                    items={pertinentScripts}
                    render={(s: Script) => (
                      <ScriptCard
                        key={s.id}
                        script={s}
                        mode={filters.view}
                        onClick={() => setDrawerItem({ type: 'script', data: s })}
                      />
                    )}
                  />
                </PertinentSection>
                <CardsList
                  mode={filters.view}
                  items={comboComplete ? restScripts : filteredScripts}
                  render={(s: Script) => (
                    <ScriptCard
                      key={s.id}
                      script={s}
                      mode={filters.view}
                      onClick={() => setDrawerItem({ type: 'script', data: s })}
                    />
                  )}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="ressources">
            {loadingRessources ? (
              <CardsSkeleton mode={filters.view} />
            ) : filteredRessources.length === 0 ? (
              <EmptyTab
                hasSearch={Boolean(debouncedSearch || hasActiveFilters(filters, 'ressources'))}
                onReset={resetCurrentTab}
              />
            ) : (
              <CardsList
                mode={filters.view}
                items={filteredRessources}
                render={(r: Ressource) => (
                  <RessourceCard
                    key={r.id}
                    ressource={r}
                    mode={filters.view}
                    onClick={() => setDrawerItem({ type: 'ressource', data: r })}
                  />
                )}
              />
            )}
          </TabsContent>

          <TabsContent value="formats">
            <CardsList
              mode={filters.view}
              items={filteredFormats}
              render={(f) => (
                <FormatCard
                  key={f.id}
                  format={f}
                  mode={filters.view}
                  onClick={() => setDrawerItem({ type: 'format', data: f })}
                />
              )}
            />
          </TabsContent>

          <TabsContent value="taxonomie">
            {loadingTaxo ? (
              <CardsSkeleton mode={filters.view} />
            ) : filteredTaxonomie.length === 0 ? (
              <EmptyTab
                hasSearch={Boolean(debouncedSearch || hasActiveFilters(filters, 'taxonomie'))}
                onReset={resetCurrentTab}
              />
            ) : (
              <CardsList
                mode={filters.view}
                items={filteredTaxonomie}
                render={(t: TaxoEntry) => (
                  <TaxoCard
                    key={t.id}
                    entry={t}
                    mode={filters.view}
                    onClick={() => setDrawerItem({ type: 'taxonomie', data: t })}
                  />
                )}
              />
            )}
          </TabsContent>
        </div>
      </Tabs>

      <BibliothequeDrawer
        item={drawerItem}
        open={Boolean(drawerItem)}
        onClose={() => setDrawerItem(null)}
        avatar={avatar}
        angle={angle}
        pain={pain}
      />
    </div>
  );
}

// ─── Sous-composants locaux ────────────────────────────────────

function ViewToggleButton({
  active,
  onClick,
  label,
  Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  Icon: typeof LayoutGrid;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center justify-center h-7 w-7 rounded-sm transition-colors',
        active
          ? 'bg-current text-on-current'
          : 'text-text-faint hover:bg-surface-alt hover:text-text',
      )}
    >
      <Icon size={14} strokeWidth={1.5} />
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  options: string[];
}) {
  return (
    <label className="inline-flex items-center gap-1 text-[11px] text-text-dim">
      <span className="uppercase tracking-wide">{label}</span>
      <Select
        size="sm"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">Tous</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
    </label>
  );
}

function SignalMultiFilter({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: string[];
}) {
  function toggle(opt: string) {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  }
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-[11px] uppercase tracking-wide text-text-dim mr-1">Signal</span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => toggle(o)}
          className={cn(
            'inline-flex items-center px-2 h-6 rounded-md border text-[11px] transition-colors',
            value.includes(o)
              ? 'bg-current text-on-current border-current'
              : 'bg-surface text-text-dim border-border-strong hover:bg-surface-alt',
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function DurationRangeFilter({
  range,
  onChange,
}: {
  range: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[11px] text-text-dim">
      <span className="uppercase tracking-wide">Durée</span>
      <Input
        size="sm"
        type="number"
        min={0}
        max={range[1]}
        value={range[0]}
        onChange={(e) => onChange([Math.max(0, +e.target.value), range[1]])}
        className="w-16"
      />
      <span>à</span>
      <Input
        size="sm"
        type="number"
        min={range[0]}
        max={300}
        value={range[1]}
        onChange={(e) => onChange([range[0], Math.min(300, +e.target.value)])}
        className="w-16"
      />
      <span>s</span>
    </label>
  );
}

function PainContainsFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1 text-[11px] text-text-dim">
      <span className="uppercase tracking-wide">Pain contient</span>
      <Input
        size="sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ex : nostalgie"
        className="w-40"
      />
    </label>
  );
}

function ScoreMinFilter({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1 text-[11px] text-text-dim">
      <span className="uppercase tracking-wide">Score min</span>
      <Select size="sm" value={String(value)} onChange={(e) => onChange(+e.target.value)}>
        {[0, 1, 2, 3, 4, 5].map((s) => (
          <option key={s} value={s}>
            {s === 0 ? 'tous' : `≥ ${s}`}
          </option>
        ))}
      </Select>
    </label>
  );
}

function CardsList<T>({
  mode,
  items,
  render,
}: {
  mode: ViewMode;
  items: T[];
  render: (item: T, i: number) => React.ReactNode;
}) {
  if (items.length === 0) return null;
  if (mode === 'list') {
    return <div className="flex flex-col gap-1">{items.map(render)}</div>;
  }
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map(render)}
    </div>
  );
}

function CardsSkeleton({ mode }: { mode: ViewMode }) {
  if (mode === 'list') {
    return (
      <div className="flex flex-col gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}

function EmptyTab({ hasSearch, onReset }: { hasSearch: boolean; onReset: () => void }) {
  if (hasSearch) {
    return (
      <EmptyState
        title="Aucune brique ne matche tes filtres."
        description="Essaie de réduire les filtres ou la recherche."
        action={
          <Button variant="primary" size="sm" onClick={onReset}>
            Reset filtres + recherche
          </Button>
        }
      />
    );
  }
  return (
    <EmptyState
      title="Aucun élément importé."
      description="Ajoute des éléments dans Grist puis recharge."
    />
  );
}

function hasActiveFilters(f: FiltersState, tab: TabId): boolean {
  if (tab === 'hooks') {
    const h = f.hooks;
    return Boolean(
      h.signal.length || h.categorie || h.methode || h.serie || h.potentiel,
    );
  }
  if (tab === 'scripts') {
    const s = f.scripts;
    return Boolean(
      s.categorie || s.angle || s.painContains || s.dureeRange[0] !== 0 || s.dureeRange[1] !== 90,
    );
  }
  if (tab === 'ressources') {
    const r = f.ressources;
    return Boolean(r.categorie || r.scoreMin > 0 || r.prix);
  }
  if (tab === 'taxonomie') {
    return Boolean(f.taxonomie.type);
  }
  return false;
}
