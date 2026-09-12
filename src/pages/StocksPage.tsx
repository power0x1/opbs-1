import { useState, useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { ScreenHeader } from '@/components/layout';
import { Segment, EmptyState } from '@/components/ui';
import { Pagination } from '@/components/shared/ui/pagination';
import { usePortfolio } from '@/hooks';
import { StockCard, ArchiveCard } from '@/components/cards';
import { ActiveSummary, ArchiveSummary } from '@/components/sections';
import type { StockPosition } from '@/types';

interface StocksPageProps {
  onAction: (message: string) => void;
}

const PAGE_SIZE = 10;

export function StocksPage({ onAction }: StocksPageProps) {
  const { stockPositions, archiveStocks } = usePortfolio();
  const [mode, setMode] = useState('Active');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [activePage, setActivePage] = useState(1);
  const [archivePage, setArchivePage] = useState(1);

  const sourceOptions = useMemo(() => {
    const defaultSources = ['LIQUIDE', 'COINBASE'];
    const dynamicSources = stockPositions.map((s) => (s.source || '').toUpperCase()).filter(Boolean);
    const unique = Array.from(new Set([...defaultSources, ...dynamicSources]));
    return ['ALL', ...unique];
  }, [stockPositions]);

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: stockPositions.length,
    };
    for (const s of stockPositions) {
      const src = (s.source || '').toUpperCase();
      counts[src] = (counts[src] || 0) + 1;
    }
    return counts;
  }, [stockPositions]);

  const filteredActive = useMemo(() => {
    return stockPositions.filter((stock: StockPosition) => {
      if (sourceFilter === 'ALL') return true;
      return (stock.source || '').trim().toUpperCase() === sourceFilter.trim().toUpperCase();
    });
  }, [stockPositions, sourceFilter]);

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

  // Dynamic summary metrics based on the active source filter
  const activeMetricsList = sourceFilter === 'ALL' ? stockPositions : filteredActive;
  const currentPnl = activeMetricsList.reduce((sum, s) => sum + s.pnlValue, 0);
  const currentInvested = activeMetricsList.reduce((sum, s) => sum + s.invested, 0);

  const handleSelectSource = (opt: string) => {
    setSourceFilter(opt);
    setActivePage(1);
    const container = document.querySelector('.screen-content');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <>
      <ScreenHeader title="Stocks" />
      <Segment
        active={mode}
        onChange={(val) => {
          setMode(val);
          setActivePage(1);
          setArchivePage(1);
          const container = document.querySelector('.screen-content');
          if (container) {
            container.scrollTo({ top: 0, behavior: 'instant' });
          }
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
              totalPnl={currentPnl}
              invested={currentInvested}
              activeCount={activeMetricsList.length}
              label={sourceFilter === 'ALL' ? 'stocks' : `${sourceFilter.toLowerCase()} stocks`}
            />
            <div className="section-heading flex-wrap gap-2.5">
              <h2>ACTIVE STOCKS ({filteredActive.length})</h2>
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                {sourceOptions.map((opt) => {
                  const isSelected = sourceFilter === opt;
                  const count = sourceCounts[opt] ?? (opt === 'ALL' ? stockPositions.length : 0);
                  return (
                    <button
                      key={opt}
                      type="button"
                      id={`source-filter-${opt.toLowerCase()}`}
                      onClick={() => handleSelectSource(opt)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[#3a2014] text-[#ff7a3d] border-[#8a4520] shadow-[0_2px_8px_rgba(255,122,61,0.25)]'
                          : 'bg-[#181614] text-[#8e98aa] border-[#272420] hover:border-[#3b3530] hover:text-[#f4f6fb]'
                      }`}
                    >
                      <span>{opt}</span>
                      <span
                        className={`inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[10px] font-bold ${
                          isSelected
                            ? 'bg-[#5a2e18] text-[#ff9d5c]'
                            : 'bg-[#24221e] text-[#6e788c]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            {filteredActive.length === 0 ? (
              <EmptyState
                title="No stocks found"
                body={`No active stocks found from source "${sourceFilter}".`}
              />
            ) : (
              <div className="stack" key={`stack-active-${sourceFilter}-${activePage}`}>
                {paginatedActive.map((stock, idx) => (
                  <StockCard
                    key={`${stock.source || 'stock'}-${stock.id || stock.symbol}-${idx}`}
                    stock={stock}
                    onAction={onAction}
                  />
                ))}
              </div>
            )}
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
