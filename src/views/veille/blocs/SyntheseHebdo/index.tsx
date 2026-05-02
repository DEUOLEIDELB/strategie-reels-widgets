import { ClipboardList } from 'lucide-react';
import { BlocPlaceholder } from '../BlocPlaceholder';

export function SyntheseHebdo() {
  return (
    <BlocPlaceholder
      icon={<ClipboardList size={16} className="text-current" />}
      title="Synthèse hebdo"
      intent="Le livrable du dimanche : composé depuis les signaux capturés ailleurs, pas re-saisi."
      features={[
        'Top Reel Wubo (auto-pick depuis Pulse Wubo, thumbnail + métriques)',
        'Top 3 signaux concurrents capturés (chips visuels depuis Pulse Concurrents)',
        'Vagues imminentes (cards countdown depuis Vagues & Sons)',
        '3 actions composables (drag-drop depuis les signaux now)',
        'Bouton "Archiver synthèse" qui snapshot et crée la semaine W+1',
        'Plus de textareas vides à remplir manuellement : tout vient des autres blocs',
      ]}
    />
  );
}
