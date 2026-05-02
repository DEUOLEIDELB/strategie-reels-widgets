import { Trophy } from 'lucide-react';
import { BlocPlaceholder } from '../BlocPlaceholder';

export function HallOfFame() {
  return (
    <BlocPlaceholder
      icon={<Trophy size={16} className="text-accent" />}
      title="Hall of Fame"
      intent="Vidéos virales de référence hors-concurrents directs (TheDadLab, MEL Science viraux, créateurs parentalité)."
      features={[
        'Grille visuelle 9:16 des 20 vidéos référence',
        'Tier S/A/B/C visualisé par couleur de bordure',
        'Filtrer par plateforme et par catégorie pain point',
        'Drawer avec "pourquoi ça a percé" et "hook à reproduire pour Wubo"',
        'Source d\'inspiration créative consultée occasionnellement',
        'Pas de feed dynamique : c\'est une bibliothèque figée maintenue manuellement',
      ]}
    />
  );
}
