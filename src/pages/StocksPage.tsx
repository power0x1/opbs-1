import { useState, useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { ScreenHeader } from '@/components/layout';
import { Segment, EmptyState } from '@/components/ui';
import { Pagination } from '@/components/shared/ui/pagination';
import { usePortfolio } from '@/hooks';
import { StockCard, ArchiveCard, FilterDropdown } from '@/components/cards';
import { ActiveSummary, ArchiveSummary } from '@/components/sections';
import type { StockPosition } from '@/types';

interface StocksPageProps {
  onAction: (message: string) => void;
}

const PAGE_SIZE = 10;

export function StocksPage({ onAction }: StocksPageProps) {
  const { stockPositions, archiveStocks } = usePortfolio();
  const [mode, setMode] = useState('Active');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activePage, setActivePage] = useState(1);
  const [archivePage, setArchivePage] = useState(1);

  const filteredActive = useMemo(() => {
    return stockPositions.filter((stock: StockPosition) => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'PROFIT') return stock.tone === 'win';
      if (activeFilter === 'LOSS') return stock.tone === 'loss';
      if (activeFilter === 'TARGET') return stock.badge.toLowerCase().includes('target');
      if (activeFilter === 'SL') return stock.badge.toLowerCase().includes('sl');
      return true;
    });
  }, [stockPositions, activeFilter]);

  const totalActivePages = Math.max(1, Math.ceil(filteredActive.length / PAGE_SIZE));
  const paginatedActive = useMemo(() => {
    const start = (activePage - 1) * PAGE_SIZE;
    return filteredActive.slice(start, start + PAGE_SIZE);
  }, [filteredActive, activePage]);

  const totalArchivePages = Math.max(1, Math.ceil(archiveStocks.length / PAGE_SIZE));
  const paginatedArchive = useMemo(() => {
    const start = (archivePage - 1) * PAGE_SIZE;
    return archiveStocks.slice(start, start + PAGE_SIZE);
  }, [archiveStocks, archivePage]);

  const totalPnl = stockPositions.reduce((sum, s) => sum + s.pnlValue, 0);
  const invested = stockPositions.reduce((sum, s) => sum + s.invested, 0);

  return (
    <>
      <ScreenHeader title="Stocks" />
      <Segment
        active={mode}
        onChange={(val) => {
          setMode(val);
          setActivePage(1);
          setArchivePage(1);
        }}
        items={[
          { label: 'Active', count: String(stockPositions.length) },
          { label: 'Archive', count: String(archiveStocks.length) },
        ]}
      />
      {mode === 'Active' ? (
        stockPositions.length === 0 ? (
          <EmptyState title="No active stocks" body="Your open stock positions will show up here." />
        ) : (
          <>
            <ActiveSummary
              totalPnl={totalPnl}
              invested={invested}
              activeCount={stockPositions.length}
              label="stocks"
            />
            <div className="section-heading">
              <h2>ACTIVE STOCKS ({filteredActive.length})</h2>
              <FilterDropdown
                label="FILTER"
                value={activeFilter}
                options={['ALL', 'PROFIT', 'LOSS', 'TARGET', 'SL']}
                onChange={(f) => {
                  setActiveFilter(f);
                  setActivePage(1);
                }}
              />
            </div>
            <div className="stack">
              {paginatedActive.map((stock) => (
                <StockCard key={stock.id} stock={stock} onAction={onAction} />
              ))}
            </div>
            {totalActivePages > 1 && (
              <Pagination
                currentPage={activePage}
                totalPages={totalActivePages}
                onPageChange={setActivePage}
              />
            )}
          </>
        )
      ) : archiveStocks.length === 0 ? (
        <EmptyState title="No archived stocks" body="Your past stock positions will be kept here." />
      ) : (
        <>
          <ArchiveSummary archiveStocks={archiveStocks} />
          <div className="section-heading">
            <h2>Closed</h2>
          </div>
          <div className="stack">
            {paginatedArchive.map((stock) => (
              <ArchiveCard key={stock.id} stock={stock} />
            ))}
          </div>
          {totalArchivePages > 1 && (
            <Pagination
              currentPage={archivePage}
              totalPages={totalArchivePages}
              onPageChange={setArchivePage}
            />
          )}
          <p className="settled-note"><ShieldCheck size={16} /> All trades settled</p>
        </>
      )}
    </>
  );
}
