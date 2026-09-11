import { useState } from 'react';
import { Copy, X } from 'lucide-react';
import { Value, Button, Badge } from '@/components/ui';
import { ScripLogo } from '@/components/shared/ui/scrip-logo';
import type { PositionRow } from '@/types';
import { updatePosition } from '@/services';

interface PositionCardProps {
  position: PositionRow;
  onAction: (message: string) => void;
}

export function PositionCard({ position, onAction }: PositionCardProps) {
  const [exiting, setExiting] = useState(false);

  async function handleExit() {
    setExiting(true);
    try {
      const exitPrice = parseFloat(position.ltp.replace(/[^0-9.-]/g, '')) || 100;
      await updatePosition(position.id, {
        status: 'closed',
        exitPrice,
      });
      onAction(`${position.title} closed successfully`);
    } catch {
      onAction('Failed to close position');
    } finally {
      setExiting(false);
    }
  }

  return (
    <article className="position-card">
      <div className="position-top">
        <ScripLogo size="md" symbol={position.symbol} name={position.name} logo={position.logo} logolarge={position.logolarge} logoLarge={position.logoLarge} source={position.source} />
        <div className="position-name">
          <strong>{position.title} <Copy size={15} /></strong>
          <span>{position.subtitle}</span>
        </div>
        <Badge variant="brand" className="ml-auto font-semibold uppercase tracking-wider">BUY</Badge>
        <span className={`source-badge ${position.source}`}>{position.source === 'liquide' ? 'LIQUIDE' : 'COINBASE'}</span>
      </div>
      <div className="position-values">
        <Value label="LTP" value={position.ltp} sub={position.entry} />
        <Value label="UNREALIZED P&L" value={position.pnl} sub={position.percent} tone={position.tone} />
      </div>
      <div className="card-actions">
        <Button
          variant="destructive"
          className="w-full gap-2 border border-[#7b303c] bg-[rgba(116,27,43,0.22)] text-[#ff7784] hover:bg-[#741b2b]/40 hover:text-white"
          onClick={handleExit}
          disabled={exiting}
        >
          <X className="h-4 w-4" />
          <span>{exiting ? 'Closing Position...' : 'Exit Position'}</span>
        </Button>
      </div>
    </article>
  );
}
