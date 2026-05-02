import type { AtelierNodeType } from '@/shared/lib/types';

export interface NodeStyle {
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  badgeLabel: string;
}

const STYLES: Record<AtelierNodeType, NodeStyle> = {
  avatar: {
    badgeBg: 'bg-current-soft',
    badgeText: 'text-current',
    borderClass: 'border-current',
    badgeLabel: 'Avatar',
  },
  angle: {
    badgeBg: 'bg-info-soft',
    badgeText: 'text-info',
    borderClass: 'border-info',
    badgeLabel: 'Angle',
  },
  pain: {
    badgeBg: 'bg-danger-soft',
    badgeText: 'text-danger',
    borderClass: 'border-danger',
    badgeLabel: 'Pain',
  },
  reel: {
    badgeBg: 'bg-accent-soft',
    badgeText: 'text-warning',
    borderClass: 'border-accent',
    badgeLabel: 'Reel',
  },
};

export function nodeStyleOf(type: AtelierNodeType): NodeStyle {
  return STYLES[type];
}
