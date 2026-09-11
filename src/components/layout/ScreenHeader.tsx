import { SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button, Badge } from '@/components/ui';

interface ScreenHeaderProps {
  title: string;
  pill?: string;
  action?: ReactNode;
  secondary?: string;
}

export function ScreenHeader({ title, pill, action, secondary }: ScreenHeaderProps) {
  return (
    <header className="screen-header">
      <div>
        <div className="title-row">
          <h1>{title}</h1>
          {pill && (
            <Badge
              variant="brand"
              className="gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-[#ff9d5c]"
            >
              <span className="live-dot" />
              {pill}
            </Badge>
          )}
        </div>
        {secondary && <p className="header-subtitle">{secondary}</p>}
      </div>
      {action || (
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-2xl border-[#282420] bg-[#171410] text-[#aab4ca] hover:border-[#ff7a3d]/50 hover:bg-[#202018] hover:text-[#f4f6fc]"
          aria-label="Filter options"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      )}
    </header>
  );
}

