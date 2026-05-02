import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  IdCard,
  Sparkles,
  Heart,
  AlertCircle,
  Quote,
  Compass,
  Zap,
  Target,
  Film,
  Hammer,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
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

// =====================================================================
// Building blocks : SectionCard, FieldRow, InlineX
// =====================================================================

type IconComponent = React.ComponentType<{ size?: string | number; className?: string }>;

interface SectionCardProps {
  icon: IconComponent;
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function SectionCard({ icon: Icon, title, hint, defaultOpen = true, children }: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md border border-border bg-surface-two">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-alt rounded-t-md text-left"
      >
        <Icon size={14} className="text-current shrink-0" />
        <span className="text-[13px] font-semibold text-text flex-1">{title}</span>
        <ChevronDown
          size={14}
          className={cn('text-text-faint transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 space-y-3 border-t border-border bg-surface">
          {hint && (
            <div className="text-[11px] text-text-faint italic leading-relaxed">{hint}</div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

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

// =====================================================================
// AVATAR
// =====================================================================

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
    <div className="space-y-2">
      <SectionCard icon={IdCard} title="Identité">
        <FieldRow label="Prénom">
          <InlineText initial={avatar.prenom ?? ''} onCommit={(prenom) => commit({ prenom })} />
        </FieldRow>
        <div className="grid grid-cols-2 gap-2">
          <FieldRow label="Tranche d'âge">
            <InlineText initial={avatar.age_range ?? ''} onCommit={(age_range) => commit({ age_range })} />
          </FieldRow>
          <FieldRow label="Lieu">
            <InlineText initial={avatar.lieu ?? ''} onCommit={(lieu) => commit({ lieu })} />
          </FieldRow>
        </div>
      </SectionCard>

      <SectionCard
        icon={Sparkles}
        title="Vie quotidienne"
        hint="Le contexte concret. Permet de visualiser un humain, pas une cible démographique."
      >
        <div className="grid grid-cols-2 gap-2">
          <FieldRow label="Situation familiale">
            <InlineText initial={avatar.situation_familiale ?? ''} onCommit={(situation_familiale) => commit({ situation_familiale })} />
          </FieldRow>
          <FieldRow label="Profession">
            <InlineText initial={avatar.profession ?? ''} onCommit={(profession) => commit({ profession })} />
          </FieldRow>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FieldRow label="Revenus foyer">
            <InlineText initial={avatar.revenus_foyer ?? ''} onCommit={(revenus_foyer) => commit({ revenus_foyer })} />
          </FieldRow>
          <FieldRow label="Réseau principal">
            <InlineText initial={avatar.reseau_principal ?? ''} onCommit={(reseau_principal) => commit({ reseau_principal })} />
          </FieldRow>
        </div>
      </SectionCard>

      <SectionCard
        icon={Quote}
        title="Synthèse"
        hint="Le portrait en quelques phrases : ce qu'il vit, comment il parle, ce qui le tient éveillé la nuit."
      >
        <FieldRow label="Description">
          <InlineTextarea
            initial={avatar.description_synthese ?? ''}
            onCommit={(description_synthese) => commit({ description_synthese })}
            rows={5}
            placeholder="Sophie, 38 ans, mère de 2 enfants, scrolle Instagram le soir entre culpabilité et fatigue..."
          />
        </FieldRow>
      </SectionCard>

      <SectionCard
        icon={Heart}
        title="Déclencheurs d'achat"
        hint="Ce qui le fait passer à l'action. Reconstitue le moment où il sort la carte bleue."
      >
        <InlineTextarea
          initial={avatar.declencheurs_achat ?? ''}
          onCommit={(declencheurs_achat) => commit({ declencheurs_achat })}
          rows={3}
        />
      </SectionCard>

      <SectionCard
        icon={AlertCircle}
        title="Objections"
        hint="Ce qui le freine, le fait douter, ce qu'il dira à son conjoint pour ne PAS acheter."
      >
        <InlineTextarea
          initial={avatar.objections ?? ''}
          onCommit={(objections) => commit({ objections })}
          rows={3}
        />
      </SectionCard>
    </div>
  );
}

// =====================================================================
// ANGLE
// =====================================================================

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
    <div className="space-y-2">
      <SectionCard icon={Compass} title="Identité de l'angle">
        <FieldRow label="Nom">
          <InlineText initial={angle.nom ?? ''} onCommit={(nom) => commit({ nom })} placeholder="Grand frère, Témoin écran..." />
        </FieldRow>
        <div className="grid grid-cols-2 gap-2">
          <FieldRow label="Ton">
            <InlineText initial={angle.ton ?? ''} onCommit={(ton) => commit({ ton })} placeholder="Énergique, vulnérable..." />
          </FieldRow>
          <FieldRow label="Cible primaire">
            <InlineText initial={angle.cible_primaire ?? ''} onCommit={(cible_primaire) => commit({ cible_primaire })} placeholder="parent / enfant / les deux" />
          </FieldRow>
        </div>
      </SectionCard>

      <SectionCard
        icon={Sparkles}
        title="Description"
        hint="La voix : qui parle, comment, depuis quelle légitimité."
      >
        <FieldRow label="Description">
          <InlineTextarea
            initial={angle.description ?? ''}
            onCommit={(description) => commit({ description })}
            rows={5}
          />
        </FieldRow>
      </SectionCard>

      <SectionCard
        icon={Zap}
        title="Force / Faiblesse"
        hint="Pourquoi cet angle marche, et quel est son risque caché. Garde l'oeil sur les deux."
      >
        <FieldRow label="Force">
          <InlineTextarea initial={angle.force ?? ''} onCommit={(force) => commit({ force })} rows={3} />
        </FieldRow>
        <FieldRow label="Faiblesse">
          <InlineTextarea initial={angle.faiblesse ?? ''} onCommit={(faiblesse) => commit({ faiblesse })} rows={3} />
        </FieldRow>
      </SectionCard>

      <SectionCard
        icon={Target}
        title="Quand l'utiliser"
        hint="Le contexte idéal de cet angle : quel pain, quel signal algo cible, quelle phase."
      >
        <InlineTextarea
          initial={angle.meilleur_pour ?? ''}
          onCommit={(meilleur_pour) => commit({ meilleur_pour })}
          rows={3}
        />
      </SectionCard>
    </div>
  );
}

// =====================================================================
// PAIN
// =====================================================================

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
    <div className="space-y-2">
      <SectionCard icon={AlertCircle} title="Le pain en une phrase">
        <FieldRow label="Titre">
          <InlineText
            initial={pain.titre ?? ''}
            onCommit={(titre) => commit({ titre })}
            placeholder="La guerre des écrans le soir"
          />
        </FieldRow>
      </SectionCard>

      <SectionCard
        icon={Quote}
        title="Description"
        hint="Pas un concept abstrait : une scène concrète. Qui, où, quand, ce qui se passe."
      >
        <InlineTextarea
          initial={pain.description ?? ''}
          onCommit={(description) => commit({ description })}
          rows={5}
        />
      </SectionCard>

      <SectionCard
        icon={Heart}
        title="Émotion & intensité"
        hint="Comment ça se vit dans le corps. Ce qui rend ce pain plus puissant que les autres."
      >
        <div className="grid grid-cols-2 gap-2">
          <FieldRow label="Émotion dominante">
            <InlineText
              initial={pain.emotion_dominante ?? ''}
              onCommit={(emotion_dominante) => commit({ emotion_dominante })}
              placeholder="culpabilité, peur, colère..."
            />
          </FieldRow>
          <FieldRow label="Fréquence vécue">
            <InlineText
              initial={pain.frequence_vecue ?? ''}
              onCommit={(frequence_vecue) => commit({ frequence_vecue })}
              placeholder="quotidien, hebdo..."
            />
          </FieldRow>
        </div>
        <FieldRow label="Niveau d'intensité (1-5)">
          <InlineNumber
            initial={pain.niveau_intensite ?? 0}
            onCommit={(niveau_intensite) => commit({ niveau_intensite })}
            min={1}
            max={5}
          />
        </FieldRow>
      </SectionCard>

      <SectionCard
        icon={TrendingUp}
        title="Preuves & sources"
        hint="Le chiffre, l'étude, l'article qui rend ce pain indiscutable. Cite la source."
      >
        <InlineTextarea
          initial={pain.chiffre_source ?? ''}
          onCommit={(chiffre_source) => commit({ chiffre_source })}
          rows={3}
          placeholder="4h11/jour de temps d'écran (Rapport Élysée 2024)"
        />
      </SectionCard>
    </div>
  );
}

