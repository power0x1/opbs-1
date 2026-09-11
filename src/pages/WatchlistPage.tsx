import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { ScreenHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui';
import { usePortfolio } from '@/hooks';
import { WatchRow } from '@/components/cards';

interface WatchlistPageProps {
  search?: string;
  setSearch?: (query: string) => void;
  onAction: (message: string) => void;
}

export function WatchlistPage({ search, setSearch, onAction }: WatchlistPageProps) {
  const { watchItems } = usePortfolio();
  const [internalQuery, setInternalQuery] = useState('');

  const query = search !== undefined ? search : internalQuery;
  const handleQueryChange = setSearch ?? setInternalQuery;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return watchItems;
    return watchItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.ticker.toLowerCase().includes(q) ||
        item.symbol.toLowerCase().includes(q),
    );
  }, [watchItems, query]);

  return (
    <>
      <ScreenHeader title="Watchlist" />
      <div className="search-box">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search instruments, symbols..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
      </div>
      <div className="section-heading">
        <h2>WATCHING ({filtered.length})</h2>
        <span className="realtime"><span className="live-dot" /> Live</span>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No instruments found" body="Try searching with a different ticker or symbol name." />
      ) : (
        <div className="watch-list">
          {filtered.map((item) => (
            <WatchRow key={item.ticker} item={item} onAction={onAction} />
          ))}
        </div>
      )}
    </>
  );
}
