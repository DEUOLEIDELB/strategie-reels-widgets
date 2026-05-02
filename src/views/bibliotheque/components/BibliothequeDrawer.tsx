import { ArrowUpRight, Check, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Hook, Script, Ressource, TaxoEntry, Avatar, Angle, PainPoint } from '@/shared/lib/types';
import { useCreateReel } from '@/shared/hooks/grist';
import { useAppStore } from '@/shared/store';
import { Drawer, Button, Badge, Spinner } from '@/shared/components';
import { parseChoiceList } from '../lib/parsing';
import { hookToReelInput, scriptToReelInput } from '../lib/injection';
import { InjectionPreview } from './InjectionPreview';
import type { FormatStatic } from '../types';

export type DrawerItem =
  | { type: 'hook'; data: Hook }
  | { type: 'script'; data: Script }
  | { type: 'ressource'; data: Ressource }
  | { type: 'format'; data: FormatStatic }
  | { type: 'taxonomie'; data: TaxoEntry };

interface Props {
  item: DrawerItem | null;
  open: boolean;
  onClose: () => void;
  avatar: Avatar | undefined;
  angle: Angle | undefined;
  pain: PainPoint | undefined;
}

export function BibliothequeDrawer({ item, open, onClose, avatar, angle, pain }: Props) {
  const setView = useAppStore((s) => s.setView);
  const { mutateAsync: createReel, isPending } = useCreateReel();

  const title = item ? labelForType(item.type) : '';

  async function handleInject(navigate: boolean) {
    if (!item) return;
    if (item.type !== 'hook' && item.type !== 'script') return;
    if (!avatar || !angle || !pain) {
      toast.error('Sélectionne une combinaison complète dans l\'Atelier.');
      return;
    }
    const ctx = { avatar: avatar.id, angle: angle.id, probleme: pain.id };
    const input =
      item.type === 'hook'
        ? hookToReelInput(item.data, ctx)
        : scriptToReelInput(item.data, ctx);
    try {
      await createReel(input);
      toast.success(`${labelForType(item.type)} injecté.`);
      onClose();
      if (navigate) setView('atelier');
    } catch (e) {
      toast.error(`Échec de l'injection : ${(e as Error).message}`);
    }
  }

  function handleCopyRessourceUrl() {
    if (!item || item.type !== 'ressource') return;
    const url = item.data.url;
    if (!url) {
      toast.error('Pas d\'URL pour cette ressource.');
      return;
    }
    navigator.clipboard.writeText(url);
    toast.success('URL copiée dans le presse-papier.');
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} title={title} width={420}>
      {!item ? null : (
        <div className="flex flex-col gap-4 p-4">
          {item.type === 'hook' && <HookDetail hook={item.data} />}
          {item.type === 'script' && <ScriptDetail script={item.data} />}
          {item.type === 'ressource' && (
            <RessourceDetail ressource={item.data} onCopy={handleCopyRessourceUrl} />
          )}
          {item.type === 'format' && <FormatDetail format={item.data} />}
          {item.type === 'taxonomie' && <TaxoDetail entry={item.data} />}

          {(item.type === 'hook' || item.type === 'script') && (
            <>
              <hr className="border-border" />
              <InjectionPreview
                type={item.type}
                item={item.data}
                avatar={avatar}
                angle={angle}
                pain={pain}
              />
              <div className="flex flex-col gap-2 pt-1">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleInject(true)}
                  disabled={!avatar || !angle || !pain || isPending}
                >
                  {isPending ? <Spinner size="sm" /> : <Check size={14} className="mr-1" />}
                  Injecter et aller à l'Atelier
                  <ArrowUpRight size={14} className="ml-1" />
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handleInject(false)}
                  disabled={!avatar || !angle || !pain || isPending}
                >
                  Injecter et rester ici
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Drawer>
  );
}

function labelForType(t: DrawerItem['type']): string {
  switch (t) {
    case 'hook':
      return 'Hook';
    case 'script':
      return 'Script';
    case 'ressource':
      return 'Ressource';
    case 'format':
      return 'Format';
    case 'taxonomie':
      return 'Taxonomie';
  }
}

function HookDetail({ hook }: { hook: Hook }) {
  const signals = parseChoiceList(hook.signal_algo_cible);
  return (
    <div className="flex flex-col gap-3">
      <Field label="Thumbnail">
        <div className="font-mono uppercase text-sm text-text">{hook.thumbnail || '—'}</div>
      </Field>
      <Field label="Texte">
        <p className="text-sm leading-relaxed">{hook.texte}</p>
      </Field>
      <Field label="Catégorie / méthode">
        <div className="flex gap-1 flex-wrap">
          <Badge variant="outline">{hook.categorie || '—'}</Badge>
          {hook.methode_ou_trigger && (
            <Badge variant="default">{hook.methode_ou_trigger}</Badge>
          )}
        </div>
      </Field>
      <Field label="Signal algo">
        <div className="flex gap-1 flex-wrap">
          {signals.length === 0 && <span className="text-xs text-text-faint">non défini</span>}
          {signals.map((s) => (
            <Badge key={s} variant="info" size="xs">
              {s}
            </Badge>
          ))}
        </div>
      </Field>
      {hook.serie && <Field label="Série"><span className="text-sm">{hook.serie}</span></Field>}
      {hook.cta_associe && <Field label="CTA associé"><span className="text-sm">{hook.cta_associe}</span></Field>}
      {hook.potentiel && <Field label="Potentiel"><Badge variant="default">{hook.potentiel}</Badge></Field>}
    </div>
  );
}

function ScriptDetail({ script }: { script: Script }) {
  const signals = parseChoiceList(script.signal_algo_cible);
  return (
    <div className="flex flex-col gap-3">
      <Field label="Titre"><span className="text-sm font-semibold">{script.titre}</span></Field>
      {script.sujet && <Field label="Sujet"><span className="text-sm">{script.sujet}</span></Field>}
      <Field label="Catégorie / angle">
        <div className="flex gap-1 flex-wrap">
          <Badge variant="outline">{script.categorie || '—'}</Badge>
          <Badge variant="default">{script.angle || '—'}</Badge>
        </div>
      </Field>
      {script.duree_sec ? (
        <Field label="Durée"><Badge>{script.duree_sec}s</Badge></Field>
      ) : null}
      {script.texte_overlay && (
        <Field label="Overlay">
          <div className="font-mono uppercase text-sm">{script.texte_overlay}</div>
        </Field>
      )}
      {script.texte_oral_complet && (
        <Field label="Texte oral complet">
          <p className="text-xs leading-relaxed whitespace-pre-wrap text-text-dim">
            {script.texte_oral_complet}
          </p>
        </Field>
      )}
      <Field label="Structure body"><Badge variant="default">{script.structure_body || '—'}</Badge></Field>
      {script.cta_texte && (
        <Field label="CTA"><span className="text-sm">{script.cta_texte}</span></Field>
      )}
      <Field label="Signal algo">
        <div className="flex gap-1 flex-wrap">
          {signals.length === 0 && <span className="text-xs text-text-faint">non défini</span>}
          {signals.map((s) => (
            <Badge key={s} variant="info" size="xs">
              {s}
            </Badge>
          ))}
        </div>
      </Field>
      {script.pain_point_cible && (
        <Field label="Pain point cible (legacy)">
          <span className="text-xs text-text-faint">{script.pain_point_cible}</span>
        </Field>
      )}
    </div>
  );
}

function RessourceDetail({ ressource, onCopy }: { ressource: Ressource; onCopy: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <Field label="Nom"><span className="text-sm font-semibold">{ressource.nom}</span></Field>
      <Field label="Catégorie"><Badge variant="outline">{ressource.categorie || '—'}</Badge></Field>
      <Field label="Prix">
        <Badge variant={ressource.prix === 'gratuit' ? 'success' : 'default'}>
          {ressource.prix || '—'}
        </Badge>
      </Field>
      <Field label="Score priorité"><span className="text-sm">{ressource.score_priorite}/5</span></Field>
      {ressource.usage_recommande && (
        <Field label="Usage recommandé">
          <p className="text-xs leading-relaxed">{ressource.usage_recommande}</p>
        </Field>
      )}
      {ressource.cas_usage_wubo && (
        <Field label="Cas d'usage Wubo">
          <p className="text-xs leading-relaxed">{ressource.cas_usage_wubo}</p>
        </Field>
      )}
      <div className="flex gap-2 pt-1">
        {ressource.url && (
          <Button variant="primary" size="sm" onClick={onCopy}>
            <Copy size={12} className="mr-1" /> Copier l'URL
          </Button>
        )}
        {ressource.url && (
          <a href={ressource.url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              <ExternalLink size={12} className="mr-1" /> Ouvrir
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

function FormatDetail({ format }: { format: FormatStatic }) {
  return (
    <div className="flex flex-col gap-3">
      <Field label="Nom"><span className="text-sm font-semibold">{format.nom}</span></Field>
      <Field label="Description"><p className="text-sm leading-relaxed">{format.description}</p></Field>
      <p className="text-[11px] text-text-faint italic">
        Les formats sont des conventions. Pas d'injection en V1 : tu choisis le format toi-même au tournage.
      </p>
    </div>
  );
}

function TaxoDetail({ entry }: { entry: TaxoEntry }) {
  return (
    <div className="flex flex-col gap-3">
      <Field label="Type"><Badge variant="outline">{entry.type || '—'}</Badge></Field>
      <Field label="Nom"><span className="text-sm font-semibold">{entry.nom}</span></Field>
      {entry.definition && (
        <Field label="Définition"><p className="text-sm leading-relaxed">{entry.definition}</p></Field>
      )}
      {entry.exemple_wubo && (
        <Field label="Exemple Wubo"><p className="text-sm italic">{entry.exemple_wubo}</p></Field>
      )}
      {entry.quand_utiliser && (
        <Field label="Quand l'utiliser"><p className="text-xs leading-relaxed">{entry.quand_utiliser}</p></Field>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-text-faint">{label}</span>
      {children}
    </div>
  );
}
