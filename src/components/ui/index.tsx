/* eslint-disable react-refresh/only-export-components */
import { HelpCircle } from 'lucide-react';

export { Button, buttonVariants } from './button';
export { Badge, badgeVariants } from './badge';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { Separator } from './separator';
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';

interface SegmentItem {
  label: string;
  count?: string;
}

interface SegmentProps {
  items: SegmentItem[];
  active: string;
  onChange: (value: string) => void;
}

export function Segment({ items, active, onChange }: SegmentProps) {
  return (
    <div className="segment">
      {items.map(item => (
        <button
          key={item.label}
          className={active === item.label ? 'selected' : ''}
          onClick={() => onChange(item.label)}
        >
          {item.label}
          {item.count && <span className="count-badge">{item.count}</span>}
        </button>
      ))}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  detail?: string;
  tone?: 'win' | 'loss' | 'neutral';
  large?: boolean;
}

export function MetricCard({ label, value, detail, tone = 'neutral', large = false }: MetricCardProps) {
  return (
    <div className={`metric-card ${large ? 'metric-large' : ''}`}>
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

export function Value({ label, value, sub, tone = 'neutral' }: { label: string; value: string; sub?: string; tone?: 'win' | 'loss' | 'neutral' }) {
  return (
    <div className="value">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
      {sub && <small className={tone}>{sub}</small>}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <div className="empty-icon-wrap">
        <HelpCircle size={28} />
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}


