import { BarChart3 } from 'lucide-react';
import { BlocPlaceholder } from '../BlocPlaceholder';

export function PulseWubo() {
  return (
    <BlocPlaceholder
      icon={<BarChart3 size={16} className="text-current" />}
      title="Pulse Wubo"
      intent="Tes Reels avec leurs métriques visuelles, comparaison vs concurrents."
      features={[
        'Grille des Reels Wubo postés (thumbnail + 3 sparklines vues / saves / sends sur 7j)',
        'Badge danger si Reel < 200 vues à 48h (changer le hook)',
        'Comparaison vs benchmark concurrents (médian de leurs vues récentes)',
        'Drill-down par Reel : courbe complète + détail métriques',
        'Bouton "Capturer signal" sur chaque Reel sous-performant',
      ]}
    />
  );
}
