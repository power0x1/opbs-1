import type { Tab } from '@/types';
import { LayoutList, SlidersHorizontal, Clipboard, BarChart3, LineChart } from 'lucide-react';

const navItems: { label: Tab; icon: typeof LayoutList }[] = [
  { label: 'Watchlist', icon: LayoutList },
  { label: 'Options', icon: SlidersHorizontal },
  { label: 'Positions', icon: Clipboard },
  { label: 'Stocks', icon: BarChart3 },
  { label: 'Analysis', icon: LineChart },
];

export function BottomNav({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) {
  return (
    <nav className="bottom-nav">
      {navItems.map(({ label, icon: Icon }) => (
        <button
          key={label}
          className={activeTab === label ? 'active' : ''}
          onClick={() => setActiveTab(label)}
        >
          <Icon size={22} />
          <span>{label}</span>
          {activeTab === label && <i />}
        </button>
      ))}
    </nav>
  );
}
