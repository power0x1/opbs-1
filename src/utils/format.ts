export function formatCurrency(value: number): string {
  const sign = value < 0 ? '−' : '+';
  const abs = Math.abs(value);
  return `${sign}₹${abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPrice(value: number): string {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number): string {
  const sign = value < 0 ? '' : '+';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatCompact(value: number): string {
  if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${value.toFixed(0)}`;
}

export function pnlTone(value: number): 'win' | 'loss' | 'neutral' {
  if (value > 0) return 'win';
  if (value < 0) return 'loss';
  return 'neutral';
}

export function formatDateTime(iso?: string | number | null): string {
  if (!iso) return '—';
  const num = typeof iso === 'string' && /^\d+$/.test(iso) ? Number(iso) : iso;
  const d = new Date(num);
  if (isNaN(d.getTime())) return String(iso);
  const day = d.toLocaleDateString('en-IN', { day: '2-digit' });
  let month = d.toLocaleDateString('en-IN', { month: 'short' });
  if (month.toLowerCase() === 'sep') month = 'Sept';
  const year = d.toLocaleDateString('en-IN', { year: '2-digit' });
  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
  return `${day} ${month} ${year}, ${timeStr}`;
}

export function formatPrices(val?: number | number[] | string | null): string {
  if (val === undefined || val === null || val === '') return '—';
  if (Array.isArray(val)) {
    if (val.length === 0) return '—';
    return val.map((v) => formatPrice(Number(v))).join(' – ');
  }
  const num = Number(val);
  if (!isNaN(num)) {
    return formatPrice(num);
  }
  return String(val);
}

export function tickerFromSymbol(symbol: string): string {
  const cleaned = symbol.replace(/-EQ$/, '').replace(/\d{6}.*$/, '');
  return cleaned.slice(0, 4).toUpperCase();
}
