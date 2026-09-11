import { Copy, Clock3 } from 'lucide-react';
import { Value, Badge } from '@/components/ui';
import { ScripLogo } from '@/components/shared/ui/scrip-logo';
import type { PositionRow } from '@/types';

interface ClosedPositionCardProps {
  position: PositionRow;
}

export function ClosedPositionCard({ position }: ClosedPositionCardProps) {
  return (
    <article className="archive-card">
      <div className="position-top">
        <ScripLogo size="md" symbol={position.symbol} name={position.name} logo={position.logo} logolarge={position.logolarge} logoLarge={position.logoLarge} source={position.source} />
        <div className="position-name">
          <strong>{position.title} <Copy size={14} /></strong>
          <span>{position.subtitle}</span>
        </div>
        <Badge variant="secondary" className="border-[#50515c] bg-[#2c2d30] text-[#d2d3dc]">CLOSED</Badge>
        <span className={`source-badge ${position.source}`}>{position.source === 'liquide' ? 'LIQUIDE' : 'COINBASE'}</span>
      </div>
      <div className="position-values">
        <Value label="Entry" value={position.entry} sub={position.percent} tone={position.tone} />
        <Value label="Exit" value={position.exitPrice ?? position.ltp} sub="Settled" tone={position.tone} />
        <Value label="Net Realized" value={position.pnl} sub="Realized" tone={position.tone} />
      </div>
      <div className="advised">
        <Clock3 size={14} /> Settled
      </div>
    </article>
  );
}
