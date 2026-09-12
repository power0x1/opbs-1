import { Check, ChevronDown, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const SOURCE_OPTIONS = [
  { id: 'FNO', label: 'FNO', desc: 'Settled Options' },
  { id: 'COINBASE', label: 'COINBASE', desc: 'Closed & Exited Trades' },
] as const;

export type SourceId = typeof SOURCE_OPTIONS[number]['id'];

export interface SourceFilterDropdownProps {
  selectedSources: Set<string>;
  onToggleSource: (source: string) => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
  sourceCounts?: {
    ALL: number;
    FNO: number;
    COINBASE: number;
  };
}

export function SourceFilterDropdown({
  selectedSources,
  onToggleSource,
  onSelectAll,
  onUnselectAll,
  sourceCounts,
}: SourceFilterDropdownProps) {
  const isAll =
    selectedSources.has('ALL') ||
    selectedSources.size === SOURCE_OPTIONS.length;
  const isNone = selectedSources.size === 0;

  let triggerLabel = 'All';
  if (isAll) {
    triggerLabel = 'All';
  } else if (isNone) {
    triggerLabel = 'None';
  } else {
    const list = Array.from(selectedSources).filter((s) => s !== 'ALL');
    if (list.length === 1) {
      triggerLabel = list[0];
    } else if (list.length === 2) {
      triggerLabel = list.join(', ');
    } else {
      triggerLabel = `${list.length} Sources`;
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          id="source-filter-trigger"
          className={`filter-trigger-btn ${!isAll ? 'active' : ''}`}
          aria-label="Filter sources"
        >
          <Filter className={`h-3.5 w-3.5 ${!isAll ? 'text-[#ff7a3d]' : 'text-[#8e99ac]'}`} />
          <span className="truncate max-w-[130px] font-semibold">{triggerLabel}</span>
          <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 border-[#2b2824] bg-[#141310] p-1 text-[#ccd3e2] shadow-2xl z-50 rounded-xl"
      >
        {/* Header with Select All / Unselect All */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#25221d] mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e99ac]">
            Filter Source
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (isAll) {
                onUnselectAll();
              } else {
                onSelectAll();
              }
            }}
            className="text-[11px] font-semibold text-[#ff7a3d] hover:text-[#ff925d] transition-colors cursor-pointer"
          >
            {isAll ? 'Unselect All' : 'Select All'}
          </button>
        </div>

        {/* All Sources item */}
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            if (isAll) {
              onUnselectAll();
            } else {
              onSelectAll();
            }
          }}
          className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
            isAll
              ? 'bg-[#221c16] text-[#ff7a3d] font-semibold'
              : 'hover:bg-[#1e1c18] text-[#e0e6f0]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                isAll
                  ? 'border-[#ff7a3d] bg-[#ff7a3d] text-black'
                  : 'border-[#3d3830] bg-[#1b1915]'
              }`}
            >
              {isAll && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>All Sources</span>
          </div>
          {sourceCounts && (
            <span className="text-[11px] text-[#727d90] font-mono px-1.5 py-0.5 rounded bg-[#1a1815] border border-[#2b2721]">
              {sourceCounts.ALL}
            </span>
          )}
        </DropdownMenuItem>

        <div className="my-1 border-t border-[#23201b]" />

        {/* Individual Sources with multi-select */}
        {SOURCE_OPTIONS.map((opt) => {
          const isSelected = isAll || selectedSources.has(opt.id);
          const count = sourceCounts ? sourceCounts[opt.id] : undefined;

          return (
            <DropdownMenuItem
              key={opt.id}
              onSelect={(e) => {
                e.preventDefault();
                onToggleSource(opt.id);
              }}
              className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-[#1f1a14] text-[#f2f5f9]'
                  : 'hover:bg-[#1e1c18] text-[#8e99ac]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'border-[#ff7a3d] bg-[#ff7a3d] text-black'
                      : 'border-[#3d3830] bg-[#1b1915]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-[10px] text-[#6d788b]">{opt.desc}</div>
                </div>
              </div>
              {count !== undefined && (
                <span className="text-[11px] text-[#727d90] font-mono px-1.5 py-0.5 rounded bg-[#1a1815] border border-[#2b2721]">
                  {count}
                </span>
              )}
            </DropdownMenuItem>
          );
        })}

        {/* Footer helper */}
        <div className="px-3 py-2 mt-1 border-t border-[#23201b] text-[10px] text-[#6d788b] flex items-center justify-between">
          <span>{isAll ? 'All sources active' : isNone ? 'No sources selected' : `${selectedSources.size} selected`}</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (isAll) {
                onUnselectAll();
              } else {
                onSelectAll();
              }
            }}
            className="text-[#ff7a3d] hover:underline cursor-pointer"
          >
            {isAll ? 'Unselect All' : 'Select All'}
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
