import { ChevronRight } from 'lucide-react';
import { ScripLogo } from '@/components/shared/ui/scrip-logo';
import type { WatchItem } from '@/types';

interface WatchRowProps {
  item: WatchItem;
  onAction: (message: string) => void;
}

export function WatchRow({ item, onAction }: WatchRowProps) {
  return (
    <button
      className="watch-row"
      onClick={() => onAction(`${item.name} selected`)}
    >
      <ScripLogo size="sm" symbol={item.symbol} name={item.name} logo={item.logo} logolarge={item.logolarge} logoLarge={item.logoLarge} source={item.source} />
      <div className="watch-name">
        <strong>{item.ticker}</strong>
        <span>{item.name}</span>
      </div>
      <div className="watch-price">
        <strong>₹{item.value}</strong>
        <span className={item.tone}>{item.change}</span>
      </div>
      <ChevronRight size={17} />
    </button>
  );
}
