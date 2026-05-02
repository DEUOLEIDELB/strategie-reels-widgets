import { useMemo, useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { useTendances } from '@/shared/hooks/grist';
import { Skeleton, EmptyState, Drawer, IconButton, Card } from '@/shared/components';
import type { Tendance } from '@/shared/lib/types';

interface Props {
  onCapturer: (ctx: { titre: string; categorie: 'actu' }) => void;
}

function fmtDate(d: number | string | undefined): string {
  if (!d) return '—';
  const dd = new Date(d);
  if (isNaN(dd.getTime())) return String(d);
  return dd.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isImminent(d: number | string | undefined): boolean {
  if (!d) return false;
  const dd = new Date(d);
  if (isNaN(dd.getTime())) return false;
  const days = (dd.getTime() - Date.now()) / 864e5;
  return days >= 0 && days <= 14;
}

function stars(n: number): string {
  const v = Math.max(0, Math.min(5, Math.round(n || 0)));
  return '★'.repeat(v) + '☆'.repeat(5 - v);
}

export function RadarTendances({ onCapturer }: Props) {
  const q = useTendances();
  const [openId, setOpenId] = useState<number | null>(null);

  const sorted = useMemo(() => {
    if (!q.data) return [];
    return [...q.data].sort((a, b) => {
      const da = new Date(a.pic_attendu_date || 0).getTime();
      const db = new Date(b.pic_attendu_date || 0).getTime();
      return da - db;
    });
  }, [q.data]);

  const opened = (q.data || []).find((t) => t.id === openId) || null;

  if (q.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }
  if (!sorted.length) {
    return (
      <EmptyState
        icon={<Calendar size={28} />}
        title="Aucune tendance"
        description="Ajoute des vagues via Grist (table Tendances)."
      />
    );
  }

  return (
    <>
      <div className="relative pl-6">
        <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border-strong" />
        <div className="flex flex-col gap-2.5">
          {sorted.map((t) => {
            const imminent = isImminent(t.pic_attendu_date);
            return (
              <div key={t.id} className="relative">
                <span
                  className={`absolute -left-[14px] top-3 w-2 h-2 rounded-full ${
                    imminent ? 'bg-warning' : 'bg-border-strong'
                  }`}
                />
                <Card
                  hoverable
                  onClick={() => setOpenId(t.id)}
                  className={`relative ${imminent ? '!bg-warning-soft !border-warning/40' : ''}`}
                >
                  <div className="absolute top-2 right-2">
                    <IconButton
                      icon={Plus}
                      label="Capturer signal"
                      size="sm"
                      tone="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCapturer({ titre: t.vague || `Tendance #${t.id}`, categorie: 'actu' });
                      }}
                    />
                  </div>
                  <div className="p-3 pr-10">
                    <div className="flex items-center gap-2 text-[11px] text-text-faint mb-1">
                      <Calendar size={10} />
                      <span>Pic : {fmtDate(t.pic_attendu_date)}</span>
                      {t.periode && <span>· {t.periode}</span>}
                      {imminent && (
                        <span className="ml-1 px-1 py-0.5 rounded-sm bg-warning text-on-warning font-semibold">
                          IMMINENT
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold mb-0.5">{t.vague}</div>
                    {t.description && (
                      <div className="text-xs text-text-dim leading-snug">
                        {t.description.slice(0, 160)}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-accent font-medium">
                        {stars(t.priorite)}
                      </span>
                      {t.source && (
                        <span className="text-[11px] text-text-faint">· {t.source}</span>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <Drawer
        open={!!opened}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={opened?.vague}
        width={460}
      >
        {opened && <TendanceDetail t={opened} />}
      </Drawer>
    </>
  );
}

function TendanceDetail({ t }: { t: Tendance }) {
  return (
    <div className="p-4 flex flex-col gap-4 text-sm">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-text-faint">Pic attendu</div>
          <div className="font-medium">{fmtDate(t.pic_attendu_date)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-text-faint">Période</div>
          <div className="font-medium">{t.periode || '—'}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-text-faint">Priorité</div>
          <div className="font-medium text-accent">{stars(t.priorite)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-text-faint">Source</div>
          <div className="font-medium">{t.source || '—'}</div>
        </div>
      </div>
      {t.description && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-faint mb-1">
            Description
          </div>
          <div className="text-xs leading-relaxed p-2 rounded-sm border border-border bg-surface-alt">
            {t.description}
          </div>
        </div>
      )}
      {t.contenu_wubo_recommande && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-faint mb-1">
            Contenu Wubo recommandé
          </div>
          <div className="text-xs leading-relaxed p-2 rounded-sm border border-accent/30 bg-accent-soft">
            {t.contenu_wubo_recommande}
          </div>
        </div>
      )}
    </div>
  );
}
