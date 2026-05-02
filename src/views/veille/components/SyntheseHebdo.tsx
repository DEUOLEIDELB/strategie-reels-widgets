import { Activity, BarChart3, Crosshair, Flame, ListChecks, Telescope } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/shared/components';
import {
  useUpdateSynthese,
  useCreateReel,
  useSignauxVeille,
} from '@/shared/hooks/grist';
import type { SyntheseHebdo as SyntheseHebdoT, SignalVeille } from '@/shared/lib/types';
import { useAppStore } from '@/shared/store';
import { EditableField } from './EditableField';
import { SyntheseSection } from './SyntheseSection';

interface Props {
  synthese: SyntheseHebdoT;
}

export function SyntheseHebdo({ synthese }: Props) {
  const update = useUpdateSynthese();
  const createReel = useCreateReel();
  const setView = useAppStore((s) => s.setView);
  const signaux = useSignauxVeille({ semaine: synthese.semaine_iso });

  function save<K extends keyof SyntheseHebdoT>(key: K, val: SyntheseHebdoT[K]) {
    update.mutate(
      { id: synthese.id, fields: { [key]: val } as Partial<SyntheseHebdoT> },
      {
        onSuccess: () => toast.success('Synthèse enregistrée', { duration: 1500 }),
        onError: () => toast.error('Échec enregistrement'),
      },
    );
  }

  function handleCreateReel(actionKey: 'actions_1' | 'actions_2' | 'actions_3') {
    const titre = synthese[actionKey].trim();
    if (!titre) {
      toast.error('Action vide. Remplis l\'action avant de créer un Reel.');
      return;
    }
    createReel.mutate(
      {
        titre: titre.slice(0, 80),
        objectif: titre,
        statut: 'concept',
      },
      {
        onSuccess: () => {
          toast.success('Reel créé en concept. Direction l\'Atelier.');
          setView('atelier');
        },
        onError: () => toast.error('Échec création Reel'),
      },
    );
  }

  const signauxNow = (signaux.data || []).filter((s: SignalVeille) => s.horizon === 'now');
  const signauxConcurrents = (signaux.data || []).filter(
    (s: SignalVeille) => s.categorie === 'concurrent',
  );
  const signauxFaibles = (signaux.data || []).filter(
    (s: SignalVeille) => s.horizon === 'next' || s.horizon === 'later',
  );

  return (
    <div className="grid grid-cols-12 gap-3 p-4">
      {/* Section 1 — Performance */}
      <SyntheseSection
        title="Performance Wubo"
        icon={<BarChart3 size={14} />}
        className="col-span-12 lg:col-span-6"
      >
        <div className="grid grid-cols-1 gap-2">
          <div>
            <label className="text-[11px] font-medium text-text-faint">Top semaine</label>
            <EditableField
              multiline
              rows={2}
              value={synthese.performance_top}
              onSave={(v) => save('performance_top', v)}
              placeholder="Ton meilleur Reel + métrique + pourquoi"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-text-faint">Flop</label>
            <EditableField
              multiline
              rows={2}
              value={synthese.performance_flop}
              onSave={(v) => save('performance_flop', v)}
              placeholder="Pire Reel + hypothèse de cause"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-text-faint">Métrique à surveiller</label>
            <EditableField
              value={synthese.performance_metrique_surveiller}
              onSave={(v) => save('performance_metrique_surveiller', v)}
              placeholder="watch time / saves / sends / completion"
            />
          </div>
        </div>
      </SyntheseSection>

      {/* Section 2 — Concurrents */}
      <SyntheseSection
        title="Concurrents"
        icon={<Crosshair size={14} />}
        hint="3 lignes max"
        className="col-span-12 lg:col-span-6"
      >
        {signauxConcurrents.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {signauxConcurrents.slice(0, 5).map((s) => (
              <span
                key={s.id}
                className="text-[11px] px-1.5 py-0.5 rounded-sm bg-current-soft text-current border border-current/30"
                title={s.signal}
              >
                {s.titre.slice(0, 30)}
              </span>
            ))}
          </div>
        )}
        <EditableField
          multiline
          rows={4}
          value={synthese.concurrents_obs}
          onSave={(v) => save('concurrents_obs', v)}
          placeholder="- [@kiwico] format X testé → 220K vues → angle Wubo : ..."
        />
      </SyntheseSection>

      {/* Section 3 — Trends Now */}
      <SyntheseSection
        title="Trends à exploiter (Now)"
        icon={<Flame size={14} />}
        hint={signauxNow.length ? `${signauxNow.length} signaux Now` : undefined}
        className="col-span-12 lg:col-span-6"
      >
        <EditableField
          multiline
          rows={4}
          value={synthese.trends_now}
          onSave={(v) => save('trends_now', v)}
          placeholder="- Son [titre] (12k uses, +340%) → angle Wubo : ..."
        />
      </SyntheseSection>

      {/* Section 4 — Signaux faibles */}
      <SyntheseSection
        title="Signaux faibles (Next / Later)"
        icon={<Telescope size={14} />}
        hint={signauxFaibles.length ? `${signauxFaibles.length} en attente` : undefined}
        className="col-span-12 lg:col-span-6"
      >
        <EditableField
          multiline
          rows={4}
          value={synthese.signaux_faibles}
          onSave={(v) => save('signaux_faibles', v)}
          placeholder="- À confirmer : ...
- Pattern émergent : ..."
        />
      </SyntheseSection>

      {/* Section 5 — 3 Actions */}
      <SyntheseSection
        title="3 actions semaine prochaine"
        icon={<ListChecks size={14} />}
        className="col-span-12"
      >
        <div className="flex flex-col gap-2">
          {(['actions_1', 'actions_2', 'actions_3'] as const).map((key, i) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-faint w-6 shrink-0">{i + 1}.</span>
              <div className="flex-1">
                <EditableField
                  value={synthese[key]}
                  onSave={(v) => save(key, v)}
                  placeholder={`Action ${i + 1} (ex : Tourner Reel sur son X avant jeudi)`}
                />
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleCreateReel(key)}
                title="Créer un Reel concept depuis cette action"
                className="shrink-0"
              >
                <Activity size={12} className="mr-1" />
                Créer Reel
              </Button>
            </div>
          ))}
        </div>
      </SyntheseSection>
    </div>
  );
}
