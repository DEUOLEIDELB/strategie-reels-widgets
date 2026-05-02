import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Rocket } from 'lucide-react';
import { Card, CardBody, Button } from '@/shared/components';
import type { SetupStatic } from '../types';

interface Props {
  setup: SetupStatic;
  onLaunchSession: () => void;
}

function getIcon(name: string): LucideIcon {
  const Lib = Icons as unknown as Record<string, LucideIcon>;
  return Lib[name] || Icons.Camera;
}

export function SetupCard({ setup, onLaunchSession }: Props) {
  const Icon = getIcon(setup.icone);

  return (
    <Card>
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Icon size={18} strokeWidth={1.5} className="text-current" />
          <h3 className="text-sm font-semibold text-text">{setup.nom}</h3>
        </div>
        <p className="text-xs text-text-dim leading-snug">{setup.description}</p>
        <div className="flex flex-col gap-1 pt-1">
          <span className="text-[10px] uppercase tracking-wide text-text-faint">équipement</span>
          <ul className="flex flex-col gap-0.5">
            {setup.equipement.map((eq) => (
              <li key={eq} className="text-[11px] text-text-dim flex items-start gap-1">
                <span className="text-text-faint">·</span>
                <span>{eq}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[11px] text-text-faint italic pt-1">ex : {setup.exemple_usage}</p>
        <Button variant="primary" size="sm" onClick={onLaunchSession} className="mt-1">
          <Rocket size={12} className="mr-1" />
          Démarrer une session
        </Button>
      </CardBody>
    </Card>
  );
}
