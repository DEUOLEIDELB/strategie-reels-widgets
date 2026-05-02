import { Palette, Type, Settings, ListChecks, Sparkles, Film, Copy, Check, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardBody, Badge, Button } from '@/shared/components';
import { cn, textOnHex } from '@/shared/lib/utils';
import { IDENTITE } from '../lib/identite';
import { CHECKLIST_PRE_TOURNAGE, CHECKLIST_POST_TOURNAGE } from '../lib/checklists';
import { CHEAT_HOOKS, CHEAT_FORMATS } from '../lib/cheatSheet';
import { useChecklist } from '../lib/useChecklist';

// Manuel Wubo : interactif. Couleurs cliquables pour copier le hex,
// checklists persistantes localStorage (état conservé entre sessions).
export function ManuelWubo() {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <Bloc title="Identité visuelle" icon={Palette}>
        <Section label="Palette (click pour copier le hex)">
          <div className="grid grid-cols-2 gap-1.5">
            {IDENTITE.palette.map((c) => (
              <ColorSwatch key={c.hex} hex={c.hex} nom={c.nom} usage={c.usage} />
            ))}
          </div>
        </Section>
        <Section label="Polices" icon={Type}>
          <ul className="flex flex-col gap-1">
            {IDENTITE.fonts.map((f) => (
              <li key={f.nom} className="text-[11px] text-text-dim">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-current hover:underline"
                >
                  {f.nom}
                </a>{' '}
                <span className="text-text-faint">: {f.usage}</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section label="Export" icon={Settings}>
          <ul className="flex flex-col gap-0.5 text-[11px]">
            {IDENTITE.formats_export.map((f, i) => (
              <li key={i} className="text-text-dim">
                <span className="font-mono">{f.ratio}</span>{' '}
                <span className="text-text-faint">{f.fps}fps {f.codec}</span>{' '}
                <span className="text-text-faint">: {f.usage}</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section label="Règles overlay">
          <ul className="flex flex-col gap-0.5">
            {IDENTITE.regles_overlay.map((r, i) => (
              <li key={i} className="text-[11px] text-text-dim flex items-start gap-1.5">
                <span className="text-text-faint">·</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Section>
      </Bloc>

      <Bloc title="Checklists" icon={ListChecks}>
        <ChecklistSection
          storageKey="wubo_checklist_pre_tournage"
          label="Avant tournage"
          items={CHECKLIST_PRE_TOURNAGE}
        />
        <ChecklistSection
          storageKey="wubo_checklist_post_tournage"
          label="Après tournage / montage"
          items={CHECKLIST_POST_TOURNAGE}
        />
      </Bloc>

      <Bloc title="Cheat sheet hooks" icon={Sparkles}>
        <ul className="flex flex-col gap-1.5">
          {CHEAT_HOOKS.map((h) => (
            <li key={h.nom} className="text-[11px] flex flex-col gap-0.5">
              <Badge variant="default" size="xs" className="self-start">
                {h.nom}
              </Badge>
              <span className="text-text-dim italic leading-snug">{h.exemple}</span>
            </li>
          ))}
        </ul>
      </Bloc>

      <Bloc title="Cheat sheet formats" icon={Film}>
        <ul className="flex flex-col gap-1.5">
          {CHEAT_FORMATS.map((f) => (
            <li key={f.nom} className="text-[11px] flex flex-col gap-0.5">
              <Badge variant="outline" size="xs" className="self-start">
                {f.nom}
              </Badge>
              <span className="text-text-dim leading-snug">{f.description_courte}</span>
            </li>
          ))}
        </ul>
      </Bloc>
    </div>
  );
}

function ColorSwatch({ hex, nom, usage }: { hex: string; nom: string; usage: string }) {
  function copy() {
    navigator.clipboard.writeText(hex);
    toast.success(`${hex} copié`);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'group flex items-center gap-2 px-1.5 py-1.5 rounded-sm border border-transparent text-left',
        'hover:bg-surface-alt hover:border-border-strong transition-colors',
      )}
      title={`Copier ${hex}`}
    >
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-sm border border-border-strong shrink-0 shadow-sm"
        style={{ backgroundColor: hex, color: textOnHex(hex) }}
      >
        <Copy size={11} className="opacity-0 group-hover:opacity-90 transition-opacity" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium text-text truncate">{nom}</div>
        <div className="text-[10px] text-text-faint truncate font-mono">{hex}</div>
        <div className="text-[10px] text-text-faint truncate" title={usage}>
          {usage}
        </div>
      </div>
    </button>
  );
}

function ChecklistSection({
  storageKey,
  label,
  items,
}: {
  storageKey: string;
  label: string;
  items: { id: string; label: string; detail?: string }[];
}) {
  const ids = items.map((i) => i.id);
  const { checked, toggle, reset, doneCount, total, allDone } = useChecklist(storageKey, ids);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wide text-text-faint flex-1">{label}</span>
        <span
          className={cn(
            'text-[10px] tabular-nums',
            allDone ? 'text-success font-semibold' : 'text-text-faint',
          )}
        >
          {doneCount} / {total}
        </span>
        {doneCount > 0 && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw size={11} className="mr-1" />
            Reset
          </Button>
        )}
      </div>
      <ul className="flex flex-col gap-0.5">
        {items.map((c) => {
          const isChecked = checked.has(c.id);
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => toggle(c.id)}
                className={cn(
                  'w-full flex items-start gap-1.5 px-1.5 py-1 rounded-sm text-left text-[11px]',
                  'hover:bg-surface-alt transition-colors',
                  isChecked && 'opacity-60',
                )}
              >
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-4 h-4 mt-0.5 rounded-sm border shrink-0',
                    isChecked
                      ? 'bg-success border-success text-on-success'
                      : 'bg-surface border-border-strong',
                  )}
                  aria-checked={isChecked}
                  role="checkbox"
                >
                  {isChecked && <Check size={10} strokeWidth={3} />}
                </span>
                <div className="flex flex-col gap-0 min-w-0">
                  <span
                    className={cn('text-text-dim leading-snug', isChecked && 'line-through')}
                  >
                    {c.label}
                  </span>
                  {c.detail && (
                    <span className="text-[10px] text-text-faint italic leading-snug">
                      {c.detail}
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Bloc({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Palette;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="px-4 py-2.5 border-b border-border bg-surface-two flex items-center gap-2">
        <Icon size={14} strokeWidth={1.75} className="text-current" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <CardBody className="flex flex-col gap-3">{children}</CardBody>
    </Card>
  );
}

function Section({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof Palette;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-text-faint">
        {Icon && <Icon size={10} />}
        {label}
      </div>
      {children}
    </div>
  );
}
