import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Drawer, Input, Textarea, Select, Spinner, Badge } from '@/shared/components';
import {
  useAvatars,
  useAngles,
  usePainPoints,
  useReels,
  useUpdateAvatar,
  useUpdateAngle,
  useUpdatePainPoint,
  useUpdateReel,
} from '@/shared/hooks/grist';
import {
  REEL_STATUTS_GRIST,
  type Avatar,
  type Angle,
  type PainPoint,
  type Reel,
  type AtelierNodeType,
} from '@/shared/lib/types';
import { nodeStyleOf } from '../lib/nodeStyle';
import { cn } from '@/shared/lib/utils';
import { useAtelierView } from '../store';

const TITLE: Record<AtelierNodeType, string> = {
  avatar: 'Avatar',
  angle: 'Angle',
  pain: 'Pain point',
  reel: 'Reel',
};

interface FieldRowProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

function FieldRow({ label, children, hint }: FieldRowProps) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-text-dim uppercase tracking-wide">{label}</label>
      {children}
      {hint && <div className="text-[10px] text-text-faint">{hint}</div>}
    </div>
  );
}

interface InlineProps<T> {
  initial: T;
  onCommit: (value: T) => void;
}

function InlineText({ initial, onCommit, placeholder }: InlineProps<string> & { placeholder?: string }) {
  const [v, setV] = useState(initial);
  useEffect(() => setV(initial), [initial]);
  return (
    <Input
      value={v ?? ''}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== initial && onCommit(v)}
      placeholder={placeholder}
      size="sm"
    />
  );
}

function InlineTextarea({ initial, onCommit, rows = 3, placeholder }: InlineProps<string> & { rows?: number; placeholder?: string }) {
  const [v, setV] = useState(initial);
  useEffect(() => setV(initial), [initial]);
  return (
    <Textarea
      value={v ?? ''}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== initial && onCommit(v)}
      rows={rows}
      placeholder={placeholder}
    />
  );
}

function InlineNumber({ initial, onCommit, min, max }: InlineProps<number> & { min?: number; max?: number }) {
  const [v, setV] = useState<string>(String(initial ?? ''));
  useEffect(() => setV(String(initial ?? '')), [initial]);
  return (
    <Input
      type="number"
      value={v}
      min={min}
      max={max}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        const n = Number(v);
        if (Number.isFinite(n) && n !== initial) onCommit(n);
      }}
      size="sm"
    />
  );
}

function AvatarBody({ avatar }: { avatar: Avatar }) {
  const update = useUpdateAvatar();
  const commit = useCallback(
    async (fields: Partial<Avatar>) => {
      try {
        await update.mutateAsync({ id: avatar.id, fields });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Erreur sauvegarde');
      }
    },
    [avatar.id, update],
  );
  return (
    <div className="space-y-3">
      <FieldRow label="Prénom">
        <InlineText initial={avatar.prenom ?? ''} onCommit={(prenom) => commit({ prenom })} />
      </FieldRow>
      <div className="grid grid-cols-2 gap-2">
        <FieldRow label="Tranche d'âge">
          <InlineText initial={avatar.age_range ?? ''} onCommit={(age_range) => commit({ age_range })} />
        </FieldRow>
        <FieldRow label="Profession">
          <InlineText initial={avatar.profession ?? ''} onCommit={(profession) => commit({ profession })} />
        </FieldRow>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <FieldRow label="Situation familiale">
          <InlineText initial={avatar.situation_familiale ?? ''} onCommit={(situation_familiale) => commit({ situation_familiale })} />
        </FieldRow>
        <FieldRow label="Lieu">
          <InlineText initial={avatar.lieu ?? ''} onCommit={(lieu) => commit({ lieu })} />
        </FieldRow>
      </div>
      <FieldRow label="Synthèse">
        <InlineTextarea initial={avatar.description_synthese ?? ''} onCommit={(description_synthese) => commit({ description_synthese })} rows={4} />
      </FieldRow>
      <FieldRow label="Déclencheurs d'achat">
        <InlineTextarea initial={avatar.declencheurs_achat ?? ''} onCommit={(declencheurs_achat) => commit({ declencheurs_achat })} />
      </FieldRow>
      <FieldRow label="Objections">
        <InlineTextarea initial={avatar.objections ?? ''} onCommit={(objections) => commit({ objections })} />
      </FieldRow>
    </div>
  );
}

