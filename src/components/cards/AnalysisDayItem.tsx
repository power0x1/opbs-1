import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { AnalysisDayRow } from '@/types';

interface AnalysisDayItemProps {
  day: AnalysisDayRow;
  onAction: (message: string) => void;
}

export function AnalysisDayItem({ day, onAction }: AnalysisDayItemProps) {
  const [expanded, setExpanded] = useState(day.open ?? false);

  return (
    <article className={`day-row ${expanded ? 'expanded-day' : ''}`}>
      <div
        className="day-summary"
        onClick={() => setExpanded((prev) => !prev)}
        style={{ cursor: 'pointer' }}
      >
        <div>
          <strong>{day.date}</strong>
          <span>{day.trades}</span>
        </div>
        <div className="day-result">
          <div className="day-bar">
            <span className={day.tone} style={{ width: day.width }} />
          </div>
          <b className={day.tone}>{day.pnl}</b>
          <ChevronDown size={17} className={expanded ? 'up' : ''} />
        </div>
      </div>
      {expanded && (
        <div className="day-trades">
          {day.tradeRows.map((row, i) => (
            <div
              key={i}
              className="trade-row"
              onClick={() => onAction(`${row.title} selected`)}
            >
              <div className={`mini-ticker ${row.tone}`}>{row.ticker}</div>
              <div>
                <strong>{row.title}</strong>
                <span>{row.ticker}</span>
              </div>
              <b className={row.tone}>{row.pnl}</b>
              <ChevronRight size={17} />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
