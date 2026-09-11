import { useState } from 'react';
import type { Tab } from '@/types';
import { BottomNav, Toast } from '@/components/layout';
import { EmptyState } from '@/components/ui';
import { PortfolioProvider, usePortfolio } from '@/hooks';
import {
  OptionsPage,
  PositionsPage,
  StocksPage,
  AnalysisPage,
  WatchlistPage,
} from './index';

export function PortfolioDashboard() {
  return (
    <PortfolioProvider>
      <PortfolioShell />
    </PortfolioProvider>
  );
}

function PortfolioShell() {
  const [activeTab, setActiveTab] = useState<Tab>('Options');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const { loading, error } = usePortfolio();

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2200);
  }

  if (loading) {
    return (
      <main className="app-shell">
        <div className="phone-frame">
          <div className="screen-content" style={{ display: 'grid', placeItems: 'center', paddingTop: '40vh' }}>
            <EmptyState title="Loading portfolio" body="Fetching live data..." />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-shell">
        <div className="phone-frame">
          <div className="screen-content" style={{ display: 'grid', placeItems: 'center', paddingTop: '40vh' }}>
            <EmptyState title="Connection error" body={error} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="phone-frame">
        <div className="screen-content">
          {activeTab === 'Options' && <OptionsPage onAction={showNotice} />}
          {activeTab === 'Positions' && <PositionsPage onAction={showNotice} />}
          {activeTab === 'Stocks' && <StocksPage onAction={showNotice} />}
          {activeTab === 'Analysis' && <AnalysisPage onAction={showNotice} />}
          {activeTab === 'Watchlist' && (
            <WatchlistPage search={search} setSearch={setSearch} onAction={showNotice} />
          )}
        </div>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <Toast message={notice} />
      </div>
    </main>
  );
}
