import { Palette, Type, Settings, ListChecks, Sparkles, Film } from 'lucide-react';
import { Card, CardBody, Badge } from '@/shared/components';
import { cn } from '@/shared/lib/utils';
import { IDENTITE } from '../lib/identite';
import { CHECKLIST_PRE_TOURNAGE, CHECKLIST_POST_TOURNAGE } from '../lib/checklists';
import { CHEAT_HOOKS, CHEAT_FORMATS } from '../lib/cheatSheet';

// Manuel Wubo : 4 blocs lus en 30 secondes pendant la prod.
export function ManuelWubo() {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <Bloc title="Identité visuelle" icon={Palette}>
        <Section label="Palette">
          <div className="grid grid-cols-2 gap-1.5">
            {IDENTITE.palette.map((c) => (
              <div key={c.hex} className="flex items-center gap-2 text-[11px]">
                <span
                  className="inline-block w-5 h-5 rounded-sm border border-border-strong shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="min-w-0">
                  <div className="font-medium text-text truncate">{c.nom}</div>
                  <div className="text-text-faint truncate" title={c.usage}>
                    {c.usage}
                  </div>
                </div>
              </div>
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
        <Section label="Avant tournage">
          <ul className="flex flex-col gap-0.5">
            {CHECKLIST_PRE_TOURNAGE.map((c) => (
              <ChecklistRow key={c.id} label={c.label} detail={c.detail} />
            ))}
          </ul>
        </Section>
        <Section label="Après tournage / montage">
          <ul className="flex flex-col gap-0.5">
            {CHECKLIST_POST_TOURNAGE.map((c) => (
              <ChecklistRow key={c.id} label={c.label} detail={c.detail} />
            ))}
          </ul>
        </Section>
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

function ChecklistRow({ label, detail }: { label: string; detail?: string }) {
  return (
    <li
      className={cn(
        'text-[11px] text-text-dim flex items-start gap-1.5 leading-snug',
        detail && 'flex-col gap-0',
      )}
    >
      <div className="flex items-start gap-1.5">
        <span className="text-text-faint mt-0.5">▢</span>
        <span>{label}</span>
      </div>
      {detail && <span className="text-text-faint italic ml-4">{detail}</span>}
    </li>
  );
}
