import { Waves } from 'lucide-react';
import { BlocPlaceholder } from '../BlocPlaceholder';

export function VaguesSons() {
  return (
    <BlocPlaceholder
      icon={<Waves size={16} className="text-info" />}
      title="Vagues & Sons"
      intent="Tendances externes : actu, sons trending, vagues sectorielles."
      features={[
        'Calendrier visuel des vagues 2026 (loi écrans sept, no phone summer juin)',
        'Cards "compte à rebours" gros chiffre J-X par vague',
        'Highlight visuel pour les vagues imminentes (<14 jours)',
        'Sons trending : capture manuelle d\'URL Reels avec audio à reproduire',
        'Mèmes émergents et hashtags en montée',
        'Capturer = transformer une vague en signal actionnable',
      ]}
    />
  );
}
