import { Users } from 'lucide-react';
import { BlocPlaceholder } from '../BlocPlaceholder';

export function Reseau() {
  return (
    <BlocPlaceholder
      icon={<Users size={16} className="text-current" />}
      title="Réseau"
      intent="Influenceurs cible Tier 1→4 avec statut contact et opportunités collab."
      features={[
        'Grille des comptes avec avatar, ring de progression tier 1→2→3→4',
        'Statut contact visualisé par icône (à_contacter / en_cours / partenaire)',
        'Vue "qui contacter cette semaine" alignée sur le sprint Pilotage',
        'Filtres : catégorie (psy / médias / makers / concurrents-partenaires), tier, statut',
        'Drawer avec actions prioritaires et notes de contact',
        'Capturer un signal sur un compte = lien direct Influenceur dans Signaux_veille',
      ]}
    />
  );
}
