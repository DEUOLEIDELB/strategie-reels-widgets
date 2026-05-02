import { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardBody, IconButton } from '@/shared/components';

interface Props {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  onCapturer?: () => void;
}

export function RadarItemCard({ title, subtitle, meta, body, footer, onClick, onCapturer }: Props) {
  return (
    <Card hoverable onClick={onClick} className="relative h-full">
      {onCapturer && (
        <div className="absolute top-2 right-2 z-10">
          <IconButton
            icon={Plus}
            label="Capturer signal"
            size="sm"
            tone="primary"
            onClick={(e) => {
              e.stopPropagation();
              onCapturer();
            }}
          />
        </div>
      )}
      <CardBody className="p-3 flex flex-col gap-1.5">
        <div className="pr-7">
          <div className="text-sm font-semibold leading-tight">{title}</div>
          {subtitle && <div className="text-xs text-text-faint mt-0.5">{subtitle}</div>}
        </div>
        {meta && <div className="flex flex-wrap items-center gap-1">{meta}</div>}
        {body && <div className="text-xs text-text-dim leading-snug">{body}</div>}
        {footer && (
          <div className="flex items-center gap-1 mt-1 pt-1.5 border-t border-border text-[11px] text-text-faint">
            {footer}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
