import { Copy, Clock3, FileText } from 'lucide-react';
import { Value, Badge } from '@/components/ui';
import { ScripLogo } from '@/components/shared/ui/scrip-logo';
import type { StockPosition } from '@/types';

interface ArchiveCardProps {
  stock: StockPosition;
}

export function ArchiveCard({ stock }: ArchiveCardProps) {
  const horizonOrDuration = stock.source === 'liquide' ? stock.horizon : stock.duration;

  return (
    <article className="archive-card">
      <div className="position-top">
        <ScripLogo size="md" symbol={stock.symbol} name={stock.name} logo={stock.logo} logolarge={stock.logolarge} logoLarge={stock.logoLarge} source={stock.source} />
        <div className="position-name">
          <strong>{stock.title} <Copy size={14} /></strong>
          <span>{stock.subtitle}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Badge variant="secondary" className="border-[#50515c] bg-[#2c2d30] text-[#d2d3dc]">CLOSED</Badge>
          {horizonOrDuration && (
            <span className="rounded-md border border-[#3a352c] bg-[#1a1713] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#d4daf0]">
              {horizonOrDuration}
            </span>
          )}
          {stock.reportLink && (
            <a
              href={stock.reportLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="View Research Report"
              aria-label="View Research Report"
              className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-md border border-[#ff7a3d]/40 bg-[#2a170e] text-[#ffaa75] transition-colors hover:border-[#ff7a3d] hover:bg-[#ff7a3d]/25 hover:text-white"
            >
              <FileText className="h-3.5 w-3.5" />
            </a>
          )}
          <span className={`source-badge !ml-0 ${stock.source}`}>{stock.source === 'liquide' ? 'LIQUIDE' : 'COINBASE'}</span>
        </div>
      </div>
      <div className="position-values">
        <Value label="Entry" value={stock.entry} sub={stock.percent} tone={stock.tone} />
        <Value label="Exit" value={stock.ltp} sub={stock.badge} tone={stock.tone} />
        <Value label="Net Realized" value={stock.pnl} sub="Realized" tone={stock.tone} />
      </div>
      <div className="advised">
        <Clock3 size={14} /> Settled
      </div>
    </article>
  );
}