// =====================================================================
// REEL — l'unité combinatoire la plus structurée
// =====================================================================

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
    <div className="space-y-2">
      <SectionCard icon={IdCard} title="Identité">
        <FieldRow label="Titre de travail">
          <InlineText initial={reel.titre ?? ''} onCommit={(titre) => commit({ titre })} />
        </FieldRow>
        <div className="grid grid-cols-2 gap-2">
          <FieldRow label="Statut">
            <Select
              size="sm"
              value={statut ?? 'concept'}
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
          <FieldRow label="Durée (sec)">
            <InlineNumber initial={reel.duree_sec ?? 0} onCommit={(duree_sec) => commit({ duree_sec })} min={0} />
          </FieldRow>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FieldRow label="Type">
            <InlineText
              initial={reel.type ?? ''}
              onCommit={(type) => commit({ type })}
              placeholder="emotion / educatif / storytelling..."
            />
          </FieldRow>
          <FieldRow label="Série">
            <InlineText initial={reel.serie ?? ''} onCommit={(serie) => commit({ serie })} placeholder="#JournalWubo..." />
          </FieldRow>
        </div>
      </SectionCard>

      <SectionCard
        icon={Compass}
        title="Variation créative (angle précis)"
        hint="Comment cet angle attaque ce pain spécifique. La signature de ce reel : comparaison brutale, métaphore objet, chiffre choc..."
      >
        <FieldRow label="Angle précis">
          <InlineText
            initial={reel.angle_precis ?? ''}
            onCommit={(angle_precis) => commit({ angle_precis })}
            placeholder="comparaison brutale / métaphore quotidien / chiffre miroir..."
          />
        </FieldRow>
      </SectionCard>

      <SectionCard
        icon={Zap}
        title="Hook (0-3s)"
        hint="Les 3 premières secondes décident de la rétention. Verbal, visuel, titre overlay : doivent ouvrir une promesse claire."
      >
        <FieldRow label="Hook verbal" hint="Ce qu'on dit à l'oral.">
          <InlineTextarea initial={reel.hook_verbal ?? ''} onCommit={(hook_verbal) => commit({ hook_verbal })} rows={2} />
        </FieldRow>
        <FieldRow label="Hook visuel" hint="Ce que la caméra montre.">
          <InlineTextarea initial={reel.hook_visuel ?? ''} onCommit={(hook_visuel) => commit({ hook_visuel })} rows={2} />
        </FieldRow>
        <FieldRow label="Titre overlay" hint="Le texte gros à l'écran. Doit aimanter le scroll.">
          <InlineText initial={reel.titre_overlay ?? ''} onCommit={(titre_overlay) => commit({ titre_overlay })} />
        </FieldRow>
      </SectionCard>

      <SectionCard
        icon={Film}
        title="Body (3-45s)"
        hint="Le corps du reel. Promesse → tension → payoff. Toutes les 3 sec, quelque chose change (visuel, sonore, info)."
      >
        <FieldRow label="Structure du body">
          <InlineTextarea
            initial={reel.structure_body ?? ''}
            onCommit={(structure_body) => commit({ structure_body })}
            rows={6}
            placeholder="Plan 1 (3-7s) : ...&#10;Plan 2 (7-12s) : ...&#10;Plan 3 (12-20s) : ..."
          />
        </FieldRow>
      </SectionCard>

      <SectionCard
        icon={Target}
        title="CTA"
        hint="L'action concrète. Type (keyword / save / share / follow / vote) + texte exact à dire ou afficher."
      >
        <div className="grid grid-cols-2 gap-2">
          <FieldRow label="Type">
            <InlineText
              initial={reel.cta_type ?? ''}
              onCommit={(cta_type) => commit({ cta_type })}
              placeholder="keyword / save / follow..."
            />
          </FieldRow>
          <FieldRow label="Objectif">
            <InlineText
              initial={reel.objectif ?? ''}
              onCommit={(objectif) => commit({ objectif })}
              placeholder="REACH / ENGAGEMENT / CONVERSION / AUDIENCE"
            />
          </FieldRow>
        </div>
        <FieldRow label="Texte du CTA">
          <InlineTextarea initial={reel.cta_texte ?? ''} onCommit={(cta_texte) => commit({ cta_texte })} rows={2} />
        </FieldRow>
      </SectionCard>

      <SectionCard
        icon={Hammer}
        title="Production"
        hint="Le concret du tournage : où, avec quoi, avec qui."
        defaultOpen={false}
      >
        <FieldRow label="Lieu">
          <InlineText initial={reel.production_lieu ?? ''} onCommit={(production_lieu) => commit({ production_lieu })} />
        </FieldRow>
        <FieldRow label="Personnes">
          <InlineText initial={reel.personnes ?? ''} onCommit={(personnes) => commit({ personnes })} />
        </FieldRow>
      </SectionCard>

      <SectionCard
        icon={TrendingUp}
        title="Prédiction"
        hint="Avant publication : la métrique principale visée et le risque connu si ça foire."
        defaultOpen={false}
      >
        <FieldRow label="Métrique principale visée">
          <InlineTextarea
            initial={reel.prediction_metrique ?? ''}
            onCommit={(prediction_metrique) => commit({ prediction_metrique })}
            rows={3}
            placeholder="save rate > 3% / completion > 45% / DM send rate > 0.5%..."
          />
        </FieldRow>
      </SectionCard>
    </div>
  );
}