type AngleScalarFields = Partial<Omit<Angle, 'id' | 'avatars'>>;

function AngleBody({ angle }: { angle: Angle }) {
  const update = useUpdateAngle();
  const commit = useCallback(
    async (fields: AngleScalarFields) => {
      try {
        await update.mutateAsync({ id: angle.id, fields });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Erreur sauvegarde');
      }
    },
    [angle.id, update],
  );
  return (
    <div className="space-y-3">
      <FieldRow label="Nom">
        <InlineText initial={angle.nom ?? ''} onCommit={(nom) => commit({ nom })} />
      </FieldRow>
      <FieldRow label="Ton">
        <InlineText initial={angle.ton ?? ''} onCommit={(ton) => commit({ ton })} />
      </FieldRow>
      <FieldRow label="Description">
        <InlineTextarea initial={angle.description ?? ''} onCommit={(description) => commit({ description })} rows={4} />
      </FieldRow>
      <FieldRow label="Force">
        <InlineTextarea initial={angle.force ?? ''} onCommit={(force) => commit({ force })} />
      </FieldRow>
      <FieldRow label="Faiblesse">
        <InlineTextarea initial={angle.faiblesse ?? ''} onCommit={(faiblesse) => commit({ faiblesse })} />
      </FieldRow>
      <FieldRow label="Meilleur pour">
        <InlineTextarea initial={angle.meilleur_pour ?? ''} onCommit={(meilleur_pour) => commit({ meilleur_pour })} />
      </FieldRow>
      <FieldRow label="Cible primaire">
        <InlineText initial={angle.cible_primaire ?? ''} onCommit={(cible_primaire) => commit({ cible_primaire })} />
      </FieldRow>
    </div>
  );
}

type PainScalarFields = Partial<Omit<PainPoint, 'id' | 'avatars' | 'angles'>>;

function PainBody({ pain }: { pain: PainPoint }) {
  const update = useUpdatePainPoint();
  const commit = useCallback(
    async (fields: PainScalarFields) => {
      try {
        await update.mutateAsync({ id: pain.id, fields });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Erreur sauvegarde');
      }
    },
    [pain.id, update],
  );
  return (
    <div className="space-y-3">
      <FieldRow label="Titre">
        <InlineText initial={pain.titre ?? ''} onCommit={(titre) => commit({ titre })} />
      </FieldRow>
      <FieldRow label="Description">
        <InlineTextarea initial={pain.description ?? ''} onCommit={(description) => commit({ description })} rows={4} />
      </FieldRow>
      <div className="grid grid-cols-2 gap-2">
        <FieldRow label="Émotion dominante">
          <InlineText initial={pain.emotion_dominante ?? ''} onCommit={(emotion_dominante) => commit({ emotion_dominante })} />
        </FieldRow>
        <FieldRow label="Fréquence vécue">
          <InlineText initial={pain.frequence_vecue ?? ''} onCommit={(frequence_vecue) => commit({ frequence_vecue })} />
        </FieldRow>
      </div>
      <FieldRow label="Intensité (1-5)">
        <InlineNumber initial={pain.niveau_intensite ?? 0} onCommit={(niveau_intensite) => commit({ niveau_intensite })} min={1} max={5} />
      </FieldRow>
      <FieldRow label="Chiffre source">
        <InlineTextarea initial={pain.chiffre_source ?? ''} onCommit={(chiffre_source) => commit({ chiffre_source })} />
      </FieldRow>
    </div>
  );
}

