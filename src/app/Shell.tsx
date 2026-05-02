import { useEffect, useState } from 'react';
import { Sparkles, Library, Telescope, KeyRound, Beaker } from 'lucide-react';
import { useAppStore, type View } from '@/shared/store';
import { Button } from '@/shared/components';
import { hasApiKey, resetApiKey, initGrist, inGristIframe } from '@/shared/lib/grist-api';
import { cn } from '@/shared/lib/utils';
import { Atelier } from '@/views/atelier';
import { Bibliotheque } from '@/views/bibliotheque';
import { Veille } from '@/views/veille';
import { Playground } from './Playground';

const VIEWS: { id: View; label: string; icon: typeof Sparkles }[] = [
  { id: 'atelier', label: 'Atelier', icon: Sparkles },
  { id: 'bibliotheque', label: 'Bibliothèque', icon: Library },
  { id: 'veille', label: 'Veille', icon: Telescope },
];

export function Shell() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const [keyOk, setKeyOk] = useState(() => hasApiKey() || inGristIframe());
  const [showPlayground, setShowPlayground] = useState(() =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('playground'),
  );

  useEffect(() => {
    initGrist();
  }, []);

  function handleResetKey() {
    if (!confirm('Réinitialiser la clé API Grist ? Tu devras la re-saisir.')) return;
    resetApiKey();
    setKeyOk(false);
    window.location.reload();
  }

  if (showPlayground) {
    return (
      <div className="h-full flex flex-col">
        <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-surface">
          <div className="flex items-center gap-2">
            <Beaker size={16} className="text-current" />
            <span className="text-sm font-semibold">Playground design system</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowPlayground(false)}>
            Retour à l'app
          </Button>
        </header>
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Playground />
        </main>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="h-12 shrink-0 flex items-center justify-between px-3 border-b border-border bg-surface">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-sm mr-2 px-2">Strategie Reels</span>
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-sm transition-colors',
                view === id
                  ? 'bg-current text-on-current'
                  : 'text-text-dim hover:bg-surface-alt hover:text-text',
              )}
            >
              <Icon size={14} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPlayground(true)}
            title="Playground design system"
            className="p-1.5 rounded-sm text-text-faint hover:bg-surface-alt hover:text-text"
          >
            <Beaker size={14} />
          </button>
          {keyOk ? (
            <button
              onClick={handleResetKey}
              title="Réinitialiser la clé API Grist"
              className="inline-flex items-center gap-1 px-2 h-7 text-[11px] rounded-sm text-text-faint hover:bg-surface-alt hover:text-text"
            >
              <KeyRound size={12} />
              Clé OK
            </button>
          ) : (
            <span className="text-[11px] text-danger">Clé manquante</span>
          )}
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {view === 'atelier' && <Atelier />}
        {view === 'bibliotheque' && <Bibliotheque />}
        {view === 'veille' && <Veille />}
      </main>
    </div>
  );
}