// =====================================================================
// Drawer racine
// =====================================================================

export function BriqueDetailDrawer() {
  const opened = useAtelierView((s) => s.openedBriqueDrawer);
  const close = useAtelierView((s) => s.closeBriqueDrawer);

  const avatars = useAvatars();
  const angles = useAngles();
  const pains = usePainPoints();
  const reels = useReels();

  const resolved = useMemo(() => {
    if (!opened) return null;
    const { type, briqueId } = opened;
    if (type === 'avatar') {
      const a = avatars.data?.find((x) => x.id === briqueId) ?? null;
      return a ? { type, briqueId, label: a.prenom || `Avatar #${a.id}`, body: <AvatarBody avatar={a} /> } : null;
    }
    if (type === 'angle') {
      const a = angles.data?.find((x) => x.id === briqueId) ?? null;
      return a ? { type, briqueId, label: a.nom || `Angle #${a.id}`, body: <AngleBody angle={a} /> } : null;
    }
    if (type === 'pain') {
      const p = pains.data?.find((x) => x.id === briqueId) ?? null;
      return p ? { type, briqueId, label: p.titre || `Pain #${p.id}`, body: <PainBody pain={p} /> } : null;
    }
    const r = reels.data?.find((x) => x.id === briqueId) ?? null;
    return r ? { type, briqueId, label: r.titre || `Reel #${r.id}`, body: <ReelBody reel={r} /> } : null;
  }, [opened, avatars.data, angles.data, pains.data, reels.data]);

  if (!opened) return <Drawer open={false} onOpenChange={() => undefined}>{null}</Drawer>;

  const loading =
    (opened.type === 'avatar' && avatars.isLoading) ||
    (opened.type === 'angle' && angles.isLoading) ||
    (opened.type === 'pain' && pains.isLoading) ||
    (opened.type === 'reel' && reels.isLoading);

  const style = nodeStyleOf(opened.type);

  return (
    <Drawer open onOpenChange={(o) => !o && close()} title={TITLE[opened.type]} width={460}>
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
          <span className="text-sm font-semibold text-text truncate">
            {resolved?.label ?? '...'}
          </span>
          <Badge variant="outline" size="xs" className="ml-auto shrink-0">
            #{opened.briqueId}
          </Badge>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <Spinner />
          </div>
        ) : resolved ? (
          <>
            {resolved.body}
            <div className="mt-4 pt-3 border-t border-border text-[11px] text-text-faint leading-relaxed">
              Modifs sauvegardées au blur de chaque champ. Visible par les autres utilisateurs en quelques secondes.
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