function ReelBody({ reel }: { reel: Reel }) {
  const update = useUpdateReel();
  const [statut, setStatut] = useState(reel.statut);
  useEffect(() => setStatut(reel.statut), [reel.statut]);
  const commit = useCallback(
    async (fields: Partial<Reel>) => {
      try {
        await update.mutateAsync({ id: reel.id, fields });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Erreur sauvegarde');
      }
    },
    [reel.id, update],
  );
  return (
    <div className="space-y-3">
      <FieldRow label="Titre">
        <InlineText initial={reel.titre ?? ''} onCommit={(titre) => commit({ titre })} />
      </FieldRow>
      <FieldRow label="Statut">
        <Select
          size="sm"
          value={statut}
          onChange={(e) => {
            const v = e.target.value as Reel['statut'];
            setStatut(v);
            commit({ statut: v });
          }}
        >
          {REEL_STATUTS_GRIST.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </FieldRow>
      <FieldRow label="Hook verbal">
        <InlineTextarea initial={reel.hook_verbal ?? ''} onCommit={(hook_verbal) => commit({ hook_verbal })} />
      </FieldRow>
      <FieldRow label="Hook visuel">
        <InlineTextarea initial={reel.hook_visuel ?? ''} onCommit={(hook_visuel) => commit({ hook_visuel })} />
      </FieldRow>
      <FieldRow label="Titre overlay">
        <InlineText initial={reel.titre_overlay ?? ''} onCommit={(titre_overlay) => commit({ titre_overlay })} />
      </FieldRow>
      <FieldRow label="Structure body">
        <InlineTextarea initial={reel.structure_body ?? ''} onCommit={(structure_body) => commit({ structure_body })} rows={4} />
      </FieldRow>
      <div className="grid grid-cols-2 gap-2">
        <FieldRow label="CTA type">
          <InlineText initial={reel.cta_type ?? ''} onCommit={(cta_type) => commit({ cta_type })} />
        </FieldRow>
        <FieldRow label="Durée (sec)">
          <InlineNumber initial={reel.duree_sec ?? 0} onCommit={(duree_sec) => commit({ duree_sec })} min={0} />
        </FieldRow>
      </div>
      <FieldRow label="CTA texte">
        <InlineTextarea initial={reel.cta_texte ?? ''} onCommit={(cta_texte) => commit({ cta_texte })} />
      </FieldRow>
      <FieldRow label="Angle précis (variation créative)">
        <InlineText initial={reel.angle_precis ?? ''} onCommit={(angle_precis) => commit({ angle_precis })} />
      </FieldRow>
    </div>
  );
}

export function BriqueDetailDrawer() {
  const opened = useAtelierView((s) => s.openedBriqueDrawer);
  const close = useAtelierView((s) => s.closeBriqueDrawer);

  const avatars = useAvatars();
  const angles = useAngles();
  const pains = usePainPoints();
  const reels = useReels();

  if (!opened) return <Drawer open={false} onOpenChange={() => undefined}>{null}</Drawer>;

  const { type, briqueId } = opened;
  const style = nodeStyleOf(type);

  let body: React.ReactNode = null;
  let loading = false;
  let foundLabel = '';

  if (type === 'avatar') {
    loading = avatars.isLoading;
    const a = avatars.data?.find((x) => x.id === briqueId);
    if (a) {
      body = <AvatarBody avatar={a} />;
      foundLabel = a.prenom || `Avatar #${a.id}`;
    }
  } else if (type === 'angle') {
    loading = angles.isLoading;
    const a = angles.data?.find((x) => x.id === briqueId);
    if (a) {
      body = <AngleBody angle={a} />;
      foundLabel = a.nom || `Angle #${a.id}`;
    }
  } else if (type === 'pain') {
    loading = pains.isLoading;
    const p = pains.data?.find((x) => x.id === briqueId);
    if (p) {
      body = <PainBody pain={p} />;
      foundLabel = p.titre || `Pain #${p.id}`;
    }
  } else if (type === 'reel') {
    loading = reels.isLoading;
    const r = reels.data?.find((x) => x.id === briqueId);
    if (r) {
      body = <ReelBody reel={r} />;
      foundLabel = r.titre || `Reel #${r.id}`;
    }
  }

  return (
    <Drawer open onOpenChange={(o) => !o && close()} title={TITLE[type]} width={420}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={cn(
              'inline-flex items-center px-1.5 h-[18px] rounded-sm text-[10px] font-semibold uppercase tracking-wide',
              style.badgeBg,
              style.badgeText,
            )}
          >
            {style.badgeLabel}
          </span>
          <span className="text-sm font-semibold text-text">{foundLabel}</span>
          <Badge variant="outline" size="xs" className="ml-auto">
            #{briqueId}
          </Badge>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <Spinner />
          </div>
        ) : body ? (
          <>
            {body}
            <div className="mt-4 pt-3 border-t border-border text-[11px] text-text-faint leading-relaxed">
              Modifs sauvegardées au blur. Visible immédiatement par les autres utilisateurs ouvrant le même atelier.
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-xs text-text-faint">
            Brique introuvable. Elle a peut-être été supprimée côté Grist.
          </div>
        )}
      </div>
    </Drawer>
  );
}
