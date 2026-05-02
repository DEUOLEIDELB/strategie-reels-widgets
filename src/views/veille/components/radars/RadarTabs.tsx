import { useState } from 'react';
import { Activity, Crosshair, Sparkles, Calendar, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components';
import type { CaptureContext } from '../CapturerSignalModal';
import { RadarPerformance } from './RadarPerformance';
import { RadarConcurrents } from './RadarConcurrents';
import { RadarInspiration } from './RadarInspiration';
import { RadarTendances } from './RadarTendances';
import { RadarAudience } from './RadarAudience';

type Tab = 'performance' | 'concurrents' | 'inspiration' | 'tendances' | 'audience';

interface Props {
  onCapturer: (ctx: CaptureContext) => void;
}

const TABS: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: 'performance', label: 'Performance', icon: Activity },
  { id: 'concurrents', label: 'Concurrents', icon: Crosshair },
  { id: 'inspiration', label: 'Inspiration', icon: Sparkles },
  { id: 'tendances', label: 'Tendances', icon: Calendar },
  { id: 'audience', label: 'Audience', icon: Users },
];

export function RadarTabs({ onCapturer }: Props) {
  const [tab, setTab] = useState<Tab>('performance');

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="flex flex-col h-full">
      <div className="px-4 pt-3 pb-2 shrink-0">
        <TabsList>
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <TabsTrigger key={t.id} value={t.id}>
                <Icon size={12} strokeWidth={1.75} />
                <span>{t.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-4">
        <TabsContent value="performance">
          <RadarPerformance onCapturer={onCapturer} />
        </TabsContent>
        <TabsContent value="concurrents">
          <RadarConcurrents onCapturer={onCapturer} />
        </TabsContent>
        <TabsContent value="inspiration">
          <RadarInspiration onCapturer={onCapturer} />
        </TabsContent>
        <TabsContent value="tendances">
          <RadarTendances onCapturer={onCapturer} />
        </TabsContent>
        <TabsContent value="audience">
          <RadarAudience onCapturer={onCapturer} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
